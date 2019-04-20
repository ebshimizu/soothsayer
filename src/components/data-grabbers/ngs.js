const moment = require('moment');
const Tournament = require('../tournament');

let appState;
let divisions = {};
let matches = {};
const seasonID = 6;

const baseURL = 'https://www.nexusgamingseries.org';
const imageURL = 'https://s3.amazonaws.com/ngs-image-storage';
const defaultTeamLogo = 'https://s3.amazonaws.com/ngs-image-storage/defaultTeamLogo.png';

function createUI() {
  return `
    <div class="data-grab-option ngs-grabber" data-source="ngs">
      <h3 class="ui dividing header">Regular Season</h3>
      <div class="fields">
        <div class="ui four wide field">
          <label>Division</label>
          <div class="ui fluid selection dropdown" id="ngs-division">
            <i class="dropdown icon"></i>
            <div class="text"></div>
            <div class="menu"></div>
          </div>
        </div>
        <div class="ui two wide field">
          <label>Round</label>
          <div class="ui fluid selection dropdown" id="ngs-round">
            <i class="dropdown icon"></i>
            <div class="text"></div>
            <div class="menu"></div>
          </div>
        </div>
        <div class="ui eight wide field">
          <label>Match</label>
          <div class="ui fluid selection dropdown" id="ngs-match">
            <i class="dropdown icon"></i>
            <div class="default text">Select a Division and Round to list matches</div>
            <div class="menu"></div>
          </div>
        </div>
        <div class="ui two wide field">
          <label><i class="magic icon"></i> Match</label>
          <div class="ui fluid green button" id="ngs-load-all">Load</div>
        </div>
      </div>
      <h3 class="ui dividing header">Playoffs</h3>
      <div class="fields">
        <div class="ui four wide field">
          <label>Division</label>
          <div class="ui fluid selection dropdown" id="ngs-division-playoff">
            <i class="dropdown icon"></i>
            <div class="text"></div>
            <div class="menu"></div>
          </div>
        </div>
        <div class="ui ten wide field">
          <label>Match</label>
          <div class="ui fluid selection dropdown" id="ngs-playoff-match">
            <i class="dropdown icon"></i>
            <div class="default text">Select a Division to list Playoff Matches</div>
            <div class="menu"></div>
          </div>
        </div>
        <div class="ui two wide field">
          <label><i class="magic icon"></i> Playoffs</label>
          <div class="ui fluid green button" id="ngs-load-playoff">Load</div>
        </div>
      </div>
    </div>
  `;
}

function info() {
  return `
    <div class="header">Nexus Gaming Series</div>
    <div class="content">
      Grabs data from the NGS website.
      Matches are listed by division and round as on the website.
      The caster name (if registered on the NGS website) will
      appear in brackets in the match list. The load button will load all possible
      relevant info for the match, including team names, logos, roster, standings, and ticker.
    </div>
  `;
}

function lockUI() {
  $('.ngs-grabber .dropdown').addClass('loading disabled');
  $('.ngs-grabber .button').addClass('loading disabled');
}

function unlockUI() {
  $('.ngs-grabber .dropdown').removeClass('loading disabled');
  $('.ngs-grabber .button').removeClass('loading disabled');
}

async function getDivisions() {
  lockUI();

  try {
    const resp = await fetch(`${baseURL}/division/get/all`);
    const divs = await resp.json();

    divisions = {};
    const options = [];

    for (let i = 0; i < divs.returnObject.length; i += 1) {
      divisions[divs.returnObject[i]._id] = divs.returnObject[i];

      options.push({
        value: divs.returnObject[i]._id,
        text: divs.returnObject[i].displayName,
        name: divs.returnObject[i].displayName,
      });
    }

    $('#ngs-division').dropdown('change values', options);
    $('#ngs-division-playoff').dropdown('change values', options);
    showMessage('NGS: Loaded division list.', 'positive');

    // debug
    console.log(divisions);
  }
  catch (e) {
    showMessage(`NGS: Failed to load divisions. ${e}`, 'error');
  }

  unlockUI();
}

