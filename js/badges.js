/* ═══════════════════════════════════════════════════
   VICTOR COIN — Badges System
   Auto-awarded based on conditions
   Appear beside player name like Discord roles
   YOU can add more badges to BADGE_DEFS easily
═══════════════════════════════════════════════════ */

/* ── ADD YOUR BADGES HERE ──
   id:        unique key
   name:      display name (shown on tap)
   emoji:     icon shown beside name
   desc:      tooltip description
   color:     badge pill color
   condition: function(G) → true/false to auto-award
   manual:    true = only you can award it (e.g. OG)
*/
var BADGE_DEFS = [
  {
    id:'og',       name:'OG',        emoji:'🌟',
    desc:'One of the first 100 players',
    color:'#FFD60A', manual:true
  },
  {
    id:'veteran',  name:'Veteran',   emoji:'⚔️',
    desc:'Reached Veteran rank',
    color:'#5AC8FA',
    condition:function(g){return g.vk>=50000;}
  },
  {
    id:'explorer', name:'Explorer',  emoji:'🗺️',
    desc:'Explored all 5 map locations',
    color:'#30D158',
    condition:function(g){return g.ex&&g.ex.locVisits&&g.ex.locVisits.every(function(v){return v>=1;});}
  },
  {
    id:'rich',     name:'Rich',      emoji:'💰',
    desc:'Earned 10 million VK',
    color:'#FF9F0A',
    condition:function(g){return g.vk>=10000000;}
  },
  {
    id:'social',   name:'Social',    emoji:'👥',
    desc:'Has 20 or more friends',
    color:'#BF5AF2',
    condition:function(g){return g.friendCount&&g.friendCount>=20;}
  },
  /* ── ADD MORE BADGES BELOW ── */
  {
    id:'staker',   name:'Staker',    emoji:'📈',
    desc:'Placed 5 stakes',
    color:'#FF453A',
    condition:function(g){return g.stake&&(g.stake.wins+g.stake.losses)>=5;}
  },
  {
    id:'builder',  name:'Builder',   emoji:'🏗️',
    desc:'Owns a home',
    color:'#CD7F32',
    condition:function(g){return g.build&&g.build.homes&&g.build.homes.length>=1;}
  },
  {
    id:'collector',name:'Collector', emoji:'🏛️',
    desc:'Has 3+ artifacts in vault',
    color:'#64D2FF',
    condition:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=3;}
  }
];

/* ── INIT ── */
function initBadges(){
  if(!G.badges) G.badges=[];
}

/* ── CHECK & AUTO-AWARD BADGES ── */
function checkBadges(){
  initBadges();
  var changed=false;
  BADGE_DEFS.forEach(function(b){
    if(b.manual) return;
    if(G.badges.indexOf(b.id)===-1&&b.condition&&b.condition(G)){
      G.badges.push(b.id);
      changed=true;
      showBadgeUnlock(b);
    }
  });
  if(changed){ sv(); if(typeof fbSave==='function') fbSave(); }
}

function showBadgeUnlock(badge){
  var ov=document.createElement('div');
  ov.className='ach-notif';
  ov.innerHTML='<div class="ach-notif-inner">'
    +'<span style="font-size:1.5rem;">'+badge.emoji+'</span>'
    +'<div style="flex:1">'
    +'<div style="font-size:0.55rem;color:'+badge.color+';letter-spacing:1.5px;font-weight:700;">🏷️ BADGE EARNED</div>'
    +'<div style="font-size:0.75rem;font-weight:700;margin-top:1px;">'+badge.name+'</div>'
    +'<div style="font-size:0.6rem;color:var(--text3);">'+badge.desc+'</div>'
    +'</div></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ov.classList.add('ach-notif-out');setTimeout(function(){ov.remove();},500);},3800);
}

/* ── RENDER BADGE PILLS (beside name) ── */
function renderBadgePills(playerData, maxShow){
  maxShow=maxShow||3;
  var bids=playerData.badges||[];
  if(!bids.length) return '';
  var shown=bids.slice(0,maxShow);
  var more=bids.length-maxShow;
  return shown.map(function(bid){
    var b=BADGE_DEFS.find(function(d){return d.id===bid;})||{emoji:'🏷️',name:bid,color:'#888'};
    return '<span class="badge-pill" style="border-color:'+b.color+'22;color:'+b.color+';" '
      +'onclick="showBadgeInfo(\''+bid+'\')" >'+b.emoji+' '+b.name+'</span>';
  }).join('')+(more>0?'<span class="badge-pill" style="color:var(--text3);">+'+more+'</span>':'');
}

function showBadgeInfo(bid){
  var b=BADGE_DEFS.find(function(d){return d.id===bid;});
  if(!b) return;
  toast(b.emoji+' '+b.name+' — '+b.desc, b.color||'#FFD60A');
}

