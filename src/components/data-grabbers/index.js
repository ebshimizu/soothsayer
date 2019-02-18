// data grabber sources should be added to this file
const heroesLounge = require('./heroes-lounge');
const ngs = require('./ngs');

exports.Grabbers = {
  heroesLounge: {
    name: 'Heroes Lounge',
    grabber: heroesLounge,
  },
  ngs: {
    name: 'Nexus Gaming Series',
    grabber: ngs,
  },
};
