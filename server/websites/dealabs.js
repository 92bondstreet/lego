import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import * as fs from 'fs';

/**
 * Scrape a given url page for dealabs
 * @param {String} url - url to parse
 * @returns {Array} deals
 */
export const scrape = async (url = 'https://www.dealabs.com/groupe/lego') => {
  console.log(`🕵️‍♀️  browsing ${url} website`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0.0.0 Safari/537.36',
    }
  });

  if (!response.ok) {
    console.error('Error fetching dealabs:', response.status);
    return [];
  }

  const body = await response.text();
  const $ = cheerio.load(body);
  const deals = [];

  $('article').each((i, el) => {
    // try different title selectors
    let linkEl = $(el).find('strong.thread-title a');
    if (!linkEl.length) linkEl = $(el).find('a.thread-title--list');
    if (!linkEl.length) linkEl = $(el).find('.thread-title a');

    const title = linkEl.text().trim();
    if (!title) return; // Not a deal

    const link = linkEl.attr('href');
    
    // Price
    const priceText = $(el).find('span.thread-price').text().trim() || $(el).find('span.text--b').text().trim();
    const price = parseFloat(priceText.replace(',', '.').replace(/[^0-9.]/g, ''));

    // Discount
    const discountText = $(el).find('span.mute--text').filter((i, el2) => $(el2).text().includes('%')).first().text();
    const discount = discountText ? parseInt(discountText.replace(/[^0-9]/g, '')) : 0;

    // Image
    let photo = $(el).find('img.thread-image').attr('src');
    if (photo && photo.includes('data:image')) {
       // it might be lazy loaded, try getting from data attribute if Dealabs uses it
       photo = $(el).find('img.thread-image').attr('data-lazy-src') || photo;
    }

    deals.push({
      title,
      price: isNaN(price) ? 0 : price,
      discount,
      link,
      photo: photo || '',
      uuid: link ? uuidv5(link, uuidv5.URL) : ''
    });
  });

  return deals;
};

// If ran directly, scrape and save to JSON
if (process.argv[1] && process.argv[1].includes('dealabs.js')) {
  scrape('https://www.dealabs.com/groupe/lego').then(deals => {
    fs.writeFileSync('dealabs.json', JSON.stringify(deals, null, 2));
    console.log(`Saved ${deals.length} deals to dealabs.json`);
  });
}
