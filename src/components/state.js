// the application state. Should send events to all sockets on change.
const settings = require('electron-settings');

class State {
  constructor() {
    this.loadState();

    // always clear overlays
    this.overlays = {};
  }

  loadState() {
    // teams
    this.blueTeam = settings.get('blueTeam');
    this.redTeam = settings.get('redTeam');

    if (!this.blueTeam) {
      this.blueTeam = { };
    }
    if (!this.redTeam) {
      this.redTeam = { };
    }

    this.displayTeamData();
  }

  // expected format:
  // name
  // and that's about it for now.
  registerOverlay(socket, overlayData) {
    this.overlays[socket.id] = overlayData;
    console.log(`Registered '${overlayData.name} from ${socket.id}.`);
  }

  unregisterOverlay(socketID) {
    console.log(`Socket ${socketID} disconnected. Deleted overlay ${this.overlays[socketID].name}.`);
    delete this.overlays[socketID];
  }

  updateAndBroadcast() {
    this.updateTeamData();

    this.broadcastStateChange();
    this.save();
  }

  broadcastStateChange() {
    io.sockets.emit('update', this);
  }

  save() {
    settings.set('blueTeam', this.blueTeam);
    settings.set('redTeam', this.redTeam);
  }

  updateTeamData() {
    this.blueTeam.name = $('#team-blue-name').val();
    this.blueTeam.score = $('#team-blue-score').val();
    this.blueTeam.logo = $('#team-blue-logo input').val();

    this.redTeam.name = $('#team-red-name').val();
    this.redTeam.score = $('#team-red-score').val();
    this.redTeam.logo = $('#team-red-logo input').val();
  }

  displayTeamData() {
    $('#team-blue-name').val(this.blueTeam.name);
    $('#team-blue-score').val(this.blueTeam.score);
    $('#team-blue-logo input').val(this.blueTeam.logo); 

    $('#team-red-name').val(this.redTeam.name);
    $('#team-red-score').val(this.redTeam.score);
    $('#team-red-logo input').val(this.redTeam.logo); 
  }
}

function constructState(io) {
  const state = new State();

  // io is a window level variable
  io.on('connection', (socket) => {
    console.log(`New connection from ${socket.id}. Requesting id.`);
    socket.emit('requestID');

    socket.on('disconnect', function (reason) {
      state.unregisterOverlay(socket.id, reason);
    });

    socket.on('reportID', (overlayData) => {
      state.registerOverlay(socket, overlayData);
    });

    socket.on('requestState', () => {
      socket.emit('update', state);
    });
  });

  return state;
}

exports.State = constructState;