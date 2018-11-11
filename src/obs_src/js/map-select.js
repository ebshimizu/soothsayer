
const socket = io('http://localhost:3005/');

class MapSelect {
  constructor(variant) {
    this.name = `Map Draft - ${variant}`;
    this.tileClasses = 'blue-pick blue-ban red-pick red-ban';
    this.pool = [];
  }

  ID() {
    return {
      name: this.name,
    }
  }

  // changes up the state n stuff
  updateState(state) {
    // check for map pool changes
    if (!sameMembers(this.pool, state.match.mapPool)) {
      this.updateMapPool(state.match.mapPool);
    }

    // bans
    $('.map-grid-item').removeClass(this.tileClasses);

    if (state.match.blueMapBan in Maps)
      this.setTileState(Maps[state.match.blueMapBan].classname, 'blue-ban');

    if (state.match.redMapBan in Maps)
      this.setTileState(Maps[state.match.redMapBan].classname, 'red-ban');

    // picks
    for (let g of state.match.games) {
      if (g.map in Maps && g.pick !== '') {
        this.setTileState(Maps[g.map].classname, `${g.pick}-pick`);
      }
    }

    // logos and results
    $('.blue.team-name').text(state.blueTeam.name);
    $('.red.team-name').text(state.redTeam.name);
    $('.score.blue').text(isNaN(state.blueTeam.score) ? 0 : state.blueTeam.score);
    $('.score.red').text(isNaN(state.redTeam.score) ? 0 : state.redTeam.score);
    setCSSImage('.blue.team-logo', state.blueTeam.logo);
    setCSSImage('.red.team-logo', state.redTeam.logo);

    // results
    $('.map-select-row').remove();
    for (let i = 0; i < state.match.games.length; i++) {
      $('.map-selection-container').append(this.createMapBanner(state.match.games[i].map, i + 1));
      this.setBannerState(state, state.match.games[i], i + 1);
    }
  }

  setTileState(tileClass, newClass) {
    $(`.${tileClass}.map-grid-item`).addClass(newClass);
  }

  updateMapPool(pool) {
    this.pool = pool;

    // delete all map tiles
    $('.map-grid-item').remove();

    // given array of maps
    for (let map of pool) {
      $('.map-grid-container').append(this.createMapTile(Maps[map].classname));
    }

    if (pool.length > 9) {
      $('.map-grid-container').addClass('four-up');
    }
    else {
      $('.map-grid-container').removeClass('four-up');
    }
  }

  createMapTile(classname,) {
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
        <div class="picked-by">
          <div class="label">Pick</div>
          <div class="banner-team-logo"></div>
        </div>
        <div class="winner">
          <div class="label">Winner</div>
          <div class="banner-team-logo"></div>
        </div>
      </div>
    `;
  }

  setBannerState(state, game, index) {
    let elem = $(`.map-select-row[game-number="${index}"]`);

    if (game.pick === 'red' || game.pick === 'blue') {
      setCSSImage(elem.find('.picked-by .banner-team-logo'), game.pick === 'blue' ? state.blueTeam.logo : state.redTeam.logo);
    }
    else {
      elem.find('.picked-by').hide();
    }

    if (game.win === 'red' || game.win === 'blue') {
      elem.find('.winner').show();
      setCSSImage(elem.find('.winner .banner-team-logo'), game.win === 'blue' ? state.blueTeam.logo : state.redTeam.logo);
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

  socket.on('update', (state) => { mapSelect.updateState.call(mapSelect, state); });
  socket.on('mapPool', (pool) => {
    mapSelect.updateMapPool.call(mapSelect, pool);
    socket.emit('requestState');
  });

  socket.on('changeTheme', (themeDir) => { changeTheme(themeDir, 'map-select.css'); });
}