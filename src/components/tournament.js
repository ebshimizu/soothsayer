const Util = require('./util');
const Brackets = require('../data/brackets');

let appState;

function bracketItem(id, name, format) {
  return `
    <div class="ui eight wide column" bracket-id="${id}" format="${format}">
      <div class="ui segment">
        <h4 class="header">${name}</h4>
        <div class="ui form">
          <div class="fields">
            <div class="ten wide field">
              <label>Team 1</label> 
              <div class="ui fluid selection dropdown bracket-team" bracket-id="${id}" team-id="1">
                <i class="dropdown icon"></i>
                <div class="text"></div>
                <div class="menu">

                </div>
              </div>
            </div>
            <div class="four wide field">
              <label>Score</label>
              <div class="ui fluid input">
                <input bracket-id="${id}" team-id="1" type="number" />
              </div>
            </div>
            <div class="two wide field">
              <label>Win</label>
              <div class="ui icon bracket-win button" format="${format}" bracket-id="${id}" team-id="1">
                <i class="check icon"></i>
              </div>
            </div>
          </div>
          <div class="fields">
            <div class="ten wide field">
              <label>Team 2</label> 
              <div class="ui fluid search selection dropdown bracket-team" bracket-id="${id}" team-id="2">
                <i class="dropdown icon"></i>
                <div class="text"></div>
                <div class="menu">

                </div>
              </div>
            </div>
            <div class="four wide field">
              <label>Score</label>
              <div class="ui fluid input">
                <input bracket-id="${id}" team-id="2" type="number" />
              </div>
            </div>
            <div class="two wide field">
              <label>Win</label>
              <div class="ui icon bracket-win button" format="${format}" bracket-id="${id}" team-id="2">
                <i class="check icon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function rankingRow(row, i) {
  return `
    <tr row-id=${i} rank="${row.place}" class="${row.focus ? 'active' : ''} ${
    row.zoom ? 'zoom' : ''
  }">
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
        <div class="ui fluid action input" name="logo">
          <input type="text" name="logo" value="${row.logo ? row.logo : ''}">
          <div class="ui buttons">
            <div class="ui right attached icon button erase" row-id="${i}">
              <i class="eraser icon"></i>
            </div>
            <div class="ui left attached icon button browse" row-id="${i}">
              <i class="folder open icon"></i>
            </div>
          </div>
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
        <div class="ui fluid input" name="draw">
          <input type="number" name="draw" value="${row.draw ? row.draw : 0}">
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
  if (!data) return;

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

function renderBracket(data) {
  // so the dropdown is set from the render function, which then triggers this
  // if there's something in the tournament data
  // at this point, only the individual rounds need to be iterated
  $(`#tournament-bracket .bracket-win`).removeClass('green');

  if (data.rounds) {
    for (let r in data.rounds) {
      // teams
      $(`#tournament-bracket .bracket-team[bracket-id="${r}"][team-id="1"]`).dropdown('set exactly', data.rounds[r].team1);
      $(`#tournament-bracket .bracket-team[bracket-id="${r}"][team-id="2"]`).dropdown('set exactly', data.rounds[r].team2);

      $(`#tournament-bracket input[bracket-id="${r}"][team-id="1"]`).val(data.rounds[r].team1Score);
      $(`#tournament-bracket input[bracket-id="${r}"][team-id="2"]`).val(data.rounds[r].team2Score);

      // winner
      const winner = data.rounds[r].winner;
      if (winner) {
        $(`#tournament-bracket .bracket-win[bracket-id="${r}"][team-id="${winner}"]`).addClass('green');
      }
    }
  }
}

function render(data) {
  renderStandings(data.standings);
  renderBracket(data.bracket);
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
      draw: parseInt(
        $(this)
          .find('input[name="draw"]')
          .val(),
      ),
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
    recordFormat: $('#tournament-standing-record-format').dropdown('get value'),
  };
}

function toggleBracketWin(winner, id, format, toggleOff) {
  $(`#tournament-bracket .bracket-win[bracket-id="${id}"]`).removeClass('green');

  let winTeam = $(
    `#tournament-bracket .bracket-team[bracket-id="${id}"][team-id="${winner}"]`,
  ).dropdown('get value');
  
  if (toggleOff)
    winTeam = '';

  const lose = parseInt(winner) === 1 ? 2 : 1;
  let loseTeam = $(
    `#tournament-bracket .bracket-team[bracket-id="${id}"][team-id="${lose}"]`,
  ).dropdown('get value');

  if (toggleOff)
    loseTeam = '';

  let winNext = Brackets[format].rounds[id].winnerTo;
  let loseNext = Brackets[format].rounds[id].loserTo;

  if (winNext) {
    winNext = winNext.split('.');
    $(
      `#tournament-bracket .bracket-team[bracket-id="${winNext[0]}"][team-id="${winNext[1]}"]`,
    ).dropdown('set exactly', winTeam);
  }

  if (loseNext) {
    loseNext = loseNext.split('.');
    $(
      `#tournament-bracket .bracket-team[bracket-id="${loseNext[0]}"][team-id="${loseNext[1]}"]`,
    ).dropdown('set exactly', loseTeam);
  }

  if (toggleOff === false)
    $(`#tournament-bracket .bracket-win[bracket-id="${id}"][team-id="${winner}"]`).addClass('green');
}

function updateBracketDropdowns() {
  // populate dropdowns
  const teams = getStandings();
  const items = [{
    name: '',
    value: '',
    text: '',
  }];

  for (const t in teams) {
    items.push({
      name: teams[t].team,
      value: teams[t].team,
      text: teams[t].team,
    });
  }

  $('#tournament-bracket .bracket-team').dropdown('save defaults');
  $('#tournament-bracket .bracket-team').dropdown('change values', items);
  $('#tournament-bracket .bracket-team').dropdown('restore defaults');
}

