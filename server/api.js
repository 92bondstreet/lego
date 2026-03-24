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
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/deals/search', (request, response) => {
  try {
    let limit = parseInt(request.query.limit) || 12;
    const maxPrice = parseFloat(request.query.price);
    const date = request.query.date;
    const filterBy = request.query.filterBy;
    
    let results = [...DEALS];

    if (!isNaN(maxPrice)) {
      results = results.filter(deal => deal.price <= maxPrice);
    }
    if (date) {
      // Assuming published is a timestamp, we can format or just do a simple match
      // date is "YYYY-MM-DD"
      results = results.filter(deal => {
        if (!deal.published) return false;
        const d = new Date(deal.published * 1000).toISOString().split('T')[0];
        return d === date;
      });
    }
    if (filterBy) {
      if (filterBy === 'best-discount') {
        results = results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      } else if (filterBy === 'most-commented') {
        results = results.sort((a, b) => (b.comments || 0) - (a.comments || 0));
      }
    }

    // Sort by price ascending as default or always as requested
    if (filterBy !== 'best-discount' && filterBy !== 'most-commented') {
       results.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

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

app.listen(PORT, () => {
  // when we start the server we load available json files
  try {
    SALES = JSON.parse(
      readFileSync(path.join(__dirname, 'sources', 'vinted.json'), 'utf8')
    );
  } catch (error) {
    console.warn(`⚠️  Vinted: ${error.message}`);
  }

  try {
    DEALS = JSON.parse(
      readFileSync(path.join(__dirname, 'websites', 'dealabs.json'), 'utf8')
    );
  } catch (error) {
    console.warn(`⚠️  Dealabs: ${error.message}`);
  }
})

console.log(`📡 Running on port ${PORT}`);
