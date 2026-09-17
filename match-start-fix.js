/* OBITREND FOOTBALL WORLD 27 — HARD MATCH START FIX */
(function(){
'use strict';
if(window.__obiHardMatchStartFix)return;
window.__obiHardMatchStartFix=true;

function get(id){return document.getElementById(id)}
function show(el,value){if(el)el.style.display=value}
function run(name){
  try{
    if(typeof window[name]==='function'){
      window[name]();
      return true;
    }
  }catch(err){console.error('[OBI MATCH START]',name,err)}
  return false;
}

/* Never let a network/account refresh block the visible match transition. */
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
    if(typeof window.openAuth==='function')window.openAuth();
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

  /* Switch screens FIRST. This makes Stadium feel instant even on a slow
     connection. The actual account refresh is never on this critical path. */
  show(world,'none');
  show(game,'block');
  show(pause,'none');

  try{if(typeof state!=='undefined')state.paused=false}catch(_e){}

  /* IMPORTANT: call the unified FIFA engine's resetMatch, not the legacy
     index.html resetMatch function. */
  if(!run('resetMatch')){
    console.error('[OBI MATCH START] unified resetMatch is unavailable');
  }

  run('setControlMode');
  run('startReplayRecording');
  run('showMessage');

  document.body.classList.remove('obi-world-mode');
  document.body.classList.add('obi-game-mode');
}

/* Replace the global click target after every gameplay script has loaded. */
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
