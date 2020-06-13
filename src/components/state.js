// the application state. Should send events to all sockets on change.
// this object also kinda manages relations between the sockets and other elements.
const settings = require('electron-settings');
const fs = require('fs-extra');
const path = require('path');
const DataSource = require('./data-source');
const Tournament = require('./tournament');
const Ticker = require('./ticker');
const Keybinds = require('./keybinds');

class State {
  constructor() {
    this.loadState();

    // always clear overlays
    this.overlays = {};

    this.rootOBS = path.join(__dirname, '../obs_src');

    if (!fs.existsSync(this.rootOBS)) {
      this.rootOBS = path.join(process.resourcesPath, 'app', 'src', 'obs_src');
    }

    // ensure text folder exists on load
    try {
      fs.ensureDirSync(path.join(this.rootOBS, 'text'));
    }
    catch (e) {
      console.log(e);
      showMessage(
        'Error: unable to create text output directory. Check console for details.',
        'negative',
      );
    }

    Keybinds.setKeybinds(this);
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
    this.keybinds = settings.get('keybinds');
    this.tournament = settings.get('tournament');
    this.ticker = settings.get('ticker');

    if (!this.blueTeam) {
      this.blueTeam = {};
    }
    if (!this.redTeam) {
      this.redTeam = {};
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
    if (!this.keybinds) {
      this.keybinds = Keybinds.default();
    }
    if (!this.tournament) {
      this.tournament = {};
    }
    if (!this.ticker) {
      this.ticker = {
        items: [],
        options: {},
      };
    }
  }

  renderState() {
    this.displayTeamData();
    this.displayMatchData();
    this.displayCasterData();
    this.displayDataSource();
    this.displayTournamentData();
    this.displayTickerData();

    Keybinds.displayKeybinds(this);

    if (this.theme.data) {
      $('#set-theme').dropdown('set value', this.theme.data.name);
    }
    else {
      $('#set-theme').dropdown('set value', '');
    }
    Themes.renderThemeCredits(this.theme.data);
  }

  // expected format:
  // name
  // and that's about it for now.
  registerOverlay(socket, overlayData) {
    this.overlays[socket.id] = overlayData;
    this.overlays[socket.id].socket = socket;

    $('#overlay-table').append(
      `<tr socket-id="${socket.id}"><td>${overlayData.name}</td><td>${socket.id}</td></tr>`,
    );

    // lower thirds have an additional callback. this should error if the function is not set.
    if (overlayData.name === 'Lower Third') {
      this.onLowerThirdConnect(socket);
    }
    else if (overlayData.name === 'Player Profile') {
      this.onPlayerProfileConnect(socket);
    }

    console.log(`Registered '${overlayData.name}' from ${socket.id}.`);
  }

  unregisterOverlay(socketID) {
    console.log(
      `Socket ${socketID} disconnected. Deleted overlay ${this.overlays[socketID].name}.`,
    );
    $(`#overlay-table tr[socket-id="${socketID}"]`).remove();

    if (this.overlays[socketID].name === 'Lower Third') {
      this.onLowerThirdDisconnect(socketID);
    }
    else if (this.overlays[socketID].name === 'Player Profile') {
      this.onPlayerProfileDisconnect(socketID);
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

  sendAll(event, data) {
    io.sockets.emit(event, data);
  }

  // add functions to this to update the state
  updateAndBroadcast() {
    this.updateTeamData();
    this.updateMatchData();
    this.updateCasterData();
    this.updateDataSource();
    this.updateTournamentData();
    this.updateTickerData();

    this.broadcastStateChange();
    this.save();
  }

  // special separate update function for the ticker
  updateAndBroadcastTicker() {
    this.updateTickerData();
    this.save();

    io.sockets.emit('tickerUpdate', this.broadcastSubset());
    showMessage('Ticker Updated', 'positive');
  }

  // add things to this section to broadcast to the connected frames
  broadcastSubset() {
    return {
      blueTeam: this.blueTeam,
      redTeam: this.redTeam,
      match: this.match,
      rootOBS: this.rootOBS,
      theme: this.theme,
      casters: this.casters,
      misc: this.miscData,
      tournament: this.tournament,
      ticker: this.ticker,
    };
  }

  broadcastStateChange() {
    io.sockets.emit('update', this.broadcastSubset());

    // snapshot some stuff to disk
    try {
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'blue_team.txt'), this.blueTeam.name, {
        flag: 'w+',
      });
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'red_team.txt'), this.redTeam.name, {
        flag: 'w+',
      });
      fs.writeFileSync(
        path.join(this.rootOBS, 'text', 'blue_team_score.txt'),
        this.blueTeam.score,
        { flag: 'w+' },
      );
      fs.writeFileSync(path.join(this.rootOBS, 'text', 'red_team_score.txt'), this.redTeam.score, {
        flag: 'w+',
      });
      fs.writeFileSync(
        path.join(this.rootOBS, 'text', 'tournament_name.txt'),
        this.casters.tournament,
        { flag: 'w+' },
      );

      if (this.casters.one) {
        fs.writeFileSync(
          path.join(this.rootOBS, 'text', 'caster_one_name.txt'),
          this.casters.one.name,
          { flag: 'w+' },
        );
        fs.writeFileSync(
          path.join(this.rootOBS, 'text', 'caster_one_social.txt'),
          this.casters.one.social,
          { flag: 'w+' },
        );
      }

      if (this.casters.two) {
        fs.writeFileSync(
          path.join(this.rootOBS, 'text', 'caster_two_name.txt'),
          this.casters.two.name,
          { flag: 'w+' },
        );
        fs.writeFileSync(
          path.join(this.rootOBS, 'text', 'caster_two_social.txt'),
          this.casters.two.social,
          { flag: 'w+' },
        );
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  broadcastThemeChange() {
    this.updateTheme();
    io.sockets.emit('changeTheme', this.theme);
    this.save();
  }

  updateTheme() {
    // get val from the dropdown, load the theme data
    this.theme.data = Themes.getTheme($('#theme-menu').dropdown('get value'));

    if (!this.theme) {
      this.theme = {};
    }
    else {
      this.theme.overrides = Themes.getOverrides();
    }
  }

  updateThemeFolder() {
    // check folder for relative pathing
    this.theme.themeFolder = $('#theme-location').val();
    this.theme.themeRel = path.relative(this.rootOBS, this.theme.themeFolder);
    this.save();
  }

  // add things to this function to save on update
  save() {
    settings.set('blueTeam', this.blueTeam);
    settings.set('redTeam', this.redTeam);
    settings.set('match', this.match);
    settings.set('theme', this.theme);
    settings.set('casters', this.casters);
    settings.set('dataSource', this.dataSource);
    settings.set('miscData', this.miscData);
    settings.set('tournament', this.tournament);
    settings.set('ticker', this.ticker);
  }

  updateKeybinds() {
    Keybinds.updateKeybinds(this);
    this.saveKeybinds();
  }

  restoreDefaultKeybinds() {
    this.keybinds = Keybinds.default();
    Keybinds.displayKeybinds(this);
    this.saveKeybinds();
  }

  saveKeybinds() {
    settings.set('keybinds', this.keybinds);
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
        name: $(`input[name="blue-p${i}-name"]`).val(),
        hero: $(`#blue-p${i}-hero .player-hero-menu`).dropdown('get value'),
        classname: '',
      };

      if (bluep.hero in heroesTalents._heroes) {
        bluep.classname = heroesTalents._heroes[bluep.hero].attributeId;
      }
      this.blueTeam.players.push(bluep);

      const redp = {
        name: $(`input[name="red-p${i}-name"]`).val(),
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
        $(`input[name="blue-p${i}-name"]`).val(this.blueTeam.players[i - 1].name);
        $(`#blue-p${i}-hero .player-hero-menu`).dropdown(
          'set exactly',
          this.blueTeam.players[i - 1].hero,
        );
      }
      else {
        $(`input[name="blue-p${i}-name"]`).val('');
        $(`#blue-p${i}-hero .player-hero-menu`).dropdown('clear');
      }

      if (this.blueTeam.players) {
        $(`input[name="red-p${i}-name"]`).val(this.redTeam.players[i - 1].name);
        $(`#red-p${i}-hero .player-hero-menu`).dropdown(
          'set exactly',
          this.redTeam.players[i - 1].hero,
        );
      }
      else {
        $(`input[name="red-p${i}-name"]`).val('');
        $(`#red-p${i}-hero .player-hero-menu`).dropdown('clear');
      }
    }

    $('#popup-display-mode').dropdown('set exactly', this.miscData.popupDisplayMode);
    $('#popup-anim-time').val(this.miscData.popupAnimLength);
  }

