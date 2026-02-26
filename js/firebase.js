/* ═══════════════════════════════════════════════════
   VICTOR COIN — Firebase Integration v1
   Uses Firebase CDN compat libraries (no bundler needed)
   Works directly on GitHub Pages
═══════════════════════════════════════════════════ */

var FB_CFG = {
  apiKey: "AIzaSyDLJ7uWgRGCD7EgfJ57ibnnhz334BCJkLg",
  authDomain: "victor-coin.firebaseapp.com",
  projectId: "victor-coin",
  storageBucket: "victor-coin.firebasestorage.app",
  messagingSenderId: "1080734767954",
  appId: "1:1080734767954:web:de6c75ba3e5e070299f88b"
};

/* Global Firebase refs */
var _fbApp = null;
var _db    = null;
var _fbReady = false;
var _fbQueue = []; // functions waiting for FB to be ready

function fbReady(fn) {
  if (_fbReady) fn();
  else _fbQueue.push(fn);
}

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded yet');
      return;
    }
    if (!firebase.apps.length) {
      _fbApp = firebase.initializeApp(FB_CFG);
    } else {
      _fbApp = firebase.app();
    }
    _db = firebase.firestore();
    _fbReady = true;
    _fbQueue.forEach(function(fn){ try{fn();}catch(e){} });
    _fbQueue = [];
    console.log('✅ Firebase connected');
  } catch(e) {
    console.error('Firebase init error:', e);
  }
}

