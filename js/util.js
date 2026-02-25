/* ACHIEVEMENTS */
function checkAch(){
  var ch=false;
  for(var i=0;i<ACHS.length;i++){if(!G.ach[i]&&ACHS[i].f(G)){G.ach[i]=true;ch=true;toast('🏅 '+ACHS[i].n+' unlocked!','#ffd700');}}
  if(ch){sv();var ag=document.getElementById('achGrid');if(ag)renderAch();st('achBadge',G.ach.filter(Boolean).length+'/30');st('achProg',G.ach.filter(Boolean).length+'/30');}
}
function renderAch(){
  var g=document.getElementById('achGrid');if(!g)return;
  var h='';
  for(var i=0;i<ACHS.length;i++){
    var a=ACHS[i],u=G.ach[i];
    h+='<div class="ac '+(u?'ul':'')+'">'
      +'<span class="ai">'+(u?a.e:'🔒')+'</span>'
      +'<div class="an">'+a.n+'</div>'
      +(u?'<div class="acr">'+a.c+'</div>':'')
      +'</div>';
  }
  g.innerHTML=h;
}

/* RANKS */
function renderRanks(){
  var list=document.getElementById('rankList');if(!list)return;
  var cur=getRk().n,h='';
  RK.forEach(function(r,i){
    var nq=RK[i+1]?RK[i+1].q:null,c=G.vk,p=0;
    if(nq)p=Math.min(100,Math.floor(Math.max(0,c-r.q)/(nq-r.q)*100));
    else if(c>=r.q)p=100;
    var fw=r.n===cur?p:(c>=r.q?100:0);
    h+='<div class="rrow '+(r.n===cur?'rc':'')+'">'
      +'<div class="remi">'+r.n.split(' ')[0]+'</div>'
      +'<div style="flex:1"><div class="rn">'+r.n+'</div>'
      +'<div class="rq">'+(r.q===0?'Starting rank':fm(r.q)+' VK required')+'</div>'
      +'<div class="rp2"><div class="rpf" style="width:'+fw+'%"></div></div></div>'
      +(r.n===cur?'<div class="ry">YOU</div>':'')+'</div>';
  });
  list.innerHTML=h;
}

/* PLAYER */
function renderPI(){
  st('piC',fm(G.vk));st('piD',fm(G.dia));st('piR',getRk().n);
  st('piT',fm(G.taps));st('piMn',fm(G.mined));st('piName',(G.name||'PLAYER').toUpperCase());
  var m=document.getElementById('piM');if(m){m.textContent=G.bot?'✅ Owned':'Not Owned';m.style.color=G.bot?'var(--gr)':'var(--dim2)';}
  var ei=document.getElementById('editName');if(ei)ei.value=G.name||'';
}
function saveName(){var v=(document.getElementById('editName').value||'').trim();if(!v){toast('Name empty','#ff3d5a');return;}G.name=v;sv();toast('✅ Name updated!','#00e5a0');st('piName',v.toUpperCase());}

/* TOAST */
var _tt;
function toast(msg,c){var t=document.getElementById('toast');t.textContent=msg;t.style.color=c||'var(--text)';t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(function(){t.classList.remove('show');},2700);}

/* PERIODIC */
setInterval(function(){checkAch();if(G.bot)G.lastActive=Date.now();sv();renderAll();renderCO();updDaily();},5000);
