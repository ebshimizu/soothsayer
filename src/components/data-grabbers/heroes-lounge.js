const moment = require('moment');

let appState;

function createUI() {
  return `
  <div class="data-grab-option" data-source="heroes-lounge">
    <h3 class="ui dividing header">All Matches</h3>
    <div class="fields">
      <div class="ui four wide field">
        <label>Match ID</label>
        <input type="text" id="heroes-lounge-id">
      </div>
      <div class="four wide field">
        <label><i class="magic icon"></i>One-Click Setup</label>
        <div class="ui fluid buttons">
          <div class="ui left attached green button" id="heroes-lounge-magic">
            Full Names
          </div>
          <div class="ui green right attached button" id="heroes-lounge-magic-slugs">
            Short Names
          </div>
        </div>
      </div>
      <div class="four wide field">
        <label>Load Match Data Only</label>
        <div class="ui fluid buttons">
          <div class="ui left attached green button" id="heroes-lounge-get">Full Names</div>
          <div class="ui right attached green button" id="heroes-lounge-get-slug">Short Names</div>
        </div>
      </div>
    </div>
    <h3 class="ui dividing header">Regular Season Only</h3>
    <div class="fields">
      <div class="ui four wide field">
        <label>League</label>
        <div class="ui selection dropdown loading" id="heroes-lounge-league">
          <i class="dropdown icon"></i>
          <div class="text"></div>
          <div class="menu">

          </div>
        </div>
      </div>
      <div class="ui four wide field">
        <label>Division</label>
        <div class="ui selection dropdown" id="heroes-lounge-division">
          <i class="dropdown icon"></i>
          <div class="text"></div>
          <div class="menu">

          </div>
        </div>
      </div>
      <div class="ui four wide field">
        <label>Standings and Recent Results</label>
        <div class="ui fluid green button" id="heroes-lounge-get-standings">Load Standings</div>
      </div>
      <div class="ui four wide field">
        <label>Load Ticker (also loads Standings)</label>
        <div class="ui fluid green button" id="heroes-lounge-get-recent">Load Ticker</div>
      </div>
    </div>
    <h3 class="ui dividing header">Div S Only</h3>
    <div class="fields">
      <div class="ui four wide field">
        <label>Division S Qualifier Standings</label>
        <div class="ui fluid green buttons">
          <div class="ui left attached green button" id="heroes-lounge-divs-standings-eu">
            Load EU
          </div>
          <div class="ui right attached green button" id="heroes-lounge-divs-standings-na">
            Load NA
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function info() {
  return `
  <div class="header">Heroes Lounge</div>
  <div class="content">
    Grabs data from the Heroes Lounge website.
    Typically, you'll use the one-click setup buttons to setup everything (team names, logos, standings, ticker) for you.
    If you are casting a playoff match, the one-click setup will also load standings and ticker for you.
    If you are casting Div S Qualifiers, the one-click button will only fill in team names and logos,
    and you will have to load the qualifier standings and ticker separately.
    You should check that the auto-generated Tournament Name
    in the Tournament tab is acceptable after loading data.
  </div>
  `;
}

async function heroesLoungeGetLogo(id) {
  let logo = '';

  try {
    const req = await fetch(`https://heroeslounge.gg/api/v1/teams/${id}/logo`);
    const dat = await req.json().catch(e => console.log(e));
    logo = dat.path;
  }
  catch (e) {
    console.log(`Failed to retrieve logo for ${id}`);
  }

  return logo;
}

