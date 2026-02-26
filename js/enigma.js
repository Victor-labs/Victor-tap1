/* ENIGMA */
function renderEnigma(){try{
  var now=Date.now();
  // Skill 0 - Buff Control
  var bc=G.en.bc;
  var eu0=document.getElementById('eu0');if(eu0)eu0.disabled=G.vk<1000000;
  if(bc.unlocked){document.getElementById('el0').style.display='none';document.getElementById('er0').style.display='';document.getElementById('en0').classList.toggle('eact',bc.active);
    var h0=bc.active?'<button class="edbt" onclick="deactE(0)">DEACTIVATE</button>':'<button class="eabt" onclick="actE(0)">ACTIVATE</button>';
    sth('ebs0',h0);st('et0',bc.active?'🟢 ACTIVE — tap to deactivate':'');
  }
  // Skill 1 - Celestial
  var ce=G.en.ce;
  var eu1=document.getElementById('eu1');if(eu1)eu1.disabled=G.vk<1000000;
  if(ce.unlocked){document.getElementById('el1').style.display='none';document.getElementById('er1').style.display='';document.getElementById('en1').classList.toggle('eact',ce.active);
    var h1=ce.active?'<button class="edbt" onclick="deactE(1)">DEACTIVATE</button>':'<button class="eabt" onclick="actE(1)">ACTIVATE</button>';
    sth('ebs1',h1);st('et1',ce.active?'🟢 ACTIVE — all mines yield 500 💎':'');
  }
  // Skill 2 - XP Magnet
  var xm=G.en.xm;
  var eu2=document.getElementById('eu2');if(eu2)eu2.disabled=G.vk<1000000;
  if(xm.unlocked){document.getElementById('el2').style.display='none';document.getElementById('er2').style.display='';
    var isAct=xm.active&&now<xm.endAt,onCd=!isAct&&xm.cdEnd&&now<xm.cdEnd;
    document.getElementById('en2').classList.toggle('eact',isAct);
    var h2='<button class="eabt" '+(isAct||onCd?'disabled':'')+' onclick="actE(2)">ACTIVATE</button>';
    if(isAct)h2+='<span style="font-size:.58rem;color:var(--gr);font-family:Share Tech Mono,monospace;padding:7px 4px;">ACTIVE ✓</span>';
    sth('ebs2',h2);
    var t2='';
    if(isAct)t2='<span class="ton">🟢 '+fmT(Math.ceil((xm.endAt-now)/1000))+' left</span>';
    else if(onCd)t2='<span class="tcd">⏳ Cooldown: '+fmT(Math.ceil((xm.cdEnd-now)/1000))+'</span>';
    sth('et2',t2);
  }
}catch(e){console.warn('renderEnigma:',e);}
}
function unlockE(i){
  if(G.vk<1000000){toast('Need 1,000,000 VK','#ff3d5a');return;}
  G.vk-=1000000;
  var keys=['bc','ce','xm'];G.en[keys[i]].unlocked=true;
  var names=['Buff Control','Celestial','XP Magnet'];
  toast('🎭 '+names[i]+' REVEALED!','#b06aff');sv();renderAll();renderEnigma();
}
function actE(i){
  var keys=['bc','ce','xm'];var en=G.en[keys[i]];if(!en.unlocked)return;
  if(i<2){en.active=true;toast('✨ '+['Buff Control','Celestial'][i]+' ACTIVATED!','#b06aff');}
  else{
    var now=Date.now();if(en.cdEnd&&now<en.cdEnd){toast('Still on cooldown!','#ff3d5a');return;}
    en.active=true;en.endAt=now+20000;
    toast('🧲 XP Magnet ON — 20 seconds!','#b06aff');
    setTimeout(function(){en.active=false;en.cdEnd=Date.now()+50*3600000;sv();renderAll();renderEnigma();toast('🧲 XP Magnet ended. 50hr cooldown.','#b06aff');},20000);
  }
  sv();renderAll();renderEnigma();
}
function deactE(i){
  var keys=['bc','ce'];G.en[keys[i]].active=false;
  toast('🎭 '+['Buff Control','Celestial'][i]+' deactivated.','#b06aff');sv();renderAll();renderEnigma();
}
