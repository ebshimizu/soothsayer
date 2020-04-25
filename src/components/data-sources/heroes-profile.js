const HeroDataURL = 'https://api.heroesprofile.com/api/NGS/Hero/Stat';
const PlayerDataURL = 'https://api.heroesprofile.com/api/NGS/Player/Profile';
const Season = 9;

function heroDataCall(hero, player) {
  const base = `${HeroDataURL}?api_token=${$('#hp-api-key').val()}&season=${Season}&division=${$('#hp-division-select').dropdown('get value')}&hero=${hero}`;

  if (player) {
    return `${base}&battletag=${encodeURIComponent(player)}`;
  }

  return base;
}

function playerDataCall(player) {
  return `${PlayerDataURL}?api_token=${$('#hp-api-key').val()}&season=${Season}&battletag=${encodeURIComponent(player)}&division=${$('#hp-division-select').dropdown('get value')}&region=1`;
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
    const name = player.substr(0, player.indexOf('#'));
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
      wildcardData: data.average_kda.toFixed(2),
    });
  });
}

function playerStats(player, callback, wildcard) {
  fetch(playerDataCall(player)).then(function (response) {
    return response.json();
  }).then(function (data) {
    const name = player.substr(0, player.indexOf('#'));

    callback({
      games: data.wins + data.losses,
      win: data.wins,
      winPct: data.wins / (data.wins + data.losses),
      K: data.total_kills,
      TD: data.total_takedowns,
      A: data.total_assists,
      D: data.total_deaths,
      KDA: data.kda,
      KillParticipation: data.kill_participation / 100,
      BTag: player,
      name,
      player: name,
      wildcardName: 'KDA',
      wildcardData: parseFloat(data.kda),
    });
  }).catch(err => callback({ error: err }));
}

function allPlayerStats(player, callback) {
  fetch(playerDataCall(player)).then(function (response) {
    return response.json();
  }).then(function (data) {
    const name = player.substr(0, player.indexOf('#'));

    const heroes = [];
    for (let i = 0; i < data.top_three_heroes.length; i++) {
      heroes.push({
        name: data.top_three_heroes[i],
        games: i,
        winPct: 0,
        wins: 0,
      });
    }

    callback({
      stats: {
        games: parseInt(data.wins) + parseInt(data.losses),
        wins: parseInt(data.wins),
        winPct: parseInt(data.wins) / (parseInt(data.wins) + parseInt(data.losses)),
        K: data.total_kills,
        TD: data.total_takedowns,
        A: data.total_assists,
        D: data.total_deaths,
        KDA: parseFloat(data.kda),
        KillParticipation: data.kill_participation / 100,
        BTag: player,
        name,
        player: name,
        heroPool: data.heroes_played,
        HeroDamage: parseFloat(data.avg_hero_damage),
        HighestKillStreak: parseFloat(data.avg_highest_kill_streak),
        TimeCCdEnemyHeroes: parseFloat(data.avg_time_cc_enemy_heroes),
        TimeRootingEnemyHeroes: parseFloat(data.avg_rooting_enemies),
        TimeSilencingEnemyHeroes: parseFloat(data.avg_silencing_enemies),
        TimeStunningEnemyHeroes: parseFloat(data.avg_stunning_enemies),
        Healing: parseFloat(data.avg_healing),
        hardCCTime: 0,
        ClutchHealsPerformed: parseFloat(data.avg_clutch_heals),
        ExperienceContribution: parseFloat(data.avg_experience_contribution),
        TeamfightHeroDamage: parseFloat(data.avg_teamfight_hero_damage),
        TimeSpentDead: parseFloat(data.avg_time_spent_dead),
      },
      heroes,
    });
  }).catch(err => callback({ error: err }));
}

exports.init = init;
exports.activate = activate;
exports.deactivate = deactivate;
exports.heroDraft = heroDraft;
exports.playerStatsForHero = playerStatsForHero;
exports.playerStats = playerStats;
exports.allPlayerStats = allPlayerStats;