async function heroesLoungeGetTeamFull(type) {
  const matchId = $('#heroes-lounge-id').val();
  let teams = {};

  // series of asyncs
  try {
    const response = await fetch(`http://heroeslounge.gg/api/v1/matches/${matchId}/teams`);

    if (!response.ok) {
      showMessage(
        `Error: Failed to load Heroes Lounge Match ${matchId}. http://heroeslounge.gg/api/v1/matches/${matchId}/teams returned status ${
          response.code
        }.`,
        'negative',
      );
    }
    else {
      teams = await response.json();

      if (teams.length === 2) {
        // console.log(teams);
        $('#team-blue-name').val(teams[0][type]);
        $('#team-red-name').val(teams[1][type]);
        showMessage(
          `Heroes Lounge Grabber: Loaded ${matchId}. Blue: ${teams[0][type]}, Red: ${
            teams[1][type]
          }.`,
          'positive',
        );

        const blueLogo = await heroesLoungeGetLogo(teams[0].id);
        $('#team-blue-logo input').val(blueLogo);

        const redLogo = await heroesLoungeGetLogo(teams[1].id);
        $('#team-red-logo input').val(redLogo);

        showMessage(
          'Heroes Lounge Grabber: Attempted to load team logos. Some teams may be missing logos, check the Teams tab.',
          'info',
        );

        showMessage('Attempting to load player list...', 'info');
        try {
          const team1Req = await fetch(`http://heroeslounge.gg/api/v1/teams/${teams[0].id}/sloths`);
          const team2Req = await fetch(`http://heroeslounge.gg/api/v1/teams/${teams[1].id}/sloths`);

          const p1 = await team1Req.json();
          const p2 = await team2Req.json();

          const players = p1.concat(p2);
          const names = [];
          for (const player of players) {
            names.push(player.battle_tag.substring(0, player.battle_tag.indexOf('#')));
          }

          $('#player-pool').val(names.join('\n'));
          $('#player-pool').focusout();
          showMessage(
            `Heroes Lounge Grabber: Player Pool Loaded. Count ${names.length}.`,
            'positive',
          );
        }
        catch (e) {
          showMessage(
            `Warning: failed to load Player List for Heroes Lounge match ${id}. ${e}`,
            'warning',
          );
        }
      }
    }
  }
  catch (e) {
    showMessage(`Error loading Heroes Lounge match id: ${matchId}. ${e}`, 'negative');
  }

  return teams;
}

async function heroesLoungeLoadStandingsForDiv(season, div, seasonId) {
  if (!appState) {
    showMessage('App is not initialized yet. Please wait a moment before trying again.');
    return;
  }

  appState.clearTournamentData();

  try {
    const response = await fetch(`http://heroeslounge.gg/${season}/${div}`);

    if (!response.ok) {
      showMessage(
        `http://heroeslounge.gg/${season}/${div} returned status ${response.status}`,
        'negative',
      );
    }
    else {
      const page = await response.text();
      const standingsRows = $(page).find('table.table.table-striped.table-sm tbody tr');

      // attempt team logos
      const teamListReq = await fetch(`http://heroeslounge.gg/api/v1/seasons/${seasonId}/teams`);
      const teamList = await teamListReq.json();

      // convert to object keyed on team names
      const teams = {};
      for (let i = 0; i < teamList.length; i += 1) {
        teams[teamList[i].title] = teamList[i];
      }

      standingsRows.each(function (idx) {
        const standing = parseInt(
          $(this)
            .find('th[scope="row"]')
            .text(),
        );
        const team = $(this)
          .find('a')
          .text();
        const win = parseInt(
          $(this)
            .find('td')
            .slice(3, 4)
            .text(),
        );
        const total = parseInt(
          $(this)
            .find('td')
            .slice(4)
            .text(),
        );

        appState.addStanding(standing, team, win, total - win);
      });

      showMessage(`Loaded Standings for Heroes Lounge ${season} ${div}`, 'positive');

      showMessage('Attempting to load logos');

      for (let i = 0; i < appState.tournament.standings.length; i++) {
        let logo = '';
        if (appState.tournament.standings[i].team in teams) {
          logo = await heroesLoungeGetLogo(teams[appState.tournament.standings[i].team].id);
        }

        appState.tournament.standings[i].logo = logo;
      }

      const recent = $(page)
        .find("h3:contains('Recent Results')")
        .siblings();

      // basically each time a separator is found, commit the data
      let recentEntry = {};

      recent.each(function (idx) {
        if ($(this).hasClass('row') && !$(this).hasClass('mt-1')) {
          // team 1
          recentEntry.team1 = $(this)
            .find('.col-8 a')
            .text();
          recentEntry.team1Logo = $(this)
            .find('.col-8 img')
            .attr('src');
          recentEntry.team1Score = parseInt(
            $(this)
              .find('span.badge')
              .text(),
          );
        }
        else if ($(this).hasClass('row') && $(this).hasClass('mt-1')) {
          // team 2
          recentEntry.team2 = $(this)
            .find('.col-8 a')
            .text();
          recentEntry.team2Logo = $(this)
            .find('.col-8 img')
            .attr('src');
          recentEntry.team2Score = parseInt(
            $(this)
              .find('span.badge')
              .text(),
          );
        }
        else if ($(this).hasClass('seperator')) {
          // commit
          appState.addRecent(
            recentEntry.team1,
            recentEntry.team2,
            recentEntry.team1Score,
            recentEntry.team2Score,
            recentEntry.team1Logo,
            recentEntry.team2Logo,
          );
          recentEntry = {};
        }
      });

      showMessage(`Loaded Recent Results for Heroes Lounge ${season} ${div}`, 'positive');

      showMessage('Attempting to resolve high res logos...');

      for (let i = 0; i < appState.tournament.recent.length; i++) {
        const entry = appState.tournament.recent[i];

        if (entry.team1 in teams) {
          const logo = await heroesLoungeGetLogo(teams[entry.team1].id);
          if (logo !== '') {
            entry.team1Logo = logo;
          }
        }
        if (entry.team2 in teams) {
          const logo = await heroesLoungeGetLogo(teams[entry.team2].id);
          if (logo !== '') {
            entry.team2Logo = logo;
          }
        }
      }

      appState.displayTournamentData();
    }
  }
  catch (e) {
    showMessage(`Heroes Lounge Standings Load Error: ${e}`, 'negative');
  }
}

