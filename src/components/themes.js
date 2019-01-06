const fs = require('fs-extra');
const request = require('request');
const path = require('path');
const data = require('../data/core-file-list');
const extract = require('extract-zip');
const settings = require('electron-settings');
const { dialog, app } = require('electron').remote;

let loadedThemes = {};
let appState;
let globalInit = false;
let stateInit = false;

// this is just the creation, update is a different function
function createOverrideControls() {
  $('#theme-override-list').html('');

  for (const file of data.coreThemeFiles) {
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
    if (Object.prototype.hasOwnProperty.call(loadedThemes, theme)) {
      const t = loadedThemes[theme];
      vals.push({
        value: t.folderName,
        text: `${t.name} v${t.version} by ${t.author}`,
        name: `${t.name} v${t.version} by ${t.author}`,
      });
    }
  }

  $('.theme-override.dropdown').dropdown('change values', vals);

  if (appState) {
    setOverrideMenus(appState.theme);
  }
}

function setOverrideMenus(theme) {
  $('.theme-override.dropdown').dropdown('set exactly', 'no-override');

  for (const page in theme.overrides) {
    $(`.theme-override.dropdown[file-name="${page}"]`).dropdown(
      'set exactly',
      theme.overrides[page],
    );
  }
}

function getOverrides() {
  const elems = $('.theme-override.dropdown');
  const overrides = {};

  for (let i = 0; i < elems.length; i += 1) {
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

function setDownloadThemeMessage(header, content) {
  $('#download-theme-modal .message .header').text(header);
  $('#download-theme-modal .message p').text(content);
}

function endDownloadModal(success) {
  const status = success ? 'positive' : 'negative';
  const icon = success ? 'check' : 'x icon';

  $('#download-theme-modal .message').addClass(status);
  $('#download-theme-modal .message i')
    .removeClass()
    .addClass(icon);
  $('#download-theme-modal .done.button').show();
}

function extractTheme(theme, url) {
  // assumes zip in specified location
  setDownloadThemeMessage('Extracting Theme', `Downloaded theme to ${theme}. Extracting...`);
  const tmpDir = path.join(app.getPath('userData'), 'theme-tmp');

  fs.emptyDir(tmpDir, function (err) {
    if (err) {
      console.log(err);
      setDownloadThemeMessage(
        'Error Extracting Theme',
        `Unable to clean temporary storage location. ${err}.`,
      );
      endDownloadModal(false);
      return;
    }

    extract(theme, { dir: tmpDir }, function (err) {
      if (err) {
        console.log(err);
        setDownloadThemeMessage('Error Extracting Theme', `File might not be a ZIP. ${err}.`);
        endDownloadModal(false);
        return;
      }

      // inspect files
      const expectedThemeFile = path.join(tmpDir, 'theme.json');
      console.log(`Checking manifest ${expectedThemeFile}`);

      if (fs.existsSync(expectedThemeFile)) {
        const themeData = fs.readJsonSync(expectedThemeFile, { throws: false });

        // check for required themes
        if (
          'name' in themeData &&
          'version' in themeData &&
          'author' in themeData &&
          'folderName' in themeData
        ) {
          console.log('Copying folder to theme directory');
          const dest = path.join(appState.theme.themeFolder, themeData.folderName);

          // clear directory for clean install
          console.log(`Emptying ${dest}`);
          fs.emptyDir(dest, function (err) {
            if (err) {
              console.log(err);
              setDownloadThemeMessage(
                'Error Extracting Theme',
                `Unable to empty existing theme folder ${dest}.`,
              );
              endDownloadModal(false);
              return;
            }

            // copy
            fs.copy(tmpDir, dest, {}, function (err) {
              if (err) {
                console.log(err);
                setDownloadThemeMessage(
                  'Error Extracting Theme',
                  'Unable to copy theme to theme folder. Check console for details.',
                );
                endDownloadModal(false);
                return;
              }

              setDownloadThemeMessage(
                `Installed ${themeData.name} v${themeData.version}`,
                `Installed to ${dest}.`,
              );
              endDownloadModal(true);
              scanThemes(appState.theme.themeFolder);

              // cache url somewhere
              let themeCache = settings.get('themeCache');
              if (!themeCache) {
                themeCache = {};
              }
              themeCache[themeData.name] = url;
              settings.set('themeCache', themeCache);
            });
          });
        }
        else {
          setDownloadThemeMessage(
            'Error Extracting Theme',
            `File ${expectedThemeFile} is missing one or more of the required fields: name, version, author, folderName`,
          );
          endDownloadModal(false);
        }
      }
      else {
        setDownloadThemeMessage(
          'Error Extracting Theme',
          'Unable to find theme.json manifest in downloaded archive.',
        );
        endDownloadModal(false);
      }
    });
  });
}

function downloadTheme() {
  const url = $('#theme-download-url').val();
  const fileLoc = path.join(app.getPath('userData'), 'downloaded-theme.zip');

  if (fs.existsSync(fileLoc)) {
    fs.unlinkSync(fileLoc);
  }

  $('#download-theme-modal .message i')
    .removeClass()
    .addClass('notched circle loading icon');
  $('#download-theme-modal .actions').hide();
  $('#download-theme-modal .message').show();
  $('#download-theme-modal .labeled.input').addClass('disabled');
  setDownloadThemeMessage('Downloading Theme', `Downloading from ${url}`);

  request
    .get(url)
    .on('response', function (response) {
      console.log(response);
      setDownloadThemeMessage(
        'Downloading Theme',
        `GET URL ${url} returned status ${response.statusCode} '${response.statusMessage}'`,
      );
    })
    .on('error', function (err) {
      setDownloadThemeMessage('Error Downloading Theme', `${err}`);
      $('#download-theme-modal .message').addClass('negative');
      // display Ok button
    })
    .pipe(fs.createWriteStream(fileLoc))
    .on('finish', function () {
      extractTheme(fileLoc, url);
    });

  return false;
}

function startThemeDownload(presetURL) {
  // show modal
  $('#download-theme-modal .actions').show();
  $('#download-theme-modal .message')
    .removeClass('positive negative')
    .hide();
  $('#download-theme-modal .labeled.input').removeClass('disabled');
  $('#download-theme-modal .done.button').hide();

  if (typeof presetURL === 'string') {
    $('#theme-download-url').val(presetURL);
  }
  else {
    $('#theme-download-url').val('');
  }

  $('#download-theme-modal')
    .modal({
      closable: false,
      onDeny() {
        return true;
      },
      onApprove: downloadTheme,
    })
    .modal('show');
}

function browseThemeFolder() {
  dialog.showOpenDialog(
    {
      title: 'Set Theme Folder',
      properties: ['openDirectory'],
    },
    function (files) {
      if (files) {
        $('#theme-location').val(files[0]);
        appState.updateThemeFolder(files[0]);
        scanThemes(files[0]);
        setOverrideMenus(appState.theme);
      }
    },
  );
}

function getTheme(id) {
  return loadedThemes[id];
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
  $(elem)
    .find(`.${classname} .name`)
    .text(formatName(classname, text));
  $(elem)
    .find(`.${classname}`)
    .removeClass('hidden');

  const href = socialLink(classname, text);
  if (href) {
    $(elem)
      .find(`.${classname}`)
      .attr('href', href);
  }
}

function renderThemeCredits(themeInfo) {
  const ti = $('#theme-info');
  ti.html('');

  if (!themeInfo || !themeInfo.name) {
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
      <div class="download button">
        <div class="ui green circular icon button" data-content="Update from URL">
          <i class="cloud download icon"></i>
        </div>
      </div>
    </div>
  `);

  // if the following fields are present
  if (themeInfo.links) {
    for (const link in themeInfo.links) {
      showSocialLink(ti, link, themeInfo.links[link]);
    }
  }

  // also only show the cloud button if it was originally downloaded from a website
  const themeCache = settings.get('themeCache');

  if (themeCache && themeInfo.name in themeCache) {
    $('#theme-info .download.button .circular.button').popup();
    $('#theme-info .download.button .circular.button').click(function () {
      startThemeDownload(themeCache[themeInfo.name]);
    });
  }
  else {
    $('#theme-info .download.button').hide();
  }
}

function scanThemes(folder) {
  // list things in themes dir. Looking for a 'themes.json' and will check to see if it works.
  // annoyingly configs are different for package and dev
  const themeFolder = folder;

  if (!fs.existsSync(themeFolder)) {
    showMessage(
      `Error: Folder ${themeFolder} does not exist or is not a folder. Cannot load theme list.`,
      'negative',
    );
    return;
  }

  const files = fs.readdirSync(themeFolder);

  loadedThemes = {};
  for (const file of files) {
    if (fs.existsSync(`${themeFolder}/${file}/theme.json`)) {
      // read the file
      const themeData = fs.readJsonSync(`${themeFolder}/${file}/theme.json`, { throws: false });

      // check for required themes
      if (
        'name' in themeData &&
        'version' in themeData &&
        'author' in themeData &&
        'folderName' in themeData
      ) {
        loadedThemes[themeData.name] = themeData;
      }
    }
  }

  // update the dropdown
  const values = { values: [{ value: '', text: 'Default Theme', name: 'Default Theme' }] };
  for (const theme in loadedThemes) {
    const t = loadedThemes[theme];
    values.values.push({
      value: theme,
      text: `${t.name} v${t.version} by ${t.author}`,
      name: `${t.name} v${t.version} by ${t.author}`,
    });
  }

  $('#theme-menu').dropdown('setup menu', values);

  if (appState && appState.theme.data) {
    $('#theme-menu').dropdown('set exactly', appState.theme.data.name);
  }

  updateOverrideMenus();

  showMessage(`Loaded themes from ${folder}`, 'positive');
}

function initThemes() {
  if (globalInit === false) {
    $('#theme-menu').dropdown();
    createOverrideControls();
    $('#theme-location-browse').click(browseThemeFolder);
    $('#download-theme-button').click(startThemeDownload);
    $('#download-theme-modal .done.button').click(() => {
      $('#download-theme-modal').modal('hide');
    });

    globalInit = true;
  }
}

function initWithState(state) {
  if (stateInit === false) {
    scanThemes(state.theme.themeFolder);

    $('.set-theme-button').click(() => {
      state.broadcastThemeChange();
      renderThemeCredits(state.theme.data);
      showMessage('Theme Changed', 'positive');
    });

    if (state.theme.data) {
      $('#theme-menu').dropdown('set exactly', state.theme.data.name);
    }

    $('#theme-override-default').click(resetOverrides);
    $('#theme-location').val(state.theme.themeFolder);
    $('#rescan-themes').click(function () {
      scanThemes(state.theme.themeFolder);
    });

    setOverrideMenus(state.theme);
    $('#set-theme').click();

    appState = state;
    stateInit = true;
  }
}

exports.Init = initThemes;
exports.InitWithState = initWithState;
exports.getTheme = getTheme;
exports.renderThemeCredits = renderThemeCredits;
exports.getOverrides = getOverrides;
