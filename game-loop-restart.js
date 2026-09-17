/* OBITREND FOOTBALL WORLD 27 — PERMANENT GAME LOOP WATCHDOG */
(function(){
'use strict';
if(window.__obiGameLoopWatchdog)return;
window.__obiGameLoopWatchdog=true;

const nativeRAF=window.requestAnimationFrame.bind(window);
let gameLoop=null;
let lastFrame=performance.now();
let runningRecovery=false;

/* This file is loaded BEFORE virtual-ps5-base.js. Capture the engine's
   private gameLoop on its first requestAnimationFrame call. */
window.requestAnimationFrame=function(cb){
  if(cb&&cb.name==='gameLoop')gameLoop=cb;
  return nativeRAF(function(t){
    if(cb&&cb.name==='gameLoop')lastFrame=performance.now();
    try{
      return cb(t);
    }catch(err){
      console.error('[OBI GAME LOOP ERROR]',err);
    }
  });
};

function gameVisible(){
 const g=document.getElementById('game');
 return !!(g&&getComputedStyle(g).display!=='none');
}

/* If the private loop ever stops requesting frames, wake it back up.
   Recovery is throttled so it can never create a runaway RAF storm. */
setInterval(function(){
 if(!gameVisible()||!gameLoop||runningRecovery)return;
 if(performance.now()-lastFrame<140)return;
 runningRecovery=true;
 nativeRAF(function(t){
   try{
     lastFrame=performance.now();
     gameLoop(t);
   }catch(err){
     console.error('[OBI GAME LOOP RECOVERY ERROR]',err);
   }finally{
     runningRecovery=false;
   }
 });
},70);
})();
