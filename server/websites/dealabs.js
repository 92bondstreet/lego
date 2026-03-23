import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

const COOKIE = "f_v=%2232d1c774-f60e-11f0-ae40-0242ac110003%22; dont-track=1; f_c=0; g_p=0; cookie_policy_agreement=3; browser_push_permission_requested=1768920332; ph_phc_rsG2vmLJv0UVjxF7AIiZZ3eSFJClXm3aBxnaskxL4KC_posthog=%7B%22distinct_id%22%3A%22019bdc02-6f66-7d1c-8257-3a7f36219d16%22%2C%22%24sesid%22%3A%5Bnull%2Cnull%2Cnull%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fhelp.dealabs.com%2Fhelp%22%2C%22u%22%3A%22https%3A%2F%2Fhelp.dealabs.com%2Fen%22%7D%7D; pepper_session=%22EUZdU2fhOfJOYIF5EsxThjvm77OepFSi7BGbhrcD%22; u_l=0; xsrf_t=%22Nh7Q3bZNT5l5RqCVuhdXo7hovwckbUPjFLkiZ1NE%22";

/**
 * Parse webpage HTML response
 * @param  {String} data - html response
 * @return {Array} deals
 */

const parse = data => {
  const $ = cheerio.load(data);

  return $('div.js-threadList article div.js-vue3')
    .map((i, element) => {
      try {
        const rawData = $(element).attr('data-vue3');
        const json = JSON.parse(rawData);
        const thread = json.props.thread;

        const title = thread.title;
        const link = thread.shareableLink;
        const price = thread.price;
        const nextBestPrice = thread.nextBestPrice;
        const discount = (price && nextBestPrice && nextBestPrice > price)
        ? Math.round(((nextBestPrice - price) / nextBestPrice) * 100)
        : thread.percentage || 0;
        const temperature = thread.temperature;
        const photo = thread.mainImage
          ? `https://static.dealabs.com/threads/raw/${thread.mainImage.name}.${thread.mainImage.ext}`
          : '';

        if (!title || !link) return null;

        return {
          discount,
          link,
          photo,
          nextBestPrice,
          price,
          temperature,
          title,
          uuid: uuidv5(link, uuidv5.URL)
        };
      } catch (e) {
        return null;
      }
    })
    .get()
    .filter(deal => deal !== null);
};



/**
 * Scrape dealabs.com/groupe/lego
 * @param {String} url - url to scrape
 * @returns {Array} deals
 */
export const scrape = async (url = 'https://www.dealabs.com/groupe/lego') => {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        cookie: COOKIE
      }
    });

    if (response.ok) {
      const body = await response.text();
      return parse(body);
    }

    console.error('Response failed:', response.status, response.statusText);
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};