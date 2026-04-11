'use strict'

// ── STATE ──
let currentDeals = []
let currentPagination = {}
let activeFilters = []
let favorites = JSON.parse(localStorage.getItem('legoFavorites') || '[]')

const API = 'https://legoserverdzb.vercel.app'

// ── ELEMENTS ──
const selectShow   = document.querySelector('#show-select')
const selectPage   = document.querySelector('#page-select')
const selectSort   = document.querySelector('#sort-select')
const selectSetIds = document.querySelector('#lego-set-id-select')
const sectionDeals = document.querySelector('#deals')
const sectionSales = document.querySelector('#sales')
const loadingBar   = document.querySelector('#loadingBar')

// ── HELPERS ──
const setLoading = (on) => loadingBar.classList.toggle('active', on)

const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result
  currentPagination = meta
}

// ── FETCH ──
/*const fetchDeals = async (page = 1, size = 6) => {
  setLoading(true)
  try {
    const res  = await fetch(`${API}/deals/search?page=${page}&size=${size}`)
    const body = await res.json()
    if (!body.success) return null
    return body.data
  } finally {
    setLoading(false)
  }
}*/ 

const fetchDeals = async (page = 1, size = 6) => {
  setLoading(true)
  try {
    const res = await fetch(`${API}/deals/search?page=${page}&size=${size}`)
    const body = await res.json()
    // Your API returns {limit, total, results} directly
    return {
      result: body.results,
      meta: {
        currentPage: page,
        pageCount: Math.ceil(body.total / size),
        count: body.total
      }
    }
  } finally {
    setLoading(false)
  }
}

/*const fetchSales = async (id) => {
  setLoading(true)
  try {
    const res  = await fetch(`${API}/sales/search?legoSetId=${id}`)
    const body = await res.json()
    if (!body.success) return []
    return body.data
  } finally {
    setLoading(false)
  }
}*/ 

const fetchSales = async (id) => {
  setLoading(true)
  try {
    const res  = await fetch(`${API}/sales/search?legoSetId=${id}`)
    const body = await res.json()

    // Your API returns { limit, total, results }
    return body.results || []
    
  } finally {
    setLoading(false)
  }
}

// ── FAVORITES ──
const toggleFavorite = (uuid) => {
  if (favorites.includes(uuid))
    favorites = favorites.filter(f => f !== uuid)
  else
    favorites.push(uuid)

  localStorage.setItem('legoFavorites', JSON.stringify(favorites))
  renderDeals(applyFilters())
}

// ── RENDER DEALS ──
const renderDeals = (deals) => {
  sectionDeals.innerHTML = ''

  if (!deals.length) {
    sectionDeals.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧱</div>
        No deals match your filters.
      </div>`
    return
  }

  deals.forEach((deal, i) => {
    const div    = document.createElement('div')
    div.className = 'deal'
    div.style.animationDelay = `${i * 0.04}s`

    const isFav    = favorites.includes(deal.uuid)
    const discount = deal.discount
      ? `<span class="deal-discount-badge">-${Math.round(deal.discount)}%</span>`
      : ''

    const imgSrc = deal.photo || deal.image || deal.thumbnail || null
    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${deal.title}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=\\'deal-image-placeholder\\'>🧱</div>'">`
      : `<div class="deal-image-placeholder">🧱</div>`

    div.innerHTML = `
      <div class="deal-image-wrap">
        ${imgHtml}
        ${discount}
        <button class="deal-fav ${isFav ? 'active' : ''}" data-id="${deal.uuid}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
      <div class="deal-body">
        <div class="deal-id">ID: ${deal.id}</div>
        <div class="deal-title">${deal.title}</div>
        <div class="deal-meta">
          <span class="deal-price">${deal.price}€</span>
          <a class="deal-link" href="${deal.link}" target="_blank">Open →</a>
        </div>
      </div>
    `

    sectionDeals.appendChild(div)
  })

  document.querySelectorAll('.deal-fav').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault()
      toggleFavorite(e.currentTarget.dataset.id)
    }
  })
}

// ── RENDER SALES ──
const renderSales = (sales) => {
  sectionSales.innerHTML = ''

  if (!sales.length) {
    sectionSales.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛍️</div>
        No Vinted sales found for this set.
      </div>`
    return
  }

  sales.forEach((sale, i) => {
    const div     = document.createElement('div')
    div.className = 'sale'
    div.style.animationDelay = `${i * 0.04}s`

    const imgSrc = sale.photo || sale.image || sale.thumbnail || null
    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${sale.title || 'Sale'}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=\\'sale-image-placeholder\\'>🛍️</div>'">`
      : `<div class="sale-image-placeholder">🛍️</div>`

    div.innerHTML = `
      <div class="sale-image-wrap">${imgHtml}</div>
      <div class="sale-body">
        <div class="sale-title">${sale.title || 'Vinted item'}</div>
        <div class="sale-footer">
          <span class="sale-price">${sale.price}€</span>
          ${sale.link ? `<a class="sale-link" href="${sale.link}" target="_blank">View →</a>` : ''}
        </div>
      </div>
    `

    sectionSales.appendChild(div)
  })
}

