(function(){
  ['\x76\x63\x67\x5f\x76\x35','\x76\x63\x67\x5f\x76\x36','\x76\x63\x67\x5f\x76\x37','\x76\x63\x67\x5f\x76\x38'].forEach(function(k){
    try{
      var old=localStorage.getItem(k);
      if(old){
        var p=JSON.parse(old);
        if(p.name&&p.email&&!localStorage.getItem(KEY)){
          G.name=p.name;G.email=p.email;G.vk=p.vk||p.coins||0;G.dia=p.dia||0;
          G.taps=p.taps||0;G.mined=p.mined||0;G.logins=(p.logins||0)+1;
          G.bot=p.bot||false;G.lastActive=p.lastActive||null;
          if(p.tap&&p.tap.length===10)G.tap=p.tap;
          if(p.fac&&p.fac.length===3)G.fac=p.fac;
          if(p.ach&&p.ach.length===30)G.ach=p.ach;
          if(p.daily)G.daily=p.daily;
          G.dc=p.daily?p.daily.cnt||0:0;sv();
        }
      }
    }catch(e){}
  });
  if(ld()){
    G.logins++;
    document.getElementById('\x6c\x70').style.display='\x6e\x6f\x6e\x65';
    document.getElementById('\x61\x70\x70').style.display='\x66\x6c\x65\x78';
    initGame();
  }
})();

