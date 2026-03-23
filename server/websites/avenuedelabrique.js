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
        .text();
      const price = parseFloat(priceStr.replace(',', '.'));

      const discount = Math.abs(parseInt(
        $(element)
          .find('span.prodl-reduc')
          .text()
      ));

      return {
        discount,
        link,
        price,
        'photo': $(element)
          .find('span.prodl-img img')
          .attr('src'),
        'title': $(element).attr('title'),
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