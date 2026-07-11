const fs = require('fs');

const getTotalRecipesPages = require('./modules/total-pages');
const getRecipesInPage = require('./modules/recipes-in-page');
const getRecipeData = require('./modules/recipe-data');

const getAndSaveAllRecipes = async () => {
  const recipes = [];
  const totalPages = await getTotalRecipesPages();

  for (let page = 1; page <= totalPages; page++) {
    console.log(`--- Getting recipes from page ${page}/${totalPages} ---`);
    const pageRecipes = await getRecipesInPage(page);

    console.log(`--- Map recipes with more data ---`);
    const mappedRecipes = await Promise.all(
      pageRecipes.map(getRecipeData)
    ).then((recipesData) => {
      return pageRecipes.map((recipe, key) => ({
        ...recipe,
        ...recipesData[key],
      }));
    });

    console.log(`--- Saved ${mappedRecipes.length} ---\n`);
    recipes.push(...mappedRecipes);
  }

  fs.writeFileSync('./data/recipes.json', JSON.stringify(recipes), {
    flag: 'w+',
  });
};

getAndSaveAllRecipes();
