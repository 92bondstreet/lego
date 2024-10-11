const parseDomain = require('parse-domain');
const websites = require('require-all')(`${__dirname}/websites`);

module.exports = async link => {
  const {'domain': website} = parseDomain(link);
  const deals = await websites[website].scrape(link);

  return deals;
};
