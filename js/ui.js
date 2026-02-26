/* NAV */
var PG={game:'⚡ VICTOR COIN',shop:'🛒 SHOP',factory:'🏭 FACTORY',diamonds:'💎 DIAMONDS',daily:'🎁 DAILY',miner:'🤖 AUTO MINER',boosts:'⚡ BOOSTS',enigma:'🎭 ENIGMA',ach:'🏅 ACHIEVEMENTS',ranks:'🏆 RANKS',mall:'🛍️ MALL',stake:'📈 STAKE',servers:'🌐 SERVERS',player:'👤 PLAYER',about:'ℹ️ ABOUT',contact:'📞 CONTACT'};
function go(id,el){
  document.querySelectorAll('.sec').forEach(function(s){s.classList.remove('on');});
  document.querySelectorAll('.si').forEach(function(s){s.classList.remove('on');});
  var s=document.getElementById('pg-'+id);if(s)s.classList.add('on');
  if(el)el.classList.add('on');else{var si=document.getElementById('si-'+id);if(si)si.classList.add('on');}
  st('ntitle',PG[id]||'⚡ VICTOR COIN');
  closeSb();
  if(id==='ach')renderAch();
  if(id==='ranks')renderRanks();
  if(id==='mall'){if(typeof initMall!=='undefined')initMall();if(typeof renderMall!=='undefined')renderMall();setTimeout(function(){if(typeof renderMallCosmetics==='function')renderMallCosmetics();},100);}
  if(id==='stake'){if(typeof initStake!=='undefined')initStake();if(typeof renderStake!=='undefined')renderStake();}
  if(id==='player'){renderPlayerInfo();return;}
  if(id==='servers'){if(typeof renderServersPage==='function')renderServersPage();}
  if(id==='diamonds')updDia();
  if(id==='daily')updDaily();
  if(id==='miner')updMiner();
  if(id==='boosts')renderBoosts();
  if(id==='enigma')renderEnigma();
  if(id==='about'){if(typeof buildAboutPage==='function')buildAboutPage();}
  renderAll();
}
function togSb(){var sb=document.getElementById('sb'),ov=document.getElementById('sbov');var o=sb.classList.toggle('open');ov.classList.toggle('show',o);}
function closeSb(){document.getElementById('sb').classList.remove('open');document.getElementById('sbov').classList.remove('show');}

/* LOGIN */
function doLogin(){
  var n=(document.getElementById('lname').value||'').trim();
  var e=(document.getElementById('lemail').value||'').trim();
  if(!n||!e){toast('Fill in all fields','#ff3d5a');return;}
  if(!e.includes('@')){toast('Invalid email','#ff3d5a');return;}

  // Save data immediately
  G.logins++;
  if(!G.name)  G.name  = n;
  if(!G.email) G.email = e;
  sv();

  // Switch screens — no opacity games, just direct DOM swap
  var lp  = document.getElementById('lp');
  var app = document.getElementById('app');

  if(lp)  lp.style.display  = 'none';
  if(app) app.style.display = 'flex';

  // Boot the game
  try {
    initGame();
  } catch(err) {
    console.error('initGame error:', err);
    // Even if something fails, keep the app visible
  }
}

/* INIT */
var _aiv=null,_tabOk=true,_ss=0;
function initGame(){
  _ss=Date.now();
  checkOffline();
  renderAll();renderAch();renderRanks();updDaily();updMiner();
  renderBoosts();renderEnigma();applyProfilePic();injectStoreBtn();
  if(typeof initStatus==='function') initStatus();
  if(typeof initVault==='function') initVault();
  if(typeof initCosmetics==='function') initCosmetics();
  if(typeof initBadgesLocal==='function') initBadgesLocal();
  if(typeof initServers==='function') initServers();
  if(typeof initQuests==='function') initQuests();
  // Firebase
  if(typeof initFirebase==='function') initFirebase();
  if(typeof fbLoad==='function') fbLoad(G.email, function(){ renderAll(); });
  setTimeout(function(){
    if(typeof fbSetOnline==='function') fbSetOnline();
    if(typeof fbListenNotifications==='function') fbListenNotifications();
    if(!G.joinedAt){ G.joinedAt=Date.now(); sv(); }
    if(!G.settings) { G.settings={anonymous:false,notifications:true}; sv(); }
    if(!G.bio) G.bio='';
    if(typeof fbSave==='function') fbSave();
    if(typeof applyAllCosmetics==='function') applyAllCosmetics();
    if(typeof applyStatusDot==='function') applyStatusDot();
  }, 1500);
  if(typeof initExplore==='function') initExplore();
  var ei=document.getElementById('editName');if(ei)ei.value=G.name||'';
  startAuto();startTick();
  document.addEventListener('visibilitychange',function(){
    _tabOk=!document.hidden;if(_tabOk){G.lastActive=Date.now();sv();}
  });
}
function checkOffline(){
  if(G.bot&&G.lastActive){
    var diff=Math.floor((Date.now()-G.lastActive)/1000),elap=Math.min(diff,28800);
    if(elap>60){G.vk+=elap;sv();showBotPop(elap);return;}
  }
  G.lastActive=Date.now();sv();
}

