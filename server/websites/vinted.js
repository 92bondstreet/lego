import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

const COOKIE = "v_udt=MTQwMHJDMWJ5ZWZDdnFpVkd6WlMxbXR4TTgyRi0td0NIcTNkRkg4cjJyajFJRC0tWG5hUTlZZldjVDZKSDl4ci9TTmxvdz09; anonymous-locale=fr; is_shipping_fees_applied_info_banner_dismissed=false; OptanonAlertBoxClosed=2026-01-20T16:25:18.263Z; eupubconsent-v2=CQeUypgQeUypgAcABBFRCOFgAAAAAEPgAAwIAAAWZABMNCogjLIgACBQMAIEACgrCACgQBAAAkDRAQAmDAhyBgAusJkAIAUAAwQAgABBgACAAASABCIAKACAQAgQCBQABgAQBAQAMDAAGACxEAgABAdAxTAggECwASMyqDTAlAASCAlsqEEgCBBXCEIs8AggREwUAAAIABQAAADwWAhJICViQQBcQTQAAEAAAUQIECKQswBBQGaLQVgScBkaYBg-YJklOgyAJghIyDIhN-Ew8UhRAAAA.YAAACHwAAAAA.ILNtR_G__bXlv-Tb36fpkeYxf99hr7sQxBgbJs24FzLvW7JwS32E7NEzatqYKmRIAu3TBIQNtHJjURVChKIgVrzDsaEyUoTtKJ-BkiDMRY2JYCFxvm4pjWQCZ4vr_91d9mT-N7dr-2dzyy5hnv3a9_-S1UJidKYetHfn8ZBKT-_IU9_x-_4v4_MbpE2-eS1v_tGvt439-4tP_dpuxt-Tyffz___f72_e7X__c__33_-_Xf_7__4A; OTAdditionalConsentString=1~; domain_selected=true; non_dot_com_www_domain_cookie_buster=1; ad_blocker_detected=true; cf_clearance=mm0N5rlWREAyAIxglDAr__sPnid8dKZpkDkQkfSNzSk-1774273805-1.2.1.1-kBuD0u.WLsSTWC0DPFukEASnMruAkW3Ovpjir9EKEgGy8lgi9wfFCXzAHuF3jJ5umU209BKXo25GHoP.TwhR_..30j.KpC5SPIGz.pP2F1p02h2XYoh2eeYY7H_WR8rSmVrnUGmo0RysZoGnqnHO8Gak9U6NjjRsNdQXcb.IKkCvxhqXcufmYMxEEfxgvW8B3b38uM8725vO3bkbP2twj5gj8igWXjkbjQRX4Twc0Nw; __cf_bm=I.QtmRUez7Z6qdur2kXMkv3jaI_C2hkOnD.W6iuIlR8-1774273805.513469-1.0.1.1-.cTh9QIf.HaSxzCQQdG8JfkIM3UHMjsWVLh29I5_eWMiF..jlC8jkprew_Ncs0aV83_1cyjWJGBKHneerGevCsz9BcyHs2tjCA_qBRgeEk8FKjd.84f_IAHZmHJOP4ruOyv5iw1v5MdImUDRRKRR4g; anon_id=eab9ac2b-97fd-48cf-9d42-737fb4d19370; ab.optOut=This-cookie-will-expire-in-2027; last_user_id=1; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjoxMzQ1MTU0NzUsImFwcF9pZCI6NCwiYXVkIjoiZnIuY29yZS5hcGkiLCJjbGllbnRfaWQiOiJ3ZWIiLCJleHAiOjE3NzQ4NzkxNDksImlhdCI6MTc3NDI3NDM0OSwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwicHVycG9zZSI6InJlZnJlc2giLCJzY29wZSI6InVzZXIiLCJzaWQiOiI1Y2Y2ZGZhMi0xNzc0Mjc0MzQ5Iiwic3ViIjoiMTkyMDkxMzMwIiwiY2MiOiJGUiIsImFuaWQiOiJlYWI5YWMyYi05N2ZkLTQ4Y2YtOWQ0Mi03MzdmYjRkMTkzNzAiLCJhY3QiOnsic3ViIjoiMTkyMDkxMzMwIn19.LJFBVRy2F_0YOpt0Qd_d2ciUYa6V9MZ1Hut-o8jfy3xi8Z7kmAIYrkRW6dte4IRppMP7o4GC6Z96VCyJmsU7LgTjXsLqdV5HEYjpHsrRwr9NoyJkqs2GX_IKOpQEhOTV5XW9qSPiIi9mJOnXotkHPRmUIySNi8JRRXTSKWX0gt7EciZ2FexXIvWmPNZbB_FgJZU4D9ECymdfQSdBt4XMMOl2Ll5Dwch2XsYxsgT3eumalEmLRZUBrlXqpGJi5vE12O0Wfxjq8dDfVYJ7JaCA6mIuir-aC_tVvUG6mQJQxfF1YpHZzHSSo_mnEwWgToKwUkLdN1vB5JTOHZQTn8cTKw; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjoxMzQ1MTU0NzUsImFwcF9pZCI6NCwiYXVkIjoiZnIuY29yZS5hcGkiLCJjbGllbnRfaWQiOiJ3ZWIiLCJleHAiOjE3NzQyODE1NDksImlhdCI6MTc3NDI3NDM0OSwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwicHVycG9zZSI6ImFjY2VzcyIsInNjb3BlIjoidXNlciIsInNpZCI6IjVjZjZkZmEyLTE3NzQyNzQzNDkiLCJzdWIiOiIxOTIwOTEzMzAiLCJjYyI6IkZSIiwiYW5pZCI6ImVhYjlhYzJiLTk3ZmQtNDhjZi05ZDQyLTczN2ZiNGQxOTM3MCIsImFjdCI6eyJzdWIiOiIxOTIwOTEzMzAifX0.el4bvSQmIe9RATWfHw1e5JR0FvJ99qJ_CV7hGkJyw4yNq_EeQM4sWGhZAD5ut7kEDRPyfhw963I3TQwiNqo07oowEvR5zso-zSf2hrNHNY-DgN3Vy5YtqXkHqfS_rKVQR13BJKe-wBui9dmQYNrXLNl7US-kWiL-B6WQyVjUaJrbJuxgsm9RkBXyPp8AQiLWd6OxmlAs-qZqEIMipjPxDKW9ByZoltFJQDIhNmpqsCZwkGuYUSi0uKydniiU__HAMGuUUOSBG4PyFQ_5oxHVBfwB3QaUCQjNzRmcZ52TSfpmDDO4R45VOmMYZ4gVBpLVrWkfl28XDvc3jz2PQaVYoA; v_uid=192091330; v_sid=5cf6dfa2-1774274349; seller_header_visits=2; banners_ui_state=SUCCESS; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+23+2026+14%3A59%3A16+GMT%2B0100+(Central+European+Standard+Time)&version=202512.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=192091330&isAnonUser=0&hosts=&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0035%3A0%2CC0038%3A0&genVendors=V2%3A0%2CV1%3A0%2C&intType=2&geolocation=FR%3BIDF&AwaitingReconsent=false; viewport_size=594; datadome=gxRPTnpIOOsfyK~PxTU1obXFhnf9cBLoMA3An2ycTLSTytgCa7dEATVnC0NoKFQ5SzYNDd2Y5RMw7trCnYl6RrfSXcOQIfwZ8ye9wb8txFLushb2mv8tw8CHW6jMNn8x; _vinted_fr_session=c1ZwTGhINTU3R1QwV0dqbi96MVFCQ0hoTFB1QjVDd1VHQWZOZTF2V3B5UnQrMS9MTzBrNHR3NXJmeGpHcGdCT3hWUi9reFJ4Sk9Fa2svRTlDRVNycDZ4VTN3aVFJUWxZaVUrOTNvOVlEZXpWd1lNV1ZRTGgvUlRFeUhGN2FUcXFHNllNbXo5bkNmaHkwL3NhajRDZnU0RnMyaEZrRlNyeGthL1I4U2NqWTJrM2hUNnBVODVUWnQ4UlRyTE1LRHhzR1JZcDZKVTVURUQxdXc0ZkdVSGVPVUdOblA1b3BsbVdYUm1DMGU2a1FLSzl0dmlnQXZFem8rbUpENmpJZWZZWS0tWFN3T3BkS29hVDJWbENiVytjN1I1Zz09--e87991fbfac1d0bd24799dddd3cde54592a4ffe4";

function isNotDefined(value) {
  return (value == null || (typeof value === "string" && value.trim().length === 0));
}

/**
 * Parse  
 * @param  {String} data - json response
 * @return {Object} sales
 */
const parse = data => {
  try {
    const {items} = data;

    return items.map(item => {
      const link = item.url;
      const price = item.total_item_price;
      const {photo} = item;
      const published = photo.high_resolution && photo.high_resolution.timestamp;

      return {
        link,
        price,
        title: item.title,
        published,
        'uuid': uuidv5(link, uuidv5.URL)
      }
    })
  } catch (error){
    console.error(error);
    return [];
  }
}



const scrape = async searchText => {
  try {

    if (isNotDefined(COOKIE)) {
      throw "vinted requires a valid cookie";
    }

    const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1727382549&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids`, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": COOKIE
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET"
    });

    if (response.ok) {
      const body = await response.json();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};


export {scrape};