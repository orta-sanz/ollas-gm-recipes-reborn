const { fetchHtml } = require('./http');

/**
 * Given a page number returns the recipes in format:
 *   - title
 *   - link
 *
 * On failure it logs and returns an empty array so the orchestrator can skip
 * this page and keep going instead of aborting the whole run.
 */
module.exports = async (page) => {
  const url = `https://www.ollasgm.com/blog/page/${page}`;

  try {
    const $ = await fetchHtml(url);

    const recipes = [];

    $('article.post').each(function () {
      const titleElement = $(this).find('.post-title a');

      recipes.push({
        title: titleElement.text().replace('en Olla GM', '').trim(),
        link: titleElement.attr('href'),
      });
    });

    return recipes;
  } catch (error) {
    console.error(`Failed to fetch listing page ${page}: ${error.message}`);
    return [];
  }
};
