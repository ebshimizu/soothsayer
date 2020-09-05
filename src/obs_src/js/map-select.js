const socket = io('http://localhost:3005/');

class MapSelect {
  constructor(variant) {
    this.name = `Map Draft - ${variant}`;
    this.tileClasses = 'blue-pick blue-ban red-pick red-ban red-win blue-win';
    this.pool = [];
  }

  ID() {
    return {
      name: this.name,
    };
  }

  // changes up the state n stuff
  updateState(state) {
    // check for map pool changes
    if (state.match.mapPool && !sameMembers(this.pool, state.match.mapPool)) {
      this.updateMapPool(state.match.mapPool);
    }

    $('#tournament-name').text(state.casters.tournament);

    // bans
    $('.map-grid-item').removeClass(this.tileClasses);

    if (state.match.blueMapBan) {
      const blueBans = state.match.blueMapBan.split(',');
      for (const m of blueBans) {
        if (m in Maps) {
          this.setTileState(Maps[m].classname, 'blue-ban');
        }
      }
    }

    if (state.match.redMapBan) {
      const redBans = state.match.redMapBan.split(',');
      for (const m of redBans) {
        if (m in Maps) {
          this.setTileState(Maps[m].classname, 'red-ban');
        }
      }
    }

    // picks
    for (const g of state.match.games) {
      if (g.map in Maps && g.pick !== '') {
        this.setTileState(
          Maps[g.map].classname,
          `${g.pick}-pick ${g.win !== '' ? `${g.win}-win` : ''}`,
        );
      }
    }

    // logos and results
    $('.blue.team-name').text(state.blueTeam.name);
    $('.red.team-name').text(state.redTeam.name);
    $('.score.blue').text(
      isNaN(state.blueTeam.score) ? 0 : state.blueTeam.score,
    );
    $('.score.red').text(isNaN(state.redTeam.score) ? 0 : state.redTeam.score);
    setCSSImage('.blue.team-logo', state.blueTeam.logo);
    setCSSImage('.red.team-logo', state.redTeam.logo);

    // results
    $('.map-select-row').remove();
    for (let i = 0; i < state.match.games.length; i++) {
      $('.map-selection-container').append(
        this.createMapBanner(state.match.games[i].map, i + 1),
      );
      this.setBannerState(state, state.match.games[i], i + 1);
    }
  }

  setTileState(tileClass, newClass) {
    $(`.${tileClass}.map-grid-item`).addClass(newClass);
  }

  updateMapPool(pool) {
    if (!pool) return;

    this.pool = pool;

    // delete all map tiles
    $('.map-grid-item').remove();

    // given array of maps

    for (const map of pool) {
      $('.map-grid-container').append(this.createMapTile(Maps[map].classname));
    }

    if (pool.length > 9) {
      $('.map-grid-container').addClass('four-up');
    }
    else {
      $('.map-grid-container').removeClass('four-up');
    }
  }

  createMapTile(classname) {
    return `
      <div class="${classname} map-grid-item">
        <div class="map-tile"></div>
        <div class="status pick">
          <div class="text">
            <div class="text-item">PICK</div>
          </div>
        </div>
        <div class="status ban">
          <div class="text">
            <div class="text-item">BAN</div>
          </div>
        </div>
        <div class="status win">
          <div class="text">
            <div class="text-item">WIN</div>
          </div>
        </div>
      </div>
    `;
  }

  createMapBanner(map, index) {
    // map may not have been picked yet
    let classname = 'no-pick';
    if (map in Maps) {
      classname = Maps[map].classname;
    }

    return `
      <div class="${classname} map-select-row"  game-number="${index}">
        <div class="map-banner"></div>
        <div class="util-1"></div>
        <div class="util-2"></div>
        <div class="picked-by">
          <div class="label">Pick</div>
          <div class="name"></div>
          <div class="banner-team-logo"></div>
        </div>
        <div class="winner">
          <div class="label">Winner</div>
          <div class="name"></div>
          <div class="banner-team-logo"></div>
        </div>
      </div>
    `;
  }

  setBannerState(state, game, index) {
    const elem = $(`.map-select-row[game-number="${index}"]`);

    if (game.pick === 'red' || game.pick === 'blue') {
      setCSSImage(
        elem.find('.picked-by .banner-team-logo'),
        game.pick === 'blue' ? state.blueTeam.logo : state.redTeam.logo,
      );
      elem
        .find('.picked-by .name')
        .text(game.pick === 'blue' ? state.blueTeam.name : state.redTeam.name);
      elem.find('.picked-by').addClass(game.pick);
    }
    else {
      elem.find('.picked-by').hide();
    }

    if (game.win === 'red' || game.win === 'blue') {
      elem.find('.winner').show();
      setCSSImage(
        elem.find('.winner .banner-team-logo'),
        game.win === 'blue' ? state.blueTeam.logo : state.redTeam.logo,
      );
      elem
        .find('.winner .name')
        .text(game.win === 'blue' ? state.blueTeam.name : state.redTeam.name);
      elem.addClass(`${game.win} win`);
    }
    else {
      elem.find('.winner').hide();
    }
  }
}

function initMapSelect(variant) {
  // just kinda runs on page load huh
  const mapSelect = new MapSelect(variant);

  socket.on('requestID', () => {
    socket.emit('reportID', mapSelect.ID());
    socket.emit('requestMapPool');
  });

  socket.on('update', (state) => {
    mapSelect.updateState.call(mapSelect, state);
  });
  socket.on('mapPool', (pool) => {
    mapSelect.updateMapPool.call(mapSelect, pool);
    socket.emit('requestState');
  });

  socket.on('changeTheme', (themeDir) => {
    changeTheme(themeDir, 'map-select.css');
  });
}
