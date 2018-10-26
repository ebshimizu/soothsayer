
const socket = io('http://localhost:3005/');

class StatLowerThird {
  constructor() {
    this.name = 'Lower Third';
    this.visibleElem = '';
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
      $('.kda.stat').text(this.renderFixed(this.stagedData.data.KDA, 1));
      $('.kda-sep.stat').text(`${this.renderFixed(this.stagedData.data.K, 1)}/${this.renderFixed(this.stagedData.data.D, 1)}/${this.renderFixed(this.stagedData.data.A, 1)}`);
      $('.tdd-sep.stat').text(`${this.renderFixed(this.stagedData.data.TD, 1)}/${this.renderFixed(this.stagedData.data.D, 1)}/${this.renderFixed(this.stagedData.data.A, 1)}`);
      $('.kp.stat').text(this.renderPct(this.stagedData.KillParticipation));
      $('.uptime.stat').text(this.renderPct(1 - this.stagedData.data.timeDeadPct));
      $('.player-name').text(this.stagedData.player);

      $('.hero-portrait').removeClass().addClass('hero-portrait');
      $('.hero-portrait').addClass(this.stagedData.heroClassname);
      $('.hero-name').text(this.stagedData.hero);
    }
  }

  hideAll() {
    $('.lt-elem').transition('fade out');
  }

  renderPct(val) {
    if (val) {
      return `${(val * 100).toFixed(1)}%`;
    }
    else {
      return '';
    }
  }

  renderFixed(val, fix) {
    if (val) {
      return val.toFixed(fix);
    }
    else {
      return '';
    }
  }

  run() {
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
    $(this.visibleElem).transition(`${this.mode} out`);

    this.visibleElem = '';
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
});