async function heroesLoungeLoadUpcoming() {
  if (!appState) {
    showMessage('App is not initialized yet. Please wait a moment before trying again.');
    return [];
  }

  const tickerItems = [];
  showMessage('Ticker: Loading Heroes Lounge upcoming matches', 'info');

  try {
    // TEST
    const response = await fetch(
      `https://heroeslounge.gg/api/v1/matches/withApprovedCastBetween/${moment().format(
        'YYYY-MM-DD',
      )}/${moment()
        .add(3, 'd')
        .format('YYYY-MM-DD')}`,
    );

    if (!response.ok) {
      showMessage(
        `Error: Failed to retrieve upcoming casted games for Heroes Lounge. Code: ${
          response.status
        }.`,
        'negative',
      );
    }
    else {
      const data = await response.json();

      for (const id in data) {
        const match = data[id];

        if (match.channel) {
          // check date
          const matchDate = moment(`${match.wbp}+01:00`);
          if (matchDate.isAfter(moment())) {
            // i want the team logos
            const blueLogo = await heroesLoungeGetLogo(match.teams[0].id);
            const redLogo = await heroesLoungeGetLogo(match.teams[1].id);
            const twitchMatch = match.channel.url.match(/\/(\w+)\/?$/);
            let twitch = '';

            if (twitchMatch) {
              twitch = twitchMatch[1];
            }

            tickerItems.push({
              order: id,
              category: 'Upcoming Matches',
              mode: 'upcoming',
              twitch,
              text: match.division.title,
              blueTeam: match.teams[0].title,
              redTeam: match.teams[1].title,
              blueLogo,
              redLogo,
              upcomingDate: matchDate.local().format('YYYY-MM-DD[T]HH:mm'),
            });
          }
        }
      }
    }
  }
  catch (e) {
    showMessage(`Heroes Lounge Upcoming Matches Load Error: ${e}`, 'negative');
  }

  return tickerItems;
}

// playoff loader
async function heroesLoungeLoadPlayoffs(div, playoffID, divID, divTitle) {
  try {
    const playoffReq = await fetch(`https://heroeslounge.gg/api/v1/playoffs/${playoffID}`);
    const playoff = await playoffReq.json();

    const seasonReq = await fetch(`https://heroeslounge.gg/api/v1/seasons/${playoff.season_id}`);
    const season = await seasonReq.json();

    // ok so now... what
    // apparently the slug isn't used???
    const playoffPageReq = await fetch(
      `https://heroeslounge.gg/${season.slug}/playoff/${playoff.title}`,
    );
    const playoffPage = await playoffPageReq.text();

    // raw html rip
    appState.clearTournamentData();
    const standingsRows = $(playoffPage).find(`#${div} table.table-striped.table-sm tbody tr`);
    standingsRows.each(function (idx) {
      const standing = parseInt(
        $(this)
          .find('th[scope="row"]')
          .text(),
      );
      const team = $(this)
        .find('a')
        .text();
      const win = parseInt(
        $(this)
          .find('td')
          .slice(2, 3)
          .text(),
      );

      appState.addStanding(standing, team, win, 0);
    });

    showMessage(`Loaded Standings for Heroes Lounge Playoff ${playoff.title}`, 'positive');
    showMessage('Attempting to load logos');

    const teamListReq = await fetch(`http://heroeslounge.gg/api/v1/divisions/${divID}/teams`);
    const teamList = await teamListReq.json();

    // convert to object keyed on team names
    const teams = {};
    for (let i = 0; i < teamList.length; i += 1) {
      teams[teamList[i].title] = teamList[i];
    }

    for (let i = 0; i < appState.tournament.standings.length; i++) {
      let logo = '';
      if (appState.tournament.standings[i].team in teams) {
        logo = await heroesLoungeGetLogo(teams[appState.tournament.standings[i].team].id);
      }

      appState.tournament.standings[i].logo = logo;
    }

    appState.displayTournamentData();

    const title = `Heroes Lounge | ${playoff.title} ${divTitle}`;
    $('#tournament-name').val(title);
    $('#tournament-standing-record-format').dropdown('set exactly', 'w');
  }
  catch (e) {
    showMessage(
      `Heroes Lounge One Click Setup: Failed to load playoff info for playoff id ${playoffID}. ${e}`,
      'negative',
    );
  }
}

