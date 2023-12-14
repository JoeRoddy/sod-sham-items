// @ts-nocheck
import cheerio from 'cheerio';

const STAT_MAP = {
  armor: 'armor',
  dodge: 'dodge',
  defense: 'def',
  block: 'blockpct',
  'attack power': 'mleatkpwr',
  'mana every 5 sec.': 'manargn',
  'health every 5 sec.': 'healthrgn',
  stamina: 'sta',
  strength: 'str',
  intellect: 'int',
  spirit: 'spi',
  agility: 'agi',
  'healing spells': 'splheal',
  'damage spells': 'spldmg',
  'fire spell damage': 'firsplpwr',
  'shadow spell damage': 'shasplpwr',
  'frost spell damage': 'frosplpwr',
  'nature spell damage': 'natsplpwr',
  'arcane spell damage': 'arcsplpwr',
  'holy spell damage': 'holsplpwr',
  'fire resistance': 'firres',
  'shadow resistance': 'shares',
  'frost resistance': 'frores',
  'nature resistance': 'natres',
  'arcane resistance': 'arcres',
};

export const parseRandomEnchantmentsFromPage = (html: string) => {
  const $ = cheerio.load(html);
  const randomEnchantments: any[] = [];
  const deleteCharAt = (str: string, index: number) =>
    str.slice(0, index) + str.slice(index + 1);
  const unknownStats = [];

  $('.random-enchantments ul li').each((index, element) => {
    const enchantment = {};

    enchantment.name = $(element).find('span.q2').text().trim();
    enchantment.chance = $(element).find('small.q0').text().trim();
    enchantment.stats = [];

    $(element)
      .find('div')
      .contents()
      .filter((_, node) => {
        return node.nodeType === 3 && node.data.trim() !== '';
      })
      .each((_, node) => {
        enchantment.stats = node.data
          .split(',')
          .map((n) => n.trim())
          .map((n) => {
            // "+(3 - 4) Spirit" => +4 Spirit
            const dashIndex = n.indexOf(' - ');
            if (dashIndex > 0) {
              const afterDash = n.substring(dashIndex + 3);
              return deleteCharAt(afterDash, 1);
            } else {
              return n.slice(1);
            }
          })
          .reduce((acc, next) => {
            const [val, ...statArr] = next.split(' ');
            const stat = statArr.join(' ').toLowerCase();
            const statKey = STAT_MAP[stat];
            if (!statKey) {
              console.log(`unknown stat: `, stat);
              unknownStats.push(stat);
              return acc;
            }
            return {
              ...acc,
              [statKey]: val,
            };
          }, {});
      });

    randomEnchantments.push(enchantment);
  });

  return [randomEnchantments, unknownStats];
};
