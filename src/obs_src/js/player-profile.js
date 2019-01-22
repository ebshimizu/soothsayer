
const socket = io('http://localhost:3005/');

class PlayerProfile {
  constructor() {
    this.name = 'Player Profile';
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

  }

  stageStats(data) {
    console.log(data);

    this.stagedData = data;
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const pp = new PlayerProfile();

  socket.on('requestID', () => { 
    socket.emit('reportID', lt.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { pp.updateState.call(pp, state); });
  socket.on('statLoad', (loadData) => { pp.stageStats.call(pp, loadData); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'profiles.css'); });
});