const fetch = require('node-fetch');
const settings = require('electron-settings');

let collection = settings.get('remoteSotsCollectionId');

function getURL(path) {
  return $('#remote-sots-url').val() + path;
}

function setCollection(val, text) {
  showMessage(
    `Remote Stats of the Storm tournament set to ${text}`,
    'positive',
  );

  collection = val;
  settings.set('remoteSotsCollectionId');
}

async function getCollections() {
  const req = await fetch(getURL('collections'));
  const collections = await req.json();

  $('#remote-sots-tournaments').dropdown('change values', collections);
}

function init() {
  $('#remote-sots-tournaments').dropdown({
    onChange: setCollection,
  });
  $('#remote-sots-load').click(getCollections);
}

async function heroDraft(hero, cb, wildcard) {
  if (!collection) {
    cb({ error: 'Select an active tournament first' });
    return;
  }

  try {
    const req = await fetch(getURL('heroDraft'), {
      method: 'POST',
      body: JSON.stringify({
        hero,
        wildcard,
        collection,
      }),
    });
    const data = await req.json();

    cb(data);
  }
  catch (e) {
    cb({ error: `Failed to load hero data for ${hero}. ${e}.` });
  }
}

async function playerStatsForHero(player, hero, cb, wildcard) {
  if (!collection) {
    cb({ error: 'Select an active tournament first' });
    return;
  }
  try {
    const req = await fetch(getURL('playerStatsForHero'), {
      method: 'POST',
      body: JSON.stringify({
        player,
        hero,
        wildcard,
        collection,
      }),
    });
    const data = await req.json();

    cb(data);
  }
  catch (e) {
    cb({ error: `Failed to load data for ${player} ${hero}. ${e}.` });
  }
}

async function playerStats(player, cb, wildcard) {
  if (!collection) {
    cb({ error: 'Select an active tournament first' });
    return;
  }
  try {
    const req = await fetch(getURL('playerStats'), {
      method: 'POST',
      body: JSON.stringify({
        player,
        wildcard,
        collection,
      }),
    });
    const data = await req.json();

    cb(data);
  }
  catch (e) {
    cb({ error: `Failed to load player stats for ${player}. ${e}.` });
  }
}

async function allPlayerStats(player, cb) {
  if (!collection) {
    cb({ error: 'Select an active tournament first' });
    return;
  }
  try {
    const req = await fetch(getURL('allPlayerStats'), {
      method: 'POST',
      body: JSON.stringify({
        player,
        collection,
      }),
    });
    const data = await req.json();

    cb(data);
  }
  catch (e) {
    cb({ error: `Failed to load stats for ${player}. Error: ${e}.` });
  }
}

exports.init = init;
exports.activate = () => {};
exports.deactivate = () => {};
exports.heroDraft = heroDraft;
exports.playerStatsForHero = playerStatsForHero;
exports.playerStats = playerStats;
exports.allPlayerStats = allPlayerStats;
