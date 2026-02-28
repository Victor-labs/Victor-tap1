/* ═══════════════════════════════════════════════════
   VICTOR COIN — 🎤 Karaoke
   Lyric-based trivia with 12s timer
   Rounds 1-5 | Bag 500VK at R2, 1000VK at R5
   50/50 boost (one use per game)
   3-hour lockout on loss before banking
═══════════════════════════════════════════════════ */

var KAR_QUESTIONS = [
  /* Round 1 — Easy classics */
  {
    lyric: '"Is this the real life? Is this just _____?"',
    a: 'Fantasy', o: ['Fantasy', 'A Dream', 'A Story'], artist: 'Queen – Bohemian Rhapsody'
  },
  {
    lyric: '"I kissed a girl and I liked _____, the taste of her cherry chapstick"',
    a: 'It', o: ['It', 'That', 'This'], artist: 'Katy Perry – I Kissed a Girl'
  },
  {
    lyric: '"We will, we will _____ you!"',
    a: 'Rock', o: ['Rock', 'Fight', 'Shake'], artist: 'Queen – We Will Rock You'
  },
  {
    lyric: '"Baby shark, doo doo doo, _____ shark"',
    a: 'Mommy', o: ['Mommy', 'Daddy', 'Baby'], artist: 'Pinkfong – Baby Shark'
  },
  {
    lyric: '"Hello, is it _____ you\'re looking for?"',
    a: 'Me', o: ['Me', 'You', 'Us'], artist: 'Lionel Richie – Hello'
  },
  /* Round 2 */
  {
    lyric: '"Don\'t stop _____, hold on to the feeling"',
    a: 'Believin\'', o: ['Believin\'', 'Moving', 'Dreaming'], artist: 'Journey – Don\'t Stop Believin\''
  },
  {
    lyric: '"She\'s got a _____, and she knows how to use it"',
    a: 'Ticket', o: ['Ticket', 'Heart', 'Smile'], artist: 'ABBA – Super Trouper'
  },
  {
    lyric: '"I will always love _____"',
    a: 'You', o: ['You', 'Him', 'Her'], artist: 'Whitney Houston – I Will Always Love You'
  },
  {
    lyric: '"Hit me baby one more _____"',
    a: 'Time', o: ['Time', 'Night', 'Day'], artist: 'Britney Spears – ...Baby One More Time'
  },
  {
    lyric: '"Shake it off, shake it _____"',
    a: 'Off', o: ['Off', 'Out', 'Away'], artist: 'Taylor Swift – Shake It Off'
  },
  /* Round 3 */
  {
    lyric: '"I\'m gonna make a change, for once in my _____"',
    a: 'Life', o: ['Life', 'World', 'Mind'], artist: 'Michael Jackson – Man in the Mirror'
  },
  {
    lyric: '"Rolling in the _____, your secrets and lies"',
    a: 'Deep', o: ['Deep', 'Dark', 'Mud'], artist: 'Adele – Rolling in the Deep'
  },
  {
    lyric: '"It\'s gonna be _____, this I promise you"',
    a: 'Me', o: ['Me', 'Fine', 'Great'], artist: '*NSYNC – Bye Bye Bye'
  },
  {
    lyric: '"I see a little silhouetto of a _____"',
    a: 'Man', o: ['Man', 'Ghost', 'Shadow'], artist: 'Queen – Bohemian Rhapsody'
  },
  {
    lyric: '"Just a small town girl, living in a lonely _____"',
    a: 'World', o: ['World', 'Town', 'Place'], artist: 'Journey – Don\'t Stop Believin\''
  },
  /* Round 4 */
  {
    lyric: '"We found love in a hopeless _____"',
    a: 'Place', o: ['Place', 'World', 'Time'], artist: 'Rihanna – We Found Love'
  },
  {
    lyric: '"I\'ve got a feeling, that tonight\'s gonna be a _____ night"',
    a: 'Good', o: ['Good', 'Great', 'Wild'], artist: 'Black Eyed Peas – I Gotta Feeling'
  },
  {
    lyric: '"Someone like you, I hate to turn up out of the blue _____ invited"',
    a: 'Uninvited', o: ['Uninvited', 'Unwanted', 'Unexpected'], artist: 'Adele – Someone Like You'
  },
  {
    lyric: '"Every breath you take, every move you _____, I\'ll be watching you"',
    a: 'Make', o: ['Make', 'Take', 'Fake'], artist: 'The Police – Every Breath You Take'
  },
  {
    lyric: '"I want it that way, tell me why, ain\'t nothin\' but a _____"',
    a: 'Heartache', o: ['Heartache', 'Mistake', 'Heartbreak'], artist: 'Backstreet Boys – I Want It That Way'
  },
  /* Round 5 — Hard */
  {
    lyric: '"Cause baby you\'re a _____, come on let it show"',
    a: 'Firework', o: ['Firework', 'Star', 'Diamond'], artist: 'Katy Perry – Firework'
  },
  {
    lyric: '"Never gonna give you up, never gonna let you _____"',
    a: 'Down', o: ['Down', 'Go', 'Fall'], artist: 'Rick Astley – Never Gonna Give You Up'
  },
  {
    lyric: '"I came in like a _____ ball"',
    a: 'Wrecking', o: ['Wrecking', 'Cannon', 'Basket'], artist: 'Miley Cyrus – Wrecking Ball'
  },
  {
    lyric: '"Uptown funk you up, uptown funk you _____, Saturday night"',
    a: 'Up', o: ['Up', 'Down', 'Out'], artist: 'Bruno Mars – Uptown Funk'
  },
  {
    lyric: '"All the single ladies, all the single ladies, now put your _____ up"',
    a: 'Hands', o: ['Hands', 'Arms', 'Rings'], artist: 'Beyoncé – Single Ladies'
  }
];

