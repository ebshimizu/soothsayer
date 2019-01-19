const socket = io('http://localhost:3005/');

var lt;

function tickerAbsoluteSort(a, b) {
  if (a.order < b.order) return -1;

  if (a.order > b.order) return 1;

  return 0;
}

function tickerCategorySort(a, b) {
  if (a.category < b.category) return -1;

  if (a.category > b.category) return 1;

  // tiebreaker
  return tickerAbsoluteSort(a, b);
}

function devStop() {
  clearTimeout(lt.timeout);
}

class Ticker {
  constructor() {
    this.name = 'Ticker';
    this.visibleElem = '';
  }

  ID() {
    return {
      name: this.name,
    };
  }

  // changes up the state n stuff
  updateState(state) {
    // $('#tournament-name').text(state.casters.tournament);
    clearTimeout(this.timeout);
    this.items = state.ticker.items;
    this.opts = state.ticker.options;

    // likely temporary
    this.opts.delay = 10000;

    if (!this.opts.animationMode) this.opts.animationMode = 'fade';

    // don't do anything except hide on 0 length item field.
    if (this.items.length === 0) {
      this.hide();
      $('#ticker-title').text('');
      return;
    }

    this.sortItems();
    this.nextItem = 0;
    this.cycle();
  }

  sortItems() {
    if (this.opts.orderMode === 'grouped') this.items.sort(tickerCategorySort);
    else this.items.sort(tickerAbsoluteSort);
  }

  hide(cb) {
    if (!cb)
      cb = () => {};

    $('#ticker-content')
      .transition(`${this.opts.animationMode} out`, 500, cb);
  }

  show(cb) {
    if (!cb)
      cb = () => {};

    $('#ticker-content.hidden').transition(`${this.opts.animationMode} in`, 500, cb);
  }

  cycle() {
    const self = this;
    const item = this.items[this.nextItem];

    // if the title needs to be changed, this should complete at roughly the same time
    if ($('#ticker-title').text() !== item.category) {
      $('#ticker-title').transition('fade out', 500, () => {
        $('#ticker-title').text(item.category);
        $('#ticker-title').transition('fade in', 500);
      });
    }

    this.hide(() => {
      $('#ticker-content').html(self.renderItem(item));


      self.show(() => {
        self.nextItem += 1;

        if (self.nextItem >= self.items.length) self.nextItem = 0;

        self.timeout = setTimeout(() => self.cycle.call(self), self.opts.delay);
      });
    });
  }

  renderItem(item) {
    if (item.mode === 'text') {
      return this.textItem(item);
    }
    else if (item.mode === 'upcoming') {
      return this.upcomingItem(item);
    }
    else if (item.mode === 'recent') {
      return this.recentItem(item);
    }
  }

  textItem(item) {
    const elem = $(`
      <div class="text item">
        <div class="bg"></div>
        <div class="util-1"></div>
        <div class="util-2"></div>
        <div class="util-3"></div>
        <div class="content">

        </div>
      </div>
    `);

    elem.find('.content').text(item.text);
    return elem;
  }

  upcomingItem(item) {
    const elem = $(`
      <div class="upcoming item">
        <div class="bg"></div>
        <div class="util-1"></div>
        <div class="util-2"></div>
        <div class="util-3"></div>
        <div class="twitch-container">
          <div class="container">
            <i class="twitch icon"></i>
            <span class="twitch-handle"></span>
          </div>
        </div>
        <div class="date"></div>
        <div class="vs-container">
          <div class="blue name"></div>
          <div class="vs">VS</div>
          <div class="red name"></div>
        </div>
        <div class="blue logo"></div>
        <div class="red logo"></div>
        <div class="subtitle"></div>
      </div>
    `);

    // substitution
    elem.find('.twitch-handle').text(item.twitch);

    if (item.upcomingDate && item.upcomingDate !== '') {
      elem.find('.date').text(moment(item.upcomingDate).tz(moment.tz.guess()).format('MMM D, h:mma z'));
    }
    elem.find('.blue.name').text(item.blueTeam);
    elem.find('.red.name').text(item.redTeam);
    elem.find('.subtitle').text(item.text);

    setCSSImage(elem.find('.blue.logo'), item.blueLogo);
    setCSSImage(elem.find('.red.logo'), item.redLogo);

    return elem;
  }

  recentItem(item) {
    const elem = $(`
      <div class="recent item">
        <div class="bg"></div>
        <div class="util-1"></div>
        <div class="util-2"></div>
        <div class="util-3"></div>
        <div class="vs-container">
          <div class="blue name"></div>
          <div class="vs">VS</div>
          <div class="red name"></div>
        </div>
        <div class="blue logo"></div>
        <div class="red logo"></div>
        <div class="blue score"></div>
        <div class="red score"></div>
        <div class="subtitle"></div>
      </div>
    `);

    // substitution
    elem.find('.blue.name').text(item.blueTeam);
    elem.find('.red.name').text(item.redTeam);
    elem.find('.blue.score').text(item.blueScore);
    elem.find('.red.score').text(item.redScore);
    elem.find('.subtitle').text(item.text);

    if (item.blueScore > item.redScore) {
      elem.find('.blue').addClass('winner');
    }
    else if (item.redScore > item.blueScore) {
      elem.find('.red').addClass('winner');
    }
    else {
      elem.find('.red').addClass('draw');
      elem.find('blue').addClass('draw');
    }

    setCSSImage(elem.find('.blue.logo'), item.blueLogo);
    setCSSImage(elem.find('.red.logo'), item.redLogo);

    return elem;
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  lt = new Ticker();

  socket.on('requestID', () => {
    socket.emit('reportID', lt.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => {
    lt.updateState.call(lt, state);
  });
  socket.on('changeTheme', (themeDir) => {
    changeTheme(themeDir, 'ticker-lower-third.css');
  });
});
