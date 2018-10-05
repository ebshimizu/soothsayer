// the application state. Should send events to all sockets on change.
class State {
  constructor() {
    this.overlays = {};
    this.blueTeam = {
      name: '',
      score: 0,
    };
    this.redTeam = {
      name: '',
      score: 0,
    };
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
    // probably snapshot to disk here for later
  }

  broadcastStateChange() {
    io.sockets.emit('update', this);
  }

  updateTeamData() {
    this.blueTeam.name = $('#team-blue-name').val();
    this.blueTeam.score = $('#team-blue-score').val();
    this.redTeam.name = $('#team-red-name').val();
    this.redTeam.score = $('#team-red-score').val();
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