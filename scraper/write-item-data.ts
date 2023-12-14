import fs from 'fs';
import getItemHtml from './get-item-html';
const itemId = process.argv[2];

(async () => {
  const data = await getItemHtml(itemId);
  fs.writeFileSync(`./scraper/data/${itemId}.html`, data);
})();
