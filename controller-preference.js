/* OBITREND FOOTBALL WORLD 27 — TOUCH CONTROLLER PREFERENCE */
(function(){
'use strict';
if(window.__obiControllerPreference)return;
window.__obiControllerPreference=true;

const KEY='obitrend-touch-controller';
const CLASSIC='classic';
const PS5='ps5';

function openSettings(){
 let s=document.getElementById('obiSettingsPanel');
 if(!s){
  s=document.createElement('div');
  s.id='obiSettingsPanel';
  s.innerHTML='<div class="obiSettingsCard"><div class="obiSettingsTitle">⚙️ SETTINGS</div><div class="obiSettingsSub">Bluetooth controller connection</div><button class="obiSettingBtn" id="obiBluetoothBtn" type="button">🎮 BLUETOOTH CONTROLLER</button><button class="obiSettingClose" type="button">CLOSE</button></div>';
  document.body.appendChild(s);
  s.querySelector('#obiBluetoothBtn').addEventListener('pointerdown',e=>{e.preventDefault();s.style.display='none';try{openController()}catch(_){} });
  s.querySelector('.obiSettingClose').addEventListener('pointerdown',e=>{e.preventDefault();s.remove()});
 }
 s.style.display='flex';
}
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

function installSettingsStyle(){
 if(document.getElementById('obiSettingsStyle'))return;
 const s=document.createElement('style');s.id='obiSettingsStyle';
 s.textContent=`
#obiSettingsPanel{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px);font-family:Arial,sans-serif}
.obiSettingsCard{width:min(430px,92vw);padding:22px;border-radius:20px;background:#0c1018;border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 70px #000b;text-align:center}
.obiSettingsTitle{font-size:22px;font-weight:1000;margin-bottom:7px}.obiSettingsSub{font-size:10px;opacity:.62;margin-bottom:18px}
.obiSettingBtn,.obiSettingClose{width:100%;height:48px;margin-top:9px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#171e27;color:#fff;font-size:10px;font-weight:1000;touch-action:manipulation}
.obiSettingBtn:first-of-type{background:#e3262e;border-color:#ff646a}.obiSettingClose{background:rgba(255,255,255,.08)}
`;
 document.head.appendChild(s);
}
function installStyle(){
 if(document.getElementById('obiControllerPreferenceStyle'))return;
 const s=document.createElement('style');s.id='obiControllerPreferenceStyle';
 s.textContent=`
body.obi-controller-ps5 .controls{display:none!important}
body.obi-controller-classic .controls{display:none!important}
#obiTouchPadV3,#virtualPS5{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
`;
 document.head.appendChild(s);
}
function ensurePicker(){return null}
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
function showV3(show){return}
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
}
function setMode(mode){ps5On();}
function updatePicker(){}
function sync(){
 installStyle();
 const g=game();
 if(!g)return;
 const p=ensurePicker();
 const on=isGameVisible();
 if(on)ps5On();else document.body.classList.remove('obi-controller-classic','obi-controller-ps5');
}

sync();
[50,150,300,700,1200,2500,5000].forEach(t=>setTimeout(sync,t));
setInterval(sync,250);
window.addEventListener('resize',sync,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(sync,100),{passive:true});
})();
