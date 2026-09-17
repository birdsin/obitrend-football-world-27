/* OBITREND FOOTBALL WORLD 27 — HARD MATCH START FIX */
(function(){
'use strict';
if(window.__obiHardMatchStartFix)return;
window.__obiHardMatchStartFix=true;

function get(id){return document.getElementById(id)}
function show(el,value){if(el)el.style.display=value}
function call(name){
  try{
    if(typeof window[name]==='function'){
      const args=[].slice.call(arguments,1);
      window[name].apply(window,args);
      return true;
    }
  }catch(err){console.error('[OBI MATCH START]',name,err)}
  return false;
}

async function refreshWithTimeout(ms){
  try{
    if(typeof window.refreshFootballAccount!=='function')return;
    await Promise.race([
      window.refreshFootballAccount(),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('account refresh timeout')),ms))
    ]);
  }catch(err){
    console.warn('[OBI MATCH START] account refresh skipped:',err.message||err);
  }
}

async function hardOpenMatch(){
  let session=false;
  let unlocked=false;
  try{session=!!(typeof authenticatedSession!=='undefined'&&authenticatedSession)}catch(_e){}
  try{unlocked=!!(typeof state!=='undefined'&&state.realWorldUnlocked)}catch(_e){}

  if(!session){
    call('openAuth');
    return;
  }

  if(!unlocked){
    await refreshWithTimeout(3500);
    try{unlocked=!!(typeof state!=='undefined'&&state.realWorldUnlocked)}catch(_e){}
  }

  if(!unlocked){
    const lock=get('lockModal');
    if(lock)lock.style.display='flex';
    return;
  }

  const world=get('world');
  const game=get('game');
  const pause=get('pauseOverlay');

  /* Critical path: switch screens immediately. Network calls are never
     allowed to hold the Stadium button or freeze the match transition. */
  show(world,'none');
  show(game,'block');
  show(pause,'none');

  try{if(typeof state!=='undefined')state.paused=false}catch(_e){}

  /* This deliberately resolves to virtual-ps5-base.js's unified engine,
     rather than index.html's legacy resetMatch(). */
  if(!call('resetMatch')){
    console.error('[OBI MATCH START] unified resetMatch unavailable');
  }

  let mode='touch';
  try{mode=state.controlMode||'touch'}catch(_e){}
  call('setControlMode',mode);
  call('startReplayRecording');
  call('showMessage','MATCH READY');

  document.body.classList.remove('obi-world-mode');
  document.body.classList.add('obi-game-mode');
}

function install(){
  window.openMatch=hardOpenMatch;
  const world=get('world');
  if(world)world.querySelectorAll('.worldAction').forEach(function(btn){
    const text=(btn.textContent||'').toLowerCase();
    if(text.includes('stadium')&&!btn.dataset.obiHardMatch){
      btn.dataset.obiHardMatch='1';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        hardOpenMatch();
      },true);
    }
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
setTimeout(install,250);
setTimeout(install,1000);
setTimeout(install,2000);

})();
