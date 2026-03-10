/* eslint-disable no-console, no-process-exit */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as vinted from './websites/vinted.js';

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


const [,, param] = process.argv;

scrapeADLB(param);
//scrapeVinted(param)