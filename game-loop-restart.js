/* OBITREND FOOTBALL WORLD 27 — MATCH LOOP RESTART FIX */
(function(){
'use strict';
if(window.__obiMatchLoopRestartFix)return;
window.__obiMatchLoopRestartFix=true;

let lastGame=false;
let restartCount=0;

function isGame(){
 const g=document.getElementById('game');
 return !!(g&&getComputedStyle(g).display!=='none');
}

function restartEngine(){
 if(restartCount>0){
   restartCount++;
 }
 if(restartCount>4)return;

 /* The original engine stops its requestAnimationFrame loop while WORLD is
    visible. Starting a match later therefore needs a fresh engine instance. */
 window.__obitrendUnifiedPS5=false;
 const s=document.createElement('script');
 s.src='virtual-ps5-base.js?v=20260917-matchfix-'+Date.now();
 s.async=false;
 document.head.appendChild(s);
 restartCount++;
}

function tick(){
 const g=isGame();
 if(g&&!lastGame){
   setTimeout(restartEngine,40);
 }
 lastGame=g;
}

setInterval(tick,120);
window.addEventListener('pageshow',function(){lastGame=false;});
tick();
})();
