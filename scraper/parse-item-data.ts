const cheerio = require('cheerio');

export const parseItemType = (html: string) => {
  const $ = cheerio.load(html);
  const noscriptTag = $('h1.heading-size-1 + noscript').html();
  // cheerio breaks down with this table, just using regex
  const itemTypePattern = /(?<=class="q1">)[^<]*/;
  const slotPattern = /(?<=<table width="100%"><tr><td>)[^<]*/;
  const typeMatch = noscriptTag.match(itemTypePattern);
  const slotMatch = noscriptTag.match(slotPattern);
  const itemType = typeMatch?.at(0)?.trim();
  const itemSlot = slotMatch?.at(0)?.trim();

  return `${itemSlot} ${itemType}`.trim();
};
