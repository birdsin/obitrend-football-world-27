/* OBITREND FOOTBALL WORLD 27 — MATCH LOOP HEARTBEAT */
(function(){
'use strict';
if(window.__obiMatchLoopHeartbeat)return;
window.__obiMatchLoopHeartbeat=true;

const nativeRAF=window.requestAnimationFrame.bind(window);
let gameLoopCallback=null;
let lastGameTick=0;

window.requestAnimationFrame=function(cb){
  if(cb&&cb.name==='gameLoop'){
    gameLoopCallback=cb;
    const wrapped=function(t){
      lastGameTick=performance.now();
      return cb(t);
    };
    return nativeRAF(wrapped);
  }
  return nativeRAF(cb);
};

function gameVisible(){
  const g=document.getElementById('game');
  return !!(g&&getComputedStyle(g).display!=='none');
}

setInterval(function(){
  if(!gameVisible()||!gameLoopCallback)return;
  if(performance.now()-lastGameTick>180){
    lastGameTick=performance.now();
    nativeRAF(function(t){
      lastGameTick=performance.now();
      try{gameLoopCallback(t)}catch(e){console.error('[OBI MATCH LOOP]',e)}
    });
  }
},100);
})();
