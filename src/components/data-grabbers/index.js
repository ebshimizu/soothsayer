// data grabber sources should be added to this file
const heroesLounge = require('./heroes-lounge');

exports.Grabbers = {
  heroesLounge: {
    name: 'Heroes Lounge',
    grabber: heroesLounge,
  },
};
