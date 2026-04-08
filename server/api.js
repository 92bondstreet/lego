import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import * as dealabs from './websites/dealabs.js';
import * as vinted from './websites/vinted.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

// Serve client static files (copied under server/public for Vercel)
app.use(express.static(path.join(__dirname, 'public')));

// Cache for scraped deals
let cachedDeals = [];
let lastScrapeTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Deals loaded from deals.json (for /deals endpoints)
let fileDeals = null;

const loadDealsFromFile = async () => {
  if (!fileDeals) {
    const filePath = path.join(__dirname, 'deals.json');
    const content = await readFile(filePath, 'utf-8');
    fileDeals = JSON.parse(content);
  }

  return fileDeals;
};

// Vinted sales loaded from vinted-sales.json (generated locally)
let fileSales = null;

const loadSalesFromFile = async () => {
  if (!fileSales) {
    const filePath = path.join(__dirname, 'vinted-sales.json');
    const content = await readFile(filePath, 'utf-8');
    fileSales = JSON.parse(content);
  }

  return fileSales;
};

/**
 * GET /api/deals
 * Returns scraped deals from dealabs, with optional pagination
 * Query params: page (default 1), size (default 12)
 */
app.get('/api/deals', async (req, res) => {
  try {
    const now = Date.now();

    // Re-scrape if cache is expired or empty
    if (cachedDeals.length === 0 || now - lastScrapeTime > CACHE_DURATION) {
      console.log('🕵️‍♀️ Scraping deals from dealabs...');
      cachedDeals = await dealabs.scrape() || [];
      lastScrapeTime = now;
      console.log(`✅ ${cachedDeals.length} deals scraped`);
    }

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 12;
    const start = (page - 1) * size;
    const end = start + size;
    const result = cachedDeals.slice(start, end);

    res.json({
      success: true,
      data: {
        result,
        meta: {
          currentPage: page,
          pageCount: Math.ceil(cachedDeals.length / size),
          pageSize: size,
          count: cachedDeals.length
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to scrape deals' });
  }
});

/**
 * GET /api/sales
 * Scrapes Vinted for a given lego set id
 * Query params: id (lego set id)
 */
app.get('/api/sales', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Missing id parameter' });
    }

    // Try to use pre-scraped JSON first (works on Vercel)
    try {
      const allSales = await loadSalesFromFile();
      const salesFromFile = allSales[String(id)] || [];

      if (salesFromFile.length > 0) {
        console.log(`📄 ${salesFromFile.length} Vinted sales loaded from JSON for set ${id}`);
        return res.json({
          success: true,
          data: {
            result: salesFromFile
          }
        });
      }
    } catch (e) {
      console.warn('vinted-sales.json not available or invalid, falling back to live scrape');
    }

    // Fallback: live scrape (works surtout en local)
    console.log(`🔍 Scraping Vinted for lego set ${id} (fallback)...`);
    const sales = await vinted.scrape(id) || [];
    console.log(`✅ ${sales.length} Vinted sales found for set ${id}`);

    res.json({
      success: true,
      data: {
        result: sales
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to scrape Vinted' });
  }
});

/**
 * GET /deals/:id
 * Fetch a specific deal from deals.json
 * :id can be either the deal uuid or the lego set id
 */
app.get('/deals/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const deals = await loadDealsFromFile();

    const deal = deals.find(d => d.uuid === id || String(d.id) === String(id));

    if (!deal) {
      return res.status(404).json({error: 'Deal not found'});
    }

    // Return the deal object directly, as in the workshop examples
    res.json(deal);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch deal'});
  }
});

/**
 * GET /deals/search
 * Search for deals from deals.json with optional filters
 * Query params:
 *   - limit: number of deals to return (default 12)
 *   - price: maximum price
 *   - date: ISO date string (YYYY-MM-DD); keeps deals newer than this date
 *   - filterBy: best-discount | most-commented | hot
 */
app.get('/deals/search', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;
    const maxPrice = req.query.price ? parseFloat(req.query.price) : null;
    const dateStr = req.query.date;
    const filterBy = req.query.filterBy;

    let deals = [...(await loadDealsFromFile())];

    if (Number.isFinite(maxPrice)) {
      deals = deals.filter(d => typeof d.price === 'number' && d.price <= maxPrice);
    }

    if (dateStr) {
      const ts = Date.parse(dateStr);
      if (!Number.isNaN(ts)) {
        const thresholdSeconds = Math.floor(ts / 1000);
        deals = deals.filter(d => typeof d.published === 'number' && d.published >= thresholdSeconds);
      }
    }

    if (filterBy) {
      switch (filterBy) {
        case 'best-discount':
          deals = deals.filter(d => typeof d.discount === 'number' && d.discount >= 50);
          break;
        case 'most-commented':
          deals = deals.filter(d => typeof d.comments === 'number' && d.comments > 15);
          break;
        case 'hot':
          deals = deals.filter(d => typeof d.temperature === 'number' && d.temperature > 100);
          break;
        default:
          break;
      }
    }

    // Sort by price ascending as requested
    deals.sort((a, b) => (a.price || 0) - (b.price || 0));

    const limitedResults = deals.slice(0, limit);

    res.json({
      limit,
      total: deals.length,
      results: limitedResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to search deals'});
  }
});

/**
 * GET /sales/search
 * Search for specific sales on Vinted
 * Query params:
 *   - limit: number of sales to return (default 12)
 *   - legoSetId: lego set id to search for (required)
 *
 * Results are sorted by published date in descending order
 */
app.get('/sales/search', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 12;
    const legoSetId = req.query.legoSetId;

    if (!legoSetId) {
      return res.status(400).json({error: 'Missing legoSetId parameter'});
    }

    console.log(`🔍 Searching Vinted sales for lego set ${legoSetId}...`);

    let rawSales = [];

    try {
      const allSales = await loadSalesFromFile();
      rawSales = allSales[String(legoSetId)] || [];
      console.log(`📄 ${rawSales.length} Vinted sales loaded from JSON for set ${legoSetId}`);
    } catch (e) {
      console.warn('vinted-sales.json not available or invalid, falling back to live scrape');
      rawSales = await vinted.scrape(legoSetId) || [];
    }

    // Keep only sales that actually mention the lego set id in the title
    const filtered = rawSales.filter(sale =>
      typeof sale.title === 'string' &&
      sale.title.toLowerCase().includes(String(legoSetId).toLowerCase())
    );

    filtered.sort((a, b) => (b.published || 0) - (a.published || 0));

    const limitedResults = filtered.slice(0, limit);

    res.json({
      limit,
      total: filtered.length,
      results: limitedResults
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to search sales'});
  }
});

export default app;
