const { fetchHtml } = require('./http');

const BLOG_URL = 'https://www.ollasgm.com/blog';

/**
 * Returns the total number of blog pages as an integer.
 * Throws if the pagination cannot be parsed — the orchestrator treats this
 * as a global failure and refuses to overwrite existing data.
 */
module.exports = async () => {
  const $ = await fetchHtml(BLOG_URL);

  const pagesMeta = $('.pagination .pagination-meta').text().trim().split(' ');
  const totalPages = parseInt(pagesMeta[pagesMeta.length - 1], 10);

  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new Error(
      `Could not parse total pages from pagination meta: "${pagesMeta.join(' ')}"`
    );
  }

  return totalPages;
};
