/* OBITREND FOOTBALL WORLD 27 — STABLE GAME LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;

function load(src){return new Promise(function(resolve,reject){
  var s=document.createElement('script');
  s.src=src;
  s.async=false;
  s.onload=resolve;
  s.onerror=reject;
  document.head.appendChild(s);
})}

async function loadPatchedEngine(){
  var res=await fetch('virtual-ps5-base.js?v=20260917k',{cache:'no-store'});
  if(!res.ok)throw new Error('virtual-ps5-base.js HTTP '+res.status);
  var code=await res.text();
  var old='ball={x:50,y:50,vx:0,vy:0,targetX:50,targetY:50,air:0,spin:0};';
  var fixed='ball.x=50;ball.y=50;ball.vx=0;ball.vy=0;ball.targetX=50;ball.targetY=50;ball.air=0;ball.spin=0;';
  if(code.indexOf(old)<0)console.warn('[OBI ENGINE] ball reset signature not found; source unchanged');
  else code=code.replace(old,fixed);
  new Function(code+'\n//# sourceURL=virtual-ps5-base.patched.js')();
}

(async function(){
 try{
  await load('mobile-layout-fix.js?v=20260917k');
  await load('interaction-hotfix.js?v=20260917k');
  await load('real-players.js');
  await loadPatchedEngine();
  await load('real-squad-hub.js');
  await load('club-squads.js');
  await load('multiplayer.js');
  await load('real-gameplay.js');
  await load('player-attributes.js');
  await load('substitutions.js');
  await load('match-engine-bridge.js');
  await load('real-match-physics.js');
  /* Keep the original Stadium / match workflow. The FIFA Match Centre overlay
     is intentionally not loaded here so the existing interface is unchanged. */
  await load('match-setup.js?v=20260917k');
  await load('match-start-fix.js?v=20260917k');
  await load('match-loop-recovery.js?v=20260917k');
  await load('controller-restore.js?v=20260917k');
  console.log('[OBI] Original game interface restored; Stadium freeze fix active');
 }catch(err){
  console.error('[OBI] game loader failed:',err);
  window.__obiGameLoaderError=err;
 }
})();
})();
