(function(){
  try{
    // Migration from old keys handled in ld() now
    if(ld()){
      G.logins++;
      sv();
      var lp=document.getElementById('lp');
      var app=document.getElementById('app');
      if(lp)  lp.style.display='none';
      if(app) app.style.display='flex';
      try{ initGame(); }catch(err){ console.error('autoLogin initGame:',err); }
    }
  }catch(e){ console.error('main.js boot error:',e); }
})();
