/* ════════════════════════════════════════════════════════════════════
   VICTOR COIN — Firebase Integration v3
   Firebase JS SDK (compat/CDN build — no bundler needed)
   Compatible with GitHub Pages and any static host.

   CORE GUARANTEES
   ─────────────────────────────────────────────────────────────────
   1. Every authenticated user automatically gets a Firestore player
      document on first login. Returning users are refreshed each
      session without overwriting any existing data.

   2. Doc ID resolution priority:
        a) sanitised email  → playerDocId(G.email)
        b) Firebase UID     → "uid_" + _fbUid
      The same logic is used everywhere so IDs never drift.

   3. ALL writes use { merge: true } — partial fields never wipe
      existing sub-fields or sub-collections.

   4. fbSave() is debounced 2 s so rapid game actions (taps, etc.)
      don't flood Firestore with writes.

   5. Every Firestore call is wrapped in fbReady() so calls made
      before the SDK loads are queued and replayed automatically.

   6. Every G.* read is null-safe — missing fields default to a
      sensible value rather than throwing.
════════════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────────
   FIREBASE APP CONFIG
───────────────────────────────────────────────────────────────── */
var FB_CFG = {
  apiKey:            'AIzaSyAuXUjRzILIZTazgg8pFbr_9qn4Tnuiz84',
  authDomain:        'victor-b0773.firebaseapp.com',
  projectId:         'victor-b0773',
  storageBucket:     'victor-b0773.firebasestorage.app',
  messagingSenderId: '813564661719',
  appId:             '1:813564661719:web:11c07067ad3e483204c592'
};


/* ─────────────────────────────────────────────────────────────────
   MODULE-LEVEL STATE
───────────────────────────────────────────────────────────────── */
var _fbApp    = null;   // Firebase app instance
var _db       = null;   // Firestore instance
var _auth     = null;   // Firebase Auth instance
var _fbReady  = false;  // true once auth + Firestore are live
var _fbUid    = null;   // Firebase UID of the current session
var _fbQueue  = [];     // Queued callbacks waiting for Firebase


/* ─────────────────────────────────────────────────────────────────
   READY GATE
   Any code that touches Firestore must be wrapped in fbReady().
   If Firebase isn't initialised yet the callback is queued and
   replayed as soon as it becomes ready.
───────────────────────────────────────────────────────────────── */
function fbReady(fn) {
  if (_fbReady) { fn(); }
  else          { _fbQueue.push(fn); }
}

function _fbFlushQueue() {
  _fbQueue.forEach(function(fn) {
    try { fn(); } catch(e) { console.warn('[FB] queued fn threw:', e); }
  });
  _fbQueue = [];
}


/* ═════════════════════════════════════════════════════════════════
   INIT FIREBASE
   Call once from main.js / initGame().
   Safe to call again — idempotent via firebase.apps check.
════════════════════════════════════════════════════════════════ */
function initFirebase() {
  try {
    /* If the SDK scripts haven't loaded yet, retry in 1 s */
    if (typeof firebase === 'undefined') {
      console.warn('[FB] SDK not loaded — retrying in 1 s');
      setTimeout(initFirebase, 1000);
      return;
    }

    /* Initialise app (idempotent) */
    _fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(FB_CFG);
    _db    = firebase.firestore();
    _auth  = firebase.auth();

    /* ── Auth state listener ──────────────────────────────────────
       onAuthStateChanged fires:
         • immediately if a session already exists (returning user)
         • again after signInAnonymously() resolves (new user)
       This is the single place that sets _fbReady and flushes the
       callback queue.
    ────────────────────────────────────────────────────────────── */
    _auth.onAuthStateChanged(function(user) {
      if (!user) return; /* signed-out event — nothing to do */

      _fbUid   = user.uid;
      _fbReady = true;
      _fbFlushQueue();
      console.log('[FB] Ready. uid =', _fbUid);

      /*
       * Guarantee the player document exists in Firestore.
       * We must NOT call _ensurePlayerDoc until G exists and has
       * real data — a fixed timeout is unreliable because ld()
       * (which restores G from localStorage) may finish faster or
       * slower depending on device speed.
       *
       * _waitForGThenEnsure() polls every 500 ms until G is ready,
       * then calls _ensurePlayerDoc() exactly once.
       */
      _waitForGThenEnsure();
    });

    /* Sign in anonymously if no session exists yet */
    if (!_auth.currentUser) {
      _auth.signInAnonymously().catch(function(e) {
        /*
         * Anonymous auth may be disabled in the Firebase console.
         * Degrade gracefully — the game still works locally,
         * social/cloud features won't sync.
         */
        console.warn('[FB] signInAnonymously failed:', e.message,
                     '— running without Firebase persistence.');
        _fbReady = true;
        _fbFlushQueue();
      });
    }

    /* Presence hooks */
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) { fbSetOffline(); } else { fbSetOnline(); }
    });
    window.addEventListener('beforeunload', fbSetOffline);

    console.log('[FB] Initialised.');
  } catch(e) {
    console.error('[FB] initFirebase error:', e);
  }
}


