// couple common util functions
const fs = require('fs-extra');
const statList = require('../stats-of-the-storm/js/game-data/detail-stat-list');
const mapStatList = require('../stats-of-the-storm/js/game-data/map-stats');
const StatNames = require('../stats-of-the-storm/js/game-data/detail-stat-string');

let allStats = statList;
for (const map in mapStatList) {
  allStats = allStats.concat(mapStatList[map]);
}

// need to give a heroes talents instance
// returns markup for a hero selection dropdown. does not bind anything, markup only
// only to be used by main app, paths set with __dirname
function heroMenu(ht, classname) {
  let opts = '';

  for (let h of ht.allHeroNames) {
    opts += `
      <div class="item" data-value="${h}">
        <img class="ui avatar image" src="${path.join(__dirname, '../stats-of-the-storm/assets/heroes-talents/images/heroes/', ht.heroIcon(h))}">
        ${h}
      </div>
    `;
  }

  return `
    <div class="ui fluid search selection dropdown ${classname}">
      <i class="dropdown icon"></i>
      <div class="default text">Select Hero</div>
      <div class="menu">
        ${opts}
      </div>
    </div>
  `;
}

function statMenu(classname) {
  let opts = ''

  for (const stat of allStats) {
    opts += `<div class="item" data-value="${stat}">${StatNames[stat]}</div>`
  }

  return `
    <div class="ui fluid search selection dropdown ${classname}">
      <i class="dropdown icon"></i>
      <div class="default text">Select Stat</div>
      <div class="menu">
        ${opts}
      </div>
    </div>
  `;
}

// this is a command line accessible function that dumps out css for all current heroes
// it is expected that this is a dev only tool but i mean hey you can use it too if you want.
function heroImgCSSGen(ht, outFile) {
  let out = '';

  for (let h of ht.allHeroNames) {
    out += `
      .${ht._heroes[h].attributeId} {
        background-image: url('../../stats-of-the-storm/assets/heroes-talents/images/heroes/${ht.heroIcon(h)}');
      }
    `;
  }

  fs.writeFileSync(outFile, out, { flags: 'w+' });
}

exports.heroMenu = heroMenu;
exports.heroImgCSSGen = heroImgCSSGen;
exports.statMenu = statMenu;
