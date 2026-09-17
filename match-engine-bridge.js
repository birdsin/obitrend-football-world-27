/* OBITREND FOOTBALL WORLD 27 — MATCH ENGINE BRIDGE
   Keeps real-player identity/attributes synchronized with the engine's
   currently controlled player and makes switching deterministic.
*/
(function(){
'use strict';
if(window.__obiMatchEngineBridge)return;
window.__obiMatchEngineBridge=true;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
let lastId='',lastSwitch=0;
function controlled(){return $('.obiFifaPlayer.home.controlled.realPlayer')||$('.obiFifaPlayer.controlled.realPlayer')}
function state(){try{return window.state||(typeof state!=='undefined'?state:null)}catch(e){return null}}
function profile(el){if(!el)return null;return {name:el.dataset.player||el.dataset.name||el.querySelector('.name')?.textContent||'PLAYER',position:el.dataset.playerPos||el.dataset.position||'PLAYER',ovr:+el.dataset.ovr||+el.dataset.overall||70,pace:+el.dataset.pace||70,shooting:+el.dataset.shooting||70,passing:+el.dataset.passing||70,dribbling:+el.dataset.dribbling||70,defending:+el.dataset.defending||70,physical:+el.dataset.physical||70}}
function sync(reason){const el=controlled(),s=state(),p=profile(el);if(!el||!p)return null;el.dataset.engineLinked='true';el.dataset.engineSync=String(Date.now());el.dataset.engineRole=p.position;el.dataset.engineOvr=String(p.ovr);if(s){s.obiControlledPlayer=p.name;s.obiControlledPosition=p.position;s.obiControlledOVR=p.ovr;s.obiControlledPAC=p.pace;s.obiControlledSHO=p.shooting;s.obiControlledPAS=p.passing;s.obiControlledDRI=p.dribbling;s.obiControlledDEF=p.defending;s.obiControlledPHY=p.physical;s.obiSwitchReason=reason||'sync'}if(p.name!==lastId){lastId=p.name;el.setAttribute('aria-label','Controlled player: '+p.name)}return p}
function installSwitch(){if(typeof window.switchPlayer!=='function'||window.__obiBridgeSwitch)return;window.__obiBridgeSwitch=true;const original=window.switchPlayer;window.__obiOriginalSwitchPlayer=original;window.switchPlayer=function(...args){const now=performance.now();if(now-lastSwitch<90)return sync('switch-debounce');lastSwitch=now;const result=original.apply(this,args);setTimeout(()=>sync('player-switch'),0);return result}}
function quality(kind){const p=profile(controlled());if(!p)return 1;const key=kind==='pass'||kind==='through'?'passing':kind==='shoot'?'shooting':kind==='tackle'?'defending':'dribbling';return clamp(.72+(p[key]/100)*.38,.72,1.1)}
function expose(){window.OBITREND_MATCH_ENGINE={sync,controlled:()=>profile(controlled()),switchPlayer:()=>window.switchPlayer?.(),actionQuality:quality,isLinked:()=>!!controlled()?.dataset.engineLinked}}
function tick(){installSwitch();const p=sync('tick');if(p){const el=controlled();const q=quality('pass');el.style.setProperty('--obi-engine-quality',q.toFixed(3));}}
function init(){expose();tick();setInterval(tick,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