/* HELPERS */
function getRk(){var c=G.vk,r=RK[0];for(var i=0;i<RK.length;i++)if(c>=RK[i].q)r=RK[i];return r;}
function getRkP(){
  var c=G.vk;
  for(var i=RK.length-1;i>=0;i--){
    if(c>=RK[i].q){
      if(i===RK.length-1)return{p:100,txt:'MAX RANK'};
      var p=Math.min(100,Math.floor((c-RK[i].q)/(RK[i+1].q-RK[i].q)*100));
      return{p:p,txt:fm(RK[i+1].q-c)+' VK to '+RK[i+1].n};
    }
  }
  return{p:0,txt:''};
}
function getAR(){
  var r=0;
  for(var i=0;i<G.tap.length;i++)if(G.tap[i])r+=TP[i].r;
  for(var i=0;i<G.fac.length;i++)if(G.fac[i].a)r+=FC[i].r;
  var now=Date.now();
  if(G.bs.vs.active&&now<G.bs.vs.endAt)r+=50;
  if(G.bs.gr.active&&now<G.bs.gr.endAt)r*=2;
  return r;
}
function getTapBonus(){
  var b=0,now=Date.now();
  if(G.en.bc.active)b+=2;
  if(G.bs.sr.active&&now<G.bs.sr.endAt)b+=5;
  if(G.en.xm.active&&now<G.en.xm.endAt)b+=0.1; // 10% extra handled in tap()
  return b;
}

/* RENDER ALL */
function renderAll(){
  var c=Math.floor(G.vk),d=Math.floor(G.dia);
  st('cd',fm(c));st('dd',fm(d));st('nvk',fm(c)+' VK');st('ndia',fm(d)+'💎');
  st('tapD',fm(G.taps));st('loginD',G.logins);st('mineD',fm(G.mined));
  var rk=getRk();st('rkname',rk.n);
  var rb=document.getElementById('rkbadge');if(rb)rb.textContent=rk.n.replace(/^\S+\s/,'');
  var rp=getRkP();var rf=document.getElementById('rkprog');if(rf)rf.style.width=rp.p+'%';
  st('rknext',rp.txt);
  var fr=0;for(var i=0;i<G.fac.length;i++)if(G.fac[i].a)fr+=FC[i].r;
  st('facRate','+'+fr+' VK/s');
  var ac=G.ach.filter(Boolean).length;
  st('achBadge',ac+'/30');st('achProg',ac+'/30');
  var ar=getAR();var ab=document.getElementById('arb');
  if(ar>0){ab.textContent='⚡ +'+ar+' VK/s auto';ab.classList.add('show');}else ab.classList.remove('show');
  renderShop();renderFac();
  // buffs card
  var now=Date.now(),lines=[];
  if(G.en.bc.active)lines.push('<span style="color:var(--green);">🛡️ Buff Control — ACTIVE (+2/tap)</span>');
  if(G.en.ce.active)lines.push('<span style="color:var(--teal);">🌌 Celestial — ACTIVE (mine=100💎)</span>');
  if(G.en.xm.active&&now<G.en.xm.endAt)lines.push('<span style="color:var(--purple);">🧲 XP Magnet — '+fmT(Math.ceil((G.en.xm.endAt-now)/1000))+' left</span>');
  BOOSTS.forEach(function(b){var bs=G.bs[b.id];if(bs&&bs.active&&now<bs.endAt)lines.push('<span style="color:var(--orange);">'+b.ico+' '+b.name+' — '+fmT(Math.ceil((bs.endAt-now)/1000))+' left</span>');});
  var bc=document.getElementById('buffCard'),bl=document.getElementById('buffList');
  if(lines.length>0){if(bc)bc.style.display='';if(bl)bl.innerHTML=lines.join('<br/>');}
  else{if(bc)bc.style.display='none';}
}

