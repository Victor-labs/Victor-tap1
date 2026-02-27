/* ═══════════════════════════════════════════════════
   VICTOR COIN — 🤔 Trivia
   60 questions: Easy(20) · Medium(20) · Hard(20)
═══════════════════════════════════════════════════ */

var TRIVIA_Q = [
  /* ── EASY ── */
  {q:'What is 2 + 2?',a:'4',o:['3','4','5','6'],d:'easy'},
  {q:'What color is the sky on a clear day?',a:'Blue',o:['Green','Blue','Red','Purple'],d:'easy'},
  {q:'How many days are in a week?',a:'7',o:['5','6','7','8'],d:'easy'},
  {q:'What animal says "Meow"?',a:'Cat',o:['Dog','Cat','Cow','Duck'],d:'easy'},
  {q:'Which planet do we live on?',a:'Earth',o:['Mars','Venus','Earth','Jupiter'],d:'easy'},
  {q:'How many sides does a triangle have?',a:'3',o:['2','3','4','5'],d:'easy'},
  {q:'What color is grass?',a:'Green',o:['Blue','Yellow','Green','Red'],d:'easy'},
  {q:'What comes after Monday?',a:'Tuesday',o:['Sunday','Wednesday','Tuesday','Friday'],d:'easy'},
  {q:'How many months in a year?',a:'12',o:['10','11','12','13'],d:'easy'},
  {q:'What is the opposite of hot?',a:'Cold',o:['Warm','Cold','Wet','Dry'],d:'easy'},
  {q:'What do bees make?',a:'Honey',o:['Milk','Honey','Wax','Sugar'],d:'easy'},
  {q:'How many legs does a spider have?',a:'8',o:['6','8','10','4'],d:'easy'},
  {q:'Which fruit is yellow and curved?',a:'Banana',o:['Apple','Mango','Banana','Pear'],d:'easy'},
  {q:'What is H₂O commonly known as?',a:'Water',o:['Milk','Juice','Water','Air'],d:'easy'},
  {q:'How many zeros in one hundred?',a:'2',o:['1','2','3','4'],d:'easy'},
  {q:'What instrument has black and white keys?',a:'Piano',o:['Guitar','Drum','Piano','Flute'],d:'easy'},
  {q:'What season comes after summer?',a:'Autumn',o:['Spring','Winter','Autumn','Summer'],d:'easy'},
  {q:'What do you write on a blackboard with?',a:'Chalk',o:['Pen','Pencil','Chalk','Marker'],d:'easy'},
  {q:'How many continents are there?',a:'7',o:['5','6','7','8'],d:'easy'},
  {q:'How many legs does a dog have?',a:'4',o:['2','4','6','8'],d:'easy'},

  /* ── MEDIUM ── */
  {q:'What is the capital of France?',a:'Paris',o:['London','Berlin','Paris','Rome'],d:'medium'},
  {q:'What gas do plants absorb from air?',a:'CO₂',o:['O₂','N₂','CO₂','H₂'],d:'medium'},
  {q:'Who wrote Romeo and Juliet?',a:'Shakespeare',o:['Dickens','Shakespeare','Austen','Tolstoy'],d:'medium'},
  {q:'How many bones in the adult human body?',a:'206',o:['150','180','206','230'],d:'medium'},
  {q:'Chemical symbol for iron?',a:'Fe',o:['Ir','Fe','Fo','Fi'],d:'medium'},
  {q:'What is the largest ocean?',a:'Pacific',o:['Atlantic','Indian','Pacific','Arctic'],d:'medium'},
  {q:'In what year did WW2 end?',a:'1945',o:['1940','1943','1945','1950'],d:'medium'},
  {q:'What is the powerhouse of the cell?',a:'Mitochondria',o:['Nucleus','Mitochondria','Ribosome','Vacuole'],d:'medium'},
  {q:'Players on a basketball team?',a:'5',o:['4','5','6','7'],d:'medium'},
  {q:'Which country has the Eiffel Tower?',a:'France',o:['Italy','Spain','France','Germany'],d:'medium'},
  {q:'Chemical symbol for gold?',a:'Au',o:['Go','Gl','Ag','Au'],d:'medium'},
  {q:'Strings on a standard guitar?',a:'6',o:['4','5','6','7'],d:'medium'},
  {q:'Which planet is called the Red Planet?',a:'Mars',o:['Jupiter','Venus','Mars','Saturn'],d:'medium'},
  {q:'Who painted the Mona Lisa?',a:'da Vinci',o:['Picasso','da Vinci','Monet','Rembrandt'],d:'medium'},
  {q:'What is the largest continent?',a:'Asia',o:['Africa','Asia','Europe','Australia'],d:'medium'},
  {q:'Most of Earth\'s atmosphere is?',a:'Nitrogen',o:['Oxygen','Nitrogen','CO₂','Argon'],d:'medium'},
  {q:'Square root of 144?',a:'12',o:['11','12','13','14'],d:'medium'},
  {q:'Slam dunk belongs to which sport?',a:'Basketball',o:['Football','Tennis','Basketball','Volleyball'],d:'medium'},
  {q:'Currency of Japan?',a:'Yen',o:['Won','Yen','Baht','Ringgit'],d:'medium'},
  {q:'How many sides does a hexagon have?',a:'6',o:['5','6','7','8'],d:'medium'},

  /* ── HARD ── */
  {q:'Who developed general relativity?',a:'Einstein',o:['Newton','Einstein','Bohr','Hawking'],d:'hard'},
  {q:'Which country won the first FIFA World Cup?',a:'Uruguay',o:['Brazil','Argentina','Uruguay','Italy'],d:'hard'},
  {q:'What is the rarest blood type?',a:'AB-',o:['O-','B-','AB-','A+'],d:'hard'},
  {q:'Longest river in the world?',a:'Nile',o:['Amazon','Nile','Yangtze','Mississippi'],d:'hard'},
  {q:'Atomic number of carbon?',a:'6',o:['4','6','8','12'],d:'hard'},
  {q:'Year the first iPhone was released?',a:'2007',o:['2004','2005','2007','2009'],d:'hard'},
  {q:'Hardest natural substance on Earth?',a:'Diamond',o:['Quartz','Sapphire','Diamond','Topaz'],d:'hard'},
  {q:'Language with the most native speakers?',a:'Mandarin',o:['Spanish','English','Hindi','Mandarin'],d:'hard'},
  {q:'Who wrote "A Brief History of Time"?',a:'Stephen Hawking',o:['Carl Sagan','Neil deGrasse Tyson','Stephen Hawking','Feynman'],d:'hard'},
  {q:'Capital of Kazakhstan?',a:'Astana',o:['Almaty','Astana','Tashkent','Bishkek'],d:'hard'},
  {q:'How many bits in a byte?',a:'8',o:['4','8','16','32'],d:'hard'},
  {q:'Which liquid element exists besides mercury?',a:'Bromine',o:['Gallium','Bromine','Cesium','Francium'],d:'hard'},
  {q:'How many symphonies did Beethoven compose?',a:'9',o:['7','8','9','10'],d:'hard'},
  {q:'17 × 18 = ?',a:'306',o:['296','300','306','312'],d:'hard'},
  {q:'Year the Berlin Wall fell?',a:'1989',o:['1987','1989','1991','1993'],d:'hard'},
  {q:'Company that created Android OS?',a:'Google',o:['Apple','Samsung','Google','Microsoft'],d:'hard'},
  {q:'Speed of light (approx)?',a:'300,000 km/s',o:['3,000 km/s','30,000 km/s','300,000 km/s','3M km/s'],d:'hard'},
  {q:'How many planets in our solar system?',a:'8',o:['7','8','9','10'],d:'hard'},
  {q:'Most abundant gas in the Sun?',a:'Hydrogen',o:['Helium','Hydrogen','Oxygen','Carbon'],d:'hard'},
  {q:'What does DNA stand for?',a:'Deoxyribonucleic Acid',o:['Deoxyribonucleic Acid','Diribonucleic Acid','Dynamic Nucleic Acid','Dense Nucleic Acid'],d:'hard'}
];