/* ═════════════════════════════════════════════════════════════════
   DOC ID HELPERS
════════════════════════════════════════════════════════════════ */

/**
 * Convert an email address to a valid Firestore document ID.
 * Firestore prohibits: . # $ [ ] in doc IDs.
 * Returns '' if email is empty/null.
 */
function playerDocId(email) {
  // Sanitise email into a valid Firestore doc ID.
  // Firestore forbids: . # $ [ ] / in document IDs.
  // Returns '' if email is falsy — caller must handle this case.
  var e = (email || '').trim().toLowerCase();
  if (!e) return '';
  return e.replace(/[.#$[\]\/@]/g, '_');
}

/**
 * Resolve the current user's doc ID.
 * Priority: email → Firebase UID fallback.
 * Never returns '' as long as the user is authenticated.
 */
function _myDocId() {
  // For anonymous users: always use 'uid_<firebaseUID>' as the doc ID.
  // This matches the isOwner() rule which checks 'uid_' + request.auth.uid.
  // For email users: prefer the sanitised email doc ID (kept for backwards
  // compatibility with documents already created under email-based IDs).
  if (_fbUid && (!G || !G.email || G.email.indexOf('@') === -1)) {
    return 'uid_' + _fbUid;
  }
  var byEmail = playerDocId(G && G.email ? G.email : '');
  if (byEmail) return byEmail;
  if (_fbUid)  return 'uid_' + _fbUid;
  return '';
}


/* ═════════════════════════════════════════════════════════════════
   UTILITY HELPERS
════════════════════════════════════════════════════════════════ */

/** Most-visited exploration location, or 'Unexplored'. */
function getMostVisitedLoc() {
  if (!G || !G.ex || !G.ex.locVisits) return 'Unexplored';
  var locs   = ['Vic Tomb','Vic Docks','Vic Haven','Vic Citadel','Vic Abyss'];
  var visits = G.ex.locVisits;
  var maxIdx = 0;
  for (var i = 1; i < visits.length; i++) {
    if ((visits[i] || 0) > (visits[maxIdx] || 0)) maxIdx = i;
  }
  return (visits[maxIdx] || 0) > 0 ? locs[maxIdx] : 'Unexplored';
}

/** Count unlocked achievements. */
function countAch() {
  if (!G || !G.ach) return 0;
  return G.ach.filter(function(a) { return !!a; }).length;
}

/** Resolve the player's current rank label. */
function _rankName() {
  if (typeof RK === 'undefined' || !G) return '🌱 Newbie';
  for (var i = RK.length - 1; i >= 0; i--) {
    if ((G.vk || 0) >= RK[i].q) return RK[i].n;
  }
  return '🌱 Newbie';
}


/* ═════════════════════════════════════════════════════════════════
   BUILD PLAYER DATA
   ─────────────────────────────────────────────────────────────
   Returns a plain object containing every field Firestore should
   store. All G.* accesses are null-safe with sensible defaults.
   This is the single source of truth for the document shape.
════════════════════════════════════════════════════════════════ */
function buildPlayerData() {
  if (!G) return {};                         /* G not loaded yet */

  /* Resolve the canonical email stored in the document itself.
     If the user has no email we store the UID string so the doc
     is still queryable by something unique.                     */
  var canonicalEmail = (G.email || '').trim()
                    || (_fbUid ? 'uid_' + _fbUid : '');

  return {
    /* ── Identity ────────────────────────────────────────────── */
    name:       ((G.name || '').trim()) || 'Player',
    email:      canonicalEmail,
    nameLower:  ((G.name || '').trim() || 'player').toLowerCase(),
    uid:        _fbUid || null,
    anonymous:  !!(G.settings && G.settings.anonymous),

    /* ── Economy ─────────────────────────────────────────────── */
    vk:         G.vk  || 0,
    diamonds:   G.dia || 0,

    /* ── Progress ────────────────────────────────────────────── */
    rank:       _rankName(),
    achCount:   countAch(),
    homesBuilt: (G.build && Array.isArray(G.build.homes))
                  ? G.build.homes.length : 0,
    location:   getMostVisitedLoc(),

    /* ── Profile ─────────────────────────────────────────────── */
    profilePic: G.profilePic || '',
    bio:        G.bio        || '',
    bioChanges: G.bioChanges || 0,
    joinedAt:   G.joinedAt   || Date.now(),
    status:     G.status     || 'online',
    online:     true,

    /* ── Social ──────────────────────────────────────────────── */
    giftCount:  G.giftCount || 0,
    badges:     Array.isArray(G.badges) ? G.badges : [],
    likes:      G.likes     || 0,

    /* ── Game systems ────────────────────────────────────────── */
    server:    (G.server && G.server.id) ? G.server.id : null,
    vault:      G.vault     || { items: [], active: {} },
    cosmetics:  G.cosmetics || {},

    /* ── Game presence ──────────────────────────────────────────── */
    currentGame:      (typeof _activeGame !== 'undefined' ? _activeGame : null),
    currentGameStart: null,

    /* ── Timestamps (written server-side) ────────────────────── */
    lastSeen:   firebase.firestore.FieldValue.serverTimestamp()
  };
}


/* ═════════════════════════════════════════════════════════════════
   _ensurePlayerDoc
   ─────────────────────────────────────────────────────────────
   Called automatically 2.5 s after every successful auth event.

   FLOW:
     1. Resolve doc ID (email or UID).
     2. GET the document.
        a. EXISTS  → cloud economy/social wins, push fresh stats.
        b. MISSING → write full document immediately (first login).
        c. GET ERR → blind SET as last resort so user is visible.
════════════════════════════════════════════════════════════════ */
/*
 * _waitForGThenEnsure
 * ─────────────────────────────────────────────────────────────────
 * Polls every 500 ms until BOTH conditions are satisfied:
 *   1. _fbReady is true  (auth resolved)
 *   2. G exists AND has at least one populated required field
 *      (G.name or G.vk is set — proof that ld() has finished)
 * Then calls _ensurePlayerDoc() exactly once per session.
 *
 * We track calls with _docEnsured so re-auth events don't trigger
 * a second write in the same session.
 */
var _docEnsured = false;   /* true once _ensurePlayerDoc has run */

function _waitForGThenEnsure() {
  /* Already ran this session — nothing to do */
  if (_docEnsured) return;

  /* Check whether G is ready: must exist and carry real game data */
  function gIsReady() {
    return (
      typeof G !== 'undefined' &&
      G !== null &&
      (
        (typeof G.name === 'string' && G.name.trim().length > 0) ||
        (typeof G.vk   === 'number' && G.vk   >= 0)
      )
    );
  }

  if (_fbReady && gIsReady()) {
    /* Both conditions met immediately — run now */
    _docEnsured = true;
    _ensurePlayerDoc();
    return;
  }

  /* At least one condition not yet met — poll every 500 ms */
  var _gPollTimer = setInterval(function() {
    if (!_fbReady || !gIsReady()) return;   /* still waiting */

    clearInterval(_gPollTimer);

    if (_docEnsured) return;   /* guard against rapid double-fire */
    _docEnsured = true;

    console.log('[FB] G is ready (name="' + (G.name || '') + '", vk=' + (G.vk || 0) + ') — running _ensurePlayerDoc');
    _ensurePlayerDoc();
  }, 500);
}

function _ensurePlayerDoc() {
  var docId = _myDocId();
  if (!docId) {
    console.warn('[FB] _ensurePlayerDoc: cannot resolve doc ID (no email, no uid)');
    return;
  }

  var ref = _db.collection('players').doc(docId);

  ref.get()

    /* ── GET succeeded ────────────────────────────────────────── */
    .then(function(snap) {

      if (snap.exists) {
        /* ── Document found — merge cloud wins ────────────────── */
        var cloud = snap.data();

        /* Economy: cloud wins if higher (anti-cheat lite) */
        if ((cloud.vk       || 0) > (G.vk  || 0)) G.vk  = cloud.vk;
        if ((cloud.diamonds || 0) > (G.dia  || 0)) G.dia = cloud.diamonds;

        /* Social fields always from cloud */
        if (cloud.bio)       G.bio       = cloud.bio;
        if (cloud.joinedAt)  G.joinedAt  = cloud.joinedAt;
        if (cloud.likes)     G.likes     = cloud.likes;
        if (cloud.giftCount) G.giftCount = cloud.giftCount;
        if (Array.isArray(cloud.badges) && cloud.badges.length)
          G.badges = cloud.badges;
        if (cloud.anonymous !== undefined && G.settings)
          G.settings.anonymous = cloud.anonymous;

        /* Push fresh local stats back without touching cloud-only
           fields we just merged in (name, rank, profile, etc.)  */
        ref.set({
          name:       ((G.name || '').trim()) || 'Player',
          nameLower:  ((G.name || '').trim() || 'player').toLowerCase(),
          email:      (G.email || '').trim() || ('uid_' + _fbUid),
          uid:        _fbUid || null,
          vk:         G.vk  || 0,
          diamonds:   G.dia || 0,
          rank:       _rankName(),
          achCount:   countAch(),
          homesBuilt: (G.build && Array.isArray(G.build.homes))
                        ? G.build.homes.length : 0,
          profilePic: G.profilePic || '',
          status:     G.status     || 'online',
          online:     true,
          vault:      G.vault     || { items: [], active: {} },
          cosmetics:  G.cosmetics || {},
          lastSeen:   firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(function() {
          console.log('[FB] Player doc refreshed:', docId);
        })
        .catch(function(e) {
          console.warn('[FB] Doc refresh error:', e.code, e.message);
        });

      } else {
        /* ── Document missing — first login ───────────────────── */
        G.joinedAt = G.joinedAt || Date.now();

        var firstDoc = buildPlayerData();

        /* Guard: never write an empty object to Firestore */
        if (!firstDoc || Object.keys(firstDoc).length === 0) {
          console.error('[FB] Abort: buildPlayerData returned empty — skipping write for', docId);
          return;
        }
        console.log('[FB] Creating player doc with data:', firstDoc);

        ref.set(firstDoc, { merge: true })
          .then(function() {
            console.log('[FB] Player doc CREATED:', docId);
            /*
             * Schedule a second save 3 s later.
             * By that point the game may have computed the correct
             * VK total / rank from local storage, so stats will be
             * accurate in the leaderboard on first load.
             */
            setTimeout(fbSave, 3000);
          })
          .catch(function(e) {
            console.error('[FB] Player doc CREATE failed:', e.code, e.message);
          });
      }
    })

    /* ── GET failed (most likely a Firestore rules block) ──────── */
    .catch(function(e) {
      console.error(
        '[FB] _ensurePlayerDoc GET error:', e.code, e.message,
        '\n → Check Firestore rules. The /players collection needs:',
        '\n   allow read, write: if request.auth != null;'
      );

      /* Last resort: attempt a blind write so the user is at least
         visible in leaderboard / search even if we couldn't read.  */
      G.joinedAt = G.joinedAt || Date.now();
      var blindDoc = buildPlayerData();
      if (!blindDoc || Object.keys(blindDoc).length === 0) {
        console.error('[FB] Abort: buildPlayerData returned empty — skipping blind-write for', docId);
        return;
      }
      console.log('[FB] Creating player doc with data:', blindDoc);
      ref.set(blindDoc, { merge: true })
        .then(function() {
          console.log('[FB] Blind-write succeeded for:', docId);
        })
        .catch(function(e2) {
          console.error('[FB] Blind-write also failed:', e2.code,
            '— user will NOT appear in leaderboard/search.');
        });
    });
}


/* ═════════════════════════════════════════════════════════════════
   fbSave  (debounced 2 s)
   ─────────────────────────────────────────────────────────────
   Called by sv() after every game action (tap, purchase, etc.).
   Uses merge: true so sub-collections (friends, notifications)
   are never touched.
════════════════════════════════════════════════════════════════ */
var _fbSaveTimer = null;

function fbSave() {
  var docId = _myDocId();
  if (!docId) return;   /* Not authenticated yet — skip silently */

  clearTimeout(_fbSaveTimer);
  _fbSaveTimer = setTimeout(function() {
    fbReady(function() {
      _db.collection('players').doc(docId)
        .set(buildPlayerData(), { merge: true })
        .catch(function(e) {
          console.warn('[FB] fbSave error:', e.code, e.message);
        });
    });
  }, 2000);
}


/* ═════════════════════════════════════════════════════════════════
   fbLoad  (called on login by main.js)
   ─────────────────────────────────────────────────────────────
   Merges Firestore cloud data into local G, then calls callback().
   Document creation / refresh is handled by _ensurePlayerDoc()
   which fires separately after auth — fbLoad just needs to
   populate G and unblock the UI as fast as possible.
════════════════════════════════════════════════════════════════ */
function fbLoad(email, callback) {
  fbReady(function() {
    var docId = playerDocId(email);

    /* No email yet — unblock UI immediately, _ensurePlayerDoc
       will create the doc once auth fires.                    */
    if (!docId) {
      if (callback) callback();
      return;
    }

    _db.collection('players').doc(docId).get()
      .then(function(snap) {

        if (snap.exists) {
          /* Merge cloud data into G */
          var d = snap.data();

          /* Economy: cloud wins if higher */
          if ((d.vk       || 0) > (G.vk  || 0)) G.vk  = d.vk;
          if ((d.diamonds || 0) > (G.dia  || 0)) G.dia = d.diamonds;

          /* Social / profile fields from cloud */
          if (d.bio)       G.bio       = d.bio;
          if (d.joinedAt)  G.joinedAt  = d.joinedAt;
          if (d.likes)     G.likes     = d.likes;
          if (d.giftCount) G.giftCount = d.giftCount;
          if (Array.isArray(d.badges) && d.badges.length) G.badges = d.badges;
          if (d.anonymous !== undefined && G.settings)
            G.settings.anonymous = d.anonymous;

        } else {
          /* Document doesn't exist yet — set joinedAt locally.
             _ensurePlayerDoc() will write the full document.   */
          G.joinedAt = G.joinedAt || Date.now();
        }

        if (callback) callback();

        /*
         * Refresh Firestore 3 s after load so the leaderboard
         * reflects current-session stats (VK, rank, achievements).
         */
        setTimeout(fbSave, 3000);
      })

      .catch(function(e) {
        /* On GET error still 
