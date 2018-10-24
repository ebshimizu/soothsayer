// couple common util functions

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

exports.heroMenu = heroMenu;