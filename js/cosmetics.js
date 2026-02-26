/* ═══════════════════════════════════════════════════
   VICTOR COIN — Profile Cosmetics
   Rings · Frames · Orbiting Badges
   Permanent purchases stored in Firebase
═══════════════════════════════════════════════════ */

var COSMETIC_RINGS = [
  {id:'ring_gold',    name:'Gold Ring',    price:1000000, css:'ring-gold',    desc:'Shimmering gold glow'},
  {id:'ring_fire',    name:'Fire Ring',    price:1000000, css:'ring-fire',    desc:'Blazing flame border'},
  {id:'ring_ice',     name:'Ice Ring',     price:1000000, css:'ring-ice',     desc:'Frozen crystal pulse'},
  {id:'ring_galaxy',  name:'Galaxy Ring',  price:1000000, css:'ring-galaxy',  desc:'Deep space swirl'},
  {id:'ring_royal',   name:'Royal Ring',   price:1000000, css:'ring-royal',   desc:'Purple royal gleam'},
  {id:'ring_neon',    name:'Neon Ring',    price:1000000, css:'ring-neon',    desc:'Electric neon buzz'}
];

var COSMETIC_FRAMES = [
  {id:'frame_hex',    name:'Hexagon',      price:3000000, css:'frame-hex',    desc:'Sharp hex warrior frame'},
  {id:'frame_star',   name:'Star',         price:3000000, css:'frame-star',   desc:'Five-point star frame'},
  {id:'frame_crown',  name:'Crown',        price:3000000, css:'frame-crown',  desc:'Royal crown frame'}
];

var COSMETIC_ORBITERS = [
  {id:'orb_coin',     name:'Coin Orbit',   price:5000000, emoji:'🪙', desc:'Coins orbit your avatar'},
  {id:'orb_diamond',  name:'Diamond Orbit',price:5000000, emoji:'💎', desc:'Diamonds circle you'},
  {id:'orb_star',     name:'Star Orbit',   price:5000000, emoji:'⭐', desc:'Stars swirl around you'},
  {id:'orb_crown',    name:'Crown Orbit',  price:5000000, emoji:'👑', desc:'Crowns float around you'}
];

/* ── INIT ── */
function initCosmetics(){
  if(!G.cosmetics) G.cosmetics={
    ring:null, frame:null, orbiter:null,
    owned:[]
  };
  if(!G.cosmetics.owned) G.cosmetics.owned=[];
}

function hasCosmetic(id){ initCosmetics(); return G.cosmetics.owned.indexOf(id)!==-1; }

/* ── BUY COSMETIC ── */
function buyCosmetic(id){
  initCosmetics();
  var all=[].concat(COSMETIC_RINGS,COSMETIC_FRAMES,COSMETIC_ORBITERS);
  var item=all.find(function(c){return c.id===id;});
  if(!item){toast('Item not found','#FF453A');return;}
  if(hasCosmetic(id)){toast('Already owned!','#FF9F0A');return;}
  if(G.vk<item.price){toast('Need '+fm(item.price)+' VK','#FF453A');return;}
  G.vk-=item.price;
  G.cosmetics.owned.push(id);
  sv();renderAll();
  // Auto-equip
  equipCosmetic(id,false);
  toast('✨ '+item.name+' unlocked!','#FFD60A');
  renderMallCosmetics();
  if(typeof fbSave==='function') fbSave();
}

/* ── EQUIP COSMETIC ── */
function equipCosmetic(id,rerender){
  initCosmetics();
  if(COSMETIC_RINGS.find(function(r){return r.id===id;}))   G.cosmetics.ring=id;
  if(COSMETIC_FRAMES.find(function(f){return f.id===id;}))  G.cosmetics.frame=id;
  if(COSMETIC_ORBITERS.find(function(o){return o.id===id;}))G.cosmetics.orbiter=id;
  sv();
  applyCosmetics();
  if(rerender!==false) renderMallCosmetics();
}
function unequipCosmetic(type){
  initCosmetics();
  G.cosmetics[type]=null;
  sv(); applyCosmetics(); renderMallCosmetics();
}

