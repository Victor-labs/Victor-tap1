/* ═══════════════════════════════════════════════════
   VICTOR COIN — Social System
   Profile · Leaderboard · Chat · Gift · Search · Friends
═══════════════════════════════════════════════════ */

/* ── OPEN SOCIAL OVERLAY ── */
function openSocial() {
  try {
    var ex = document.getElementById('socialOverlay');
    if (ex) { ex.remove(); return; }
    var ov = document.createElement('div');
    ov.id = 'socialOverlay';
    ov.innerHTML = buildSocialShell();
    document.body.appendChild(ov);
    socialNav('profile');
  } catch(e) { console.error('openSocial error:',e); }
}

function closeSocial() {
  var ov = document.getElementById('socialOverlay');
  if (ov) ov.remove();
  if (typeof _chatUnsub === 'function') { _chatUnsub(); _chatUnsub = null; }
}

function buildSocialShell() {
  return '<div class="soc-overlay">'
    + '<div class="soc-bar">'
    + '<div class="soc-title">🌐 SOCIAL</div>'
    + '<div class="soc-nav" id="socNav">'
    + '<button class="soc-nb" id="snav-profile"   onclick="socialNav(\'profile\')">👤</button>'
    + '<button class="soc-nb" id="snav-leaderboard" onclick="socialNav(\'leaderboard\')">🏆</button>'
    + '<button class="soc-nb" id="snav-chat"       onclick="socialNav(\'chat\')">💬</button>'
    + '<button class="soc-nb" id="snav-gift"       onclick="socialNav(\'gift\')">🎁</button>'
    + '<button class="soc-nb" id="snav-search"     onclick="socialNav(\'search\')">🔍</button>'
    + '<button class="soc-nb" id="snav-friends"    onclick="socialNav(\'friends\')">👥</button>'
    + '<button class="soc-nb" id="snav-badges"     onclick="socialNav(\'badges\')">🏷️</button>'
    + '</div>'
    + '<button class="soc-exit" onclick="closeSocial()">✕</button>'
    + '</div>'
    + '<div class="soc-body" id="socBody"></div>'
    + '</div>';
}

var _socTab = '';
function socialNav(tab) {
  _socTab = tab;
  document.querySelectorAll('.soc-nb').forEach(function(b) {
    b.classList.toggle('soc-nb-on', b.id === 'snav-' + tab);
  });
  var body = document.getElementById('socBody');
  if (!body) return;
  body.innerHTML = '<div class="soc-loading">⏳ Loading...</div>';
  if (tab === 'profile')     renderMyProfile(body);
  if (tab === 'leaderboard') renderLeaderboard(body);
  if (tab === 'chat')        renderChat(body);
  if (tab === 'gift')        renderGift(body);
  if (tab === 'search')      renderSearch(body);
  if (tab === 'friends')     renderFriends(body);
  if (tab === 'badges')      { if(typeof renderBadgesTab==='function') renderBadgesTab(body); else body.innerHTML='<div class="soc-empty">Badges loading…</div>'; }
}

/* ═══════════════════════════════════════
   1. MY PUBLIC PROFILE
═══════════════════════════════════════ */
function renderMyProfile(body) {
  fbReady(function() {
    _db.collection('players').doc(playerDocId(G.email)).get()
      .then(function(doc) {
        var d = doc.exists ? doc.data() : buildPlayerData();
        body.innerHTML = buildProfileCard(d, true);
      }).catch(function() {
        body.innerHTML = buildProfileCard(buildPlayerData(), true);
      });
  });
}

