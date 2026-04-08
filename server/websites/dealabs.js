import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Array} deals
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('article[id^="thread_"]')
    .map((i, element) => {
      const vue3Data = $(element).find('[data-vue3]').attr('data-vue3');

      if (!vue3Data) return null;

      try {
        const json = JSON.parse(vue3Data);
        const thread = json.props && json.props.thread;

        // Ignore invalid threads and deals explicitly marked as expired
        if (!thread || thread.isExpired) return null;

        const link = `https://www.dealabs.com/bons-plans/${thread.titleSlug}-${thread.threadId}`;

        // Extract lego set id from title (e.g. "LEGO Star Wars 75441" -> "75441")
        const idMatch = thread.title && thread.title.match(/\b(\d{4,6})\b/);
        const id = idMatch ? idMatch[1] : String(thread.threadId);

        // Compute discount from prices if percentage is not available
        const discount = thread.percentage
          || (thread.price && thread.nextBestPrice
            ? Math.round((1 - thread.price / thread.nextBestPrice) * 100)
            : 0);

        return {
          id,
          title: thread.title,
          link,
          price: thread.price || null,
          nextBestPrice: thread.nextBestPrice || null,
          discount,
          temperature: thread.temperature || 0,
          comments: thread.commentCount || 0,
          photo: thread.mainImage
            ? `https://static-pepper.dealabs.com/${thread.mainImage.path}/${thread.mainImage.name}/re/300x300/qt/60/${thread.mainImage.name}.jpg`
            : '',
          published: thread.publishedAt || null,
          merchant: thread.merchant ? thread.merchant.merchantName : null,
          uuid: uuidv5(link, uuidv5.URL)
        };
      } catch {
        return null;
      }
    })
    .get()
    .filter(deal => deal !== null);
};

/**
 * Scrape a given dealabs url page
 * @param {String} url - url to parse and scrape
 * @returns {Promise<Array|null>}
 */
const scrapePage = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error(response);
  return null;
};

/**
 * Scrape multiple pages from dealabs (up to maxDeals)
 * @param {String} baseUrl - base url to scrape
 * @param {Number} maxPages - maximum number of pages to scrape (default 10)
 * @returns {Promise<Array>}
 */
const scrape = async (baseUrl = 'https://www.dealabs.com/groupe/lego', maxPages = 10) => {
  let allDeals = [];
  let page = 1;

  while (page <= maxPages) {
    const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
    const deals = await scrapePage(url);

    if (!deals || deals.length === 0) break;

    allDeals = allDeals.concat(deals);
    page++;
  }

  return allDeals;
};

export { scrape };