function ngsDivisionChange(value, text, $elem) {
  // update round number (it's round robin so it's based on division team size)
  if (value in divisions) {
    const vals = [];
    const rounds =
      divisions[value].teams.length % 2 === 0
        ? divisions[value].teams.length - 1
        : divisions[value].teams.length;

    for (let i = 1; i <= rounds; i += 1) {
      vals.push({
        value: i,
        text: i,
        name: i,
      });
    }

    $('#ngs-round').dropdown('change values', vals);
  }
}

async function ngsRoundChange(value, text, $elem) {
  // this one actually gets the list of scheduled matches
  lockUI();

  const payload = {
    season: seasonID,
    round: parseInt(value),
    division: divisions[$('#ngs-division').dropdown('get value')].divisionConcat,
  };

  try {
    const roundReq = await fetch(`${baseURL}/schedule/get/matches`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    const matchData = await roundReq.json();
    matches = {};

    // list matches in matches dropdown
    const vals = [];

    for (let i = 0; i < matchData.returnObject.length; i += 1) {
      const match = matchData.returnObject[i];
      matches[match._id] = match;
      const matchName = `${match.casterName ? `[${match.casterName}]` : ''} ${
        match.home.teamName
      } vs ${match.away.teamName}`;

      vals.push({
        value: match._id,
        name: matchName,
        text: matchName,
      });
    }

    $('#ngs-match').dropdown('change values', vals);

    console.log(matches);
  }
  catch (e) {
    showMessage(
      `NGS: Failed to load match list for division ${
        [$('#ngs-division').dropdown('get value')].displayName
      } round ${value}. ${e}`,
      'error',
    );
  }

  unlockUI();
}

function processRoster(members) {
  const names = [];

  for (let i = 0; i < members.length; i++) {
    const name = members[i].displayName;

    if (name.indexOf('#') >= 0) {
      names.push(name.substring(0, name.indexOf('#')));
    }
    else {
      names.push(name);
    }
  }

  return names;
}

async function loadStandings(divID) {
  if (divID in divisions) {
    const division = divisions[divID];

    try {
      showMessage(
        `NGS: Attempting to load standings for division ${division.displayName}...`,
        'info',
      );

      const standReq = await fetch(`${baseURL}/standings/get/division`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          season: seasonID,
          division: division.divisionConcat,
        }),
      });
      let standings = await standReq.json();
      standings = standings.returnObject.sort(function (a, b) {
        if (a.standing < b.standing) return -1;
        if (a.standing > b.standing) return 1;

        return 0;
      });

      const teamNames = [];

      appState.tournament.standings = [];
      for (let i = 0; i < standings.length; i += 1) {
        appState.addStanding(standings[i].standing, standings[i].teamName, standings[i].points);
        teamNames.push(standings[i].teamName);
      }
      $('#tournament-standing-record-format').dropdown('set exactly', 'w');

      showMessage(`NGS: Loaded standings for division ${division.displayName}`, 'positive');
      showMessage(
        `NGS: Attempting to resolve logos for division ${division.displayName} standings...`,
        'info',
      );

      try {
        // logo resolution
        const teamReq = await fetch(`${baseURL}/team/getTeams`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ teams: teamNames }),
        });
        const teamData = await teamReq.json();
        const teamsByName = {};

        for (let i = 0; i < teamData.returnObject.length; i += 1) {
          teamsByName[teamData.returnObject[i].teamName] = teamData.returnObject[i];
        }

        for (let i = 0; i < appState.tournament.standings.length; i += 1) {
          const team = appState.tournament.standings[i].team;
          if (team in teamsByName && teamsByName[team].logo) {
            appState.tournament.standings[i].logo = `${imageURL}/${teamsByName[team].logo}`;
          }
          else {
            appState.tournament.standings[i].logo = defaultTeamLogo;
          }
        }

        showMessage('NGS: Loaded logos for standings', 'positive');
      }
      catch (e) {
        showMessage('NGS: Failed to resolve logos for standings.', 'warning');
      }

      appState.displayTournamentData();
    }
    catch (e) {
      showMessage(`NGS: Error loading standings. ${e}`, 'error');
    }
  }
  else {
    showMessage(`NGS: Unable to load standings. Division not found ${divID}.`, 'warning');
  }
}