async function heroesLoungeLoadStandings() {
  // fill in from dropdowns
  $('#heroes-lounge-get-recent').addClass('disabled loading');
  $('#heroes-lounge-get-standings').addClass('disabled loading');

  await heroesLoungeLoadStandingsForDiv(
    $('#heroes-lounge-league').dropdown('get text'),
    $('#heroes-lounge-division').dropdown('get value'),
  );

  $('#heroes-lounge-get-standings').removeClass('disabled loading');
  $('#heroes-lounge-get-recent').removeClass('disabled loading');
}

async function heroesLoungeLoadTicker(season, div, seasonId) {
  $('#heroes-lounge-get-recent').addClass('disabled loading');
  $('#heroes-lounge-get-standings').addClass('disabled loading');

  if (!div && !seasonId) {
    await heroesLoungeLoadStandingsForDiv(
      $('#heroes-lounge-league').dropdown('get text'),
      $('#heroes-lounge-division').dropdown('get value'),
      $('#heroes-lounge-league').dropdown('get value'),
    );
  }
  else {
    await heroesLoungeLoadStandingsForDiv(season, div, seasonId);
  }

  const upcoming = await heroesLoungeLoadUpcoming();

  // reformat recent data into ticker items
  let items = appState.convertRecentToTicker();
  items = items.concat(upcoming);

  appState.setTickerItems(items);

  $('#heroes-lounge-get-standings').removeClass('disabled loading');
  $('#heroes-lounge-get-recent').removeClass('disabled loading');

  appState.updateAndBroadcastTicker();
}

// attempts to load everything for a single match from a single click
async function heroesLoungeOneClick(type) {
  // first up, match id (since that defines the division and season)
  await heroesLoungeGetTeamFull(type);
  const matchId = $('#heroes-lounge-id').val();

  // next, determine the season and division
  try {
    const matchReq = await fetch(`https://heroeslounge.gg/api/v1/matches/${matchId}/`);
    const match = await matchReq.json();

    const divReq = await fetch(`https://heroeslounge.gg/api/v1/divisions/${match.div_id}`);
    const division = await divReq.json();

    if (division.season_id) {
      const seasonReq = await fetch(
        `https://heroeslounge.gg/api/v1/seasons/${division.season_id}/`,
      );
      const season = await seasonReq.json();

      // ok so now...
      showMessage(
        `Heroes Lounge: Loading standings and ticker for ${season.title}, ${division.title}...`,
        'info',
      );
      await heroesLoungeLoadTicker(season.slug, division.slug, season.id);

      // tournament name suggestion
      const seasonTitle = season.title.replace('[', '').replace(']', ' ');
      const divTitle = division.title.replace('Division', 'Div');
      const title = `Heroes Lounge | ${seasonTitle} ${divTitle}`;
      $('#tournament-name').val(title);
    }
    else if (division.playoff_id) {
      // playoffs have a special loader
      await heroesLoungeLoadPlayoffs(
        division.slug,
        division.playoff_id,
        division.id,
        division.title,
      );

      const upcoming = await heroesLoungeLoadUpcoming();
      appState.setTickerItems(upcoming);

      $('#heroes-lounge-get-standings').removeClass('disabled loading');
      $('#heroes-lounge-get-recent').removeClass('disabled loading');

      appState.updateAndBroadcastTicker();
    }

    // set dropdown text? kinda misleading, division loads async?
    $('#team-blue-score').val('0');
    $('#team-red-score').val('0');

    appState.updateAndBroadcast();
    showMessage('Heroes Lounge One Click Setup Complete', 'positive');
  }
  catch (e) {
    showMessage(`Heroes Lounge One Click Load failure: ${e}`, 'negative');
  }
}

async function heroesLoungeLeagueChange(value, text, choice) {
  $('#heroes-lounge-division').addClass('loading');

  try {
    const response = await fetch(`http://heroeslounge.gg/api/v1/seasons/${value}/divisions`);

    if (!response.ok) {
      showMessage(
        `Error: Failed to retrieve divisions for Heroes Lounge ${text}. Code: ${response.status}.`,
        'negative',
      );
    }
    else {
      const data = await response.json();
      const values = [];

      for (let i = 0; i < data.length; i++) {
        values.push({
          value: data[i].slug,
          text: data[i].title,
          name: data[i].title,
        });
      }

      $('#heroes-lounge-division').dropdown('change values', values);
    }
  }
  catch (e) {
    showMessage(
      'Error: Failed to initialize Heroes Lounge dropdowns. API may be down.',
      'negative',
    );
    console.log(e);
  }

  // remove this anyway on completion
  $('#heroes-lounge-division').removeClass('loading');
}

