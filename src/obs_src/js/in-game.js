
const socket = io('http://localhost:3005/');

class InGameHUD {
  constructor() {
    this.name = 'In-Game HUD';
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    $('#blue-team-name').text(state.blueTeam.name);
    $('#red-team-name').text(state.redTeam.name);
    $('#blue-team-score').text(state.blueTeam.score);
    $('#red-team-score').text(state.redTeam.score);

    if (state.match.bestOf !== 'none') {
      $('#best-of').text(`Bo${state.match.bestOf}`);
    }
    else {
      $('#best-of').text('');
    }

    $('.match-tile').removeClass(mapClassList);

    for (let i = 0; i < state.match.games.length; i++) {
      if (state.match.games[i].map in Maps) {
        $(`#match-${i + 1}-tile`).addClass(Maps[state.match.games[i].map].classname);
      }
    }

    this.setLogo('#blue-team-logo', state.blueTeam.logo);
    this.setLogo('#red-team-logo', state.redTeam.logo);
  }

  setLogo(id, path) {
    setCSSImage(id, path);
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const inGameHUD = new InGameHUD();

  socket.on('requestID', () => { 
    socket.emit('reportID', inGameHUD.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { inGameHUD.updateState.call(inGameHUD, state); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'in-game.css'); });
});