// count: number of results to return
function scanRecentResults(divSlug, matchList, count = 5) {
  const relevantMatches = [];
  for (const match of matchList) {
    // needs to a) match division, b) be completed
    if (match.divisionConcat === divSlug && match.reported === true) {
      relevantMatches.push(match);
    }
  }

  // compute top 5, sort based on start time (integer)
  relevantMatches.sort(function (a, b) {
    if (parseInt(a.scheduledTime.startTime) < parseInt(b.scheduledTime.startTime)) return -1;
    if (parseInt(a.scheduledTime.startTime) > parseInt(b.scheduledTime.startTime)) return 1;

    return 0;
  });

  // compute score
  for (const match of relevantMatches) {
    match.blueScore = 0;
    match.redScore = 0;

    for (const key in match.other) {
      if (match.other[key].winner === 'home') match.blueScore += 1;
      else if (match.other[key].winner === 'away') match.redScore += 1;
    }
  }

  return relevantMatches.slice(0, count);
}

// lookAhead = number of days from current day to look for upcoming casts
function scanUpcomingCasts(matchList, lookAhead = 3) {
  const relevant = [];
  const now = moment().subtract(1, 'h');
  const limit = moment().add(lookAhead, 'd');

  for (const match of matchList) {
    const time = moment(parseInt(match.scheduledTime.startTime));

    if (match.casterUrl && now < time && time <= limit) {
      const twitchMatch = match.casterUrl.match(/\/(\w+)\/?$/);
      match.twitch = '';

      if (twitchMatch) {
        match.twitch = twitchMatch[1];
      }

      relevant.push(match);
    }
  }

  return relevant;
}

async function loadTicker(divID) {
  if (divID in divisions) {
    const division = divisions[divID];
    const divSlug = division.divisionConcat;

    // get scheduled matches
    const sched = await fetch(`${baseURL}/schedule/get/matches/scheduled`);
    const matchData = await sched.json();

    // scan scheduled matches for the following things:
    // - recent results: most recent 5 results from the given division (completed games have extra info)
    // - upcoming cased games: all games upcoming within three days of current date.
    const recent = scanRecentResults(divSlug, matchData.returnObject);
    const casts = scanUpcomingCasts(matchData.returnObject);

    const tickerItems = [];

    for (const r of recent) {
      tickerItems.push({
        blueTeam: r.home.teamName,
        redTeam: r.away.teamName,
        blueLogo: r.home.logo ? `${imageURL}/${r.home.logo}` : defaultTeamLogo,
        redLogo: r.away.logo ? `${imageURL}/${r.away.logo}` : defaultTeamLogo,
        blueScore: r.blueScore,
        redScore: r.redScore,
        order: 0,
        category: `Recent Results | ${division.displayName} Division`,
        mode: 'recent',
      });
    }

    for (const c of casts) {
      tickerItems.push({
        blueTeam: c.home.teamName,
        redTeam: c.away.teamName,
        blueLogo: c.home.logo ? `${imageURL}/${c.home.logo}` : defaultTeamLogo,
        redLogo: c.away.logo ? `${imageURL}/${c.away.logo}` : defaultTeamLogo,
        order: 0,
        category: 'Upcoming Matches',
        mode: 'upcoming',
        twitch: c.twitch,
        upcomingDate: moment(parseInt(c.scheduledTime.startTime))
          .local()
          .format('YYYY-MM-DD[T]HH:mm'),
      });
    }

    appState.setTickerItems(tickerItems);
    showMessage(`NGS: Loaded ticker for division ${division.displayName}`, 'positive');
  }
  else {
    showMessage(`NGS: Unable to load ticker. Division not found ${divID}.`, 'warning');
  }
}

