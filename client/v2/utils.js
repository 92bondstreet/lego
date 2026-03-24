// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


/**
 * 
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = deals => {
    const ids = deals.map(deal => {
        if (deal.id) return deal.id;
        // Try to find a 4-digit or 5-digit number in the title (common for Lego sets)
        // Ensure it's not part of another word
        const match = deal.title.match(/(?<!\d)\d{4,5}(?!\d)/);
        return match ? match[0] : null;
    }).filter(id => id);
    return [...new Set(ids)];
}
