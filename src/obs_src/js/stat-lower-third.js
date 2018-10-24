
const socket = io('http://localhost:3005/');

class StatLowerThird {
  constructor() {
    this.name = 'Lower Third';
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
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const lt = new StatLowerThird();

  socket.on('requestID', () => { 
    socket.emit('reportID', lt.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { lt.updateState.call(lt, state); });
  socket.on('statLoad', (loadData) => { lt.stageStats.call(lt, loadData); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'stat-lower-third.css'); });
});