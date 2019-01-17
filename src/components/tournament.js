let appState;

function rankingRow(row, i) {
  return `
    <tr row-id=${i} rank="${row.place}" class="${row.focus ? 'active' : ''} ${row.zoom ? 'zoom' : ''}">
      <td>
        <div class="ui fluid input" name="place">
          <input type="number" name="place" value="${row.place ? row.place : i}">
        </div>
      </td>
      <td>
        <div class="ui fluid input" name="team">
          <input type="text" name="team" value="${row.team ? row.team : ''}">
        </div>
      </td>
      <td>
        <div class="ui fluid input" name="logo">
          <input type="text" name="logo" value="${row.logo ? row.logo : ''}">
        </div>
      </td>
      <td>
        <div class="ui fluid input" name="win">
          <input type="number" name="win" value="${row.win ? row.win : 0}">
        </div>
      </td>
      <td>
        <div class="ui fluid input" name="loss">
          <input type="number" name="loss" value="${row.loss ? row.loss : 0}">
        </div>
      </td>
      <td>
        <div class="ui buttons">
          <div class="ui icon button highlight-row" row-id="${i}">
            <i class="star icon"></i>
          </div>
          <div class="ui icon button zoom-row" row-id="${i}">
            <i class="zoom-in icon"></i>
          </div>
          <div class="ui red icon button delete-row" row-id="${i}">
            <i class="trash icon"></i>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function renderStandings(data) {
  const tbl = $('#tournament-standings table.celled tbody');
  tbl.html('');

  // sort standings
  data.sort(function (a, b) {
    if (a.place < b.place) return -1;

    if (a.place > b.place) return 1;

    return 0;
  });

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    tbl.append(rankingRow(r, i));
  }
}

function render(data) {
  renderStandings(data.standings);
}

function getStandings() {
  // iterate through rows, pull data into state expected format
  const rows = $('#tournament-standings table.celled tbody tr');
  const data = [];

  rows.each(function () {
    data.push({
      place: parseInt(
        $(this)
          .find('input[name="place"]')
          .val(),
      ),
      team: $(this)
        .find('input[name="team"]')
        .val(),
      win: parseInt(
        $(this)
          .find('input[name="win"]')
          .val(),
      ),
      loss: parseInt(
        $(this)
          .find('input[name="loss"]')
          .val(),
      ),
      logo: $(this)
        .find('input[name="logo"]')
        .val(),
      focus: $(this).hasClass('active'),
      zoom: $(this).hasClass('zoom'),
    });
  });

  return data;
}

function getStandingsSettings() {
  return {
    mode: $('#tournament-standing-format').dropdown('get value'),
    limit: parseInt($('#tournament-standing-limit input').val()),
  };
}

function init() {
  $('#tournament-standings .add.button').click(function () {
    $('#tournament-standings table.celled tbody').append(
      rankingRow({}, $('#tournament-standings table.celled tbody tr').length + 1),
    );
  });
  $('#tournament-starting-format').dropdown();

  $(document).on('click', '#tournament-standings .delete-row.button', function (event) {
    $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).remove();
  });

  $(document).on('click', '#tournament-standings .highlight-row.button', function (event) {
    $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).toggleClass('active');
  });

  $(document).on('click', '#tournament-standings .zoom-row.button', function (event) {
    if ($(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).hasClass('zoom')) {
      $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).removeClass('zoom');
    }
    else {
      $(`#tournament-standings table tr`).removeClass('zoom');
      $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).addClass('zoom');
    }
  });
}

function initWithState(state) {
  appState = state;

  if (appState.tournament.standingsSettings) {
    const standingMode = appState.tournament.standingsSettings.mode;
    $('#tournament-standing-format').dropdown('set exactly', standingMode);
    $('#tournament-standing-limit input').val(appState.tournament.standingsSettings.limit);
  }
  else {
    $('#tournament-standing-format').dropdown('set exactly', 'top');
  }
  
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.render = render;
exports.getStandings = getStandings;
exports.getStandingsSettings = getStandingsSettings;
