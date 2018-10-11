const fs = require('fs-extra');
const path = require('path');
const { coreThemeFiles } = require('../data/core-file-list');

function createStaticThemes(themes, obsDir) {
  for (let name in themes) {
    let theme = themes[name];

    for (let file of coreThemeFiles) {
      createThemeFile(`${file}.html`, theme.folderName, obsDir);
    }
  }
}

function createThemeFile(target, themeDir, obsDir) {
  console.log(`Creating Static Theme File ${target} for theme ${themeDir}`);

  try {
    // read file
    let page = fs.readFileSync(path.join(obsDir, target)).toString();

    // find the relevant css file.
    let pageJQ = $('<html>').html(page);
    let cssFile = $(page).filter('link[rel="stylesheet"]').attr('href');

    // check if file exists
    if (fs.existsSync(path.join(obsDir, 'themes', themeDir, cssFile))) {
      // modify tag and insert proper var
      pageJQ.find('link[rel="stylesheet"]').attr('href', `themes/${themeDir}/${cssFile}`);
      
      // create the flag
      let script = $('<script>').attr('text', 'text/javascript').text('themeLocked = true;');
      pageJQ.find('head').append(script);

      let out = path.join(obsDir, `${themeDir}-${target}`)
      console.log(`Writing file ${out}`);
      fs.writeFileSync(out, pageJQ.html(), { flags: 'w+' });
    }
  }
  catch (err) {
    console.log(err);
  }
}

exports.createStaticThemes = createStaticThemes;
