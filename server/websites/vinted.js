import { v5 as uuidv5 } from 'uuid';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse Vinted API response
 */
const parse = data => {
  try {
    const { items } = data;
    if (!items || !Array.isArray(items)) return [];

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
    console.error('parse error:', error);
    return [];
  }
};

/**
 * Get a fresh token by visiting vinted.fr homepage
 */
const getToken = async () => {
  try {
    const res = await fetch('https://www.vinted.fr/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });

    const cookies = res.headers.getSetCookie?.() || [];
    let token = null;
    let cookieStr = '';

    for (const c of cookies) {
      const part = c.split(';')[0];
      cookieStr += (cookieStr ? '; ' : '') + part;
      const m = c.match(/^access_token_web=([^;]+)/);
      if (m) token = m[1];
    }

    return { token, cookieStr };
  } catch (e) {
    console.error('getToken error:', e.message);
    return { token: null, cookieStr: '' };
  }
};

/**
 * Scrape Vinted for a given LEGO set id
 */
const scrape = async searchText => {
  try {
    const { token, cookieStr } = await getToken();

    if (!token) {
      console.error('No token obtained from Vinted');
      return [];
    }

    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${encodeURIComponent(`lego ${searchText}`)}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`;

    await sleep(500);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Authorization': `Bearer ${token}`,
        'Cookie': cookieStr,
        'Referer': 'https://www.vinted.fr/',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
      },
    });

    if (!response.ok) {
      console.error(`Vinted API error: ${response.status}`);
      return [];
    }

    const body = await response.json();
    const items = body.items || [];
    console.log(`Vinted search "${searchText}": ${items.length} items`);
    return parse({ items });
  } catch (error) {
    console.error('scrape error:', error);
    return [];
  }
};

export { scrape };