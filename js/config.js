/* ANTI-INSPECT */
document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('keydown',function(e){
  if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].includes(e.key))||(e.ctrlKey&&e.key==='u')){e.preventDefault();return false;}
});

/* BG */
(function(){
  var cv=document.getElementById('bgC'),cx=cv.getContext('2d');
  var W,H,ok=true,S=[],P=[],L=[],NB=[];
  function rsz(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;S=[];P=[];L=[];NB=[];
    for(var i=0;i<160;i++)S.push({x:Math.random()*W,y:Math.random()*H,r:.15+Math.random()*1.2,ph:Math.random()*6.28,sp:.004+Math.random()*.009});
    for(var i=0;i<28;i++)P.push({x:Math.random()*W,y:Math.random()*H,vy:-.1-Math.random()*.22,vx:(Math.random()-.5)*.1,r:.4+Math.random()*1.8,ph:Math.random()*6.28,da:.003+Math.random()*.005});
    for(var i=0;i<20;i++){var a=Math.floor(Math.random()*S.length),b=Math.floor(Math.random()*S.length);L.push({a:a,b:b,ph:Math.random()*6.28,sp:.0015});}
    for(var i=0;i<3;i++)NB.push({x:Math.random()*W,y:Math.random()*H,r:180+Math.random()*200,h:200+Math.random()*60,ph:Math.random()*6.28,sp:.0009});
  }
  window.addEventListener('resize',rsz);rsz();
  document.addEventListener('visibilitychange',function(){ok=!document.hidden;});
  (function draw(){requestAnimationFrame(draw);if(!ok)return;
    cx.clearRect(0,0,W,H);cx.fillStyle='#020409';cx.fillRect(0,0,W,H);
    NB.forEach(function(n){n.ph+=n.sp;var op=.016+.009*Math.sin(n.ph);
      var g=cx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
      g.addColorStop(0,'hsla('+n.h+',68%,52%,'+op+')');g.addColorStop(1,'transparent');
      cx.fillStyle=g;cx.beginPath();cx.arc(n.x,n.y,n.r,0,6.28);cx.fill();});
    L.forEach(function(l){l.ph+=l.sp;if(S[l.a]&&S[l.b]){
      cx.beginPath();cx.moveTo(S[l.a].x,S[l.a].y);cx.lineTo(S[l.b].x,S[l.b].y);
      cx.strokeStyle='rgba(240,192,64,'+(0.024+0.018*Math.sin(l.ph))+')';cx.lineWidth=.5;cx.stroke();}});
    S.forEach(function(s){s.ph+=s.sp;var op=.14+.48*Math.abs(Math.sin(s.ph));
      cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.28);cx.fillStyle='rgba(210,225,255,'+op+')';cx.fill();});
    P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.ph+=p.da;
      if(p.y<-8){p.y=H+8;p.x=Math.random()*W;}if(p.x<-8)p.x=W+8;if(p.x>W+8)p.x=-8;
      cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fillStyle='rgba(240,192,64,'+(0.07+0.12*Math.abs(Math.sin(p.ph)))+')';cx.fill();});
  })();
})();

/* DATA */
var TP=[{r:1,c:5000,d:0},{r:3,c:25000,d:0},{r:6,c:80000,d:0},{r:9,c:200000,d:0},
  {r:11,c:500000,d:0},{r:14,c:1200000,d:0},{r:20,c:3000000,d:0},{r:25,c:7000000,d:0},
  {r:20,c:0,d:2000},{r:25,c:0,d:5000}];
