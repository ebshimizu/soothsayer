// couple common util functions
const fs = require('fs-extra');

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
