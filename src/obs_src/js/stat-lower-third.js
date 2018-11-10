
const socket = io('http://localhost:3005/');

class StatLowerThird {
  constructor() {
    this.name = 'Lower Third';
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
  }

  stageStats(data) {
    console.log(data);

    this.stagedData = data;
  }

  renderStagedStats() {
    // all common data can be filled in
    if (this.stagedData.data) {
      $('.pick-rate.stat').text(this.renderPct(this.stagedData.data.pickPct));
      $('.win-rate.stat').text(this.renderPct(this.stagedData.data.winPct));
      $('.ban-rate.stat').text(this.renderPct(this.stagedData.data.banPct));
      $('.part-rate.stat').text(this.renderPct(this.stagedData.data.partPct));
      $('.kda.stat').text(this.renderFixed(this.stagedData.data.KDA, 1));
      $('.kda-sep.stat').text(`${this.renderFixed(this.stagedData.data.K, 1)}/${this.renderFixed(this.stagedData.data.D, 1)}/${this.renderFixed(this.stagedData.data.A, 1)}`);
      $('.tdd-sep.stat').text(`${this.renderFixed(this.stagedData.data.TD, 1)}/${this.renderFixed(this.stagedData.data.D, 1)}/${this.renderFixed(this.stagedData.data.A, 1)}`);
      $('.record.stat').text(`${this.stagedData.data.win} - ${this.stagedData.data.games - this.stagedData.data.win}`);
      $('.kp.stat').text(this.renderPct(this.stagedData.data.KillParticipation));
      $('.uptime.stat').text(this.renderPct(1 - this.stagedData.data.timeDeadPct));
      $('.player-name').text(this.stagedData.player);
      $('.player-role').text(this.stagedData.playerRole);
      $('.player-on-hero').text(`on ${this.stagedData.hero}`)
      $('.wildcard.label').html(`${this.stagedData.data.wildcardName}<span class="col">:</span>`);
      $('.wildcard.stat').text(this.stagedData.data.wildcardData);
      $('.hero-role').text(this.stagedData.heroRole);
      setCSSImage('.team-portrait', this.stagedData.teamLogo);

      $('.hero-portrait').removeClass().addClass('hero-portrait');
      $('.hero-portrait').addClass(this.stagedData.heroClassname);
      $('.hero-name').text(this.stagedData.hero);
    }
  }

  showLt() {
    $('.lt-wrapper').transition('fade up in');
  }

  hideLt() {
    $('.lt-wrapper').transition('fade up out');
  }

  hideAll() {
    $('.lt-elem').not('.hidden').transition('fade out');
  }

  renderPct(val) {
    if (val !== null) {
      return `${Math.round(val * 100)}%`;
    }
    else {
      return '';
    }
  }

  renderFixed(val, fix) {
    if (val !== null) {
      return Math.round(val);
    }
    else {
      return '';
    }
  }

  run() {
    if (this.runningEzMode === true) {
      console.log('Already running in ez mode, please wait before running again');
      return;
    }

    if (this.stagedData) {
      // this will be variable soon
      const self = this;
      this.mode = this.stagedData.animMode ? this.stagedData.animMode : 'fade';
      this.duration = this.stagedData.duration;

      // first transition out visible, on complete, render the new stuff.
      // if nothing's visible, we'll skip this
      if (this.visibleElem !== '') {
        $(this.visibleElem).transition(`${this.mode} out`, () => {
          self.show();  
        });
      }
      else {
        this.show();
      }
    }
  }

  show() {
    if (this.runningEzMode === true) {
      console.log('Already running in ez mode, please wait before running again');
      return;
    }

    const self = this;

    this.renderStagedStats();

    // id to show is the staged data mode
    this.visibleElem = `#${this.stagedData.type}`;

    $(this.visibleElem).transition(`${this.mode} in`);

    if (this.duration && this.duration > 0) {
      setTimeout(() => { self.hide(); }, this.duration * 1000);
    }
  }

  hide() {
    if (this.runningEzMode === true) {
      console.log('Already running in ez mode, please wait before running again');
      return;
    }

    $(this.visibleElem).transition(`${this.mode} out`);

    this.visibleElem = '';
  }

  ezMode() {
    const self = this;
    if (this.runningEzMode === true) {
      console.log('Already running in ez mode, please wait before running again');
      return;
    }

    this.runningEzMode = true;
    this.duration = this.stagedData.duration;

    if (isNaN(this.duration) || this.duration < 2) {
      // default is 5
      this.duration = 5;
    }

    this.renderStagedStats();
    this.mode = this.stagedData.animMode ? this.stagedData.animMode : 'fade';
    this.visibleElem = `#${this.stagedData.type}`;
    $('.lt-wrapper').transition('fade up in', 500, function () {
      $(self.visibleElem).transition(`${self.mode} in`, 500, () => {
        setTimeout(function() {
          $(self.visibleElem).transition(`${self.mode} out`, 500);
        }, (self.duration - 1.5) * 1000);
        setTimeout(function() {
          $('.lt-wrapper').transition('fade up out', 500, () => {
            self.runningEzMode = false;
            self.visibleElem = '';
          })
        }, (self.duration - 0.95) * 1000);
      });
    });
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
  socket.on('run', () => { lt.run.call(lt); });
  socket.on('end', () => { lt.hide.call(lt); });
  socket.on('show', () => { lt.showLt.call(lt); });
  socket.on('hide', () => { lt.hideLt.call(lt); });
  socket.on('ezMode', () => { lt.ezMode.call(lt); });
});