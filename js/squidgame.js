/* ═══════════════════════════════════════════════════
   VICTOR COIN — 🖲 Squid Game
   5 coffins, find the hidden item, 2 tries per round
   3-hour retry timer after elimination
═══════════════════════════════════════════════════ */
var SQ_MAX_TRIES = 2;
var SQ_RETRY_MS  = 3 * 60 * 60 * 1000; // 3 hours

var SQ_ITEMS = ['💎','🪙','🌟','🎯','🔥','💎','🪙','🌟']; // cycles per round

var _sq = {
  round:0, streak:0, tries:0, correct:-1,
  disabled:[], over:false, retryTimer:null
};

function renderSquidGame(el) {
  el.innerHTML = '<div class="sq-wrap" id="sqWrap">'
    + '<div class="sq-bg-anim"></div>'
    + '<div id="sqContent"></div>'
    + '</div>';

  // Achievement: played squid game
  if (typeof checkAch==='function' && !G.playedSquid) {
    G.playedSquid = true; sv(); checkAch();
  }

  // 1s loading screen
  document.getElementById('sqContent').innerHTML = '<div class="sq-loading">'
    + '<div class="sq-load-ico">🖲</div>'
    + '<div class="sq-load-txt">Loading Game…</div>'
    + '</div>';

  setTimeout(function(){
    sqLoad();
  }, 1000);
}

function sqLoad() {
  // Load saved state
  _sq.round  = parseInt(localStorage.getItem('sq_round')  || '1');
  _sq.streak = parseInt(localStorage.getItem('sq_streak') || '0');
  var sqWins = parseInt(localStorage.getItem('sq_wins')   || '0');

  // Check retry timer
  var elimAt = parseInt(localStorage.getItem('sq_elimAt') || '0');
  if (elimAt > 0) {
    var remaining = (elimAt + SQ_RETRY_MS) - Date.now();
    if (remaining > 0) {
      sqShowRetryTimer(remaining);
      return;
    } else {
      localStorage.removeItem('sq_elimAt');
    }
  }

  sqStartRound();
}

function sqStartRound() {
  _sq.tries    = 0;
  _sq.disabled = [];
  _sq.over     = false;
  _sq.correct  = Math.floor(Math.random() * 5);
  var itemIdx  = (_sq.round - 1) % SQ_ITEMS.length;
  var item     = SQ_ITEMS[itemIdx];

  var el = document.getElementById('sqContent');
  if (!el) return;

  el.innerHTML = '<div class="sq-hud">'
    + '<span class="sq-hud-item">ROUND <b id="sqRound">' + _sq.round + '</b></span>'
    + '<span class="sq-hud-div">•</span>'
    + '<span class="sq-hud-item">STREAK <b id="sqStreak">' + _sq.streak + '</b></span>'
    + '</div>'
    + '<div class="sq-card">'
    + '<div class="sq-card-glow"></div>'
    + '<div class="sq-find-txt">Find the <span class="sq-item-lbl">' + item + '</span></div>'
    + '<div class="sq-tries-txt">Tries left: <span id="sqTries">' + SQ_MAX_TRIES + '</span></div>'
    + '<div class="sq-coffins" id="sqCoffins"></div>'
    + '<div class="sq-feedback" id="sqFB"></div>'
    + '</div>';

  sqRenderCoffins(item);
}

function sqRenderCoffins(item) {
  var el = document.getElementById('sqCoffins');
  if (!el) return;
  el.innerHTML = '';
  for (var i = 0; i < 5; i++) {
    var btn = document.createElement('button');
    btn.className = 'sq-coffin';
    btn.innerHTML = '⚰️';
    btn.setAttribute('data-idx', i);
    if (_sq.disabled.indexOf(i) >= 0) {
      btn.disabled = true;
      btn.innerHTML = '❌';
      btn.classList.add('sq-coffin-x');
    } else {
      (function(idx, itm) {
        btn.addEventListener('click', function(){ sqHandleChoice(idx, itm); }, {once:true});
      })(i, item);
    }
    el.appendChild(btn);
  }
}

function sqHandleChoice(idx, item) {
  if (_sq.over || _sq.disabled.indexOf(idx) >= 0) return;

  if (idx === _sq.correct) {
    // WIN
    _sq.over = true;
    sqParticleBurst();
    var sqWins = parseInt(localStorage.getItem('sq_wins') || '0') + 1;
    localStorage.setItem('sq_wins', sqWins);

    // Update all coffins — reveal item in correct one
    var coffins = document.querySelectorAll('.sq-coffin');
    coffins.forEach(function(btn, i) {
      btn.disabled = true;
      if (i === idx) { btn.innerHTML = item; btn.classList.add('sq-coffin-win'); }
    });

    // Achievement hooks
    if (sqWins >= 5 && typeof checkAch==='function') {
      if (!G.squidWin5) { G.squidWin5 = true; sv(); checkAch(); }
    }
    _sq.streak++;
    localStorage.setItem('sq_streak', _sq.streak);
    var el = document.getElementById('sqStreak');
    if (el) el.textContent = _sq.streak;

    setTimeout(sqNextRound, 1400);
  } else {
    // WRONG
    _sq.tries++;
    _sq.disabled.push(idx);

    var btn = document.querySelectorAll('.sq-coffin')[idx];
    if (btn) { btn.disabled = true; btn.innerHTML = '❌'; btn.classList.add('sq-coffin-x'); btn.classList.add('sq-shake'); }

    var triesEl = document.getElementById('sqTries');
    if (triesEl) triesEl.textContent = SQ_MAX_TRIES - _sq.tries;

    if (_sq.tries >= SQ_MAX_TRIES) {
      sqEliminate(item);
    } else {
      sqRenderCoffins(item);
    }
  }
}