/* ── SOCIAL TAB: Badges section ── */
function renderBadgesTab(body){
  initBadges();
  checkBadges();
  var myBadges=G.badges||[];

  var h='<div style="padding:16px;">'
    +'<div class="soc-sec-title">🏷️ Your Badges</div>'
    +'<div class="soc-sec-sub">Tap a badge another player owns to see its name.</div>'
    +'<div class="badges-grid">';

  BADGE_DEFS.forEach(function(b){
    var owned=myBadges.indexOf(b.id)!==-1;
    h+='<div class="badge-card '+(owned?'badge-card-own':'badge-card-locked-glass')+'" style="border-color:'+(owned?b.color+'55':'rgba(255,255,255,0.07)')+'">'
      // Gold particles canvas (decorative, only on locked)
      +(owned?'':'<div class="badge-gold-particles" id="bgp_'+b.id+'"></div>')
      +'<div class="badge-card-ico" style="opacity:'+(owned?'1':'0.35')+';">'+b.emoji+'</div>'
      +'<div class="badge-card-name" style="color:'+(owned?b.color:'rgba(255,255,255,0.25)')+'">'+b.name+'</div>'
      +'<div class="badge-card-desc" style="opacity:'+(owned?'1':'0.2')+'">'+b.desc+'</div>'
      +(owned
        ?'<div class="badge-checkmark">✓</div>'
        :'<div class="badge-card-locked">🔒</div>')
      +(b.manual&&!owned?'<div style="font-size:0.52rem;color:rgba(255,255,255,0.2);margin-top:2px;">Admin awarded</div>':'')
      +'</div>';
  });

  h+='</div>'
    +'<div style="font-size:0.62rem;color:var(--text3);text-align:center;margin-top:16px;line-height:1.8;">'
    +'Badges auto-unlock when you meet their criteria.<br/>They appear beside your name on your profile.</div>'
    +'</div>';

  body.innerHTML=h;
  // Animate gold particles on locked badges
  setTimeout(function(){
    BADGE_DEFS.forEach(function(b){
      if(myBadges.indexOf(b.id)===-1) animateBadgeParticles('bgp_'+b.id);
    });
  },100);
}

function animateBadgeParticles(containerId){
  var el=document.getElementById(containerId);
  if(!el) return;
  // Create 6 floating gold dots
  for(var i=0;i<6;i++){
    var dot=document.createElement('div');
    dot.className='badge-gold-dot';
    dot.style.left=Math.random()*100+'%';
    dot.style.animationDelay=(Math.random()*3)+'s';
    dot.style.animationDuration=(2+Math.random()*2)+'s';
    dot.style.opacity=0.3+Math.random()*0.4;
    el.appendChild(dot);
  }
}
/* ═══════════════════════════════════════════════════
   VICTOR COIN — Badges System
   Auto-awarded based on conditions
   Appear beside player name like Discord roles
   YOU can add more badges to BADGE_DEFS easily
═══════════════════════════════════════════════════ */

/* ── ADD YOUR BADGES HERE ──
   id:        unique key
   name:      display name (shown on tap)
   emoji:     icon shown beside name
   desc:      tooltip description
   color:     badge pill color
   condition: function(G) → true/false to auto-award
   manual:    true = only you can award it (e.g. OG)
*/
var BADGE_DEFS = [
  {
    id:'og',       name:'OG',        emoji:'🌟',
    desc:'One of the first 100 players',
    color:'#FFD60A', manual:true
  },
  {
    id:'veteran',  name:'Veteran',   emoji:'⚔️',
    desc:'Reached Veteran rank',
    color:'#5AC8FA',
    condition:function(g){return g.vk>=50000;}
  },
  {
    id:'explorer', name:'Explorer',  emoji:'🗺️',
    desc:'Explored all 5 map locations',
    color:'#30D158',
    condition:function(g){return g.ex&&g.ex.locVisits&&g.ex.locVisits.every(function(v){return v>=1;});}
  },
  {
    id:'rich',     name:'Rich',      emoji:'💰',
    desc:'Earned 10 million VK',
    color:'#FF9F0A',
    condition:function(g){return g.vk>=10000000;}
  },
  {
    id:'social',   name:'Social',    emoji:'👥',
    desc:'Has 20 or more friends',
    color:'#BF5AF2',
    condition:function(g){return g.friendCount&&g.friendCount>=20;}
  },
  /* ── ADD MORE BADGES BELOW ── */
  {
    id:'staker',   name:'Staker',    emoji:'📈',
    desc:'Placed 5 stakes',
    color:'#FF453A',
    condition:function(g){return g.stake&&(g.stake.wins+g.stake.losses)>=5;}
  },
  {
    id:'builder',  name:'Builder',   emoji:'🏗️',
    desc:'Owns a home',
    color:'#CD7F32',
    condition:function(g){return g.build&&g.build.homes&&g.build.homes.length>=1;}
  },
  {
    id:'collector',name:'Collector', emoji:'🏛️',
    desc:'Has 3+ artifacts in vault',
    color:'#64D2FF',
    condition:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=3;}
  }
];

/* ── INIT ── */
function initBadges(){
  if(!G.badges) G.badges=[];
}

