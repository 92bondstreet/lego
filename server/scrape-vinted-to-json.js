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

// Simple async delay helper to avoid hitting Vinted too fast
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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

    // Charger les ventes déjà scrapées si le fichier existe
    let allSales = {};
    try {
      const existing = await readFile(OUTPUT_FILE, 'utf-8');
      allSales = JSON.parse(existing);
      console.log(`📄 vinted-sales.json existant chargé (${Object.keys(allSales).length} sets)`);
    } catch {
      console.log('ℹ️ Aucun vinted-sales.json existant, on part de zéro');
    }

    // Add a small delay between each Vinted call to reduce 403s
    let index = 0;
    for (const id of ids) {
      index += 1;

      // Si on a déjà des ventes pour ce set, on ne le re-scrape pas
      if (allSales[id] && Array.isArray(allSales[id]) && allSales[id].length > 0) {
        console.log(`⏭  Set ${id} déjà présent (${allSales[id].length} ventes), on saute`);
        continue;
      }

      console.log(`🧱 Scraping Vinted pour le set ${id}...`);
      const sales = await vinted.scrape(id);
      console.log(`   -> ${sales.length} ventes trouvées`);
      allSales[id] = sales;

      // Pause 1s between calls (tunable if needed)
      if (index < ids.length) {
        await sleep(1000);
      }
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
