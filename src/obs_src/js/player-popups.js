
const socket = io('http://localhost:3005/');

class PlayerPopups {
  constructor() {
    this.name = 'Player Popups';
    this.running = false;
    this.config = {};
    this.blueTeam = {};
    this.redTeam = {};
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    this.config = state.misc;
    this.blueTeam = state.blueTeam;
    this.redTeam = state.redTeam;

    // default is 30s
    this.config.length = this.config.popupAnimLength ? parseFloat(this.config.popupAnimLength) * 1000 : 30000;

    if (!this.config.popupDisplayMode) {
      this.config.popupDisplayMode = 'all';
    }
  }

  render() {
    if (this.blueTeam.players) {
      this.renderTeam('blue', this.blueTeam.players);
    }

    if (this.redTeam.players) {
      this.renderTeam('red', this.redTeam.players);
    }
  }

  renderTeam(color, players) {
    for (let i = 0; i < players.length; i++) {
      if (players[i]) {
        let elem = $(`.player-popup.${color}.player-${i + 1}`);

        elem.find('.hero-name').text(players[i].hero);
        elem.find('.player-name').text(players[i].name);
        elem.find('.portrait').removeClass().addClass(`portrait ${players[i].classname}`);
      }
    }
  }

  run() {
    if (this.running) {
      console.log('Animation already in progress. Ignoring run command.');
      return;
    }

    console.log(`Running ${this.config.popupDisplayMode}, length ${this.config.length}ms`);

    this.render();
    const self = this;
    this.running = true;

    // all popups at once, hold for animation duration
    if (this.config.popupDisplayMode === 'all') {
      $('body').removeClass().addClass('all');
      $('.blue.player-popup').transition({
        animation: 'fade right in',
        duration: 500,
      });
      $('.red.player-popup').transition({
        animation: 'fade left in',
        duration: 500,
      });

      setTimeout(function() {
        $('.blue.player-popup').transition({
          animation: 'fade right out',
          duration: 500,
        });

        $('.red.player-popup').transition({
          animation: 'fade left out',
          duration: 500,
        });

        self.running = false;
      }, this.config.length - 1000);
    }
    else if (this.config.popupDisplayMode === 'blue-then-red') {
      $('body').removeClass().addClass('all');
      const perTeamTime = this.config.length / 2;

      $('.blue.player-popup').transition('fade right in', 500);
      setTimeout(() => {
        $('.blue.player-popup').transition('fade right out', 500);
        setTimeout(() => { $('.red.player-popup').transition('fade left in', 500); }, 500);
        setTimeout(() => {
          $('.red.player-popup').transition('fade left out', 500);
          self.running = false;
        }, perTeamTime - 1000);
      }, perTeamTime - 1000);
    }
    else if (this.config.popupDisplayMode === 'blue-only') {
      $('body').removeClass().addClass('all');
      $('.blue.player-popup').transition('fade right in', 500);
      setTimeout(() => {
        $('.blue.player-popup').transition('fade right out', 500);
        self.running = false;
      }, this.config.length - 1000);
    }
    else if (this.config.popupDisplayMode === 'red-only') {
      $('body').removeClass().addClass('all');
      $('.red.player-popup').transition('fade left in', 500);
      setTimeout(() => {
        $('.red.player-popup').transition('fade left out', 500);
        self.running = false;
      }, this.config.length - 1000);
    }
    else if (this.config.popupDisplayMode === 'one-a-time-both') {
      $('body').removeClass().addClass('single');
      const interval = this.config.length / 10;

      const order = [];
      for (const team of ['red', 'blue']) {
        for (const player of [5, 4, 3, 2, 1]) {
          order.push(`.${team}.player-popup.player-${player}`);
        }
      }

      this.runAnimationStack(order.pop(), order, 'fade', interval);
    }
    else if (this.config.popupDisplayMode === 'one-a-time-blue') {
      $('body').removeClass().addClass('single');
      const interval = this.config.length / 5;

      const order = [];
      for (const player of [5, 4, 3, 2, 1]) {
        order.push(`.blue.player-popup.player-${player}`);
      }

      this.runAnimationStack(order.pop(), order, 'fade', interval);
    }
    else if (this.config.popupDisplayMode === 'one-a-time-red') {
      $('body').removeClass().addClass('single');
      const interval = this.config.length / 5;

      const order = [];
      for (const player of [5, 4, 3, 2, 1]) {
        order.push(`.red.player-popup.player-${player}`);
      }

      this.runAnimationStack(order.pop(), order, 'fade', interval);
    }
    else {
      console.log(`Unrecognized mode: ${this.config.popupDisplayMode}`);
      this.running = false;
    }
  }

  runAnimationStack(next, remaining, type, interval) {
    if (next) {
      const self = this;

      $(next).transition(`${type} in`, 500);
      setTimeout(() => {
        $(next).transition(`${type} out`, 500, () => {
          self.runAnimationStack(remaining.pop(), remaining, type, interval);
        });
      }, interval - 1000);
    }
    else {
      // base case
      this.running = false;
    }
  }
}


$(document).ready(() => {
  // just kinda runs on page load huh
  const popups = new PlayerPopups();

  socket.on('requestID', () => { 
    socket.emit('reportID', popups.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => { popups.updateState.call(popups, state); });
  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'player-popups.css'); });
  socket.on('runPopups', () => { popups.run.call(popups); });
});