/* ── CHECK & AUTO-AWARD BADGES ── */
function checkBadges(){
  initBadges();
  var changed=false;
  BADGE_DEFS.forEach(function(b){
    if(b.manual) return;
    if(G.badges.indexOf(b.id)===-1&&b.condition&&b.condition(G)){
      G.badges.push(b.id);
      changed=true;
      showBadgeUnlock(b);
    }
  });
  if(changed){ sv(); if(typeof fbSave==='function') fbSave(); }
}

function showBadgeUnlock(badge){
  var ov=document.createElement('div');
  ov.className='ach-notif';
  ov.innerHTML='<div class="ach-notif-inner">'
    +'<span style="font-size:1.5rem;">'+badge.emoji+'</span>'
    +'<div style="flex:1">'
    +'<div style="font-size:0.55rem;color:'+badge.color+';letter-spacing:1.5px;font-weight:700;">🏷️ BADGE EARNED</div>'
    +'<div style="font-size:0.75rem;font-weight:700;margin-top:1px;">'+badge.name+'</div>'
    +'<div style="font-size:0.6rem;color:var(--text3);">'+badge.desc+'</div>'
    +'</div></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ov.classList.add('ach-notif-out');setTimeout(function(){ov.remove();},500);},3800);
}

/* ── RENDER BADGE PILLS (beside name) ── */
function renderBadgePills(playerData, maxShow){
  maxShow=maxShow||3;
  var bids=playerData.badges||[];
  if(!bids.length) return '';
  var shown=bids.slice(0,maxShow);
  var more=bids.length-maxShow;
  return shown.map(function(bid){
    var b=BADGE_DEFS.find(function(d){return d.id===bid;})||{emoji:'🏷️',name:bid,color:'#888'};
    return '<span class="badge-pill" style="border-color:'+b.color+'22;color:'+b.color+';" '
      +'onclick="showBadgeInfo(\''+bid+'\')" >'+b.emoji+' '+b.name+'</span>';
  }).join('')+(more>0?'<span class="badge-pill" style="color:var(--text3);">+'+more+'</span>':'');
}

function showBadgeInfo(bid){
  var b=BADGE_DEFS.find(function(d){return d.id===bid;});
  if(!b) return;
  toast(b.emoji+' '+b.name+' — '+b.desc, b.color||'#FFD60A');
}

/* ── SOCIAL TAB: Badges section ── */
function renderBadgesTab(body){
  initBadges();
  checkBadges();
  var myBadges=G.badges||[];

  var h='<div style="padding:16px;">'
    +'<div class="soc-sec-title">🏷️ Your Badges</div>'
    +'<div class="soc-sec-sub">Tap a badge another player owns to see its name.</div>'
    +'<div class="badges-grid">';

  BADGE_DEFS.forEach(function(b){
    var owned=myBadges.indexOf(b.id)!==-1;
    h+='<div class="badge-card '+(owned?'badge-card-own':'badge-card-locked-glass')+'" style="border-color:'+(owned?b.color+'55':'rgba(255,255,255,0.07)')+'">'
      // Gold particles canvas (decorative, only on locked)
      +(owned?'':'<div class="badge-gold-particles" id="bgp_'+b.id+'"></div>')
      +'<div class="badge-card-ico" style="opacity:'+(owned?'1':'0.35')+';">'+b.emoji+'</div>'
      +'<div class="badge-card-name" style="color:'+(owned?b.color:'rgba(255,255,255,0.25)')+'">'+b.name+'</div>'
      +'<div class="badge-card-desc" style="opacity:'+(owned?'1':'0.2')+'">'+b.desc+'</div>'
      +(owned
        ?'<div class="badge-checkmark">✓</div>'
        :'<div class="badge-card-locked">🔒</div>')
      +(b.manual&&!owned?'<div style="font-size:0.52rem;color:rgba(255,255,255,0.2);margin-top:2px;">Admin awarded</div>':'')
      +'</div>';
  });

  h+='</div>'
    +'<div style="font-size:0.62rem;color:var(--text3);text-align:center;margin-top:16px;line-height:1.8;">'
    +'Badges auto-unlock when you meet their criteria.<br/>They appear beside your name on your profile.</div>'
    +'</div>';

  body.innerHTML=h;
  // Animate gold particles on locked badges
  setTimeout(function(){
    BADGE_DEFS.forEach(function(b){
      if(myBadges.indexOf(b.id)===-1) animateBadgeParticles('bgp_'+b.id);
    });
  },100);
}

function animateBadgeParticles(containerId){
  var el=document.getElementById(containerId);
  if(!el) return;
  // Create 6 floating gold dots
  for(var i=0;i<6;i++){
    var dot=document.createElement('div');
    dot.className='badge-gold-dot';
    dot.style.left=Math.random()*100+'%';
    dot.style.animationDelay=(Math.random()*3)+'s';
    dot.style.animationDuration=(2+Math.random()*2)+'s';
    dot.style.opacity=0.3+Math.random()*0.4;
    el.appendChild(dot);
  }
}