  resetTeamData() {
    this.blueTeam = {};
    this.redTeam = {};

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
    const pool = $('#map-pool').dropdown('get value');
    if (pool.length > 0) {
      this.match.mapPool = pool.split(',');
    }

    // series
    this.match.bestOf = $('#best-of').dropdown('get value');
    this.match.textOverride = $('#best-of-override').val();

    // bans
    this.match.blueMapBan = $('#blue-map-ban').dropdown('get value');
    this.match.redMapBan = $('#red-map-ban').dropdown('get value');
    this.match.syncd = $('#match-score-data-sync').checkbox('is checked');

    // games, this'll be fun
    this.match.games = [];
    for (let i = 0; i < this.match.bestOf; i++) {
      this.match.games.push(this.getGameData(i + 1));
    }
  }

  swapMatchData() {
    // ban swap
    const tmp = this.match.blueMapBan;
    this.match.blueMapBan = this.match.redMapBan;
    this.match.redMapBan = tmp;

    // map pick/win swap
    for (let i = 0; i < this.match.bestOf; i++) {
      const pick = this.match.games[i].pick;
      if (pick !== '') {
        this.match.games[i].pick = pick === 'blue' ? 'red' : 'blue';
      }

      const win = this.match.games[i].win;
      if (win !== '') {
        this.match.games[i].win = win === 'blue' ? 'red' : 'blue';
      }
    }

    this.displayMatchData();
  }