/* TAP */
function tap(ev){
  if(typeof questProgress==='function') questProgress('taps',1);
  var base=1+Math.floor(getTapBonus());
  if(G.en.xm.active&&Date.now()<G.en.xm.endAt)base=Math.floor(base*1.1)||1;
  G.vk+=base;G.taps++;
  var h=new Date().getHours();
  if(h===1&&!G.ach[13]){G.ach[13]=true;toast('🦉 Night Owl unlocked!','#ffd700');}
  checkAch();sv();renderAll();
  if(ev){
    var btn=document.getElementById('cbtn');
    var rp=document.createElement('span');rp.className='rip';var sz=btn.offsetWidth;rp.style.cssText='width:'+sz+'px;height:'+sz+'px;left:0;top:0;';
    btn.appendChild(rp);setTimeout(function(){rp.remove();},680);
    var fl=document.createElement('div');fl.className='tf';fl.textContent=(base>1?'+'+base:'+1');
    var rc=btn.getBoundingClientRect();fl.style.left=(rc.left+rc.width/2-14)+'px';fl.style.top=(rc.top+rc.height*.3)+'px';
    document.body.appendChild(fl);setTimeout(function(){fl.remove();},730);
  }
}

/* AUTO */
function startAuto(){
  clearInterval(_aiv);
  _aiv=setInterval(function(){
    if(!_tabOk)return;
    var r=getAR();
    var now=Date.now();
    var dr=G.bs.dr;if(dr.active&&now<dr.endAt&&now-dr.tick>=60000){G.dia+=2;dr.tick=now;}
    if(r>0){G.vk+=r;renderAll();checkAch();sv();}
  },1000);
}

/* TICK – expire boosts/enigma */
function startTick(){
  setInterval(function(){
    var now=Date.now(),ch=false;
    BOOSTS.forEach(function(b){var bs=G.bs[b.id];if(bs.active&&now>=bs.endAt){bs.active=false;ch=true;toast('⏰ '+b.name+' expired!','#ff7b35');}});
    if(G.en.xm.active&&now>=G.en.xm.endAt){G.en.xm.active=false;G.en.xm.cdEnd=now+50*3600000;ch=true;toast('🧲 XP Magnet expired! 50hr cooldown.','#b06aff');}
    if(ch){sv();renderAll();}
    renderBoosts();renderEnigma();applyProfilePic();injectStoreBtn();
    if(typeof tickExplore==='function') tickExplore();
  },1000);
}

/* SHOP */
function renderShop(){
  for(var i=0;i<TP.length;i++){
    var el=document.getElementById('sh'+i);if(!el)continue;
    if(G.tap[i]){el.classList.add('own');el.classList.remove('lk');el.querySelector('.shp').style.color='var(--green)';el.querySelector('.shp').textContent='✅ OWNED';continue;}
    var t=TP[i];var can=t.d>0?(G.dia>=t.d):(G.vk>=t.c);
    el.classList.toggle('lk',!can);el.classList.remove('own');
    el.querySelector('.shp').style.color='';
    el.querySelector('.shp').textContent=t.d>0?(fmf(t.d)+' 💎'):(fm(t.c)+' VK');
  }
  var ms=[document.getElementById('minerBtnShop'),document.getElementById('minerBtn')];
  ms.forEach(function(m){if(!m)return;m.disabled=G.bot||G.vk<500000;m.textContent=G.bot?'✅ BOT OWNED':'BUY AUTO MINER';});
}
function buyT(i){
  if(G.tap[i]){toast('Already owned','#ffd700');return;}
  var t=TP[i];
  if(t.d>0){if(G.dia<t.d){toast('Need '+fmf(t.d)+' 💎','#ff3d5a');return;}G.dia-=t.d;}
  else{if(G.vk<t.c){toast('Need '+fm(t.c)+' VK','#ff3d5a');return;}G.vk-=t.c;}
  G.tap[i]=true;toast(i>=8?'😈 Evil Tap unlocked!':'✅ Tapper purchased!',i>=8?'#b06aff':'#00e5a0');
  checkAch();sv();renderAll();startAuto();
}

/* FACTORY */
function renderFac(){
  for(var i=0;i<FC.length;i++){
    var f=G.fac[i];
    var card=document.getElementById('fc'+i),bb=document.getElementById('fb'+i),ba=document.getElementById('fa'+i),st2=document.getElementById('fs'+i);
    if(f.a){if(card)card.classList.add('fa');if(st2)st2.innerHTML='<span style="color:var(--green)">✅ Active — +'+FC[i].r+' VK/s</span>';}
    else if(f.b){if(card)card.classList.remove('fa');if(st2)st2.innerHTML='<span style="color:var(--gold)">Purchased — not active</span>';}
    else{if(card)card.classList.remove('fa');if(st2)st2.textContent='Not purchased';}
    if(bb){bb.textContent=f.b?'✅ Owned':'Buy ('+fm(FC[i].c)+'💎)';bb.disabled=f.b||G.dia<FC[i].c;}
    if(ba){ba.disabled=!f.b||f.a;ba.textContent=f.a?'✅ Active':'Activate';}
  }
}
function buyF(i){if(G.fac[i].b){toast('Already owned','#ffd700');return;}if(G.dia<FC[i].c){toast('Need '+fmf(FC[i].c)+' 💎','#ff3d5a');return;}G.dia-=FC[i].c;G.fac[i].b=true;toast('🏭 '+FC[i].n+' purchased!','#00e5a0');checkAch();sv();renderAll();renderFac();}
function actF(i){if(!G.fac[i].b){toast('Buy first','#ff3d5a');return;}if(G.fac[i].a)return;G.fac[i].a=true;toast('⚡ '+FC[i].n+' activated!','#00e5a0');checkAch();sv();renderAll();renderFac();startAuto();}

