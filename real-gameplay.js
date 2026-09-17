/* OBITREND FOOTBALL WORLD 27 — REAL PLAYER GAMEPLAY ADAPTER
   Makes the currently controlled real player's attributes affect movement,
   sprint feel, stamina presentation and match telemetry without replacing
   the existing match engine or controller workflow.
*/
(function(){
'use strict';
if(window.__obiRealGameplay)return;
window.__obiRealGameplay=true;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
let lastX=null,lastY=null,lastT=0,lastPlayer='';
let profile=null;

function screenIsGame(){
  const g=document.getElementById('game');
  return !!(g&&getComputedStyle(g).display!=='none');
}
function state(){
  try{return window.state||(typeof window.state!=='undefined'?window.state:null)}catch(e){return null}
}
function controlled(){
  const el=document.querySelector('.obiFifaPlayer.controlled.realPlayer');
  if(!el)return null;
  return el;
}
function readProfile(){
  const el=controlled();
  if(!el)return null;
  return {
    name:el.dataset.player||'Player',
    pos:el.dataset.playerPos||'PLAYER',
    ovr:+el.dataset.ovr||70,
    pace:+el.dataset.pace||70,
    shooting:+el.dataset.shooting||70,
    passing:+el.dataset.passing||70,
    dribbling:+el.dataset.dribbling||70,
    defending:+el.dataset.defending||70,
    physical:+el.dataset.physical||70,
    stamina:+el.dataset.stamina||100,
    el
  };
}
function updateTelemetry(p,s){
  if(!p)return;
  p.el.dataset.active='true';
  p.el.dataset.statProfile=JSON.stringify({ovr:p.ovr,pac:p.pace,sho:p.shooting,pas:p.passing,dri:p.dribbling,def:p.defending,phy:p.physical});
  const stats=document.getElementById('obiFifaStats');
  if(stats&&screenIsGame()){
    const stamina=Math.round(Number(p.el.dataset.matchStamina||100));
    const possession=s&&s.possession==='home'?'OBITREND FC':'WORLD XI';
    stats.textContent='OVR '+p.ovr+'  •  PAC '+p.pace+'  •  SHO '+p.shooting+'  •  PAS '+p.passing+'  •  DRI '+p.dribbling+'  •  STA '+stamina+'%  •  '+possession;
  }
  if(lastPlayer!==p.name){
    lastPlayer=p.name;
    p.el.title=p.name+' • '+p.pos+' • OVR '+p.ovr+' • PAC '+p.pace+' • SHO '+p.shooting+' • PAS '+p.passing+' • DRI '+p.dribbling;
  }
}
function applyMovementModifier(now){
  if(!screenIsGame()){
    lastX=lastY=null;
    return;
  }
  const s=state(),p=readProfile();
  if(!s||!p||typeof s.x!=='number'||typeof s.y!=='number')return;
  if(lastX===null){lastX=s.x;lastY=s.y;lastT=now;updateTelemetry(p,s);return;}
  const dx=s.x-lastX,dy=s.y-lastY;
  lastX=s.x;lastY=s.y;lastT=now;
  const moving=Math.hypot(dx,dy)>0.00001;
  if(moving){
    const basePace=80;
    let factor=0.82+(p.pace/100)*0.38;
    if(s.sprinting) factor*=0.92+(p.pace/100)*0.24;
    if(Number(s.x)<5||Number(s.x)>95||Number(s.y)<5||Number(s.y)>95)factor=1;
    s.x=clamp(s.x+dx*(factor-1),5,95);
    s.y=clamp(s.y+dy*(factor-1),5,95);
    if(typeof s.speed==='number')s.speed=0.058*factor;
  }
  const el=p.el;
  let stamina=Number(el.dataset.matchStamina||100);
  if(s.sprinting&&moving){
    stamina-=Math.max(0.35,(105-p.physical)*0.012);
  }else if(!moving){
    stamina+=0.08;
  }else{
    stamina+=0.015;
  }
  stamina=clamp(stamina,0,100);
  el.dataset.matchStamina=stamina.toFixed(1);
  if(stamina<7&&s.sprinting)s.sprinting=false;
  el.style.setProperty('--obi-pace',String(p.pace));
  el.style.setProperty('--obi-shooting',String(p.shooting));
  el.style.setProperty('--obi-passing',String(p.passing));
  el.style.setProperty('--obi-dribbling',String(p.dribbling));
  el.style.setProperty('--obi-physical',String(p.physical));
  el.classList.toggle('obi-low-stamina',stamina<25);
  updateTelemetry(p,s);
}
function installStyle(){
 if(document.getElementById('obiRealGameplayStyle'))return;
 const st=document.createElement('style');st.id='obiRealGameplayStyle';
 st.textContent=`
 .obiFifaPlayer.realPlayer .kit{filter:saturate(calc(.82 + var(--obi-pace,70)*.002));}
 .obiFifaPlayer.realPlayer.obi-low-stamina .kit{filter:grayscale(.18) brightness(.82);}
 .obiFifaPlayer.realPlayer.controlled .name{font-weight:1000;text-shadow:0 1px 3px #000,0 0 5px #ffe52d66;}
 `;
 document.head.appendChild(st);
}
function loop(t){applyMovementModifier(t);requestAnimationFrame(loop)}
function init(){installStyle();requestAnimationFrame(loop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.OBITREND_ACTIVE_PLAYER=()=>readProfile();
})();
