/* OBITREND FOOTBALL WORLD 27 — NON-BLOCKING STADIUM START */
(function(){
'use strict';
if(window.__obiHardMatchStartFix)return;
window.__obiHardMatchStartFix=true;

function get(id){return document.getElementById(id)}
function call(name){
 try{
   if(typeof window[name]==='function'){
     const args=[].slice.call(arguments,1);
     return window[name].apply(window,args);
   }
 }catch(err){console.error('[OBI MATCH START]',name,err)}
 return null;
}

function hasSession(){
 try{return !!(typeof authenticatedSession!=='undefined'&&authenticatedSession)}catch(_e){return false}
}
function unlockedKnownFalse(){
 try{return typeof state!=='undefined'&&state.realWorldUnlocked===false}catch(_e){return false}
}

function enterGame(){
 const world=get('world'),game=get('game'),pause=get('pauseOverlay');
 if(!game)return false;
 if(world)world.style.display='none';
 game.style.display='block';
 if(pause)pause.style.display='none';
 try{if(typeof state!=='undefined'){state.paused=false;state.controlMode=state.controlMode||'touch'}}catch(_e){}
 /* Native unified FIFA reset. This is synchronous and starts the match immediately. */
 call('resetMatch');
 try{if(typeof window.syncWorldUI==='function')window.syncWorldUI()}catch(_e){}
 document.body.classList.remove('obi-world-mode');
 document.body.classList.add('obi-game-mode');
 return true;
}

async function verifyUnlockAfterStart(){
 try{
   if(typeof window.refreshFootballAccount!=='function')return;
   await Promise.race([
     window.refreshFootballAccount(),
     new Promise((_,reject)=>setTimeout(()=>reject(new Error('account refresh timeout')),3000))
   ]);
   try{
     if(typeof state!=='undefined'&&state.realWorldUnlocked===false){
       const lock=get('lockModal');
       if(lock){
         get('game')&&(get('game').style.display='none');
         get('world')&&(get('world').style.display='block');
         lock.style.display='flex';
       }
     }
   }catch(_e){}
 }catch(err){console.warn('[OBI MATCH START] background account check skipped:',err.message||err)}
}

function hardOpenMatch(){
 if(!hasSession()){call('openAuth');return}
 /* If the WORLD state already proves access, NEVER wait for the network. */
 if(!unlockedKnownFalse()){
   enterGame();
   return;
 }
 /* Only an explicit locked state uses the account check; it runs without blocking the UI. */
 verifyUnlockAfterStart();
}

function install(){
 window.openMatch=hardOpenMatch;
 const world=get('world');
 if(world)world.querySelectorAll('.worldAction').forEach(function(btn){
   const text=(btn.textContent||'').toLowerCase();
   if(!text.includes('stadium')||btn.dataset.obiHardMatch)return;
   btn.dataset.obiHardMatch='1';
   btn.addEventListener('click',function(e){
     e.preventDefault();
     e.stopImmediatePropagation();
     hardOpenMatch();
   },true);
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(install,100);
setTimeout(install,500);
setTimeout(install,1200);
setTimeout(install,2500);
})();
