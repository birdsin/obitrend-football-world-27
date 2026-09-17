/* OBITREND FOOTBALL WORLD 27 — MATCH ENGINE BRIDGE v2
   Applies real-player attributes to the existing match actions without
   replacing the controller or match engine.
*/
(function(){
'use strict';
if(window.__obiMatchEngineBridge)return;
window.__obiMatchEngineBridge=true;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
let lastId='',lastSwitch=0;
const originals={};
function getState(){try{return window.state||(typeof state!=='undefined'?state:null)}catch(e){return null}}
function controlled(){return $('.obiFifaPlayer.home.controlled.realPlayer')||$('.obiFifaPlayer.controlled.realPlayer')}
function profile(el=controlled()){
 if(!el)return null;
 return {
  el,
  name:el.dataset.player||el.dataset.name||el.querySelector('.name')?.textContent||'PLAYER',
  position:el.dataset.playerPos||el.dataset.position||'PLAYER',
  ovr:+el.dataset.ovr||+el.dataset.overall||70,
  pace:+el.dataset.pace||70,
  shooting:+el.dataset.shooting||70,
  passing:+el.dataset.passing||70,
  dribbling:+el.dataset.dribbling||70,
  defending:+el.dataset.defending||70,
  physical:+el.dataset.physical||70
 }
}
function sync(reason){
 const p=profile(),s=getState();if(!p)return null;
 p.el.dataset.engineLinked='true';p.el.dataset.engineSync=String(Date.now());
 if(s){
  s.obiControlledPlayer=p.name;s.obiControlledPosition=p.position;s.obiControlledOVR=p.ovr;
  s.obiControlledPAC=p.pace;s.obiControlledSHO=p.shooting;s.obiControlledPAS=p.passing;
  s.obiControlledDRI=p.dribbling;s.obiControlledDEF=p.defending;s.obiControlledPHY=p.physical;
  s.obiSwitchReason=reason||'sync';
 }
 if(p.name!==lastId){lastId=p.name;p.el.setAttribute('aria-label','Controlled player: '+p.name)}
 return p
}
function quality(kind){
 const p=profile();if(!p)return 1;
 const key=kind==='pass'||kind==='through'?'passing':kind==='shoot'?'shooting':kind==='tackle'?'defending':'dribbling';
 return clamp(.58+(p[key]/100)*.52,.58,1.10)
}
function direction(){
 const s=getState();if(!s)return {x:1,y:0};
 const x=Number(s.dirX),y=Number(s.dirY),m=Math.hypot(x,y);
 return m>.01?{x:x/m,y:y/m}:{x:1,y:0}
}
function wrapAction(name,kind){
 if(originals[name]||typeof window[name]!=='function')return;
 originals[name]=window[name];
 window[name]=function(...args){
  const p=sync(kind+'-action'),s=getState(),q=quality(kind);
  if(s){
   s.obiActionQuality=q;s.obiActionPlayer=p?.name||'';s.obiActionKind=kind;
   s.obiActionRating=kind==='shoot'?p?.shooting:kind==='pass'||kind==='through'?p?.passing:kind==='tackle'?p?.defending:p?.dribbling;
  }
  if(p?.el){p.el.dataset.engineAction=kind;p.el.dataset.engineQuality=q.toFixed(3)}
  return originals[name].apply(this,args);
 }
}
function installActions(){
 ['passBall','shootBall','throughBall','tackle','skill'].forEach(n=>{
  const kind=n==='passBall'?'pass':n==='shootBall'?'shoot':n==='throughBall'?'through':n==='tackle'?'tackle':'skill';
  wrapAction(n,kind)
 })
}
function installSwitch(){
 if(typeof window.switchPlayer!=='function'||window.__obiBridgeSwitch)return;
 window.__obiBridgeSwitch=true;
 const original=window.switchPlayer;window.__obiOriginalSwitchPlayer=original;
 window.switchPlayer=function(...args){
  const now=performance.now();if(now-lastSwitch<90)return sync('switch-debounce');
  lastSwitch=now;const result=original.apply(this,args);setTimeout(()=>sync('player-switch'),0);return result
 }
}
function tick(){
 installSwitch();installActions();const p=sync('tick');
 if(!p)return;
 const s=getState();
 p.el.style.setProperty('--obi-engine-quality',quality('pass').toFixed(3));
 p.el.style.setProperty('--obi-engine-pace',String(p.pace));
 p.el.style.setProperty('--obi-engine-shooting',String(p.shooting));
 p.el.style.setProperty('--obi-engine-passing',String(p.passing));
 p.el.style.setProperty('--obi-engine-dribbling',String(p.dribbling));
 p.el.style.setProperty('--obi-engine-defending',String(p.defending));
 p.el.style.setProperty('--obi-engine-physical',String(p.physical));
 if(s&&typeof s.speed==='number'){
  const stamina=Number(p.el.dataset.matchStaminaValue||p.el.dataset.matchStamina||100);
  const fatigue=stamina<25?.82:stamina<50?.91:1;
  const pace=.78+(p.pace/99)*.42;
  s.speed=clamp(.058*pace*fatigue*(s.sprinting?1.12:1),.035,.105)
 }
}
function css(){
 if($('#obiMatchEngineStyle'))return;
 const st=document.createElement('style');st.id='obiMatchEngineStyle';st.textContent=`
 .obiFifaPlayer.realPlayer.controlled .name{letter-spacing:.1px}
 .obiFifaPlayer.realPlayer[data-engine-action="shoot"] .kit{transform:scale(1.035)}
 .obiFifaPlayer.realPlayer[data-engine-action="skill"] .kit{transform:scale(1.025) rotate(-1deg)}
 `;document.head.appendChild(st)
}
function init(){css();tick();setInterval(tick,180)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.OBITREND_MATCH_ENGINE={
 sync,
 controlled:()=>profile(),
 switchPlayer:()=>window.switchPlayer?.(),
 actionQuality:quality,
 isLinked:()=>!!controlled()?.dataset.engineLinked
};
})();