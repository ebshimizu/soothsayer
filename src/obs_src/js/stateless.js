const socket = io('http://localhost:3005/');

// this doesn't listen to any state events and will only react to style change events.
class Stateless {
  constructor(name) {
    this.name = name;
  }

  ID() {
    return {
      name: this.name,
    }
  }
}

function initStateless(name) {
  // just kinda runs on page load huh
  const stateless = new Stateless(name);

  socket.on('requestID', () => { 
    socket.emit('reportID', stateless.ID());
  });

  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'stateless.css'); });
}