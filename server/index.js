/**
 * Generic scraper dispatcher
 * Routes a URL to the correct website scraper based on domain
 */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as dealabs from './websites/dealabs.js';

const scrapers = {
  avenuedelabrique,
  dealabs
};

/**
 * Scrape deals from a given URL by detecting the website
 * @param {string} link - URL to scrape
 * @returns {Promise<Array>} list of deals
 */
export default async (link) => {
  const url = new URL(link);
  // Extract the second-level domain (e.g. "dealabs" from "www.dealabs.com")
  const parts = url.hostname.split('.');
  const domain = parts.length >= 2 ? parts[parts.length - 2] : parts[0];

  const scraper = scrapers[domain];
  if (!scraper) {
    throw new Error(`No scraper found for domain: ${domain}`);
  }

  return scraper.scrape(link);
};
