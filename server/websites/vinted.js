import { v5 as uuidv5 } from 'uuid';

// Static Vinted cookies provided for scraping
const STATIC_COOKIES = 'v_udt=QkU5MWxCVGdndFlEN1crNXI0SnVEbktCdVgwaS0tcXpZSzdQaDdhWHQxdnUrbC0tcEw4anlTd2t4ZWFzZndnbGR0VndNdz09; anon_id=ad185ae3-f63b-4f67-9e71-ced6fabac209; anonymous-locale=fr; domain_selected=true; is_shipping_fees_applied_info_banner_dismissed=true; non_dot_com_www_domain_cookie_buster=1; anonymous-iso-locale=fr-FR; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc2MjQyNDAwLCJpYXQiOjE3NzU2Mzc2MDAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiI0NjgwNzNhMi0xNzc1NjM3NjAwIn0.X6SKNkQFYQUpjH5vdvP8BOPdrMGFf_aep4RHRWeSSLrvV-NDESJvqdCKAxQ-LnXEFVHKX9FOoBUCtRN2djAfEZxlDrq7WA0S924_nG6mhkjx33AZoimKIriXe0Pu5YpXqNh8pokORR7a2wjqkkmUvLCmNpy5GRpp_sc62MAvareQn9xCXiDghjagkCtZwQPHMLZpkRsQEib4xKeyCj9Xd-zKquTh2_nFaQHNQXpKwaMSQT_EEX3Sex5bB223_IpoHKbGJ2p6Y5NprMw0Vnrn9Pso-gmTnoPPx4-PdM8lipd8fB8-plHbYOwmW5B_1QejimkIV0a_b21xwKLWjLBJ0g; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc1NjQ0ODAwLCJpYXQiOjE3NzU2Mzc2MDAsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6IjQ2ODA3M2EyLTE3NzU2Mzc2MDAifQ.xEq4M4l8Rd3ppNddf_0sPO0gzCpA1l5rKMpt75UJVEkbj4wPlYfIWqfW1EQaiYFd7ir8o0fR1FnebBmqwdwETEPQZUq5XH4ocJ5SMXp-ssJS6H7UCBJuqQP4-sTUYnq6znotgpOv_B3N4EsnZgxS2cKkTcJSPkikmZBsYMQQFkXPM3yS8-MQNB51u9dFcIXu-oItQN4rQnITFzNgAnhj9uEH_Os8z_2Hi5dvrqrn2rECB3zVXeI8weNN9-8kw609Sx_fAkS77VeVbj_TnSUnv6CqR8ZNBtxFPbKlkpGS1HH2I2YrNCD9TzeRhnfULhNr3X7AziidDYSTFBK0t1Bg6A; v_sid=f4c42ab0978efc50ea8622f0f0ce50d3; cf_clearance=Uw8evswVZsQnOBQZf_xkcZh9Qm70s4ATL0Wka8a5BCA-1775637603-1.2.1.1-fJtGK_Cejubm3Dg5EF4cJChuNX69j4ZOSgXL.y4dPcXrOtVyo4s.P30hyRhe6YRuRUVlp06MnMnUIdZr0CJvslBG2Hf7Zf2h6MWVxXHDzj3E_ZWBv1bUkaW2pUS6uvTpZAQrPRxbv6yQUF7ddtEpdjVywUBXfkdeCwTSJdtyAcQvFPOXZ_a8Lq31JIaUkirivKYFy_oQwKNNodfsWkLkcs6Y6wlXXoO11nd02krx2TIcJ9lG14wCWN_8DVVmfDZN4UTyxtwl4jLECgushpTB69j4EgVVMRLldi6bZD5ELRICz9e7Pw8eOLuzdyfGKImzuEiliCAVP72553GqiccnPA; __cf_bm=vx_ys.S29HbR3Q7jkA6TA1mjeDyNYPou9FqLpRcpSbE-1775637603.8063028-1.0.1.1-39mmXiY_S2t9G5kDL1.AjBp4gkNLeMmy1MgFaJ5PINlX2lR4tzDmhcCszfopAABaaaoYIXFJQslP8jvsYPjFJTh7KoU_ynVKwx740kxRT5vbWix1PzncTyxtwWOJcHO2yxPW5CQYcprjJPncGQx5A; consent_version=eu; v_sid=efa2ecb3ef4611b0015e87171c384e8f; banners_ui_state=FAILURE; _vinted_fr_session=UlBxM0ErdEhxZEpsS0tOMFJmZWV6by9KVEgxMjdWRmRuWkNpb21qSDVyaHMzMU12Nk9TaXU3cnhxQ2QrWVFkanlha0xRbm5xSUtWZjd3TnVvWW9KSmpmSkREb2o5U1RtNHM4dTF1cmZJWUR4OUdEazk3QkhFU1czemxlNkxXYk8xUENJWWJHcktMYVR5NGhqSWcyZ3pPdzcyY2VGN253OVd4WVl5RzN6SGJEMGxnQjJrMnBRaW9BRllqd3JYbWJGZXlFS1lrSm1ta2U1MndDd2NpcTlkcnl3djdJcG85VzlRUVg5cEwyd2NoTCtVT252bjJUbDFscGMyVmhSNThuWi0tRzltZDZtNEl2dHJkTFM4TXl4ODZXdz09--9cd2d8e1481750982cf23541280ac13501ea7420; datadome=aG1qP_vDgGbGLqVMhXIpdWhRuMUawsZr_YnQGoPEnY9RFpEvUurcu7CvUZ65zlzkmR8pd8N2yFU5UIXFsPOdGHUwFyY5NdvvgfPq9Vjn96x5VuxVlZHehxoeJJCoNsnD; viewport_size=469';

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
