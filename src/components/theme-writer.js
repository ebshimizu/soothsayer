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

    // regex replacements
    let cssRx = /href="(css\/[\w-]+\.css)"/;
    let cssFile = page.match(cssRx)[1];

    // check if file exists
    if (fs.existsSync(path.join(obsDir, 'themes', themeDir, cssFile))) {
      // modify tag and insert proper var
      let cssTags = page.match(/(<link.+ \/>)/g);
      let newCSSTag = cssTags[cssTags.length - 1];
      newCSSTag = newCSSTag.replace(cssRx, `href="themes/${themeDir}/${cssFile}"`);
      
      // create the flag
      let script = '<script text="text/javascript">themeLocked = true</script>';
      page = page.replace('</head>', `\t${newCSSTag}\n\t\t${script}\n\t</head>`);

      let out = path.join(obsDir, `${themeDir}-${target}`)
      console.log(`Writing file ${out}`);
      fs.writeFileSync(out, page, { flags: 'w+' });
    }
  }
  catch (err) {
    console.log(err);
  }
}

exports.createStaticThemes = createStaticThemes;
