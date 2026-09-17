/* OBITREND FOOTBALL WORLD 27 — REAL PLAYER ROSTER LAYER
   Real player names + football attributes. No player photographs or club artwork are bundled.
*/
(function(){
'use strict';
if(window.__obiRealPlayers)return;
window.__obiRealPlayers=true;

const players = [
  {name:'Thibaut Courtois',club:'Real Madrid',nation:'Belgium',pos:'GK',ovr:90,pac:87,sho:89,pas:78,dri:90,def:46,phy:90},
  {name:'Trent Alexander-Arnold',club:'Real Madrid',nation:'England',pos:'RB',ovr:87,pac:79,sho:66,pas:89,dri:82,def:68,phy:70},
  {name:'William Saliba',club:'Real Madrid',nation:'France',pos:'CB',ovr:89,pac:80,sho:35,pas:78,dri:73,def:90,phy:84},
  {name:'Marquinhos',club:'Paris Saint-Germain',nation:'Brazil',pos:'CB',ovr:89,pac:80,sho:45,pas:85,dri:79,def:89,phy:78},
  {name:'Theo Hernández',club:'Al-Hilal',nation:'France',pos:'LB',ovr:86,pac:94,sho:70,pas:79,dri:84,def:74,phy:85},
  {name:'Rodri',club:'Manchester City',nation:'Spain',pos:'CDM',ovr:90,pac:62,sho:78,pas:86,dri:81,def:85,phy:81},
  {name:'Pedri',club:'FC Barcelona',nation:'Spain',pos:'CM',ovr:90,pac:76,sho:75,pas:89,dri:91,def:77,phy:75},
  {name:'Lamine Yamal',club:'FC Barcelona',nation:'Spain',pos:'RW',ovr:90,pac:86,sho:84,pas:87,dri:93,def:38,phy:61},
  {name:'Jude Bellingham',club:'Real Madrid',nation:'England',pos:'CAM',ovr:90,pac:79,sho:86,pas:83,dri:88,def:79,phy:85},
  {name:'Vinícius Jr.',club:'Real Madrid',nation:'Brazil',pos:'LW',ovr:89,pac:93,sho:85,pas:80,dri:91,def:31,phy:71},
  {name:'Victor Osimhen',club:'Galatasaray',nation:'Nigeria',pos:'ST',ovr:85,pac:89,sho:84,pas:65,dri:78,def:51,phy:86},

  {name:'Gianluigi Donnarumma',club:'Manchester City',nation:'Italy',pos:'GK',ovr:89,pac:88,sho:88,pas:75,dri:82,def:48,phy:91},
  {name:'Achraf Hakimi',club:'Paris Saint-Germain',nation:'Morocco',pos:'RB',ovr:89,pac:95,sho:72,pas:83,dri:88,def:71,phy:80},
  {name:'Gabriel',club:'Arsenal',nation:'Brazil',pos:'CB',ovr:88,pac:78,sho:40,pas:72,dri:63,def:91,phy:88},
  {name:'Virgil van Dijk',club:'Liverpool',nation:'Netherlands',pos:'CB',ovr:89,pac:79,sho:55,pas:81,dri:70,def:89,phy:91},
  {name:'Nuno Mendes',club:'Paris Saint-Germain',nation:'Portugal',pos:'LB',ovr:86,pac:93,sho:58,pas:77,dri:87,def:78,phy:77},
  {name:'Kevin De Bruyne',club:'Napoli',nation:'Belgium',pos:'CM',ovr:87,pac:70,sho:88,pas:92,dri:86,def:42,phy:78},
  {name:'Vitinha',club:'Paris Saint-Germain',nation:'Portugal',pos:'CM',ovr:90,pac:79,sho:73,pas:91,dri:92,def:75,phy:70},
  {name:'Mohamed Salah',club:'Liverpool',nation:'Egypt',pos:'RW',ovr:89,pac:90,sho:88,pas:82,dri:90,def:45,phy:75},
  {name:'Bruno Fernandes',club:'Manchester United',nation:'Portugal',pos:'CAM',ovr:89,pac:77,sho:86,pas:92,dri:87,def:65,phy:76},
  {name:'Ousmane Dembélé',club:'Paris Saint-Germain',nation:'France',pos:'LW',ovr:90,pac:93,sho:83,pas:86,dri:93,def:42,phy:67},
  {name:'Erling Haaland',club:'Manchester City',nation:'Norway',pos:'ST',ovr:91,pac:90,sho:92,pas:76,dri:88,def:45,phy:89}
];

function profileFor(index){return players[index] || players[index % players.length]}
function apply(){
  const nodes=[...document.querySelectorAll('.obiFifaPlayer')];
  if(nodes.length!==22)return false;
  nodes.forEach((el,i)=>{
    const p=profileFor(i); el.dataset.player=p.name; el.dataset.club=p.club; el.dataset.nation=p.nation;
    el.dataset.ovr=p.ovr; el.dataset.pace=p.pac; el.dataset.shooting=p.sho; el.dataset.passing=p.pas; el.dataset.dribbling=p.dri; el.dataset.defending=p.def; el.dataset.physical=p.phy;
    const n=el.querySelector('.name'); if(n)n.textContent=p.name;
    el.title=p.name+' • '+p.pos+' • OVR '+p.ovr+' • '+p.club;
    el.setAttribute('aria-label',p.name+' '+p.pos+' overall '+p.ovr);
    el.classList.add('realPlayer');
    const kit=el.querySelector('.kit'); if(kit)kit.style.setProperty('--obi-ovr',String(p.ovr));
  });
  if(!document.getElementById('obiRealPlayerStyle')){
    const s=document.createElement('style');s.id='obiRealPlayerStyle';s.textContent=`
      .obiFifaPlayer.realPlayer .name{font-size:7px;opacity:1;letter-spacing:.1px}
      .obiFifaPlayer.realPlayer .kit{box-shadow:0 3px 6px #0008, inset 0 calc((var(--obi-ovr) - 70px)*.02px) 0 #fff2}
      .obiRealCard{position:absolute;left:50%;top:78px;transform:translateX(-50%);z-index:75;min-width:230px;padding:9px 12px;border-radius:12px;background:#05070dea;border:1px solid #ffe52d66;color:#fff;display:none;pointer-events:none;text-align:center;box-shadow:0 8px 30px #0008;font-family:Arial,sans-serif}
      .obiRealCard.show{display:block}.obiRealCard b{display:block;font-size:12px}.obiRealCard span{font-size:8px;opacity:.78}.obiRealCard em{font-style:normal;font-size:9px;color:#ffe52d;font-weight:1000}
    `;document.head.appendChild(s);
  }
  return true;
}
function showCard(){
  const game=document.getElementById('game'); if(!game)return;
  let card=document.getElementById('obiRealCard');
  if(!card){card=document.createElement('div');card.id='obiRealCard';card.className='obiRealCard';game.appendChild(card)}
  const nodes=[...document.querySelectorAll('.obiFifaPlayer')];
  const active=nodes.find(x=>x.classList.contains('controlled'));
  if(!active){card.classList.remove('show');return}
  card.innerHTML='<b>'+active.dataset.player+'</b><span>'+active.dataset.nation+' • '+active.dataset.club+' • '+active.dataset.playerPos+'</span><br><em>OVR '+active.dataset.ovr+' • PAC '+active.dataset.pace+' • SHO '+active.dataset.shooting+' • PAS '+active.dataset.passing+' • DRI '+active.dataset.dribbling+'</em>';
  card.classList.add('show');
}
function watch(){
  apply();
  const mo=new MutationObserver(()=>{if(apply())showCard()});
  mo.observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{if(apply())showCard()},1000);
}
window.OBITREND_REAL_PLAYERS=players;
window.showRealPlayerCard=showCard;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