async function heroesLoungeInitDropdowns() {
  $('#heroes-lounge-league').dropdown({
    onChange: heroesLoungeLeagueChange,
  });
  $('#heroes-lounge-division').dropdown();

  try {
    const response = await fetch('http://heroeslounge.gg/api/v1/seasonsAll');

    if (!response.ok) {
      showMessage(
        `Error: Failed to initialize Heroes Lounge dropdowns. API may be down. Code: ${
          response.status
        }.`,
        'negative',
      );
    }
    const data = await response.json();
    const values = { values: [] };

    for (let i = data.length - 1; i >= 0; i--) {
      values.values.push({
        value: data[i].id,
        text: data[i].slug,
        name: data[i].slug,
      });
    }

    $('#heroes-lounge-league').dropdown('setup menu', values);
    $('#heroes-lounge-league').removeClass('loading');
  }
  catch (e) {
    showMessage(
      'Error: Failed to initialize Heroes Lounge dropdowns. API may be down.',
      'negative',
    );
    console.log(e);
  }
}

async function getDivSStandings(headingID) {
  $('.data-grab-option .button').addClass('disabled loading');
  showMessage(`Loading Division S Qualifiers Standings. ID: ${headingID}.`, 'info');

  try {
    const response = await fetch('https://heroeslounge.gg/divisionS/standings');
    const text = await response.text();
    appState.clearTournamentData();

    const table = $(text)
      .find(`#${headingID}`)
      .next('table');
    const standings = [];
    $(table)
      .find('tbody tr')
      .each(function (idx) {
        // skip first it's a header
        if (idx > 0) {
          const score = parseInt(
            $(this)
              .find('td')
              .slice(1, 2)
              .text(),
          );
          const name = $(this)
            .find('td a')
            .text();

          // Q = qual, not in current standings
          if (!isNaN(score)) {
            standings.push({
              score,
              name,
            });
          }
        }
      });

    showMessage('Attempting to resolve logos...', 'info');

    // logos
    const teamResp = await fetch('https://heroeslounge.gg/api/v1/teamsAll');
    const teamList = await teamResp.json();

    const teams = {};
    for (let i = 0; i < teamList.length; i += 1) {
      teams[teamList[i].title] = teamList[i];
    }

    for (let i = 0; i < standings.length; i++) {
      let logo = '';
      if (standings[i].name in teams) {
        logo = await heroesLoungeGetLogo(teams[standings[i].name].id);
      }

      standings[i].logo = logo;
    }

    // sort
    standings.sort(function (a, b) {
      if (a.score < b.score) return 1;

      if (a.score > b.score) return -1;

      return 0;
    });

    // add to app data
    for (let i = 0; i < standings.length; i++) {
      appState.addStanding(i + 1, standings[i].name, standings[i].score, 0, standings[i].logo);
    }

    appState.displayTournamentData();
    $('#tournament-standing-record-format').dropdown('set exactly', 'w');

    showMessage(`Loaded Standings for Division S. ID: ${headingID}`, 'positive');
  }
  catch (e) {
    showMessage(`Error: Failed to load Div S Qualifier standings. ${e}`, 'negative');
  }

  $('.data-grab-option .button').removeClass('disabled loading');
}

function bind(state) {
  appState = state;

  $('#heroes-lounge-get').click(() => heroesLoungeGetTeamFull('title'));
  $('#heroes-lounge-get-slug').click(() => heroesLoungeGetTeamFull('slug'));
  $('#heroes-lounge-get-standings').click(heroesLoungeLoadStandings);
  $('#heroes-lounge-get-recent').click(heroesLoungeLoadTicker);
  $('#heroes-lounge-magic').click(() => heroesLoungeOneClick('title'));
  $('#heroes-lounge-magic-slugs').click(() => heroesLoungeOneClick('slug'));
  $('#heroes-lounge-divs-standings-na').click(() => getDivSStandings('StandingsNA'));
  $('#heroes-lounge-divs-standings-eu').click(() => getDivSStandings('StandingsEU'));
  heroesLoungeInitDropdowns();
}

exports.createUI = createUI;
exports.bind = bind;
exports.info = info;
