// this is wild, the server is running as part of the render process.
// seems ok for a quick prototype, may want to move to main at some point
// but the behavior of "the app stops updating when the controls close" seems good
const { State } = require('./components/state');
const TeamData = require('./components/team-data');
const MapData = require('./components/map-data');
const Themes = require('./components/themes');
const DataSource = require('./components/data-source');
const LowerThird = require('./components/stat-lower-third');
const { HeroesTalents } = require('./stats-of-the-storm/js/heroes-talents');

const socketApp = require('express')();
const http = require('http').Server(socketApp);
const io = require('socket.io')(http);
const appVersion = require('electron').remote.app.getVersion();
const path = require('path');
const { shell, remote } = require('electron');

// global for debug
let appState;

// hey so we're gonna stick heroes talents in the global window state because reasons
window.heroesTalents = new HeroesTalents(
  path.join(__dirname, '/stats-of-the-storm/assets/heroes-talents'),
  path.join(__dirname, '/stats-of-the-storm/assets/data')
);

$(document).ready(() => {
  $('.app-version').text(appVersion);

  // auto open external links
  $(document).on('click', 'a[href^="http"]', function(event) {
      event.preventDefault();
      shell.openExternal(this.href);
  });

  TeamData.Init();
  MapData.Init();
  Themes.Init();
  DataSource.Init();
  LowerThird.Init();

  appState = new State(io);
  appState.onLowerThirdConnect = LowerThird.onLowerThirdConnect;
  appState.onLowerThirdDisconnect = LowerThird.onLowerThirdDisconnect;

  TeamData.InitWithState(appState);
  MapData.InitWithState(appState);
  Themes.InitWithState(appState);
  DataSource.InitWithState(appState);
  LowerThird.InitWithState(appState);
  LowerThird.setDataSource(DataSource);

  http.listen(3005, function () {
    console.log('listening on *:3005');
  });

  // couple global ui handles
  $('#section-menu .item').tab();
  $('#update-button').click(() => appState.updateAndBroadcast.call(appState));
  $('.dev-tools-button').click(() => remote.getCurrentWindow().toggleDevTools());
});
