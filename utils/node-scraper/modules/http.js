const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const client = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent': USER_AGENT,
    'Accept-Language': 'es-ES,es;q=0.9',
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * True for errors worth retrying: network hiccups, timeouts and
 * transient server responses (429 / 5xx). Anything else (e.g. 404) is
 * considered definitive and not retried.
 */
const isTransientError = (error) => {
  const transientCodes = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNABORTED',
    'EAI_AGAIN',
  ];
  if (error.code && transientCodes.includes(error.code)) {
    return true;
  }

  const status = error.response && error.response.status;
  if (status === 429 || (status >= 500 && status <= 599)) {
    return true;
  }

  // No response at all usually means the request never completed.
  return !error.response;
};

/**
 * Runs `fn` and retries it with exponential backoff + jitter while the
 * error looks transient. Rethrows the last error once retries are exhausted.
 */
const fetchWithRetry = async (fn, { retries = 3, baseDelay = 500 } = {}) => {
  let attempt = 0;

  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !isTransientError(error)) {
        throw error;
      }

      const backoff = baseDelay * 2 ** attempt;
      const jitter = Math.floor(Math.random() * baseDelay);
      await sleep(backoff + jitter);
      attempt += 1;
    }
  }
};

/**
 * Fetches a URL and returns a loaded cheerio instance. Wrapped in
 * `fetchWithRetry` so callers get transparent retries.
 */
const fetchHtml = (url, retryOptions) =>
  fetchWithRetry(async () => {
    const response = await client.get(encodeURI(url));
    return cheerio.load(response.data);
  }, retryOptions);

/**
 * Maps `items` through the async `fn` with a bounded number of concurrent
 * workers, preserving input order in the result. A rejected `fn` aborts the
 * whole run, so callers that want per-item tolerance must not throw.
 */
const mapWithConcurrency = async (items, limit, fn) => {
  const results = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await fn(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);

  return results;
};

module.exports = {
  client,
  fetchHtml,
  fetchWithRetry,
  mapWithConcurrency,
};
