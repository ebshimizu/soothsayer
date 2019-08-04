const StatData = require('../stats-of-the-storm/js/game-data/detail-stat-string');
const Formatter = require('../stats-of-the-storm/js/util/formatters');
const { updatePlayerPoolMenus } = require('./team-data');

let appState;
let dataSource;

const generalStatOrder = ['winPct', 'KDA', 'KillParticipation', 'levelAdvPct', 'TimeSpentDead', 'heroPool'];

const statOrders = {
  'role-assassin': ['HeroDamage', 'HighestKillStreak'],
  'role-warrior': ['damageTakenPerDeath', 'TimeCCdEnemyHeroes', 'hardCCTime'],
  'role-support': ['Healing', 'ClutchHealsPerformed'],
  'role-offlane': ['ExperienceContribution', 'TeamfightHeroDamage'],
};

const playerProfileDropdown = `
  <div class="ui fluid selection dropdown pp-mode">
    <i class="dropdown icon"></i>
    <div class="default text">Select Stat Set</div>
    <div class="menu">
      <div class="item" data-value="role-assassin">Role: Assassin</div>
      <div class="item" data-value="role-warrior">Role: Warrior</div>
      <div class="item" data-value="role-support">Role: Healer</div>
      <div class="item" data-value="role-offlane">Role: Offlane</div>
    </div>
  </div>
`;

function constructProfileUI(socket) {
  return `
    <div class="ui basic segment player-profile-controls" socket-id="${socket.id}">
      <div class="ui attached message">
        <div class="header">Player Profile Controls</div>
        <p>
          <strong>Load Status</strong>: <span class="pp-load-status">Nothing Loaded</span><br />
          <strong>ID</strong>: ${socket.id}
        </p>
      </div>
      <div class="ui form attached fluid segment">
        <div class="fields">
          <div class="seven wide field">
            <label>Stat Set</label>
            ${playerProfileDropdown}
          </div>
          <div class="six wide field">
            <label>Player (BTag optional)</label>
            <div class="ui fluid search selection dropdown pp-player-name">
              <i class="dropdown icon"></i>
              <div class="default text">Player Name</div>
              <div class="menu">
              </div>
            </div>
          </div>
          <div class="one wide field">
            <label>Load</label>
            <div class="ui fluid blue icon button pp-load"><i class="sync icon"></i></div>
          </div>
          <div class="one wide field">
            <label>Load-R</label>
            <div class="ui fluid green icon button pp-loadrun"><i class="fast forward icon"></i></div>
          </div>
          <div class="one wide field">
            <label>Run</label>
            <div class="ui fluid green icon button pp-run"><i class="play icon"></i></div>
          </div>
        </div>
        <div class="fields">
          <div class="four wide field">
            <label>Twitter</label>
            <div class="ui left icon input pp-twitter">
              <input type="text">
              <i class="twitter icon"></i>
            </div>
          </div>
          <div class="four wide field">
            <label>Twitch</label>
            <div class="ui left icon input pp-twitch">
              <input type="text">
              <i class="twitch icon"></i>
            </div>
          </div>
          <div class="four wide field">
            <label>Team (for logo)</label>
            <div class="ui fluid selection dropdown pp-team">
              <i class="dropdown icon"></i>
              <div class="default text">Select Team</div>
              <div class="menu">
                <div class="item" data-value="none">None</div>
                <div class="item" data-value="blue"><div class="ui blue empty circular label"></div>Blue</div>
                <div class="item" data-value="red"><div class="ui red empty circular label"></div>Red</div>
              </div>
            </div>
          </div>
          <!-- <div class="eight wide field">
            <label>Notes</label>
            
          </div> -->
        </div>
      </div>
    </div>
  `;
}

