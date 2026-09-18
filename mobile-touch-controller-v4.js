/* OBITREND FOOTBALL WORLD 27 — PS5 TOUCH CONTROLLER v4 */
(function(){
'use strict';
if(window.__obiPS5TouchV4)return;
window.__obiPS5TouchV4=true;

function game(){return document.getElementById('game')}
function visible(){
 const g=game();
 if(!g)return false;
 const s=getComputedStyle(g);
 return s.display!=='none'&&s.visibility!=='hidden';
}
function call(name){
 const f=window[name];
 if(typeof f!=='function')return;
 try{f.apply(window,[].slice.call(arguments,1))}
 catch(e){console.error('[OBI PS5 TOUCH]',name,e)}
}

function installStyle(){
 if(document.getElementById('obiPS5TouchV4Style'))return;
 const s=document.createElement('style');
 s.id='obiPS5TouchV4Style';
 s.textContent=`
#obiPS5TouchV4{
 position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
 z-index:999999!important;display:none!important;visibility:hidden!important;opacity:0!important;
 pointer-events:none!important;font-family:Arial,Helvetica,sans-serif!important;
 user-select:none!important;-webkit-user-select:none!important;
 -webkit-tap-highlight-color:transparent!important;
}
#obiPS5TouchV4.on{display:block!important;visibility:visible!important;opacity:1!important}
#obiPS5TouchV4 .ps5Joy{
 position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(18px,env(safe-area-inset-bottom));
 width:118px;height:118px;border-radius:50%;
 background:rgba(5,9,12,.78);border:2px solid rgba(255,255,255,.72);
 box-shadow:inset 0 0 28px rgba(255,255,255,.08),0 8px 22px rgba(0,0,0,.55);
 pointer-events:auto!important;touch-action:none!important;
}
#obiPS5TouchV4 .ps5Ring{
 position:absolute;inset:13px;border-radius:50%;
 border:1px solid rgba(255,255,255,.14);pointer-events:none!important;
}
#obiPS5TouchV4 .ps5Stick{
 position:absolute;left:50%;top:50%;width:54px;height:54px;
 transform:translate(-50%,-50%);border-radius:50%;
 background:rgba(245,248,250,.78);border:2px solid rgba(255,255,255,.88);
 box-shadow:0 3px 12px rgba(0,0,0,.42);pointer-events:none!important;
}
#obiPS5TouchV4 .shoulder{
 position:absolute;display:flex;flex-direction:column;gap:8px;
 pointer-events:none!important;
}
#obiPS5TouchV4 .leftShoulder{
 left:max(18px,env(safe-area-inset-left));top:24%;transform:translateY(-50%);
}
#obiPS5TouchV4 .rightShoulder{
 right:max(18px,env(safe-area-inset-right));top:24%;transform:translateY(-50%);
}
#obiPS5TouchV4 .shoulder button{
 position:relative!important;width:72px;height:38px;border-radius:10px;
 background:rgba(5,9,12,.86);border:2px solid rgba(255,255,255,.7);
 color:#fff;font-size:10px;font-weight:1000;letter-spacing:.5px;
 pointer-events:auto!important;touch-action:none!important;
}
#obiPS5TouchV4 .actions{
 position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));
 width:190px;height:190px;pointer-events:none!important;
}
#obiPS5TouchV4 .action{
 position:absolute!important;width:62px;height:62px;border-radius:50%;
 background:rgba(5,9,12,.84);border:2px solid rgba(255,255,255,.55);
 color:#fff;font-size:25px;font-weight:1000;line-height:1;
 pointer-events:auto!important;touch-action:none!important;
 box-shadow:0 7px 18px rgba(0,0,0,.55);
}
#obiPS5TouchV4 .action.hit{transform:scale(.9)!important}
#obiPS5TouchV4 .tri{top:0;left:64px;color:#20e6df;border-color:#20e6df}
#obiPS5TouchV4 .square{top:64px;left:0;color:#ee66d5;border-color:#ee66d5}
#obiPS5TouchV4 .circle{top:64px;right:0;color:#ff4050;border-color:#ff4050}
#obiPS5TouchV4 .cross{bottom:0;left:64px;color:#3b91ff;border-color:#3b91ff}
#obiPS5TouchV4 .options{
 position:absolute!important;right:max(18px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));
 width:78px;height:36px;border-radius:10px;background:rgba(5,9,12,.84);
 border:1px solid rgba(255,255,255,.3);color:#fff;font-size:9px;font-weight:1000;
 pointer-events:auto!important;touch-action:none!important;
}
#obiPS5TouchV4 .worldGuard{pointer-events:none!important}
body.obi-ps5-only .controls{display:none!important}
@media(max-width:600px){
 #obiPS5TouchV4 .ps5Joy{width:112px;height:112px;left:12px;bottom:12px}
 #obiPS5TouchV4 .ps5Stick{width:50px;height:50px}
 #obiPS5TouchV4 .actions{right:10px;bottom:10px;transform:scale(.94);transform-origin:right bottom}
 #obiPS5TouchV4 .leftShoulder{left:12px}
 #obiPS5TouchV4 .rightShoulder{right:12px}
}
`;
 document.head.appendChild(s);
}

function root(){
 let r=document.getElementById('obiPS5TouchV4');
 if(r)return r;
 const g=game();
 if(!g)return null;
 r=document.createElement('div');
 r.id='obiPS5TouchV4';
 r.innerHTML=`
 <div class="ps5Joy"><div class="ps5Ring"></div><div class="ps5Stick"></div></div>
 <div class="shoulder leftShoulder">
  <button data-f="protect" type="button">L2</button>
  <button data-f="switchPlayer" type="button">L1</button>
 </div>
 <div class="shoulder rightShoulder">
  <button data-f="sprint" type="button">R2</button>
  <button data-f="skill" type="button">R1</button>
 </div>
 <div class="actions">
  <button class="action tri" type="button">△</button>
  <button class="action square" type="button">□</button>
  <button class="action circle" type="button">○</button>
  <button class="action cross" type="button">✕</button>
 </div>
 <button class="options" type="button">OPTIONS</button>`;
 g.appendChild(r);
 return r;
}

function bind(r){
 if(r.dataset.bound)return;
 r.dataset.bound='1';
 const joy=r.querySelector('.ps5Joy'),stick=r.querySelector('.ps5Stick');
 let pid=null;
 function move(x,y){
  const q=joy.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2,m=q.width*.32;
  let dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1;
  if(d>m){dx=dx/d*m;dy=dy/d*m}
  stick.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
  call('move',dx/m,dy/m);
 }
 function release(){
  pid=null;stick.style.transform='translate(-50%,-50%)';
  try{if(window.state)window.state.moving=false}catch(_){}
 }
 joy.addEventListener('pointerdown',e=>{
  e.preventDefault();pid=e.pointerId;
  try{joy.setPointerCapture(e.pointerId)}catch(_){}
  move(e.clientX,e.clientY);
 },{passive:false});
 joy.addEventListener('pointermove',e=>{
  if(e.pointerId===pid){e.preventDefault();move(e.clientX,e.clientY)}
 },{passive:false});
 ['pointerup','pointercancel'].forEach(t=>joy.addEventListener(t,e=>{
  if(e.pointerId===pid)release();
 },{passive:false}));

 function press(el,down,up){
  let active=false;
  const d=e=>{e.preventDefault();e.stopPropagation();if(active)return;active=true;el.classList.add('hit');call(down,true)};
  const u=e=>{e.preventDefault();e.stopPropagation();if(!active)return;active=false;el.classList.remove('hit');if(up)call(up,false)};
  el.addEventListener('pointerdown',d,{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,u,{passive:false}));
 }
 press(r.querySelector('.tri'),'throughBall');
 press(r.querySelector('.square'),'tackle');
 press(r.querySelector('.circle'),'shootBall');
 press(r.querySelector('.cross'),'passBall');
 press(r.querySelector('[data-f="protect"]'),'protect','protect');
 press(r.querySelector('[data-f="switchPlayer"]'),'switchPlayer');
 press(r.querySelector('[data-f="skill"]'),'skill');
 press(r.querySelector('[data-f="sprint"]'),'setSprint','setSprint');
 press(r.querySelector('.options'),'togglePause');
}

function sync(){
 installStyle();
 const r=root();
 if(!r)return;
 bind(r);
 const on=visible();
 r.classList.toggle('on',on);
 r.style.setProperty('display',on?'block':'none','important');
 r.style.setProperty('visibility',on?'visible':'hidden','important');
 r.style.setProperty('opacity',on?'1':'0','important');
 r.style.setProperty('pointer-events','none','important');
 document.body.classList.toggle('obi-ps5-only',on);
 const legacy=document.getElementById('virtualPS5');
 if(legacy)legacy.style.setProperty('display','none','important');
}
sync();
[50,150,300,700,1200,2500,5000].forEach(t=>setTimeout(sync,t));
setInterval(sync,250);
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();