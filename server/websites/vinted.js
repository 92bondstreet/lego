import { v5 as uuidv5 } from 'uuid';

const STATIC_COOKIES = 'v_udt=QkU5MWxCVGdndFlEN1crNXI0SnVEbktCdVgwaS0tcXpZSzdQaDdhWHQxdnUrbC0tcEw4anlTd2t4ZWFzZndnbGR0VndNdz09; anon_id=ad185ae3-f63b-4f67-9e71-ced6fabac209; anonymous-locale=fr; domain_selected=true; is_shipping_fees_applied_info_banner_dismissed=true; non_dot_com_www_domain_cookie_buster=1; anonymous-iso-locale=fr-FR; v_sid=f4c42ab0978efc50ea8622f0f0ce50d3; consent_version=eu; cf_clearance=Kn5MHEupyNpoloXxyqHPNspvONsHQFsTROSY764WwAA-1775646359-1.2.1.1-qNfozHXYJ8PR2kshgo.kPf2qZFND5pT0s138kRAIWgD2h_DlwWxCKGm8vGjR4wNnQH8jKjJ3r7m450VMg3kVQIdj.V3duDQcYAQvK64d8p4LqmjwZz8pAZkksmbBQhF3lzD.JYf17s2uwBbG9TCxLmn0QZKsfuWVpbbj3tpt85.8RlSzE4alkPCRAmDaKChdc5pwNLMqaMYqRBuDykBH5OipuXlJ7L8JtL2Ga8yUOI8MFK.j4P7UTCR22zqV0dCu9KPCwLhnV2LE8KVEsFSA3izEcr0nVmzU6N0zCFQhRFrNa6edWXfw.ow3BKiijFxqRdLDeax.pebcnr5wFM0GCQ; __cf_bm=U50Ur5FLtIrXAw_RPHFhMnRgvHV.TpJktgMHYDXpdyg-1775646359.2875614-1.0.1.1-HAlef4aqL40HkedYU3ZcplZe3Lh80gY6ghqGBLoq8Tziz4._T8RT76VHO_Ni1GmdVUL7eqRc3yMDAxYCwXIUfjRyEyTDx_1D996ZSBbYhmCS5MXfyIJkm1VD1DC5w6iJFS4R2LoX9YrLpmmvj0veyQ; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc2MjUxMTYwLCJpYXQiOjE3NzU2NDYzNjAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiI0NjgwNzNhMi0xNzc1NjM3NjAwIn0.dE8KudUsTuKhe4Pe_BKvmTLKZfHOMRA3KF5MM-PAEIX6df2Udzq7R60U0ZPRbGrAw_hDTv4s30bY_NaDHD2Ej0FcQUeEkmoDm8MWtfx2Fy03Gtg8V2CvUslRZKSCto88B_fdpSfP6ys2VLGjtitv5CBOlNQWKzuhs2WZDo371YvdBKpa-30tbPOgWDe-6342z-vt6QmhTY_g8ksW05vuwklTyzkiM0wr_3ZF2XzcCn9GgH9JesTfuBTH34cCxfNVw-BicRD9ovG8t8QKLMrxBIoPz59e3N1Xdm4DDNMhGOWRakaK5zQXvOpbft5F2T97whX7U9r9YoWKXsb1OlwKVA; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc1NjUzNTYwLCJpYXQiOjE3NzU2NDYzNjAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6IjQ2ODA3M2EyLTE3NzU2Mzc2MDAifQ.ymydHp51sfciThDVT6RZQhP0UO7vLETc9-EEltZ5_bZZYB91b_oLJYOSXKD8JqA7_4LpRPqxsimZOxqadGUqNKLtlH_QxjzmANxKy8xtbNrvYdbLzPHzcFTYnwCc6ryBYdmUvkKz_dcBrUHifQog1UXMU_4QyhNCljqAnRD9qbo0mNhfNyZmvInmsGCoGQyRjh86n10FvRShuP71dc05keZ7Jb0w_g_c96ZmEk1wMWHc6ee2oII5NneHvaPUcOEATLrS7CuW1mwQ47fOZ_bGsylTL_gH3jUX7dBM-_toGO8ubzaovKcFieHtZQSySxPyFE6SuYrjZqEkkaSYWI1_ig; v_sid=468073a2-1775637600; banners_ui_state=FAILURE; _vinted_fr_session=eGtVdmhZK3ZxeHZpMU81eW1xaktVRGUvU1B4SDBIS0VXT0pIbnRoeTNFSEduMTlVMEZaeGZWRm1zdiszODRkS0xBSXV0aE5teHpaSmhrRVVCcHUybk0xZGlkNUR2a3c4UE8zRnRzeXpuWHg3SVhObEVpRnlKNC9nU2M0cCszNUhUOTdybk1QZnArSmJGUTd2UHd6akRuWW5CMG1sa0RCQTRyUWdiWkhTMUlLTTNNVWtYajY1RmFFaTNPM0t2NjhWYmErUWJIblNUTW5raVRsYVNSQldtY2Yvd0dkdGNUNkdqamxrQ1pET0ljZz0tLWxxcys4bTVHanFOZGw1R3U2SUNCNWc9PQ%3D%3D--2633efca6945f3d451d3f4f9f17bb09d27d8e069; viewport_size=469; datadome=07~kOq4tecGh7QQ18i2oSqe4gzex4SGTjkEM69PONf3vXJkDN1EW2HLosbdVHZqfbm6p0W2nIaOhGXy2WMVHKxk58r5znVGqR7mO~ku9NjZ5SJ~lKAozN3ZQEJ~wOtAk';

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