/* OBITREND FOOTBALL WORLD 27 — ATTRIBUTE-DRIVEN MATCH ACTION PHYSICS */
(function(){
'use strict';
if(window.__obiRealMatchPhysics)return;
window.__obiRealMatchPhysics=true;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const getState=()=>{try{return window.state||(typeof state!=='undefined'?state:null)}catch(e){return null}};
const active=()=>window.OBITREND_PLAYER_PROFILE||window.OBITREND_ACTIVE_PLAYER||null;
const engine=()=>window.OBITREND_MATCH_ENGINE||null;
const quality=k=>{const e=engine();return e&&typeof e.actionQuality==='function'?clamp(e.actionQuality(k),.58,1.10):1};

function profile(){
 const p=active();
 return p?{name:p.name||'PLAYER',pace:+p.pace||70,shooting:+p.shooting||70,passing:+p.passing||70,dribbling:+p.dribbling||70,defending:+p.defending||70,physical:+p.physical||70}:null;
}
function rating(kind,p){return kind==='shoot'?p.shooting:kind==='pass'||kind==='through'?p.passing:kind==='tackle'?p.defending:p.dribbling}

/* Feed real attributes into the existing engine's public inputs before each action. */
function prepare(kind){
 const s=getState(),p=profile();if(!s||!p)return null;
 const r=rating(kind,p),mult=quality(kind),old={x:s.lastMoveX,y:s.lastMoveY};
 const x=Number(s.lastMoveX)||0,y=Number(s.lastMoveY)||0,len=Math.hypot(x,y)||1;
 if(kind==='shoot'||kind==='pass'||kind==='through'){
  /* Better technique keeps the chosen direction stable; lower ratings introduce controlled variance. */
  const variance=(1-(clamp(r,1,99)/99))*.16*(1/mult);
  const seed=((Date.now()%997)/997)-.5;
  s.lastMoveX=clamp(x/len+seed*variance,-1,1);
  s.lastMoveY=clamp(y/len+seed*variance,-1,1);
 }
 s.obiPhysics={kind,player:p.name,rating:r,multiplier:mult,time:Date.now()};
 if(kind==='shoot'){
  s.obiShotPower=clamp((.82+r/100*.42)*mult,.75,1.55);
  s.obiShotAccuracy=clamp(.62+r/100*.38,.62,1);
 }
 if(kind==='pass'||kind==='through'){
  s.obiPassPower=clamp((.72+r/100*.42)*mult,.65,1.45);
  s.obiPassAccuracy=clamp(.65+r/100*.35,.65,1);
 }
 if(kind==='skill')s.obiSkillBurst=clamp(.95+r/100*.45,.95,1.40)*mult;
 if(kind==='tackle')s.obiTackleQuality=clamp(.70+r/100*.42,.70,1.12)*mult;
 return old;
}
function restore(old){
 const s=getState();if(!s||!old)return;s.lastMoveX=old.x;s.lastMoveY=old.y;
}
function wrap(name,kind){
 const old=window[name];if(typeof old!=='function'||old.__obiPhysicsWrapped)return;
 const fn=function(){const saved=prepare(kind);try{return old.apply(this,arguments)}finally{restore(saved)}};
 fn.__obiPhysicsWrapped=true;window[name]=fn;
}
function applySkillBurst(){
 const s=getState(),p=profile();if(!s||!p)return;
 const burst=clamp((.75+p.dribbling/99*.55)*quality('skill'),.72,1.35);
 const x=Number(s.lastMoveX)||0,y=Number(s.lastMoveY)||0,len=Math.hypot(x,y)||1;
 if(Math.hypot(x,y)>.08){s.x=clamp((+s.x||50)+(x/len)*1.2*(burst-0.7),5,95);s.y=clamp((+s.y||50)+(y/len)*1.2*(burst-0.7),5,95)}
}
function wrapSkill(){
 const old=window.skill;if(typeof old!=='function'||old.__obiPhysicsWrapped)return;
 const fn=function(){prepare('skill');const out=old.apply(this,arguments);applySkillBurst();return out};fn.__obiPhysicsWrapped=true;window.skill=fn;
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
 wrap('passBall','pass');wrap('throughBall','through');wrap('shootBall','shoot');wrap('tackle','tackle');wrapSkill();
 window.OBITREND_REAL_MATCH_PHYSICS={profile,prepare,quality};
 requestAnimationFrame(tick);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
