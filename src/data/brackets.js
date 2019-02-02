// note that brackets should all have a Final round, which has some special last-case formatting
// for the winner of that round.

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
    },
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

const RO4 = {
  rounds: {
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
    },
  },
  order: [
    'SF1',
    'SF2',
    'Final',
  ],
  name: 'Round of 4',
};

const DE6 = {
  rounds: {
    LBQF1: {
      title: 'Lower Bracket Qualifier 1',
      winnerTo: 'LBQF.1',
      loserTo: null,
    },
    LBQF2: {
      title: 'Lower Bracket Qualifier 2',
      winnerTo: 'LBQF.2',
      loserTo: null,
    },
    LBQF: {
      title: 'Lower Bracket Quarterfinal',
      winnerTo: 'LBSF.2',
      loserTo: null,
    },
    UBSF: {
      title: 'Upper Bracket Semifinal',
      winnerTo: 'Final.1',
      loserTo: 'LBSF.1',
    },
    LBSF: {
      title: 'Lower Bracket Semifinal',
      winnerTo: 'Final.2',
      loserTo: null,
    },
    Final: {
      title: 'Finals',
      winnerTo: null,
      loserTo: null,
    },
  },
  order: [
    'LBQF1',
    'LBQF2',
    'UBSF',
    'LBQF',
    'LBSF',
    'Final',
  ],
  name: 'Double Elim 6 Teams',
}

exports.RO8 = RO8;
exports.RO4 = RO4;
exports.DE6 = DE6;