/* Which questions go in each round (0-indexed into KAR_QUESTIONS) */
var KAR_ROUNDS = [
  [0, 1, 2, 3, 4],       // R1 — no prize
  [5, 6, 7, 8, 9],       // R2 — 500 VK banked
  [10, 11, 12, 13, 14],  // R3 — no prize
  [15, 16, 17, 18, 19],  // R4 — no prize
  [20, 21, 22, 23, 24]   // R5 — 1000 VK banked
];

var KAR_BANK = { 2: 500, 5: 1000 };  // round → VK reward
var KAR_LOCK_MS = 3 * 60 * 60 * 1000;

var _kar = {
  round: 1,         // 1–5
  qIdx: 0,          // index within current round's question list
  banked: 0,        // VK banked so far
  fiftyUsed: false,
  timer: null,
  timeLeft: 12,
  answered: false,
  over: false
};

function renderKaraoke(el) {
  // Check lockout
  var lockAt = parseInt(localStorage.getItem('kar_lockAt') || '0');
  if (lockAt > 0) {
    var rem = (lockAt + KAR_LOCK_MS) - Date.now();
    if (rem > 0) { karShowLocked(el, rem); return; }
    localStorage.removeItem('kar_lockAt');
  }

  _kar.round     = 1;
  _kar.qIdx      = 0;
  _kar.banked    = 0;
  _kar.fiftyUsed = false;
  _kar.over      = false;

  el.innerHTML = '<div class="game-wrap" id="karWrap">'
    + gameBackBtn()
    + '<div class="game-title">🎤 Karaoke</div>'
    + '<div id="karBody"></div>'
    + '</div>';

  karShowQ();
}

function karShowQ() {
  var el = document.getElementById('karBody');
  if (!el) return;
  if (_kar.timer) { clearInterval(_kar.timer); _kar.timer = null; }

  var roundQs = KAR_ROUNDS[_kar.round - 1];
  if (_kar.qIdx >= roundQs.length) {
    karRoundComplete();
    return;
  }

  var q = KAR_QUESTIONS[roundQs[_kar.qIdx]];
  _kar.answered  = false;
  _kar.timeLeft  = 12;
  _kar._curQ     = q;

  el.innerHTML = karHUD()
    + '<div class="kar-progress">Question ' + (_kar.qIdx + 1) + '/' + roundQs.length + '</div>'
    + '<div class="kar-timer-row">'
    + '<div class="kar-tbar"><div class="kar-tfill" id="karFill" style="width:100%"></div></div>'
    + '<span class="kar-tlbl" id="karTime">12</span>'
    + '</div>'
    + '<div class="kar-lyric" id="karLyric">🎵 ' + q.lyric + '</div>'
    + '<div class="kar-artist">' + q.artist + '</div>'
    + '<div class="kar-opts" id="karOpts">' + karBuildOpts(q.o, q.a) + '</div>'
    + '<div class="kar-boost-row">'
    + '<button class="kar-fifty-btn' + (_kar.fiftyUsed ? ' kar-fifty-used' : '') + '" '
    + (_kar.fiftyUsed ? 'disabled' : 'onclick="karFiftyFifty()"') + '>'
    + '50/50 ' + (_kar.fiftyUsed ? '✓ Used' : '⚡') + '</button>'
    + '</div>'
    + '<div class="kar-feedback" id="karFB"></div>';

  karStartTimer(q.a);
}

