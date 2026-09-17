/* OBITREND FOOTBALL WORLD 27 — MOBILE INTERACTION + SCREEN SYNC */
(function(){
'use strict';
if(window.__obiInteractionHotfix)return;
window.__obiInteractionHotfix=true;

function screen(){
 const ids=['replayScreen','game','world','menu'];
 for(const id of ids){
   const e=document.getElementById(id);
   if(e&&getComputedStyle(e).display!=='none')return id;
 }
 return 'none';
}

function invoke(name){
 try{
   if(typeof window[name]==='function'){
     const args=[].slice.call(arguments,1);
     window[name].apply(window,args);
     return true;
   }
 }catch(e){console.warn('[OBI interaction]',name,e)}
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
 const sc=screen();
 const world=document.getElementById('world');
 const game=document.getElementById('game');
 const ps=document.getElementById('virtualPS5');
 const worldOn=sc==='world';
 const gameOn=sc==='game';

 document.body.classList.toggle('obi-world-mode',worldOn);
 document.body.classList.toggle('obi-game-mode',gameOn);

 if(ps){
   ps.style.setProperty('display',gameOn?'block':'none','important');
   ps.style.setProperty('pointer-events',gameOn?'auto':'none','important');
 }

 const wm=world&&world.querySelector('.worldMenu');
 if(wm){
   wm.style.setProperty('position','fixed','important');
   wm.style.setProperty('left','50%','important');
   wm.style.setProperty('top','auto','important');
   wm.style.setProperty('right','auto','important');
   wm.style.setProperty('bottom','12px','important');
   wm.style.setProperty('width','min(800px,94vw)','important');
   wm.style.setProperty('transform','translateX(-50%)','important');
   wm.style.setProperty('z-index','900','important');
   wm.style.setProperty('pointer-events','auto','important');
 }

 const mp=document.getElementById('obiMPWorldButton');
 if(mp){
   mp.style.setProperty('position','fixed','important');
   mp.style.setProperty('left','50%','important');
   mp.style.setProperty('top','auto','important');
   mp.style.setProperty('right','auto','important');
   mp.style.setProperty('transform','translateX(-50%)','important');
   mp.style.setProperty('z-index','910','important');
   mp.style.setProperty('bottom',worldOn?'76px':'18px','important');
   mp.style.setProperty('display',worldOn?'block':'none','important');
   mp.style.setProperty('pointer-events','auto','important');
 }
}

function install(){
 const style=document.getElementById('obiInteractionHotfixStyle')||document.createElement('style');
 style.id='obiInteractionHotfixStyle';
 style.textContent=`
  body.obi-world-mode #virtualPS5{display:none!important;pointer-events:none!important}
  body.obi-game-mode #virtualPS5{display:block!important;pointer-events:auto!important}
  #world .worldAction,#world button,#world .worldMenu,#obiMatchSetupBtn,#obiRealHubBtn,#obiMPWorldButton{pointer-events:auto!important;touch-action:manipulation!important}
  #world .worldMenu{position:fixed!important;top:auto!important;right:auto!important;bottom:12px!important;left:50%!important;transform:translateX(-50%)!important;z-index:900!important}
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
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot,{once:true});
setInterval(syncWorldUI,150);
})();