async function loadMatch(match) {
  // team names + logo
  $('#team-blue-name').val(match.home.teamName);
  $('#team-red-name').val(match.away.teamName);
  $('#team-blue-score').val(0);
  $('#team-red-score').val(0);

  if (match.home.logo) {
    $('#team-blue-logo input').val(`${imageURL}/${match.home.logo}`);
  }
  else {
    $('#team-blue-logo input').val(defaultTeamLogo);
  }

  if (match.away.logo) {
    $('#team-red-logo input').val(`${imageURL}/${match.away.logo}`);
  }
  else {
    $('#team-red-logo input').val(defaultTeamLogo);
  }

  // rosters
  try {
    const teamReq = await fetch(`${baseURL}/team/getTeams`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ teams: [match.home.teamName, match.away.teamName] }),
    });
    const teamData = await teamReq.json();

    console.log(teamData);

    // pretty sure teams are returned in order so...
    const homeMembers = processRoster(teamData.returnObject[0].teamMembers);
    const awayMembers = processRoster(teamData.returnObject[1].teamMembers);

    for (let i = 0; i < 5; i += 1) {
      $(`input[name="blue-p${i + 1}-name"]`).val(homeMembers[i]);
      $(`input[name="red-p${i + 1}-name"]`).val(awayMembers[i]);
    }

    const allMembers = homeMembers.concat(awayMembers);

    $('#player-pool').val(allMembers.join('\n'));
  }
  catch (e) {
    showMessage(
      `NGS: Warning: failed to load team roster, proceeding with data load. ${e}`,
      'warning',
    );
  }
}

async function loadAll() {
  const matchID = $('#ngs-match').dropdown('get value');
  if (matchID in matches) {
    lockUI();

    try {
      const match = matches[matchID];

      showMessage(
        `NGS: Loading all data for match ${$('#ngs-match').dropdown('get text')}`,
        'info',
      );

      appState.clearTournamentData();

      const divID = $('#ngs-division').dropdown('get value');

      $('#tournament-name').val(
        `NGS Season ${seasonID} | ${
          divID in divisions ? `${divisions[divID].displayName} Division` : ''
        }`,
      );

      loadMatch(match);

      // standings
      await loadStandings(divID);

      // ticker
      await loadTicker(divID);

      appState.updateAndBroadcast();
      appState.updateAndBroadcastTicker();
    }
    catch (e) {
      showMessage(
        `NGS: Failed to load match ${$('#ngs-match').dropdown('get text')}. ${e}.`,
        'error',
      );
    }

    unlockUI();
  }
  else {
    showMessage(`NGS: No match with id ${matchID} found. Load cancelled.`, 'warning');
  }
}

async function ngsPlayoffChange(value, text) {
  if (!text) return;

  lockUI();

  try {
    const divSlug = text
      .toLowerCase()
      .split(' ')
      .join('-');

    const bracketReq = await fetch(`${baseURL}/schedule/fetch/tournament`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        season: seasonID,
        division: divSlug,
      }),
    });
    const bracket = await bracketReq.json();

    if (bracket.message === 'No tournament info found') {
      // silent fail
      $('#ngs-playoff-match').dropdown('change values', []);
      unlockUI();
      return;
    }

    // list the matches
    const vals = [];
    for (const match of bracket.returnObject.tournMatches) {
      if (match.away) {
        const name = `${match.home.teamName} vs ${match.away.teamName}`;

        vals.push({
          name,
          value: match._id,
          text: name,
        });
      }
    }

    $('#ngs-playoff-match').dropdown('change values', vals);
  }
  catch (e) {
    console.log(e);
  }

  unlockUI();
}

