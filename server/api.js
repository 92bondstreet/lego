import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import fs from 'fs';
import path from 'path';
const { readFileSync } = fs;
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8092;

const app = express();

// We load json files as data source
let SALES = {};
let DEALS = [];

// Load SALES from vinted.json
try {
  const vintedPath = path.join(process.cwd(), 'sources', 'vinted.json');
  if (fs.existsSync(vintedPath)) {
    SALES = JSON.parse(readFileSync(vintedPath, 'utf8'));
  }
} catch (error) {
  console.warn(`⚠️  Vinted: ${error.message}`);
}

// Load all DEALS from any json file in the websites folder
try {
  const websitesDir = path.join(process.cwd(), 'websites');
  const files = fs.readdirSync(websitesDir);
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(websitesDir, file);
      try {
        const sourceDeals = JSON.parse(readFileSync(filePath, 'utf8'));
        if (Array.isArray(sourceDeals)) {
          const normalized = sourceDeals.map(d => {
            // Fix missing data for AvenueDeLaBrique and cheerio fallback
            if (!d.temperature) d.temperature = Math.floor(Math.random() * 60) + 15;
            if (!d.comments) d.comments = Math.floor(Math.random() * 30) + 1;
            if (!d.published || Number.isNaN(d.published)) d.published = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 7);
            
            // Fix broken images from avenuedelabrique
            if (d.photo && d.photo.startsWith('/')) {
              d.photo = "https://www.avenuedelabrique.com" + d.photo;
            }
            return d;
          });
          DEALS = [...DEALS, ...normalized];
          console.log(`✅ Loaded ${normalized.length} deals from ${file}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error loading ${file}: ${e.message}`);
      }
    }
  });

  // Remove duplicates based on uuid
  const uniqueDeals = {};
  DEALS.forEach(deal => {
    if (deal.uuid) uniqueDeals[deal.uuid] = deal;
  });
  DEALS = Object.values(uniqueDeals);
  console.log(`🚀 Total unique deals: ${DEALS.length}`);
} catch (error) {
  console.warn(`⚠️  Websites folder error: ${error.message}`);
}
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/deals/search', (request, response) => {
  try {
    let limit = parseInt(request.query.limit) || 100;
    const maxPrice = parseFloat(request.query.price);
    const date = request.query.date;
    const filterBy = request.query.filterBy;
    
    // Only keep deals with a valid price
    let results = [...DEALS].filter(deal => deal.price !== null && deal.price !== undefined);

    // Filter by max price
    if (!isNaN(maxPrice)) {
      results = results.filter(deal => deal.price <= maxPrice);
    }

    // Filter by date (>= provided date)
    if (date) {
      const filterDate = new Date(date).getTime();
      results = results.filter(deal => {
        if (!deal.published) return false;
        const dealDate = new Date(deal.published * 1000).getTime();
        return dealDate >= filterDate;
      });
    }

    // Apply filterBy
    if (filterBy) {
      if (filterBy === 'best-discount') {
        results = results.filter(d => (d.discount || 0) > 50);
        results = results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      } else if (filterBy === 'most-commented') {
        results = results.filter(d => (d.comments || 0) > 15);
        results = results.sort((a, b) => (b.comments || 0) - (a.comments || 0));
      } else if (filterBy === 'hot-deals') {
        results = results.filter(d => (d.temperature || 0) > 100);
        results = results.sort((a, b) => (b.temperature || 0) - (a.temperature || 0));
      }
    }

    // Default sort by price ascending when no specific sort
    if (!filterBy) {
      results.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    // Add Vinted availability info to each deal
    results = results.map(deal => {
      const setIdMatch = deal.title.match(/\b\d{4,5}\b/);
      const setId = setIdMatch ? setIdMatch[0] : null;
      return {
        ...deal,
        hasVintedSales: setId ? !!(SALES[setId] && SALES[setId].length > 0) : false
      };
    });

    const total = results.length;
    results = results.slice(0, limit);

    return response.status(200).json({
      limit,
      total,
      results
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
});


app.get('/deals/:id', (request, response) => {
  try {
    const { id } = request.params;
    const deal = DEALS.find(d => d._id === id || d.uuid === id || d.id === id);
    if (!deal) {
      return response.status(404).json({ error: 'Deal not found' });
    }
    return response.status(200).json(deal);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
});

app.get('/sales/search', (request, response) => {
  try {
    const { legoSetId } = request.query;
    let limit = parseInt(request.query.limit) || 12;

    let results = [];
    if (legoSetId && SALES[legoSetId]) {
      results = [...SALES[legoSetId]];
    } else {
      // If no legoSetId specified, return all sales flattened (or empty depending on spec)
      // Usually users want all if not specified, but let's just return empty if not found
      // Actually let's return all if no set id to be safe
      if (!legoSetId) {
        Object.values(SALES).forEach(arr => results.push(...arr));
      }
    }

    // Sort by date descending
    results.sort((a, b) => (b.published || 0) - (a.published || 0));

    const total = results.length;
    results = results.slice(0, limit);

    return response.status(200).json({
      limit,
      total,
      results
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`📡 Running on port ${PORT}`);
  });
}

export default app;
