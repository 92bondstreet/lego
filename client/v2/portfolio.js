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
let currentSales = [];

// favorites stored in localStorage
let favorites = JSON.parse(localStorage.getItem('lego-favorites') || '[]');

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectSort = document.querySelector('#sort-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals = document.querySelector('#deals');
const sectionSales = document.querySelector('#sales');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanAvgPrice = document.querySelector('#avgPrice');
const spanP5 = document.querySelector('#p5Price');
const spanP25 = document.querySelector('#p25Price');
const spanP50 = document.querySelector('#p50Price');
const spanLifetime = document.querySelector('#lifetime');

// filter selectors
const filterDiscount = document.querySelector('#filter-discount');
const filterCommented = document.querySelector('#filter-commented');
const filterHot = document.querySelector('#filter-hot');
const filterFavorite = document.querySelector('#filter-favorite');

let activeFilter = null;

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
 * @param  {Number}  [size=6] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Fetch Vinted sales for a given lego set id
 * @param  {String} id - lego set id
 * @return {Array}
 */
const fetchSales = async (id) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/sales?id=${id}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return [];
    }

    return body.data.result;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// ── Favorites helpers ──

const toggleFavorite = (uuid) => {
  const index = favorites.indexOf(uuid);
  if (index === -1) {
    favorites.push(uuid);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem('lego-favorites', JSON.stringify(favorites));
};

const isFavorite = (uuid) => favorites.includes(uuid);

// ── Sort / Filter helpers ──

const applySort = (deals) => {
  const sort = selectSort.value;
  const sorted = [...deals];
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'date-asc':
      sorted.sort((a, b) => new Date(b.published) - new Date(a.published));
      break;
    case 'date-desc':
      sorted.sort((a, b) => new Date(a.published) - new Date(b.published));
      break;
  }
  return sorted;
};

const getFilteredDeals = () => {
  let deals = [...currentDeals];

  switch (activeFilter) {
    case 'discount':
      deals = deals.filter(deal => deal.discount >= 50);
      deals.sort((a, b) => b.discount - a.discount);
      break;
    case 'commented':
      deals = deals.filter(deal => deal.comments > 15);
      deals.sort((a, b) => b.comments - a.comments);
      break;
    case 'hot':
      deals = deals.filter(deal => deal.temperature > 100);
      deals.sort((a, b) => b.temperature - a.temperature);
      break;
    case 'favorite':
      deals = deals.filter(deal => isFavorite(deal.uuid));
      break;
    default:
      break;
  }

  return applySort(deals);
};

// ── Percentile helper ──

const percentile = (arr, p) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};