async function loadBracket(divSlug) {
  try {
    const bracketReq = await fetch(`${baseURL}/schedule/fetch/tournament`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        season: seasonID,
        division: divSlug,
      }),
    });
    const bracket = await bracketReq.json();

    if (bracket.message === 'No tournament info found') {
      showMessage(`NGS Tournament Load Aborted: ${bracket.message}`, 'warning');
      return {};
    }

    // reformat
    const matchData = {};
    for (const id in bracket.returnObject.tournMatches) {
      matchData[bracket.returnObject.tournMatches[id].matchId] =
        bracket.returnObject.tournMatches[id];
    }

    // bit of manual data wrangling
    Tournament.resetBracket();
    $('#tournament-bracket-format').dropdown('set exactly', 'RO8');

    // and then this should return the right stuff
    const br = Tournament.getBracket();

    // RO8

    const QF = {};
    const SF = {};

    // all of the child-less matches are RO8
    // i don't have scores?
    for (const id in matchData) {
      if (matchData[id].idChildren.length === 0) {
        QF[id] = matchData[id];

        // place the SF key
        SF[matchData[id].parentId] = matchData[matchData[id].parentId];
      }
    }

    // QF
    let QFid = 1;
    for (const id in QF) {
      const match = QF[id];
      const QFKey = `QF${QFid}`;
      br.rounds[QFKey].team1 = match.home.teamName;
      br.rounds[QFKey].team2 = match.away.teamName;
      br.rounds[QFKey].team1Logo = `${imageURL}/${match.home.logo}`;
      br.rounds[QFKey].team2Logo = `${imageURL}/${match.away.logo}`;
      // win/loss/score

      QFid += 1;
    }

    // SF
    let SFid = 1;
    for (const id in SF) {
      const match = SF[id];
      if (match.away) {
        const SFKey = `SF${SFid}`;
        br.rounds[SFKey].team1 = match.home.teamName;
        br.rounds[SFKey].team2 = match.away.teamName;
        br.rounds[SFKey].team1Logo = `${imageURL}/${match.home.logo}`;
        br.rounds[SFKey].team2Logo = `${imageURL}/${match.away.logo}`;
      }

      SFid += 1;
    }

    // finals
    const finalMatch = matchData[SF[Object.keys(SF)[0]].parentId];
    if (finalMatch.away) {
      br.rounds.Final.team1 = finalMatch.home.teamName;
      br.rounds.Final.team2 = finalMatch.away.teamName;
      br.rounds.Final.team1Logo = `${imageURL}/${finalMatch.home.logo}`;
      br.rounds.Final.team2Logo = `${imageURL}/${finalMatch.away.logo}`;
    }

    console.log(br);
    appState.tournament.bracket = br;
    appState.displayTournamentData();
    showMessage('NGS: Tournament bracket load complete', 'positive');

    return bracket.returnObject.tournMatches;
  }
  catch (e) {
    console.log(e);
  }

  return {};
}

async function loadPlayoffs() {
  // load standings
  lockUI();

  try {
    const divID = $('#ngs-division-playoff').dropdown('get value');
    const divSlug = $('#ngs-division-playoff')
      .dropdown('get text')
      .toLowerCase()
      .split(' ')
      .join('-');

    // standings have to be first
    await loadStandings(divID);

    // load bracket
    const bracketMatches = await loadBracket(divSlug);
    const matchesByID = {};
    bracketMatches.forEach((m) => {
      matchesByID[m._id] = m;
    });

    // load match
    const matchID = $('#ngs-playoff-match').dropdown('get value');
    if (matchID in matchesByID) {
      loadMatch(matchesByID[matchID]);
    }

    // ticker
    await loadTicker(divID);

    // commit
    appState.updateAndBroadcast();
    appState.updateAndBroadcastTicker();
  }
  catch (e) {
    console.log(e);
  }

  unlockUI();
}

function bind(state) {
  appState = state;

  $('#ngs-division').dropdown({
    onChange: ngsDivisionChange,
  });
  $('#ngs-round').dropdown({
    onChange: ngsRoundChange,
  });
  $('#ngs-division-playoff').dropdown({
    onChange: ngsPlayoffChange,
  });
  $('#ngs-match').dropdown();
  $('#ngs-load-all').click(loadAll);
  $('#ngs-load-playoff').click(loadPlayoffs);

  getDivisions();
}

exports.createUI = createUI;
exports.bind = bind;
exports.info = info;
