const { heroMenu, statMenu } = require('./util');

let appState;
let dataSource;

// couple static elements
const LTDropdown = `
  <div class="ui fluid selection dropdown lt-mode">
    <i class="dropdown icon"></i>
    <div class="default text">Select Display Mode</div>
    <div class="menu">
      <div class="item" data-value="HGC-hero-draft">HGC Hero Draft Stats</div>
      <div class="item" data-value="player-hero">Player Hero Stats</div>
    </div>
  </div>
`;

const LTAnimDropdown = `
  <div class="ui fluid selection dropdown lt-anim">
    <i class="dropdown icon"></i>
    <div class="default text">Fade</div>
    <div class="menu">
      <div class="item" data-value="fade">Fade</div>
      <div class="item" data-value="fade up">Fade Up</div>
      <div class="item" data-value="fade right">Fade Right</div>
      <div class="item" data-value="fade left">Fade Left</div>
      <div class="item" data-value="horizontal flip">H. Flip</div>
      <div class="item" data-value="slide up">Slide Up</div>
      <div class="item" data-value="fly up">Fly Up</div>
    </div>
  </div>
`

function init() {

}

function initWithState(state) {
  appState = state;
}

function setDataSource(src) {
  dataSource = src;
}

function onLowerThirdConnect(socket) {
  constructLTUI(socket);
}

function onLowerThirdDisconnect(socketID) {
  $(`.lower-third-controls[socket-id="${socketID}"]`).remove();
}

function reloadPlayerLTMenu() {
  populatePlayerLTMenu($('.lower-third-controls .lt-player-name'));
}

function populatePlayerLTMenu(elem) {
  // get players from state
  const values = [];

  if (appState.blueTeam.players) {
    for (const p of appState.blueTeam.players) {
      if (p.name && p.name !== '') {
        values.push({
          value: p.name,
          text: p.name,
          name: p.name,
        });
      }
    }
  }

  if (appState.redTeam.players) {
    for (const p of appState.redTeam.players) {
      if (p.name && p.name !== '') {
        values.push({
          value: p.name,
          text: p.name,
          name: p.name,
        });
      }
    }
  }

  elem.dropdown('change values', values);
}

// this function stages all the changes that will happen once run is clicked.
// basically it's set up so that you first stage changes, then hit a button to display
// this lets you transition between lower thirds (but crossfade is not an option)
function loadLT(socketID, callback) {
  let elem = $(`.lower-third-controls[socket-id="${socketID}"]`);
  elem.find('.lt-load').addClass('disabled loading').text('Loading...');
  elem.find('.lt-loadrun').addClass('disabled loading').text('Loading...');
  elem.find('.lt-load-status').text('Loading Data...');

  let loadData = {
    type: elem.find('.lt-mode').dropdown('get value'),
    duration: elem.find('.lt-dur').val(),
    hero: elem.find('.lt-hero-menu').dropdown('get value'),
    player: elem.find('.lt-player-name').dropdown('get value'),
    animMode: elem.find('.lt-anim').dropdown('get value'),
    wildcard: {
      name: elem.find('.lt-wildcard-stat').dropdown('get value'),
      type: elem.find('.lt-wildcard-type').dropdown('get value'),
    },
  };

  if (loadData.hero in heroesTalents._heroes) {
    loadData.heroClassname = heroesTalents._heroes[loadData.hero].attributeId;
    loadData.heroRole = heroesTalents.role(loadData.hero);
  }

  // callback required
  dataSource.getLTData(loadData, function(data) {
    elem.find('.lt-load').removeClass('disabled loading').html('<i class="sync icon"></i>');
    elem.find('.lt-loadrun').removeClass('disabled loading').html('<i class="fast forward icon"></i>');

    if (data.error) {
      elem.find('.attached.message').addClass('error');
      elem.find('.lt-load-status').text(`Error: ${data.error}`);
    }
    else {
      loadData.data = data;

      appState.sendTo(socketID, 'statLoad', loadData);
      elem.find('.attached.message').removeClass('error');
      elem.find('.lt-load-status').text(`Ready: ${elem.find('.lt-mode').dropdown('get text')}, Hero: ${loadData.hero}`);

      if (callback) {
        callback();
      }
    }
  });
}

function runLT(socketID) {
  appState.sendTo(socketID, 'run', null);
  showMessage(`Lower Third: Running ${socketID}`);
}

function loadAndRunLT(socketID) {
  loadLT(socketID, function() {
    runLT(socketID);
  });
}

function endLT(socketID) {
  appState.sendTo(socketID, 'end', null);
}

