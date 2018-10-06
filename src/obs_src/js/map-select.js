
const socket = io('http://localhost:3005/');

class MapSelect {
  constructor() {
    this.name = 'Map Draft';
    this.tileClasses = 'blue-pick blue-ban red-pick red-ban';
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
    this.setTileState(Maps[state.match.blueMapBan].classname, 'blue-ban');
    this.setTileState(Maps[state.match.redMapBan].classname, 'red-ban');

    // picks
    for (let g of state.match.games) {
      if (g.map in Maps && g.pick !== '') {
        this.setTileState(Maps[g.map].classname, `${g.pick}-pick`);
      }
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
      </div>
    `;
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const mapSelect = new MapSelect();

  socket.on('requestID', () => { 
    socket.emit('reportID', mapSelect.ID());
    socket.emit('requestMapPool');
  });

  socket.on('update', (state) => { mapSelect.updateState.call(mapSelect, state); });
  socket.on('mapPool', (pool) => {
    mapSelect.updateMapPool.call(mapSelect, pool);
    socket.emit('requestState');
  });
});