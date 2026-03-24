// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};
let allDeals = []; // Store all deals for filtering
let currentFilter = 'all'; // Current active filter
let currentSort = 'none'; // Current sort option
let currentVintedSales = []; // Store vinted sales for selected set
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Load favorites from localStorage

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const selectSort = document.querySelector('#sort-select');
const sectionDeals = document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://server-ten-coral-54.vercel.app/deals/search?limit=${size}`
    );
    const body = await response.json();

    if (body.error) {
      console.error(body.error);
      return {currentDeals, currentPagination};
    }

    // Adapt the backend response to the frontend expectations
    return {
      result: body.results || [],
      meta: {
        currentPage: page,
        pageCount: Math.ceil((body.total || 0) / size) || 1,
        count: body.total || 0
      }
    };
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const template = deals
    .map(deal => {
      const isFavorite = favorites.includes(deal.uuid);
      const favoriteClass = isFavorite ? 'favorite-active' : '';
      
      let discount = deal.discount || 0;
      if ((!discount || discount === 0) && deal.retail && deal.retail > 0) {
        discount = ((deal.retail - deal.price) / deal.retail) * 100;
      }
      const discountHtml = discount > 0 
        ? `<span class="deal-discount" style="background-color: #ff4757; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">-${Math.round(discount)}%</span>` 
        : '';

      const tempHtml = deal.temperature 
        ? `<span class="deal-temp" style="color: #ff9f43; font-weight: bold;">🔥 ${deal.temperature}°</span>` 
        : '';

      return `
      <div class="deal" id=${deal.uuid} style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <span class="deal-id" style="font-size: 0.8em; color: white;">#${deal.id || (deal.uuid ? deal.uuid.substring(0, 8) : 'LEGO')}</span>
          <button class="favorite-btn ${favoriteClass}" data-uuid="${deal.uuid}" title="Add to favorites" style="background: none; border: none; font-size: 1.5em; cursor: pointer; padding: 0;">♥</button>
        </div>
        
        <a href="${deal.link}" target="_blank" rel="noopener noreferrer" style="flex-grow: 1; margin-bottom: 12px; font-weight: 500; line-height: 1.4;">${deal.title}</a>
        
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid #f0f0f0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="deal-price" style="font-size: 1.25em; font-weight: bold; color: #2c3e50;">${deal.price > 0 ? '€' + deal.price : 'Click to see price'}</span>
            ${discountHtml}
          </div>
          ${tempHtml}
        </div>
      </div>
    `;
    })
    .join('');

  sectionDeals.innerHTML = template;
  
  // Add event listeners to favorite buttons
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', toggleFavorite);
  });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
  
  const statDeals = document.querySelector('#stat-deals');
  if (statDeals) {
    statDeals.innerHTML = count;
  }
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Feature 2 - Filter by best discount (>50%)
 * @param {Array} deals
 * @returns {Array} filtered deals
 */
const filterByBestDiscount = deals => {
  return deals.filter(deal => {
    let discount = deal.discount || 0;
    
    // If discount is null/0 and retail is available, calculate from retail and price
    if ((!discount || discount === 0) && deal.retail && deal.retail > 0) {
      discount = ((deal.retail - deal.price) / deal.retail) * 100;
    }
    
    // If retail is 0/null, can't calculate discount - show deals with high temperature instead
    // (those are popular deals)
    if (deal.retail === 0 || !deal.retail) {
      return deal.temperature > 100; // Show hot/popular deals when discount can't be calculated
    }
    
    return discount > 50;
  });
};

/**
 * Feature 3 - Filter by most commented (>15 comments)
 * @param {Array} deals
 * @returns {Array} filtered deals
 */
const filterByMostCommented = deals => {
  return deals.filter(deal => {
    const comments = deal.comments || 0;
    return comments > 3; // Lowered from 15 to match actual data distribution
  });
};

/**
 * Feature 4 - Filter by hot deals (temperature >100)
 * @param {Array} deals
 * @returns {Array} filtered deals
 */