function toggleVis(socketID, elem) {
  if (elem.hasClass('green')) {
    // turn off
    appState.sendTo(socketID, 'hide', null);
    elem.removeClass('green');
    elem.find('.icon').addClass('slash');
  }
  else {
    // turn on
    appState.sendTo(socketID, 'show', null);
    elem.addClass('green');
    elem.find('.icon').removeClass('slash');
  }
}

// builds the lower third ui and adds proper handlers
function constructLTUI(socket) {
  let elem = `
    <div class="ui basic segment lower-third-controls" socket-id="${socket.id}">
      <div class="ui attached message">
        <div class="header">Lower Third Controls</div>
        <p>
          <strong>Load Status</strong>: <span class="lt-load-status">Nothing Loaded</span><br/>
          <strong>ID</strong>: ${socket.id}
        </p>
      </div>
      <form class="ui form attached fluid segment">
        <div class="fields">
          <div class="seven wide field">
            <label>Data Display Mode</label>
            ${LTDropdown}
          </div>
          <div class="two wide field">
            <label>Animation</label>
            ${LTAnimDropdown}
          </div>
          <div class="two wide field">
            <label>Duration (s)</label>
            <input type="text" name="lt-dur" class="lt-dur">
          </div>
          <div class="one wide field">
            <label>Load</label>
            <div class="ui fluid blue icon button lt-load"><i class="sync icon"></i></div>
          </div>
          <div class="one wide field">
            <label>Load-R</label>
            <div class="ui fluid blue icon button lt-loadrun"><i class="fast forward icon"></i></div>
          </div>
          <div class="one wide field">
            <label>Run</label>
            <div class="ui fluid green icon button lt-run"><i class="play icon"></i></div>
          </div>
          <div class="one wide field">
            <label>End</label>
            <div class="ui fluid red icon button lt-end"><i class="stop icon"></i></div>
          </div>
          <div class="one wide field">
            <label>Vis</label>
            <div class="ui fluid icon button lt-vis"><i class="eye icon"></i></div>
          </div>
        </div>
        <div class="fields">
          <div class="six wide field">
            <label>Hero</label>
            ${heroMenu(heroesTalents, 'lt-hero-menu')}
          </div>
          <div class="four wide field">
            <label>Player (BTag optional)</label>
            <div class="ui fluid search selection dropdown lt-player-name">
              <input type="hidden" name="lt-player-name">
              <i class="dropdown icon"></i>
              <div class="default text">Player Name</div>
              <div class="menu">
              </div>
            </div>
          </div>
          <div class="four wide field">
            <label>Wildcard Stat</label>
            ${statMenu('lt-wildcard-stat')}
          </div>
          <div class="two wide field">
            <label>Stat Mode</label>
            <div class="ui fluid selection dropdown lt-wildcard-type">
              <i class="dropdown icon"></i>
              <div class="default text"></div>
              <div class="menu">
                <div class="item" data-value="averages">Avg.</div>
                <div class="item" data-value="min">Min</div>
                <div class="item" data-value="max">Max</div>
                <div class="item" data-value="median">Median</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;

  $('#connected-stat-screens').append(elem);

  // handlers
  const e = $(`.lower-third-controls[socket-id="${socket.id}"]`);
  
  e.find('.lt-hero-menu').dropdown();
  e.find('.lt-mode').dropdown();
  e.find('.lt-anim').dropdown();
  e.find('.lt-anim').dropdown('set exactly', 'fade');
  e.find('.lt-wildcard-stat').dropdown({ fullTextSearch: true });
  e.find('.lt-wildcard-stat').dropdown('set exactly', 'timeDeadPct');
  e.find('.lt-wildcard-type').dropdown();
  e.find('.lt-wildcard-type').dropdown('set exactly', 'averages');
  e.find('.lt-player-name').dropdown({
    allowAdditions: true,
  });
  populatePlayerLTMenu(e.find('.lt-player-name'));

  e.find('.lt-load').click(() => loadLT(socket.id));
  e.find('.lt-loadrun').click(() => loadAndRunLT(socket.id));
  e.find('.lt-run').click(() => runLT(socket.id));
  e.find('.lt-end').click(() => endLT(socket.id));
  e.find('.lt-vis').click(function () { toggleVis(socket.id, $(this)); });
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.onLowerThirdConnect = onLowerThirdConnect;
exports.onLowerThirdDisconnect = onLowerThirdDisconnect;
exports.setDataSource = setDataSource;
exports.reloadPlayerLTMenu = reloadPlayerLTMenu;