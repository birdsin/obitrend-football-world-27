/* OBITREND FOOTBALL WORLD 27 — FIFA INTERFACE LOADER */
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
  var res=await fetch('virtual-ps5-base.js?v=20260917f',{cache:'no-store'});
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
  await load('mobile-layout-fix.js?v=20260917i');
  await load('interaction-hotfix.js?v=20260917i');
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
  await load('fifa-interface.js?v=20260917j');
  console.log('[OBI] FIFA interface loaded successfully');
 }catch(err){
  console.error('[OBI] FIFA loader failed:',err);
  window.__obiGameLoaderError=err;
 }
})();
})();
