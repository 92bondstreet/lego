/* eslint-disable no-console, no-process-exit */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as vinted from './websites/vinted.js';
import * as dealabs from './websites/dealabs.js';

async function scrapeADLB (website = 'https://www.avenuedelabrique.com/promotions-et-bons-plans-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function scrapeVinted (lego) {
  try {
    console.log(`🕵️‍♀️  scraping lego ${lego} from vinted.fr`);

    const sales = await vinted.scrape(lego);

    console.log(sales);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function scrapeDealabs(url = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${url}`);
    const deals = await dealabs.scrape(url);
    console.log(deals);

    // Save to JSON file
    const fs = await import('fs');
    fs.writeFileSync('./deals.json', JSON.stringify(deals, null, 2));
    console.log('✅ deals saved to deals.json');

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}


const scraper = process.argv[2];

if (scraper === "vinted") {
  scrapeVinted(process.argv[3] || "75331");
} else if (scraper === "dealabs") {
  scrapeDealabs(process.argv[3]);
} else {
  scrapeADLB();
}