function sqEliminate(item) {
  _sq.over = true;
  _sq.streak = 0;
  localStorage.setItem('sq_streak', '0');
  localStorage.setItem('sq_round', '1');
  localStorage.setItem('sq_elimAt', Date.now().toString());

  // Flash red
  var wrap = document.getElementById('sqWrap');
  if (wrap) { wrap.classList.add('sq-flash'); setTimeout(function(){ wrap.classList.remove('sq-flash'); }, 600); }

  // Show correct coffin
  var coffins = document.querySelectorAll('.sq-coffin');
  coffins.forEach(function(btn, i) {
    btn.disabled = true;
    if (i === _sq.correct) { btn.innerHTML = item; btn.classList.add('sq-coffin-win'); }
  });

  setTimeout(function(){
    var el = document.getElementById('sqContent');
    if (!el) return;
    el.innerHTML = '<div class="sq-elim">'
      + '<div class="sq-knife-anim">🔪</div>'
      + '<div class="sq-elim-title">You have been eliminated</div>'
      + '<div class="sq-elim-sub">The ' + item + ' was hidden in coffin ' + (_sq.correct+1) + '</div>'
      + '<div class="sq-retry-msg">Come back in <b id="sqRetryCountdown">3:00:00</b></div>'
      + '<button class="sq-retry-btn" id="sqRetryBtn" disabled>🔒 Locked</button>'
      + '</div>';
    sqStartRetryTimer();
  }, 900);
}

function sqNextRound() {
  _sq.round++;
  localStorage.setItem('sq_round', _sq.round);
  var el = document.getElementById('sqContent');
  if (!el) return;
  el.innerHTML = '<div class="sq-round-transition">'
    + '<div class="sq-rt-txt">Round ' + _sq.round + '</div>'
    + '<div class="sq-rt-sub">Get ready…</div>'
    + '</div>';
  setTimeout(sqStartRound, 1200);
}

function sqStartRetryTimer() {
  var elimAt = parseInt(localStorage.getItem('sq_elimAt') || '0');
  function tick() {
    var remaining = (elimAt + SQ_RETRY_MS) - Date.now();
    var el = document.getElementById('sqRetryCountdown');
    var btn = document.getElementById('sqRetryBtn');
    if (remaining <= 0) {
      if (el)  el.textContent = '0:00:00';
      if (btn) { btn.disabled = false; btn.textContent = '▶ Try Again'; btn.onclick = sqRetry; }
      return;
    }
    var h = Math.floor(remaining / 3600000);
    var m = Math.floor((remaining % 3600000) / 60000);
    var s = Math.floor((remaining % 60000) / 1000);
    if (el) el.textContent = h + ':' + _sqP(m) + ':' + _sqP(s);
    setTimeout(tick, 1000);
  }
  tick();
}

function sqShowRetryTimer(remaining) {
  var el = document.getElementById('sqContent');
  if (!el) return;
  el.innerHTML = '<div class="sq-elim">'
    + '<div class="sq-knife-anim">🔪</div>'
    + '<div class="sq-elim-title">You were eliminated</div>'
    + '<div class="sq-retry-msg">Come back in <b id="sqRetryCountdown"></b></div>'
    + '<button class="sq-retry-btn" id="sqRetryBtn" disabled>🔒 Locked</button>'
    + '</div>';
  sqStartRetryTimer();
}

function sqRetry() {
  localStorage.removeItem('sq_elimAt');
  localStorage.setItem('sq_round', '1');
  localStorage.setItem('sq_streak', '0');
  _sq.round = 1; _sq.streak = 0;
  sqStartRound();
}

function sqParticleBurst() {
  var wrap = document.getElementById('sqWrap');
  if (!wrap) return;
  for (var i = 0; i < 18; i++) {
    (function(i) {
      var p = document.createElement('div');
      p.className = 'sq-particle';
      p.style.left = (30 + Math.random()*40) + '%';
      p.style.top  = (30 + Math.random()*40) + '%';
      p.style.animationDelay = (i*50) + 'ms';
      p.style.background = ['#FF2D55','#FFD60A','#30D158','#5AC8FA','#BF5AF2'][i%5];
      wrap.appendChild(p);
      setTimeout(function(){ p.remove(); }, 1200);
    })(i);
  }
}

function _sqP(n) { return n < 10 ? '0'+n : ''+n; }
          
