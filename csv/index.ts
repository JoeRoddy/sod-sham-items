const armor = require('../scraper/data/armor.json');
const weapons = require('../scraper/data/weapons.json');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

type GearItem = {
  Name: string;
  Phase: number;
  Prerequisite: string;
  Unique: string;
  Set: string;
  Slot: string;
  Type: string;
  Speed: number;
  Low: number;
  High: number;
  Armor: number;
  Health: number;
  Mana: number;
  Strength: number;
  Agility: number;
  Stamina: number;
  Intellect: number;
  Spirit: number;
  AttackPower: number;
  SpellDamage: number;
  SpellHealing: number;
  NatureDamage: number;
  FrostDamage: number;
  FireDamage: number;
  PhysHit: number;
  SpellHit: number;
  PhysCrit: number;
  SpellCrit: number;
  DaggerSkill: number;
  MaceSkill: number;
  AxeSkill: number;
  TwoHandMaceSkill: number;
  TwoHandAxeSkill: number;
  StaffSkill: number;
  MeleeHaste: number;
  SpellHaste: number;
  Mp5: number;
  Hp5: number;
  SpellPen: number;
  Defense: number;
  Dodge: number;
  Parry: number;
  Block: number;
  BlockValue: number;
  ArcaneResistance: number;
  FireResistance: number;
  NatureResistance: number;
  FrostResistance: number;
  ShadowResistance: number;
};

// const armor = fs.readFileSync('./scraper/data/armor.json','utf-8')

const allData = {
  ...armor,
  ...weapons,
};

const COLUMNS = [
  'Name',
  'Phase',
  'Prerequisite',
  'Unique',
  'Set',
  'Slot',
  'Type',
  'Speed',
  'Low',
  'High',
  'Armor',
  'Health',
  'Mana',
  'Strength',
  'Agility',
  'Stamina',
  'Intellect',
  'Spirit',
  'Attack Power',
  'Spell Damage',
  'Spell Healing',
  'Nature Damage',
  'Frost Damage',
  'Fire Damage',
  'Phys Hit',
  'Spell Hit',
  'Phys Crit',
  'Spell Crit',
  'Dagger Skill',
  'Mace Skill',
  'Axe Skill',
  'Two-hand Mace Skill',
  'Two-hand Axe Skill',
  'Staff Skill',
  'Melee Haste',
  'Spell Haste',
  'Mp5',
  'Hp5',
  'Spell Pen',
  'Defense',
  'Dodge',
  'Parry',
  'Block',
  'Block Value',
  'Arcane Resistance',
  'Fire Resistance',
  'Nature Resistance',
  'Frost Resistance',
  'Shadow Resistance',
] as const;

type CsvColumn = (typeof COLUMNS)[number];

const WOWHEAD_STATS = ['agi'] as const;

// type WowheadStat = (typeof WOWHEAD_STATS)[number];
type WowheadStat = any;

const CSV_WOWHEAD_MAP: Record<CsvColumn, WowheadStat> = {
  Name: 'base.name_enus',
  Phase: null,
  Prerequisite: null,
  Set: null,
  Unique: 'maxcount',
  Slot: 'slotbak',
  Type: 'type',
  Speed: 'speed',
  Low: 'dmgmin1',
  High: 'dmgmax1',
  Armor: 'armor',
  Health: 'health',
  Mana: 'mana',
  Strength: 'str',
  Agility: 'agi',
  Stamina: 'sta',
  Intellect: 'int',
  Spirit: 'spi',
  'Attack Power': 'mleatkpwr',
  'Spell Damage': 'spldmg',
  'Spell Healing': 'splheal',
  'Nature Damage': 'natsplpwr',
  'Frost Damage': 'frosplpwr',
  'Fire Damage': 'firsplpwr',
  'Phys Hit': 'mlehitpct',
  'Spell Hit': 'splhitpct',
  'Phys Crit': null,
  'Spell Crit': null,
  'Dagger Skill': null,
  'Mace Skill': null,
  'Axe Skill': null,
  'Two-hand Mace Skill': null,
  'Two-hand Axe Skill': null,
  'Staff Skill': null,
  'Melee Haste': null,
  'Spell Haste': null,
  Mp5: 'manargn',
  Hp5: 'healthrgn',
  'Spell Pen': null,
  Defense: 'defense',
  Dodge: 'dodge',
  Parry: 'parry',
  Block: 'blockpct',
  'Block Value': 'blockamount',
  'Arcane Resistance': 'arcres',
  'Fire Resistance': 'firres',
  'Nature Resistance': 'natres',
  'Frost Resistance': 'frores',
  'Shadow Resistance': 'shares',
};

const CSV_SLOT_MAP = {
  1: 'Head',
  2: 'Neck',
  3: 'Shoulders',
  4: 'Shirt',
  5: 'Chest',
  6: 'Waist',
  7: 'Legs',
  8: 'Feet',
  9: 'Wrists',
  10: 'Hands',
  11: 'Finger',
  12: 'Trinket',
  13: 'Weapon',
  14: 'Shield',
  15: 'Ranged',
  16: 'Back',
  17: 'Weapon',
  19: 'Tabard',
  20: 'Chest',
  21: 'Weapon',
  22: 'Off hand',
  23: 'Held in off hand',
  27: 'Relic',
};

const csvWriter = createCsvWriter({
  path: './output.csv',
  header: COLUMNS.map((c) => ({ id: c, title: c })),
});

const convertWowheadDataToCsv = (wowheadData: any) => {
  const data: Record<any, any> = {
    Name: wowheadData.name_enus,
    Phase: 25,
  };
  const jsonEquip = wowheadData.jsonequip;
  const ignoredKeys = ['Name', 'Phase', 'Prerequisite', 'Set'];
  let skipItem = false;
  for (const [key, value] of Object.entries(CSV_WOWHEAD_MAP)) {
    if (ignoredKeys.includes(key)) continue;
    let val = jsonEquip[value];
    if (key === 'Unique') val = val === 1 ? 'TRUE' : val;
    if (key === 'Slot') {
      // @ts-ignore
      val = CSV_SLOT_MAP[val];
      if (!val) {
        val = jsonEquip[value];
        skipItem = true;
      } else {
        data.slotbak = jsonEquip[value];
      }
    }
    if (key === 'Type' && [13, 17, 21].includes(jsonEquip.slotbak)) {
      val = jsonEquip.itemType;
    }

    data[key] = val;
  }
  return skipItem ? null : data;
};

const records = Object.keys(allData)
  .map((itemId) => {
    const item = allData[itemId];
    if (!item.randomEnchants) return convertWowheadDataToCsv(item);

    const { randomEnchants, ...baseItem } = item;
    const itemArr = randomEnchants.map((ench: any) => ({
      ...baseItem,
      jsonequip: {
        ...baseItem.jsonequip,
        ...ench.stats,
      },
      name_enus: baseItem.name_enus + ench.name.replace('...', ' '),
    }));
    return itemArr.map((i: any) => convertWowheadDataToCsv(i));
  })
  .flat()
  .filter((item) => !!item)
  .sort((a, b) =>
    a.slotbak !== b.slotbak
      ? a.slotbak - b.slotbak
      : a?.['Name']?.localeCompare(b?.['Name']),
  );

csvWriter
  .writeRecords(records) // returns a promise
  .then(() => {
    console.log('...Done');
  });