function processPlayerProfileData(data, type) {
  // process loaded data
  // stat rows (formatted, proper names, set order)
  const ret = {};
  const statRows = [];
  const statOrder = generalStatOrder.concat(statOrders[type]);

  for (const stat of statOrder) {
    const statRow = {
      key: stat,
      name: StatData[stat],
      raw: data.stats[stat],
      val: Math.round(data.stats[stat]).toLocaleString(undefined, { maximumFractionDigits: 0 }),
    };

    if (stat === 'winPct') {
      statRow.name = 'Win Rate';

      if (data.wins) {
        statRow.val = `${((data.wins / data.games) * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}%`;
        statRow.raw = data.wins / data.games;
      }
      else {
        statRow.val = `${(statRow.raw * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}%`;
      }
    }
    else if (stat === 'ClutchHealsPerformed') {
      statRow.val = statRow.raw.toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
    else if (stat === 'heroPool') {
      statRow.name = 'Hero Pool';

      if (data.heroPool) {
        statRow.val = data.heroPool;
        statRow.raw = data.heroPool;
      }
    }
    else if (stat === 'KDA') {
      statRow.val = statRow.raw.toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
    else if (stat === 'levelAdvPct') {
      statRow.val = `${(statRow.raw * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}%`;
      statRow.name = 'Level Advantage Time';
    }
    else if (stat === 'hardCCTime') {
      statRow.name = 'Hard CC Time';
      statRow.raw =
        data.stats.TimeRootingEnemyHeroes +
        data.stats.TimeSilencingEnemyHeroes +
        data.stats.TimeStunningEnemyHeroes;
      statRow.val = Formatter.formatSeconds(statRow.raw);
    }
    else if (stat === 'TimeCCdEnemyHeroes') {
      statRow.name = 'Soft CC Time';
      statRow.val = Formatter.formatSeconds(statRow.raw);
    }
    else if (stat === 'TimeSpentDead') {
      statRow.val = Formatter.formatSeconds(statRow.raw)
    }
    else if (stat === 'KillParticipation') {
      statRow.val = `${(statRow.raw * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}%`;
    }

    if (statRow.raw !== undefined) {
      statRows.push(statRow);
    }
  }

  // favored heroes
  // top 3 for now, reverse sort on games then win percent, then raw wins
  data.heroes.sort(function (a, b) {
    if (a.games < b.games) return 1;
    else if (a.games > b.games) return -1;

    if (a.winPct < b.winPct) return 1;
    else if (a.winPct > b.winPct) return -1;

    if (a.wins < b.wins) return 1;
    else if (a.wins > b.wins) return -1;
    return 0;
  });

  ret.heroes = data.heroes.slice(0, 3);
  ret.stats = statRows;

  // hero attribute id
  for (let i = 0; i < ret.heroes.length; i++) {
    ret.heroes[i].classname = heroesTalents._heroes[ret.heroes[i].name].attributeId;
    ret.heroes[i].winPct = Formatter.formatStat('pct', ret.heroes.winPct);
  }

  console.log(ret);
  return ret;
}

function loadPlayerProfile(socketID, cb) {
  const elem = $(`.player-profile-controls[socket-id="${socketID}"]`);

  elem.find('.button').addClass('loading disabled');
  elem.find('.pp-load-status').text('Loading...');
  elem.find('.attached.message').removeClass('error');

  const loadData = {
    type: elem.find('.pp-mode').dropdown('get value'),
    twitch: elem.find('.pp-twitch input').val(),
    twitter: elem.find('.pp-twitter input').val(),
    name: elem.find('.pp-player-name').dropdown('get text'),
    logo: '',
  };
  const modeText = elem.find('.pp-mode').dropdown('get text');

  // logo
  const team = elem.find('.pp-team').dropdown('get value');
  if (team === 'blue') {
    loadData.logo = $('#team-blue-logo input').val();
  }
  else if (team === 'red') {
    loadData.logo = $('#team-red-logo input').val();
  }

  dataSource.allPlayerStats(loadData.name, function (data) {
    if (data.error) {
      elem.find('.pp-load-status').text(`Error: ${data.error}`);
      elem.find('.attached.message').addClass('error');
      elem.find('.button').removeClass('loading disabled');

      cb(false);
      return;
    }

    loadData.stats = processPlayerProfileData(data, loadData.type);
    appState.sendTo(socketID, 'statLoad', loadData);

    elem.find('.pp-load-status').text(`Loaded ${loadData.name}'s ${modeText} Profile`);
    elem.find('.button').removeClass('loading disabled');

    cb(true);
  });
}

function renderPlayerProfile(socketID) {
  appState.sendTo(socketID, 'render', null);
  showMessage(`Player Profile: Rendering ${socketID}`);
}

function loadAndRunPlayerProfile(socketID) {
  loadPlayerProfile(socketID, function (ok) {
    if (ok) {
      renderPlayerProfile(socketID);
    }
  });
}

function init() {}

function initWithState(state) {
  appState = state;
}

function setDataSource(src) {
  dataSource = src;
}

function onPlayerProfileConnect(socket) {
  // construct the ui element
  $('#connected-stat-player-profiles').append(constructProfileUI(socket));

  // callbacks
  const elem = $(`.player-profile-controls[socket-id="${socket.id}"]`);

  elem.find('.pp-mode').dropdown();
  elem.find('.pp-mode').dropdown('set exactly', 'role-assassin');
  elem.find('.pp-team').dropdown();
  elem.find('.pp-player-name').dropdown({
    allowAdditions: true,
  });
  elem.find('.pp-load').click(() => {
    loadPlayerProfile(socket.id, () => {});
  });
  elem.find('.pp-loadrun').click(() => {
    loadAndRunPlayerProfile(socket.id);
  });
  elem.find('.pp-run').click(() => {
    renderPlayerProfile(socket.id);
  });
  updatePlayerPoolMenus();
}

function onPlayerProfileDisconnect(socketID) {
  // delete the ui element
  $(`.player-profile-controls[socket-id="${socketID}"]`).remove();
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.setDataSource = setDataSource;
exports.onPlayerProfileConnect = onPlayerProfileConnect;
exports.onPlayerProfileDisconnect = onPlayerProfileDisconnect;
