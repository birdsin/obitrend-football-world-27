/* OBITREND FOOTBALL WORLD 27 — PERMANENT MATCH LOOP */
(function(){
'use strict';
if(window.__obiPermanentMatchLoop)return;
window.__obiPermanentMatchLoop=true;

const nativeRAF=window.requestAnimationFrame.bind(window);
let gameLoop=null;
let lastFrame=0;

/* Capture the REAL private engine loop before virtual-ps5-base.js starts. */
window.requestAnimationFrame=function(cb){
  if(cb&&cb.name==='gameLoop') gameLoop=cb;
  return nativeRAF(function(t){
    if(cb&&cb.name==='gameLoop') lastFrame=performance.now();
    try{return cb(t)}catch(err){
      console.error('[OBI MATCH LOOP]',err);
    }
  });
};

function visible(){
  const g=document.getElementById('game');
  return !!(g&&getComputedStyle(g).display!=='none');
}

/* If the engine returned because WORLD was visible, restart it immediately
   when GAME becomes visible. No page reload and no second engine instance. */
setInterval(function(){
  if(!visible()||!gameLoop)return;
  if(performance.now()-lastFrame>140){
    lastFrame=performance.now();
    nativeRAF(function(t){
      try{gameLoop(t)}catch(err){
        console.error('[OBI MATCH LOOP RECOVERY]',err);
      }
    });
  }
},80);

})();
