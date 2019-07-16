const HeroDataURL = 'https://heroesprofile.com/API/NGS/HeroStats/';
const Season = 7;

function heroDataCall(hero, player) {
  const base = `${HeroDataURL}?api_key=${$('#hp-api-key').val()}&season=${Season}&division=${$('#hp-division-select').dropdown('get value')}&hero=${hero}`;

  if (player) {
    return `${base}&player=${player}`;
  }

  return base;
}

function init() {
  $('#hp-division-select').dropdown();
}

function activate() {
  // no action, is api
}

function deactivate() {
  // no action, is api
}

function heroDraft(hero, cb, wildcard) {
  fetch(heroDataCall(hero)).then(function (response) {
    return response.json();
  }).then(function (data) {
    // data reformat
    const totalMatches = parseInt(data.division_total_games);
    cb({
      pick: data.games_played,
      pickPct: data.games_played / totalMatches,
      ban: data.bans,
      banPct: data.bans / totalMatches,
      part: data.participation,
      partPct: data.participation / totalMatches,
      win: data.wins,
      winPct: data.games_played > 0 ? data.wins / data.games_played : 0,
      K: data.kills,
      TD: data.takedowns,
      A: data.assists,
      D: data.deaths,
      KDA: data.average_kda,
    });
  });
}

function playerStatsForHero(player, hero, cb, wildcard) {
  fetch(heroDataCall(hero, player)).then(function (response) {
    return response.json();
  }).then(function (data) {
    // data reformat
    const name = player.substr(0, player.indexOf('#'));;
    const totalMatches = parseInt(data.division_total_games);

    cb({
      pick: data.games_played,
      pickPct: data.games_played / totalMatches,
      ban: data.bans,
      banPct: data.bans / totalMatches,
      part: data.participation,
      partPct: data.participation / totalMatches,
      win: data.wins,
      winPct: data.games_played > 0 ? data.wins / data.games_played : 0,
      games: data.games_played,
      name,
      player: name,
      K: data.kills,
      TD: data.takedowns,
      A: data.assists,
      D: data.deaths,
      KDA: data.average_kda,
      wildcardName: 'Avg. KDA',
      wildcardData: data.average_kda,
    });
  });
}

function playerStats() {

}

function allPlayerStats() {

}

exports.init = init;
exports.activate = activate;
exports.deactivate = deactivate;
exports.heroDraft = heroDraft;
exports.playerStatsForHero = playerStatsForHero;
exports.playerStats = playerStats;
exports.allPlayerStats = allPlayerStats;