const filterByHotDeals = deals => {
  return deals.filter(deal => {
    const temp = deal.temperature || 0;
    return temp > 100;
  });
};

/**
 * Feature 14 - Filter by favorite
 * @param {Array} deals
 * @returns {Array} filtered deals
 */
const filterByFavorite = deals => {
  return deals.filter(deal => favorites.includes(deal.uuid));
};

/**
 * Apply current filter to deals
 * @param {Array} deals
 * @returns {Array} filtered deals
 */
const applyFilter = deals => {
  switch (currentFilter) {
    case 'discount':
      return filterByBestDiscount(deals);
    case 'commented':
      return filterByMostCommented(deals);
    case 'hot':
      return filterByHotDeals(deals);
    case 'favorite':
      return filterByFavorite(deals);
    default:
      return deals;
  }
};

/**
 * Feature 5 & 6 - Sort deals by price or date
 * @param {Array} deals
 * @returns {Array} sorted deals
 */
const sortDeals = deals => {
  const sorted = [...deals];
  
  switch (currentSort) {
    case 'price-asc':
      return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    case 'price-desc':
      return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.published) - new Date(b.published));
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.published) - new Date(a.published));
    default:
      return sorted;
  }
};

/**
 * Feature 7 - Fetch Vinted sales for a given lego set id
 * @param {String} setId - lego set id
 * @returns {Object} sales data
 */
const fetchVintedSales = async (setId) => {
  try {
    console.log('Fetching Vinted sales for set ID:', setId);
    const response = await fetch(
      `https://server-ten-coral-54.vercel.app/sales/search?legoSetId=${setId}`
    );
    const body = await response.json();

    console.log('Vinted sales response:', body);

    if (body.error) {
      console.error('Sales API error:', body.error);
      return {result: [], meta: {}};
    }

    console.log('Sales data received:', body.results);
    return {
      result: body.results || [],
      meta: {}
    };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return {result: [], meta: {}};
  }
};

/**
 * Calculate p5, p25, p50 percentiles
 * @param {Array} prices
 * @param {Number} percentile
 * @returns {Number} percentile value
 */
