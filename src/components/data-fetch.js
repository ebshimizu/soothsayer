let appState;

function heroesLoungeGetTeamFull(type) {
  const matchId = $('#heroes-lounge-id').val();

  // series of asyncs
  $.get(`http://heroeslounge.gg/api/v1/matches/${matchId}/teams`, '', function (teams) {
    // ok now the other teams
    if (teams.length === 2) {
      console.log(teams);
      $('#team-blue-name').val(teams[0][type]);
      $('#team-red-name').val(teams[1][type]);
      showMessage(
        `Heroes Lounge Grabber: Loaded ${matchId}. Blue: ${teams[0][type]}, Red: ${
          teams[1][type]
        }.`,
        'positive',
      );

      $.get(`http://heroeslounge.gg/api/v1/teams/${teams[0].id}/logo`, '', function (logo1) {
        if (logo1.path) {
          $('#team-blue-logo input').val(logo1.path);
          showMessage(`Heroes Lounge Grabber: Loaded ${teams[0][type]}'s logo.`, 'positive');
        }
        else {
          showMessage(`Heroes Lounge Grabber: Failed to load ${teams[0][type]}'s logo`, 'negative');
        }
      });
      $.get(`http://heroeslounge.gg/api/v1/teams/${teams[1].id}/logo`, '', function (logo2) {
        if (logo2.path) {
          $('#team-red-logo input').val(logo2.path);
          showMessage(`Heroes Lounge Grabber: Loaded ${teams[1][type]}'s logo.`, 'positive');
        }
        else {
          showMessage(`Heroes Lounge Grabber: Failed to load ${teams[1][type]}'s logo`, 'negative');
        }
      });
      $.get(`http://heroeslounge.gg/api/v1/teams/${teams[0].id}/sloths`, '', function (p1) {
        $.get(`http://heroeslounge.gg/api/v1/teams/${teams[1].id}/sloths`, '', function (p2) {
          // stip tags, add to pool
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
        });
      });
    }
    else {
      showMessage(`Heroes Lounge Grabber: Failed to get data for ${matchId}.`, 'negative');
    }
  });
}

async function heroesLoungeLoadStandingsForDiv(season, div) {
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
    }
  }
  catch (e) {
    showMessage(`Heroes Lounge Standings Load Error: ${e}`, 'negative');
  }

  $('#heroes-lounge-get-standings').removeClass('disabled loading');
}

function heroesLoungeLoadStandings() {
  // fill in from dropdowns
  $('#heroes-lounge-get-standings').addClass('disabled loading');
  heroesLoungeLoadStandingsForDiv(
    $('#heroes-lounge-league').dropdown('get text'),
    $('#heroes-lounge-division').dropdown('get value'),
  );
}

function heroesLoungeLoadTicker() {
  heroesLoungeLoadStandingsForDiv(
    $('#heroes-lounge-league').dropdown('get text'),
    $('#heroes-lounge-division').dropdown('get value'),
  );
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

function updateInfo(key) {
  if (key === 'none') {
    $('#data-grabber-info').html(`
      <div class="content">
        <p>
          Data Grabbers will help automatically populate some of your team and match data from
          the given source. You may need to configure your source once selected.
        </p>
      </div>
    `);
  }
  else if (key === 'heroes-lounge') {
    $('#data-grabber-info').html(`
    <div class="header">Heroes Lounge</div
    <div class="content">
      Grabs data from the Heroes Lounge website. You can grab full team names or slugs.
      This will also populate the player pool with the names of players on the involved teams.
    </div>
  `);
  }
}

function changeDataGrabber(val) {
  if (appState) {
    $('.data-grab-option').hide();
    $(`.data-grab-option[data-source="${val}"]`).show();

    updateInfo(val);

    appState.updateDataSource();
    appState.save();
  }
}

function init() {
  $('#heroes-lounge-get').click(() => heroesLoungeGetTeamFull('title'));
  $('#heroes-lounge-get-slug').click(() => heroesLoungeGetTeamFull('slug'));
  $('.data-grab-option').hide();
  $('#heroes-lounge-get-standings').click(heroesLoungeLoadStandings);
  heroesLoungeInitDropdowns();

  $('#data-grabber-menu').dropdown({
    onChange: changeDataGrabber,
  });
}

function initDataFetch(state) {
  appState = state;
  $('#data-grabber-menu').dropdown('set exactly', appState.dataSource.dataGrabber);
}

exports.Init = init;
exports.InitWithState = initDataFetch;