// ── RENDER PAGINATION ──
const renderPagination = (pagination) => {
  const { currentPage, pageCount } = pagination

  // Keep hidden select in sync (used by change listeners)
  let options = ''
  for (let i = 1; i <= pageCount; i++)
    options += `<option value="${i}">${i}</option>`
  selectPage.innerHTML = options
  selectPage.value = currentPage

  // Arrow buttons
  const prevBtn = document.querySelector('#prevPage')
  const nextBtn = document.querySelector('#nextPage')
  if (prevBtn) prevBtn.disabled = currentPage <= 1
  if (nextBtn) nextBtn.disabled = currentPage >= pageCount

  // Page number buttons — show at most 7 slots with ellipsis
  const container = document.querySelector('#pageNumbers')
  if (!container) return
  container.innerHTML = ''

  const pages = buildPageRange(currentPage, pageCount)

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span')
      span.className = 'page-ellipsis'
      span.textContent = '…'
      container.appendChild(span)
    } else {
      const btn = document.createElement('button')
      btn.className = 'page-num' + (p === currentPage ? ' active' : '')
      btn.textContent = p
      btn.addEventListener('click', async () => {
        const data = await fetchDeals(p, parseInt(selectShow.value))
        if (!data) return
        setCurrentDeals(data)
        render()
        document.querySelector('#deals').scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      container.appendChild(btn)
    }
  })
}

// Returns array like [1, 2, 3, '...', 12] depending on current position
const buildPageRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

// ── RENDER INDICATORS ──
const renderIndicators = (pagination, sales = []) => {
  document.querySelector('#nbDeals').innerText = pagination.count || 0
  document.querySelector('#nbSales').innerText = sales.length

  const prices = sales.map(s => parseFloat(s.price)).filter(Boolean)

  document.querySelector('#avgPrice').innerText = prices.length ? fmt(average(prices))              : '—'
  document.querySelector('#p5Price').innerText  = prices.length ? fmt(percentile([...prices], 0.05)): '—'
  document.querySelector('#p25Price').innerText = prices.length ? fmt(percentile([...prices], 0.25)): '—'
  document.querySelector('#p50Price').innerText = prices.length ? fmt(percentile([...prices], 0.50)): '—'

  // Lifetime: days between oldest and newest sale
  if (sales.length >= 2) {
    const dates = sales
      .map(s => new Date(s.published || s.publishedAt))
      .filter(d => !isNaN(d))

    if (dates.length >= 2) {
      const days = Math.round((Math.max(...dates) - Math.min(...dates)) / 86400000)
      document.querySelector('#lifetime').innerText = days + ' days'
    } else {
      document.querySelector('#lifetime').innerText = '— days'
    }
  } else {
    document.querySelector('#lifetime').innerText = '— days'
  }

  document.querySelector('#headerDealsCount').innerText = `${pagination.count || 0} deals loaded`
}

// ── RENDER SET IDS ──
const renderLegoSetIds = (deals) => {
  const ids = getIdsFromDeals(deals)
  selectSetIds.innerHTML = ids.map(id => `<option value="${id}">${id}</option>`).join('')
}

// ── FILTERS ──
const applyFilters = () => {
  let deals = [...currentDeals]

  if (activeFilters.includes('discount'))  deals = deals.filter(d => d.discount    > 50)
  if (activeFilters.includes('comments'))  deals = deals.filter(d => d.comments    > 15)
  if (activeFilters.includes('hot'))       deals = deals.filter(d => d.temperature > 100)
  if (activeFilters.includes('favorites')) deals = deals.filter(d => favorites.includes(d.uuid))

  return sortDeals(deals)
}

const sortDeals = (deals) => {
  switch (selectSort.value) {
    case 'price-asc':  deals.sort((a, b) => a.price - b.price); break
    case 'price-desc': deals.sort((a, b) => b.price - a.price); break
    case 'date-desc':  deals.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)); break
    case 'date-asc':   deals.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)); break
  }
  return deals
}

// ── FILTER BUTTONS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter
    btn.classList.toggle('active')

    if (activeFilters.includes(f))
      activeFilters = activeFilters.filter(x => x !== f)
    else
      activeFilters.push(f)

    renderDeals(applyFilters())
  })
})

// ── EVENT LISTENERS ──
document.addEventListener('click', async (e) => {
  if (e.target.id === 'prevPage') {
    const prev = parseInt(selectPage.value) - 1
    if (prev < 1) return
    const data = await fetchDeals(prev, parseInt(selectShow.value))
    if (!data) return
    setCurrentDeals(data)
    render()
    document.querySelector('#deals').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  if (e.target.id === 'nextPage') {
    const next = parseInt(selectPage.value) + 1
    const data = await fetchDeals(next, parseInt(selectShow.value))
    if (!data) return
    setCurrentDeals(data)
    render()
    document.querySelector('#deals').scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
selectShow.addEventListener('change', async (e) => {
  const data = await fetchDeals(1, parseInt(e.target.value))
  if (!data) return
  setCurrentDeals(data)
  render()
})

selectPage.addEventListener('change', async (e) => {
  const data = await fetchDeals(parseInt(e.target.value), parseInt(selectShow.value))
  if (!data) return
  setCurrentDeals(data)
  render()
})

selectSort.addEventListener('change', () => {
  renderDeals(applyFilters())
})

selectSetIds.addEventListener('change', async (e) => {
  const sales = await fetchSales(e.target.value)
  renderSales(sales)
  renderIndicators(currentPagination, sales)
})

// ── MAIN RENDER ──
const render = async () => {
  renderDeals(applyFilters())
  renderPagination(currentPagination)
  renderLegoSetIds(currentDeals)

  // Auto-load sales for the currently selected set
  if (selectSetIds.value) {
    const sales = await fetchSales(selectSetIds.value)
    renderSales(sales)
    renderIndicators(currentPagination, sales)
  } else {
    renderIndicators(currentPagination, [])
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
  const data = await fetchDeals()
  if (!data) return
  setCurrentDeals(data)
  render()
})
