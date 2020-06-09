const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Given a page number returns the recipes in format:
 *   - title
 *   - link
 */
module.exports = async (page) => {
    const url = `https://www.ollasgm.com/blog/page/${page}`;

    return axios(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            const recipes = [];

            $('article.post').each(function () {
                const titleElement = $(this).find('.post-title a');

                recipes.push({
                    title: titleElement
                        .text()
                        .replace('en Olla GM', '')
                        .trim(),
                    link: titleElement.attr('href')
                });
            });

            return recipes;
        }).catch((error) => {
            console.log(`
                ${error}
                \n
                Página: ${page}
            `);
        })
}
