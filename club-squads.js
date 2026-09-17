/* OBITREND FOOTBALL WORLD 27 — CLUB SQUADS / STARTING XI ADAPTER */
(function(){
'use strict';
if(window.__obiClubSquads)return;
window.__obiClubSquads=true;

const source=()=>Array.isArray(window.OBITREND_REAL_PLAYERS)?window.OBITREND_REAL_PLAYERS:[];
const find=(name,pos)=>source().find(p=>p.name===name)||source().find(p=>p.pos===pos)||source()[0];

const CLUBS={
 'Real Madrid':[
  ['Thibaut Courtois','GK'],['Trent Alexander-Arnold','RB'],['William Saliba','CB'],['Marquinhos','CB'],['Theo Hernández','LB'],
  ['Jude Bellingham','CAM'],['Rodri','CDM'],['Kevin De Bruyne','CM'],['Lamine Yamal','RW'],['Vinícius Jr.','LW'],['Kylian Mbappé','ST']
 ],
 'Manchester City':[
  ['Gianluigi Donnarumma','GK'],['Achraf Hakimi','RB'],['Virgil van Dijk','CB'],['Gabriel','CB'],['Nuno Mendes','LB'],
  ['Rodri','CDM'],['Pedri','CM'],['Bruno Fernandes','CAM'],['Mohamed Salah','RW'],['Ousmane Dembélé','LW'],['Erling Haaland','ST']
 ],
 'FC Barcelona':[
  ['Thibaut Courtois','GK'],['Achraf Hakimi','RB'],['Marquinhos','CB'],['William Saliba','CB'],['Nuno Mendes','LB'],
  ['Rodri','CDM'],['Pedri','CM'],['Jude Bellingham','CAM'],['Lamine Yamal','RW'],['Vinícius Jr.','LW'],['Victor Osimhen','ST']
 ],
 'Paris Saint-Germain':[
  ['Gianluigi Donnarumma','GK'],['Achraf Hakimi','RB'],['Marquinhos','CB'],['William Saliba','CB'],['Nuno Mendes','LB'],
  ['Vitinha','CM'],['Rodri','CDM'],['Bruno Fernandes','CAM'],['Ousmane Dembélé','RW'],['Mohamed Salah','LW'],['Erling Haaland','ST']
 ],
 'Liverpool':[
  ['Thibaut Courtois','GK'],['Trent Alexander-Arnold','RB'],['Virgil van Dijk','CB'],['Gabriel','CB'],['Theo Hernández','LB'],
  ['Vitinha','CM'],['Kevin De Bruyne','CM'],['Bruno Fernandes','CAM'],['Mohamed Salah','RW'],['Vinícius Jr.','LW'],['Victor Osimhen','ST']
 ],
 'Galatasaray':[
  ['Gianluigi Donnarumma','GK'],['Achraf Hakimi','RB'],['Virgil van Dijk','CB'],['Gabriel','CB'],['Nuno Mendes','LB'],
  ['Rodri','CDM'],['Pedri','CM'],['Bruno Fernandes','CAM'],['Lamine Yamal','RW'],['Ousmane Dembélé','LW'],['Victor Osimhen','ST']
 ]
};

function normalize(list){return list.map(x=>find(x[0],x[1])).filter(Boolean)}
function applyClub(side,club){
 const list=normalize(CLUBS[club]||CLUBS['Real Madrid']);
 const nodes=[...document.querySelectorAll('.obiFifaPlayer.'+side)];
 if(nodes.length<11)return false;
 nodes.slice(0,11).forEach((el,i)=>{
  const p=list[i]; if(!p)return;
  el.dataset.player=p.name;el.dataset.club=p.club;el.dataset.nation=p.nation;el.dataset.playerPos=p.pos;
  el.dataset.ovr=p.ovr;el.dataset.pace=p.pac;el.dataset.shooting=p.sho;el.dataset.passing=p.pas;el.dataset.dribbling=p.dri;el.dataset.defending=p.def;el.dataset.physical=p.phy;
  const n=el.querySelector('.name');if(n)n.textContent=p.name;
  el.title=p.name+' • '+p.pos+' • OVR '+p.ovr+' • '+p.club;
  el.classList.add('realPlayer');
 });
 return true;
}
function apply(homeClub,awayClub){
 if(!applyClub('home',homeClub))return false;
 if(!applyClub('away',awayClub))return false;
 window.OBITREND_MATCH_TEAMS={home:homeClub,away:awayClub};
 const hud=document.querySelector('#obiFifaHUD .teams');if(hud)hud.textContent=homeClub.toUpperCase()+'  VS  '+awayClub.toUpperCase();
 return true;
}
window.OBITREND_CLUB_SQUADS=CLUBS;
window.OBITREND_APPLY_CLUBS=apply;
window.OBITREND_CLUB_NAMES=()=>Object.keys(CLUBS);
})();
