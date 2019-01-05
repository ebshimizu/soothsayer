
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
      $('#caster-1-name').removeClass().addClass(state.casters.one.size);
      $('#caster-1-social').removeClass().addClass(state.casters.one.size);
    }

    if (state.casters.two) {
      $('#caster-2-name').text(state.casters.two.name);
      $('#caster-2-social').text(state.casters.two.social);
      $('#caster-2-name').removeClass().addClass(state.casters.two.size);
      $('#caster-2-social').removeClass().addClass(state.casters.two.size);
    }

    if (state.casters.tournament) {
      $('#tournament-name').text(state.casters.tournament);
    }

    // dynamic frame
    if ($('body.dynamic').length > 0) {
      const id = state.casters.count === 1 ? 'single-caster-frame' : 'duo-caster-frame';
      $('body.dynamic').attr('id', id);
    }

    // sidebar elems (not present in all, so pretty low overhead)
    // create elems
    $('#sidebar-title').text(state.casters.sidebar.title);
    $('.sidebar-list').html('');

    if (state.casters.sidebar.text) {
      const lines = state.casters.sidebar.text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        $('.sidebar-list').append(`
          <div class="list-item">
            <div class="list-text">${lines[i]}</div>
          </div>
        `);
      }
    }

    $('#blue-team-name').text(state.blueTeam.name);
    $('#red-team-name').text(state.redTeam.name);
    $('#blue-team-score').text(isNaN(state.blueTeam.score) ? 0 : state.blueTeam.score);
    $('#red-team-score').text(isNaN(state.redTeam.score) ? 0 : state.redTeam.score);

    setCSSImage('#blue-team-logo', state.blueTeam.logo);
    setCSSImage('#red-team-logo', state.redTeam.logo);

    // variant options
    $('body').attr('frame-variant', state.casters.frame);
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