var _tv = { diff:'easy', pool:[], idx:0, score:0, streak:0, hs:0, answered:false };

function renderTrivia(el) {
  _tv.hs = parseInt(localStorage.getItem('vc_trivia_hs') || '0');
  el.innerHTML = '<div class="game-wrap">'
    + gameBackBtn()
    + '<div class="game-title">🤔 Trivia</div>'
    + '<div class="triv-diff-row">'
    + '<button class="triv-diff triv-diff-on" id="td-easy"   onclick="trivSetDiff(\'easy\')">😊 Easy</button>'
    + '<button class="triv-diff"              id="td-medium" onclick="trivSetDiff(\'medium\')">😐 Medium</button>'
    + '<button class="triv-diff"              id="td-hard"   onclick="trivSetDiff(\'hard\')">💀 Hard</button>'
    + '</div>'
    + '<div id="trivBody"></div>'
    + '</div>';
  trivSetDiff('easy');
}

function trivSetDiff(diff) {
  _tv.diff     = diff;
  _tv.pool     = gameShuffle(TRIVIA_Q.filter(function(q) { return q.d === diff; }));
  _tv.idx      = 0;
  _tv.score    = 0;
  _tv.streak   = 0;
  _tv.answered = false;
  ['easy','medium','hard'].forEach(function(d) {
    var b = document.getElementById('td-' + d);
    if (b) b.classList.toggle('triv-diff-on', d === diff);
  });
  trivShowQ();
}

