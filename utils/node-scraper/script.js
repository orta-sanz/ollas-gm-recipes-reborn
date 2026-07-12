const fs = require('fs');
const path = require('path');

const getTotalRecipesPages = require('./modules/total-pages');
const getRecipesInPage = require('./modules/recipes-in-page');
const getRecipeData = require('./modules/recipe-data');
const { mapWithConcurrency } = require('./modules/http');

const DATA_PATH = path.resolve(__dirname, '../../data/recipes.json');

// How many recipe detail pages to fetch at once. Keeps throughput steady
// while staying polite to the origin server.
const DETAIL_CONCURRENCY = 6;
// How many listing pages to fetch at once.
const LISTING_CONCURRENCY = 4;
// Abort the write if more than this share of the fetched details failed —
// a sign the whole site is blocking us rather than a few odd recipes.
const MAX_FAILURE_RATE = 0.5;

const isFullRun = process.argv.includes('--full');

/** Loads the existing dataset as a Map keyed by link, or an empty Map. */
const loadExistingRecipes = () => {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const recipes = JSON.parse(raw);
    return new Map(recipes.map((recipe) => [recipe.link, recipe]));
  } catch {
    return new Map();
  }
};

/** Fetches every listing page and returns a de-duplicated list of links. */
const collectListedRecipes = async (totalPages) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = await mapWithConcurrency(
    pageNumbers,
    LISTING_CONCURRENCY,
    getRecipesInPage
  );

  let emptyPages = 0;
  const byLink = new Map();

  pages.forEach((pageRecipes) => {
    if (!pageRecipes.length) {
      emptyPages += 1;
      return;
    }
    pageRecipes.forEach((recipe) => {
      if (recipe.link && !byLink.has(recipe.link)) {
        byLink.set(recipe.link, recipe);
      }
    });
  });

  return { listed: [...byLink.values()], emptyPages };
};

const getAndSaveAllRecipes = async () => {
  const existing = isFullRun ? new Map() : loadExistingRecipes();
  const previousCount = loadExistingRecipes().size;

  console.log(
    `--- Mode: ${isFullRun ? 'FULL' : 'incremental'} (${previousCount} recipes on disk) ---`
  );

  const totalPages = await getTotalRecipesPages();
  console.log(`--- Collecting links from ${totalPages} listing pages ---`);

  const { listed, emptyPages } = await collectListedRecipes(totalPages);
  console.log(`--- Found ${listed.length} recipes in listing ---`);

  const pending = listed.filter((recipe) => !existing.has(recipe.link));
  console.log(`--- Fetching detail for ${pending.length} recipes ---`);

  const details = await mapWithConcurrency(
    pending,
    DETAIL_CONCURRENCY,
    getRecipeData
  );

  const detailByLink = new Map();
  let failed = 0;
  pending.forEach((recipe, index) => {
    const result = details[index];
    detailByLink.set(recipe.link, result);
    if (!result || !result.ok) {
      failed += 1;
    }
  });

  // Compose the final dataset in listing order, keeping known recipes and
  // falling back to previous data (or title+link) when a detail fetch failed.
  const finalByLink = new Map();
  listed.forEach((recipe) => {
    const detail = detailByLink.get(recipe.link);
    const previous = existing.get(recipe.link);

    if (detail && detail.ok) {
      finalByLink.set(recipe.link, { ...recipe, ...detail.data });
    } else if (previous) {
      finalByLink.set(recipe.link, previous);
    } else {
      finalByLink.set(recipe.link, recipe);
    }
  });

  // Carry over any previously known recipe missing from the listing (e.g. a
  // listing page failed) so a partial run never drops good data.
  existing.forEach((recipe, link) => {
    if (!finalByLink.has(link)) {
      finalByLink.set(link, recipe);
    }
  });

  const recipes = [...finalByLink.values()];

  console.log(
    `\n--- Summary: ${recipes.length} total | ${pending.length - failed} new | ` +
      `${failed} failed details | ${emptyPages} failed/empty pages ---`
  );

  // Safety guards: only block on global failures, never on odd recipes.
  if (recipes.length === 0) {
    console.error('Aborting: no recipes to write.');
    process.exit(1);
  }

  if (recipes.length < previousCount) {
    console.error(
      `Aborting: recipe count would drop (${previousCount} -> ${recipes.length}).`
    );
    process.exit(1);
  }

  if (pending.length > 0 && failed / pending.length > MAX_FAILURE_RATE) {
    console.error(
      `Aborting: ${failed}/${pending.length} detail fetches failed (site likely blocking).`
    );
    process.exit(1);
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(recipes, null, 2), { flag: 'w+' });
  console.log(`--- Wrote ${recipes.length} recipes to data/recipes.json ---`);
};

getAndSaveAllRecipes().catch((error) => {
  console.error(`Fatal error, data not written: ${error.message}`);
  process.exit(1);
});
