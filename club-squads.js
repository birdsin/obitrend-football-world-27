/* OBITREND FOOTBALL WORLD 27 — CLUB SQUADS / STARTING XI ADAPTER */
(function(){
'use strict';
if(window.__obiClubSquads)return;
window.__obiClubSquads=true;
const source=()=>Array.isArray(window.OBITREND_REAL_PLAYERS)?window.OBITREND_REAL_PLAYERS:[];
const find=name=>source().find(p=>p.name===name)||null;
const CLUBS={
 'Real Madrid':['Thibaut Courtois','Trent Alexander-Arnold','William Saliba','Marquinhos','Theo Hernández','Rodri','Jude Bellingham','Kevin De Bruyne','Lamine Yamal','Vinícius Jr.','Kylian Mbappé'],
 'Manchester City':['Gianluigi Donnarumma','Achraf Hakimi','Virgil van Dijk','Gabriel','Nuno Mendes','Rodri','Pedri','Bruno Fernandes','Mohamed Salah','Ousmane Dembélé','Erling Haaland'],
 'FC Barcelona':['Thibaut Courtois','Achraf Hakimi','Marquinhos','William Saliba','Nuno Mendes','Rodri','Pedri','Jude Bellingham','Lamine Yamal','Vinícius Jr.','Victor Osimhen'],
 'Paris Saint-Germain':['Gianluigi Donnarumma','Achraf Hakimi','Marquinhos','William Saliba','Nuno Mendes','Vitinha','Rodri','Bruno Fernandes','Ousmane Dembélé','Mohamed Salah','Erling Haaland'],
 'Liverpool':['Thibaut Courtois','Trent Alexander-Arnold','Virgil van Dijk','Gabriel','Theo Hernández','Vitinha','Kevin De Bruyne','Bruno Fernandes','Mohamed Salah','Vinícius Jr.','Victor Osimhen'],
 'Galatasaray':['Gianluigi Donnarumma','Achraf Hakimi','Virgil van Dijk','Gabriel','Nuno Mendes','Rodri','Pedri','Bruno Fernandes','Lamine Yamal','Ousmane Dembélé','Victor Osimhen']
};
function applyClub(side,club){
 const list=(CLUBS[club]||[]).map(find).filter(Boolean),nodes=[...document.querySelectorAll('.obiFifaPlayer.'+side)];
 if(nodes.length<11||list.length<11)return false;
 nodes.slice(0,11).forEach((el,i)=>{const p=list[i];el.dataset.player=p.name;el.dataset.club=p.club;el.dataset.nation=p.nation;el.dataset.playerPos=p.pos;el.dataset.ovr=p.ovr;el.dataset.pace=p.pac;el.dataset.shooting=p.sho;el.dataset.passing=p.pas;el.dataset.dribbling=p.dri;el.dataset.defending=p.def;el.dataset.physical=p.phy;const n=el.querySelector('.name');if(n)n.textContent=p.name;el.classList.add('realPlayer')});
 return true;
}
function apply(homeClub,awayClub){if(!applyClub('home',homeClub)||!applyClub('away',awayClub))return false;window.OBITREND_MATCH_TEAMS={home:homeClub,away:awayClub};const hud=document.querySelector('#obiFifaHUD .teams');if(hud)hud.textContent=homeClub.toUpperCase()+'  VS  '+awayClub.toUpperCase();return true}
window.OBITREND_CLUB_SQUADS=CLUBS;window.OBITREND_APPLY_CLUBS=apply;window.OBITREND_CLUB_NAMES=()=>Object.keys(CLUBS);
})();
