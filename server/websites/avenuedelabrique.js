import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true});

  return $('div.prods a')
    .map((i, element) => {
      const link = $(element)
        .attr('href');

      const priceStr = $(element)
        .find('span.prodl-prix span')
        .text() || $(element).find('span.prodl-prix').text();
      const price = parseFloat(priceStr.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;

      const retailStr = $(element)
        .find('span.prodl-prix-barre')
        .text();
      const retail = parseFloat(retailStr.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;

      const discountText = $(element)
        .find('span.prodl-reduc')
        .text();
      let discount = Math.abs(parseInt(discountText.replace(/[^0-9]/g, ''))) || 0;

      // Calculate discount if missing
      if (price > 0 && retail > 0 && !discount) {
        discount = Math.round(((retail - price) / retail) * 100);
      }

      return {
        discount,
        link,
        price,
        retail,
        'photo': $(element)
          .find('span.prodl-img img')
          .attr('src'),
        'title': $(element).attr('title') || $(element).find('.prodl-titre').text().trim(),
        'uuid': uuidv5(link, uuidv5.URL)
      };
    })
    .get();
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse and scrape
 * @returns 
 */
const scrape = async url => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();

    return parse(body);
  }

  console.error(response);

  return null;
};

export {scrape};

// If ran directly, scrape and save to JSON
import * as fslib from 'fs';
const isMain = process.argv[1] && (
  process.argv[1].endsWith('avenuedelabrique.js') ||
  process.argv[1].endsWith('avenuedelabrique')
);

if (isMain) {
  scrape('https://www.avenuedelabrique.com/promotions-et-bons-plans-lego').then(deals => {
    const outPath = new URL('./avenuedelabrique.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
    fslib.writeFileSync(outPath, JSON.stringify(deals, null, 2));
    console.log(`💾 Saved ${deals.length} deals to avenuedelabrique.json`);
  });
}