  getGameData(gameNumber) {
    const elem = $(`.game-data[game-number="${gameNumber}"]`);

    return {
      map: elem.find('.map-menu').dropdown('get value'),
      pick: elem.find('.team-pick-menu').dropdown('get value'),
      win: elem.find('.team-winner-menu').dropdown('get value'),
    };
  }

  displayMatchData() {
    // map pool
    $('#map-pool').dropdown('set exactly', this.match.mapPool);

    // series
    $('#best-of').dropdown('set exactly', this.match.bestOf);
    $('#best-of-override').val(this.match.textOverride);

    // bans
    $('#blue-map-ban').dropdown(
      'set exactly',
      this.match.blueMapBan ? this.match.blueMapBan.split(',') : '',
    );
    $('#red-map-ban').dropdown(
      'set exactly',
      this.match.redMapBan ? this.match.redMapBan.split(',') : '',
    );

    // individual match data
    this.displayGameData(this.match.bestOf);

    if (this.match.syncd === true) {
      $('#match-score-data-sync').checkbox('check');
    }
    else {
      $('#match-score-data-sync').checkbox('uncheck');
    }
  }

  displayGameData(numGames) {
    let count = numGames;

    if (isNaN(numGames)) {
      count = 0;
    }

    if (this.match.games) {
      MapData.deleteGameData();
      for (let i = 0; i < count; i++) {
        this.createGameData(i + 1, this.match.games[i]);
      }
    }
  }

  createGameData(gameNumber, data) {
    MapData.addGameData(gameNumber);

    if (!data) data = {};

    const elem = $(`.game-data[game-number="${gameNumber}"]`);
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
    this.casters.one = {
      name: $('#caster-1-name').val(),
      social: $('#caster-1-social').val(),
      size: $('#caster-1-size').dropdown('get value'),
    };
    this.casters.two = {
      name: $('#caster-2-name').val(),
      social: $('#caster-2-social').val(),
      size: $('#caster-2-size').dropdown('get value'),
    };
    this.casters.tournament = $('#tournament-name').val();
    this.casters.count = parseInt($('#caster-count').dropdown('get value'));
    this.casters.sidebar = {
      title: $('#sidebar-title').val(),
      text: $('#sidebar-text').val(),
    };
    this.casters.frame = parseInt($('#frame-variant').dropdown('get value'));
    this.casters.playerPool = $('#player-pool').val();
    this.casters.eventLogo = $('#event-logo input').val();
  }

  displayCasterData() {
    $('#caster-1-name').val(this.casters.one ? this.casters.one.name : '');
    $('#caster-1-social').val(this.casters.one ? this.casters.one.social : '');
    $('#caster-1-size').dropdown('set exactly', this.casters.one ? this.casters.one.size : '');
    $('#caster-2-name').val(this.casters.two ? this.casters.two.name : '');
    $('#caster-2-social').val(this.casters.two ? this.casters.two.social : '');
    $('#caster-2-size').dropdown('set exactly', this.casters.two ? this.casters.two.size : '');
    $('#caster-count').dropdown('set exactly', this.casters.count ? this.casters.count : 2);
    $('#tournament-name').val(this.casters.tournament);
    $('#sidebar-title').val(this.casters.sidebar ? this.casters.sidebar.title : '');
    $('#sidebar-text').val(this.casters.sidebar ? this.casters.sidebar.text : '');
    $('#frame-variant').dropdown('set exactly', this.casters.frame ? this.casters.frame : '');
    $('#player-pool').val(this.casters.playerPool);
    $('#event-logo input').val(this.casters.eventLogo);
  }

  setDataSource(src) {
    this.dataSource.active = src;
    this.updateDataSource();
    this.save();
  }

  updateDataSource() {
    this.dataSource.sotsDBLoc = $('#sots-db-location').val();
    this.dataSource.sotsDBCollection = $('#sots-db-collection').dropdown('get value');
    this.dataSource.hpApiKey = $('#hp-api-key').val();
    this.dataSource.hpDivision = $('#hp-division-select').dropdown('get value');
    this.dataSource.dataGrabber = $('#data-grabber-menu').dropdown('get value');
    this.dataSource.remoteURL = $('#remote-sots-url').val();
  }

