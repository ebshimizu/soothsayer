// the application state. Should send events to all sockets on change.
// this object also kinda manages relations between the sockets and other elements.
const settings = require('electron-settings');
const fs = require('fs-extra');
const path = require('path');
const DataSource = require('./data-source');

class State {
  constructor() {
    this.loadState();

    // always clear overlays
    this.overlays = {};

    this.rootOBS = path.join(__dirname, '../obs_src');

    if (!fs.existsSync(this.rootOBS)) {
      this.rootOBS = path.join(process.resourcesPath, 'app', 'src', 'obs_src');
    }
  }

  loadState() {
    // teams
    this.blueTeam = settings.get('blueTeam');
    this.redTeam = settings.get('redTeam');
    this.miscData = settings.get('miscData');
    this.match = settings.get('match');
    this.theme = settings.get('theme');
    this.casters = settings.get('casters');
    this.dataSource = settings.get('dataSource');

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
    if (!this.theme) {
      this.theme = {};
    }
    if (!this.casters) {
      this.casters = {};
    }
    if (!this.dataSource) {
      this.dataSource = {};
    }
    if (!this.miscData) {
      this.miscData = {};
    }

    this.displayTeamData();
    this.displayMatchData();
    this.displayCasterData();
    this.displayDataSource();
    $('#set-theme').dropdown('set value', this.theme.name);
  }

  // expected format:
  // name
  // and that's about it for now.
  registerOverlay(socket, overlayData) {
    this.overlays[socket.id] = overlayData;
    this.overlays[socket.id].socket = socket;

    $('#overlay-table').append(`<tr socket-id="${socket.id}"><td>${overlayData.name}</td><td>${socket.id}</td></tr>`);

    // lower thirds have an additional callback. this should error if the function is not set.
    if (overlayData.name === 'Lower Third') {
      this.onLowerThirdConnect(socket);
    }

    console.log(`Registered '${overlayData.name}' from ${socket.id}.`);
  }

  unregisterOverlay(socketID) {
    console.log(`Socket ${socketID} disconnected. Deleted overlay ${this.overlays[socketID].name}.`);
    $(`#overlay-table tr[socket-id="${socketID}"]`).remove();

    if (this.overlays[socketID].name === 'Lower Third') {
      this.onLowerThirdDisconnect(socketID);
    }

    delete this.overlays[socketID];
  }

  sendTo(socketID, event, data) {
    if (socketID in this.overlays) {
      this.overlays[socketID].socket.emit(event, data);
    }
    else {
      console.log(`Error: socket ${socketID} is not connected. Did not send.`);
    }
  }

  updateAndBroadcast() {
    this.updateTeamData();
    this.updateMatchData();
    this.updateCasterData();
    this.updateDataSource();

    this.broadcastStateChange();
    this.save();
  }

  broadcastSubset() {
    return {
      blueTeam: this.blueTeam,
      redTeam: this.redTeam,
      match: this.match,
      rootOBS: this.rootOBS,
      theme: this.theme,
      casters: this.casters,
      misc: this.miscData,
    };
  }

