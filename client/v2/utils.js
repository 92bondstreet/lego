// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


/**
 * 
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = deals => {
    const ids = deals.map(deal => {
        // Extract 4 or 5 digit number from the title (Lego Set ID)
        const match = deal.title.match(/\b\d{4,5}\b/);
        return match ? match[0] : null;
    }).filter(id => id);
    return [...new Set(ids)];
}
