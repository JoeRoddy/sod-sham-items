import axios from 'axios';
import fs from 'fs';
import getItemHtml from './get-item-html';
import { parseItemType } from './parse-item-data';
import { parseRandomEnchantmentsFromPage } from './parse-random-enchants';

// wowhead can only return 1k results at a time, at higher level bands, this may need to be broken up into multiple queries

// https://www.wowhead.com/classic/items/armor/min-req-level:1/max-req-level:25/side:2/class:7/quality:2:3:4/type:1:2:-3:-6:8:7:-5:11:-2:-7:-4:6:9:10:0?filter=162:195;2:1;0:0
const getArmorUrl = (minLevel: number, maxLevel: number) =>
  `https://www.wowhead.com/classic/items/armor/min-req-level:${minLevel}/max-req-level:${maxLevel}/side:2/class:7/quality:2:3:4/type:1:2:-3:-6:8:7:-5:11:-2:-7:-4:6:9:10:0?filter=162:195;2:1;0:0`;
// https://www.wowhead.com/classic/items/weapons/min-req-level:1/max-req-level:25/side:2/class:7/quality:2:3:4?filter=162:195;2:1;0:0
const getWeaponUrl = (minLevel: number, maxLevel: number) =>
  `https://www.wowhead.com/classic/items/weapons/min-req-level:${minLevel}/max-req-level:${maxLevel}/side:2/class:7/quality:2:3:4?filter=162:195;2:1;0:0`;

const getWowheadJson = async (url: string): Promise<object> => {
  const { data } = await axios.get(url);
  const regex = /\.addData\(.+/gs;
  const match = data.match(regex)?.at(0);
  const start = match?.indexOf('{');
  const afterStart = match?.slice(start);
  const cleaned = afterStart?.slice(0, afterStart?.indexOf(')'));
  const dataJson = JSON.parse(cleaned || '{}');

  return dataJson;
};

const sleep = (timeout: number) =>
  new Promise((resolve) => setTimeout(() => resolve(''), timeout));

const unknownStatsSet = new Set();
const checkForRandomEnchants = async (itemData: Record<string, any>) => {
  let count = 0;
  for (const itemId of Object.keys(itemData)) {
    count++;
    console.log(count);

    const itemPageHtml = await getItemHtml(itemId);
    itemData[itemId].jsonequip.itemType = parseItemType(itemPageHtml);
    const [randomEnchants, unknownStats] =
      await parseRandomEnchantmentsFromPage(itemPageHtml);
    if (randomEnchants && randomEnchants.length) {
      itemData[itemId] = { ...itemData[itemId], randomEnchants };
    } else if (unknownStats?.length) {
      unknownStats.forEach((stat) => unknownStatsSet.add(stat));
      console.log(`unknown stats for item ${itemId}`, unknownStats);
    }
    await sleep(350);
  }

  return itemData;
};

(async () => {
  const armor = await getWowheadJson(getArmorUrl(1, 25));
  const armorWithEnchants = await checkForRandomEnchants(armor);
  fs.writeFileSync(
    './scraper/data/armor.json',
    JSON.stringify(armorWithEnchants),
  );
  const weapons = await getWowheadJson(getWeaponUrl(1, 25));
  const weaponsWithEnchants = await checkForRandomEnchants(weapons);
  fs.writeFileSync(
    './scraper/data/weapons.json',
    JSON.stringify(weaponsWithEnchants),
  );

  console.log('armor', Object.keys(armor).length);
  console.log('weapons', Object.keys(weapons).length);
  console.log('unknown stats', Array.from(unknownStatsSet));
})();
