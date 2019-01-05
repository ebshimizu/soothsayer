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
  },
  firstLtEz: {
    name: 'First Lower Third: Run Ez Mode',
    id: 'first-lt-ez',
    key: 'firstLtEz',
    default: 'CommandOrControl+K',
  },
  firstLtViz: {
    name: 'First Lower Third: Toggle Visibility',
    id: 'first-lt-viz',
    key: 'firstLtViz',
    default: 'CommandOrControl+Alt+Up',
  },
  firstLtLoad: {
    name: 'First Lower Third: Load',
    id: 'first-lt-load',
    key: 'firstLtLoad',
    default: 'CommandOrControl+M',
  },
  firstLtLoadGo: {
    name: 'First Lower Third: Load and Run',
    id: 'first-lt-loadR',
    key: 'firstLtLoadR',
    default: 'CommandOrControl+Shift+M',
  },
  firstLtGo: {
    name: 'First Lower Third: Run',
    id: 'first-ltl-run',
    key: 'firstLtRun',
    default: 'CommandOrControl+Alt+Right',
  },
  firstLtStop: {
    name: 'First Lower Third: Stop',
    id: 'first-lt-stop',
    key: 'firstLtStop',
    default: 'CommandOrControl+Alt+Left',
  },
};

function defaultKeybinds() {
  const ret = {};
  for (let k in KeybindInfo) {
    ret[k] = KeybindInfo[k].default;
  }

  return ret;
}

function createKeybindInputs() {
  $('#keybind-inputs').html('');

  let elem = '';
  for (let k in KeybindInfo) {
    elem += `
      <div class="seven wide column">
        <div class="text-flex-container right">
          <div class="text-flex">${KeybindInfo[k].name}</div>
        </div>
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
    else {
      $(`#${KeybindInfo[k].id}`).val(KeybindInfo[k].default);
    }
  }
}

function runLTKey(index, buttonClass, actionName) {
  const lts = $('.lower-third-controls');
  if (lts.length === 0) {
    showMessage(`No Lower Thirds Connected. Hotkey action ${actionName} did not run`, 'warning');
    return;
  }

  const lt = $(lts[index]);
  lt.find(`.${buttonClass}`).click();
  showMessage(`Lower Third: ${actionName} triggered. Id: ${lt.attr('socket-id')}`, 'positive');
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
    showMessage(`Error setting keybind ${accel} for ID ${id}`, 'error');
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
  tryBind(state.keybinds.decRedScore, KeybindInfo.decRedScore.id, () => {
    $('#team-red-score').val(parseInt($('#team-red-score').val()) - 1);
  });
  tryBind(state.keybinds.firstLtEz, KeybindInfo.firstLtEz.id, () => {
    runLTKey(0, 'lt-ez', 'Easy Mode');
  });
  tryBind(state.keybinds.firstLtGo, KeybindInfo.firstLtGo.id, () => {
    runLTKey(0, 'lt-run', 'Run');
  });
  tryBind(state.keybinds.firstLtLoad, KeybindInfo.firstLtLoad.id, () => {
    runLTKey(0, 'lt-load', 'Load Data');
  });
  tryBind(state.keybinds.firstLtLoadGo, KeybindInfo.firstLtLoadGo.id, () => {
    runLTKey(0, 'lt-loadrun', 'Load and Run');
  });
  tryBind(state.keybinds.firstLtStop, KeybindInfo.firstLtStop.id, () => {
    runLTKey(0, 'lt-end', 'Stop');
  });
  tryBind(state.keybinds.firstLtViz, KeybindInfo.firstLtViz.id, () => {
    runLTKey(0, 'lt-vis', 'Toggle Visibility');
  });

  showMessage('Keybinds saved', 'positive');
  //console.log(state.keybinds);
}

exports.displayKeybinds = displayKeybinds;
exports.updateKeybinds = updateKeybinds;
exports.setKeybinds = setKeybinds;
exports.createKeybindInputs = createKeybindInputs;
exports.default = defaultKeybinds;