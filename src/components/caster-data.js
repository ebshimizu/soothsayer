function updateCasterCount(val) {
  $('.caster-1').hide();
  $('.caster-2').hide();

  for (let i = 1; i <= parseInt(val); i++) {
    $(`.caster-${i}`).show();
  }
}

function initCasters() {
  // couple caster-specific things (didn't need their own file yet)
  $('#caster-1-size').dropdown();
  $('#caster-2-size').dropdown();
  $('#caster-count').dropdown({
    onChange: updateCasterCount,
  });
  $('#caster-count').dropdown('set exactly', 2);
}

exports.Init = initCasters;