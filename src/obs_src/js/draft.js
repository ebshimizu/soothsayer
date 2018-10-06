
const socket = io('http://localhost:3005/');

class Draft {
  constructor() {
    this.name = 'Draft HUD';
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

    this.setLogo('#blue-team-logo', state.blueTeam.logo);
    this.setLogo('#red-team-logo', state.redTeam.logo);
  }

  setLogo(id, path) {
    setCSSImage(id, path);
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const draft = new Draft();

  socket.on('requestID', () => { 
    socket.emit('reportID', draft.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { draft.updateState.call(draft, state); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'draft.css'); });
});