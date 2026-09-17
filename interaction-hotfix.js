/* OBITREND FOOTBALL WORLD 27 — STABLE SCREEN/UI SYNC */
(function(){
'use strict';
if(window.__obiInteractionHotfix)return;
window.__obiInteractionHotfix=true;

function visible(id){const e=document.getElementById(id);return !!(e&&getComputedStyle(e).display!=='none')}
function sync(){
 const worldOn=visible('world'),gameOn=visible('game');
 document.body.classList.toggle('obi-world-mode',worldOn);
 document.body.classList.toggle('obi-game-mode',gameOn);
 const ps=document.getElementById('virtualPS5');
 if(ps){
  ps.style.setProperty('display',gameOn?'block':'none','important');
  ps.style.setProperty('pointer-events',gameOn?'auto':'none','important');
 }
 const wm=document.querySelector('#world .worldMenu');
 if(wm){
  wm.style.setProperty('position','fixed','important');wm.style.setProperty('left','50%','important');wm.style.setProperty('top','auto','important');wm.style.setProperty('right','auto','important');wm.style.setProperty('bottom','12px','important');wm.style.setProperty('width','min(800px,94vw)','important');wm.style.setProperty('transform','translateX(-50%)','important');wm.style.setProperty('z-index','900','important');wm.style.setProperty('pointer-events','auto','important');
 }
 const mp=document.getElementById('obiMPWorldButton');
 if(mp){
  const modal=visible('obiMP')||visible('obiFifaCenter')||visible('obiMatchSetup');
  mp.style.setProperty('position','fixed','important');mp.style.setProperty('left','50%','important');mp.style.setProperty('top','auto','important');mp.style.setProperty('right','auto','important');mp.style.setProperty('bottom','76px','important');mp.style.setProperty('transform','translateX(-50%)','important');mp.style.setProperty('z-index','950','important');mp.style.setProperty('display',worldOn&&!modal?'block':'none','important');
 }
}
function install(){
 const style=document.getElementById('obiInteractionHotfixStyle')||document.createElement('style');
 style.id='obiInteractionHotfixStyle';
 style.textContent=`
 body.obi-world-mode #virtualPS5{display:none!important;pointer-events:none!important}
 body.obi-game-mode #virtualPS5{display:block!important;pointer-events:auto!important}
 #world .worldAction,#world .worldMenu,#world .worldMenu button,#obiMPWorldButton{pointer-events:auto!important;touch-action:manipulation!important}
 #world .worldMenu{position:fixed!important;top:auto!important;right:auto!important;bottom:12px!important;left:50%!important;transform:translateX(-50%)!important;z-index:900!important}
 #obiMPWorldButton{position:fixed!important;left:50%!important;top:auto!important;bottom:76px!important;transform:translateX(-50%)!important;z-index:950!important}
 `;
 if(!style.parentNode)document.head.appendChild(style);
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,250);setTimeout(install,800);setTimeout(install,1600);
setInterval(sync,250);
})();