function karHUD() {
  return '<div class="kar-hud">'
    + '<span>Round <b>' + _kar.round + '/5</b></span>'
    + '<span>Banked <b style="color:var(--gold)">' + (_kar.banked ? _kar.banked.toLocaleString() + ' VK' : '—') + '</b></span>'
    + '</span></div>';
}

function karBuildOpts(opts, correct) {
  return opts.map(function(o) {
    return '<button class="kar-opt" onclick="karAnswer(this,\''
      + _karEsc(o) + '\',\'' + _karEsc(correct) + '\')">' + o + '</button>';
  }).join('');
}

function karStartTimer(correct) {
  _kar.timer = setInterval(function() {
    _kar.timeLeft--;
    var f = document.getElementById('karFill');
    var l = document.getElementById('karTime');
    if (f) f.style.width = ((_kar.timeLeft / 12) * 100) + '%';
    if (l) l.textContent = _kar.timeLeft;
    if (_kar.timeLeft <= 3 && f) f.style.background = '#FF453A';
    if (_kar.timeLeft <= 0) {
      clearInterval(_kar.timer); _kar.timer = null;
      if (!_kar.answered) karTimeUp(correct);
    }
  }, 1000);
}

function karAnswer(btn, chosen, correct) {
  if (_kar.answered) return;
  _kar.answered = true;
  if (_kar.timer) { clearInterval(_kar.timer); _kar.timer = null; }

  document.querySelectorAll('.kar-opt').forEach(function(b) {
    b.disabled = true;
    if (b.textContent.trim() === correct) b.classList.add('kar-opt-right');
    if (b === btn && chosen !== correct)  b.classList.add('kar-opt-wrong');
  });

  var fb = document.getElementById('karFB');

  if (chosen === correct) {
    if (fb) fb.innerHTML = '<span class="kar-correct">🎵 Correct!</span>';
    _kar.qIdx++;
    setTimeout(karShowQ, 1100);
  } else {
    if (fb) fb.innerHTML = '<span class="kar-wrong">❌ Wrong! Answer: <strong>' + correct + '</strong></span>';
    setTimeout(function() { karEliminate(); }, 1400);
  }
}

function karTimeUp(correct) {
  _kar.answered = true;
  document.querySelectorAll('.kar-opt').forEach(function(b) {
    b.disabled = true;
    if (b.textContent.trim() === correct) b.classList.add('kar-opt-right');
  });
  var fb = document.getElementById('karFB');
  if (fb) fb.innerHTML = '<span class="kar-wrong">⏰ Time\'s up! Answer: <strong>' + correct + '</strong></span>';
  setTimeout(function() { karEliminate(); }, 1400);
}

function karRoundComplete() {
  var el = document.getElementById('karBody');
  if (!el) return;

  var prize = KAR_BANK[_kar.round] || 0;
  if (prize) { _kar.banked = prize; }

  if (_kar.round >= 5) {
    // Final round won — collect all
    karCollect(_kar.banked);
    return;
  }

  var nextRound = _kar.round + 1;
  var msg = prize
    ? '<div class="kar-bank-msg">💰 You\'ve bagged <strong>' + prize.toLocaleString() + ' VK</strong>!<br/>Quit now or risk it all?</div>'
      + '<div class="kar-bank-btns">'
      + '<button class="kar-quit-btn" onclick="karCollect(' + prize + ')">💰 Collect ' + prize.toLocaleString() + ' VK</button>'
      + '<button class="kar-continue-btn" onclick="karNextRound()">🎤 Continue →</button>'
      + '</div>'
    : '<div class="kar-round-clear">✅ Round ' + _kar.round + ' complete!</div>'
      + '<button class="game-retry-btn" onclick="karNextRound()">▶ Round ' + nextRound + '</button>';

  el.innerHTML = '<div class="kar-round-end">'
    + '<div class="kar-re-ico">🎤</div>'
    + '<div class="kar-re-title">Round ' + _kar.round + ' Complete!</div>'
    + msg
    + '</div>';
}