/* DIAMONDS */
function updDia(){
  st('mVK',fm(G.vk));st('mDia',fm(G.dia));
  [[500,100000],[2000,900000],[10000,8000000]].forEach(function(p,i){var el=document.getElementById('dp'+i);if(el)el.classList.toggle('dlk',G.dia<p[0]);});
  [[100000,100],[500000,300],[5000000,1000]].forEach(function(p,i){var el=document.getElementById('vd'+i);if(el)el.classList.toggle('dlk',G.vk<p[0]);});
}
function doMine(){
  if(G.vk<50000){toast('Need 50,000 VK','#ff3d5a');return;}
  G.vk-=50000;
  var rw=G.en.ce.active?100:DPOOL[Math.floor(Math.random()*DPOOL.length)];
  G.dia+=rw;G.mined+=rw;
  var r=document.getElementById('mres');if(r){r.textContent=(G.en.ce.active?'🌌 ':'')+'💎 Mined '+rw+' diamonds!';setTimeout(function(){r.textContent='';},3000);}
  toast('+'+rw+' 💎'+(G.en.ce.active?' (Celestial!)':''),'#4fc3f7');
  checkAch();sv();renderAll();updDia();
}
function buyDP(i){
  var P=[[500,100000],[2000,900000],[10000,8000000]];var d=P[i][0],v=P[i][1];
  if(G.dia<d){toast('Need '+d+' 💎','#ff3d5a');return;}
  G.dia-=d;G.vk+=v;G.planUsed=true;toast('💰 +'+fm(v)+' VK!','#ffd700');checkAch();sv();renderAll();updDia();
}
function buyVD(i){
  var P=[[100000,100],[500000,300],[5000000,1000]];var c=P[i][0],g=P[i][1];
  if(G.vk<c){toast('Need '+fm(c)+' VK','#ff3d5a');return;}
  G.vk-=c;G.dia+=g;G.planUsed=true;toast('💎 +'+g+'!','#4fc3f7');checkAch();sv();renderAll();updDia();
}

/* MINER */
function buyMiner(){if(G.bot){toast('Already owned','#ffd700');return;}if(G.vk<500000){toast('Need 500,000 VK','#ff3d5a');return;}G.vk-=500000;G.bot=true;G.lastActive=Date.now();toast('🤖 Auto Miner active!','#00e5a0');checkAch();sv();renderAll();updMiner();}
function updMiner(){
  var p=document.getElementById('minerPill');if(!p)return;
  if(G.bot){p.innerHTML='<div class="bpill">✅ Bot active and earning offline</div>';var b=document.getElementById('minerBtn');if(b){b.textContent='✅ BOT OWNED';b.disabled=true;}}
  else{p.innerHTML='<div style="font-size:.7rem;color:var(--red);font-family:inherit;">⚠️ NOT PURCHASED</div>';}
}
function showBotPop(earned){
  var ov=document.createElement('div');ov.className='mov';
  ov.innerHTML='<div class="mb"><span class="mico">🤖</span><div class="mttl">Your Bot Worked!</div><div class="mbdy">Offline earnings deposited!<br/><br/><span style="font-family:inherit;font-size:1.18rem;color:var(--gold);font-weight:900;">+'+fmf(earned)+' VK</span></div><div class="mbts"><button class="mok" onclick="this.closest(\'.mov\').remove()">AWESOME! ✨</button></div></div>';
  document.body.appendChild(ov);G.lastActive=Date.now();sv();
}

/* DAILY */
function updDaily(){
  var now=Date.now(),diff=now-(G.daily.last||0),wait=4*24*60*60*1000;
  var btn=document.getElementById('claimBtn'),lk=document.getElementById('dailyLk'),info=document.getElementById('dailyInfo');
  st('dailyCnt',G.dc||0);
  if(diff>=wait){if(btn)btn.disabled=false;if(lk)lk.textContent='';if(info)info.textContent='🎉 Ready to claim!';}
  else{if(btn)btn.disabled=true;var hrs=Math.ceil((wait-diff)/3600000);if(lk)lk.textContent='🔒 ~'+hrs+'h remaining';if(info)info.textContent='Come back soon!';}
}
function claimDaily(){
  if(Date.now()-(G.daily.last||0)<4*24*60*60*1000){toast('Not ready yet!','#ff3d5a');return;}
  G.dia++;G.daily.last=Date.now();G.dc=(G.dc||0)+1;G.daily.cnt=(G.daily.cnt||0)+1;
  toast('🎁 +1 💎 Daily reward!','#4fc3f7');checkAch();sv();renderAll();updDaily();
}

