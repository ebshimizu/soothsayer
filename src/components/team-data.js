// this file manages callbacks required for the team data entry page
const { dialog } = require('electron').remote;
const path = require('path');
const fs = require('fs-extra');

function initTeamData() {
  $('#team-data .find-logo .browse.button').click(findTeamLogo);
  $('#team-data .find-logo .clear-field.button').click(clearField);
}

function initWithState(state) {
  $('#team-data-swap').click(() => state.swapTeamData());
  $('#team-data-clear').click(() => state.resetTeamData());
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

exports.Init = initTeamData;
exports.InitWithState = initWithState;