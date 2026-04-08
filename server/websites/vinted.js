import { v5 as uuidv5 } from 'uuid';

const STATIC_COOKIES = process.env.VINTED_COOKIES || '';

let accessToken = null;
let allCookies = STATIC_COOKIES;

const staticTokenMatch = STATIC_COOKIES.match(/access_token_web=([^;]+)/);
if (staticTokenMatch && staticTokenMatch[1]) {
  accessToken = staticTokenMatch[1];
}

const HEADERS_BASE = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  'Referer': 'https://www.vinted.fr/',
  'Origin': 'https://www.vinted.fr',
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch a fresh session token from Vinted
 */
const fetchToken = async () => {
  try {
    const response = await fetch('https://www.vinted.fr', {
      headers: {
        ...HEADERS_BASE,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'manual',
    });

    const setCookies = response.headers.getSetCookie?.() || [];
    const dynamicCookies = setCookies.map(c => c.split(';')[0]).join('; ');

    if (STATIC_COOKIES && dynamicCookies) {
      allCookies = `${STATIC_COOKIES}; ${dynamicCookies}`;
    } else if (STATIC_COOKIES) {
      allCookies = STATIC_COOKIES;
    } else {
      allCookies = dynamicCookies;
    }

    for (const cookie of setCookies) {
      const match = cookie.match(/^access_token_web=([^;]+)/);
      if (match && match[1]) {
        accessToken = match[1];
        console.log('🍪 Vinted access token obtained');
        return true;
      }
    }

    // Try to extract from static cookies if dynamic didn't give us one
    const fallback = allCookies.match(/access_token_web=([^;]+)/);
    if (fallback && fallback[1]) {
      accessToken = fallback[1];
      console.log('🍪 Vinted access token from static cookies');
      return true;
    }

    console.error('No access_token_web found in cookies');
    return false;
  } catch (error) {
    console.error('fetchToken error:', error);
    return false;
  }
};

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
 * Make a single Vinted API request
 */
const makeRequest = async (url) => {
  return fetch(url, {
    headers: {
      ...HEADERS_BASE,
      'Accept': 'application/json, text/plain, */*',
      'Authorization': `Bearer ${accessToken}`,
      'Cookie': allCookies,
    },
  });
};

/**
 * Scrape Vinted for a given LEGO set id
 */
const scrape = async searchText => {
  try {
    if (!accessToken) {
      const ok = await fetchToken();
      if (!ok) {
        console.error('Failed to obtain Vinted access token');
        return [];
      }
    }

    const strictUrl = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${encodeURIComponent(`lego ${searchText}`)}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`;
    const looseUrl  = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${encodeURIComponent(searchText)}&catalog_ids=&size_ids=&material_ids=`;

    const fetchItems = async (url, label) => {
      let response = await makeRequest(url);

      // Token expired → refresh once
      if (response.status === 401 || response.status === 403) {
        console.log(`🔄 Got ${response.status} on ${label}, refreshing token...`);
        accessToken = null;
        await sleep(1000);
        const ok = await fetchToken();
        if (!ok) return [];
        response = await makeRequest(url);
      }

      if (!response.ok) {
        console.error(`Vinted API error (${label}): ${response.status}`);
        return [];
      }

      const body = await response.json();
      const items = body.items || [];
      console.log(`Vinted ${label} search "${searchText}": ${items.length} items`);
      return items;
    };

    // 1) Strict search (with brand + status filters)
    let items = await fetchItems(strictUrl, 'strict');

    // 2) If nothing, broaden search
    if (!items.length) {
      await sleep(500);
      items = await fetchItems(looseUrl, 'loose');
    }

    return parse({ items });
  } catch (error) {
    console.error('scrape error:', error);
    return [];
  }
};

export { scrape };