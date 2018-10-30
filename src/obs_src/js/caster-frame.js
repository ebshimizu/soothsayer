
const socket = io('http://localhost:3005/');

class CasterFrame {
  constructor(variant) {
    this.name = `Caster Frame - ${variant}`;
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    if (state.casters.one) {
      $('#caster-1-name').text(state.casters.one.name);
      $('#caster-1-social').text(state.casters.one.social);
    }

    if (state.casters.two) {
      $('#caster-2-name').text(state.casters.two.name);
      $('#caster-2-social').text(state.casters.two.social);
    }

    if (state.casters.tournament) {
      $('#tournament-name').text(state.casters.tournament);
    }
  }
}


function initCasterFrame(variantName) {
  // just kinda runs on page load huh
  const casterFrame = new CasterFrame(variantName);

  socket.on('requestID', () => { 
    socket.emit('reportID', casterFrame.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { casterFrame.updateState.call(casterFrame, state); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'caster-frame.css'); });
};