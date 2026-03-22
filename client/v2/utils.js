'use strict'

const getIdsFromDeals = (deals) => {
  return [...new Set(deals.map(deal => deal.id))]
}

const percentile = (arr, p) => {
  if (arr.length === 0) return 0
  arr.sort((a, b) => a - b)
  const index = Math.floor(arr.length * p)
  return arr[index]
}

const average = (arr) => {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

const fmt = (n) => n ? n.toFixed(2) + '€' : '—'
