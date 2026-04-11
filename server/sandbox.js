import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as dealabs from './websites/dealabs.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runScrapers() {
  try {
    // 1. Scrape Avenue de la Brique
    console.log('🕵️‍♀️ Scrapping Avenue de la Brique...');
    const adlbDeals = await avenuedelabrique.scrape('https://www.avenuedelabrique.com/promotions-et-bons-plans-lego');
    if (adlbDeals) {
      fs.writeFileSync(path.join(__dirname, 'websites', 'avenuedelabrique.json'), JSON.stringify(adlbDeals, null, 2));
      console.log(`✅ Saved ${adlbDeals.length} deals from Avenue de la Brique`);
    }

    // 2. Scrape Dealabs
    console.log('🕵️‍♀️ Scrapping Dealabs...');
    const dealabsDeals = await dealabs.scrape('https://www.dealabs.com/groupe/lego');
    if (dealabsDeals) {
      fs.writeFileSync(path.join(__dirname, 'websites', 'dealabs.json'), JSON.stringify(dealabsDeals, null, 2));
      console.log(`✅ Saved ${dealabsDeals.length} deals from Dealabs`);
    }

    console.log('🚀 Scraping task completed!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error during scraping:', e);
    process.exit(1);
  }
}

runScrapers();