function createBracketUI(format, formatId) {
  if (format) {
    // create an element for each item in format, following the order listed.
    for (const id of format.order) {
      $('#tournament-bracket').append(bracketItem(id, format.rounds[id].title, formatId));
    }

    $('#tournament-bracket .bracket-team').dropdown();
    updateBracketDropdowns();
  }
}

function updateBracketData(value, text) {
  // delete bracket data
  $('#tournament-bracket').html('');

  if (value in Brackets) {
    // create ui elements
    createBracketUI(Brackets[value], value);

    // update header
    $('#tournament-bracket-header').text(`Bracket: ${Brackets[value].name}`);

    // load from state if applicable
    if (appState && appState.tournament) {
      renderBracket(appState.tournament.bracket);
    }
  }
}

function loadBracketMenu() {
  $('#tournament-bracket-format').dropdown({
    onChange: updateBracketData,
  });

  const opts = [{
    name: 'None',
    value: 'none',
    text: 'None',
  }];

  for (const b in Brackets) {
    opts.push({
      name: Brackets[b].name,
      value: b,
      text: Brackets[b].name,
    });
  }

  $('#tournament-bracket-format').dropdown('change values', opts);
}

// iterate through the ui elements, fill in the blanks
function getBracketData() {
  const bracket = {
    rounds: {},
    format: $('#tournament-bracket .column').first().attr('format'),
  };

  if (bracket.format in Brackets) {
    bracket.title = Brackets[bracket.format].name;
    bracket.order = Brackets[bracket.format].order;
  }

  const standings = getStandings();

  // convert to team name key object
  const logos = {};
  for (let team of standings) {
    logos[team.team] = team.logo;
  }

  $('#tournament-bracket .column').each(function(i) {
    const round = {
      id: $(this).attr('bracket-id'),
      team1: $(this).find('.bracket-team[team-id="1"]').dropdown('get text'),
      team2: $(this).find('.bracket-team[team-id="2"]').dropdown('get text'),
      team1Score: parseInt($(this).find('input[team-id="1"]').val()),
      team2Score: parseInt($(this).find('input[team-id="2"]').val()),
    };

    round.team1Logo = logos[round.team1];
    round.team2Logo = logos[round.team2];

    const winButton = $(this).find('.green.button');
    if (winButton.length > 0) {
      round.winner = parseInt($(winButton).attr('team-id'));
    }
    else {
      round.winner = null;
    }

    bracket.rounds[round.id] = round;
  });

  return bracket;
}

function init() {
  $('#tournament-standings .add.button').click(function () {
    $('#tournament-standings table.celled tbody').append(
      rankingRow({}, $('#tournament-standings table.celled tbody tr').length + 1),
    );
  });
  $('#tournament-starting-format').dropdown();
  $('#tournament-standing-record-format').dropdown();
  $('#tournament-submenu .item').tab();

  loadBracketMenu();

  $(document).on('click', '#tournament-standings .delete-row.button', function (event) {
    $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).remove();
    updateBracketDropdowns();
  });

  $(document).on('click', '#tournament-standings .highlight-row.button', function (event) {
    $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).toggleClass('active');
  });

  $(document).on('click', '#tournament-standings .zoom-row.button', function (event) {
    if ($(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).hasClass('zoom')) {
      $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).removeClass('zoom');
    }
    else {
      $('#tournament-standings table tr').removeClass('zoom');
      $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"]`).addClass('zoom');
    }
  });

  $(document).on('click', '#tournament-standings .browse.button', function (event) {
    Util.browseForImage(
      $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"] input[name="logo"]`),
    );
  });

  $(document).on('click', '#tournament-standings .erase.button', function (event) {
    $(`#tournament-standings table tr[row-id="${$(this).attr('row-id')}"] input[name="logo"]`).val(
      '',
    );
  });

  $(document).on('click', '#tournament-bracket .bracket-win', function (event) {
    // checks the bracket id
    const winner = $(this).attr('team-id');
    const id = $(this).attr('bracket-id');
    const format = $(this).attr('format');
    toggleBracketWin(winner, id, format, $(this).hasClass('green'));
  });

  $(document).on('focusout', '#tournament-standings input[name="team"]', updateBracketDropdowns);
}

function initWithState(state) {
  appState = state;

  if (appState.tournament.standingsSettings) {
    const standingMode = appState.tournament.standingsSettings.mode;
    $('#tournament-standing-format').dropdown('set exactly', standingMode);
    $('#tournament-standing-limit input').val(appState.tournament.standingsSettings.limit);

    if (appState.tournament.standingsSettings.recordFormat) {
      $('#tournament-standing-record-format').dropdown(
        'set exactly',
        appState.tournament.standingsSettings.recordFormat,
      );
    }
    else {
      $('#tournament-standing-record-format').dropdown('set exactly', 'wl');
    }

    if (appState.tournament.bracket.format) {
      $('#tournament-bracket-format').dropdown('set exactly', appState.tournament.bracket.format);
    }
    else {
      $('#tournament-bracket-format').dropdown('set exactly', 'none');
    }
  }
  else {
    $('#tournament-standing-format').dropdown('set exactly', 'cycle');
    $('#tournament-standing-record-format').dropdown('set exactly', 'wl');
  }
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.render = render;
exports.getStandings = getStandings;
exports.getStandingsSettings = getStandingsSettings;
exports.getBracket = getBracketData;
