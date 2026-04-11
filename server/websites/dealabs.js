import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import * as fs from 'fs';

const IMAGE_BASE = 'https://static-pepper.dealabs.com';

/**
 * Build a proper image URL from Dealabs mainImage object
 * @param {{path: string, name: string}|null} mainImage
 * @returns {string}
 */
const buildImageUrl = (mainImage) => {
  if (!mainImage || !mainImage.path || !mainImage.name) return '';
  return `${IMAGE_BASE}/${mainImage.path}/${mainImage.name}/re/400x400/qt/70/${mainImage.name}.jpg`;
};

/**
 * Scrape a given url page for dealabs by extracting the embedded
 * window.__INITIAL_STATE__ JSON — which contains all deal data
 * including price, temperature, discount, and images.
 *
 * @param {String} url - url to parse
 * @returns {Promise<Array>} deals
 */
export const scrape = async (url = 'https://www.dealabs.com/groupe/lego') => {
  console.log(`🕵️  scraping ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0.0.0 Safari/537.36',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  if (!response.ok) {
    console.error(`❌ Error fetching dealabs: ${response.status}`);
    return [];
  }

  const html = await response.text();

  // Extract the embedded JSON state — Dealabs injects all deal data here
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]+?\});\s*\n/);
  if (!stateMatch) {
    console.error('❌ Could not find window.__INITIAL_STATE__ in Dealabs page');
    return [];
  }

  let state;
  try {
    state = JSON.parse(stateMatch[1]);
  } catch (e) {
    console.error('❌ Failed to parse __INITIAL_STATE__:', e.message);
    return [];
  }

  const deals = [];
  const threadMap = {};

  // Get hottest threads (they have full data including price, temperature, images)
  const hottestThreads = state?.widgets?.hottestWidget?.threads || [];
  hottestThreads.forEach(t => {
    threadMap[String(t.threadId)] = t;
  });

  // Also scrape the main page article listing using cheerio for the remaining threads
  const $ = cheerio.load(html);

  $('article[id]').each((i, el) => {
    const rawId = $(el).attr('id') || '';
    const threadId = rawId.replace('thread-', '');
    if (!threadId || threadMap[threadId]) return;

    const priceText = $(el).find('[data-t="price"]').text().trim() ||
                      $(el).find('.thread-price').text().trim() ||
                      $(el).find('.thread-price--list').text().trim();
    const price = parseFloat(priceText.replace('€', '').replace(',', '.').replace(/[^0-9.]/g, '')) || null;

    const retailText = $(el).find('.thread-price--old').text().trim();
    const retail = parseFloat(retailText.replace('€', '').replace(',', '.').replace(/[^0-9.]/g, '')) || 0;

    const discountText = $(el).find('[data-t="discount"]').text().trim() ||
                         $(el).find('.thread-discount').text().trim();
    let discount = discountText ? parseInt(discountText.replace(/[^0-9]/g, '')) : 0;

    // Auto-calculate discount if retail exists but discount is missing
    if (price && retail && !discount) {
      discount = Math.round(((retail - price) / retail) * 100);
    }

    const tempText = $(el).find('[data-t="temperature"]').text().trim() ||
                     $(el).find('.vote-temp').text().trim();
    const temperature = tempText ? parseFloat(tempText.replace(/[^-0-9.]/g, '')) : 0;

    const titleEl = $(el).find('strong.thread-title a, a.thread-title--list, .thread-title a, .thread--type-list .thread-title').first();
    const title = titleEl.text().trim() || $(el).find('.thread-title').text().trim();
    const link = titleEl.attr('href') || `https://www.dealabs.com/bons-plans/${threadId}`;

    const imgSrc = $(el).find('img[src]').not('[src*="data:"]').first().attr('src') ||
                   $(el).find('img').first().attr('data-src') || 
                   $(el).find('.thread-image img').attr('src') || '';

    if (title) {
      threadMap[threadId] = {
        threadId,
        title,
        price,
        retail,
        priceDiscount: discount,
        temperature,
        url: link,
        mainImage: null,
        _rawPhoto: imgSrc
      };
    }
  });

  // Convert all threads to our deal format
  Object.values(threadMap).forEach(thread => {
    const link = thread.url || `https://www.dealabs.com/bons-plans/${thread.threadId}`;
    const photo = thread._rawPhoto || buildImageUrl(thread.mainImage);

    deals.push({
      id: String(thread.threadId),
      uuid: uuidv5(link, uuidv5.URL),
      title: thread.title || '',
      price: thread.price || 0,
      retail: thread.retail || thread.nextBestPrice || 0,
      discount: thread.priceDiscount || 0,
      temperature: Math.round(thread.temperature || 0),
      comments: thread.commentCount || 0,
      link,
      photo,
      published: thread.publishedAt
        ? Math.floor(new Date(thread.publishedAt).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
    });
  });

  console.log(`✅ Found ${deals.length} deals from Dealabs`);
  return deals;
};

// If ran directly, scrape and save to JSON
const isMain = process.argv[1] && (
  process.argv[1].endsWith('dealabs.js') ||
  process.argv[1].endsWith('dealabs')
);
if (isMain) {
  scrape('https://www.dealabs.com/groupe/lego').then(deals => {
    const outPath = new URL('./dealabs.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
    fs.writeFileSync(outPath, JSON.stringify(deals, null, 2));
    console.log(`💾 Saved ${deals.length} deals`);
    if (deals.length > 0) {
      console.log('Sample deal:', JSON.stringify(deals[0], null, 2));
    }
  });
}
