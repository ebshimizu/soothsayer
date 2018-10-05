// this file manages callbacks required for the team data entry page
const { dialog } = require('electron').remote;

function initTeamData() {
  $('#team-data .find-logo .browse.button').click(findTeamLogo);
  $('#team-data .find-logo .clear-field.button').click(clearField);
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
      input.val(files[0]);
    }
  });
}

function clearField() {
  $(this).parent().siblings('input').val('');
}

exports.TeamData = initTeamData;