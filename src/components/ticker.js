const Util = require('./util');

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
        <div class="item" data-value="link">Plain Text + Highlight</div>
        <div class="item" data-value="image">Image</div>
        <div class="item" data-value="ranking">Ranking</div>
      </div>
    </div>
  `;
}

function tickerItem(r, id) {
  return `
    <div class="ui ticker-item segment" item-id="${id}">
      <h3 class="ui dividing header"></h3>
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
        <div class="text-type fields">
          <div class="sixteen wide field">
            <label>Plain Text</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-subtitle" value="${r.text ? r.text : ''}">
            </div>
          </div>
        </div>
        <div class="link fields">
          <div class="sixteen wide field">
            <label>Highlight Text (at end of Text, or use {$1} to place)</label>
            <div class="ui fluid input">
              <input type="text" name="ticker-link" value="${r.link ? r.link : ''}">
            </div>
          </div>
        </div>
        <div class="image-type fields">
          <div class="sixteen wide field">
            <label>Image</label>
            <div class="ui fluid action input">
              <input type="text" name="ticker-general-image" value="${r.image ? r.image : ''}">
              <div class="ui buttons">
                <div class="ui right attached icon button browse" item-id="${id}">
                  <i class="folder open icon"></i>
                </div>
                <div class="ui left attached icon button erase" item-id="${id}">
                  <i class="eraser icon"></i>
                </div>
              </div>
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
            <div class="ui fluid action input">
              <input type="text" name="ticker-blue-logo" value="${r.blueLogo ? r.blueLogo : ''}">
              <div class="ui buttons" team="blue">
                <div class="ui right attached icon button browse" item-id="${id}">
                  <i class="folder open icon"></i>
                </div>
                <div class="ui left attached icon button erase" item-id="${id}">
                  <i class="eraser icon"></i>
                </div>
              </div>
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
            <div class="ui fluid action input">
              <input type="text" name="ticker-red-logo" value="${r.redLogo ? r.redLogo : ''}">
              <div class="ui buttons" team="red">
                <div class="ui right attached icon button browse" item-id="${id}">
                  <i class="folder open icon"></i>
                </div>
                <div class="ui left attached icon button erase" item-id="${id}">
                  <i class="eraser icon"></i>
                </div>
              </div>
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
  elem.find('.text-type').hide();
  elem.find('.link').hide();
  elem.find('.image-type').hide();

  if (mode === 'upcoming') {
    elem.find('.teams').show();
    elem.find('.upcoming').show();
    elem.find('input[name="ticker-cat"]').val('Upcoming Matches');
    elem.find('h3').text('Upcoming Match');
  }
  else if (mode === 'recent') {
    elem.find('.teams').show();
    elem.find('.recent').show();
    elem.find('input[name="ticker-cat"]').val('Recent Results');
    elem.find('h3').text('Recent Result');
  }
  else if (mode === 'link') {
    elem.find('.link').show();
    elem.find('.text-type').show();
    elem.find('h3').text('Text with Highlight');
  }
  else if (mode === 'image') {
    elem.find('.image-type').show();
    elem.find('h3').text('Image');
  }
  else if (mode === 'ranking') {
    elem.find('.teams').show();
    elem.find('.recent').show();
    elem.find('h3').text('Ranking (Use Blue Team)');
  }
  else {
    elem.find('.text-type').show();
    elem.find('h3').text('Plain Text');
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

  if (data.category) {
    elem.find('input[name="ticker-cat"]').val(data.category);
  }
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
    link: getTickerInput(elem, 'ticker-link'),
    image: getTickerInput(elem, 'ticker-general-image'),
    logo: getTickerInput(elem, 'ticker-blue-logo'),
    name: getTickerInput(elem, 'ticker-blue-team'),
    rank: parseInt(getTickerInput(elem, 'ticker-blue-score')),
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

  $(document).on('click', '#ticker-items .browse.button', function (event) {
    Util.browseForImage(
      $(this).parent().siblings('input'),
    );
  });

  $(document).on('click', '#ticker-items .erase.button', function (event) {
    $(this).parent().siblings('input').val('');
  });
}

function initWithState(state) {
  appState = state;
  appState.displayTickerData();
  $('#ticker-update').click(() => appState.updateAndBroadcastTicker());
  $('#ticker-import-standings').click(() => appState.setTickerRanking());
}

exports.Init = init;
exports.InitWithState = initWithState;
exports.getItems = getTickerData;
exports.renderItems = renderTickerItems;
exports.getOptions = getTickerOptions;
exports.renderOptions = showTickerOptions;
