import { v5 as uuidv5 } from 'uuid';

/**
 * Parse Vinted API response
 * @param  {Object} data - json response
 * @return {Array} sales
 */
const parse = data => {
  try {
    const { items } = data;

    return items.map(item => {
      const link = item.url;
      const price = item.total_item_price;
      const photo = item.photo;
      const published = photo?.high_resolution?.timestamp || null;

      return {
        link,
        price,
        title: item.title,
        published,
        uuid: uuidv5(link, uuidv5.URL),
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Scrape Vinted for a given LEGO set id
 * @param {String} searchText - lego set id to search
 * @returns {Promise<Array|null>}
 */
const scrape = async searchText => {
  try {
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=lego+${encodeURIComponent(searchText)}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    console.log('Vinted response status:', response.status);

    if (response.ok) {
      const body = await response.json();
      return parse(body);
    }

    console.error('Vinted API error:', response.status);
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { scrape };