// ── Render functions ──

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.classList.add('deals-container');

  const template = deals
    .map(deal => {
      const fav = isFavorite(deal.uuid);
      const discountLabel = deal.discount ? `<span class="deal-discount">-${Math.round(deal.discount)}%</span>` : '';
      return `
      <div class="deal ${fav ? 'favorite' : ''}" id="${deal.uuid}">
        <button class="fav-btn" data-uuid="${deal.uuid}">${fav ? '❤️' : '🤍'}</button>
        <span class="deal-id">Set ${deal.id}</span>
        <a href="${deal.link}" target="_blank" rel="noopener">${deal.title}</a>
        <span class="deal-price">${deal.price}€ ${discountLabel}</span>
        <div class="deal-meta">
          <span>🔥 ${deal.temperature}°</span>
          <span>💬 ${deal.comments}</span>
        </div>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);

  // attach favorite button listeners
  sectionDeals.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      toggleFavorite(e.currentTarget.dataset.uuid);
      renderDeals(getFilteredDeals());
    });
  });
};

/**
 * Render Vinted sales
 * @param {Array} sales
 */
const renderSales = (sales) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.classList.add('sales-container');

  if (sales.length === 0) {
    div.innerHTML = '<p>No sales found for this set.</p>';
  } else {
    const template = sales
      .map(sale => {
        const price = typeof sale.price === 'object' ? parseFloat(sale.price.amount) : parseFloat(sale.price);
        return `
        <div class="sale">
          <a href="${sale.link}" target="_blank" rel="noopener">${sale.title}</a>
          <span class="sale-price">${price.toFixed(2)}€</span>
        </div>
      `;
      })
      .join('');
    div.innerHTML = template;
  }

  fragment.appendChild(div);
  sectionSales.innerHTML = '<h2>Vinted Sales</h2>';
  sectionSales.appendChild(fragment);
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
 * @param  {Array} deals
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id =>
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render deal indicators
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbDeals.innerHTML = count;
};

/**
 * Render sales indicators (count, avg, p5, p25, p50, lifetime)
 * @param {Array} sales
 */
const renderSalesIndicators = (sales) => {
  spanNbSales.innerHTML = sales.length;

  if (sales.length === 0) {
    spanAvgPrice.innerHTML = '-';
    spanP5.innerHTML = '-';
    spanP25.innerHTML = '-';
    spanP50.innerHTML = '-';
    spanLifetime.innerHTML = '-';
    return;
  }

  const prices = sales.map(s => typeof s.price === 'object' ? parseFloat(s.price.amount) : parseFloat(s.price)).filter(p => !isNaN(p));

  if (prices.length === 0) {
    spanAvgPrice.innerHTML = '-';
    spanP5.innerHTML = '-';
    spanP25.innerHTML = '-';
    spanP50.innerHTML = '-';
    spanLifetime.innerHTML = '-';
    return;
  }

  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  spanAvgPrice.innerHTML = avg.toFixed(2) + '€';
  spanP5.innerHTML = percentile(prices, 5).toFixed(2) + '€';
  spanP25.innerHTML = percentile(prices, 25).toFixed(2) + '€';
  spanP50.innerHTML = percentile(prices, 50).toFixed(2) + '€';

  // Lifetime = difference between most recent and oldest sale (published is Unix timestamp in seconds)
  const dates = sales
    .filter(s => s.published)
    .map(s => s.published * 1000)
    .filter(d => !isNaN(d));

  if (dates.length >= 2) {
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffDays = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24));
    spanLifetime.innerHTML = diffDays + ' days';
  } else {
    spanLifetime.innerHTML = '-';
  }
};

/**
 * Update filter button active styles
 */
const updateFilterStyles = () => {
  [filterDiscount, filterCommented, filterHot, filterFavorite].forEach(el => {
    el.classList.remove('active');
  });
  const map = {
    discount: filterDiscount,
    commented: filterCommented,
    hot: filterHot,
    favorite: filterFavorite
  };
  if (activeFilter && map[activeFilter]) {
    map[activeFilter].classList.add('active');
  }
};

const render = (deals, pagination) => {
  renderDeals(applySort(deals));
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
  updateFilterStyles();
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  activeFilter = null;
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Page changed
 */
selectPage.addEventListener('change', async (event) => {
  activeFilter = null;
  const deals = await fetchDeals(parseInt(event.target.value), parseInt(selectShow.value));
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Sort changed
 */
selectSort.addEventListener('change', () => {
  renderDeals(getFilteredDeals());
});

/**
 * Filter deals with discount >= 50%
 */
filterDiscount.addEventListener('click', () => {
  activeFilter = activeFilter === 'discount' ? null : 'discount';
  renderDeals(getFilteredDeals());
  updateFilterStyles();
});

/**
 * Filter deals with > 15 comments
 */
filterCommented.addEventListener('click', () => {
  activeFilter = activeFilter === 'commented' ? null : 'commented';
  renderDeals(getFilteredDeals());
  updateFilterStyles();
});

/**
 * Filter hot deals (temperature > 100)
 */
filterHot.addEventListener('click', () => {
  activeFilter = activeFilter === 'hot' ? null : 'hot';
  renderDeals(getFilteredDeals());
  updateFilterStyles();
});

/**
 * Filter favorite deals
 */
filterFavorite.addEventListener('click', () => {
  activeFilter = activeFilter === 'favorite' ? null : 'favorite';
  renderDeals(getFilteredDeals());
  updateFilterStyles();
});

/**
 * Lego set id changed → fetch and display Vinted sales + indicators
 */
selectLegoSetIds.addEventListener('change', async (event) => {
  const id = event.target.value;
  currentSales = await fetchSales(id);
  renderSales(currentSales);
  renderSalesIndicators(currentSales);
});

/**
 * DOMContentLoaded — initial load
 */
document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

  // auto-load sales for the first lego set id
  if (selectLegoSetIds.value) {
    currentSales = await fetchSales(selectLegoSetIds.value);
    renderSales(currentSales);
    renderSalesIndicators(currentSales);
  }
});
