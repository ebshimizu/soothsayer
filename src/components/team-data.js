// this file manages callbacks required for the team data entry page
const { dialog } = require('electron').remote;
const path = require('path');
const fs = require('fs-extra');
const { heroMenu } = require('./util');
let appState;

function initTeamData() {
  $('#team-data .find-logo .browse.button').click(findTeamLogo);
  $('#team-data .find-logo .clear-field.button').click(clearField);
  $('#popup-display-mode').dropdown();
  $('.player-entry').dropdown({
    allowAdditions: true,
  });

  for (const i of [1, 2, 3, 4, 5]) {
    $(`#blue-p${i}-hero`).html(heroMenu(heroesTalents, 'player-hero-menu'));
    $(`#red-p${i}-hero`).html(heroMenu(heroesTalents, 'player-hero-menu'));
  }

  $('#team-data .player-hero-menu').dropdown();
}

function initWithState(state) {
  appState = state;

  $('#team-data-swap').click(() => state.swapTeamData());
  $('#team-data-clear').click(() => state.resetTeamData());
  $('#player-popup-show').click(() => {
    showMessage('Running Player Name Popups', 'positive');
    state.sendAll('runPopups', {})
  });
  $('#player-pool').focusout(updatePlayerPoolMenus);
  updatePlayerPoolMenus();
}

// this context: clicked element
function findTeamLogo() {
  let input = $(this).parent().siblings('input');

  dialog.showOpenDialog({
    title: 'Add Team Logo',
    filters: [
      {name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg' ]}
    ],
    properties: ['openFile'],
  }, function(files) {
    if (files) {
      let rootFolder = path.join(__dirname, '../obs_src');

      if (!fs.existsSync(rootFolder)) {
        rootFolder = path.join(process.resourcesPath, 'app', 'src', 'obs_src');
      }

      // needs relative path from the files. they're all here.
      input.val(path.relative(rootFolder, files[0]));
    }
  });
}

function clearField() {
  $(this).parent().siblings('input').val('');
}

function updatePlayerPoolMenus() {
  const pool = $('#player-pool').val();

  if (pool) {
    const values = [];
    const names = pool.split('\n');
    for (let n of names) {
      values.push({
        value: n,
        text: n,
        name: n,
      });
    }

    $('.player-entry').dropdown('change values', values);
  }
}

exports.Init = initTeamData;
exports.InitWithState = initWithState;
exports.updatePlayerPoolMenus = updatePlayerPoolMenus;