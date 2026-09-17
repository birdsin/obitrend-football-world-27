/* OBITREND FOOTBALL WORLD 27 — MOBILE PS5 TOUCH CONTROLLER v2 */
(function(){
'use strict';
if(window.__obiIndependentTouchControllerV2)return;
window.__obiIndependentTouchControllerV2=true;

function gameVisible(){
 const g=document.getElementById('game');
 if(!g)return false;
 const cs=getComputedStyle(g);
 return cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0';
}
function call(name){
 const f=window[name];
 if(typeof f!=='function')return false;
 try{f.apply(window,[].slice.call(arguments,1));return true}catch(e){console.error('[OBI TOUCH]',name,e);return false}
}
function addStyle(){
 if(document.getElementById('obiTouchV2Style'))return;
 const s=document.createElement('style');
 s.id='obiTouchV2Style';
 s.textContent=`
#obiTouchPadV2{
 position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;
 z-index:2147483000!important;display:none!important;visibility:hidden!important;opacity:0!important;
 pointer-events:none!important;font-family:Arial,sans-serif!important;
 -webkit-user-select:none!important;user-select:none!important;
 -webkit-tap-highlight-color:transparent!important;
}
#obiTouchPadV2.on{display:block!important;visibility:visible!important;opacity:1!important}
#obiTouchPadV2 .touchJoy{
 position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));
 width:128px;height:128px;border-radius:50%;pointer-events:auto!important;touch-action:none!important;
 background:rgba(5,8,12,.78);border:2px solid rgba(255,255,255,.48);
 box-shadow:inset 0 0 25px rgba(255,255,255,.06),0 8px 22px rgba(0,0,0,.55);
}
#obiTouchPadV2 .touchJoy:after{content:'MOVE';position:absolute;left:50%;bottom:9px;transform:translateX(-50%);font-size:7px;font-weight:1000;letter-spacing:1px;color:#ffffff88;pointer-events:none}
#obiTouchPadV2 .touchStick{
 position:absolute;left:50%;top:50%;width:55px;height:55px;transform:translate(-50%,-50%);
 border-radius:50%;background:rgba(255,255,255,.5);border:2px solid rgba(255,255,255,.75);
 box-shadow:0 3px 10px rgba(0,0,0,.45);pointer-events:none!important;
}
#obiTouchPadV2 .touchActions{
 position:absolute;right:9px;bottom:9px;width:208px;height:208px;pointer-events:none!important;
}
#obiTouchPadV2 .touchBtn{
 position:absolute!important;width:62px;height:62px;border-radius:50%;
 background:rgba(5,8,12,.86);border:2px solid rgba(255,255,255,.42);color:#fff;
 font-weight:1000;font-size:18px;line-height:1;pointer-events:auto!important;touch-action:none!important;
 box-shadow:0 7px 18px rgba(0,0,0,.52);padding:0;margin:0;
}
#obiTouchPadV2 .touchBtn.hit{transform:scale(.9)!important}
#obiTouchPadV2 .bT{right:73px;top:0}
#obiTouchPadV2 .bO{right:9px;top:73px;background:rgba(215,25,32,.92)!important}
#obiTouchPadV2 .bX{left:73px;top:73px}
#obiTouchPadV2 .bQ{left:9px;top:73px}
#obiTouchPadV2 .touchShoulders{
 position:absolute;right:9px;bottom:225px;display:flex;gap:6px;pointer-events:none!important;
}
#obiTouchPadV2 .touchShoulders button{
 position:relative!important;width:68px;height:36px;border-radius:9px;
 background:rgba(5,8,12,.88);border:1px solid rgba(255,255,255,.38);color:#fff;
 font-size:8px;font-weight:1000;pointer-events:auto!important;touch-action:none!important;padding:0;
}
#obiTouchPadV2 .touchShoulders button.hit{transform:scale(.94)!important}
#obiTouchPadV2 .touchOpt{
 position:absolute!important;right:14px;top:14px;width:72px!important;height:36px!important;
 border-radius:9px!important;background:rgba(5,8,12,.88)!important;
 border:1px solid rgba(255,255,255,.38)!important;color:#fff;font-size:8px;font-weight:1000;
 pointer-events:auto!important;touch-action:none!important;padding:0;
}
#obiTouchPadV2 .touchOpt.hit{transform:scale(.94)!important}
@media(max-width:600px){
 #obiTouchPadV2 .touchJoy{width:120px;height:120px;left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom))}
 #obiTouchPadV2 .touchActions{right:7px;bottom:7px;transform:scale(.94);transform-origin:bottom right}
 #obiTouchPadV2 .touchShoulders{right:7px;bottom:214px;transform:scale(.94);transform-origin:right bottom}
}
`;
 document.head.appendChild(s);
}
function root(){
 let r=document.getElementById('obiTouchPadV2');
 if(r)return r;
 r=document.createElement('div');r.id='obiTouchPadV2';
 r.innerHTML=`
 <div class="touchJoy"><div class="touchStick"></div></div>
 <div class="touchActions">
  <button class="touchBtn bT" type="button" aria-label="Through ball">△</button>
  <button class="touchBtn bO" type="button" aria-label="Shoot">○</button>
  <button class="touchBtn bX" type="button" aria-label="Pass">✕</button>
  <button class="touchBtn bQ" type="button" aria-label="Tackle">□</button>
 </div>
 <div class="touchShoulders">
  <button data-action="protect" type="button">L2 PROTECT</button>
  <button data-action="switch" type="button">L1 SWITCH</button>
  <button data-action="skill" type="button">R1 SKILL</button>
  <button data-action="sprint" type="button">R2 SPRINT</button>
 </div>
 <button class="touchOpt" type="button">OPTIONS</button>`;
 document.body.appendChild(r);
 return r;
}
function setStick(stick,x,y){stick.style.transform='translate(calc(-50% + '+x+'px),calc(-50% + '+y+'px))'}
function bind(r){
 if(r.dataset.boundV2==='1')return;
 r.dataset.boundV2='1';

 const joy=r.querySelector('.touchJoy');
 const stick=r.querySelector('.touchStick');
 let pid=null;
 let lastX=0,lastY=0;
 const update=(cx,cy)=>{
  const q=joy.getBoundingClientRect();
  const centerX=q.left+q.width/2,centerY=q.top+q.height/2,max=q.width*.32;
  let x=cx-centerX,y=cy-centerY,d=Math.hypot(x,y)||1;
  if(d>max){x=x/d*max;y=y/d*max}
  lastX=x/max;lastY=y/max;
  setStick(stick,x,y);
  call('move',lastX,lastY);
 };
 const release=()=>{
  pid=null;lastX=0;lastY=0;setStick(stick,0,0);
  const s=window.state;if(s)s.moving=false;
 };
 if(window.PointerEvent){
  joy.addEventListener('pointerdown',e=>{e.preventDefault();pid=e.pointerId;update(e.clientX,e.clientY)},{passive:false});
  joy.addEventListener('pointermove',e=>{if(pid!==e.pointerId)return;e.preventDefault();update(e.clientX,e.clientY)},{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>joy.addEventListener(t,e=>{if(pid===e.pointerId)release()},{passive:false}));
 }else{
  joy.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];pid=t.identifier;update(t.clientX,t.clientY)},{passive:false});
  joy.addEventListener('touchmove',e=>{e.preventDefault();const t=[].find.call(e.touches,t=>t.identifier===pid);if(t)update(t.clientX,t.clientY)},{passive:false});
  ['touchend','touchcancel'].forEach(t=>joy.addEventListener(t,e=>{for(const x of e.changedTouches){if(x.identifier===pid)release()}},{passive:false}));
 }

 function press(el,down,up){
  let active=false;
  const start=e=>{e.preventDefault();e.stopPropagation();if(active)return;active=true;el.classList.add('hit');call(down,true)};
  const end=e=>{e.preventDefault();e.stopPropagation();if(!active)return;active=false;el.classList.remove('hit');if(up)call(up,false)};
  el.addEventListener('pointerdown',start,{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,end,{passive:false}));
 }
 press(r.querySelector('.bT'),'throughBall');
 press(r.querySelector('.bO'),'shootBall');
 press(r.querySelector('.bX'),'passBall');
 press(r.querySelector('.bQ'),'tackle');
 press(r.querySelector('[data-action="protect"]'),'protect','protect');
 press(r.querySelector('[data-action="switch"]'),'switchPlayer');
 press(r.querySelector('[data-action="skill"]'),'skill');
 press(r.querySelector('[data-action="sprint"]'),'setSprint','setSprint');
 press(r.querySelector('.touchOpt'),'togglePause');
}
function sync(){
 addStyle();
 const r=root();
 bind(r);
 const on=gameVisible();
 r.classList.toggle('on',on);
 r.style.setProperty('display',on?'block':'none','important');
 r.style.setProperty('visibility',on?'visible':'hidden','important');
 r.style.setProperty('opacity',on?'1':'0','important');
 r.style.setProperty('pointer-events','none','important');
}
sync();
[100,300,700,1200,2500,5000].forEach(t=>setTimeout(sync,t));
setInterval(sync,300);
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();
