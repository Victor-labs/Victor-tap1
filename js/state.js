/* STATE */
var KEY='vcg_v9';
var G={
  vk:0,dia:0,taps:0,mined:0,logins:0,bot:false,lastActive:null,planUsed:false,boosted:0,name:'',email:'',
  tap:[false,false,false,false,false,false,false,false,false,false],
  fac:[{b:false,a:false},{b:false,a:false},{b:false,a:false}],
  ach:new Array(40).fill(false),
  daily:{last:0,cnt:0},dc:0,
  bs:{sr:{owned:false,active:false,endAt:0},dr:{owned:false,active:false,endAt:0,tick:0},vs:{owned:false,active:false,endAt:0},gr:{owned:false,active:false,endAt:0}},
  en:{
    bc:{unlocked:false,active:false},
    ce:{unlocked:false,active:false},
    xm:{unlocked:false,active:false,endAt:0,cdEnd:0}
  }
};

function sv(){try{localStorage.setItem(KEY,JSON.stringify(G));}catch(e){}}
function ld(){
  try{
    var raw=localStorage.getItem(KEY);if(!raw)return false;
    var p=JSON.parse(raw);
    // merge safely
    G.vk=p.vk||0;G.dia=p.dia||0;G.taps=p.taps||0;G.mined=p.mined||0;
    G.logins=p.logins||0;G.bot=p.bot||false;G.lastActive=p.lastActive||null;
    G.planUsed=p.planUsed||false;G.boosted=p.boosted||0;
    G.name=p.name||'';G.email=p.email||'';
    if(p.tap&&p.tap.length===10)G.tap=p.tap;
    if(p.fac&&p.fac.length===3)G.fac=p.fac;
    if(p.ach&&p.ach.length>=30)G.ach=p.ach;
    if(p.daily)G.daily=p.daily;
    G.dc=p.dc||0;
    if(p.bs){
      if(p.bs.sr)G.bs.sr=p.bs.sr;if(p.bs.dr)G.bs.dr=p.bs.dr;
      if(p.bs.vs)G.bs.vs=p.bs.vs;if(p.bs.gr)G.bs.gr=p.bs.gr;
    }
    if(p.en){
      if(p.en.bc)G.en.bc=p.en.bc;if(p.en.ce)G.en.ce=p.en.ce;
      if(p.en.xm)G.en.xm=p.en.xm;
    }
    if(p.ex) G.ex=p.ex;
    if(p.build) G.build=p.build;
    if(p.profilePic) G.profilePic=p.profilePic;
    return !!(G.name&&G.email);
  }catch(e){return false;}
}

function fm(n){
  n=Math.floor(n||0);
  if(n>=1e12)return(n/1e12).toFixed(2)+'T';
  if(n>=1e9)return(n/1e9).toFixed(2)+'B';
  if(n>=1e6)return(n/1e6).toFixed(2)+'M';
  if(n>=1000)return(n/1000).toFixed(1)+'K';
  return ''+n;
}
function fmf(n){return Math.floor(n||0).toLocaleString();}
function fmT(s){s=Math.floor(s);if(s>=3600){return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m';}if(s>=60)return Math.floor(s/60)+'m '+s%60+'s';return s+'s';}
function st(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function sth(id,v){var e=document.getElementById(id);if(e)e.innerHTML=v;}
