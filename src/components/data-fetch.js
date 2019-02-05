const Grabbers = require('./data-grabbers/index').Grabbers;

let appState;

function updateInfo(key) {
  if (key in Grabbers) {
    $('#data-grabber-info').html(Grabbers[key].grabber.info());
  }
  else {
    $('#data-grabber-info').html(`
      <div class="content">
        <p>
          Data Grabbers will help automatically populate some of your team and match data from
          the given source. You may need to configure your source once selected.
        </p>
      </div>
    `);
  }
}

function changeDataGrabber(val) {
  if (appState) {
    $('#data-grabber-ui-area').html('');

    if (val in Grabbers) {
      $('#data-grabber-ui-area').html(Grabbers[val].grabber.createUI());
      Grabbers[val].grabber.bind(appState);
    }

    updateInfo(val);

    appState.updateDataSource();
    appState.save();
  }
}

function init() {
  $('#data-grabber-menu').dropdown({
    onChange: changeDataGrabber,
  });

  // add sources to the dropdown
  const vals = [{
    value: 'none',
    name: 'None',
    text: 'None',
  }];

  for (const id in Grabbers) {
    vals.push({
      value: id,
      name: Grabbers[id].name,
      text: Grabbers[id].name,
    });
  }

  $('#data-grabber-menu').dropdown('change values', vals);
}

function initDataFetch(state) {
  appState = state;
  $('#data-grabber-menu').dropdown('set exactly', appState.dataSource.dataGrabber);
}

exports.Init = init;
exports.InitWithState = initDataFetch;
