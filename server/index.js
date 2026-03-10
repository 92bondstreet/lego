import parseDomain from 'parse-domain';
import { requireAll } from 'require-all';

const websites = requireAll(`${__dirname}/websites`);


module.exports = async link => {
  const {'domain': website} = parseDomain(link);
  const deals = await websites[website].scrape(link);

  return deals;
};