function trivShowQ() {
  var el = document.getElementById('trivBody');
  if (!el) return;
  if (_tv.idx >= _tv.pool.length) { trivEnd(); return; }

  var q    = _tv.pool[_tv.idx];
  var opts = gameShuffle(q.o.slice());
  _tv.answered = false;

  el.innerHTML = '<div class="triv-meta">'
    + '<span>Q ' + (_tv.idx + 1) + ' / ' + _tv.pool.length + '</span>'
    + '<span>Score <b>' + _tv.score + '</b></span>'
    + '<span>🔥 ' + _tv.streak + '</span>'
    + '<span>Best <b>' + _tv.hs + '</b></span>'
    + '</div>'
    + '<div class="triv-q">' + q.q + '</div>'
    + '<div class="triv-opts">'
    + opts.map(function(o) {
        return '<button class="triv-opt" onclick="trivAnswer(this,\'' + _tvEsc(o) + '\',\'' + _tvEsc(q.a) + '\')">' + o + '</button>';
      }).join('')
    + '</div>'
    + '<div class="triv-fb" id="trivFB"></div>';
}

function trivAnswer(btn, chosen, correct) {
  if (_tv.answered) return;
  _tv.answered = true;
  var right = chosen === correct;

  document.querySelectorAll('.triv-opt').forEach(function(b) {
    b.disabled = true;
    if (b.textContent.trim() === correct) b.classList.add('triv-opt-right');
    if (b === btn && !right)              b.classList.add('triv-opt-wrong');
  });

  var fb = document.getElementById('trivFB');
  if (right) {
    _tv.score++;
    _tv.streak++;
    if (_tv.score > _tv.hs) {
      _tv.hs = _tv.score;
      localStorage.setItem('vc_trivia_hs', _tv.hs);
    }
    if (fb) fb.innerHTML = '<span class="triv-correct">✅ Correct!</span>';
    _tv.idx++;
    setTimeout(trivShowQ, 1100);
  } else {
    _tv.streak = 0;
    if (fb) fb.innerHTML = '<span class="triv-wrong">❌ Answer: <strong>' + correct + '</strong></span>'
      + '<br/><button class="game-retry-btn" onclick="trivSetDiff(\'' + _tv.diff + '\')">🔄 Try Again</button>';
  }
}

function trivEnd() {
  var el = document.getElementById('trivBody');
  if (!el) return;
  el.innerHTML = '<div class="game-end">'
    + '<div class="game-end-ico">🏆</div>'
    + '<div class="game-end-title">Round Complete!</div>'
    + '<div class="game-end-row">Score: <b>' + _tv.score + ' / ' + _tv.pool.length + '</b></div>'
    + '<div class="game-end-row">Best ever: <b>' + _tv.hs + '</b></div>'
    + '<div class="game-end-row">Final streak: <b>🔥 ' + _tv.streak + '</b></div>'
    + '<button class="game-retry-btn" onclick="trivSetDiff(\'' + _tv.diff + '\')">🔄 Play Again</button>'
    + '</div>';
}

function _tvEsc(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

