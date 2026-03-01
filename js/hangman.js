/* ═══════════════════════════════════════════════════
   VICTOR COIN — 🥏 Hangman
   70 words, progressive difficulty, 3 hints, 10s timer
═══════════════════════════════════════════════════ */
var HM_WORDS=[
  /* EASY */
  {w:'CAT',h:['A pet','It meows','Has fur']},
  {w:'SUN',h:['Shines bright','In the sky','A star']},
  {w:'DOG',h:['It barks','Man\'s best friend','A common pet']},
  {w:'MAP',h:['Shows routes','Used for navigation','Paper with directions']},
  {w:'BUS',h:['Public transport','Many seats','Runs on roads']},
  {w:'HAT',h:['Worn on head','Keeps sun off','A type of cap']},
  {w:'CUP',h:['Holds liquid','You drink from it','A mug']},
  {w:'BOX',h:['Square container','For storage','Made of cardboard']},
  {w:'FAN',h:['Blows air','Keeps you cool','Has spinning blades']},
  {w:'PEN',h:['You write with it','Has ink','Not a pencil']},
  {w:'KEY',h:['Opens locks','Metal object','Fits a keyhole']},
  {w:'ANT',h:['Tiny insect','Lives in colonies','Very strong for size']},
  {w:'COW',h:['Gives milk','Lives on a farm','Says moo']},
  {w:'OWL',h:['Nocturnal bird','Says hoot','Has big eyes']},
  {w:'ICE',h:['Frozen water','Cold solid','Melts in heat']},
  {w:'EGG',h:['Oval shape','Has a shell','Laid by a hen']},
  {w:'BED',h:['You sleep in it','Has pillows','In a bedroom']},
  {w:'NET',h:['Made of mesh','Catches things','Used in sports']},
  {w:'BAT',h:['Flies at night','Used in cricket','A mammal']},
  {w:'JAR',h:['Glass container','Has a lid','Stores food']},
  /* MEDIUM */
  {w:'APPLE',h:['A fruit','Red or green','Keeps the doctor away']},
  {w:'CHAIR',h:['You sit on it','Has legs','A piece of furniture']},
  {w:'CLOCK',h:['Tells time','Has hands','Ticks every second']},
  {w:'CLOUD',h:['In the sky','Made of water vapor','Brings rain']},
  {w:'DANCE',h:['Body movement','Done to music','A performance art']},
  {w:'EAGLE',h:['A large bird','National symbol of USA','Has sharp talons']},
  {w:'FLAME',h:['Tip of fire','Burns bright','Orange and yellow']},
  {w:'GLOBE',h:['Round earth model','Shows all continents','Can be spun']},
  {w:'HONEY',h:['Bees make it','Very sweet','Goes on toast']},
  {w:'JEWEL',h:['Precious stone','Worn as jewelry','Sparkles in light']},
  {w:'KITE',h:['Flies in the wind','Has a long string','Diamond shaped']},
  {w:'LEMON',h:['Sour fruit','Yellow color','Used in drinks']},
  {w:'MAGIC',h:['Tricks and illusions','Wizards use it','Supernatural power']},
  {w:'NURSE',h:['Works in hospital','Helps patients','Wears scrubs']},
  {w:'OCEAN',h:['Large body of water','Very salty','Home to whales']},
  {w:'PIANO',h:['Musical instrument','Has 88 keys','Black and white keys']},
  {w:'QUEEN',h:['Female royalty','Wears a crown','Rules a kingdom']},
  {w:'RIVER',h:['Flowing water','Has two banks','Fish live in it']},
  {w:'STORM',h:['Bad weather','Lightning and thunder','Heavy rain and wind']},
  {w:'TIGER',h:['Big cat','Has orange stripes','Lives in jungle']},
  {w:'UNCLE',h:['Family member','Brother of a parent','Male relative']},
  {w:'VENUS',h:['A planet','Named after goddess of love','Second from Sun']},
  {w:'WHALE',h:['Largest mammal','Lives in the ocean','Blows a water spout']},
  {w:'ZEBRA',h:['Has stripes','African animal','Black and white']},
  {w:'PIZZA',h:['Italian food','Round and flat','Has cheese and toppings']},
  /* HARD */
  {w:'BRONZE',h:['A metal alloy','Third place medal','Made of copper and tin']},
  {w:'CACTUS',h:['Desert plant','Has sharp spines','Stores water inside']},
  {w:'ENZYME',h:['Biological catalyst','Speeds up reactions','Found in living cells']},
  {w:'FOSSIL',h:['Ancient remains','Found inside rock','Evidence of past life']},
  {w:'HYBRID',h:['Two different origins','Mixed type','E.g. a hybrid car']},
  {w:'JIGSAW',h:['A type of puzzle','Also a power saw','Pieces that fit together']},
  {w:'KNIGHT',h:['Chess piece','Medieval warrior','Rides a horse in battle']},
  {w:'LARYNX',h:['Your voice box','Located in the throat','Produces sound']},
  {w:'MAGNET',h:['Attracts metal','Has north and south poles','Used in motors']},
  {w:'NEBULA',h:['Cloud in space','Where stars are born','Made of gas and dust']},
  {w:'ORACLE',h:['Prophetic figure','Tells the future','Ancient Greek advisor']},
  {w:'PLASMA',h:['Fourth state of matter','Found inside stars','Also in your blood']},
  {w:'QUARTZ',h:['A mineral','Used in watches','Made of silicon dioxide']},
  {w:'SPHINX',h:['Ancient Egyptian statue','Has a lion body and human head','Asks riddles']},
  {w:'TUNDRA',h:['Frozen biome','Near the poles','No trees grow here']},
  /* IMPOSSIBLE */
  {w:'VORTEX',h:['A spinning mass','Like a tornado','Shaped like a whirlpool']},
  {w:'XENON',h:['A noble gas','Used in lamps','Atomic number 54']},
  {w:'ZEPHYR',h:['A gentle west wind','Soft breeze','Named after ancient wind god']},
  {w:'CHRYSALIS',h:['A butterfly cocoon','Transformation stage','Hard protective shell']},
  {w:'EPHEMERAL',h:['Lasting only a short time','Fleeting','Like morning dew']},
  {w:'JUXTAPOSE',h:['Place side by side','For contrast','A literary technique']},
  {w:'LACHRYMOSE',h:['Prone to weeping','Very tearful','A sad word']},
  {w:'MELLIFLUOUS',h:['Sweet sounding','Like flowing honey','Describes a voice']},
  {w:'SYCOPHANT',h:['A flatterer','Someone who seeks favor','A yes-man']},
  {w:'UBIQUITOUS',h:['Present everywhere','Seems to be all places at once','Very common']},
];

