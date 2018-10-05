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
  }
}

// just kinda runs on page load huh
const inGameHUD = new InGameHUD();

socket.on('requestID', () => { 
  socket.emit('reportID', inGameHUD.ID());
  socket.emit('requestState');
});

socket.on('update', inGameHUD.updateState);