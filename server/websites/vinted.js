import { v5 as uuidv5 } from 'uuid';

// Static Vinted cookies provided for scraping
const STATIC_COOKIES = 'v_udt=ZS84NDlHVW1DSGdCbi94Z1phKzRzaDlhaW5vVS0tTStEQ2lmaUE2Y0tGSkRhRC0tOGFmcW5IKzFqYnVQYWF5R3VObGJEQT09; anon_id=e1a84cf7-2ed1-456c-a272-27d49b359d4c; anonymous-locale=de-fr; anonymous-iso-locale=de-DE; non_dot_com_www_domain_cookie_buster=1; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc2MjQwOTQxLCJpYXQiOjE3NzU2MzYxNDEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiJlYmQ2NmQwNS0xNzc1NjM2MTQwIn0.dxodKQ-SeO8ANIh1eLBH8Zm8BkfrC-ODipfrO6u0MHWlgMasmrbGQ2-zEcB3dySh3uDs-6wFP67hd2feVskj0etpCH_JIb4lhUrvb9LDSMuvBvwH0nQyfWTgNLJt1N7lVUEu4-SKAfT_1-v09f19lwyQkWBjvRfQOq2NbbYTrv-zdmhQoJ3XmRz8EpGiBVcTGqTgFflUYQJB3msz4oMDrP35Jc8ZtdAGNbOwznMV1AJlz8wpUs1OJxrQg8Z3WC4gLJhHIh4QXc39hYBL_ooctFdGQ280i9qJ_EC0D6W_75rUWkFR4Na1u2pkwZbZpL6AOKlOho9-UlcfFMUw4PY0Gg; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc1NjQzMzQwLCJpYXQiOjE3NzU2MzYxNDAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6ImViZDY2ZDA1LTE3NzU2MzYxNDAifQ.JscB8HYwbw8O_V6D95zCJagpAl0hH8S1u7qCoiTl6YILS_-sbWbf4sUjrNqXDmSl8m8kvIo1LeaXrgxD9FyYLVWmc21reDt4e9FKCIvDDVFJhKEWAXsDoRGr5h_PQOenfIff6YXW8ynxnLUlUJPVMsevlj-hbz-ztzOXkKWeTVOVYdZ6LVfBi6mxPWA1vg4I9082udaO2NKWFO5-lVxjuVl-ZJUsWpP-Ebqjy6FOmf07B68qJPZa-AYQ2JwjrBeVtWbl9IX9OfpSARQr25nOTbCgRGKSLHT4P16oi7amBuyw2sTyuL2HwFSFJ-ppfzwwyzL99zRF-iNm4Dij3SqoJg; cf_clearance=Orw4jZSIDsB.HTyeUuLMs.lKMl1xCP2AZByGH_waM5k-1775636141-1.2.1.1-VcmdEo2Ud3oVs7LUgX0DAix6cQS3fH85wx9m5AEZmSv4uGQVs7TYXqLFN031ul8NxYzd7BzsvBzKCelntc0fFmphNH_5BsmM_P0JdH2Lc7oGcVJF.Ho.lRKod0WEmvVDXBqg1dvrPkbvexSDJavE5au97pvg2w0sig2RXr9xcFnt2WoVRSO9QLSz_PPnuoI8RodZlaF5V4TFP.5SzL5gswE3eiTrwT1W2hDh5f2oYZvjxW3XeHS.EgW1vNBzGQ2y4RgqrdGQ2TV5Yg6xefg2PoP46smT48ZwQz12ZlDpgYm2eyeLMtdlt.V9tCyjAkTDZyeh7d761w.X00YoGze2NQ; is_shipping_fees_applied_info_banner_dismissed=false; banners_ui_state=FAILURE; v_sid=cf8ad9d03f107fdf558365c0a7fdbc9b; _vinted_fr_session=NDVuS0xjYkU1Skx1TEZ2WldNNUx5U2lQUUdtNktmbDVubmNaUlRLWXpNK3paTDVyZW5GYjJjdXloTnl1bThUNXZJK1BPdFhXUjZsZnRKOG03d0RiTVhZeWwvSXlNUWRJdU1saVNRd3V2c0l0eEI2ZnczUUp4Z2NOQ0Y3L1QrSTdQRW5tNUhyRnIrNE1BNHhSRlFHSE44V1ZWa1hPVStwN01tOWpRWWpMWXBncFMxdlBtSHhYRVEzUXZXdExCdUc3RjdIUVEyV3JjbkFtK1drc25obU1Ga1J6cmMyTDh4Y0x3R2ttUDgvbHNsbC9Hb1FFSHo4ZC9HTDVkSGFvZWtzSi0tVDNhSG0rejlkQ3hXMDI3R0Q1WTNIdz09--01e2da97698b6bb1448991bd8492613ad024af6d; viewport_size=469; datadome=~42ovXh3gLIQWciutBibLKTSYZyFG296nnb9e820UX4hu96n7nGRLQH0m~czMSp7_2ZEFZdeREV3o~QRNEPp52aFiTnNGNg01BuPriKaMpbjD9BSu4g9Fpv3LjGc0JoL';

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