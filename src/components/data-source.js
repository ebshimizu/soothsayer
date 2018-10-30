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
  console.log(`Changing data source to ${val}`, 'info');
  $('.data-source-options').hide();
  $(`.data-source-options[data-source="${val}"]`).show();

  if (val in DataSources)
    DataSources[val].activate();

  activeSource = val;
  appState.setDataSource(activeSource);
}

// gets data in the format required by the lower thirds
// options defined in stat-lower-third's LT dropdown var. (yeahhhhhhh i know not optimal)
function getLTData(dataConfig, callback) {
  if (dataConfig.type === 'HGC-hero-draft') {
    heroDraft(dataConfig.hero, callback, dataConfig.wildcard);
  }
  else if (dataConfig.type === 'player-hero') {
    playerStatsForHero(dataConfig.player, dataConfig.hero, callback, dataConfig.wildcard);
  }
  else {
    callback({ error: `Failed to load data for config ${dataConfig.type}` });
  }
}

// All draft data, no player/team stats
// all of these require callbacks, as most APIs are expected to be asnyc
// returned object must have the following fields:
// - pick, pickPct, ban, banPct, win, winPct, K, D, A, TD, KDA, wildcard, wildcardName
function heroDraft(hero, callback, wildcard) {
  DataSources[activeSource].heroDraft(hero, callback, wildcard);
}

// all draft data for a specific team's hero
function heroDraftWithTeam(hero, team) {

}

// all player stats for a specific hero
// Player is a battletag (maybe)
// required fields:
// - games, win, winPct, K, D, A, TD, KDA, timeDeadPct, KillParticipation, ToonHandle, BTag
function playerStatsForHero(player, hero, callback, wildcard) {
  DataSources[activeSource].playerStatsForHero(player, hero, callback, wildcard);
}

// all player stats
function playerStats(player) {

}

exports.Init = init;
exports.InitWithState = initWithState;
exports.heroDraft = heroDraft;
exports.getLTData = getLTData;