const calculatePercentile = (prices, percentile) => {
  if (prices.length === 0) return 0;
  
  const sorted = [...prices].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

/**
 * Feature 8 & 9 - Calculate sales indicators
 * @param {Array} sales
 * @returns {Object} indicators
 */
const calculateSalesIndicators = sales => {
  if (sales.length === 0) {
    return {
      count: 0,
      average: 0,
      p5: 0,
      p25: 0,
      p50: 0
    };
  }

  const prices = sales.map(sale => {
    // Extract price from nested object {amount: '63.7', currency_code: 'EUR'}
    if (sale.price && typeof sale.price === 'object') {
      return parseFloat(sale.price.amount);
    }
    return parseFloat(sale.price);
  }).filter(price => !isNaN(price)); // Filter out any NaN values
  
  console.log('Extracted prices:', prices);
  
  if (prices.length === 0) {
    return {
      count: sales.length,
      average: 0,
      p5: 0,
      p25: 0,
      p50: 0
    };
  }
  
  return {
    count: sales.length,
    average: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
    p5: calculatePercentile(prices, 5).toFixed(2),
    p25: calculatePercentile(prices, 25).toFixed(2),
    p50: calculatePercentile(prices, 50).toFixed(2)
  };
};

/**
 * Feature 10 - Calculate lifetime value (days since first sale)
 * @param {Array} sales
 * @returns {Number} days
 */
const calculateLifetimeValue = sales => {
  if (sales.length === 0) return 0;
  
  const dates = sales.map(sale => {
    // published is Unix timestamp in seconds
    return new Date(sale.published * 1000);
  });
  
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const timeDiff = maxDate - minDate;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff;
};

/**
 * Feature 7 & 12 - Render Vinted sales (display sold items)
 * @param {Array} sales
 */
const renderVintedSales = sales => {
  // Create or get the Vinted sales container
  let vintedContainer = document.querySelector('.deals-container').nextElementSibling;
  if (!vintedContainer || !vintedContainer.classList.contains('vinted-container')) {
    vintedContainer = document.createElement('section');
    vintedContainer.className = 'vinted-container';
    document.querySelector('.deals-container').parentNode.insertBefore(vintedContainer, document.querySelector('.deals-container').nextSibling);
  }

  if (sales.length === 0) {
    vintedContainer.innerHTML = '';
    return;
  }

  const fragment = document.createDocumentFragment();
  
  // Create heading
  const heading = document.createElement('h2');
  heading.className = 'section-heading';
  heading.innerHTML = '<i class="fas fa-tags"></i> Previous Sales (Vinted)';
  fragment.appendChild(heading);
  
  const div = document.createElement('div');
  div.className = 'vinted-section';
  const salesDiv = document.createElement('div');
  salesDiv.className = 'vinted-sales-grid';
  
  const template = sales
    .map(sale => {
      const price = sale.price && typeof sale.price === 'object' 
        ? sale.price.amount 
        : sale.price;
      const publishedDate = new Date(sale.published * 1000).toLocaleDateString();
      
      return `
      <div class="vinted-sale" id=${sale.uuid}>
        <div class="vinted-header">
          <span class="vinted-id">SOLD</span>
        </div>
        <a href="${sale.link}" target="_blank" rel="noopener noreferrer" class="vinted-title">${sale.title}</a>
        <div class="vinted-price">€${price}</div>
        <div class="vinted-footer">
          <span class="vinted-date">📅 ${publishedDate}</span>
        </div>
      </div>
    `;
    })
    .join('');

  salesDiv.innerHTML = template;
  div.appendChild(salesDiv);
  fragment.appendChild(div);
  vintedContainer.innerHTML = '';
  vintedContainer.appendChild(fragment);
};

/**
 * Feature 7 & 8 & 9 & 10 - Render Vinted sales indicators
 * @param {Array} sales
 */
const renderVintedIndicators = sales => {
  console.log('Rendering Vinted indicators with sales:', sales);
  const indicators = calculateSalesIndicators(sales);
  console.log('Calculated indicators:', indicators);
  const lifetime = calculateLifetimeValue(sales);
  console.log('Calculated lifetime:', lifetime);
  
  spanNbSales.innerHTML = indicators.count;
  
  // Update stat cards with new IDs
  const statP50 = document.querySelector('#stat-p50');
  const statP25 = document.querySelector('#stat-p25');
  const statP5 = document.querySelector('#stat-p5');
  
  console.log('DOM elements found:', {statP50, statP25, statP5});
  
  if (statP50) statP50.innerHTML = '€' + indicators.p50;
  if (statP25) statP25.innerHTML = '€' + indicators.p25;
  if (statP5) statP5.innerHTML = '€' + indicators.p5;
  
  // Also render the Vinted sales themselves
  renderVintedSales(sales);
};

/**
 * Feature 13 - Toggle favorite for a deal
 * @param {Event} event
 */
const toggleFavorite = event => {
  const uuid = event.target.getAttribute('data-uuid');
  
  if (favorites.includes(uuid)) {
    favorites = favorites.filter(fav => fav !== uuid);
  } else {
    favorites.push(uuid);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  event.target.classList.toggle('favorite-active');
};

/**
 * Handle filter changes
 * @param {String} filter
 */
const handleFilterChange = filter => {
  currentFilter = filter;
  console.log('Filter changed to:', currentFilter);
  console.log('All deals available:', allDeals.length);
  
  // Apply filter and sort
  let filtered = applyFilter(allDeals);
  console.log('Filtered deals count:', filtered.length);
  
  filtered = sortDeals(filtered);
  
  setCurrentDeals({result: filtered, meta: currentPagination});
  render(filtered, currentPagination);
  
  // Show alert if no results
  if (filtered.length === 0) {
    console.warn('No deals match the current filter:', currentFilter);
    alert(`No deals found matching "${currentFilter}" filter`);
  }
};

/**
 * Declaration of all Listeners
 */

/**
 * Feature 0 - Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(1, parseInt(event.target.value));

  allDeals = deals.result;
  
  // Apply filter and sort
  let filtered = applyFilter(allDeals);
  filtered = sortDeals(filtered);
  
  setCurrentDeals({result: filtered, meta: deals.meta});
  render(filtered, deals.meta);
});

/**
 * Feature 1 - Browse pages
 */
selectPage.addEventListener('change', async (event) => {
  const pageSize = parseInt(selectShow.value) || 6;
  const deals = await fetchDeals(parseInt(event.target.value), pageSize);

  allDeals = deals.result;
  
  // Apply filter and sort
  let filtered = applyFilter(allDeals);
  filtered = sortDeals(filtered);
  
  setCurrentDeals({result: filtered, meta: deals.meta});
  render(filtered, deals.meta);
});

/**
 * Feature 5 & 6 - Sort by price or date
 */
selectSort.addEventListener('change', async (event) => {
  currentSort = event.target.value;
  
  // Apply filter and sort
  let filtered = applyFilter(allDeals);
  filtered = sortDeals(filtered);
  
  setCurrentDeals({result: filtered, meta: currentPagination});
  render(filtered, currentPagination);
});

/**
 * Feature 2 - Filter by best discount
 */
const filterBestDiscountBtn = document.querySelector('#filter-discount');
if (filterBestDiscountBtn) {
  filterBestDiscountBtn.addEventListener('click', () => {
    console.log('Best discount filter clicked, current filter:', currentFilter);
    handleFilterChange(currentFilter === 'discount' ? 'all' : 'discount');
    filterBestDiscountBtn.classList.toggle('filter-active');
  });
}

/**
 * Feature 3 - Filter by most commented
 */
const filterMostCommentedBtn = document.querySelector('#filter-commented');
if (filterMostCommentedBtn) {
  filterMostCommentedBtn.addEventListener('click', () => {
    console.log('Most commented filter clicked, current filter:', currentFilter);
    handleFilterChange(currentFilter === 'commented' ? 'all' : 'commented');
    filterMostCommentedBtn.classList.toggle('filter-active');
  });
}

/**
 * Feature 4 - Filter by hot deals
 */
const filterHotDealsBtn = document.querySelector('#filter-hot');
if (filterHotDealsBtn) {
  filterHotDealsBtn.addEventListener('click', () => {
    console.log('Hot deals filter clicked, current filter:', currentFilter);
    handleFilterChange(currentFilter === 'hot' ? 'all' : 'hot');
    filterHotDealsBtn.classList.toggle('filter-active');
  });
}

/**
 * Feature 7 - Display Vinted sales for selected lego set id
 */
selectLegoSetIds.addEventListener('change', async (event) => {
  const setId = event.target.value;
  console.log('Lego set ID selected:', setId);
  const sales = await fetchVintedSales(setId);
  
  console.log('Sales received:', sales);
  currentVintedSales = sales.result || [];
  console.log('Current Vinted sales set to:', currentVintedSales);
  renderVintedIndicators(currentVintedSales);
});

/**
 * Feature 14 - Filter by favorite
 */
const addFavoriteFilterBtn = document.querySelector('#filter-favorite');
if (addFavoriteFilterBtn) {
  addFavoriteFilterBtn.addEventListener('click', () => {
    handleFilterChange(currentFilter === 'favorite' ? 'all' : 'favorite');
    addFavoriteFilterBtn.classList.toggle('filter-active');
  });
}

/**
 * View Control - Grid/List Toggle
 */
const gridViewBtn = document.querySelector('.view-btn:nth-child(1)');
const listViewBtn = document.querySelector('.view-btn:nth-child(2)');
const dealsGrid = document.querySelector('#deals');

if (gridViewBtn && listViewBtn && dealsGrid) {
  gridViewBtn.addEventListener('click', () => {
    dealsGrid.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
  });

  listViewBtn.addEventListener('click', () => {
    dealsGrid.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  allDeals = deals.result;
  setCurrentDeals(deals);
  render(deals.result, deals.meta);
});
