// manual override
let themeLocked = false;

function setCSSImage(elem, url) {
  let path = url.replace(/\\/g, '/');

  // if the url is null or '' set to full transparent (remove attr that is)
  if (url === null) {
    $(elem).css('background-image', '');
  }
  else {
    $(elem).css('background-image', `url("${path}")`);
  }
}

// injects a css file right into the dom
function changeTheme(theme, target) {
  if (themeLocked === true) {
    console.log('No change. Theme is Locked.');
    return;
  }

  // default reset
  if (!theme.data || theme.data.folderName === 'default') {
    $('link#theme-css').remove();
    console.log('Theme Change: default');
    return;
  }

  // check for overrides
  let themeDir = theme.data.folderName;
  const page = window.location.pathname.split('/').pop();

  if (theme.overrides && (page in theme.overrides)) {
    themeDir = theme.overrides[page];
  }

  console.log(`Theme Change: ${themeDir}`);


  // if not exists, create
  if (!$('link#theme-css').length) {
    $('head').append(`<link rel="stylesheet" type="text/css" id="theme-css" href="" />`);
  }

  $('link#theme-css').attr('href', `${theme.themeRel}/${themeDir}/css/${target}`);
}

// https://stackoverflow.com/questions/6229197/how-to-know-if-two-arrays-have-the-same-values
const containsAll = (arr1, arr2) => arr2.every(arr2Item => arr1.includes(arr2Item));
const sameMembers = (arr1, arr2) => containsAll(arr1, arr2) && containsAll(arr2, arr1);

const mapClassList = 'doom boe dragon blackheart mines shrines garden tomb warhead cursed volskaya sky braxis hanamura alterac';
