const socket = io('http://localhost:3005/');

function tableRowInside(r) {
  const elem = $(` 
    <div class="field place"></div>
    <div class="field team-name"></div>
    <div class="field record"></div>
    <div class="field win"></div>
    <div class="field loss"></div>
    <div class="field logo"></div>
  `);

  elem.siblings('.place').text(r.place);
  elem.siblings('.team-name').text(r.team);
  elem.siblings('.record').text(`${r.win}-${r.loss}`);
  elem.siblings('.loss').text(r.loss);
  elem.siblings('.win').text(r.win);
  setCSSImage(elem.find('.logo'), r.logo);

  return elem;
}

function tableRow(r, i, hidden) {
  const elem = $(`
    <div class="entry row ${i % 2 === 0 ? 'even' : 'odd'} ${r.focus || r.zoom ? 'focus' : ''} ${
    hidden ? 'transition hidden' : ''
  }">
    </div>
  `);

  elem.html(tableRowInside(r));
  return elem;
}

class TournamentStandings {
  constructor() {
    this.name = 'Tournament Standings';
  }

  ID() {
    return {
      name: this.name,
    };
  }

  // changes up the state n stuff
  updateState(state) {
    $('#tournament-name').text(state.casters.tournament);
    $('.standings-table').html('');
    clearTimeout(this.timeout);

    this.limit = Math.min(
      state.tournament.standingsSettings.limit,
      state.tournament.standings.length,
    );

    if (isNaN(this.limit)) {
      this.limit = 8;
    }

    // mode setup (still write to tables unless performance becomes a problem?)
    this.mode = state.tournament.standingsSettings.mode;

    if (this.mode === 'focus') {
      $('#topn-table').hide();
      $('#zoom-table').show();
      $('.standings-table').removeClass('dual');
    }
    else if (this.mode === 'combined') {
      $('#topn-table').show();
      $('#zoom-table').show();
      $('.standings-table').addClass('dual');
    }
    else {
      $('#topn-table').show();
      $('#zoom-table').hide();
      $('.standings-table').removeClass('dual');
    }

    state.tournament.standings.sort(function (a, b) {
      if (a.place < b.place) return -1;

      if (a.place > b.place) return 1;

      return 0;
    });

    // header
    $('.standings-table').append(`
      <div class="header row">
        <div class="field place">Rank</div>
        <div class="field team-name">Team</div>
        <div class="field record">Record</div>
        <div class="field win">Wins</div>
        <div class="field loss">Losses</div>
        <div class="field logo">Logo</div>
      </div>
    `);

    if (this.mode === 'combined') {
      $('#topn-table').prepend('<div class="alt row">All Teams</div>');
    }

    // top n
    let zoomIdx = 0;
    for (let i = 0; i < state.tournament.standings.length; i++) {
      const r = state.tournament.standings[i];

      if (r.zoom === true) {
        zoomIdx = i;
      }
    }

    const topLimit = this.mode === 'combined' ? state.tournament.standings.length : this.limit;
    for (let i = 0; i < topLimit; i++) {
      const r = state.tournament.standings[i];

      $('#topn-table').append(tableRow(r, i));
    }

    // zoom
    // zoom first needs the location of the zoom team (if any)
    // determine range
    let zmin = Math.max(0, zoomIdx - Math.floor(this.limit / 2));
    const zmax = Math.min(state.tournament.standings.length, zmin + this.limit);

    if (zmax - zmin < this.limit) {
      zmin = Math.max(0, zmax - this.limit);
    }

    for (let i = zmin; i < zmax; i++) {
      const r = state.tournament.standings[i];

      $('#zoom-table').append(tableRow(r, i));
    }

    // top n cycling
    this.standings = state.tournament.standings;

    if (this.mode === 'cycle') {
      // if we're not displaying everything, start the loop
      if (this.limit < state.tournament.standings.length) {
        this.currentPage = 0;
        this.timeout = setInterval(() => this.cyclePage.call(this), 10000);
      }
    }
  }

  cyclePage() {
    let next = this.currentPage + 1;
    if (next >= Math.ceil(this.standings.length / this.limit)) {
      next = 0;
    }

    const rmin = next * this.limit;
    const self = this;

    $('#topn-table div.entry').each(function (i) {
      const elem = $(this);
      elem.transition('fade out', 500, function () {
        const idx = rmin + i;
        if (idx < self.standings.length) {
          $(this)
            .removeClass('empty')
            .addClass('row');
          $(this).html(tableRowInside(self.standings[idx]));
          $(this).transition('fade in', 500);
        }
        else {
          $(this).html('');
          $(this)
            .addClass('empty')
            .removeClass('row');
        }
      });
    });

    this.currentPage = next;
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const tournament = new TournamentStandings();

  socket.on('requestID', () => {
    socket.emit('reportID', tournament.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => {
    tournament.updateState.call(tournament, state);
  });
  socket.on('changeTheme', (themeDir) => {
    changeTheme(themeDir, 'tournament-standings.css');
  });
});
