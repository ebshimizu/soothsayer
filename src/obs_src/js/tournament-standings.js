
const socket = io('http://localhost:3005/');

class TournamentStandings {
  constructor() {
    this.name = 'Tournament Standings';
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    $('#tournament-name').text(state.casters.tournament);
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const tournament = new TournamentStandings();

  socket.on('requestID', () => { 
    socket.emit('reportID', tournament.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { tournament.updateState.call(tournament, state); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'tournament-standings.css'); });
});