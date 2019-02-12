const Maps = {
  AlteracPass: {
    name: 'Alterac Pass',
    classname: 'alterac',
  },
  BattlefieldOfEternity: {
    name: 'Battlefield of Eternity',
    classname: 'boe',
  },
  BlackheartsBay: {
    name: 'Blackheart\'s Bay',
    classname: 'blackheart',
  },
  BraxisHoldout: {
    name: 'Braxis Holdout',
    classname: 'braxis',
  },
  CursedHollow: {
    name: 'Cursed Hollow',
    classname: 'cursed',
  },
  DragonShire: {
    name: 'Dragon Shire',
    classname: 'dragon',
  },
  GardenOfTerror: {
    name: 'Garden of Terror',
    classname: 'garden',
  },
  HanamuraTemple: {
    name: 'Hanamura Temple',
    classname: 'hanamura',
  },
  HauntedMines: {
    name: 'Haunted Mines',
    classname: 'mines',
  },
  InfernalShrines: {
    name: 'Infernal Shrines',
    classname: 'shrines',
  },
  SkyTemple: {
    name: 'Sky Temple',
    classname: 'sky',
  },
  TombOfTheSpiderQueen: {
    name: 'Tomb of the Spider Queen',
    classname: 'tomb',
  },
  TowersOfDoom: {
    name: 'Towers of Doom',
    classname: 'doom',
  },
  VolskayaFoundry: {
    name: 'Volskaya Foundry',
    classname: 'volskaya',
  },
  WarheadJunction: {
    name: 'Warhead Junction',
    classname: 'warhead',
  },
};

const MapPools = {
  HGC2018: {
    name: 'HGC 2018',
    maps: [
      'BattlefieldOfEternity',
      'BraxisHoldout',
      'CursedHollow',
      'DragonShire',
      'InfernalShrines',
      'SkyTemple',
      'TombOfTheSpiderQueen',
      'TowersOfDoom',
      'VolskayaFoundry',
    ],
  },
  SlashHeroesOpen1: {
    name: '/heroes-open Season 1',
    maps: [
      'AlteracPass',
      'BattlefieldOfEternity',
      'CursedHollow',
      'DragonShire',
      'InfernalShrines',
      'SkyTemple',
      'TombOfTheSpiderQueen',
      'TowersOfDoom',
      'VolskayaFoundry',
    ],
  },
  NGSS6: {
    name: 'NGS Season 6',
    maps: [
      'AlteracPass',
      'BraxisHoldout',
      'CursedHollow',
      'DragonShire',
      'InfernalShrines',
      'SkyTemple',
      'TombOfTheSpiderQueen',
      'TowersOfDoom',
      'VolskayaFoundry',
    ],
  },
  All: {
    name: 'All Maps',
    maps: Object.keys(Maps),
  },
};

try {
  exports.Maps = Maps;
  exports.MapPools = MapPools;
}
catch (e) {
  // this is just to let this file be included as a linked script in the obs sources
}