const socket = io('http://localhost:3005/');

function renderStat(row, i) {
  return `
    <div class="stat row ${i % 2 === 0 ? 'even' : 'odd'} ${row.key}">
      <div class="name">${row.name}</div>
      <div class="value">${row.val}</div>
    </div>
  `;
}

function renderHero(row, i) {
  if (!row) {
    return `<div class="empty hero item ${i % 2 === 0 ? 'even' : 'odd'} hero-${i}"></div>`;
  }

  return `
    <div class="hero item ${i % 2 === 0 ? 'even' : 'odd'} hero-${i} ${row.classname}">
      <div class="name">${row.name}</div>
      <div class="win">${row.wins}</div>
      <div class="games">${row.games}</div>
      <div class="loss">${row.games - row.wins}</div>
      <div class="win-pct">${row.winPct}</div>
      <div class="hero-util"></div>
    </div>
  `;
}

function getLabel(type) {
  if (type === 'role-assassin') {
    return 'Assassin';
  }
  else if (type === 'role-warrior') {
    return 'Warrior';
  }
  else if (type === 'role-support') {
    return 'Support';
  }
  else if (type === 'role-offlane') {
    return 'Offlane';
  }
}

class PlayerProfile {
  constructor() {
    this.name = 'Player Profile';
    $('.player-twitch').hide();
    $('.player-twitter').hide();
  }

  ID() {
    return {
      name: this.name,
    };
  }

  // changes up the state n stuff
  updateState(state) {
    // tournament name
    $('#tournament-name').text(state.casters.tournament);
  }

  stageStats(data) {
    console.log(data);

    this.stagedData = data;

    // name filtering, removed btag if exists
    if (this.stagedData.name.indexOf('#') > 0) {
      this.stagedData.name = this.stagedData.name.substring(0, this.stagedData.name.indexOf('#'));
    }
  }

  render() {
    // the basics
    $('.player-name').text(this.stagedData.name);
    $('.type .text').text(getLabel(this.stagedData.type));
    $('.type').attr('type', this.stagedData.type);

    if (this.stagedData.logo !== '') {
      setCSSImage($('.logo'), this.stagedData.logo);
    }
    else {
      setCSSImage($('.logo'), './images/default-logo.png');
    }

    $('.player-twitch').hide();
    $('.player-twitch .handle').text(this.stagedData.twitch);

    $('.player-twitter').hide();
    $('.player-twitter .handle').text(this.stagedData.twitter);

    // handle visibility
    if (this.stagedData.twitch !== '') {
      $('.player-twitch').show();
    }

    if (this.stagedData.twitter !== '') {
      $('.player-twitter').show();
    }

    // stats. array is in display order.
    $('.stats.container').html('');
    const stats = this.stagedData.stats.stats;
    for (let i = 0; i < stats.length; i += 1) {
      $('.stats.container').append(renderStat(stats[i], i));
    }

    // heroes
    $('.heroes.container').html('');
    const heroes = this.stagedData.stats.heroes;
    for (let i = 0; i < 3; i += 1) {
      if (i >= heroes.length) {
        $('.heroes.container').append(renderHero(null, i));
      }
      else {
        $('.heroes.container').append(renderHero(heroes[i], i));
      }
    }
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const pp = new PlayerProfile();

  socket.on('requestID', () => {
    socket.emit('reportID', pp.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => {
    pp.updateState.call(pp, state);
  });
  socket.on('statLoad', (loadData) => {
    pp.stageStats.call(pp, loadData);
  });
  socket.on('render', () => {
    pp.render.call(pp);
  });
  socket.on('changeTheme', (themeDir) => {
    changeTheme(themeDir, 'player-profile.css');
  });
});