var FC=[{n:'Winter Industry',r:15,c:500},{n:'Hell Industry',r:35,c:10000},{n:'Stardust Industry',r:22,c:3500}];
var RK=[{n:'🌱 Newbie',q:0},{n:'⚔️ Veteran',q:50000},{n:'🔥 Pro',q:500000},{n:'👑 Master',q:5000000},{n:'🌟 Legend',q:50000000}];
var DPOOL=[15,25,35,30,60,25,18,35,400,120,40,22,10,12,500];
var CO=[{l:'₦1,000',q:1000000},{l:'₦2,000',q:100000000},{l:'₦5,000',q:100000000000},{l:'₦7,000',q:900000000000}];
var BOOSTS=[
  {id:'sr',name:'Speed Rush',ico:'🚀',desc:'+5 VK per tap',price:50000,dur:30*60},
  {id:'dr',name:'Diamond Rain',ico:'🌧️',desc:'+2 💎 every 60s',price:150000,dur:60*60},
  {id:'vs',name:'VK Surge',ico:'⚡',desc:'+50 VK/s auto',price:300000,dur:20*60},
  {id:'gr',name:'Gold Rush',ico:'💛',desc:'2x auto earnings',price:500000,dur:15*60}
];
var ACHS=[
  {n:'Click Bait',e:'🖱️',c:'Reach 10,000 VK',f:function(g){return g.vk>=10000;}},
  {n:'Cold Tapper',e:'🧊',c:'Tap 50 times',f:function(g){return g.taps>=50;}},
  {n:'Farmer',e:'⛏️',c:'Mine 40 diamonds total',f:function(g){return g.mined>=40;}},
  {n:'Steady Rhythm',e:'🎵',c:'Earn 20K VK within 6 min of login',f:function(){return false;}},
  {n:'Fury Tap',e:'💢',c:'Reach 200,000 VK',f:function(g){return g.vk>=200000;}},
  {n:'Organizer',e:'🏭',c:'Purchase 1 factory',f:function(g){return g.fac.filter(function(f){return f.b;}).length>=1;}},
  {n:'Mr. VK',e:'🎩',c:'Reach 500,000 VK',f:function(g){return g.vk>=500000;}},
  {n:'Hunter',e:'🏹',c:'Mine 200 diamonds total',f:function(g){return g.mined>=200;}},
  {n:'Evil Grin',e:'😈',c:'Own an Evil Tap tapper',f:function(g){return g.tap[8]||g.tap[9];}},
  {n:'Entrepreneur',e:'💼',c:'Own all 3 factories',f:function(g){return g.fac.filter(function(f){return f.b;}).length>=3;}},
  {n:'Cash Master',e:'💰',c:'Use any conversion plan',f:function(g){return g.planUsed;}},
  {n:'Tornado',e:'🌪️',c:'Activate 3 boosts',f:function(g){return g.boosted>=3;}},
  {n:'Hero',e:'🦸',c:'Reach 50,000 VK',f:function(g){return g.vk>=50000;}},
  {n:'Night Owl',e:'🦉',c:'Tap at 1AM',f:function(){return false;}},
  {n:'Dedicated Collector',e:'📅',c:'Claim daily reward 5 times',f:function(g){return g.dc>=5;}},
  {n:'Cashier',e:'🏧',c:'Reach 1,000,000 VK',f:function(g){return g.vk>=1000000;}},
  {n:'Daily Regulars',e:'📆',c:'Login 20 times',f:function(g){return g.logins>=20;}},
  {n:'Brother Vic',e:'👊',c:'Reach 50,000 VK',f:function(g){return g.vk>=50000;}},
  {n:'Winter Time',e:'❄️',c:'Activate Winter Industry',f:function(g){return g.fac[0].a;}},
  {n:'Santa',e:'🎅',c:'Purchase Winter Industry',f:function(g){return g.fac[0].b;}},
  {n:'Hell Bent',e:'😈',c:'Activate Hell Industry',f:function(g){return g.fac[1].a;}},
  {n:'Son of Darkness',e:'🖤',c:'Purchase Hell Industry',f:function(g){return g.fac[1].b;}},
  {n:'VK Master',e:'🔱',c:'Reach 2,000,000 VK',f:function(g){return g.vk>=2000000;}},
  {n:'Business Minds',e:'🏙️',c:'Purchase 3+ factories',f:function(g){return g.fac.filter(function(f){return f.b;}).length>=3;}},
  {n:'Tycoon',e:'💎',c:'Use any conversion plan',f:function(g){return g.planUsed;}},
  {n:'Banked',e:'🏦',c:'Own the Auto Miner Bot',f:function(g){return g.bot;}},
  {n:'Lights On',e:'💡',c:'Activate any factory',f:function(g){return g.fac.some(function(f){return f.a;});}},
  {n:'Ruaushi',e:'✨',c:'Purchase Stardust Industry',f:function(g){return g.fac[2].b;}},
  {n:'Star & Moon',e:'🌙',c:'Activate Stardust Industry',f:function(g){return g.fac[2].a;}},
  {n:'Master of Currency',e:'👑',c:'Mine 900 diamonds total',f:function(g){return g.mined>=900;}},
  {n:'Scavenger Hunt',e:'🎒',c:'Own 2 artifacts',f:function(g){return g.ex&&g.ex.vault&&g.ex.vault.length>=2;}},
  {n:'Tomber',e:'⚰️',c:'Explore 1 map location',f:function(g){return g.ex&&g.ex.totalExplores>=1;}},
  {n:'Detective Vic',e:'🕵️',c:'Explore Vic Abyss',f:function(g){return g.ex&&(g.ex.locVisits[4]||0)>=1;}},
  {n:'Ranger',e:'🏹',c:'Mine 500 diamonds',f:function(g){return g.mined>=500;}},
  {n:'Homeowner',e:'🏠',c:'Buy 1 home',f:function(g){return g.build&&g.build.homes.length>=1;}},
  {n:'Vic.Builder',e:'🏗️',c:'Own 3 homes',f:function(g){return g.build&&g.build.homes.length>=3;}},
  {n:'Safe House',e:'🛡️',c:'Have 1 NPC in your home',f:function(g){return g.build&&g.build.homes.some(function(h){return h.npcs>=1;});}},
  {n:'Rainy Days',e:'🌧️',c:'Get robbed once',f:function(g){return g.build&&g.build.wasRobbed;}},
  {n:'Mod.Vic',e:'🔐',c:'Buy security for a home',f:function(g){return g.build&&g.build.homes.some(function(h){return h.hasecurity;});}}
];
