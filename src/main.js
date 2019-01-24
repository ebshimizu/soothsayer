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
const Tournament = require('./components/tournament');
const Casters = require('./components/caster-data');
const Ticker = require('./components/ticker');
const Util = require('./components/util');
const Profiles = require('./components/profiles');
const { HeroesTalents } = require('./stats-of-the-storm/js/heroes-talents');
const settings = require('electron-settings');
const Keybinds = require('./components/keybinds');

const socketApp = require('express')();
const http = require('http').Server(socketApp);
const io = require('socket.io')(http);
const appVersion = require('electron').remote.app.getVersion();
const path = require('path');
const { shell, remote, ipcRenderer } = require('electron');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipc = require('electron').ipcRenderer;

// global for debug
let appState;
let bgWindow;
let suppressMessages = true;

// hey so we're gonna stick heroes talents in the global window state because reasons
window.heroesTalents = new HeroesTalents(
  path.join(__dirname, '/stats-of-the-storm/assets/heroes-talents'),
  path.join(__dirname, '/stats-of-the-storm/assets/data'),
);

// shows and logs a transient message
function showMessage(msg, classname) {
  console.log(msg);

  // log only
  if (suppressMessages === true) return;

  const elem = $(
    `<div class="ui transitinon hidden message ${classname}"><div class="content">${msg}</div></div>`,
  );
  $('#message-container').append(elem);
  elem.transition('fade left in');
  setTimeout(() => {
    elem.transition('fade left out', 500, function () {
      elem.remove();
    });
  }, 4000);
}

window.showMessage = showMessage;

// ipc functions
ipcRenderer.on('updateReady', function (event, message) {
  $('#update-status')
    .removeClass('blue')
    .addClass('teal');
  $('#update-status').text('Update Ready. Close app to update.');
  showMessage('Update Ready. Close app to update');
});

ipcRenderer.on('updateNotify', function (event, version) {
  $('#update-status').addClass('active blue');
  $('#update-status').html(`Update Downloading: v${version} <span class="speed"></span>`);
  $('#update-status').show();
});

ipcRenderer.on('updateDownload', function (event, pct, speed) {
  const p = pct.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const b = (speed / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 });
  $('#update-status .speed').text(`${p}%, ${b} MB/s`);
});

ipcRenderer.on('updateStatus', function (event, message) {
  console.log(message);
});

// section loader logic
function loadSection(name, text, elem) {
  // no duplicate loads
  if (window.currentGame === name) {
    return;
  }

  window.currentGame = name;
  const link = document.querySelector(`link[name="${name}"]`);

  if (!link) {
    return;
  }

  const markup = link.import.querySelector('.operate-content').innerHTML;

  $('#operate-mode').html(markup);
  initApp(name);
  settings.set('currentGame', name);
  showMessage(`Loaded controls for ${text} (id: ${name})`, 'positive');
}

// check settings, set game.
function initGameLoad() {
  const gameID = settings.get('currentGame');
  if (!gameID) {
    $('#game-select-menu').dropdown('set exactly', 'hots');
  }
  else {
    $('#game-select-menu').dropdown('set exactly', gameID);
  }
}

// hots specific
function createReplayWatcher() {
  const bgPath = `file://${path.join(__dirname, './bg-replay-watcher.html')}`;
  bgWindow = new BrowserWindow({ width: 400, height: 400, show: false });
  bgWindow.loadURL(bgPath);
}

// run once
function initGlobal() {
  $('.app-version').text(appVersion);
  $('#update-status').hide();

  $('.dev-tools-button').click(() => remote.getCurrentWindow().toggleDevTools());
  $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
    console.log(jqxhr);
    showMessage(`Error: ${jqxhr.status}`, 'negative');
  });

  // auto open external links
  $(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault();
    shell.openExternal(this.href);
  });

  $('#update-button').click(() => {
    $('#update-button').transition('pulse');
    LowerThird.reloadPlayerLTMenu();
    MapData.trySyncMatchScore();
    appState.updateAndBroadcast.call(appState);
    showMessage('Update Performed', 'positive');
  });

  http.listen(3005, function () {
    console.log('listening on *:3005');
  });

  $('#main-settings-button').click(function () {
    $('#config-mode').show();
    $('#operate-mode').hide();
    $('.main.menu .menu-opt').removeClass('active');
    $('#main-settings-button').addClass('active');
  });

  $('#main-operate-button').click(function () {
    $('#operate-mode').show();
    $('#config-mode').hide();
    $('.main.menu .menu-opt').removeClass('active');
    $('#main-operate-button').addClass('active');
  });

  $('.obs-src-button').click(function () {
    shell.openItem(appState.rootOBS);
  });

  $('#config-mode').hide();

  // game mode dropdown
  $('#game-select-menu').dropdown({
    onChange: loadSection,
  });
  Keybinds.createKeybindInputs();

  appState = new State(io);
  appState.onLowerThirdConnect = LowerThird.onLowerThirdConnect;
  appState.onLowerThirdDisconnect = LowerThird.onLowerThirdDisconnect;
  appState.onPlayerProfileConnect = Profiles.onPlayerProfileConnect;
  appState.onPlayerProfileDisconnect = Profiles.onPlayerProfileDisconnect;

  // init once
  DataGrabber.Init();
  DataSource.Init();

  initGameLoad();
  suppressMessages = false;
}

// game name provided in case game specific init needs to happen later
function initApp(name) {
  ipc.removeAllListeners('replayParsed');

  Casters.Init();
  TeamData.Init();
  MapData.Init();
  Themes.Init();
  LowerThird.Init();
  Tournament.Init();
  Ticker.Init();
  Profiles.Init();

  appState.renderState();

  ipc.on('replayParsed', function (event, data) {
    appState.setLastReplayData(data);
  });

  TeamData.InitWithState(appState);
  MapData.InitWithState(appState);
  Themes.InitWithState(appState);
  DataSource.InitWithState(appState);
  LowerThird.InitWithState(appState);
  LowerThird.setDataSource(DataSource);
  DataGrabber.InitWithState(appState);
  Tournament.InitWithState(appState);
  Ticker.InitWithState(appState);
  Profiles.InitWithState(appState);
  Profiles.setDataSource(DataSource);

  $('#section-menu .item').tab();
  $('#status-tab-menu .item').tab();

  $('#update-keybinds-button').click(() => {
    appState.updateKeybinds.call(appState);
  });
  $('#restore-default-keybinds-button').click(() => {
    appState.restoreDefaultKeybinds.call(appState);
  });
  $('input.has-popup').popup({
    on: 'focus',
  });
}

$(document).ready(() => {
  // createReplayWatcher();
  // $('.bg-dev-tools-button').click(() => bgWindow.webContents.openDevTools());

  initGlobal();
  // loadGameUI();
  // initApp();
  ipcRenderer.send('checkUpdate');
});
