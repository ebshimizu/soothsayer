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
    this.match = settings.get('match');

    if (!this.blueTeam) {
      this.blueTeam = { };
    }
    if (!this.redTeam) {
      this.redTeam = { };
    }
    if (!this.match) {
      this.match = {};
      this.match.games = [];
    }

    this.displayTeamData();
    this.displayMatchData();
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
    this.updateMatchData();

    this.broadcastStateChange();
    this.save();
  }

  broadcastStateChange() {
    io.sockets.emit('update', this);
  }

  save() {
    settings.set('blueTeam', this.blueTeam);
    settings.set('redTeam', this.redTeam);
    settings.set('match', this.match);
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

  updateMatchData() {
    // map pool
    this.match.mapPool = $('#map-pool').dropdown('get value').split(',');

    // series
    this.match.bestOf = parseInt($('#best-of').dropdown('get value'));

    // bans
    this.match.blueMapBan = $('#blue-map-ban').dropdown('get value');
    this.match.redMapBan = $('#red-map-ban').dropdown('get value');

    // games, this'll be fun
    this.match.games = [];
    for (let i = 0; i < this.match.bestOf; i++) {
      this.match.games.push(this.getGameData(i + 1));
    }
  }

  getGameData(gameNumber) {
    let elem = $(`.game-data[game-number="${gameNumber}"]`);

    return {
      map: elem.find('.map-menu').dropdown('get value'),
      pick: elem.find('.team-pick-menu').dropdown('get value'),
      win: elem.find('.team-winner-menu').dropdown('get value')
    };
  }

  displayMatchData() {
    // map pool
    $('#map-pool').dropdown('set exactly', this.match.mapPool);

    // series
    $('#best-of').dropdown('set exactly', this.match.bestOf);

    // bans
    $('#blue-map-ban').dropdown('set exactly', this.match.blueMapBan);
    $('#red-map-ban').dropdown('set exactly', this.match.redMapBan);

    // individual match data
    this.displayGameData(this.match.bestOf);
  }

  displayGameData(numGames) {
    if (this.match.games) {
      MapData.deleteGameData();
      for (let i = 0; i < numGames; i++) {
        this.createGameData(i + 1, this.match.games[i]);
      }
    }
  }

  createGameData(gameNumber, data) {
    MapData.addGameData(gameNumber);

    if (!data)
      data = {};

    let elem = $(`.game-data[game-number="${gameNumber}"]`);
    elem.find('.map-menu').dropdown('set exactly', data.map);
    elem.find('.team-pick-menu').dropdown('set exactly', data.pick);
    elem.find('.team-winner-menu').dropdown('set exactly', data.win);
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