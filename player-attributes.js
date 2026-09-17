/* OBITREND FOOTBALL WORLD 27 — REAL PLAYER ATTRIBUTE GAMEPLAY */
(function(){
'use strict';
if(window.__obiPlayerAttributes)return;
window.__obiPlayerAttributes=true;

const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const getState=()=>{try{return window.state||(typeof state!=='undefined'?state:null)}catch(e){return null}};
const active=()=>document.querySelector('.obiFifaPlayer.home.controlled.realPlayer')||document.querySelector('.obiFifaPlayer.controlled.realPlayer');
const stat=(el,key,fallback=70)=>clamp(el?.dataset?.[key]??fallback,1,99);
let lastPlayer=null,lastT=0;

function profile(){
 const el=active();if(!el)return null;
 return {el,name:el.dataset.player||'Player',ovr:stat(el,'ovr'),pace:stat(el,'pace'),shooting:stat(el,'shooting'),passing:stat(el,'passing'),dribbling:stat(el,'dribbling'),defending:stat(el,'defending'),physical:stat(el,'physical')};
}

function installAction(name,kind){
 const key='__obiOriginal_'+name;
 if(window[key]||typeof window[name]!=='function')return;
 window[key]=window[name];
 window[name]=function(...args){
  const p=profile(),now=performance.now();
  if(p&&now-lastT>90){
   lastT=now;lastPlayer=p.name;
   const s=getState();
   if(s){
    s.obiLastAction=kind;
    s.obiActionPlayer=p.name;
    s.obiActionRating=kind==='shoot'?p.shooting:kind==='pass'||kind==='through'?p.passing:kind==='tackle'?p.defending:p.dribbling;
    s.obiActionQuality=clamp((s.obiActionRating-50)/50,.15,1);
   }
   p.el.dataset.lastAction=kind;
   p.el.classList.add('obi-action');
   setTimeout(()=>p.el.classList.remove('obi-action'),180);
  }
  return window[key].apply(this,args);
 };
}

function css(){
 if(document.getElementById('obiPlayerAttributeStyle'))return;
 const s=document.createElement('style');s.id='obiPlayerAttributeStyle';s.textContent=`
 .obiFifaPlayer.realPlayer.obi-action .kit{filter:brightness(1.2);transform:scale(1.04)}
 .obiFifaPlayer.realPlayer[data-match-stamina="low"] .kit{filter:saturate(.65) brightness(.85)}
 `;document.head.appendChild(s);
}

function tick(){
 const p=profile(),s=getState();
 if(!p||!s)return;
 const now=performance.now(),dt=Math.min(.08,Math.max(.001,(now-(tick.last||now))/1000));tick.last=now;
 let stamina=Number(p.el.dataset.matchStamina||100);
 const sprint=!!s.sprinting;
 if(sprint)stamina-=dt*(5.2-(p.physical-50)*.035);
 else stamina+=dt*(1.35+(100-p.physical)*.002);
 stamina=clamp(stamina,0,100);p.el.dataset.matchStamina=stamina.toFixed(1);p.el.dataset.matchStaminaLabel=Math.round(stamina);
 p.el.dataset.matchStamina=stamina<25?'low':stamina.toFixed(1);
 const speedBase=.058;
 const paceFactor=.78+(p.pace/99)*.42;
 const fatigue=stamina<25?.78:stamina<50?.9:1;
 if(typeof s.speed==='number'&&s.moving)s.speed=speedBase*paceFactor*fatigue*(sprint?1.82:1);
 const stats=document.getElementById('obiFifaStats');
 if(stats)stats.textContent=p.name+' • OVR '+p.ovr+' • PAC '+p.pace+' • SHO '+p.shooting+' • PAS '+p.passing+' • DRI '+p.dribbling+' • DEF '+p.defending+' • PHY '+p.physical+' • STA '+Math.round(stamina);
}

function init(){
 css();
 ['passBall','shootBall','throughBall','tackle','skill'].forEach(n=>installAction(n,n.replace('Ball','').replace('through','through')));
 setInterval(tick,80);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.OBITREND_PLAYER_PROFILE=profile;
})();
