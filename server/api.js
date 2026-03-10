import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dealabs from './websites/dealabs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

app.use(cors());

// Serve client v2 static files
app.use(express.static(path.join(__dirname, '..', 'client', 'v2')));

// Cache for scraped deals
let cachedDeals = [];
let lastScrapeTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Client available at http://localhost:${PORT}`);
});
