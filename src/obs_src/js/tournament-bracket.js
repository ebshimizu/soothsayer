const socket = io('http://localhost:3005/');

function bracketItem(item) {
  const elem = $(`
    <div class="bracket-item">
      <div class="team one">
        <div class="name"></div>
        <div class="logo"></div>
        <div class="score"></div>
      </div>
      <div class="team two">
        <div class="name"></div>
        <div class="logo"></div>
        <div class="score"></div>
      </div>
    </div>
  `);

  elem.attr('id', item.id);
  elem.find('.team.one .name').text(item.team1);
  
  if (item.team1 !== '') {
    elem.find('.team.one .score').text(isNaN(item.team1Score) ? '' : item.team1Score);
    setCSSImage(elem.find('.team.one .logo'), (item.team1Logo && item.team1Logo !== '') ? item.team1Logo : './images/default-logo.png');
  }

  elem.find('.team.two .name').text(item.team2);
  if (item.team2 !== '') {
    elem.find('.team.two .score').text(isNaN(item.team2Score) ? '' : item.team2Score);
    setCSSImage(elem.find('.team.two .logo'), (item.team2Logo && item.team2Logo !== '') ? item.team2Logo : './images/default-logo.png');
  }

  if (item.winner === 1) {
    elem.find('.team.one').addClass('winner');
  }
  else if (item.winner === 2) {
    elem.find('.team.two').addClass('winner');
  }

  return elem;
}

class TournamentBracket {
  constructor() {
    this.name = 'Tournament Bracket';
  }

  ID() {
    return {
      name: this.name,
    };
  }

  // changes up the state n stuff
  updateState(state) {
    $('#tournament-name').text(state.casters.tournament);
    $('#tournament-bracket').attr('format', state.tournament.bracket.format);

    this.bracket = state.tournament.bracket;

    $('#bracket-items').html('');
    for (const r in this.bracket.rounds) {
      $('#bracket-items').append(bracketItem(this.bracket.rounds[r]));
    }

    // final
    if ('Final' in this.bracket.rounds) {
      const final = this.bracket.rounds.Final;
      
      if (final.winner === 1) {
        $('#bracket-winner .name').text(final.team1);
        setCSSImage($('#bracket-winner .logo'), (final.team1Logo && final.team1Logo !== '') ? final.team1Logo : './images/default-logo.png');
      }
      else if (final.winner === 2) {
        $('#bracket-winner .name').text(final.team2);
        setCSSImage($('#bracket-winner .logo'), (final.team2Logo && final.team2Logo !== '') ? final.team2Logo : './images/default-logo.png');
      }
      else {
        $('#bracket-winner .name').text('');
        setCSSImage($('#bracket-winner .logo'), '');
      }
    }
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const tournament = new TournamentBracket();

  socket.on('requestID', () => {
    socket.emit('reportID', tournament.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => {
    tournament.updateState.call(tournament, state);
  });
  socket.on('changeTheme', (themeDir) => {
    changeTheme(themeDir, 'tournament-bracket.css');
  });
});
