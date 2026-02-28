/* ═══════════════════════════════════════════════════
   VICTOR COIN — 🃏 Emoji Flip
   3 cards shown briefly, then flipped face-down.
   Player picks which card had the target emoji.
   Highscore + Streak tracked in localStorage.
═══════════════════════════════════════════════════ */

var _ef = {
  emojis:   ['🌟','🔥','💎','🎯','🎲','🌈','⚡','🦋','🍀','🎭'],
  cards:    [],        // array of emojis for current round
  target:   '',        // emoji player must find
  targetIdx: -1,       // which card index holds it
  revealed: false,     // true while cards are face-up
  locked:   false,     // true after player picks
  streak:   0,
  hs:       0,
  round:    0
};

function renderEmojiFlip(el) {
  _ef.hs     = parseInt(localStorage.getItem('vc_ef_hs') || '0');
  _ef.streak = 0;
  _ef.round  = 0;

  el.innerHTML = '<div class="game-wrap">'
    + gameBackBtn()
    + '<div class="game-title">🃏 Emoji Flip</div>'
    + '<div class="ef-stats-row">'
    + '<span class="ef-stat">Streak: <b id="efStreak">0</b></span>'
    + '<span class="ef-stat">Best: <b id="efHS">' + _ef.hs + '</b></span>'
    + '<span class="ef-stat">Round: <b id="efRound">0</b></span>'
    + '</div>'
    + '<div class="ef-prompt" id="efPrompt">Get ready…</div>'
    + '<div class="ef-cards" id="efCards"></div>'
    + '<div class="ef-feedback" id="efFeedback"></div>'
    + '</div>';

  setTimeout(efNewRound, 400);
}

function efNewRound() {
  _ef.locked   = false;
  _ef.revealed = true;
  _ef.round++;

  /* Pick 3 distinct emojis for this round */
  var pool  = gameShuffle(_ef.emojis.slice()).slice(0, 3);
  _ef.cards = pool;

  /* Pick a random one as the target */
  _ef.targetIdx = Math.floor(Math.random() * 3);
  _ef.target    = _ef.cards[_ef.targetIdx];

  /* Update UI */
  var prompt = document.getElementById('efPrompt');
  var round  = document.getElementById('efRound');
  if (prompt) prompt.textContent = 'Remember the cards!';
  if (round)  round.textContent  = _ef.round;

  efRender(true);  // show face-up

  /* Flip after 2 seconds */
  setTimeout(function() {
    _ef.revealed = false;
    efRender(false);
    var p = document.getElementById('efPrompt');
    if (p) p.innerHTML = 'Which card had <span class="ef-target">' + _ef.target + '</span> ?';
  }, 2000);
}

function efRender(faceUp) {
  var el = document.getElementById('efCards');
  if (!el) return;
  el.innerHTML = _ef.cards.map(function(emoji, i) {
    var content = faceUp ? emoji : '❓';
    var cls     = 'ef-card' + (faceUp ? ' ef-face-up' : '');
    return '<div class="' + cls + '" onclick="efPick(' + i + ')">' + content + '</div>';
  }).join('');
}

function efPick(i) {
  if (_ef.locked || _ef.revealed) return;
  _ef.locked = true;

  var fb    = document.getElementById('efFeedback');
  var cards = document.getElementById('efCards');
  var right = (i === _ef.targetIdx);

  /* Reveal all cards */
  if (cards) {
    cards.innerHTML = _ef.cards.map(function(emoji, idx) {
      var cls = 'ef-card ef-face-up';
      if (idx === _ef.targetIdx) cls += ' ef-card-correct';
      if (idx === i && !right)   cls += ' ef-card-wrong';
      return '<div class="' + cls + '">' + emoji + '</div>';
    }).join('');
  }

  if (right) {
    _ef.streak++;
    if (_ef.streak > _ef.hs) {
      _ef.hs = _ef.streak;
      localStorage.setItem('vc_ef_hs', _ef.hs);
    }
    var s  = document.getElementById('efStreak');
    var hs = document.getElementById('efHS');
    if (s)  s.textContent  = _ef.streak;
    if (hs) hs.textContent = _ef.hs;

    if (fb) fb.innerHTML = '<span class="ef-correct">✅ Correct!</span>';
    setTimeout(function() {
      if (fb) fb.innerHTML = '';
      efNewRound();
    }, 1000);
  } else {
    _ef.streak = 0;
    var s2 = document.getElementById('efStreak');
    if (s2) s2.textContent = 0;
    if (fb) fb.innerHTML = '<span class="ef-wrong">❌ Wrong! It was ' + _ef.target + '</span>'
      + '<br/><button class="game-retry-btn" onclick="efRestart()">🔄 Try Again</button>';
  }
}

function efRestart() {
  _ef.streak = 0;
  _ef.round  = 0;
  var fb = document.getElementById('efFeedback');
  if (fb) fb.innerHTML = '';
  efNewRound();
}

