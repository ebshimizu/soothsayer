const { heroMenu } = require('./util');

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

// this function stages all the changes that will happen once run is clicked.
// basically it's set up so that you first stage changes, then hit a button to display
// this lets you transition between lower thirds (but crossfade is not an option)
function loadLT(socketID) {
  let elem = $(`.lower-third-controls[socket-id="${socketID}"]`);
  elem.find('.lt-load').addClass('disabled loading').text('Loading...');
  elem.find('.lt-load-status').text('Loading Data...');

  let loadData = {
    type: elem.find('.lt-mode').dropdown('get value'),
    duration: elem.find('.lt-dur').val(),
    hero: elem.find('.lt-hero-menu').dropdown('get value'),
    player: elem.find('.lt-player-name').val(),
  };

  // callback required
  dataSource.getLTData(loadData, function(data) {
    if (data.error) {
      elem.find('.attached.message').addClass('error');
      elem.find('.lt-load-status').text(`Error: ${data.error}`);
    }
    else {
      loadData.data = data;

      appState.sendTo(socketID, 'statLoad', loadData);
      elem.find('.attached.message').removeClass('error');
      elem.find('.lt-load-status').text(`Ready: ${elem.find('.lt-mode').dropdown('get text')}, Hero: ${loadData.hero}`);
    }

    elem.find('.lt-load').removeClass('disabled loading').text('Load');
  });
}

function runLT(socketID) {

}

function endLT(socketID) {

}

// builds the lower third ui and adds proper handlers
function constructLTUI(socket) {
  let elem = `
    <div class="lower-third-controls" socket-id="${socket.id}">
      <div class="ui attached message">
        <div class="header">Lower Third Controls</div>
        <p>
          <strong>Load Status</strong>: <span class="lt-load-status">Nothing Loaded</span><br/>
          <strong>ID</strong>: ${socket.id}
        </p>
      </div>
      <form class="ui form attached fluid segment">
        <div class="fields">
          <div class="eight wide field">
            <label>Data Display Mode</label>
            ${LTDropdown}
          </div>
          <div class="two wide field">
            <label>Duration</label>
            <input type="text" name="lt-dur" class="lt-dur">
          </div>
          <div class="two wide field">
            <label>Load</label>
            <div class="ui fluid blue button lt-load">Load</div>
          </div>
          <div class="two wide field">
            <label>Run</label>
            <div class="ui fluid green button lt-run">Run</div>
          </div>
          <div class="two wide field">
            <label>End</label>
            <div class="ui fluid red button lt-end">End</div>
          </div>
        </div>
        <div class="fields">
          <div class="eight wide field">
            <label>Hero</label>
            ${heroMenu(heroesTalents, 'lt-hero-menu')}
          </div>
          <div class="eight wide field">
            <label>Player (BTag optional)</label>
            <input type="text" name="lt-player-name" class="lt-player-name">
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

  e.find('.lt-load').click(() => loadLT(socket.id));
  e.find('.lt-run').click(() => runLT(socket.id));
  e.find('.lt-end').click(() => endLT(socket.id));
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.onLowerThirdConnect = onLowerThirdConnect;
exports.onLowerThirdDisconnect = onLowerThirdDisconnect;
exports.setDataSource = setDataSource;