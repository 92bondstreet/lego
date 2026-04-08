import { v5 as uuidv5 } from 'uuid';

// Static Vinted cookies provided for scraping
const STATIC_COOKIES = process.env.VINTED_COOKIES || '';

// Session token cache
let accessToken = null;
let allCookies = STATIC_COOKIES;

// Try to extract access_token_web from the static cookies
const staticTokenMatch = STATIC_COOKIES.match(/access_token_web=([^;]+)/);
if (staticTokenMatch && staticTokenMatch[1]) {
  accessToken = staticTokenMatch[1];
}

/**
 * Fetch a fresh session token from Vinted
 */
const fetchToken = async () => {
  const response = await fetch('https://www.vinted.fr', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

  // Extract access_token_web from cookies
  for (const cookie of setCookies) {
    const match = cookie.match(/^access_token_web=([^;]+)/);
    if (match && match[1]) {
      accessToken = match[1];
      console.log('🍪 Vinted access token obtained');
      return;
    }
  }

  console.error('No access_token_web found in cookies');
};

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
    // Get token if we don't have one
    if (!accessToken) {
      await fetchToken();
    }

    if (!accessToken) {
      console.error('Failed to obtain Vinted access token');
      return [];
    }

    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=lego+${encodeURIComponent(searchText)}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`;

    const makeRequest = async () => {
      return fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Authorization': `Bearer ${accessToken}`,
          'Cookie': allCookies,
        },
      });
    };

    let response = await makeRequest();

    // If 401/403, try refreshing token once
    if (response.status === 401 || response.status === 403) {
      console.log('🔄 Token expired, refreshing...');
      accessToken = null;
      await fetchToken();
      if (!accessToken) return [];
      response = await makeRequest();
    }

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