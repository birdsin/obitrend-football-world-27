/* OBITREND FOOTBALL WORLD 27 — INDEPENDENT MOBILE PS5 TOUCH CONTROLLER */
(function(){
'use strict';
if(window.__obiControllerRestore)return;
window.__obiControllerRestore=true;

function gameOn(){
 const g=document.getElementById('game');
 return !!(g&&getComputedStyle(g).display!=='none');
}

function style(){
 let s=document.getElementById('obiIndependentControllerStyle');
 if(!s){s=document.createElement('style');s.id='obiIndependentControllerStyle';document.head.appendChild(s)}
 s.textContent=`
#obiTouchPS5{
 position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;
 z-index:2147483000!important;display:none!important;visibility:hidden!important;opacity:0!important;
 pointer-events:none!important;font-family:Arial,sans-serif!important;
}
#obiTouchPS5.show{display:block!important;visibility:visible!important;opacity:1!important}
#obiTouchPS5 .obiJoy{
 position:absolute!important;left:max(16px,env(safe-area-inset-left))!important;
 bottom:max(16px,env(safe-area-inset-bottom))!important;width:124px!important;height:124px!important;
 border-radius:50%!important;background:rgba(5,10,18,.78)!important;
 border:2px solid rgba(255,255,255,.38)!important;box-shadow:inset 0 0 28px rgba(255,255,255,.08),0 8px 22px #000b!important;
 pointer-events:auto!important;touch-action:none!important;
}
#obiTouchPS5 .obiStick{
 position:absolute!important;left:50%!important;top:50%!important;width:54px!important;height:54px!important;
 transform:translate(-50%,-50%)!important;border-radius:50%!important;background:rgba(255,255,255,.48)!important;
 border:2px solid rgba(255,255,255,.8)!important;box-shadow:0 4px 12px #0008!important;pointer-events:none!important;
}
#obiTouchPS5 .obiActions{
 position:absolute!important;right:12px!important;bottom:14px!important;width:198px!important;height:190px!important;
 pointer-events:none!important;
}
#obiTouchPS5 .obiBtn{
 position:absolute!important;width:60px!important;height:60px!important;border-radius:50%!important;
 background:rgba(5,10,18,.86)!important;color:#fff!important;border:2px solid rgba(255,255,255,.34)!important;
 font-size:17px!important;font-weight:1000!important;box-shadow:0 7px 16px #000a!important;
 pointer-events:auto!important;touch-action:none!important;padding:0!important;
}
#obiTouchPS5 .obiBtn:active,#obiTouchPS5 .obiBtn.down{transform:scale(.9)!important}
#obiTouchPS5 .obiPass{right:4px!important;top:65px!important}
#obiTouchPS5 .obiShoot{right:69px!important;top:126px!important;background:rgba(215,25,32,.92)!important;border-color:#ff7479!important}
#obiTouchPS5 .obiThrough{right:69px!important;top:4px!important}
#obiTouchPS5 .obiTackle{right:134px!important;top:65px!important}
#obiTouchPS5 .obiShoulders{
 position:absolute!important;right:12px!important;bottom:214px!important;display:flex!important;gap:6px!important;
 pointer-events:none!important;
}
#obiTouchPS5 .obiShoulder{
 width:74px!important;height:36px!important;border-radius:10px!important;background:rgba(5,10,18,.88)!important;
 color:#fff!important;border:1px solid rgba(255,255,255,.35)!important;font-size:8px!important;font-weight:1000!important;
 pointer-events:auto!important;touch-action:none!important;padding:0!important;
}
#obiTouchPS5 .obiOptions{
 position:absolute!important;right:16px!important;top:max(14px,env(safe-area-inset-top))!important;
 width:72px!important;height:36px!important;border-radius:10px!important;background:rgba(5,10,18,.88)!important;
 color:#fff!important;border:1px solid rgba(255,255,255,.35)!important;font-size:8px!important;font-weight:1000!important;
 pointer-events:auto!important;touch-action:none!important;padding:0!important;
}
@media(max-width:600px){
 #obiTouchPS5 .obiJoy{width:116px!important;height:116px!important}
 #obiTouchPS5 .obiActions{width:188px!important;height:184px!important}
 #obiTouchPS5 .obiBtn{width:57px!important;height:57px!important}
}
`;
}

function make(){
 let r=document.getElementById('obiTouchPS5');
 if(r)return r;
 r=document.createElement('div');r.id='obiTouchPS5';
 r.innerHTML='<div class="obiJoy"><div class="obiStick"></div></div><div class="obiActions"><button class="obiBtn obiThrough" data-action="through" type="button">△</button><button class="obiBtn obiPass" data-action="pass" type="button">✕</button><button class="obiBtn obiShoot" data-action="shoot" type="button">○</button><button class="obiBtn obiTackle" data-action="tackle" type="button">□</button></div><div class="obiShoulders"><button class="obiShoulder" data-action="protect" type="button">L2 PROTECT</button><button class="obiShoulder" data-action="switch" type="button">L1 SWITCH</button><button class="obiShoulder" data-action="skill" type="button">R1 SKILL</button><button class="obiShoulder" data-action="sprint" type="button">R2 SPRINT</button></div><button class="obiOptions" data-action="options" type="button">OPTIONS</button>';
 document.body.appendChild(r);
 bind(r);
 return r;
}

function bind(r){
 const joy=r.querySelector('.obiJoy'),stick=r.querySelector('.obiStick');let pid=null;
 function move(e){
  const q=joy.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2,max=q.width*.34;
  let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1;
  if(d>max){dx=dx/d*max;dy=dy/d*max}
  stick.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
  if(typeof window.move==='function')window.move(dx/max,dy/max);
 }
 joy.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;joy.setPointerCapture(e.pointerId);move(e)},{passive:false});
 joy.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e)},{passive:false});
 ['pointerup','pointercancel'].forEach(t=>joy.addEventListener(t,e=>{if(e.pointerId===pid){pid=null;stick.style.transform='translate(-50%,-50%)';try{const s=window.state;if(s)s.moving=false}catch(_){} }}));
 function press(b,action){
  const down=e=>{e.preventDefault();b.classList.add('down');try{
   if(action==='pass'&&typeof window.passBall==='function')window.passBall();
   else if(action==='shoot'&&typeof window.shootBall==='function')window.shootBall();
   else if(action==='through'&&typeof window.throughBall==='function')window.throughBall();
   else if(action==='tackle'&&typeof window.tackle==='function')window.tackle();
   else if(action==='protect'&&typeof window.protect==='function')window.protect(true);
   else if(action==='switch'&&typeof window.switchPlayer==='function')window.switchPlayer();
   else if(action==='skill'&&typeof window.skill==='function')window.skill();
   else if(action==='sprint'&&typeof window.setSprint==='function')window.setSprint(true);
   else if(action==='options'&&typeof window.options==='function')window.options();
  }catch(err){console.error('[OBI TOUCH]',err)}};
  const up=e=>{e.preventDefault();b.classList.remove('down');try{if(action==='protect'&&typeof window.protect==='function')window.protect(false);if(action==='sprint'&&typeof window.setSprint==='function')window.setSprint(false)}catch(err){console.error('[OBI TOUCH]',err)}};
  b.addEventListener('pointerdown',down,{passive:false});b.addEventListener('pointerup',up,{passive:false});b.addEventListener('pointercancel',up,{passive:false});
 }
 r.querySelectorAll('[data-action]').forEach(b=>press(b,b.dataset.action));
}

function sync(){
 style();
 const r=make();
 const on=gameOn();
 r.classList.toggle('show',on);
 r.style.setProperty('display',on?'block':'none','important');
 r.style.setProperty('visibility',on?'visible':'hidden','important');
 r.style.setProperty('opacity',on?'1':'0','important');
 r.style.setProperty('pointer-events','none','important');
}

sync();
[100,300,700,1200,2000,3000].forEach(t=>setTimeout(sync,t));
setInterval(sync,300);
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();