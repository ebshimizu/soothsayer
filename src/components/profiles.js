let appState;
let dataSource;

function init() {

}

function initWithState(state) {
  appState = state;
}

function setDataSource(src) {
  dataSource = src;
}

function onPlayerProfileConnect(socket) {
  // construct the ui element
}

function onPlayerProfileDisconnect(socketID) {
  // delete the ui element
}

exports.Init = init;
exports.initWithState = initWithState;
exports.onPlayerProfileConnect = onPlayerProfileConnect;
exports.onPlayerProfileDisconnect = onPlayerProfileDisconnect;
exports.setDataSource = setDataSource;