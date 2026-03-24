// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


/**
 * 
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = deals => {
    const ids = deals.map(deal => deal.id || (deal.uuid ? deal.uuid.substring(0, 8) : null)).filter(id => id);
    return [...new Set(ids)];
}
