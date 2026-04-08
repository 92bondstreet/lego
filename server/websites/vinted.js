import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import * as vinted from './websites/vinted.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEALS_FILE  = path.join(__dirname, 'deals.json');
const OUTPUT_FILE = path.join(__dirname, 'vinted-sales.json');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function loadDealIds() {
  const content = await readFile(DEALS_FILE, 'utf-8');
  const deals = JSON.parse(content);
  const ids = new Set();
  for (const deal of deals) {
    if (deal.id) ids.add(String(deal.id));
  }
  return [...ids];
}

async function scrapeWithRetry(id, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const sales = await vinted.scrape(id);
      return sales;
    } catch (error) {
      console.warn(`   ⚠️  Tentative ${attempt}/${maxRetries} échouée pour ${id}:`, error.message);
      if (attempt < maxRetries) {
        const delay = attempt * 3000; // 3s, 6s, 9s
        console.log(`   ⏳ Attente ${delay / 1000}s avant retry...`);
        await sleep(delay);
      }
    }
  }
  console.error(`   ❌ Échec après ${maxRetries} tentatives pour ${id}`);
  return [];
}

async function main() {
  try {
    console.log('📄 Lecture des ids Lego depuis deals.json...');
    const ids = await loadDealIds();
    console.log(`✅ ${ids.length} ids trouvés\n`);

    // Charger les ventes déjà scrapées si le fichier existe
    let allSales = {};
    try {
      const existing = await readFile(OUTPUT_FILE, 'utf-8');
      allSales = JSON.parse(existing);
      console.log(`📄 vinted-sales.json existant chargé (${Object.keys(allSales).length} sets)\n`);
    } catch {
      console.log('ℹ️  Aucun vinted-sales.json existant, on part de zéro\n');
    }

    let index = 0;
    let newCount = 0;

    for (const id of ids) {
      index++;

      // Si on a déjà des ventes pour ce set, on saute
      if (allSales[id] && Array.isArray(allSales[id]) && allSales[id].length > 0) {
        console.log(`⏭  [${index}/${ids.length}] Set ${id} déjà présent (${allSales[id].length} ventes)`);
        continue;
      }

      console.log(`🧱 [${index}/${ids.length}] Scraping Vinted pour le set ${id}...`);
      const sales = await scrapeWithRetry(id);
      console.log(`   -> ${sales.length} ventes trouvées`);
      allSales[id] = sales;
      newCount++;

      // Sauvegarde intermédiaire tous les 5 sets pour ne pas tout perdre en cas d'erreur
      if (newCount % 5 === 0) {
        await writeFile(OUTPUT_FILE, JSON.stringify(allSales, null, 2), 'utf-8');
        console.log(`   💾 Sauvegarde intermédiaire (${Object.keys(allSales).length} sets)\n`);
      }

      // Pause entre les appels (2.5s) pour éviter les 403
      if (index < ids.length) {
        await sleep(2500);
      }
    }

    console.log('\n💾 Écriture finale du fichier vinted-sales.json...');
    await writeFile(OUTPUT_FILE, JSON.stringify(allSales, null, 2), 'utf-8');
    console.log(`✅ Fichier généré : ${OUTPUT_FILE}`);
    console.log(`📊 ${Object.keys(allSales).length} sets au total`);
  } catch (error) {
    console.error('❌ Erreur pendant le scraping Vinted:', error);
    process.exit(1);
  }
}

main();