/* OBITREND FOOTBALL WORLD 27 — MOBILE INTERACTION HOTFIX */
(function(){
'use strict';
if(window.__obiInteractionHotfix)return;
window.__obiInteractionHotfix=true;

function screen(){
 const ids=['replayScreen','game','world','menu'];
 for(const id of ids){const e=document.getElementById(id);if(e&&getComputedStyle(e).display!=='none')return id}
 return 'none';
}

function invoke(name){
 try{if(typeof window[name]==='function'){window[name]();return true}}catch(e){console.warn('[OBI interaction]',name,e)}
 return false;
}

function safeFallback(name){
 if(invoke(name))return;
 const game=document.getElementById('game');
 const world=document.getElementById('world');
 const menu=document.getElementById('menu');
 if(name==='openMatch'&&game&&world){
   world.style.display='none';game.style.display='block';
   if(typeof window.resetMatch==='function')window.resetMatch();
 }
 if(name==='backToWorld'&&world&&game){
   game.style.display='none';world.style.display='block';
 }
 if(name==='backToMenu'&&menu){
   document.querySelectorAll('#world,#game,#replayScreen').forEach(e=>e.style.display='none');
   menu.style.display='block';
 }
}

function bindFallback(el,name){
 if(!el||el.dataset.obiInteractionFallback)return;
 el.dataset.obiInteractionFallback='1';
 el.addEventListener('click',function(){
   const before=screen();
   setTimeout(function(){
     if(screen()===before)safeFallback(name);
   },180);
 },false);
}

function textButton(words,name){
 document.querySelectorAll('button').forEach(function(el){
   const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
   if(words.some(w=>t.includes(w)))bindFallback(el,name);
 });
}

function syncWorldUI(){
 const world=document.getElementById('world');
 const game=document.getElementById('game');
 const worldOn=!!(world&&getComputedStyle(world).display!=='none');
 const gameOn=!!(game&&getComputedStyle(game).display!=='none');
 const ps=document.getElementById('virtualPS5');
 if(ps){
   ps.style.display=gameOn?'block':'none';
   ps.style.pointerEvents=gameOn?'auto':'none';
 }
 const wm=document.querySelector('#world .worldMenu');
 if(wm){
   wm.style.position='fixed';
   wm.style.left='50%';
   wm.style.top='auto';
   wm.style.right='auto';
   wm.style.bottom='12px';
   wm.style.width='min(800px,94vw)';
   wm.style.transform='translateX(-50%)';
   wm.style.zIndex='900';
   wm.style.pointerEvents='auto';
 }
 const mp=document.getElementById('obiMPWorldButton');
 if(mp){
   mp.style.position='fixed';
   mp.style.left='50%';
   mp.style.top='auto';
   mp.style.right='auto';
   mp.style.transform='translateX(-50%)';
   mp.style.zIndex='910';
   mp.style.bottom=worldOn?'76px':'18px';
   mp.style.display=worldOn?'block':'';
   mp.style.pointerEvents='auto';
 }
}

function install(){
 const style=document.getElementById('obiInteractionHotfixStyle')||document.createElement('style');
 style.id='obiInteractionHotfixStyle';
 style.textContent=`
  #world .worldAction,#world button,#world .worldMenu,#obiMatchSetupBtn,#obiRealHubBtn,#obiMPWorldButton{pointer-events:auto!important;touch-action:manipulation!important;z-index:900!important}
  #world .worldMenu{position:fixed!important;top:auto!important;right:auto!important;bottom:12px!important;left:50%!important;transform:translateX(-50%)!important;z-index:900!important}
  #virtualPS5{z-index:120!important}
  #world~#virtualPS5{display:none!important}
 `;
 if(!style.parentNode)document.head.appendChild(style);
 bindFallback(document.getElementById('obiMatchSetupBtn'),'openMatchSetup');
 bindFallback(document.getElementById('obiRealHubBtn'),'openRealHub');
 bindFallback(document.getElementById('obiMPWorldButton'),'openMultiplayer');
 textButton(['stadium'],'openMatch');
 textButton(['training'],'openTraining');
 textButton(['lifestyle'],'openLifestyle');
 textButton(['coaches'],'openCoaches');
 textButton(['← menu'],'backToMenu');
 syncWorldUI();
}

function boot(){
 install();
 setTimeout(install,300);
 setTimeout(install,800);
 setTimeout(install,1500);
 setTimeout(syncWorldUI,2200);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot,{once:true});
setInterval(syncWorldUI,250);
})();
