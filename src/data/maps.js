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
    name: "Blackheart's Bay",
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
  NGSS14: {
    name: 'NGS Season 14',
    maps: [
      'AlteracPass',
      'BattlefieldOfEternity',
      'BraxisHoldout',
      'CursedHollow',
      'DragonShire',
      'GardenOfTerror',
      'InfernalShrines',
      'SkyTemple',
      'TombOfTheSpiderQueen',
      'TowersOfDoom',
      'VolskayaFoundry',
    ],
  },
  NGSS10: {
    name: 'NGS Season 13',
    maps: [
      'AlteracPass',
      'BattlefieldOfEternity',
      'BraxisHoldout',
      'CursedHollow',
      'DragonShire',
      'SkyTemple',
      'InfernalShrines',
      'TombOfTheSpiderQueen',
      'TowersOfDoom',
      'VolskayaFoundry',
    ],
  },
  HeroesLoungeEU: {
    name: 'HL EU Season 16',
    maps: [
      'BattlefieldOfEternity',
      'InfernalShrines',
      'VolskayaFoundry',
      'DragonShire',
      'TombOfTheSpiderQueen',
      'SkyTemple',
      'CursedHollow',
      'TowersOfDoom',
      'AlteracPass',
      'GardenOfTerror',
    ],
  },
  HeroesLoungeNA: {
    name: 'HL NA Season 5',
    maps: [
      'AlteracPass',
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
