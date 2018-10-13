// data sources use various apis to get data into a common format for the app
// this file just coordinates selection and usage of the various connectors.
// most of the data wrangling will actually happen in the data source specific file.

const SotsSource = require('./data-sources/sots-db');
let appState;

// data sources
const DataSources = {
  sots: SotsSource,
};

let activeSource;

function init() {
  DataSources.sots.init();

  $('.data-source-options').hide();
  $('#data-source-menu').dropdown({
    onChange: changeDataSource
  });
}

function initWithState(state) {
  appState = state;

  // assign active source, run an activation routine (auto happens on set)
  activeSource = appState.dataSource.active;
  $('#data-source-menu').dropdown('set exactly', activeSource);
}

function changeDataSource(val) {
  console.log(`Changing data source to ${val}`);
  $('.data-source-options').hide();
  $(`.data-source-options[data-source="${val}"]`).show();

  if (val in DataSources)
    DataSources[val].activate();

  activeSource = val;
  appState.setDataSource(activeSource);
}

// All draft data, no player/team stats
// all of these require callbacks, as most APIs are expected to be asnyc
function heroDraft(hero, callback) {
  DataSources[activeSource].heroDraft(hero, callback);
}

// all draft data for a specific team's hero
function heroDraftWithTeam(hero, team) {

}

// all player stats for a specific hero
function playerStatsForHero(player, hero) {

}

// all player stats
function playerStats(player) {

}

exports.Init = init;
exports.InitWithState = initWithState;
exports.heroDraft = heroDraft;