var _hm={
  wordIdx:0,word:'',hints:[],guessed:[],wrong:[],
  hintsUsed:0,over:false,streak:0,hs:0,timer:null,timeLeft:10
};

function renderHangman(el){
  _hm.hs=parseInt(localStorage.getItem('vc_hm_hs')||'0');
  _hm.streak=0; _hm.wordIdx=0;
  el.innerHTML='<div class="game-wrap">'+gameBackBtn()
    +'<div class="game-title">🥏 Hangman</div>'
    +'<div class="hm-stats">'
    +'<span>Streak <b id="hmStreak">0</b></span>'
    +'<span>Best <b id="hmHS">'+_hm.hs+'</b></span>'
    +'<span>Word <b id="hmWNum">1</b>/'+HM_WORDS.length+'</span>'
    +'</div>'
    +'<div id="hmBody"></div></div>';
  hmStartWord();
}

function hmStartWord(){
  if(_hm.wordIdx>=HM_WORDS.length){hmAllDone();return;}
  if(_hm.timer){clearInterval(_hm.timer);_hm.timer=null;}
  var e=HM_WORDS[_hm.wordIdx];
  _hm.word=e.w; _hm.hints=e.h;
  _hm.guessed=[]; _hm.wrong=[]; _hm.hintsUsed=0; _hm.over=false;
  _hm.timeLeft=10;
  hmRender();
  hmRunTimer();
}

function hmRender(){
  var el=document.getElementById('hmBody');
  if(!el)return;
  var display=_hm.word.split('').map(function(ch){
    return _hm.guessed.indexOf(ch)>=0?ch:'_';
  }).join(' ');
  var wc=_hm.wrong.length;
  var faces=['😊','😐','😟','😰','😱','💀'];
  var face=faces[Math.min(wc,5)];

  var keys='';
  for(var c=65;c<=90;c++){
    var ch=String.fromCharCode(c);
    var hit=_hm.guessed.indexOf(ch)>=0;
    var bad=_hm.wrong.indexOf(ch)>=0;
    keys+='<button class="hm-key'+(bad?' hm-bad':hit?' hm-hit':'')+'"'
      +(hit||bad||_hm.over?' disabled':' onclick="hmGuess(\''+ch+'\')"')
      +'>'+ch+'</button>';
  }

  el.innerHTML='<div class="hm-face">'+face+'</div>'
    +'<div class="hm-timer-row"><div class="hm-tbar"><div class="hm-tfill" id="hmFill" style="width:'+(_hm.timeLeft*10)+'%"></div></div>'
    +'<span class="hm-tlbl" id="hmTime">'+_hm.timeLeft+'s</span></div>'
    +'<div class="hm-word" id="hmDisplay">'+display+'</div>'
    +'<div class="hm-wrong-row">Wrong ('+wc+'/6): <b>'+(_hm.wrong.join(' ')||'—')+'</b></div>'
    +'<div class="hm-hint-row">'
    +'<button class="hm-hint-btn" onclick="hmHint()">💡 Hint ('+( 3-_hm.hintsUsed)+' left)</button>'
    +'<div id="hmHintTxt" class="hm-hint-txt"></div>'
    +'</div>'
    +'<div class="hm-keys">'+keys+'</div>'
    +'<div id="hmFB"></div>';
}