/* ── PLAYER DOC ID (sanitised email) ── */
function playerDocId(email) {
  return (email||'').toLowerCase().replace(/[.#$\[\]]/g,'_');
}

/* ── MOST VISITED EXPLORE LOCATION ── */
function getMostVisitedLoc() {
  if (!G.ex || !G.ex.locVisits) return 'Unexplored';
  var locs = ['Vic Tomb','Vic Docks','Vic Haven','Vic Citadel','Vic Abyss'];
  var visits = G.ex.locVisits;
  var maxIdx = 0;
  for (var i = 1; i < visits.length; i++) {
    if ((visits[i]||0) > (visits[maxIdx]||0)) maxIdx = i;
  }
  return (visits[maxIdx]||0) > 0 ? locs[maxIdx] : 'Unexplored';
}

/* ── COUNT ACHIEVEMENTS ── */
function countAch() {
  if (!G.ach) return 0;
  return G.ach.filter(function(a){ return a; }).length;
}

/* ── BUILD PLAYER DATA OBJECT ── */
function buildPlayerData() {
  var ranks = ['🌱 Newbie','⚔️ Veteran','🔥 Pro','👑 Master','🌟 Legend'];
  var rankName = '🌱 Newbie';
  if (typeof RK !== 'undefined') {
    for (var i = RK.length-1; i >= 0; i--) {
      if (G.vk >= RK[i].q) { rankName = RK[i].n; break; }
    }
  }
  return {
    name:         G.name || 'Unknown',
    email:        G.email || '',
    vk:           G.vk   || 0,
    diamonds:     G.dia  || 0,
    rank:         rankName,
    achCount:     countAch(),
    homesBuilt:   G.build ? G.build.homes.length : 0,
    location:     getMostVisitedLoc(),
    profilePic:   G.profilePic || '',
    bio:          G.bio || '',
    anonymous:    G.settings ? !!G.settings.anonymous : false,
    lastSeen:     firebase.firestore.FieldValue.serverTimestamp(),
    joinedAt:     G.joinedAt || Date.now()
  };
}

/* ══════════════════════════════════════
   SAVE PLAYER TO FIREBASE
   Called after every sv()
══════════════════════════════════════ */
var _fbSaveTimer = null;
function fbSave() {
  if (!G.email) return;
  clearTimeout(_fbSaveTimer);
  _fbSaveTimer = setTimeout(function() {
    fbReady(function() {
      var docId = playerDocId(G.email);
      var data  = buildPlayerData();
      _db.collection('players').doc(docId).set(data, { merge: true })
        .catch(function(e){ console.warn('fbSave error:', e); });
    });
  }, 2000); // debounce 2s
}

/* ══════════════════════════════════════
   LOAD PLAYER FROM FIREBASE
   Called on login — merges cloud data with local
══════════════════════════════════════ */
function fbLoad(email, callback) {
  fbReady(function() {
    var docId = playerDocId(email);
    _db.collection('players').doc(docId).get()
      .then(function(doc) {
        if (doc.exists) {
          var d = doc.data();
          // Merge cloud data — cloud wins for social fields
          if (d.bio)       G.bio = d.bio;
          if (d.joinedAt)  G.joinedAt = d.joinedAt;
          if (d.anonymous !== undefined && G.settings) G.settings.anonymous = d.anonymous;
          // Cloud VK/diamonds wins if higher (anti-cheat lite)
          if ((d.vk||0) > G.vk)   G.vk  = d.vk;
          if ((d.diamonds||0) > G.dia) G.dia = d.diamonds;
        } else {
          // First time — set joinedAt
          G.joinedAt = Date.now();
        }
        if (callback) callback();
      })
      .catch(function(e) {
        console.warn('fbLoad error:', e);
        if (callback) callback();
      });
  });
}

/* ══════════════════════════════════════
   LEADERBOARD
══════════════════════════════════════ */
function fbGetLeaderboard(type, callback) {
  // type = 'vk' or 'diamonds'
  fbReady(function() {
    _db.collection('players')
      .orderBy(type === 'diamonds' ? 'diamonds' : 'vk', 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var players = [];
        snap.forEach(function(doc) { players.push(doc.data()); });
        callback(players);
      })
      .catch(function(e) { console.warn('leaderboard error:', e); callback([]); });
  });
}

/* ══════════════════════════════════════
   PLAYER SEARCH
══════════════════════════════════════ */
function fbSearchPlayer(name, callback) {
  fbReady(function() {
    // Search by name (case-insensitive via nameLower field)
    _db.collection('players')
      .where('nameLower', '>=', name.toLowerCase())
      .where('nameLower', '<=', name.toLowerCase() + '\uf8ff')
      .limit(10)
      .get()
      .then(function(snap) {
        var results = [];
        snap.forEach(function(doc) { results.push(doc.data()); });
        callback(results);
      })
      .catch(function(e) {
        // Fallback: search without index
        _db.collection('players').get().then(function(snap) {
          var results = [];
          snap.forEach(function(doc) {
            var d = doc.data();
            if (d.name && d.name.toLowerCase().includes(name.toLowerCase())) results.push(d);
          });
          callback(results.slice(0,10));
        }).catch(function(){ callback([]); });
      });
  });
}

/* ══════════════════════════════════════
   GIFT SYSTEM
══════════════════════════════════════ */
function fbSendGift(toName, type, amount, callback) {
  if (!G.email || !G.name) { callback({error:'Not logged in'}); return; }
  if (type === 'vk' && G.vk < amount)       { callback({error:'Not enough VK'}); return; }
  if (type === 'diamonds' && G.dia < amount) { callback({error:'Not enough diamonds'}); return; }

  fbReady(function() {
    // Find recipient by name
    _db.collection('players')
      .where('name', '==', toName)
      .limit(1)
      .get()
      .then(function(snap) {
        if (snap.empty) { callback({error:'Player "'+toName+'" not found'}); return; }
        var recipient = snap.docs[0].data();
        var recipientId = playerDocId(recipient.email);
        var batch = _db.batch();

        // Deduct from sender
        if (type === 'vk')       G.vk  -= amount;
        if (type === 'diamonds') G.dia -= amount;
        sv(); renderAll();
        var senderRef = _db.collection('players').doc(playerDocId(G.email));
        var update = type === 'vk' ? {vk: G.vk} : {diamonds: G.dia};
        batch.update(senderRef, update);

        // Add to recipient
        var recipRef = _db.collection('players').doc(recipientId);
        var recipUpdate = type === 'vk'
          ? {vk: firebase.firestore.FieldValue.increment(amount)}
          : {diamonds: firebase.firestore.FieldValue.increment(amount)};
        batch.update(recipRef, recipUpdate);

        // Log gift
        var giftRef = _db.collection('gifts').doc();
        batch.set(giftRef, {
          from: G.name,
          fromEmail: G.email,
          to: recipient.name,
          toEmail: recipient.email,
          type: type,
          amount: amount,
          ts: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Notification to recipient
        var notifRef = _db.collection('players').doc(recipientId)
                          .collection('notifications').doc();
        batch.set(notifRef, {
          type: 'gift',
          from: G.name,
          message: G.name + ' gifted you ' + fm(amount) + ' ' + (type==='vk'?'VK':'💎'),
          read: false,
          ts: firebase.firestore.FieldValue.serverTimestamp()
        });

        batch.commit()
          .then(function() { callback({success:true, recipient: recipient.name}); })
          .catch(function(e) { callback({error: e.message}); });
      })
      .catch(function(e) { callback({error: e.message}); });
  });
}

/* ══════════════════════════════════════
   LIKES
══════════════════════════════════════ */
function fbLikePlayer(targetEmail, callback) {
  if (!G.email) return;
  fbReady(function() {
    var targetId = playerDocId(targetEmail);
    var likeRef  = _db.collection('players').doc(targetId)
                      .collection('likes').doc(playerDocId(G.email));
    likeRef.set({ from: G.name, ts: firebase.firestore.FieldValue.serverTimestamp() })
      .then(function() {
        // Increment like count
        _db.collection('players').doc(targetId)
          .update({ likes: firebase.firestore.FieldValue.increment(1) });
        // Notify
        _db.collection('players').doc(targetId)
          .collection('notifications').doc().set({
            type: 'like',
            from: G.name,
            message: G.name + ' liked your profile ❤️',
            read: false,
            ts: firebase.firestore.FieldValue.serverTimestamp()
          });
        if(callback) callback({success:true});
      })
      .catch(function(e){ if(callback) callback({error:e.message}); });
  });
}

/* ══════════════════════════════════════
   FRIEND REQUESTS
══════════════════════════════════════ */
function fbSendFriendReq(toName, callback) {
  fbReady(function() {
    _db.collection('players').where('name','==',toName).limit(1).get()
      .then(function(snap) {
        if (snap.empty) { callback({error:'Player not found'}); return; }
        var target   = snap.docs[0].data();
        var targetId = playerDocId(target.email);
        var reqRef   = _db.collection('friendRequests').doc(playerDocId(G.email)+'_'+targetId);
        reqRef.set({
          from: G.name, fromEmail: G.email,
          to: target.name, toEmail: target.email,
          status: 'pending',
          ts: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function() {
          // Notify target
          _db.collection('players').doc(targetId).collection('notifications').doc().set({
            type:'friendRequest', from: G.name,
            message: G.name+' sent you a friend request 👥',
            fromEmail: G.email, read:false,
            ts: firebase.firestore.FieldValue.serverTimestamp()
          });
          callback({success:true});
        }).catch(function(e){ callback({error:e.message}); });
      });
  });
}

function fbAcceptFriendReq(fromEmail, callback) {
  fbReady(function() {
    var reqId  = playerDocId(fromEmail)+'_'+playerDocId(G.email);
    var batch  = _db.batch();
    // Update request status
    batch.update(_db.collection('friendRequests').doc(reqId), {status:'accepted'});
    // Add to both friends lists
    batch.set(_db.collection('players').doc(playerDocId(G.email))
      .collection('friends').doc(playerDocId(fromEmail)),
      {email:fromEmail, since: firebase.firestore.FieldValue.serverTimestamp()});
    batch.set(_db.collection('players').doc(playerDocId(fromEmail))
      .collection('friends').doc(playerDocId(G.email)),
      {email:G.email, since: firebase.firestore.FieldValue.serverTimestamp()});
    batch.commit().then(function(){ callback({success:true}); })
      .catch(function(e){ callback({error:e.message}); });
  });
}

function fbGetFriends(callback) {
  fbReady(function() {
    _db.collection('players').doc(playerDocId(G.email))
      .collection('friends').get()
      .then(function(snap) {
        var emails = [];
        snap.forEach(function(d){ emails.push(d.data().email); });
        // Fetch each friend's profile
        var proms = emails.map(function(e){
          return _db.collection('players').doc(playerDocId(e)).get();
        });
        Promise.all(proms).then(function(docs){
          var friends = docs.filter(function(d){return d.exists;})
                            .map(function(d){return d.data();});
          callback(friends);
        });
      }).catch(function(){ callback([]); });
  });
}

function fbUnfriend(friendEmail, callback) {
  fbReady(function() {
    var batch = _db.batch();
    batch.delete(_db.collection('players').doc(playerDocId(G.email))
      .collection('friends').doc(playerDocId(friendEmail)));
    batch.delete(_db.collection('players').doc(playerDocId(friendEmail))
      .collection('friends').doc(playerDocId(G.email)));
    batch.commit().then(function(){ callback({success:true}); })
      .catch(function(e){ callback({error:e.message}); });
  });
}

/* ══════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════ */
var _notifUnsub = null;
function fbListenNotifications() {
  if (!G.email || !_fbReady) return;
  if (_notifUnsub) _notifUnsub();
  _notifUnsub = _db.collection('players').doc(playerDocId(G.email))
    .collection('notifications')
    .orderBy('ts','desc').limit(20)
    .onSnapshot(function(snap) {
      var unread = 0;
      snap.forEach(function(d){ if(!d.data().read) unread++; });
      updateNotifBadge(unread);
    });
}

function updateNotifBadge(count) {
  var badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/* ══════════════════════════════════════
   REAL-TIME CHAT (Victor Chat)
   Auto-deletes messages older than 24hrs
══════════════════════════════════════ */
var _chatUnsub = null;

function fbSendMessage(text) {
  if (!text.trim() || !G.email) return;
  fbReady(function() {
    _db.collection('chat').add({
      name:       G.anonymous ? 'Anonymous' : G.name,
      email:      G.email,
      profilePic: G.profilePic || '',
      text:       text.trim().slice(0,300),
      ts:         firebase.firestore.FieldValue.serverTimestamp(),
      expireAt:   Date.now() + 24*60*60*1000
    });
    // Clean old messages
    fbCleanChat();
  });
}

function fbListenChat(callback) {
  if (_chatUnsub) _chatUnsub();
  fbReady(function() {
    _chatUnsub = _db.collection('chat')
      .orderBy('ts','desc').limit(80)
      .onSnapshot(function(snap) {
        var msgs = [];
        snap.forEach(function(d){ msgs.push({id:d.id,...d.data()}); });
        callback(msgs.reverse());
      });
  });
}

function fbCleanChat() {
  var cutoff = Date.now() - 24*60*60*1000;
  _db.collection('chat')
    .where('expireAt','<', cutoff).limit(20).get()
    .then(function(snap){
      var batch = _db.batch();
      snap.forEach(function(d){ batch.delete(d.ref); });
      batch.commit();
    }).catch(function(){});
}

/* ══════════════════════════════════════
   ONLINE PRESENCE
══════════════════════════════════════ */
function fbSetOnline() {
  if (!G.email || !_fbReady) return;
  _db.collection('players').doc(playerDocId(G.email))
    .update({
      online: true,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(){});
}

function fbSetOffline() {
  if (!G.email || !_fbReady) return;
  _db.collection('players').doc(playerDocId(G.email))
    .update({ online: false, lastSeen: firebase.firestore.FieldValue.serverTimestamp() })
    .catch(function(){});
}

// Track online status
document.addEventListener('visibilitychange', function(){
  if (document.hidden) fbSetOffline();
  else fbSetOnline();
});
window.addEventListener('beforeunload', fbSetOffline);

