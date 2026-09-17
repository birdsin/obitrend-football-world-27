/* OBITREND FOOTBALL WORLD 27 — NON-INVASIVE MATCH LOOP RECOVERY */
(function(){
'use strict';
if(window.__obiMatchLoopRecovery)return;
window.__obiMatchLoopRecovery=true;

const nativeRAF=window.requestAnimationFrame.bind(window);
let capturedLoop=null;
let lastTick=0;
let wrapped=false;
let recoveryQueued=false;

/* Capture only the unified engine's private loop. Do NOT wrap every RAF callback. */
window.requestAnimationFrame=function(cb){
  if(cb&&cb.name==='gameLoop')capturedLoop=cb;
  return nativeRAF(function(t){
    if(cb&&cb.name==='gameLoop')lastTick=performance.now();
    try{return cb(t)}catch(err){console.error('[OBI GAME LOOP]',err)}
  });
};

function gameOn(){
 const g=document.getElementById('game');
 return !!(g&&getComputedStyle(g).display!=='none');
}

function kick(){
 if(!gameOn()||!capturedLoop||recoveryQueued)return;
 recoveryQueued=true;
 nativeRAF(function(t){
   recoveryQueued=false;
   lastTick=performance.now();
   try{capturedLoop(t)}catch(err){console.error('[OBI GAME LOOP RECOVERY]',err)}
 });
}

function wrapReset(){
 if(wrapped||typeof window.resetMatch!=='function')return;
 const original=window.resetMatch;
 window.resetMatch=function(){
   let result;
   try{result=original.apply(this,arguments)}finally{
     setTimeout(kick,0);
     setTimeout(kick,50);
   }
   return result;
 };
 wrapped=true;
}

function boot(){
 wrapReset();
 setTimeout(wrapReset,100);
 setTimeout(wrapReset,500);
 setTimeout(wrapReset,1200);
}

/* If WORLD -> STADIUM caused the private loop to stop, restart exactly one frame. */
setInterval(function(){
 wrapReset();
 if(gameOn()&&capturedLoop&&(performance.now()-lastTick>350))kick();
},250);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
