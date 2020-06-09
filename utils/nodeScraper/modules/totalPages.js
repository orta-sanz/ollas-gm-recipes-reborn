const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async () => {
    const url = 'https://www.ollasgm.com/blog';

    return axios(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            const pagesMeta = $('.pagination .pagination-meta').text().split(' ');
            const totalPages = pagesMeta[pagesMeta.length - 1]
            return totalPages;

        }).catch(console.error);
}
