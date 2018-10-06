const socket = io('http://localhost:3005/');

class SingleImage {
  // constructor argument is the function that given the state, returns the image needed.
  // little clunky, but should be general enough to work
  constructor(name, fieldAccessor) {
    this.name = name;
    this.accessor = fieldAccessor;
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    setCSSImage('body', this.accessor(state));
  }
}

function syncImage(name, fieldAccessor) {
  // just kinda runs on page load huh
  const singleImage = new SingleImage(name, fieldAccessor);

  socket.on('requestID', () => { 
    socket.emit('reportID', singleImage.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { singleImage.updateState.call(singleImage, state); });
}