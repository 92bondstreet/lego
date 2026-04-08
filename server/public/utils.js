// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


/**
 * 
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = deals => {
    return deals.map(deal => deal.id)
}

/**
 * Filter Vinted sales to only show those matching the given lego set id
 * @param {Array} sales - list of vinted sales
 * @param {string} id - lego set id to filter by
 * @returns {Array} filtered sales
 */
const filterSalesByLegoId = (sales, id) => {
    return sales.filter(sale => {
        // Match lego set id anywhere in the title
        return sale.title && sale.title.match(new RegExp(`\\b${id}\\b`, 'i'));
    });
}
