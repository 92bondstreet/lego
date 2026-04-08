/*
 * Script local pour scraper Vinted et générer un fichier vinted-sales.json
 *
 * Usage (dans le dossier server) :
 *   node scrape-vinted-to-json.js
 *
 * Le script :
 *   - lit deals.json pour récupérer tous les ids de sets Lego
 *   - appelle vinted.scrape(id) pour chaque id
 *   - écrit un fichier vinted-sales.json de la forme :
 *       { "12345": [ { sale1 }, { sale2 }, ... ], ... }
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import * as vinted from './websites/vinted.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEALS_FILE = path.join(__dirname, 'deals.json');
const OUTPUT_FILE = path.join(__dirname, 'vinted-sales.json');

async function loadDealIds () {
  const content = await readFile(DEALS_FILE, 'utf-8');
  const deals = JSON.parse(content);
  const ids = new Set();

  for (const deal of deals) {
    if (deal.id) {
      ids.add(String(deal.id));
    }
  }

  return [...ids];
}

async function main () {
  try {
    console.log('📄 Lecture des ids Lego depuis deals.json...');
    const ids = await loadDealIds();
    console.log(`✅ ${ids.length} ids trouvés`);

    const allSales = {};

    for (const id of ids) {
      console.log(`🧱 Scraping Vinted pour le set ${id}...`);
      const sales = await vinted.scrape(id);
      console.log(`   -> ${sales.length} ventes trouvées`);
      allSales[id] = sales;
    }

    console.log('💾 Écriture du fichier vinted-sales.json...');
    await writeFile(OUTPUT_FILE, JSON.stringify(allSales, null, 2), 'utf-8');
    console.log(`✅ Fichier généré : ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Erreur pendant le scraping Vinted:', error);
    process.exit(1);
  }
}

main();
