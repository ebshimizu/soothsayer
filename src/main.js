// this is wild, the server is running as part of the render process.
// seems ok for a quick prototype, may want to move to main at some point
// but the behavior of "the app stops updating when the controls close" seems good
const { State } = require('./components/state');
const TeamData = require('./components/team-data');
const MapData = require('./components/map-data');
const Themes = require('./components/themes');

const socketApp = require('express')();
const http = require('http').Server(socketApp);
const io = require('socket.io')(http);
const appVersion = require('electron').remote.app.getVersion();
const { shell, remote } = require('electron');

// global for debug
let appState;

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

  appState = new State(io);

  TeamData.InitWithState(appState);
  MapData.InitWithState(appState);
  Themes.InitWithState(appState);

  http.listen(3005, function () {
    console.log('listening on *:3005');
  });

  // couple global ui handles
  $('#section-menu .item').tab();
  $('#update-button').click(() => appState.updateAndBroadcast.call(appState));
  $('.dev-tools-button').click(() => remote.getCurrentWindow().toggleDevTools());
});