function karNextRound() {
  _kar.round++;
  _kar.qIdx = 0;
  karShowQ();
}

function karCollect(amount) {
  if (amount > 0) {
    G.vk += amount;
    sv();
    if (typeof renderAll === 'function') renderAll();
    if (typeof toast === 'function') toast('🎤 +' + amount.toLocaleString() + ' VK collected!', '#FFD60A');
  }
  localStorage.removeItem('kar_lockAt');
  var el = document.getElementById('karBody');
  if (!el) return;
  el.innerHTML = '<div class="game-end">'
    + '<div class="game-end-ico">🏆</div>'
    + '<div class="game-end-title">Well played!</div>'
    + '<div class="game-end-row">You collected: <b style="color:var(--gold)">' + (amount||0).toLocaleString() + ' VK</b></div>'
    + '<button class="game-retry-btn" onclick="renderKaraoke(document.getElementById(\'pg-gamehub\'))">🎤 Play Again</button>'
    + '</div>';
}

function karEliminate() {
  if (_kar.timer) { clearInterval(_kar.timer); _kar.timer = null; }
  _kar.over = true;

  var el = document.getElementById('karBody');
  if (!el) return;

  if (_kar.banked > 0) {
    // Already banked — they lose banked too (they chose to continue)
    _kar.banked = 0;
  }

  // Lock only if they haven't banked anything
  localStorage.setItem('kar_lockAt', Date.now().toString());

  el.innerHTML = '<div class="game-end">'
    + '<div class="game-end-ico">💔</div>'
    + '<div class="game-end-title">Wrong answer!</div>'
    + '<div class="game-end-row" style="color:var(--red)">You lost everything. Come back in 3 hours.</div>'
    + '<div class="kar-lock-cd" id="karLockCd"></div>'
    + '</div>';

  karTickLock();
}

function karShowLocked(el, remaining) {
  el.innerHTML = '<div class="game-wrap">'
    + gameBackBtn()
    + '<div class="game-title">🎤 Karaoke</div>'
    + '<div class="game-end">'
    + '<div class="game-end-ico">🔒</div>'
    + '<div class="game-end-title">You\'re locked out</div>'
    + '<div class="kar-lock-cd" id="karLockCd"></div>'
    + '</div></div>';
  karTickLock();
}

function karTickLock() {
  function tick() {
    var lockAt = parseInt(localStorage.getItem('kar_lockAt') || '0');
    var rem    = (lockAt + KAR_LOCK_MS) - Date.now();
    var el     = document.getElementById('karLockCd');
    if (!el) return;
    if (rem <= 0) {
      el.innerHTML = '<button class="game-retry-btn" onclick="renderKaraoke(document.getElementById(\'pg-gamehub\'))">🎤 Try Again</button>';
      return;
    }
    var h = Math.floor(rem / 3600000);
    var m = Math.floor((rem % 3600000) / 60000);
    var s = Math.floor((rem % 60000) / 1000);
    el.textContent = 'Try again in ' + h + ':' + _kp(m) + ':' + _kp(s);
    setTimeout(tick, 1000);
  }
  tick();
}

function karFiftyFifty() {
  if (_kar.fiftyUsed || _kar.answered) return;
  _kar.fiftyUsed = true;

  var q    = _kar._curQ;
  var wrong = q.o.filter(function(o) { return o !== q.a; });
  // Remove one random wrong option — keep correct + one wrong
  var keepWrong = wrong[Math.floor(Math.random() * wrong.length)];
  var twoOpts   = [q.a, keepWrong].sort(function() { return Math.random() - 0.5; });

  var el = document.getElementById('karOpts');
  if (el) el.innerHTML = karBuildOpts(twoOpts, q.a);

  // Disable the 50/50 button
  var btn = document.querySelector('.kar-fifty-btn');
  if (btn) { btn.disabled = true; btn.textContent = '50/50 ✓ Used'; btn.classList.add('kar-fifty-used'); }
}

function _karEsc(s) { return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function _kp(n)     { return n < 10 ? '0' + n : '' + n; }
    