/* ── APPLY TO DOM ── */
function applyCosmetics(){
  initCosmetics();
  var avEl=document.getElementById('playerAvatarWrap');
  if(!avEl) return;
  // Remove old classes
  avEl.className='pav';
  // Frame shape
  if(G.cosmetics.frame){
    avEl.classList.add(G.cosmetics.frame);
  }
  // Ring glow
  if(G.cosmetics.ring){
    avEl.classList.add(G.cosmetics.ring);
  }
  // Orbiter
  var oldOrb=document.getElementById('avatarOrbiter');
  if(oldOrb) oldOrb.remove();
  if(G.cosmetics.orbiter){
    var orb=COSMETIC_ORBITERS.find(function(o){return o.id===G.cosmetics.orbiter;});
    if(orb){
      var orbEl=document.createElement('div');
      orbEl.id='avatarOrbiter';
      orbEl.className='av-orbiter';
      orbEl.innerHTML='<span class="orb-item">'+orb.emoji+'</span>'
        +'<span class="orb-item orb-item-2">'+orb.emoji+'</span>'
        +'<span class="orb-item orb-item-3">'+orb.emoji+'</span>';
      avEl.parentNode.style.position='relative';
      avEl.parentNode.insertBefore(orbEl,avEl.nextSibling);
    }
  }
}

/* ── BUILD COSMETIC AVATAR (for profile cards) ── */
function buildCosmeticAvatar(player, size){
  size=size||60;
  var pic=player.profilePic
    ? '<img src="'+player.profilePic+'" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"/>'
    : '<span style="font-size:'+(size*0.4)+'px;">👤</span>';
  var ring=player.cosmetics&&player.cosmetics.ring?player.cosmetics.ring:'';
  var frame=player.cosmetics&&player.cosmetics.frame?player.cosmetics.frame:'';
  var orb=player.cosmetics&&player.cosmetics.orbiter
    ? COSMETIC_ORBITERS.find(function(o){return o.id===player.cosmetics.orbiter;}) : null;
  return '<div class="cosm-av-wrap" style="width:'+size+'px;height:'+size+'px;position:relative;display:inline-block;">'
    +'<div class="pav '+ring+' '+frame+'" style="width:'+size+'px;height:'+size+'px;font-size:'+(size*0.35)+'px;">'+pic+'</div>'
    +(orb?'<div class="av-orbiter av-orbiter-sm"><span class="orb-item">'+orb.emoji+'</span><span class="orb-item orb-item-2">'+orb.emoji+'</span></div>':'')
    +'</div>';
}

/* ── MALL COSMETICS SECTION ── */
function renderMallCosmetics(){
  var el=document.getElementById('mallCosmeticsSection');
  if(!el) return;
  initCosmetics();

  function section(title,items){
    return '<div class="mall-section-title">'+title+'</div>'
      +'<div class="mall-grid">'
      +items.map(function(item){
        var owned=hasCosmetic(item.id);
        var equipped=(G.cosmetics.ring===item.id||G.cosmetics.frame===item.id||G.cosmetics.orbiter===item.id);
        return '<div class="mall-item cosm-item '+(owned?'mall-item-active':'')+' '+(equipped?'cosm-equipped':'')+'">'
          +'<div class="cosm-preview '+(item.css||'')+'">'
          +(item.emoji||'<span style="font-size:1.4rem;">👤</span>')
          +'</div>'
          +'<div class="mall-item-name">'+item.name+'</div>'
          +'<div class="mall-item-desc">'+item.desc+'</div>'
          +(owned
            ? (equipped
              ?'<div class="mall-active-badge">✓ Equipped</div>'
              +'<button class="mall-buy-btn" onclick="unequipCosmetic(\''+(COSMETIC_RINGS.find(function(r){return r.id===item.id;})?'ring':COSMETIC_FRAMES.find(function(f){return f.id===item.id;})?'frame':'orbiter')+'\')">Remove</button>'
              :'<button class="mall-buy-btn" onclick="equipCosmetic(\''+item.id+'\',true)">Equip</button>')
            :'<div class="mall-item-price">'+fm(item.price)+' VK</div>'
            +'<button class="mall-buy-btn '+(G.vk<item.price?'mall-buy-dis':'')+'" onclick="buyCosmetic(\''+item.id+'\')">Buy</button>')
          +'</div>';
      }).join('')
      +'</div>';
  }

  el.innerHTML=section('💍 Rings — Animated Glow',COSMETIC_RINGS)
    +section('🖼️ Frames — Special Shapes',COSMETIC_FRAMES)
    +section('✨ Orbiters — Floating Badges',COSMETIC_ORBITERS);
}