  broadcastStateChange() {
    io.sockets.emit('update', this.broadcastSubset());

    // snapshot some stuff to disk
    try {
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'blue_team.txt'), this.blueTeam.name, { flag: 'w+' });
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'red_team.txt'), this.redTeam.name, { flag: 'w+' });
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'blue_team_score.txt'), this.blueTeam.score, { flag: 'w+' });
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'red_team_score.txt'), this.redTeam.score, { flag: 'w+' });
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'tournament_name.txt'), this.tournament, { flag: 'w+' });

      if (this.casters.one) {
        fs.writeFileSync(path.join(this.rootOBS, 'text', 'caster_one_name.txt'), this.casters.one.name, { flag: 'w+' });
        fs.writeFileSync(path.join(this.rootOBS, 'text', 'caster_one_social.txt'), this.casters.one.social, { flag: 'w+' });
      }

      if (this.casters.two) {
        fs.writeFileSync(path.join(this.rootOBS, 'text', 'caster_two_name.txt'), this.casters.two.name, { flag: 'w+' });
        fs.writeFileSync(path.join(this.rootOBS, 'text', 'caster_two_social.txt'), this.casters.two.social, { flag: 'w+' });
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  broadcastThemeChange() {
    this.updateTheme();
    io.sockets.emit('changeTheme', this.theme.folderName);
    this.save();
  }

  updateTheme() {
    // get val from the dropdown, load the theme data
    this.theme = Themes.getTheme($('#theme-menu').dropdown('get value'));

    if (!this.theme)
      this.theme = {};
  }

  save() {
    settings.set('blueTeam', this.blueTeam);
    settings.set('redTeam', this.redTeam);
    settings.set('match', this.match);
    settings.set('theme', this.theme);
    settings.set('casters', this.casters);
    settings.set('dataSource', this.dataSource);
    settings.set('miscData', this.miscData);
  }

  updateTeamData() {
    this.blueTeam.name = $('#team-blue-name').val();
    this.blueTeam.score = $('#team-blue-score').val();
    this.blueTeam.logo = $('#team-blue-logo input').val();
    this.blueTeam.players = [];

    this.redTeam.name = $('#team-red-name').val();
    this.redTeam.score = $('#team-red-score').val();
    this.redTeam.logo = $('#team-red-logo input').val();
    this.redTeam.players = [];

    for (const i of [1, 2, 3, 4, 5]) {
      const bluep = {
        name: $(`#blue-p${i}-name`).val(),
        hero: $(`#blue-p${i}-hero .player-hero-menu`).dropdown('get value'),
        classname: '',
      };

      if (bluep.hero in heroesTalents._heroes) {
        bluep.classname = heroesTalents._heroes[bluep.hero].attributeId;
      }
      this.blueTeam.players.push(bluep);

      const redp = {
        name: $(`#red-p${i}-name`).val(),
        hero: $(`#red-p${i}-hero .player-hero-menu`).dropdown('get value'),
        classname: '',
      };

      if (redp.hero in heroesTalents._heroes) {
        redp.classname = heroesTalents._heroes[redp.hero].attributeId;
      }
      this.redTeam.players.push(redp);
    }

    this.miscData.popupDisplayMode = $('#popup-display-mode').dropdown('get value');
    this.miscData.popupAnimLength = $('#popup-anim-time').val();
  }

  displayTeamData() {
    $('#team-blue-name').val(this.blueTeam.name);
    $('#team-blue-score').val(this.blueTeam.score);
    $('#team-blue-logo input').val(this.blueTeam.logo);

    $('#team-red-name').val(this.redTeam.name);
    $('#team-red-score').val(this.redTeam.score);
    $('#team-red-logo input').val(this.redTeam.logo);

    for (const i of [1, 2, 3, 4, 5]) {
      if (this.blueTeam.players) {
        $(`#blue-p${i}-name`).val(this.blueTeam.players[i - 1].name);
        $(`#blue-p${i}-hero .player-hero-menu`).dropdown('set exactly', this.blueTeam.players[i - 1].hero);
      }
      else {
        $(`#blue-p${i}-name`).val('');
        $(`#blue-p${i}-hero .player-hero-menu`).dropdown('clear');
      }

      if (this.blueTeam.players) {
        $(`#red-p${i}-name`).val(this.redTeam.players[i - 1].name);
        $(`#red-p${i}-hero .player-hero-menu`).dropdown('set exactly', this.redTeam.players[i - 1].hero);
      }
      else {
        $(`#red-p${i}-name`).val('');
        $(`#red-p${i}-hero .player-hero-menu`).dropdown('clear');
      }
    }
    
    $('#popup-display-mode').dropdown('set exactly', this.miscData.popupDisplayMode);
    $('#popup-anim-time').val(this.miscData.popupAnimLength);
  }

  resetTeamData() {
    this.blueTeam = { };
    this.redTeam = { };

    this.displayTeamData();
  }

  resetTeamPlayers() {
    this.blueTeam.players = [];
    this.redTeam.players = [];

    this.displayTeamData();
  }

  swapTeamData() {
    const tmpRed = Object.assign({}, this.redTeam);
    
    // deep copy player data
    if (this.redTeam.players) {
      for (let i = 0; i < this.redTeam.players.length; i++) {
        tmpRed.players[i] = Object.assign({}, this.redTeam.players[i]);
      }
    }

    this.redTeam = Object.assign(this.redTeam, this.blueTeam);

    // since we already did a deep copy of the arrays, this should be ok
    this.blueTeam = tmpRed;

    this.displayTeamData();
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

  resetMatchData() {
    this.match = {};
    this.match.games = [];

    this.displayMatchData();
  }

  updateCasterData() {
    this.casters = {};
    this.casters.one = { name: $('#caster-1-name').val(), social: $('#caster-1-social').val() };
    this.casters.two = { name: $('#caster-2-name').val(), social: $('#caster-2-social').val() };
    this.casters.tournament = $('#tournament-name').val();
  }

  displayCasterData() {
    $('#caster-1-name').val(this.casters.one ? this.casters.one.name : '');
    $('#caster-1-social').val(this.casters.one ? this.casters.one.social : '');
    $('#caster-2-name').val(this.casters.two ? this.casters.two.name : '');
    $('#caster-2-social').val(this.casters.two ? this.casters.two.social : '');
    $('#tournament-name').val(this.casters.tournament);
  }

  setDataSource(src) {
    this.dataSource.active = src;
    this.updateDataSource();
    this.save();
  }

  updateDataSource() {
    this.dataSource.sotsDBLoc = $('#sots-db-location').val();
    this.dataSource.sotsDBCollection = $('#sots-db-collection').dropdown('get value');
  }

  displayDataSource() {
    $('#sots-db-location').val(this.dataSource.sotsDBLoc);
    $('#sots-db-collection').dropdown('set exactly', this.dataSource.sotsDBCollection);
  }
}

function constructState(io) {
  const state = new State();

  // io is a window level variable
  io.on('connection', (socket) => {
    console.log(`New connection from ${socket.id}. Requesting id.`);
    socket.emit('requestID');
    socket.emit('changeTheme', state.theme.folderName);

    socket.on('disconnect', function (reason) {
      state.unregisterOverlay(socket.id, reason);
    });

    socket.on('reportID', (overlayData) => {
      state.registerOverlay(socket, overlayData);
    });

    socket.on('requestState', () => {
      socket.emit('update', state.broadcastSubset());
    });

    socket.on('requestMapPool', () => {
      socket.emit('mapPool', state.match.mapPool);
    });
  });

  return state;
}

exports.State = constructState;