/* CASH OUT */
function renderCO(){
  st('coBal',fm(G.vk)+' VK');st('coRank','Rank: '+getRk().n);
  var g=document.getElementById('coGrid');if(!g)return;
  var h='';CO.forEach(function(o,i){
    var ok=G.vk>=o.q;
    h+='<div class="coc '+(ok?'':'clk')+'" onclick="tryCO('+i+')">'
      +'<div class="coa">'+o.l+'</div>'
      +'<div class="cor">'+fm(o.q)+' VK</div>'
      +'<div class="cos" style="color:'+(ok?'var(--green)':'var(--red)')+';">'+(ok?'✅ ELIGIBLE':'🔒 '+fm(o.q-G.vk)+' needed')+'</div>'
      +'</div>';
  });
  g.innerHTML=h;
}
function tryCO(i){
  var o=CO[i];if(G.vk<o.q){toast('Not enough VK','#ff3d5a');return;}
  var ov=document.createElement('div');ov.className='mov';
  ov.innerHTML='<div class="mb"><span class="mico">💸</span><div class="mttl">Cash Out '+o.l+'</div><div class="mbdy">📸 Screenshot your balance and send to <strong style="color:var(--gold);">VicBot</strong> on WhatsApp.<br/><br/>Balance: <span style="font-family:inherit;color:var(--gold);font-weight:900;">'+fm(G.vk)+' VK</span></div><button class="cpbtn" onclick="cpBal()">📋 Copy Balance</button><div class="mbts" style="margin-top:10px;"><a class="mok" href="https://wa.me/2348067630531" target="_blank" rel="noopener" style="text-decoration:none;">Open WhatsApp</a><button class="mcan" onclick="this.closest(\'.mov\').remove()">Cancel</button></div></div>';
  document.body.appendChild(ov);
}
function cpBal(){var t='Victor Coin: '+fm(G.vk)+' VK';if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){toast('✅ Copied!','#00e5a0');});else toast(t,'#00e5a0');}
/* PROFILE PIC */
function setProfilePic(input){
  if(!input.files||!input.files[0]) return;
  var reader=new FileReader();
  reader.onload=function(e){
    G.profilePic=e.target.result;
    sv();
    applyProfilePic();injectStoreBtn();
    toast('📷 Profile photo updated!','#30D158');
  };
  reader.readAsDataURL(input.files[0]);
}
function applyProfilePic(){
  var img=document.getElementById('playerAvatarImg');
  var emoji=document.getElementById('playerAvatarEmoji');
  if(!img||!emoji) return;
  if(G.profilePic){
    img.src=G.profilePic;
    img.style.display='block';
    emoji.style.display='none';
  } else {
    img.style.display='none';
    emoji.style.display='block';
  }
}

/* ── STORE BUTTON INJECT ── */
function injectStoreBtn(){
  if(document.getElementById('storeBtnWrap')) return;
  var gameSection=document.getElementById('pg-game');if(!gameSection) return;
  var wrap=document.createElement('div');wrap.id='storeBtnWrap';
  wrap.innerHTML='<div style="display:flex;justify-content:center;margin:12px 0 4px;">'
    +'<button onclick="openStore()" class="vcstore-trigger">🛍️&nbsp; Buy VK Coins</button></div>';
  var sbar=gameSection.querySelector('.sbar');
  if(sbar) gameSection.insertBefore(wrap,sbar); else gameSection.appendChild(wrap);
}

/* ── PLAYER INFO ── */
var _piEditMode=false;
function renderPI(){ renderPlayerInfo(); }
function renderPlayerInfo(){
  var el=document.getElementById('pg-player');if(!el) return;
  if(typeof initBadgesLocal==='function') initBadgesLocal();
  if(typeof initServers==='function') initServers();
  if(typeof initQuests==='function') initQuests();
  var myServer=typeof getPlayerServer==='function'?getPlayerServer():null;
  var pic=G.profilePic
    ?'<img src="'+G.profilePic+'" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>'
    :'<span style="font-size:2.8rem;">👤</span>';
  var badgePills=typeof renderBadgePills==='function'?renderBadgePills({badges:G.badges||[],name:G.name},5):'';
  var serverPill=myServer?'<span class="server-badge" style="border-color:'+myServer.color+'33;color:'+myServer.color+';">'+myServer.emoji+' '+myServer.name+'</span>':'';
  var scpStatus=typeof getScpStatus==='function'?getScpStatus():null;
  if(_piEditMode) renderEditProfile(el,pic,badgePills,serverPill);
  else renderViewProfile(el,pic,badgePills,serverPill,myServer,scpStatus);
  setTimeout(function(){if(typeof applyCosmetics==='function') applyCosmetics();},100);
}

