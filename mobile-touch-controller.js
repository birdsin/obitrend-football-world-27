/* OBITREND FOOTBALL WORLD 27 — INDEPENDENT MOBILE PS5 TOUCH CONTROLLER */
(function(){
'use strict';
if(window.__obiIndependentTouchController)return;
window.__obiIndependentTouchController=true;

function gameVisible(){
 const g=document.getElementById('game');
 return !!(g&&getComputedStyle(g).display!=='none'&&getComputedStyle(g).visibility!=='hidden');
}
function fn(name){return typeof window[name]==='function'?window[name]:null}
function addStyle(){
 if(document.getElementById('obiIndependentTouchStyle'))return;
 const s=document.createElement('style');s.id='obiIndependentTouchStyle';s.textContent=`
#obiTouchPad{
 position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;
 z-index:2147483000!important;pointer-events:none!important;font-family:Arial,sans-serif!important;
 visibility:visible!important;opacity:1!important;
}
#obiTouchPad.obiTouchHidden{display:none!important;visibility:hidden!important;opacity:0!important}
#obiTouchPad.obiTouchVisible{display:block!important;visibility:visible!important;opacity:1!important}
#obiTouchPad .obiJoy{position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:126px;height:126px;border-radius:50%;background:rgba(5,8,12,.78);border:2px solid rgba(255,255,255,.5);box-shadow:inset 0 0 25px rgba(255,255,255,.06),0 8px 22px rgba(0,0,0,.55);pointer-events:auto!important;touch-action:none!important}
#obiTouchPad .obiStick{position:absolute;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(255,255,255,.5);border:2px solid rgba(255,255,255,.72);pointer-events:none!important}
#obiTouchPad .obiActions{position:absolute;right:12px;bottom:12px;width:205px;height:205px;pointer-events:none!important}
#obiTouchPad button{position:absolute!important;width:62px;height:62px;border-radius:50%;background:rgba(5,8,12,.84);border:2px solid rgba(255,255,255,.4);color:#fff;font-weight:1000;font-size:18px;box-shadow:0 7px 18px rgba(0,0,0,.5);pointer-events:auto!important;touch-action:none!important;-webkit-user-select:none!important}
#obiTouchPad button:active,#obiTouchPad button.hit{transform:scale(.9)!important}
#obiTouchPad .bT{right:71px;top:0}.bO{right:8px;top:71px;background:rgba(215,25,32,.9)!important}.bX{left:71px;top:71px}.bQ{left:8px;top:71px}
#obiTouchPad .obiShoulders{position:absolute;right:12px;bottom:224px;display:flex;gap:6px;pointer-events:none!important}
#obiTouchPad .obiShoulders button{position:relative!important;width:68px;height:36px;border-radius:9px;font-size:8px}
#obiTouchPad .obiOpt{right:14px;top:14px;width:72px!important;height:36px!important;border-radius:9px!important;font-size:8px!important}
@media(max-width:600px){#obiTouchPad .obiActions{right:8px;bottom:8px}#obiTouchPad .obiShoulders{right:8px;bottom:220px}}
`;
 document.head.appendChild(s);
}
function root(){
 let r=document.getElementById('obiTouchPad');
 if(r)return r;
 r=document.createElement('div');r.id='obiTouchPad';
 r.innerHTML='<div class="obiJoy"><div class="obiStick"></div></div><div class="obiActions"><button class="bT" type="button">△</button><button class="bO" type="button">○</button><button class="bX" type="button">✕</button><button class="bQ" type="button">□</button></div><div class="obiShoulders"><button data-fn="protect" type="button">L2 PROTECT</button><button data-fn="switchPlayer" type="button">L1 SWITCH</button><button data-fn="skill" type="button">R1 SKILL</button><button data-fn="sprint" type="button">R2 SPRINT</button></div><button class="obiOpt" type="button">OPTIONS</button>';
 document.body.appendChild(r);return r;
}
function bind(r){
 if(r.dataset.bound)return;r.dataset.bound='1';
 const joy=r.querySelector('.obiJoy'),stick=r.querySelector('.obiStick');let pid=null;
 function move(e){const q=joy.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2,m=q.width*.34;let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y)||1;if(d>m){x=x/d*m;y=y/d*m}stick.style.transform='translate(calc(-50% + '+x+'px),calc(-50% + '+y+'px))';const f=fn('move');if(f)f(x/m,y/m)}
 joy.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;joy.setPointerCapture(e.pointerId);move(e)},{passive:false});
 joy.addEventListener('pointermove',e=>{if(e.pointerId===pid)move(e)},{passive:false});
 ['pointerup','pointercancel'].forEach(t=>joy.addEventListener(t,e=>{if(e.pointerId===pid){pid=null;stick.style.transform='translate(-50%,-50%)'}}));
 function action(el,down,up){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();el.classList.add('hit');const f=fn(down);if(f)f(down==='setSprint'?true:down==='protect'?true:undefined)},{passive:false});['pointerup','pointercancel'].forEach(t=>el.addEventListener(t,e=>{e.preventDefault();el.classList.remove('hit');if(up){const f=fn(up);if(f)f(false)}},{passive:false}))}
 action(r.querySelector('.bT'),'throughBall');action(r.querySelector('.bO'),'shootBall');action(r.querySelector('.bX'),'passBall');action(r.querySelector('.bQ'),'tackle');
 action(r.querySelector('[data-fn="protect"]'),'protect','protect');action(r.querySelector('[data-fn="switchPlayer"]'),'switchPlayer');action(r.querySelector('[data-fn="skill"]'),'skill');action(r.querySelector('[data-fn="sprint"]'),'setSprint','setSprint');
 action(r.querySelector('.obiOpt'),'options');
}
function sync(){
 addStyle();
 const r=root();
 bind(r);
 const on=gameVisible();
 r.classList.toggle('obiTouchVisible',on);
 r.classList.toggle('obiTouchHidden',!on);
 r.style.setProperty('display',on?'block':'none','important');
 r.style.setProperty('visibility',on?'visible':'hidden','important');
 r.style.setProperty('opacity',on?'1':'0','important');
 r.style.setProperty('pointer-events','none','important');
}
sync();[100,300,700,1500,3000].forEach(t=>setTimeout(sync,t));setInterval(sync,500);window.addEventListener('resize',sync,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();