  displayDataSource() {
    $('#sots-db-location').val(this.dataSource.sotsDBLoc);
    $('#sots-db-collection').dropdown('set exactly', this.dataSource.sotsDBCollection);
    $('#data-grabber-menu').dropdown('set exactly', this.dataSource.dataGrabber);
    $('#set-replay-folder').val(this.dataSource.replayFolder);
    $('#hp-api-key').val(this.dataSource.hpApiKey);
    $('#hp-division-select').dropdown('set exactly', this.dataSource.hpDivision);
    $('#remote-sots-url').val(this.dataSource.remoteURL);
  }

  setLastReplayData(data) {
    this.lastReplayData = data;

    // other handlers after watcher reports
    if (this.lastReplayData.status !== 1) {
      showMessage(
        `Error parsing most recent replay file. Status code ${this.lastReplayData.status}`,
        'error',
      );
    }
    else {
      showMessage(
        `Received Updated Match Data on ${this.lastReplayData.match.date} from ${
          this.lastReplayData.match.filename
        }`,
        'info',
      );
    }
    // console.log(this.lastReplayData);
  }

  setWatchLocation() {
    this.dataSource.replayFolder = $('#set-replay-folder').val();

    bgWindow.webContents.send('startWatcher', this.dataSource.replayFolder);

    // save data source settings
    settings.set('dataSource', this.dataSource);
    console.log(`started watching ${this.dataSource.replayFolder}`);
  }

  clearTournamentData() {
    this.tournament.standings = [];
    this.tournament.recent = [];
    this.tournament.bracket = {};
  }

  displayTournamentData() {
    Tournament.render(this.tournament);
  }

  updateTournamentData() {
    this.tournament.standings = Tournament.getStandings();
    this.tournament.standingsSettings = Tournament.getStandingsSettings();
    this.tournament.bracket = Tournament.getBracket();
  }

  addStanding(place, team, win, loss, logo) {
    this.tournament.standings.push({
      team,
      place,
      win,
      loss,
      logo,
    });
  }

  addRecent(team1, team2, team1Score, team2Score, team1Logo, team2Logo) {
    this.tournament.recent.push({
      team1,
      team2,
      team1Score,
      team2Score,
      team1Logo,
      team2Logo,
    });
  }

  updateTickerData() {
    this.ticker = {};

    this.ticker.items = Ticker.getItems();
    this.ticker.options = Ticker.getOptions();
  }

  displayTickerData() {
    Ticker.renderItems(this.ticker.items);
    Ticker.renderOptions(this.ticker.options);
  }

  clearTickerItems() {
    this.ticker.items = [];
    this.displayTickerData();
  }

  setTickerItems(items) {
    this.ticker.items = items;
    this.displayTickerData();
  }

  // doesn't actually add to the ticker, returns in case other ops needed
  convertRecentToTicker() {
    const items = [];
    for (let i = 0; i < this.tournament.recent.length; i++) {
      const item = this.tournament.recent[i];

      items.push({
        order: i,
        category: 'Recent Results',
        mode: 'recent',
        blueTeam: item.team1,
        redTeam: item.team2,
        blueScore: item.team1Score,
        redScore: item.team2Score,
        blueLogo: item.team1Logo,
        redLogo: item.team2Logo,
      });
    }

    return items;
  }

  convertScoreboardToTicker() {
    const items = [];
    const category = $('#tournament-name').val();

    for (let i = 0; i < this.tournament.standings.length; i++) {
      const item = this.tournament.standings[i];

      items.push({
        order: i,
        category,
        logo: item.logo,
        name: item.team,
        rank: item.place,
        blueTeam: item.team,
        blueLogo: item.logo,
        blueScore: item.place,
        mode: 'ranking',
      });
    }

    return items;
  }

  setTickerRanking() {
    this.clearTickerItems();
    this.setTickerItems(this.convertScoreboardToTicker());
    this.updateAndBroadcastTicker();
  }
}

function constructState(io) {
  const state = new State();

  // io is a window level variable
  io.on('connection', (socket) => {
    console.log(`New connection from ${socket.id}. Requesting id.`);
    socket.emit('requestID');
    socket.emit('changeTheme', state.theme);

    socket.on('disconnect', function (reason) {
      state.unregisterOverlay(socket.id, reason);
    });

    socket.on('reportID', (overlayData) => {
      state.registerOverlay(socket, overlayData);
    });

    socket.on('requestState', () => {
      socket.emit('update', state.broadcastSubset());
    });

    socket.on('requestTicker', () => {
      socket.emit('tickerUpdate', state.broadcastSubset());
    });

    socket.on('requestMapPool', () => {
      socket.emit('mapPool', state.match.mapPool);
    });
  });

  return state;
}

exports.State = constructState;
