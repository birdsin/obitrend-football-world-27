/* OBITREND FOOTBALL WORLD 27 — EXACT PS5 TOUCH CONTROLLER RESTORE */
(function(){
'use strict';
if(window.__obiControllerRestore)return;
window.__obiControllerRestore=true;

function gameOn(){
 const g=document.getElementById('game');
 return !!(g&&getComputedStyle(g).display!=='none');
}

function installStyle(){
 let s=document.getElementById('obiControllerRestoreStyle');
 if(!s){s=document.createElement('style');s.id='obiControllerRestoreStyle';document.head.appendChild(s)}
 s.textContent=`
#virtualPS5{
 position:fixed!important;inset:0!important;z-index:1200!important;
 font-family:Arial,sans-serif!important;pointer-events:none!important;
}
#virtualPS5.obi-controller-visible{display:block!important}
#virtualPS5.obi-controller-hidden{display:none!important}
#vL{position:absolute!important;left:max(14px,env(safe-area-inset-left))!important;bottom:max(14px,env(safe-area-inset-bottom))!important;width:120px!important;height:120px!important;border-radius:50%!important;background:#07100dcc!important;border:2px solid #ffffff38!important;box-shadow:inset 0 0 25px #0008!important;pointer-events:auto!important;touch-action:none!important}
#vS{position:absolute!important;left:50%!important;top:50%!important;width:52px!important;height:52px!important;transform:translate(-50%,-50%)!important;border-radius:50%!important;background:#ffffff55!important;border:1px solid #fff8!important;pointer-events:none!important}
#vR{position:absolute!important;right:12px!important;bottom:14px!important;width:185px!important;height:185px!important;pointer-events:none!important;touch-action:none!important}
#virtualPS5 .vb{position:absolute!important;width:58px!important;height:58px!important;border-radius:50%!important;background:#07100ddd!important;color:#fff!important;border:1px solid #ffffff45!important;font-size:13px!important;font-weight:1000!important;pointer-events:auto!important;touch-action:none!important;box-shadow:0 5px 14px #0008!important}
#virtualPS5 #vX{right:5px!important;top:63px!important}#virtualPS5 #vO{right:63px!important;top:119px!important;background:#d71920e8!important}#virtualPS5 #vT{right:63px!important;top:7px!important}#virtualPS5 #vQ{right:121px!important;top:63px!important}
#vShoulders{position:absolute!important;right:12px!important;bottom:208px!important;display:flex!important;gap:6px!important;pointer-events:none!important}
#virtualPS5 .vs{width:70px!important;height:35px!important;border-radius:10px!important;background:#07100ddd!important;color:#fff!important;border:1px solid #ffffff38!important;font-size:8px!important;font-weight:1000!important;pointer-events:auto!important;touch-action:none!important}
#vOpt{position:absolute!important;right:16px!important;top:14px!important;width:68px!important;height:35px!important;border-radius:10px!important;background:#07100ddd!important;color:#fff!important;font-size:8px!important;font-weight:1000!important;pointer-events:auto!important;touch-action:none!important}
@media(max-width:600px){#vL{width:120px!important;height:120px!important}#vR{width:185px!important;height:185px!important}}
`;
}

function createFallback(){
 if(document.getElementById('virtualPS5'))return;
 const r=document.createElement('div');
 r.id='virtualPS5';
 r.innerHTML='<div id="vSel"></div><div id="vL"><div id="vS"></div></div><div id="vR"><button id="vT" class="vb" type="button">△</button><button id="vO" class="vb" type="button">○</button><button id="vX" class="vb" type="button">✕</button><button id="vQ" class="vb" type="button">□</button></div><div id="vShoulders"><button id="vL2" class="vs" type="button">L2 PROTECT</button><button id="vL1" class="vs" type="button">L1 SWITCH</button><button id="vR1" class="vs" type="button">R1 SKILL</button><button id="vR2" class="vs" type="button">R2 SPRINT</button></div><button id="vOpt" type="button">OPTIONS</button>';
 document.body.appendChild(r);
 let pointer=null;
 const left=r.querySelector('#vL'),stick=r.querySelector('#vS');
 const move=e=>{const q=left.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2,max=q.width*.32;let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;if(d>max){dx=dx/d*max;dy=dy/d*max}stick.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;if(typeof window.move==='function')window.move(dx/max,dy/max)};
 left.addEventListener('pointerdown',e=>{e.preventDefault();pointer=e.pointerId;left.setPointerCapture(e.pointerId);move(e)},{passive:false});
 left.addEventListener('pointermove',e=>{if(e.pointerId===pointer)move(e)},{passive:false});
 ['pointerup','pointercancel'].forEach(t=>left.addEventListener(t,e=>{if(e.pointerId===pointer){pointer=null;stick.style.transform='translate(-50%,-50%)'}}));
 function press(id,down,up){const b=r.querySelector(id);if(!b)return;b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('h');try{down&&down()}catch(err){console.error('[OBI CONTROLLER]',err)}},{passive:false});['pointerup','pointercancel'].forEach(t=>b.addEventListener(t,e=>{e.preventDefault();b.classList.remove('h');try{up&&up()}catch(err){console.error('[OBI CONTROLLER]',err)}},{passive:false}))}
 press('#vX',()=>typeof window.passBall==='function'&&window.passBall());
 press('#vO',()=>typeof window.shootBall==='function'&&window.shootBall());
 press('#vT',()=>typeof window.throughBall==='function'&&window.throughBall());
 press('#vQ',()=>typeof window.tackle==='function'&&window.tackle());
 press('#vR2',()=>typeof window.setSprint==='function'&&window.setSprint(true),()=>typeof window.setSprint==='function'&&window.setSprint(false));
 press('#vL2',()=>typeof window.protect==='function'&&window.protect(true),()=>typeof window.protect==='function'&&window.protect(false));
 press('#vL1',()=>typeof window.switchPlayer==='function'&&window.switchPlayer());
 press('#vR1',()=>typeof window.skill==='function'&&window.skill());
 press('#vOpt',()=>typeof window.options==='function'&&window.options());
}

function sync(){
 installStyle();
 createFallback();
 const r=document.getElementById('virtualPS5');
 if(!r)return;
 const on=gameOn();
 r.classList.toggle('obi-controller-visible',on);
 r.classList.toggle('obi-controller-hidden',!on);
 r.style.setProperty('display',on?'block':'none','important');
 /* The overlay itself must not block the pitch, but its controls remain clickable. */
 r.style.setProperty('pointer-events','none','important');
}

sync();
setTimeout(sync,100);setTimeout(sync,400);setTimeout(sync,1000);setInterval(sync,100);
window.addEventListener('load',sync,{once:true});
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();