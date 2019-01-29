// round of 8
const RO8 = {
  rounds: {
    QF1: {
      title: 'Quarterfinal 1',
      winnerTo: 'SF1.1',
      loserTo: null,
    },
    QF2: {
      title: 'Quarterfinal 2',
      winnerTo: 'SF1.2',
      loserTo: null,
    },
    QF3: {
      title: 'Quarterfinal 3',
      winnerTo: 'SF2.1',
      loserTo: null,
    },
    QF4: {
      title: 'Quarterfinal 4',
      winnerTo: 'SF2.2',
      loserTo: null,
    },
    SF1: {
      title: 'Semifinal 1',
      winnerTo: 'Final.1',
      loserTo: null,
    },
    SF2: {
      title: 'Semifinal 2',
      winnerTo: 'Final.2',
      loserTo: null,
    },
    Final: {
      title: 'Finals',
      winnerTo: null,
      loserTo: null,
    }
  },
  order: [
    'QF1',
    'QF2',
    'QF3',
    'QF4',
    'SF1',
    'SF2',
    'Final',
  ],
  name: 'Round of 8',
};

exports.RO8 = RO8;
