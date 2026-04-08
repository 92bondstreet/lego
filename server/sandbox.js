/* eslint-disable no-console, no-process-exit */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as vinted from './websites/vinted.js';
import * as dealabs from './websites/dealabs.js';
import { writeFile } from 'fs/promises';

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

async function scrapeDealabs (maxPages = 10, website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  scraping deals from ${website} (maxPages=${maxPages})`);

    const deals = await dealabs.scrape(website, maxPages);

    console.log(deals);
    console.log(`\n${deals.length} deals found`);

    await writeFile('deals.json', JSON.stringify(deals, null, 2));
    console.log('💾 deals saved to deals.json');

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}


const [,, param] = process.argv;
const maxPages = Number.isNaN(parseInt(param, 10)) ? 10 : parseInt(param, 10);

scrapeDealabs(maxPages);
//scrapeADLB(param);
//scrapeVinted(param)