let appState;

function tickerDropdown() {
  return `
    <div class="ui selection dropdown ticker-mode">
      <i class="dropdown icon"></i>
      <div class="text"></div>
      <div class="menu">
        <div class="item" data-value="text">Plain Text</div>
        <div class="item" data-value="upcoming">Upcoming Match</div>
        <div class="item" data-value="recent">Recent Result</div>
      </div>
    </div>
  `;
}

function tickerItem(r, id) {
  return `
    <div class="ui ticker-item segment" item-id="${id}">
      <div class="ui form">
        <div class="fields">
          <div class="two wide field">
            <label>Order</label>
            <div class="ui fluid input">
              <input type="number" name="ticker-order" value="${r.order ? r.order : id}">
            </div>
          </div>
          <div class="four wide field">
            <label>Item Mode</label>
            ${tickerDropdown()}
          </div>
          <div class="seven wide field">
            <label>Category Title</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-cat" value="${r.category ? r.category : ''}">
            </div>
          </div>
          <div class="three wide field">
            <label>Delete</label>
            <div class="ui red fluid labeled icon button" name="delete">
              <i class="trash icon"></i>
              Delete
            </div>
          </div>
        </div>
        <div class="fields">
          <div class="sixteen wide field">
            <label>Plain Text / Subtitle</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-subtitle" value="${r.text ? r.text : ''}">
            </div>
          </div>
        </div>
        <div class="fields teams">
          <div class="four wide field">
            <label>Blue Team Name</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-blue-team" value="${r.blueTeam ? r.blueTeam : ''}">
            </div>
          </div>
          <div class="four wide field">
            <label>Blue Team Logo</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-blue-logo" value="${r.blueLogo ? r.blueLogo : ''}">
            </div>
          </div>
          <div class="four wide field">
            <label>Red Team Name</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-red-team" value="${r.redTeam ? r.redTeam : ''}">
            </div>
          </div>
          <div class="four wide field">
            <label>Red Team Logo</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-red-logo" value="${r.redLogo ? r.redLogo : ''}">
            </div>
          </div>
        </div>
        <div class="fields recent">
          <div class="three wide field">
            <label>Blue Team Score</label>
            <div class="ui fluid input">
              <input type="number" name="ticker-blue-score" value="${
                !isNaN(r.blueScore) ? r.blueScore : ''
              }">
            </div>
          </div>
          <div class="three wide field">
            <label>Red Team Score</label>
            <div class="ui fluid input">
              <input type="number" name="ticker-red-score" value="${
                !isNaN(r.redScore) ? r.redScore : ''
              }">
            </div>
          </div>
          <div class="four wide field" style="display:none;">
            <label>Date</label>
            <div class="ui fluid input">
              <input type="datetime-local" name="ticker-recent-date" value="${
                r.recentDate ? r.recentDate : ''
              }">
            </div>
          </div>
        </div>
        <div class="fields upcoming">
          <div class="four wide field">
            <label>Twitch Username (not URL)</label>
            <div class="ui left icon fluid input">
              <i class="twitch icon"></i>
              <input type="text" name="ticker-twitch" value="${r.twitch ? r.twitch : ''}">
            </div>
          </div>
          <div class="four wide field">
            <label>Date</label>
            <div class="ui fluid input">
              <input type="datetime-local" name="ticker-upcoming-date" value="${
                r.upcomingDate ? r.upcomingDate : ''
              }">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

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

function changeTickerMode(mode, id) {
  const elem = $(`#ticker-items .ticker-item[item-id="${id}"]`);
  elem.find('.upcoming').hide();
  elem.find('.recent').hide();
  elem.find('.teams').hide();

  if (mode === 'upcoming') {
    elem.find('.teams').show();
    elem.find('.upcoming').show();
    elem.find('input[name="ticker-cat"]').val('Upcoming Matches');
  }
  else if (mode === 'recent') {
    elem.find('.teams').show();
    elem.find('.recent').show();
    elem.find('input[name="ticker-cat"]').val('Recent Results');
  }
}

function addItem(data, id) {
  $('#ticker-items').append(tickerItem(data, id));

  // bindings
  const elem = $(`#ticker-items .ticker-item[item-id="${id}"]`);
  elem.find('.ticker-mode.dropdown').dropdown({
    onChange: (val) => {
      changeTickerMode(val, id);
    },
  });

  elem.find('.ticker-mode.dropdown').dropdown('set exactly', data.mode ? data.mode : 'text');
  elem.find('.button[name="delete"]').click(() => {
    $(`#ticker-items .ticker-item[item-id="${id}"]`).remove();
  });
}

function clearItems() {
  $('#ticker-items').html('');
}

function renderTickerItems(data) {
  clearItems();

  if (!data) return;

  // sort for display
  const mode = appState ? appState.ticker.options.orderMode : 'grouped';
  if (mode === 'grouped') {
    data.sort(tickerCategorySort);
  }
  else {
    data.sort(tickerAbsoluteSort);
  }

  for (let i = 0; i < data.length; i++) {
    addItem(data[i], i);
  }
}

function getTickerInput(elem, name) {
  return $(elem)
    .find(`input[name="${name}"]`)
    .val();
}

function getTickerItemData(elem) {
  return {
    order: parseInt(getTickerInput(elem, 'ticker-order')),
    category: getTickerInput(elem, 'ticker-cat'),
    mode: $(elem)
      .find('.ticker-mode')
      .dropdown('get value'),
    blueTeam: getTickerInput(elem, 'ticker-blue-team'),
    blueLogo: getTickerInput(elem, 'ticker-blue-logo'),
    redTeam: getTickerInput(elem, 'ticker-red-team'),
    redLogo: getTickerInput(elem, 'ticker-red-logo'),
    blueScore: parseInt(getTickerInput(elem, 'ticker-blue-score')),
    redScore: parseInt(getTickerInput(elem, 'ticker-red-score')),
    recentDate: getTickerInput(elem, 'ticker-recent-date'),
    twitch: getTickerInput(elem, 'ticker-twitch'),
    upcomingDate: getTickerInput(elem, 'ticker-upcoming-date'),
    text: getTickerInput(elem, 'ticker-subtitle'),
  };
}

function getTickerData() {
  const items = [];

  $('#ticker-items .ticker-item').each(function () {
    items.push(getTickerItemData(this));
  });

  return items;
}

function getTickerOptions() {
  return {
    animationMode: $('#ticker-anim-mode').dropdown('get value'),
    orderMode: $('#ticker-order-mode').dropdown('get value'),
  };
}

function showTickerOptions(opts) {
  if (opts) {
    $('#ticker-anim-mode').dropdown(
      'set exactly',
      opts.animationMode ? opts.animationMode : 'fade right',
    );
    $('#ticker-order-mode').dropdown('set exactly', opts.orderMode ? opts.orderMode : 'grouped');
  }
  else {
    $('#ticker-anim-mode').dropdown('set exactly', 'fade right');
    $('#ticker-order-mode').dropdown('set exactly', 'grouped');
  }
}

function init() {
  $('#ticker-anim-mode').dropdown();
  $('#ticker-order-mode').dropdown();
  $('#ticker-add-item').click(() => {
    addItem({}, $('#ticker-items .ticker-item').length + 1);
  });
}

function initWithState(state) {
  appState = state;
  appState.displayTickerData();
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.getItems = getTickerData;
exports.renderItems = renderTickerItems;
exports.getOptions = getTickerOptions;
exports.renderOptions = showTickerOptions;
