const fs = require('fs-extra');
const themeWriter = require('./theme-writer');
const path = require('path');
const data = require('../data/core-file-list');

let loadedThemes = {};
let globalInit = false;
let stateInit = false;

// this is just the creation, update is a different function
function createOverrideControls() {
  $('#theme-override-list').html('');

  for (let file of data.coreThemeFiles) {
    $('#theme-override-list').append(`
      <div class="five wide column">
        <div class="text-flex-container right">
          <div class="text-flex">
            ${file}.html
          </div>
        </div>
      </div>
      <div class="eleven wide column">
        <div class="ui fluid selection dropdown theme-override" file-name="${file}.html">
          <i class="dropdown icon"></i>
          <div class="text"></div>
          <div class="menu">

          </div>
        </div>
      </div>
    `);
  }

  $('.theme-override.dropdown').dropdown();
}

function updateOverrideMenus() {
  // construct options list
  const vals = [
    { value: 'no-override', text: '[No Override]', name: '[No Override]' },
    { value: 'default', text: 'Default Theme', name: 'Default Theme' },
  ];

  for (const theme in loadedThemes) {
    const t = loadedThemes[theme];
    vals.push({ value: t.folderName, text: `${t.name} v${t.version} by ${t.author}`, name: `${t.name} v${t.version} by ${t.author}` });
  }

  $('.theme-override.dropdown').dropdown('change values', vals);
}

function setOverrideMenus(theme) {
  $('.theme-override.dropdown').dropdown('set exactly', 'no-override');

  for (let page in theme.overrides) {
    $(`.theme-override.dropdown[file-name="${page}"]`).dropdown('set exactly', theme.overrides[page]);
  }
}

function getOverrides() {
  const elems = $('.theme-override.dropdown');
  const overrides = {};

  for (let i = 0; i < elems.length; i++) {
    const val = $(elems[i]).dropdown('get value');
    const file = $(elems[i]).attr('file-name');
    
    if (val !== 'no-override') {
      overrides[file] = val;
    }
  }

  return overrides;
}

function resetOverrides() {
  $('.theme-override.dropdown').dropdown('set exactly', 'no-override');
}

function initThemes() {
  if (globalInit === false) {
    $('#theme-menu').dropdown();
    createOverrideControls();
    scanThemes();

    $('#rescan-themes').click(scanThemes);

    globalInit = true;
  }
}

function initWithState(state) {
  if (stateInit === false) {
    $('.set-theme-button').click(() => {
      state.broadcastThemeChange();
      renderThemeCredits(state.theme);
      showMessage('Theme Changed', 'positive');
    });
    $('#theme-menu').dropdown('set exactly', state.theme.name);
    $('#make-themes').click(() => writeStaticThemes(state.rootOBS));
    $('#theme-override-default').click(resetOverrides);
    setOverrideMenus(state.theme);
    $('#set-theme').click();

    stateInit = true;
  }
}

function getTheme(id) {
  return loadedThemes[id];
}

function renderThemeCredits(themeInfo) {
  const ti = $('#theme-info');
  ti.html('');

  if (!themeInfo.name) {
    return;
  }

  ti.append(`
    <div class="ui message">
      <div class="header">
        ${themeInfo.name} by ${themeInfo.author}
      </div>
      <h3 class="ui sub header">${themeInfo.version}</h3>
      <div class="content">
        <p>${themeInfo.description ? themeInfo.description : 'No Description Provided'}</p>
        <div class="ui labels">
          <a class="ui hidden twitter blue label"><i class="twitter icon"></i><span class="name"></span></a>
          <a class="ui hidden twitch violet label"><i class="twitch icon"></i><span class="name"></span></a>
          <div class="ui hidden discord purple label"><i class="discord icon"></i><span class="name"></span></div>
          <a class="ui hidden telegram blue label"><i class="telegram icon"></i><span class="name"></span></a>
          <a class="ui hidden github basic violet label"><i class="github icon"></i><span class="name"></span></a>
          <a class="ui hidden kofi label"><span class="name"></span><div class="detail">Ko-Fi</div></a>
        </div>
      </div>
    </div>
  `);

  // if the following fields are present
  if (themeInfo.links) {
    for (let link in themeInfo.links) {
      showSocialLink(ti, link, themeInfo.links[link]);
    }
  }
}

function formatName(classname, text) {
  if (classname === 'twitter' || classname === 'telegram') {
    return `@${text}`;
  }

  return text;
}

function socialLink(classname, text) {
  if (classname === 'twitter') {
    return `http://twitter.com/${text}`;
  }
  if (classname === 'kofi') {
    return `http://ko-fi.com/${text}`;
  }
  if (classname === 'twitch') {
    return `http://twitch.tv/${text}`;
  }
  if (classname === 'github') {
    return `http://github.com/${text}`;
  }
  if (classname === 'telegram') {
    return `http://t.me/${text}`;
  }

  return null;
}

function showSocialLink(elem, classname, text) {
  $(elem).find(`.${classname} .name`).text(formatName(classname, text));
  $(elem).find(`.${classname}`).removeClass('hidden');

  let href = socialLink(classname, text);
  if (href) {
    $(elem).find(`.${classname}`).attr('href', href);
  }
}

function writeStaticThemes(obsDir) {
  themeWriter.createStaticThemes(loadedThemes, obsDir);
}

function scanThemes() {
  // list things in themes dir. Looking for a 'themes.json' and will check to see if it works.
  // annoyingly configs are different for package and dev
  let themeFolder = path.join(__dirname, '../obs_src/themes');

  if (!fs.existsSync(themeFolder)) {
    themeFolder = `${process.resourcesPath}/app/${themeFolder}`;
  }

  let files = fs.readdirSync(themeFolder);

  loadedThemes = {};
  for (let file of files) {
    if (fs.existsSync(`${themeFolder}/${file}/theme.json`)) {
      // read the file
      let themeData = fs.readJsonSync(`${themeFolder}/${file}/theme.json`, { throws: false });

      // check for required themes
      if ('name' in themeData && 'version' in themeData && 'author' in themeData && 'folderName' in themeData) {
        loadedThemes[themeData.name] = themeData;
      }
    }
  }

  // update the dropdown
  let values = { values: [{ value: '', text: 'Default Theme', name: 'Default Theme' }] };
  for (let theme in loadedThemes) {
    let t = loadedThemes[theme];
    values.values.push({ value: theme, text: `${t.name} v${t.version} by ${t.author}`, name: `${t.name} v${t.version} by ${t.author}` });
  }

  $('#theme-menu').dropdown('setup menu', values);

  if (appState)
    $('#theme-menu').dropdown('set exactly', appState.theme.name);

  updateOverrideMenus();
}

exports.Init = initThemes;
exports.InitWithState = initWithState;
exports.getTheme = getTheme;
exports.renderThemeCredits = renderThemeCredits;
exports.getOverrides = getOverrides;