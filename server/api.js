import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8092;
const app = express();

// Load data
let SALES = {};
let deals = [];

try {
  SALES = JSON.parse(
    readFileSync(path.join(__dirname, 'sources', 'vinted.json'), 'utf8')
  );
} catch (error) {
  console.warn(`⚠️ SALES not loaded: ${error}`);
}

try {
  deals = JSON.parse(
    readFileSync(path.join(__dirname, 'deals.json'), 'utf8')
  );
} catch (error) {
  console.warn(`⚠️ DEALS not loaded: ${error}`);
}

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Base route
app.get('/', (req, res) => {
  res.json({ ack: true });
});


// ==========================
// GET /deals/search
// ==========================
app.get('/deals/search', (req, res) => {
  let results = [...deals];

  const { limit = 12, price, date } = req.query;

  // filter by price
  if (price) {
    results = results.filter(d => d.price <= Number(price));
  }

  // filter by date
  if (date) {
    const timestamp = new Date(date).getTime() / 1000;
    results = results.filter(d => d.published >= timestamp);
  }

  // sort by price ASC
  results.sort((a, b) => a.price - b.price);

  const limited = results.slice(0, Number(limit));

  res.json({
    limit: Number(limit),
    total: results.length,
    results: limited
  });
});


// ==========================
// GET /deals/:id
// ==========================
app.get('/deals/:id', (req, res) => {
  const { id } = req.params;

  const deal = deals.find(d => d._id === id);

  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }

  res.json(deal);
});



// ==========================
// GET /sales/search
// ==========================
app.get('/sales/search', (req, res) => {
  try {
    const { limit = 12, legoSetId } = req.query;

    let results = [];

    if (legoSetId && SALES[legoSetId]) {
      results = SALES[legoSetId];
    }

    // sort by date DESC
    results.sort((a, b) => b.published - a.published);

    const limited = results.slice(0, Number(limit));

    res.json({
      limit: Number(limit),
      total: results.length,
      results: limited
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      results: []
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`📡 Server running on http://localhost:${PORT}`);
});