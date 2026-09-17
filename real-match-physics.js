/* OBITREND FOOTBALL WORLD 27 — ATTRIBUTE-DRIVEN BALL PHYSICS */
(function(){
'use strict';
if(window.__obiRealMatchPhysics)return;
window.__obiRealMatchPhysics=true;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const getState=()=>{try{return window.state||(typeof state!=='undefined'?state:null)}catch(e){return null}};
const active=()=>window.OBITREND_PLAYER_PROFILE||window.OBITREND_ACTIVE_PLAYER||null;
const q=()=>window.OBITREND_MATCH_ENGINE;
const quality=k=>q&&typeof q.actionQuality==='function'?clamp(q.actionQuality(k),.58,1.10):1;

function profile(){
 const p=active();
 return p?{
  name:p.name||'PLAYER',pace:+p.pace||70,shooting:+p.shooting||70,
  passing:+p.passing||70,dribbling:+p.dribbling||70,defending:+p.defending||70,
  physical:+p.physical||70
 }:null;
}

function kickVector(power,accuracy){
 const s=getState(),p=profile();
 if(!s||!p)return null;
 const mx=Number(s.lastMoveX)||0,my=Number(s.lastMoveY)||0;
 const len=Math.hypot(mx,my)||1;
 const dirX=mx/len,dirY=my/len;
 const spread=(1-(accuracy||1))*.32;
 const seed=((performance.now()%997)/997)-.5;
 return {x:dirX+(seed*spread),y:dirY+(seed*spread),power:power*accuracy};
}

function applyAction(kind){
 const s=getState(),p=profile();if(!s||!p)return;
 const mult=quality(kind);
 s.obiPhysics={kind,player:p.name,rating:kind==='shoot'?p.shooting:kind==='pass'||kind==='through'?p.passing:kind==='tackle'?p.defending:p.dribbling,multiplier:mult,time:Date.now()};
 if(kind==='shoot'){
  s.obiShotPower=clamp((.82+p.shooting/100*.42)*mult,.75,1.55);
  s.obiShotAccuracy=clamp(.62+p.shooting/100*.38,.62,1);
 }
 if(kind==='pass'||kind==='through'){
  s.obiPassPower=clamp((.72+p.passing/100*.42)*mult,.65,1.45);
  s.obiPassAccuracy=clamp(.65+p.passing/100*.35,.65,1);
 }
 if(kind==='skill')s.obiSkillBurst=clamp(.95+p.dribbling/100*.45,.95,1.40)*mult;
 if(kind==='tackle')s.obiTackleQuality=clamp(.70+p.defending/100*.42,.70,1.12)*mult;
}

function wrap(name,kind){
 const old=window[name];if(typeof old!=='function'||old.__obiPhysicsWrapped)return;
 const fn=function(){applyAction(kind);return old.apply(this,arguments)};fn.__obiPhysicsWrapped=true;window[name]=fn;
}

function tick(){
 const s=getState(),p=profile();
 if(s&&p){
  const stamina=clamp(Number(s.obiMatchStaminaValue??p.stamina??100),0,100);
  const fatigue=stamina<20?.80:stamina<40?.89:stamina<60?.95:1;
  const pace=.72+(p.pace/99)*.38;
  if(s.moving)s.speed=clamp((s.sprinting?0.105:0.058)*pace*fatigue,.032,.12);
 }
 requestAnimationFrame(tick);
}

function init(){
 wrap('passBall','pass');wrap('throughBall','through');wrap('shootBall','shoot');wrap('skill','skill');wrap('tackle','tackle');
 window.OBITREND_REAL_MATCH_PHYSICS={profile,applyAction,quality};
 requestAnimationFrame(tick);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
