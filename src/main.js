// this is wild, the server is running as part of the render process.
// seems ok for a quick prototype, may want to move to main at some point
// but the behavior of "the app stops updating when the controls close" seems good
const { State } = require('./components/state');
const TeamData = require('./components/team-data');
const MapData = require('./components/map-data');
const Themes = require('./components/themes');
const DataSource = require('./components/data-source');
const DataGrabber = require('./components/data-fetch');
const LowerThird = require('./components/stat-lower-third');
const Casters = require('./components/caster-data');
const Util = require('./components/util');
const { HeroesTalents } = require('./stats-of-the-storm/js/heroes-talents');

const socketApp = require('express')();
const http = require('http').Server(socketApp);
const io = require('socket.io')(http);
const appVersion = require('electron').remote.app.getVersion();
const path = require('path');
const { shell, remote } = require('electron');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipc = require('electron').ipcRenderer;

// global for debug
let appState;
let bgWindow;

// hey so we're gonna stick heroes talents in the global window state because reasons
window.heroesTalents = new HeroesTalents(
  path.join(__dirname, '/stats-of-the-storm/assets/heroes-talents'),
  path.join(__dirname, '/stats-of-the-storm/assets/data')
);

// shows and logs a transient message
function showMessage(msg, classname) {
  let elem = $(`<div class="ui transitinon hidden message ${classname}"><div class="content">${msg}</div></div>`);
  console.log(msg);
  $('#message-container').append(elem);
  elem.transition('fade left in');
  setTimeout(() => {
    elem.transition('fade left out', 500, function() {
      elem.remove();
    });
  }, 4000);
}

window.showMessage = showMessage;

function createReplayWatcher() {
  const bgPath = `file://${path.join(__dirname, './bg-replay-watcher.html')}`;
  bgWindow = new BrowserWindow({width: 400, height: 400, show: false});
  bgWindow.loadURL(bgPath);
}

$(document).ready(() => {
  $('.app-version').text(appVersion);
  $('.dev-tools-button').click(() => remote.getCurrentWindow().toggleDevTools());
  $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
    showMessage(`Error: ${thrownError}`);
  });

  // auto open external links
  $(document).on('click', 'a[href^="http"]', function(event) {
      event.preventDefault();
      shell.openExternal(this.href);
  });

  //createReplayWatcher();
  //$('.bg-dev-tools-button').click(() => bgWindow.webContents.openDevTools());

  Casters.Init();
  TeamData.Init();
  MapData.Init();
  Themes.Init();
  DataSource.Init();
  LowerThird.Init();

  appState = new State(io);
  appState.onLowerThirdConnect = LowerThird.onLowerThirdConnect;
  appState.onLowerThirdDisconnect = LowerThird.onLowerThirdDisconnect;

  ipc.on('replayParsed', function(event, data) {
    appState.setLastReplayData(data);
  });

  TeamData.InitWithState(appState);
  MapData.InitWithState(appState);
  Themes.InitWithState(appState);
  DataSource.InitWithState(appState);
  LowerThird.InitWithState(appState);
  LowerThird.setDataSource(DataSource);
  DataGrabber.InitWithState(appState);

  http.listen(3005, function () {
    console.log('listening on *:3005');
  });

  // couple global ui handles
  $('#section-menu .item').tab();
  $('#status-tab-menu .item').tab();
  $('#update-button').click(() => {
    $('#update-button').transition('pulse');
    LowerThird.reloadPlayerLTMenu();
    MapData.trySyncMatchScore();
    appState.updateAndBroadcast.call(appState);
    showMessage('Update Performed', 'positive');
  });
  $('#update-keybinds-button').click(() => {
    appState.updateKeybinds.call(appState);
  });
  $('#restore-default-keybinds-button').click(() => {
    appState.restoreDefaultKeybinds.call(appState);
  });
  $('input.has-popup').popup({
    on: 'focus',
  });
});
