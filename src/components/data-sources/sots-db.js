const SotsDB = require('../../stats-of-the-storm/js/database');
const { dialog } = require('electron').remote;
const fs = require('fs-extra');
const summarizeMatchData = require('../../stats-of-the-storm/js/database/summarize-match-data');
const summarizeHeroData = require('../../stats-of-the-storm/js/database/summarize-hero-data');

let activeDB;

function activate() {
  // immediately attempt a load (could have saved database)
  tryLoadDB();
}

function deactivate() {

}

function tryLoadDB() {
  // if dir doesn't exist don't attempt
  let path = $('#sots-db-location').val();

  if (!fs.existsSync(path)) {
    console.log(`${path} does not exist, skipping load`);
    return;
  }

  // some state for indicating things
  $('#sots-db-load').addClass('loading green disabled');
  $('#sots-db-load').text('Loading...');

  if (activeDB) {
    activeDB.close(() => {
      activeDB = null;
      tryLoadDB();
    });
    return;
  }

  activeDB = new SotsDB.HeroesDatabase(path);

  try {
    activeDB.load(() => { }, () => { });
    $('#sots-db-load').removeClass('loading disabled').text('Load OK');
    getCollections();
  }
  catch (err) {
    console.log(err);
    $('#sots-db-load').removeClass('green loading disabled').text('Load Failed');
  }
}

function getCollections() {
  activeDB.getCollections((err, collections) => {
    $('#sots-db-collection .menu .item').remove();

    let sorted = collections.sort(function (a, b) {
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();
      if (x < y) {
        return -1;
      }
      else if (x > y) {
        return 1;
      }
      return 0;
    });

    const values = [{
      value: null,
      text: 'All Matches',
      name: 'All Matches',
    }];

    for (const collection of collections) {
      values.push({
        value: collection._id,
        text: collection.name,
        name: collection.name,
      });
    }

    $('#sots-db-collection').dropdown('change values', values);
  });
}

function setCollection(val) {
  console.log(`set collection to ${val}`);

  if (activeDB) {
    if (val === "null") {
      activeDB.setCollection(null);
    }
    else {
      activeDB.setCollection(val);
    }
  }
}

function browseDB() {
  dialog.showOpenDialog({
    title: 'Locate Stats of the Storm Database',
    properties: ['openDirectory'],
  }, function(files) {
    if (files) {
      // needs relative path from the files. they're all here.
      $('#sots-db-location').val(files[0]);
    }
  });
}

function init() {
  $('#sots-db-collection').dropdown({
    onChange: setCollection
  });
  $('#sots-db-find').click(browseDB);
  $('#sots-db-load').click(tryLoadDB);
}

function heroDraft(hero, cb) {
  activeDB.getMatches({}, function(err, docs) {
    activeDB.getHeroData({ hero }, function(err, heroDocs) {
      const draftData = summarizeMatchData(docs, window.heroesTalents);
      const heroStats = summarizeHeroData(heroDocs);

      // check that data exists 
      const draft = draftData.data[hero];
      const numbers = heroStats.averages[hero];

      if (!draft || !numbers) {
        cb({ error: `No Hero Data Available for ${hero}` });
        return;
      }

      cb({
        pick: draft.games,
        pickPct: draft.games / draftData.data.totalMatches,
        ban: draft.bans.total,
        banPct: draft.bans.total / draftData.data.totalMatches,
        win: draft.wins,
        winPct: draft.wins / draft.games,
        K: numbers.SoloKill,
        TD: numbers.Takedowns,
        A: numbers.Assists,
        D: numbers.Deaths,
        KDA: heroStats.heroes[hero].stats.totalKDA,
      });
    });
  });
}

exports.init = init;
exports.activate = activate;
exports.deactivate = deactivate;
exports.heroDraft = heroDraft;