function renderViewProfile(el,pic,badgePills,serverPill,myServer,scpStatus){
  var joined=G.joinedAt?new Date(G.joinedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Unknown';
  var victorBanner=typeof buildGetVictor==='function'?buildGetVictor():'';
  el.innerHTML='<div class="pi-wrap">'
    +'<div class="pi-banner"></div>'
    +'<div class="pi-av-row"><div class="pav-wrap" id="playerAvatarWrap">'+pic+'</div>'
    +'<div class="pi-av-status pi-online">🟢</div></div>'
    +'<div class="pi-name-row"><div class="pi-name">'+(G.name||'Player')+'</div>'
    +'<div class="pi-sub">'+(G.name||'victorvk').toLowerCase().replace(/\s/g,'')+'</div></div>'
    +(badgePills||serverPill?'<div class="pi-badges-row">'+badgePills+serverPill+'</div>':'')
    +(G.bio?'<div class="pi-bio"><span style="font-size:0.75rem;">💬</span> '+G.bio+'</div>':'')
    +'<button class="pi-edit-btn" onclick="toggleEditMode(true)">✏️ Edit Profile</button>'
    +victorBanner
    +'<div class="pi-stats-grid">'
    +piStat('🪙','VK Coins',fm(G.vk))
    +piStat('💎','Diamonds',G.dia)
    +piStat('🏆','Rank',typeof getRk==='function'?getRk().n:'—')
    +piStat('📅','Joined',joined)
    +piStat('👆','Total Taps',fm(G.taps||0))
    +piStat('🏠','Homes',G.build?G.build.homes.length:0)
    +piStat('🏅','Achievements',(G.ach||[]).filter(Boolean).length+'/69')
    +piStat('💫','SCP Balance',G.server?(G.server.scp||0)+' SCP':'—')
    +'</div>'
    +(myServer&&scpStatus?'<div class="pi-scp-row">'
      +(scpStatus.ready?'<button class="scp-btn scp-claim" onclick="claimScp();renderPlayerInfo()">💫 Collect SCP</button>'
        :'<button class="scp-btn scp-wait" disabled>⏳ SCP in '+scpStatus.h+'h '+scpStatus.m+'m</button>')
      +(G.server.scp>0?'<button class="scp-btn scp-exchange" onclick="exchangeScp();renderPlayerInfo()">Exchange → VK</button>':'')
      +'</div>':'')
    +'<div class="pi-section-title">📋 Weekly Quests</div>'
    +'<div id="questsBody"></div>'
    +'<div class="pi-section-title">🏛️ My Vault</div>'
    +'<div id="vaultBody"></div>'
    +'</div>';
  if(typeof renderQuestsSection==='function') renderQuestsSection();
  if(typeof renderVaultTab==='function') renderVaultTab();
}

function renderEditProfile(el,pic){
  el.innerHTML='<div class="pi-wrap">'
    +'<div class="pi-edit-hdr">'
    +'<button class="pi-back-btn" onclick="toggleEditMode(false)">← Back</button>'
    +'<div class="pi-edit-title">Edit Profile</div></div>'
    +'<div style="display:flex;justify-content:center;margin:16px 0;">'
    +'<div style="position:relative;display:inline-block;">'
    +'<div class="pav-wrap pav-large" id="playerAvatarWrap">'+pic+'</div>'
    +'<label class="pi-av-upload" for="piPicInput">📷</label>'
    +'<input type="file" id="piPicInput" accept="image/*" style="display:none;" onchange="setProfilePic(this)"/>'
    +'</div></div>'
    +'<div class="pi-field"><label class="pi-field-lbl">Display Name</label>'
    +'<input class="pi-field-inp" id="piNameInp" value="'+(G.name||'')+'" maxlength="24" placeholder="Your name"/></div>'
    +'<div class="pi-field"><label class="pi-field-lbl">Bio <span style="color:var(--text3);font-size:0.6rem;">(max 120 chars)</span></label>'
    +'<textarea class="pi-field-ta" id="piBioInp" maxlength="120" placeholder="Tell the world about yourself…">'+(G.bio||'')+'</textarea></div>'
    +'<div class="pi-field"><label class="pi-field-lbl">Active Cosmetics</label>'
    +(typeof buildEquippedCosmetics==='function'?buildEquippedCosmetics():'<div style="font-size:0.68rem;color:var(--text3);">Visit Mall to buy cosmetics</div>')
    +'</div>'
    +'<button class="pi-save-btn" onclick="saveProfile()">💾 Save Changes</button>'
    +'</div>';
  setTimeout(function(){if(typeof applyCosmetics==='function') applyCosmetics();},100);
}

function buildEquippedCosmetics(){
  if(typeof G.cosmetics==='undefined'||!G.cosmetics) return '<div style="font-size:0.68rem;color:var(--text3);">No cosmetics equipped. Buy from Mall!</div>';
  var parts=[];
  if(G.cosmetics.ring){var r=typeof COSMETIC_RINGS!=='undefined'?COSMETIC_RINGS.find(function(x){return x.id===G.cosmetics.ring;}):null;if(r)parts.push('<span class="cosm-tag">💍 '+r.name+' <span onclick="unequipCosmetic(\'ring\');renderPlayerInfo()">✕</span></span>');}
  if(G.cosmetics.frame){var f=typeof COSMETIC_FRAMES!=='undefined'?COSMETIC_FRAMES.find(function(x){return x.id===G.cosmetics.frame;}):null;if(f)parts.push('<span class="cosm-tag">🖼️ '+f.name+' <span onclick="unequipCosmetic(\'frame\');renderPlayerInfo()">✕</span></span>');}
  if(G.cosmetics.orbiter){var o=typeof COSMETIC_ORBITERS!=='undefined'?COSMETIC_ORBITERS.find(function(x){return x.id===G.cosmetics.orbiter;}):null;if(o)parts.push('<span class="cosm-tag">✨ '+o.name+' <span onclick="unequipCosmetic(\'orbiter\');renderPlayerInfo()">✕</span></span>');}
  return parts.length?'<div class="cosm-tags-row">'+parts.join('')+'</div>':'<div style="font-size:0.68rem;color:var(--text3);">No cosmetics equipped. <span style="color:var(--gold);cursor:pointer;" onclick="go(\'mall\',null)">Visit Mall →</span></div>';
}
function toggleEditMode(on){_piEditMode=!!on;renderPlayerInfo();}
function saveProfile(){
  var name=(document.getElementById('piNameInp')||{}).value||'';
  var bio=(document.getElementById('piBioInp')||{}).value||'';
  if(!name.trim()){toast('Name cannot be empty','#FF453A');return;}
  G.name=name.trim().slice(0,24);G.bio=bio.trim().slice(0,120);
  G.bioChanges=(G.bioChanges||0)+1;
  sv();if(typeof fbSave==='function') fbSave();
  toast('✅ Profile saved!','#30D158');_piEditMode=false;renderPlayerInfo();
  if(typeof questProgress==='function') questProgress('bio',1);
}
function initBadgesLocal(){if(!G.badges)G.badges=[];if(typeof checkBadges==='function')checkBadges();}
function piStat(ico,label,val){
  return '<div class="pi-stat"><div class="pi-stat-ico">'+ico+'</div><div class="pi-stat-l">'+label+'</div><div class="pi-stat-v">'+val+'</div></div>';
}

/* ── MINI PROFILE POPUP ── */
function showMiniProfile(playerData) {
  var ex = document.getElementById('miniProfileOv');
  if (ex) ex.remove();

  var pic = playerData.profilePic
    ? '<img src="'+playerData.profilePic+'" alt=""/>'
    : '<span>👤</span>';
  var name = playerData.name || 'Player';
  var bio  = playerData.bio  || '';
  var badges  = (typeof renderBadgePills==='function') ? renderBadgePills(playerData,4) : '';
  var server  = playerData.server && typeof serverBadgePill==='function' ? serverBadgePill(playerData.server) : '';
  var ntClass = playerData.vault&&playerData.vault.active&&playerData.vault.active.nametemplate
    ? (typeof NAME_TEMPLATES!=='undefined'
      ? (NAME_TEMPLATES.find(function(x){return x.id===playerData.vault.active.nametemplate;})||{cssClass:''}).cssClass
      : '') : '';

  var ov = document.createElement('div');
  ov.id = 'miniProfileOv';
  ov.className = 'mini-profile-ov';
  ov.innerHTML = '<div class="mini-profile-card">'
    + '<div class="mini-profile-banner"></div>'
    + '<div class="mini-profile-av-row">'
    + '<div class="mini-profile-av">'+(playerData.profilePic?'<img src="'+playerData.profilePic+'"/>':'<span style="font-size:1.6rem;">👤</span>')+'</div>'
    + (typeof statusDotHTML==='function'?'<div style="margin-bottom:6px;">'+statusDotHTML(playerData.status||'online')+'</div>':'')
    + '</div>'
    + '<div class="mini-profile-info">'
    + '<div class="mini-profile-name '+(ntClass?'nt-inline '+ntClass:'')+'">'+escSafe(name)+'</div>'
    + '<div class="mini-profile-badges">'+badges+server+'</div>'
    + (bio?'<div class="mini-profile-bio">💬 '+escSafe(bio)+'</div>':'')
    + '<div class="mini-profile-btns">'
    + '<button class="mini-profile-btn mini-btn-full" onclick="openFullProfile('+JSON.stringify(playerData)+');document.getElementById(\'miniProfileOv\').remove()">See Full Profile</button>'
    + '<button class="mini-profile-btn mini-btn-close" onclick="document.getElementById(\'miniProfileOv\').remove()">Close</button>'
    + '</div>'
    + '</div>'
    + '</div>';

  ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
  document.body.appendChild(ov);
}

function escSafe(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── ABOUT PAGE — INFO SECTIONS ── */
var _infoOpen = {};
function buildAboutPage() {
  var el = document.getElementById('pg-about');
  if (!el) return;

  var sections = [
    { key:'game', ico:'🎮', title:'How to Play',
      body:'<strong>Tap</strong> the main coin button to earn VK coins. The more you tap, the more you earn.<br/><br/><strong>VK Coins</strong> are the main currency — use them to buy upgrades in the Shop, unlock Boosts, explore maps, and more.<br/><br/><strong>Diamonds</strong> are the premium currency earned by mining, daily rewards, and weekly quests.' },
    { key:'shop', ico:'🛒', title:'Shop & Factory',
      body:'The <strong>Shop</strong> lets you buy Tappers — passive tools that add VK per tap automatically.<br/><br/>The <strong>Factory</strong> uses Diamonds to buy industries that generate VK every second without any tapping required.' },
    { key:'mall', ico:'🛍️', title:'Victor Mall',
      body:'The <strong>Mall</strong> opens from <strong>7:00 AM to 11:00 PM</strong> daily.<br/><br/>Buy <strong>Tap Boosters</strong> for temporary tap bonuses, <strong>Fonts</strong> for your name, <strong>Profile Particles</strong> that float on your profile, animated <strong>Cosmetic Rings & Frames</strong>, and <strong>Name Templates</strong> that display in chat and friends lists.<br/><br/>All Mall purchases go to your <strong>Vault</strong> — activate them anytime.' },
    { key:'explore', ico:'🗺️', title:'Exploration',
      body:'Visit <strong>Explore</strong> to travel across 5 unique Victor maps. Each location rewards you with artifacts and coins.<br/><br/>Artifacts are stored in your Vault and can be used to unlock hidden bonuses. Explore enough to earn the <strong>Vic.player</strong> badge.' },
    { key:'stake', ico:'📈', title:'Staking',
      body:'<strong>Victor Stake</strong> is a forex-style risk game. Place VK or Diamonds on BUY or SELL positions.<br/><br/>Results arrive in <strong>1–4 hours</strong>. Win chance is low — stake carefully. Your full history of wins and losses is always shown.' },
    { key:'social', ico:'🌐', title:'Social & Friends',
      body:'Chat in <strong>Victor Chat</strong>, search for players, send gifts, and build your friends list up to 50 players.<br/><br/><strong>Badges</strong> are earned automatically when you meet criteria — they appear beside your name on your profile.<br/><br/>Your <strong>Online Status</strong> (Online/Idle/DND/Invisible) is shown on your avatar.' },
    { key:'servers', ico:'🌐', title:'Victor Servers',
      body:'Join one of three servers — <strong>💓 FATE</strong>, <strong>🗡️ CSM</strong>, or <strong>♠️ LOTM</strong>.<br/><br/>Servers generate <strong>+1 SCP every 4 hours</strong>. Exchange SCP for VK coins at <strong>1 SCP = 200 VK</strong>.<br/><br/>Your server badge appears beside your name on your profile.' },
    { key:'cosmetics', ico:'✨', title:'Cosmetics & Vault',
      body:'Everything you buy in the Mall lands in your <strong>Vault</strong> inside Player Info.<br/><br/>You can only have <strong>one of each type active</strong> at a time — one ring, one frame, one orbiter, one font, one particle, one name template.<br/><br/>Deactivate anytime for free.' }
  ];

  var h = '<div style="padding:0 0 30px;">';
  sections.forEach(function(s) {
    var open = _infoOpen[s.key] !== false;
    h += '<div class="info-section">'
      + '<div class="info-sec-hdr" onclick="toggleInfoSec(\''+s.key+'\')">'
      + '<span class="info-sec-ico">'+s.ico+'</span>'
      + '<span class="info-sec-name">'+s.title+'</span>'
      + '<span class="info-sec-arr'+(open?' open':'')+'">›</span>'
      + '</div>'
      + (open ? '<div class="info-sec-body">'+s.body+'</div>' : '')
      + '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

function toggleInfoSec(key) {
  _infoOpen[key] = _infoOpen[key] === false ? true : false;
  buildAboutPage();
}
