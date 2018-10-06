const Maps = {
  TowersOfDoom: {
    name: 'Towers of Doom',
    classname: 'doom',
  },
  BattlefieldOfEternity: {
    name: 'Battlefield of Eternity',
    classname: 'boe',
  },
  DragonShire: {
    name: 'Dragon Shire',
    classname: 'dragon',
  },
  BlackheartsBay: {
    name: 'Blackheart\'s Bay',
    classname: 'blackheart',
  },
  HauntedMines: {
    name: 'Haunted Mines',
    classname: 'mines',
  },
  InfernalShrines: {
    name: 'Infernal Shrines',
    classname: 'shrines',
  },
  GardenOfTerror: {
    name: 'Garden of Terror',
    classname: 'garden',
  },
  TombOfTheSpiderQueen: {
    name: 'Tomb of the Spider Queen',
    classname: 'tomb',
  },
  WarheadJunction: {
    name: 'Warhead Junction',
    classname: 'warhead',
  },
  CursedHollow: {
    name: 'Cursed Hollow',
    classname: 'cursed',
  },
  VolskayaFoundry: {
    name: 'Volskaya Foundry',
    classname: 'volskaya',
  },
  SkyTemple: {
    name: 'Sky Temple',
    classname: 'sky',
  },
  BraxisHoldout: {
    name: 'Braxis Holdout',
    classname: 'braxis',
  },
  HanamuraTemple: {
    name: 'Hanamura Temple',
    classname: 'hanamura',
  },
  AlteracPass: {
    name: 'Alterac Pass',
    classname: 'alterac',
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
};

try {
  exports.Maps = Maps;
  exports.MapPools = MapPools;
}
catch (e) {
  // this is just to let this file be included as a linked script in the obs sources
}