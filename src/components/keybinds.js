const { globalShortcut } = require('electron').remote

const KeybindInfo = {
  update: {
    name: 'Update',
    id: 'keybind-update',
    key: 'update',
    default: 'Shift+Enter',
  },
  displayPopup: {
    name: 'Display Team Name Popups',
    id: 'keybind-display-popup',
    key: 'displayPopups',
    default: 'CommandOrControl+Shift+G',
  },
  incBlueScore: {
    name: 'Blue Score +1',
    id: 'keybind-inc-blue',
    key: 'incBlueScore',
    default: 'Shift+CommandOrControl+Up',
  },
  decBlueScore: {
    name: 'Blue Score -1',
    id: 'keybind-dec-blue',
    key: 'decBlueScore',
    default: 'Shift+CommandOrControl+Down',
  },
  incRedScore: {
    name: 'Red Score +1',
    id: 'keybind-inc-red',
    key: 'incRedScore',
    default: 'Shift+Alt+Up',
  },
  decRedScore: {
    name: 'Red Score -1',
    id: 'keybind-dec-red',
    key: 'decRedScore',
    default: 'Shift+Alt+Down',
  }
}

function defaultKeybinds() {
  const ret = {};
  for (let k in KeybindInfo) {
    ret[k] = KeybindInfo[k].default;
  }

  return ret;
}

function createKeybindInputs() {
  $('#keybind-inputs').html();

  let elem = '';
  for (let k in KeybindInfo) {
    elem += `
      <div class="seven wide column">
        <p>${KeybindInfo[k].name}</p>
      </div>
      <div class="eight wide column">
        <div class="ui fluid input">
          <input type="text" id="${KeybindInfo[k].id}">
        </div>
      </div>
      <div class="one wide column">
        <div class="ui icon button" key-id="${k}">
          <i class="undo icon"></i>
        </div>
      </div>
    `
  };

  $('#keybind-inputs').append(elem);
  $('#keybind-inputs .icon.button').click(function () {
    let k = $(this).attr('key-id');
    $(`#${KeybindInfo[k].id}`).val(KeybindInfo[k].default);
  });
}

function displayKeybinds(state) {
  for (let k in KeybindInfo) {
    if (k in state.keybinds) {
      $(`#${KeybindInfo[k].id}`).val(state.keybinds[k]);
    }
  }
}

// gets the new keybinds from the interface, updtes state,
// then sets the new keybinds
function updateKeybinds(state) {
  for (let k in KeybindInfo) {
    state.keybinds[k] = $(`#${KeybindInfo[k].id}`).val();
  }

  setKeybinds(state);
}

function tryBind(accel, id, func) {
  try {
    globalShortcut.register(accel, func);
  }
  catch (err) {
    console.log(err);
    $(`#${id}`).parent('.input').addClass('error');
  }
}

// iterate through everything and update the keybinds
function setKeybinds(state) {
  globalShortcut.unregisterAll();
  $('#keybind-inputs .input').removeClass('error');

  tryBind(state.keybinds.update, KeybindInfo.update.id, () => {
    $('#update-button').click();
  });
  tryBind(state.keybinds.displayPopup, KeybindInfo.displayPopup.id, () => {
    $('#player-popup-show').click();
  });
  tryBind(state.keybinds.incBlueScore, KeybindInfo.incBlueScore.id, () => {
    $('#team-blue-score').val(parseInt($('#team-blue-score').val()) + 1);
  });
  tryBind(state.keybinds.decBlueScore, KeybindInfo.decBlueScore.id, () => {
    $('#team-blue-score').val(parseInt($('#team-blue-score').val()) - 1);
  });
  tryBind(state.keybinds.incRedScore, KeybindInfo.incRedScore.id, () => {
    $('#team-red-score').val(parseInt($('#team-red-score').val()) + 1);
  });
  tryBind(state.keybinds.decRedScore, KeybindInfo.decRedScore, () => {
    $('#team-red-score').val(parseInt($('#team-red-score').val()) - 1);
  });

  console.log('Keybinds updated');
  console.log(state.keybinds);
}

exports.displayKeybinds = displayKeybinds;
exports.updateKeybinds = updateKeybinds;
exports.setKeybinds = setKeybinds;
exports.createKeybindInputs = createKeybindInputs;
exports.default = defaultKeybinds;