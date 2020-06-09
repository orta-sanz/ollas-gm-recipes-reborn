const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (recipe) => {
    return axios(encodeURI(recipe.link)).then(async (response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        const getRecipeData = (sections) => {
            let time;
            let rations;
            let difficulty;

            sections.each(function(key) {
                if(key === 1) {
                    $(this).find('p').each(function() {
                        const text = $(this).text();

                        if(text.includes('Dificultad:')) {
                             difficulty = text.split('Dificultad:')[1].trim();
                        } else if(text.includes('Raciones:')) {
                            rations = text.split('Raciones:')[1].trim();
                        } else if(text.includes('Tiempo:')) {
                            time = text.split('Tiempo:')[1].trim();
                        }
                    });
                }
            });

            return {
                difficulty,
                rations,
                time,
            }
        }

        // Some recipes are inside recipes ...
        if($('.av-share-box').length) {
            const newRecipeLink = $('a.avia-button').attr('href');
            const $newRecipeHtml = await axios(encodeURI(newRecipeLink)).then((response) => {
                return cheerio.load(response.data)
            });

            return {
                ...getRecipeData($newRecipeHtml('.entry-content-wrapper .av_textblock_section')),
                image: $('.entry-content blockquote img').attr('src')
            };
        } else {
            return {
                ...getRecipeData($('.entry-content-wrapper .av_textblock_section')),
                image: $('.avia_image img').length
                    ? $('.avia_image img').attr('src')
                    : $('.avia_image').attr('src')
            };
        }
    }).catch((error) => {
        console.log(`
            ${error}
            \n
            URL: ${recipe.link}
        `);
    })
}
