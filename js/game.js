/* ═══════════════════════════════════════════════════
   VICTOR COIN — 🎲 Victor Game Hub
   Coordinates Trivia · Tic-Tac-Toe AI · Emoji Flip
   Open: 7:00 AM – 11:00 PM daily
═══════════════════════════════════════════════════ */

var GAME_OPEN_HOUR  = 7;
var GAME_CLOSE_HOUR = 23;

/* Active game presence — written to Firestore so others can see */
var _activeGame      = null;
var _activeGameStart = null;

function gameIsOpen() {
  var h = new Date().getHours();
  return h >= GAME_OPEN_HOUR && h < GAME_CLOSE_HOUR;
}

function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* Write active game presence to Firestore */
function setActiveGame(key) {
  _activeGame      = key;
  _activeGameStart = key ? Date.now() : null;
  if (typeof fbReady !== 'function') return;
  fbReady(function() {
    var docId = typeof _myDocId === 'function' ? _myDocId() : playerDocId(G.email);
    if (!docId || !_db) return;
    _db.collection('players').doc(docId).update({
      currentGame:      key || null,
      currentGameStart: key ? firebase.firestore.FieldValue.serverTimestamp() : null
    }).catch(function(){});
  });
}

function clearActiveGame() { setActiveGame(null); }

/* ── Render the hub ── */
function renderGameHub() {
  var el = document.getElementById('pg-gamehub');
  if (!el) return;
  var name = (G && G.name) ? G.name : 'Player';

  if (!gameIsOpen()) {
    el.innerHTML = '<div class="ghub-wrap">'
      + '<div class="ghub-closed">'
      + '<div class="ghub-closed-ico">🎲</div>'
      + '<div class="ghub-closed-title">Victor Game</div>'
      + '<div class="ghub-closed-msg">Sorry, <strong>' + name + '</strong>!<br/>'
      + 'We are closed right now.<br/>Come back between <strong>7:00 AM</strong> and <strong>11:00 PM</strong>.</div>'
      + '<div class="ghub-closed-time" id="ghubCountdown"></div>'
      + '</div></div>';
    _startGhubCountdown();
    return;
  }

  el.innerHTML = '<div class="ghub-wrap">'
    + '<div class="ghub-header">'
    + '<div class="ghub-title">🎲 Victor Game</div>'
    + '<div class="ghub-greet">' + getGreeting() + ', <span class="ghub-name">' + name + '</span>!<br/>'
    + '<span class="ghub-sub">Which game would you like to play?</span></div>'
    + '</div>'
    + '<div class="ghub-cards">'
    + _ghubCard('trivia',    '🤔', 'Trivia',        '60 questions — Easy, Medium & Hard.')
    + _ghubCard('tictactoe', '🧩', 'Tic-Tac-Toe AI','Take on the AI: Easy, Hard or Impossible.')
    + _ghubCard('emojiflip', '🃏', 'Emoji Flip',    'Remember which card hides the emoji!')
    + '</div>'
    + '</div>';
}

function _ghubCard(key, ico, title, desc) {
  return '<div class="ghub-card" onclick="launchGame(\'' + key + '\')">'
    + '<div class="ghub-card-ico">' + ico + '</div>'
    + '<div class="ghub-card-info">'
    + '<div class="ghub-card-title">' + title + '</div>'
    + '<div class="ghub-card-desc">' + desc + '</div>'
    + '</div>'
    + '<div class="ghub-card-arrow">▶</div>'
    + '</div>';
}

function launchGame(key) {
  if (!gameIsOpen()) { renderGameHub(); return; }
  setActiveGame(key);
  var el = document.getElementById('pg-gamehub');
  if (!el) return;
  el.innerHTML = '';
  if (key === 'trivia')    { if (typeof renderTrivia    === 'function') renderTrivia(el);    }
  if (key === 'tictactoe') { if (typeof renderTictactoe === 'function') renderTictactoe(el); }
  if (key === 'emojiflip') { if (typeof renderEmojiFlip === 'function') renderEmojiFlip(el); }
}

function backToHub() {
  clearActiveGame();
  renderGameHub();
}

/* Shared UI helpers used by all three games */
function gameBackBtn() {
  return '<button class="game-back-btn" onclick="backToHub()">← Games</button>';
}

function _startGhubCountdown() {
  function tick() {
    var el = document.getElementById('ghubCountdown');
    if (!el) return;
    if (gameIsOpen()) { renderGameHub(); return; }
    var now  = new Date();
    var open = new Date();
    open.setHours(GAME_OPEN_HOUR, 0, 0, 0);
    if (now >= open) open.setDate(open.getDate() + 1);
    var diff = Math.max(0, open - now);
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    el.textContent = 'Opens in ' + h + 'h ' + _gp2(m) + 'm ' + _gp2(s) + 's';
    setTimeout(tick, 1000);
  }
  tick();
}

function _gp2(n) { return n < 10 ? '0' + n : '' + n; }

/* Shared shuffle used by trivia + emojiflip */
function gameShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
