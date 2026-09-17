/* OBITREND FOOTBALL WORLD 27 — BENCH + SUBSTITUTIONS */
(function(){
'use strict';
if(window.__obiSubstitutions)return;
window.__obiSubstitutions=true;

const REAL=()=>window.OBITREND_REAL_PLAYERS||[];
const $=id=>document.getElementById(id);
let open=false, bench=[], used=0;

function css(){
 if($('obiSubsStyle'))return;
 const s=document.createElement('style');s.id='obiSubsStyle';s.textContent=`
 #obiSubsBtn{position:fixed;left:50%;bottom:max(76px,calc(76px + env(safe-area-inset-bottom)));transform:translateX(-50%);z-index:145;padding:10px 15px;border:1px solid #ffffff35;border-radius:12px;background:#071018ee;color:#fff;font-size:10px;font-weight:1000;box-shadow:0 8px 22px #0008;display:none}
 #obiSubsBtn.show{display:block}
 #obiSubs{position:fixed;inset:0;z-index:260;display:none;align-items:center;justify-content:center;background:#000d;backdrop-filter:blur(9px);padding:16px}
 #obiSubs.show{display:flex}.obiSubsCard{width:min(560px,96vw);max-height:88vh;overflow:auto;background:#0b1119;border:1px solid #ffffff22;border-radius:20px;padding:16px;box-shadow:0 25px 80px #000b}.obiSubsHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.obiSubsHead strong{font-size:18px}.obiSubsHead span{font-size:9px;opacity:.55}.obiSubsGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.obiSubItem{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border:1px solid #ffffff18;border-radius:12px;background:#ffffff07}.obiSubItem b{display:block;font-size:10px}.obiSubItem small{font-size:7px;opacity:.55}.obiSubItem button{border:0;border-radius:8px;padding:8px 9px;background:#e3262e;color:#fff;font-size:8px;font-weight:1000}.obiSubClose{width:100%;margin-top:12px;padding:11px;border:1px solid #ffffff20;border-radius:10px;background:#ffffff0d;color:#fff;font-weight:1000}
 @media(max-width:520px){.obiSubsGrid{grid-template-columns:1fr}.obiSubsCard{max-height:84vh}}
 `;document.head.appendChild(s);
}

function getProfiles(){
 const list=REAL();return Array.isArray(list)?list:[];
}
function makeBench(){
 const all=getProfiles();
 const active=new Set();
 document.querySelectorAll('.obiFifaPlayer.realPlayer').forEach(e=>{if(e.dataset.playerId)active.add(e.dataset.playerId)});
 bench=all.filter(p=>!active.has(String(p.id||p.name))).slice(0,12);
 if(bench.length<12)bench=all.slice(0,12);
}
function ensure(){
 css();
 if(!$('obiSubsBtn')){const b=document.createElement('button');b.id='obiSubsBtn';b.textContent='🔄  BENCH / SUBSTITUTIONS';b.onclick=()=>toggle(true);document.body.appendChild(b)}
 if(!$('obiSubs')){const x=document.createElement('div');x.id='obiSubs';x.innerHTML='<div class="obiSubsCard"><div class="obiSubsHead"><strong>TEAM BENCH</strong><span id="obiSubsCount">0 / 5 substitutions</span></div><div id="obiSubsGrid" class="obiSubsGrid"></div><button class="obiSubClose" id="obiSubsClose">CLOSE</button></div>';document.body.appendChild(x);$('obiSubsClose').onclick=()=>toggle(false)}
}
function isGame(){const g=$('game');return g&&getComputedStyle(g).display!=='none'}
function selectedEl(){return document.querySelector('.obiFifaPlayer.home.controlled')||document.querySelector('.obiFifaPlayer.home')}
function render(){
 ensure();makeBench();const grid=$('obiSubsGrid');if(!grid)return;grid.innerHTML='';$('obiSubsCount').textContent=used+' / 5 substitutions';
 bench.forEach((p,i)=>{const item=document.createElement('div');item.className='obiSubItem';const name=p.name||('Player '+(i+1));item.innerHTML='<div><b></b><small></small></div><button>SUB IN</button>';item.querySelector('b').textContent=name;item.querySelector('small').textContent=(p.position||'PLAYER')+' • OVR '+(p.overall??p.ovr??'—');item.querySelector('button').onclick=()=>subIn(p);grid.appendChild(item)})
}
function applyProfile(el,p){
 if(!el||!p)return;
 const id=String(p.id||p.name||'');el.dataset.playerId=id;el.dataset.realPlayer='true';el.classList.add('realPlayer');
 el.dataset.name=p.name||'';el.dataset.position=p.position||p.pos||'';el.dataset.overall=p.overall??p.ovr??'';el.dataset.pace=p.pace??p.PAC??'';el.dataset.shooting=p.shooting??p.SHO??'';el.dataset.passing=p.passing??p.PAS??'';el.dataset.dribbling=p.dribbling??p.DRI??'';el.dataset.defending=p.defending??p.DEF??'';el.dataset.physical=p.physical??p.PHY??'';el.dataset.matchStamina='100';
 const n=el.querySelector('.name');if(n)n.textContent=p.name||'PLAYER';
}
function subIn(p){
 if(used>=5){flash('Maximum 5 substitutions reached');return}
 const el=selectedEl();if(!el){flash('Start a match first');return}
 const old=el.dataset.name||el.querySelector('.name')?.textContent||'PLAYER';applyProfile(el,p);used++;bench=bench.filter(x=>String(x.id||x.name)!==String(p.id||p.name));render();flash(p.name+' replaces '+old);toggle(false);
 if(window.OBITREND_ACTIVE_PLAYER)window.OBITREND_ACTIVE_PLAYER=p;
}
function flash(t){if(typeof window.showMessage==='function')window.showMessage(t);else console.log(t)}
function toggle(v){open=!!v;if(open&&!isGame()){flash('Open a match to use substitutions');return}if(open)render();const e=$('obiSubs');if(e)e.classList.toggle('show',open)}
function sync(){ensure();$('obiSubsBtn')?.classList.toggle('show',isGame());if(!isGame()&&open)toggle(false)}
window.OBITREND_SUBSTITUTIONS={open:()=>toggle(true),close:()=>toggle(false),reset:()=>{used=0;bench=[];render()}};
document.addEventListener('click',e=>{if(e.target.closest('#obiSubsBtn'))return});
setInterval(sync,700);
})();