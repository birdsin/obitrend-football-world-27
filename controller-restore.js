/* OBITREND FOOTBALL WORLD 27 — MOBILE PS5 TOUCH CONTROLLER VISIBILITY FIX */
(function(){
'use strict';
if(window.__obiControllerRestore)return;
window.__obiControllerRestore=true;

function visible(id){
 const e=document.getElementById(id);
 return !!(e&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');
}
function inGame(){return visible('game');}

function style(){
 let s=document.getElementById('obiControllerRestoreStyle');
 if(!s){s=document.createElement('style');s.id='obiControllerRestoreStyle';document.head.appendChild(s)}
 s.textContent=`
#virtualPS5{
 position:fixed!important;left:0!important;top:0!important;right:0!important;bottom:0!important;
 width:100vw!important;height:100vh!important;z-index:5000!important;
 font-family:Arial,sans-serif!important;pointer-events:none!important;
 display:block!important;visibility:visible!important;opacity:1!important;
}
#virtualPS5.obi-controller-hidden{display:none!important;visibility:hidden!important;opacity:0!important}
#virtualPS5.obi-controller-visible{display:block!important;visibility:visible!important;opacity:1!important}
#virtualPS5 #vL{position:absolute!important;left:max(14px,env(safe-area-inset-left))!important;bottom:max(14px,env(safe-area-inset-bottom))!important;width:120px!important;height:120px!important;border-radius:50%!important;background:#07100ddd!important;border:2px solid #ffffff50!important;box-shadow:inset 0 0 25px #0008,0 6px 18px #0008!important;pointer-events:auto!important;touch-action:none!important}
#virtualPS5 #vS{position:absolute!important;left:50%!important;top:50%!important;width:52px!important;height:52px!important;transform:translate(-50%,-50%)!important;border-radius:50%!important;background:#ffffff66!important;border:1px solid #fff!important;pointer-events:none!important}
#virtualPS5 #vR{position:absolute!important;right:12px!important;bottom:14px!important;width:185px!important;height:185px!important;pointer-events:none!important;touch-action:none!important}
#virtualPS5 .vb{position:absolute!important;width:58px!important;height:58px!important;border-radius:50%!important;background:#07100eee!important;color:#fff!important;border:1px solid #ffffff55!important;font-size:15px!important;font-weight:1000!important;pointer-events:auto!important;touch-action:none!important;box-shadow:0 5px 14px #0008!important}
#virtualPS5 .vb:active,#virtualPS5 .vb.h{transform:scale(.91)!important}
#virtualPS5 #vX{right:5px!important;top:63px!important}
#virtualPS5 #vO{right:63px!important;top:119px!important;background:#d71920ee!important}
#virtualPS5 #vT{right:63px!important;top:7px!important}
#virtualPS5 #vQ{right:121px!important;top:63px!important}
#virtualPS5 #vShoulders{position:absolute!important;right:12px!important;bottom:208px!important;display:flex!important;gap:6px!important;pointer-events:none!important}
#virtualPS5 .vs{width:70px!important;height:35px!important;border-radius:10px!important;background:#07100eee!important;color:#fff!important;border:1px solid #ffffff45!important;font-size:8px!important;font-weight:1000!important;pointer-events:auto!important;touch-action:none!important}
#virtualPS5 #vOpt{position:absolute!important;right:16px!important;top:14px!important;width:68px!important;height:35px!important;border-radius:10px!important;background:#07100eee!important;color:#fff!important;font-size:8px!important;font-weight:1000!important;pointer-events:auto!important;touch-action:none!important}
`;
}

function ensureRoot(){
 let r=document.getElementById('virtualPS5');
 if(!r){r=document.createElement('div');r.id='virtualPS5';document.body.appendChild(r)}
 return r;
}

function ensureControls(r){
 if(!r.querySelector('#vL')){
  const d=document.createElement('div');d.id='vL';d.innerHTML='<div id="vS"></div>';r.appendChild(d);
 }
 if(!r.querySelector('#vR')){
  const d=document.createElement('div');d.id='vR';d.innerHTML='<button id="vT" class="vb" type="button">△</button><button id="vO" class="vb" type="button">○</button><button id="vX" class="vb" type="button">✕</button><button id="vQ" class="vb" type="button">□</button>';r.appendChild(d);
 }
 if(!r.querySelector('#vShoulders')){
  const d=document.createElement('div');d.id='vShoulders';d.innerHTML='<button id="vL2" class="vs" type="button">L2 PROTECT</button><button id="vL1" class="vs" type="button">L1 SWITCH</button><button id="vR1" class="vs" type="button">R1 SKILL</button><button id="vR2" class="vs" type="button">R2 SPRINT</button>';r.appendChild(d);
 }
 if(!r.querySelector('#vOpt')){
  const b=document.createElement('button');b.id='vOpt';b.type='button';b.textContent='OPTIONS';r.appendChild(b);
 }
}

function bindFallback(r){
 if(r.dataset.obiFallbackBound)return;
 r.dataset.obiFallbackBound='1';
 const left=r.querySelector('#vL'),stick=r.querySelector('#vS');let pid=null;
 function move(e){
  const q=left.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2,max=q.width*.32;
  let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;
  if(d>max){dx=dx/d*max;dy=dy/d*max}
  stick.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
  if(typeof window.move==='function')window.move(dx/max,dy/max);
 }
 left.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;left.setPointerCapture(e.pointerId);move(e)},{passive:false});
 left.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e)},{passive:false});
 ['pointerup','pointercancel'].forEach(t=>left.addEventListener(t,e=>{if(e.pointerId===pid){pid=null;stick.style.transform='translate(-50%,-50%)'}}));
 function press(id,down,up){const b=r.querySelector(id);if(!b)return;b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('h');try{down&&down()}catch(err){console.error('[OBI TOUCH]',err)}},{passive:false});['pointerup','pointercancel'].forEach(t=>b.addEventListener(t,e=>{e.preventDefault();b.classList.remove('h');try{up&&up()}catch(err){console.error('[OBI TOUCH]',err)}},{passive:false}))}
 press('#vX',()=>typeof window.passBall==='function'&&window.passBall());
 press('#vO',()=>typeof window.shootBall==='function'&&window.shootBall());
 press('#vT',()=>typeof window.throughBall==='function'&&window.throughBall());
 press('#vQ',()=>typeof window.tackle==='function'&&window.tackle());
 press('#vL1',()=>typeof window.switchPlayer==='function'&&window.switchPlayer());
 press('#vR1',()=>typeof window.skill==='function'&&window.skill());
 press('#vR2',()=>typeof window.setSprint==='function'&&window.setSprint(true),()=>typeof window.setSprint==='function'&&window.setSprint(false));
 press('#vL2',()=>typeof window.protect==='function'&&window.protect(true),()=>typeof window.protect==='function'&&window.protect(false));
 press('#vOpt',()=>typeof window.options==='function'&&window.options());
}

function sync(){
 style();
 const r=ensureRoot();
 ensureControls(r);
 const on=inGame();
 r.classList.toggle('obi-controller-visible',on);
 r.classList.toggle('obi-controller-hidden',!on);
 r.style.setProperty('display',on?'block':'none','important');
 r.style.setProperty('visibility',on?'visible':'hidden','important');
 r.style.setProperty('opacity',on?'1':'0','important');
 r.style.setProperty('pointer-events','none','important');
 if(r.dataset.obiFallbackBound!=='1')bindFallback(r);
}

sync();
[100,300,700,1200,2000,3000].forEach(t=>setTimeout(sync,t));
setInterval(sync,500);
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,150),{passive:true});
})();