function hmRunTimer(){
  if(_hm.timer)clearInterval(_hm.timer);
  _hm.timer=setInterval(function(){
    _hm.timeLeft--;
    var f=document.getElementById('hmFill');
    var l=document.getElementById('hmTime');
    if(f)f.style.width=(_hm.timeLeft*10)+'%';
    if(l)l.textContent=_hm.timeLeft+'s';
    if(_hm.timeLeft<=3&&f)f.style.background='#FF453A';
    if(_hm.timeLeft<=0){clearInterval(_hm.timer);_hm.timer=null;if(!_hm.over)hmFail('⏰ Time\'s up!');}
  },1000);
}

function hmGuess(ch){
  if(_hm.over)return;
  _hm.timeLeft=10; // reset timer on each guess
  if(_hm.word.indexOf(ch)>=0){_hm.guessed.push(ch);}
  else{_hm.wrong.push(ch);}
  var solved=_hm.word.split('').every(function(c){return _hm.guessed.indexOf(c)>=0;});
  if(solved){hmWin();return;}
  if(_hm.wrong.length>=6){hmFail('💀 Too many wrong guesses!');return;}
  hmRender();
  // restart timer countdown from 10
  clearInterval(_hm.timer);
  hmRunTimer();
}

function hmHint(){
  var t=document.getElementById('hmHintTxt');
  var b=document.querySelector('.hm-hint-btn');
  if(_hm.hintsUsed>=3){
    if(t)t.innerHTML='<span style="color:#FF453A">Oops! All hints are used up 😅</span>';
    return;
  }
  var hint=_hm.hints[_hm.hintsUsed];
  _hm.hintsUsed++;
  if(t)t.innerHTML='<span style="color:#FFD60A">💡 '+hint+'</span>';
  if(b)b.textContent='💡 Hint ('+(3-_hm.hintsUsed)+' left)';
}

function hmWin(){
  _hm.over=true;
  if(_hm.timer){clearInterval(_hm.timer);_hm.timer=null;}
  _hm.streak++;
  if(_hm.streak>_hm.hs){_hm.hs=_hm.streak;localStorage.setItem('vc_hm_hs',_hm.hs);}
  if(_hm.streak>=20&&typeof checkAch==='function'){if(!G.gameStreak20){G.gameStreak20=true;sv();checkAch();}}
  var s=document.getElementById('hmStreak');
  var h=document.getElementById('hmHS');
  if(s)s.textContent=_hm.streak;
  if(h)h.textContent=_hm.hs;
  var el=document.getElementById('hmBody');
  if(!el)return;
  el.innerHTML='<div class="game-end"><div class="game-end-ico">🎉</div>'
    +'<div class="game-end-title">Correct! The word was <strong>'+_hm.word+'</strong></div>'
    +'<div class="game-end-row">Streak: 🔥 '+_hm.streak+'</div>'
    +'<button class="game-retry-btn" onclick="hmNextWord()">Next Word ▶</button>'
    +'</div>';
}

function hmNextWord(){
  _hm.wordIdx++;
  var wn=document.getElementById('hmWNum');
  if(wn)wn.textContent=Math.min(_hm.wordIdx+1,HM_WORDS.length);
  hmStartWord();
}

function hmFail(reason){
  _hm.over=true; _hm.streak=0;
  if(_hm.timer){clearInterval(_hm.timer);_hm.timer=null;}
  var el=document.getElementById('hmBody');
  if(!el)return;
  el.innerHTML='<div class="game-end"><div class="game-end-ico">💀</div>'
    +'<div class="game-end-title">'+reason+'</div>'
    +'<div class="game-end-row">Word was: <strong>'+_hm.word+'</strong></div>'
    +'<button class="game-retry-btn" onclick="hmRetry()">🔄 Try Again</button>'
    +'</div>';
}

function hmRetry(){_hm.streak=0;_hm.wordIdx=0;var wn=document.getElementById('hmWNum');if(wn)wn.textContent=1;hmStartWord();}

function hmAllDone(){
  var el=document.getElementById('hmBody');
  if(!el)return;
  el.innerHTML='<div class="game-end"><div class="game-end-ico">🏆</div>'
    +'<div class="game-end-title">All 70 words completed!</div>'
    +'<div class="game-end-row">Best streak: <b>'+_hm.hs+'</b></div>'
    +'<button class="game-retry-btn" onclick="hmRetry()">🔄 Play Again</button>'
    +'</div>';
    }
   
