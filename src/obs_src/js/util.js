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

const mapClassList = 'doom boe dragon blackheart mines shrines garden tomb warhead cursed volskaya sky braxis hanamura alterac';