function buildProfileCard(d, isSelf, showFriendBtn) {
  var pic = d.profilePic
    ? '<img src="'+d.profilePic+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"/>'
    : '<span style="font-size:2.2rem;">👤</span>';
  var anon = d.anonymous && !isSelf;
  var displayName = anon ? 'Anonymous' : (d.name || 'Unknown');
  var joined = d.joinedAt ? new Date(d.joinedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—';
  var lastSeen = d.lastSeen && d.lastSeen.toDate
    ? timeAgo(d.lastSeen.toDate()) : '—';
  var online = d.online;

  return '<div class="profcard">'
    // Glass header
    + '<div class="profcard-hdr">'
    + '<div class="profcard-av">'+pic+'</div>'
    + '<div class="profcard-hinfo">'
    + '<div class="profcard-name">'+displayName+'</div>'
    + '<div class="profcard-rank">'+( d.rank||'🌱 Newbie')+'</div>'
    + '<div class="profcard-online '+(online?'poc-on':'poc-off')+'">'
    + (online?'🟢 Online':'⚫ '+lastSeen)+'</div>'
    + '</div>'
    + '</div>'
    // Bio
    + (isSelf
      ? '<div class="profcard-bio-wrap"><textarea class="profcard-bio-edit" id="bioInput" placeholder="Write your bio here…" maxlength="120">'+(G.bio||'')+'</textarea>'
        +'<button class="prof-savebio" onclick="saveBio()">Save Bio</button></div>'
      : (d.bio ? '<div class="profcard-bio">"'+d.bio+'"</div>' : ''))
    // Stats grid
    + '<div class="profcard-stats">'
    + profStat('🪙','VK Coins',    anon?'—':fm(d.vk||0))
    + profStat('💎','Diamonds',   anon?'—':fm(d.diamonds||0))
    + profStat('🏅','Achievements',(d.achCount||0)+'/40')
    + profStat('🏠','Homes Built', d.homesBuilt||0)
    + profStat('🗺️','Location',    d.location||'Unexplored')
    + profStat('📅','Joined',      joined)
    + '</div>'
    // Likes
    + '<div class="profcard-likes">'
    + '<span style="font-size:1.1rem;">❤️</span>'
    + '<span class="profcard-likecount" id="likeCount_'+(d.email||'')+'">'+(d.likes||0)+'</span>'
    + ' likes'
    + (!isSelf ? '<button class="prof-likebtn" onclick="likePlayer(\''+d.email+'\')">❤️ Like</button>' : '')
    + '</div>'
    // Action buttons
    + '<div class="profcard-acts">'
    + (isSelf ? '<button class="prof-act" onclick="openSettings()">⚙️ Settings</button>' : '')
    + (showFriendBtn && !isSelf ? '<button class="prof-act prof-act-friend" onclick="sendFriendReq(\''+d.name+'\')">👥 Add Friend</button>' : '')
    + (!isSelf ? '<button class="prof-act" onclick="openGiftTo(\''+d.name+'\')">🎁 Gift</button>' : '')
    + '</div>'
    + '</div>';
}

function profStat(ico, label, val) {
  return '<div class="pstat"><div class="pstat-ico">'+ico+'</div>'
    +'<div class="pstat-l">'+label+'</div>'
    +'<div class="pstat-v">'+val+'</div></div>';
}

function saveBio() {
  var bio = (document.getElementById('bioInput')||{}).value || '';
  G.bio = bio.trim().slice(0,120);
  sv();
  fbReady(function(){
    _db.collection('players').doc(playerDocId(G.email))
      .update({bio: G.bio}).catch(function(){});
  });
  toast('✅ Bio saved!','#30D158');
}

function likePlayer(email) {
  fbLikePlayer(email, function(res) {
    if (res.error) { toast(res.error,'#FF453A'); return; }
    toast('❤️ Liked!','#FF2D55');
    var el = document.getElementById('likeCount_'+email);
    if (el) el.textContent = parseInt(el.textContent||0)+1;
  });
}

/* ═══════════════════════════════════════
   2. LEADERBOARD
═══════════════════════════════════════ */
var _lbType = 'vk';
function renderLeaderboard(body) {
  if(!G.lbViews) G.lbViews=0;
  G.lbViews++; sv();
  if(typeof checkAch==='function') checkAch();
  body.innerHTML = '<div style="padding:14px;">'
    + '<div style="display:flex;gap:8px;margin-bottom:14px;">'
    + '<button class="lb-tab '+ (_lbType==='vk'?'lb-tab-on':'') +'" onclick="switchLB(\'vk\')">🪙 VK Coins</button>'
    + '<button class="lb-tab '+ (_lbType==='diamonds'?'lb-tab-on':'') +'" onclick="switchLB(\'diamonds\')">💎 Diamonds</button>'
    + '</div>'
    + '<div id="lbList"><div class="soc-loading">Loading rankings…</div></div>'
    + '</div>';
  loadLB();
}

function switchLB(type) {
  _lbType = type;
  document.querySelectorAll('.lb-tab').forEach(function(b,i){
    b.classList.toggle('lb-tab-on', (i===0&&type==='vk')||(i===1&&type==='diamonds'));
  });
  loadLB();
}

function loadLB() {
  fbGetLeaderboard(_lbType, function(players) {
    var el = document.getElementById('lbList');
    if (!el) return;
    if (!players.length) { el.innerHTML='<div class="soc-empty">No players yet</div>'; return; }
    var medals = ['🥇','🥈','🥉'];
    el.innerHTML = players.map(function(p, i) {
      var anon = p.anonymous;
      var name = anon ? 'Anonymous' : (p.name||'Unknown');
      var val  = _lbType==='diamonds' ? fm(p.diamonds||0)+' 💎' : fm(p.vk||0)+' VK';
      var pic  = p.profilePic
        ? '<img src="'+p.profilePic+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"/>'
        : '<div class="lb-av">'+name.charAt(0).toUpperCase()+'</div>';
      return '<div class="lb-row" onclick="showPlayerCard(\''+p.email+'\')">'
        + '<div class="lb-rank">'+(medals[i]||('#'+(i+1)))+'</div>'
        + pic
        + '<div class="lb-info"><div class="lb-name">'+name+'</div>'
        + '<div class="lb-sub">'+( p.rank||'🌱 Newbie')+'</div></div>'
        + '<div class="lb-val">'+val+'</div>'
        + '</div>';
    }).join('');
  });
}

/* ═══════════════════════════════════════
   3. VICTOR CHAT
═══════════════════════════════════════ */
function renderChat(body) {
  body.innerHTML = ''
    + '<div class="chat-wrap">'
    + '<div class="chat-msgs" id="chatMsgs"><div class="soc-loading">Loading chat…</div></div>'
    + '<div class="chat-input-row">'
    + '<input class="chat-inp" id="chatInp" placeholder="Type a message…" maxlength="300" onkeydown="if(event.key===\'Enter\')sendChat()"/>'
    + '<button class="chat-send" onclick="sendChat()">➤</button>'
    + '</div></div>';

  fbListenChat(function(msgs) {
    var el = document.getElementById('chatMsgs');
    if (!el) return;
    if (!msgs.length) { el.innerHTML='<div class="soc-empty">No messages yet. Say hi! 👋</div>'; return; }
    el.innerHTML = msgs.map(function(m) {
      var isMe = m.email === G.email;
      var pic  = m.profilePic
        ? '<img src="'+m.profilePic+'" class="chat-av" />'
        : '<div class="chat-av chat-av-def">'+((m.name||'?').charAt(0))+'</div>';
      var time = m.ts && m.ts.toDate ? m.ts.toDate().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '';
      return '<div class="chat-msg '+(isMe?'chat-msg-me':'')+'">'
        + (!isMe ? pic : '')
        + '<div class="chat-bubble-wrap">'
        + (!isMe?'<div class="chat-sender">'+m.name+'</div>':'')
        + '<div class="chat-bubble '+(isMe?'chat-bubble-me':'')+'">'+escHTML(m.text)+'</div>'
        + '<div class="chat-time">'+time+'</div>'
        + '</div>'
        + (isMe ? pic : '')
        + '</div>';
    }).join('');
    el.scrollTop = el.scrollHeight;
  });
}

function sendChat() {
  var inp = document.getElementById('chatInp');
  if (!inp || !inp.value.trim()) return;
  fbSendMessage(inp.value);
  if(typeof questProgress==='function') questProgress('chats',1);
  inp.value = '';
}

function escHTML(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ═══════════════════════════════════════
   4. GIFT
═══════════════════════════════════════ */
var _giftTo = '';
function renderGift(body) {
  body.innerHTML = ''
    + '<div style="padding:16px;">'
    + '<div class="soc-sec-title">🎁 Gift a Player</div>'
    + '<div class="soc-sec-sub">Send VK or Diamonds directly to another player</div>'
    + '<div class="gift-form">'
    + '<label class="gift-lbl">Player Name</label>'
    + '<input class="gift-inp" id="giftName" placeholder="Enter exact player name" value="'+_giftTo+'"/>'
    + '<label class="gift-lbl" style="margin-top:10px;">Gift Type</label>'
    + '<div class="gift-type-row">'
    + '<button class="gift-type gift-type-on" id="gtype-vk"      onclick="selGiftType(\'vk\')">🪙 VK Coins</button>'
    + '<button class="gift-type"              id="gtype-diamonds" onclick="selGiftType(\'diamonds\')">💎 Diamonds</button>'
    + '</div>'
    + '<label class="gift-lbl" style="margin-top:10px;">Amount</label>'
    + '<input class="gift-inp" id="giftAmt" type="number" placeholder="e.g. 50000" min="1"/>'
    + '<div class="gift-bal">Your balance: <span class="tg" id="giftBalVK">'+fm(G.vk)+'</span> VK · <span class="td" id="giftBalDia">'+G.dia+'</span> 💎</div>'
    + '<button class="gift-send-btn" onclick="sendGift()">🎁 Send Gift</button>'
    + '</div></div>';
}

var _giftType = 'vk';
function selGiftType(type) {
  _giftType = type;
  ['vk','diamonds'].forEach(function(t){
    var b = document.getElementById('gtype-'+t);
    if(b) b.classList.toggle('gift-type-on', t===type);
  });
}

function openGiftTo(name) {
  _giftTo = name;
  socialNav('gift');
}

function sendGift() {
  var name = (document.getElementById('giftName')||{}).value||'';
  var amt  = parseInt((document.getElementById('giftAmt')||{}).value||0);
  if (!name.trim()) { toast('Enter a player name','#FF453A'); return; }
  if (!amt || amt < 1) { toast('Enter a valid amount','#FF453A'); return; }
  if (name.toLowerCase() === (G.name||'').toLowerCase()) { toast('Cannot gift yourself!','#FF9F0A'); return; }

  var btn = document.querySelector('.gift-send-btn');
  if (btn) { btn.disabled=true; btn.textContent='Sending…'; }

  if(typeof questProgress==='function') questProgress('gifts',1);
  fbSendGift(name, _giftType, amt, function(res) {
    if (btn) { btn.disabled=false; btn.textContent='🎁 Send Gift'; }
    if (res.error) { toast('❌ '+res.error,'#FF453A'); return; }
    toast('🎁 Sent '+fm(amt)+' '+(amt===1?'':'')+ (_giftType==='vk'?'VK':'💎')+' to '+res.recipient+'!','#30D158');
    renderGift(document.getElementById('socBody'));
  });
}

/* ═══════════════════════════════════════
   5. SEARCH FOR PLAYERS
═══════════════════════════════════════ */
function renderSearch(body) {
  body.innerHTML = ''
    + '<div style="padding:16px;">'
    + '<div class="soc-sec-title">🔍 Search Players</div>'
    + '<div class="search-row">'
    + '<input class="search-inp" id="searchInp" placeholder="Type a player name…" onkeydown="if(event.key===\'Enter\')doSearch()"/>'
    + '<button class="search-btn" onclick="doSearch()">Search</button>'
    + '</div>'
    + '<div id="searchResults"></div>'
    + '</div>';
}

function doSearch() {
  var q   = (document.getElementById('searchInp')||{}).value||'';
  var res = document.getElementById('searchResults');
  if (!q.trim()) { toast('Type a name to search','#FF9F0A'); return; }
  if (res) res.innerHTML = '<div class="soc-loading">Searching…</div>';
  fbSearchPlayer(q.trim(), function(players) {
    if (!res) return;
    if (!players.length) { res.innerHTML='<div class="soc-empty">No players found for "'+escHTML(q)+'"</div>'; return; }
    res.innerHTML = players.map(function(p) {
      var anon = p.anonymous;
      var name = anon ? 'Anonymous' : (p.name||'Unknown');
      var pic  = p.profilePic
        ? '<img src="'+p.profilePic+'" class="sr-av"/>'
        : '<div class="sr-av sr-av-def">'+name.charAt(0).toUpperCase()+'</div>';
      return '<div class="sr-row">'
        + pic
        + '<div class="sr-info"><div class="sr-name">'+name+'</div>'
        + '<div class="sr-rank">'+(p.rank||'🌱 Newbie')+'</div></div>'
        + (!anon?'<button class="sr-btn" onclick="showPlayerCard(\''+p.email+'\')">See Info</button>':'')
        + '</div>';
    }).join('');
  });
}

/* ═══════════════════════════════════════
   SHARED PLAYER PROFILE CARD POPUP
═══════════════════════════════════════ */
function showPlayerCard(email) {
  fbReady(function() {
    _db.collection('players').doc(playerDocId(email)).get()
      .then(function(doc) {
        if (!doc.exists) { toast('Player not found','#FF453A'); return; }
        var d = doc.data();
        // Log profile view notification
        if (d.email !== G.email) {
          _db.collection('players').doc(playerDocId(d.email))
            .collection('notifications').doc().set({
              type:'profileView', from: G.name,
              message: G.name+' viewed your profile 👀',
              read:false,
              ts: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(function(){});
        }
        var ov = document.createElement('div');
        ov.className = 'player-card-ov';
        ov.innerHTML = '<div class="player-card-wrap">'
          + '<button class="player-card-close" onclick="this.closest(\'.player-card-ov\').remove()">✕</button>'
          + buildProfileCard(d, false, true)
          + '</div>';
        ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
        document.body.appendChild(ov);
      }).catch(function(){ toast('Could not load profile','#FF453A'); });
  });
}

/* ═══════════════════════════════════════
   6. FRIENDS
═══════════════════════════════════════ */
function renderFriends(body) {
  body.innerHTML = '<div style="padding:16px;"><div class="soc-loading">Loading friends…</div></div>';
  fbGetFriends(function(friends) {
    var pending = '';
    // Check pending requests
    fbReady(function() {
      _db.collection('friendRequests')
        .where('toEmail','==',G.email)
        .where('status','==','pending').get()
        .then(function(snap) {
          var reqs = [];
          snap.forEach(function(d){ reqs.push(d.data()); });
          var b = document.getElementById('socBody');
          if (!b) return;
          b.innerHTML = '<div style="padding:16px;">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
            + '<div class="soc-sec-title" style="margin:0;">👥 Friends <span style="font-size:0.65rem;color:var(--text3);">('+friends.length+'/50)</span></div>'
            + '</div>'
            // Pending requests
            + (reqs.length ? '<div class="fr-section">📨 Pending Requests</div>'
              + reqs.map(function(r){
                return '<div class="fr-row">'
                  +'<div class="fr-av">'+r.from.charAt(0).toUpperCase()+'</div>'
                  +'<div class="fr-info"><div class="fr-name">'+r.from+'</div>'
                  +'<div class="fr-sub">Wants to be friends</div></div>'
                  +'<div style="display:flex;gap:6px;">'
                  +'<button class="fr-btn fr-acc" onclick="acceptFriend(\''+r.fromEmail+'\')">✓</button>'
                  +'<button class="fr-btn fr-dec" onclick="declineFriend(\''+r.fromEmail+'\')">✕</button>'
                  +'</div></div>';
              }).join('') : '')
            // Friends list
            + (friends.length
              ? '<div class="fr-section">Your Friends</div>'
                + friends.map(function(f) {
                  var online = f.online;
                  var pic = f.profilePic
                    ? '<img src="'+f.profilePic+'" class="fr-av" style="object-fit:cover;"/>'
                    : '<div class="fr-av">'+((f.name||'?').charAt(0).toUpperCase())+'</div>';
                  return '<div class="fr-row">'
                    + pic
                    + '<div class="fr-info">'
                    + '<div class="fr-name">'+( f.name||'Unknown')+'</div>'
                    + '<div class="fr-sub '+(online?'fr-online':'')+'">'+( online?'🟢 Online':'⚫ Offline')+'</div>'
                    + '</div>'
                    + '<div style="display:flex;gap:6px;">'
                    + '<button class="fr-btn" onclick="showPlayerCard(\''+f.email+'\')">👤</button>'
                    + '<button class="fr-btn fr-dec" onclick="confirmUnfriend(\''+f.email+'\',\''+f.name+'\')">Remove</button>'
                    + '</div></div>';
                }).join('')
              : '<div class="soc-empty">No friends yet.<br/>Search for players and add them!</div>')
            + '</div>';
        });
    });
  });
}

function sendFriendReq(name) {
  if (friends && friends.length >= 50) { toast('Friend limit reached (50)','#FF9F0A'); return; }
  fbSendFriendReq(name, function(res) {
    if (res.error) { toast('❌ '+res.error,'#FF453A'); return; }
    toast('👥 Friend request sent to '+name+'!','#5AC8FA');
  });
}

function acceptFriend(email) {
  fbAcceptFriendReq(email, function(res) {
    if (res.error) { toast('Error: '+res.error,'#FF453A'); return; }
    toast('✅ Friend added!','#30D158');
    renderFriends(document.getElementById('socBody'));
  });
}

function declineFriend(email) {
  fbReady(function() {
    _db.collection('friendRequests')
      .doc(playerDocId(email)+'_'+playerDocId(G.email))
      .update({status:'declined'})
      .then(function(){ renderFriends(document.getElementById('socBody')); });
  });
}

function confirmUnfriend(email, name) {
  var ov = document.createElement('div');
  ov.className = 'mov';
  ov.innerHTML = '<div class="mb"><span class="mico">👥</span>'
    +'<div class="mttl">Unfriend '+name+'?</div>'
    +'<div class="mbdy">This will remove them from your friends list.</div>'
    +'<div class="mbts">'
    +'<button class="mok" style="background:var(--red);" onclick="doUnfriend(\''+email+'\');this.closest(\'.mov\').remove()">Unfriend</button>'
    +'<button class="mcan" onclick="this.closest(\'.mov\').remove()">Cancel</button>'
    +'</div></div>';
  document.body.appendChild(ov);
}

function doUnfriend(email) {
  fbUnfriend(email, function(res) {
    if (res.error) { toast('Error','#FF453A'); return; }
    toast('Removed from friends','#FF9F0A');
    renderFriends(document.getElementById('socBody'));
  });
}

/* ═══════════════════════════════════════
   SETTINGS
═══════════════════════════════════════ */
function openSettings() {
  var ex = document.getElementById('settingsOverlay');
  if (ex) { ex.remove(); return; }
  if (!G.settings) G.settings = {anonymous:false, notifications:true};
  var ov = document.createElement('div');
  ov.id = 'settingsOverlay';
  ov.className = 'mov';
  ov.innerHTML = '<div class="mb" style="max-width:340px;">'
    +'<div class="mttl">⚙️ Settings</div>'
    +'<div class="set-list">'
    // Anonymous
    +'<div class="set-row">'
    +'<div><div class="set-name">🎭 Anonymous Mode</div>'
    +'<div class="set-desc">Hides your name on leaderboard & profile</div></div>'
    +'<div class="tog-wrap" onclick="toggleSetting(\'anonymous\')">'
    +'<div class="tog '+(G.settings.anonymous?'tog-on':'')+'" id="tog-anonymous"></div>'
    +'</div></div>'
    // Notifications
    +'<div class="set-row">'
    +'<div><div class="set-name">🔔 Notifications</div>'
    +'<div class="set-desc">Likes, gifts, friend requests, profile views</div></div>'
    +'<div class="tog-wrap" onclick="toggleSetting(\'notifications\')">'
    +'<div class="tog '+(G.settings.notifications?'tog-on':'')+'" id="tog-notifications"></div>'
    +'</div></div>'
    // Logout
    +'<div class="set-row" style="margin-top:6px;">'
    +'<div><div class="set-name">🚪 Logout</div>'
    +'<div class="set-desc">Returns you to the login screen</div></div>'
    +'<button class="set-logout" onclick="doLogout()">Logout</button>'
    +'</div>'
    +'</div>'
    +'<div class="mbts"><button class="mcan" onclick="document.getElementById(\'settingsOverlay\').remove()">Close</button></div>'
    +'</div>';
  document.body.appendChild(ov);
}

function toggleSetting(key) {
  if (!G.settings) G.settings = {anonymous:false,notifications:true};
  G.settings[key] = !G.settings[key];
  var tog = document.getElementById('tog-'+key);
  if (tog) tog.classList.toggle('tog-on', G.settings[key]);
  sv();
  fbReady(function(){
    var upd = {};
    upd[key] = G.settings[key];
    _db.collection('players').doc(playerDocId(G.email)).update(upd).catch(function(){});
  });
  toast((G.settings[key]?'✅ ':'❌ ')+key+' '+(G.settings[key]?'enabled':'disabled'),'#5AC8FA');
}

function doLogout() {
  fbSetOffline();
  sv();
  document.getElementById('settingsOverlay') && document.getElementById('settingsOverlay').remove();
  document.getElementById('socialOverlay')   && document.getElementById('socialOverlay').remove();
  document.getElementById('app').style.display  = 'none';
  document.getElementById('lp').style.display   = 'flex';
  toast('👋 Logged out','#5AC8FA');
}

/* ── HELPERS ── */
function timeAgo(date) {
  var sec = Math.floor((Date.now()-date.getTime())/1000);
  if (sec < 60)   return 'just now';
  if (sec < 3600) return Math.floor(sec/60)+'m ago';
  if (sec < 86400)return Math.floor(sec/3600)+'h ago';
  return Math.floor(sec/86400)+'d ago';
}
