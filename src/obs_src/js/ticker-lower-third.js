
const socket = io('http://localhost:3005/');

class Ticker {
  constructor() {
    this.name = 'Ticker';
    this.visibleElem = '';
    this.hideLt();
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    $('#tournament-name').text(state.casters.tournament);
    this.items = state.ticker.items;
    this.ops = state.ticker.options;
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const lt = new Ticker();

  socket.on('requestID', () => { 
    socket.emit('reportID', lt.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { lt.updateState.call(lt, state); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'ticker-lower-third.css'); });
});