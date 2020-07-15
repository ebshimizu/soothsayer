import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import { MUTATION } from './data/ACTIONS';
import LOG_LEVEL from './data/LOG_LEVEL';
import settings from 'electron-settings';

// soothsayer server init
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import store from './store/index';

const obsSrc = path.join(__static, 'obs_scr');
const textSrc = path.join(__static, 'obs_src', 'text');

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 800,
    minHeight: 400,
    minWidth: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

// application specific code
// load data
const broadcastState = settings.getSync('broadcast');
if (broadcastState) {
  store.commit(MUTATION.LOAD_BROADCAST_DATA, broadcastState);
}
// other persistent stuff, like player pool, theme, etc.

// start the socket server
const socketApp = express();
const httpServer = http.createServer(socketApp);
const io = socketio(httpServer, {
  serveClient: false,
});

// list of connected overlays
const sockets = {};

httpServer.listen(3005, function() {
  console.log('Listening on *:3005');
});

// ensure that text output directory exists
fs.ensureDirSync(textSrc);

// socket handlers and update events
io.on('connection', (socket) => {
  store.commit(MUTATION.ADD_LOG, {
    level: LOG_LEVEL.DEBUG,
    message: `New connection from ${socket.id}. Requesting id.`,
    time: new Date(),
  });

  socket.emit('requestID');
  // socket.emit('changeTheme', store.state.theme);

  socket.on('disconnect', function(reason) {
    // unregister
    store.commit(MUTATION.UNREGISTER_OVERLAY, socket.id);

    delete sockets[socket.id];
  });

  socket.on('reportID', (overlayData) => {
    // register to app state
    store.commit(MUTATION.REGISTER_OVERLAY, {
      id: socket.id,
      overlayData: _.cloneDeep(overlayData),
    });

    // store socket id
    sockets[socket.id] = overlayData;
    sockets[socket.id].socket = socket;

    if (overlayData.name === 'Lower Third') {
      // this.onLowerThirdConnect(socket);
    } else if (overlayData.name === 'Player Profile') {
      // onPlayerProfileConnect(socket);
    }

    store.commit(MUTATION.ADD_LOG, {
      level: LOG_LEVEL.DEBUG,
      message: `Registered '${overlayData.name}' from ${socket.id}.`,
      time: new Date(),
    });
  });

  socket.on('requestState', async () => {
    // so here we actually want to get the snapshotted state...
    const snapshot = await settings.get('broadcast');
    socket.emit('update', snapshot);
  });

  socket.on('requestTicker', () => {
    // ticker
  });

  socket.on('requestMapPool', () => {
    // map pool
  });
});

ipcMain.on('broadcastUpdate', () => {
  console.log('updated');

  io.sockets.emit('update', store.state.broadcast);

  // update text

  // write settings, don't need to wait
  settings.set('broadcast', store.state.broadcast);
});
