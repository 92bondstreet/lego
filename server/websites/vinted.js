import { v5 as uuidv5 } from 'uuid';

// Static Vinted cookies provided for scraping
const STATIC_COOKIES = 'v_udt=QkU5MWxCVGdndFlEN1crNXI0SnVEbktCdVgwaS0tcXpZSzdQaDdhWHQxdnUrbC0tcEw4anlTd2t4ZWFzZndnbGR0VndNdz09; anon_id=ad185ae3-f63b-4f67-9e71-ced6fabac209; anonymous-locale=fr; domain_selected=true; is_shipping_fees_applied_info_banner_dismissed=true; non_dot_com_www_domain_cookie_buster=1; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc0OTYxMjExLCJpYXQiOjE3NzQzNTY0MTEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiIzNzMxZDVmZi0xNzc0MzU2NDExIn0.jyCwTKNfJPd8rMZKRCFn307eWig3NuPHotdmftC4bibz6jHDVibsn8wWeNEz0Q8aFspkdAeZ2s8Z7xoEc1IzFT97esDHOWCw24sSSIVTGDJDXzT83VpwAmL4N3-aT_h9O0jtGVEBUYMZvule2y2oDDMNekJJsa3c-177NFQ4XLvmy-Uu9bPkHn4NcGNNR9YUWuNkMSx8u1HnJC6pEJqfzRNOn8oGFpXlunX6nq-q1ju1dQCWUsLBcd0tKZ6hDKaoVgOom2DpFo--m-y0F71gX8j2J2lKWKQFayZTC3MxyAwXgcLLZd_X7gJf7rx-SEsPvQTh4rSXKvVhwh6iiXYfhQ; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc0MzYzNjExLCJpYXQiOjE3NzQzNTY0MTEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6IjM3MzFkNWZmLTE3NzQzNTY0MTEifQ.D84-dVS0t3HO0P1n93i7Vi3VRvGl3Yw1MVnES2Lwcp-FSW_ebJjz3m4epF6SVzvTvqpqqj0cjdQm9rzHC0cl4XLG-q93vgK32oTQSHfHjXf-Znn4t6YDJxa4ogR8lqa7MQgkfxZPdrM6_WJ83GMKWOGRgVRPKl1SpOry4nZ7TJGr5QsX3pavqeKO4CMDcoObKpMx-v2Ezl7J6ZtnfSZN7rVjiGr0SbD08KmPF4U08js65hM2iMlrembKWsGEYowbgEB6lT8pkWWgXOlLGw4ffgeZgMjESI5h1pHgNQB-QsjSqQvbYKIbYpGcx5gYAPjFs6sWQgXu9_s27cNj9A4liw; cf_clearance=KKasTsWNZJmGAXpr0r.DaHG5BtkfSgrLuimPj7Toiss-1774356414-1.2.1.1-RBPxosyA4FqakCbc7k_kbP_4YJo0YWVyhXnlC_IyRtqWwOyQu2dn00iglJEu3hkCneAeYyzg_cvpBSBFCV3GaMkCDThssYFbMihtU20ajMPiBtpZyqOt_MSdVshrpQq3RkFu4no1BUMTB5jm32JUg8DxegeM.hTKkbtXhTNhjYAoHedmG9OOs0eDV9J7voLBh4_Z69u7i5ARA5iG7qO1xzc273pbJPsO6dOhunpV.oI; __cf_bm=uRYdd6xno9GpKdGADYH_CdbyjVTkv3GWc2t8ket6qp0-1774356414.5931427-1.0.1.1-KdBT5oDuOzDjZD8TNT_T.SNEae__Lwa_57QR1ezvfd8cbSjOyiV.DqLNqol7RAiJBCGeCtnk8dNmMF0vqesKk6s5Ed3tO4IoFX0I_KqLyI_hS48uG4IdigYzkVy6kzel97_nvRRcUBKTQvhfBUijGQ; v_sid=6e285e20e7e5053f404213d6e060d5b3; viewport_size=469; datadome=Ti~gR8vWM5L1pRwU70EitLDEID17q1gw9PjYirIenmUtRCFgRUyYcNdCcN6o1yhv2fQzz_zrZ7s6VGs7ZP3jPwxG3eLOVCs9OjeUbAHTyEgg9F9ZO~Opf6krxbnuRSZV; banners_ui_state=FAILURE; _vinted_fr_session=Ym9uYjdYUUZJUHZNTG1BVUs3MWNmc3lTMmdXNHdjYXlaeGVsZklPUTlieE1aVGRYRGNNRDQzNUNtMHp2OVlBSGJTelVCbytJRTY1TG1OZkxwaHhuYm0wOURIdjh4Qm1vU0ZET3NDWGJ6RzNHR0RmbFJaYVpyV3VyV1VnSHVncFVXTSt6RWhwQVVNRFRMd2RFcWhJelVuM2YyanY3YmxHcjNzZHBhM0FUQzdabE5qbWdiSEFEZC9uQ2JGdm1tTnJpOWR5Tm82N3JrMlVrSTlnV3RxR1ZoelFacE1vSFdydmcxcnpNRy95ZHoySERjT04xSmZaOE5LdURsNGN4dEovRS0tQVFqRHhQQXZNL05GZm8xSjlTT3Fmdz09--4143bb42824f2eea0c9958a6c0e9132aff1fa75b';

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