const Parser = require('./stats-of-the-storm/hots-parser/parser');
const chokidar = require('chokidar');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipc = require('electron').ipcRenderer;

let watcher;
let replayData;

function broadcast(event, data) {
  const wins = BrowserWindow.getAllWindows();
  for (const w in wins) {
    wins[w].webContents.send(event, data);
  }
}

function parseReplay(path) {
  replayData = Parser.processReplay(path, {
    overrideVerifiedBuild: true,    // livin on the edge, also in a live data thing mis-parses are less critical
  });
  broadcast('replayParsed', replayData);
}

function startWatcherOn(folder) {
  if (watcher) {
    watcher.close();
  }
  
  watcher = chokidar.watch(folder, {
    awaitWriteFinish: true,
    ignoreInitial: true,
  });

  watcher.on('add', parseReplay);

  console.log(`Start watch ${folder}`);
}

ipc.on('startWatcher', function(event, folder) {
  startWatcherOn(folder);
  broadcast('watcherStarted');
});

ipc.on('stopWatcher', function(event) {
  watcher.close();
});