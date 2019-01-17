let appState;

function rankingRow(row, i) {
  return `
    <tr row-id=${i} rank="${row.place}">
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
          <input type="number" name="loss" value="${row.loss ? row.win : 0}">
        </div>
      </td>
      <td>
        <div class="ui red icon button delete-row" row-id="${i}">
          <i class="trash icon"></i>
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
    });
  });

  return data;
}

function init() {
  $('#tournament-standings .add.button').click(function () {
    $('#tournament-standings table.celled tbody').append(
      rankingRow({}, $('#tournament-standings table.celled tbody tr').length + 1),
    );
  });

  $(document).on('click', '#tournament-standings .delete-row.button', function (event) {
    $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).remove();
  });
}

function initWithState(state) {
  appState = state;
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.render = render;
exports.getStandings = getStandings;
