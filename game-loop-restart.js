/* OBITREND FOOTBALL WORLD 27 — PERMANENT MATCH RECOVERY */
(function(){
'use strict';
if(window.__obiPermanentMatchRecovery)return;
window.__obiPermanentMatchRecovery=true;

const nativeRAF=window.requestAnimationFrame.bind(window);
let gameLoop=null;
let lastGameFrame=0;

/* Capture the private engine loop BEFORE virtual-ps5-base.js starts. */
window.requestAnimationFrame=function(cb){
  if(cb&&cb.name==='gameLoop')gameLoop=cb;
  return nativeRAF(function(t){
    if(cb&&cb.name==='gameLoop')lastGameFrame=performance.now();
    try{return cb(t)}catch(err){console.error('[OBI GAME LOOP]',err)}
  });
};

function visible(id){
 const e=document.getElementById(id);
 return !!(e&&getComputedStyle(e).display!=='none');
}
function gameVisible(){return visible('game')}
function worldVisible(){return visible('world')}

/* Keep the private gameLoop alive across WORLD -> STADIUM transitions. */
setInterval(function(){
 if(!gameVisible()||!gameLoop)return;
 if(performance.now()-lastGameFrame>120){
   lastGameFrame=performance.now();
   nativeRAF(function(t){
     try{gameLoop(t)}catch(err){console.error('[OBI GAME LOOP RECOVERY]',err)}
   });
 }
},60);

function call(name){
 try{
   if(typeof window[name]==='function'){
     const args=[].slice.call(arguments,1);
     window[name].apply(window,args);
     return true;
   }
 }catch(err){console.error('[OBI MATCH]',name,err)}
 return false;
}

async function refreshWithTimeout(ms){
 try{
   if(typeof window.refreshFootballAccount!=='function')return;
   await Promise.race([
     window.refreshFootballAccount(),
     new Promise((_,reject)=>setTimeout(()=>reject(new Error('account refresh timeout')),ms))
   ]);
 }catch(err){console.warn('[OBI MATCH] account refresh skipped:',err.message||err)}
}

async function startMatch(){
 let session=false;
 let unlocked=false;
 try{session=!!(typeof authenticatedSession!=='undefined'&&authenticatedSession)}catch(_e){}
 try{unlocked=!!(typeof state!=='undefined'&&state.realWorldUnlocked)}catch(_e){}

 if(!session){call('openAuth');return}
 if(!unlocked){
   await refreshWithTimeout(3000);
   try{unlocked=!!(typeof state!=='undefined'&&state.realWorldUnlocked)}catch(_e){}
 }
 if(!unlocked){
   const lock=document.getElementById('lockModal');
   if(lock)lock.style.display='flex';
   return;
 }

 const world=document.getElementById('world');
 const game=document.getElementById('game');
 const pause=document.getElementById('pauseOverlay');
 if(!game)return;

 world&&(world.style.display='none');
 game.style.display='block';
 pause&&(pause.style.display='none');
 try{if(typeof state!=='undefined')state.paused=false}catch(_e){}

 /* Always reset the unified FIFA engine. */
 if(!call('resetMatch'))console.error('[OBI MATCH] resetMatch unavailable');
 let mode='touch';
 try{mode=state.controlMode||'touch'}catch(_e){}
 call('setControlMode',mode);
 call('startReplayRecording');
 call('showMessage','MATCH READY');
 document.body.classList.remove('obi-world-mode');
 document.body.classList.add('obi-game-mode');
}

function installStadium(){
 const world=document.getElementById('world');
 if(!world)return;
 world.querySelectorAll('.worldAction').forEach(function(btn){
   const text=(btn.textContent||'').toLowerCase();
   if(!text.includes('stadium')||btn.dataset.obiPermanentStart)return;
   btn.dataset.obiPermanentStart='1';
   btn.addEventListener('click',function(e){
     e.preventDefault();
     e.stopImmediatePropagation();
     startMatch();
   },true);
 });
}

window.openMatch=startMatch;
installStadium();
setTimeout(installStadium,100);
setTimeout(installStadium,500);
setTimeout(installStadium,1200);
setTimeout(installStadium,2500);

/* Hard controller/screen state, including dynamically-created PS5 UI. */
function sync(){
 const isGame=gameVisible();
 const isWorld=worldVisible();
 document.body.classList.toggle('obi-game-mode',isGame);
 document.body.classList.toggle('obi-world-mode',isWorld);
 const ps=document.getElementById('virtualPS5');
 if(ps){
   ps.style.setProperty('display',isGame?'block':'none','important');
   ps.style.setProperty('pointer-events',isGame?'auto':'none','important');
 }
 const wm=document.querySelector('#world .worldMenu');
 if(wm){
   wm.style.setProperty('position','fixed','important');
   wm.style.setProperty('left','50%','important');
   wm.style.setProperty('top','auto','important');
   wm.style.setProperty('right','auto','important');
   wm.style.setProperty('bottom','12px','important');
   wm.style.setProperty('transform','translateX(-50%)','important');
   wm.style.setProperty('z-index','900','important');
 }
 const mp=document.getElementById('obiMPWorldButton');
 if(mp){
   mp.style.setProperty('display',isWorld?'block':'none','important');
   mp.style.setProperty('position','fixed','important');
   mp.style.setProperty('left','50%','important');
   mp.style.setProperty('top','auto','important');
   mp.style.setProperty('bottom',isWorld?'76px':'18px','important');
   mp.style.setProperty('transform','translateX(-50%)','important');
   mp.style.setProperty('z-index','910','important');
 }
}
setInterval(sync,100);
sync();
})();
