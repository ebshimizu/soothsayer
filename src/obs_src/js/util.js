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

// https://stackoverflow.com/questions/6229197/how-to-know-if-two-arrays-have-the-same-values
const containsAll = (arr1, arr2) => arr2.every(arr2Item => arr1.includes(arr2Item));
const sameMembers = (arr1, arr2) => containsAll(arr1, arr2) && containsAll(arr2, arr1);

const mapClassList = 'doom boe dragon blackheart mines shrines garden tomb warhead cursed volskaya sky braxis hanamura alterac';