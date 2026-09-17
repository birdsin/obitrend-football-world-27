/* OBITREND FOOTBALL WORLD 27 — TOUCH CONTROLLER PREFERENCE */
(function(){
'use strict';
if(window.__obiControllerPreference)return;
window.__obiControllerPreference=true;

const KEY='obitrend-touch-controller';
const CLASSIC='classic';
const PS5='ps5';

function game(){return document.getElementById('game')}
function isGameVisible(){
 const g=game();
 return !!(g && getComputedStyle(g).display!=='none' && getComputedStyle(g).visibility!=='hidden');
}
function selected(){
 try{
  const v=localStorage.getItem(KEY);
  return v===PS5?PS5:CLASSIC;
 }catch(_){return CLASSIC}
}
function save(v){
 try{localStorage.setItem(KEY,v)}catch(_){}
}

function installStyle(){
 if(document.getElementById('obiControllerPreferenceStyle'))return;
 const s=document.createElement('style');
 s.id='obiControllerPreferenceStyle';
 s.textContent=`
#obiControllerPreference{
 position:absolute!important;right:12px!important;top:58px!important;
 z-index:1000002!important;font-family:Arial,sans-serif!important;
}
#obiControllerPreference .pick{
 width:92px;height:32px;border-radius:9px;border:1px solid rgba(255,255,255,.28);
 background:rgba(5,8,12,.88);color:#fff;font-size:9px;font-weight:1000;
 letter-spacing:.4px;box-shadow:0 5px 16px #0008;touch-action:manipulation;
}
#obiControllerPreference .menu{
 display:none;position:absolute;right:0;top:38px;width:142px;padding:7px;
 border-radius:12px;background:rgba(4,7,10,.96);border:1px solid rgba(255,255,255,.18);
 box-shadow:0 12px 30px #000b;
}
#obiControllerPreference.open .menu{display:block}
#obiControllerPreference .choice{
 display:block;width:100%;height:36px;margin:3px 0;border:1px solid rgba(255,255,255,.12);
 border-radius:8px;background:#10161b;color:#fff;font-size:9px;font-weight:1000;
}
#obiControllerPreference .choice.active{border-color:#fff;background:#1c2730}
#obiTouchPadV3.obi-preference-hidden,
#virtualPS5.obi-preference-hidden{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
body.obi-controller-ps5 .controls{display:none!important}
body.obi-controller-classic #obiTouchPadV3,
body.obi-controller-classic #virtualPS5{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
body.obi-controller-classic .controls{display:block!important}
`;
 document.head.appendChild(s);
}

function ensurePicker(){
 let p=document.getElementById('obiControllerPreference');
 if(p)return p;
 const g=game();
 if(!g)return null;
 p=document.createElement('div');
 p.id='obiControllerPreference';
 p.innerHTML='<button class="pick" type="button">🎮 CONTROLS</button><div class="menu"><button class="choice" data-mode="classic" type="button">CLASSIC TOUCH</button><button class="choice" data-mode="ps5" type="button">PS5 TOUCH</button></div>';
 g.appendChild(p);
 const pick=p.querySelector('.pick');
 pick.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();p.classList.toggle('open')},{passive:false});
 p.querySelectorAll('.choice').forEach(b=>{
  b.addEventListener('pointerdown',e=>{
   e.preventDefault();e.stopPropagation();
   setMode(b.dataset.mode);
   p.classList.remove('open');
  },{passive:false});
 });
 document.addEventListener('pointerdown',e=>{
  if(!p.contains(e.target))p.classList.remove('open');
 },{passive:true});
 return p;
}

function hidePs5Legacy(){
 const v=document.getElementById('virtualPS5');
 if(v){
  v.classList.add('obi-preference-hidden');
  v.style.setProperty('display','none','important');
  v.style.setProperty('visibility','hidden','important');
  v.style.setProperty('opacity','0','important');
  v.style.setProperty('pointer-events','none','important');
 }
}
function showV3(show){
 const v=document.getElementById('obiTouchPadV3');
 if(!v)return;
 if(show){
  v.classList.remove('obi-preference-hidden');
  v.style.setProperty('display','block','important');
  v.style.setProperty('visibility','visible','important');
  v.style.setProperty('opacity','1','important');
  v.style.setProperty('pointer-events','none','important');
 }else{
  v.classList.add('obi-preference-hidden');
  v.style.setProperty('display','none','important');
  v.style.setProperty('visibility','hidden','important');
  v.style.setProperty('opacity','0','important');
 }
}
function classicOn(){
 document.body.classList.add('obi-controller-classic');
 document.body.classList.remove('obi-controller-ps5');
 hidePs5Legacy();
 showV3(false);
}
function ps5On(){
 document.body.classList.add('obi-controller-ps5');
 document.body.classList.remove('obi-controller-classic');
 hidePs5Legacy();
 showV3(true);
}
function setMode(mode){
 const v=mode===PS5?PS5:CLASSIC;
 save(v);
 if(v===PS5)ps5On();else classicOn();
 updatePicker();
}
function updatePicker(){
 const p=document.getElementById('obiControllerPreference');
 if(!p)return;
 const mode=selected();
 p.querySelector('.pick').textContent=mode===PS5?'🎮 PS5 TOUCH':'🎮 CLASSIC';
 p.querySelectorAll('.choice').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
}
function sync(){
 installStyle();
 const g=game();
 if(!g)return;
 const p=ensurePicker();
 const on=isGameVisible();
 if(p)p.style.display=on?'block':'none';
 if(on){
  if(selected()===PS5)ps5On();else classicOn();
  updatePicker();
 }else{
  document.body.classList.remove('obi-controller-classic','obi-controller-ps5');
 }
}

sync();
[50,150,300,700,1200,2500,5000].forEach(t=>setTimeout(sync,t));
setInterval(sync,250);
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();
