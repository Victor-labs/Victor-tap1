/* ═══════════════════════════════════════════════════
   VICTOR COIN — State v10
   Single source of truth for ALL G fields
═══════════════════════════════════════════════════ */
var KEY='vcg_v10';

var G={
  /* Core */
  vk:0, dia:0, taps:0, mined:0, logins:0,
  bot:false, lastActive:null, planUsed:false, boosted:0,
  name:'', email:'',

  /* Arrays */
  tap:[false,false,false,false,false,false,false,false,false,false],
  fac:[{b:false,a:false},{b:false,a:false},{b:false,a:false}],
  ach:new Array(70).fill(false),

  /* Daily */
  daily:{last:0,cnt:0}, dc:0,

  /* Boosts */
  bs:{
    sr:{owned:false,active:false,endAt:0},
    dr:{owned:false,active:false,endAt:0,tick:0},
    vs:{owned:false,active:false,endAt:0},
    gr:{owned:false,active:false,endAt:0}
  },

  /* Enigma — also aliased as enig for legacy code */
  en:{
    bc:{unlocked:false,active:false},
    ce:{unlocked:false,active:false},
    xm:{unlocked:false,active:false,endAt:0,cdEnd:0}
  },

  /* Explore */
  ex:{
    locVisits:[0,0,0,0,0],
    totalExplores:0,
    vault:[],
    energy:100,
    lastEnergyTime:0
  },

  /* Build */
  build:{homes:[],upgrades:0,wasRobbed:false},

  /* Stake */
  stake:{wins:0,losses:0,totalStaked:0,active:[]},

  /* Server */
  server:{id:null,scp:0,lastClaim:0},

  /* Social */
  friendCount:0, giftCount:0, lbViews:0, likes:0, likedProfiles:[], likesGiven:0,

  /* Profile */
  profilePic:null, bio:'', joinedAt:0, bioChanges:0,

  /* Settings */
  settings:{anonymous:false,notifications:true},

  /* Cosmetics */
  cosmetics:{ring:null,frame:null,orbiter:null},

  /* Vault (Mall purchases) */
  vault:{items:[],active:{font:null,particle:null,nametemplate:null}},

  /* Mall runtime state */
  mall:{boughtAll:false,activeTaps:{}},

  /* Badges */
  badges:[],

  /* Status */
  status:'online',

  /* Games */
  gameStreak20:false, playedSquid:false, squidWin5:false, gameMins:0, gameStartTs:0
};

/* ── SAFE SAVE ── */
function sv(){
  try{localStorage.setItem(KEY,JSON.stringify(G));}catch(e){}
  if(typeof fbSave==='function'&&G&&G.email) setTimeout(fbSave,0);
}

/* ── LOAD & MERGE ── */
function ld(){
  try{
    /* Migrate old keys */
    ['vcg_v5','vcg_v6','vcg_v7','vcg_v8','vcg_v9'].forEach(function(k){
      try{
        var old=localStorage.getItem(k);
        if(old&&!localStorage.getItem(KEY)){
          var p=JSON.parse(old);
          if(p.name&&p.email){
            localStorage.setItem(KEY,JSON.stringify(p));
          }
        }
      }catch(e){}
    });

    var raw=localStorage.getItem(KEY);
    if(!raw) return false;
    var p=JSON.parse(raw);

    /* Core */
    G.vk=p.vk||0; G.dia=p.dia||0; G.taps=p.taps||0; G.mined=p.mined||0;
    G.logins=p.logins||0; G.bot=p.bot||false; G.lastActive=p.lastActive||null;
    G.planUsed=p.planUsed||false; G.boosted=p.boosted||0;
    G.name=p.name||''; G.email=p.email||'';

    /* Arrays */
    if(p.tap&&p.tap.length===10) G.tap=p.tap;
    if(p.fac&&p.fac.length===3)  G.fac=p.fac;
    if(p.ach&&p.ach.length>=30)  G.ach=p.ach;

    /* Daily */
    if(p.daily) G.daily=p.daily;
    G.dc=p.dc||0;

    /* Boosts */
    if(p.bs){
      if(p.bs.sr) G.bs.sr=p.bs.sr;
      if(p.bs.dr) G.bs.dr=p.bs.dr;
      if(p.bs.vs) G.bs.vs=p.bs.vs;
      if(p.bs.gr) G.bs.gr=p.bs.gr;
    }

    /* Enigma */
    if(p.en){
      if(p.en.bc) G.en.bc=p.en.bc;
      if(p.en.ce) G.en.ce=p.en.ce;
      if(p.en.xm) G.en.xm=p.en.xm;
    }

    /* Explore */
    if(p.ex){
      G.ex.locVisits=p.ex.locVisits||[0,0,0,0,0];
      G.ex.totalExplores=p.ex.totalExplores||0;
      G.ex.vault=p.ex.vault||[];
      G.ex.energy=p.ex.energy!=null?p.ex.energy:100;
      G.ex.lastEnergyTime=p.ex.lastEnergyTime||0;
    }

    /* Build */
    if(p.build){
      G.build.homes=p.build.homes||[];
      G.build.upgrades=p.build.upgrades||0;
      G.build.wasRobbed=p.build.wasRobbed||false;
    }

    /* Stake */
    if(p.stake){
      G.stake.wins=p.stake.wins||0;
      G.stake.losses=p.stake.losses||0;
      G.stake.totalStaked=p.stake.totalStaked||0;
      G.stake.active=p.stake.active||[];
    }

    /* Server */
    if(p.server){
      G.server.id=p.server.id||null;
      G.server.scp=p.server.scp||0;
      G.server.lastClaim=p.server.lastClaim||0;
    }

    /* Social */
    G.friendCount=p.friendCount||0;
    G.giftCount=p.giftCount||0;
    G.lbViews=p.lbViews||0;
    G.likes=p.likes||0;

    /* Profile */
    if(p.profilePic) G.profilePic=p.profilePic;
    G.bio=p.bio||'';
    G.joinedAt=p.joinedAt||Date.now();
    G.bioChanges=p.bioChanges||0;

    /* Settings */
    if(p.settings) G.settings=p.settings;

    /* Cosmetics */
    if(p.cosmetics) G.cosmetics=p.cosmetics;

    /* Vault */
    if(p.vault){
      G.vault.items=p.vault.items||[];
      G.vault.active=p.vault.active||{font:null,particle:null,nametemplate:null};
    }

    /* Mall */
    if(p.mall){
      G.mall.boughtAll=p.mall.boughtAll||false;
      G.mall.activeTaps=p.mall.activeTaps||{};
    }

    /* Badges */
    G.badges=p.badges||[];

    /* Status */
    G.status=p.status||'online';

    return !!(G.name&&G.email);
  }catch(e){
    console.error('ld() error:',e);
    return false;
  }
}

/* ── HELPERS ── */
function fm(n){
  n=Math.floor(n||0);
  if(n>=1e12)return(n/1e12).toFixed(2)+'T';
  if(n>=1e9)return(n/1e9).toFixed(2)+'B';
  if(n>=1e6)return(n/1e6).toFixed(2)+'M';
  if(n>=1000)return(n/1000).toFixed(1)+'K';
  return ''+n;
}
function fmf(n){return Math.floor(n||0).toLocaleString();}
function fmT(s){
  s=Math.floor(s);
  if(s>=3600) return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m';
  if(s>=60)   return Math.floor(s/60)+'m '+s%60+'s';
  return s+'s';
}
function st(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function sth(id,v){var e=document.getElementById(id);if(e)e.innerHTML=v;}
