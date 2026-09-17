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

function install(){
 const style=document.getElementById('obiInteractionHotfixStyle')||document.createElement('style');
 style.id='obiInteractionHotfixStyle';
 style.textContent=`
  #world .worldAction,#world button,#world .worldMenu,#obiMatchSetupBtn,#obiRealHubBtn,#obiMPWorldButton{pointer-events:auto!important;touch-action:manipulation!important;position:relative;z-index:500!important}
  #world .worldMenu{z-index:490!important}
  #virtualPS5{z-index:120!important}
  #vShoulders,#vR,#vL,#vOpt{z-index:520!important}
 `;
 if(!style.parentNode)document.head.appendChild(style);
 bindFallback(document.getElementById('obiMatchSetupBtn'),'openMatchSetup');
 bindFallback(document.getElementById('obiRealHubBtn'),'openRealHub');
 bindFallback(document.getElementById('obiMPWorldButton'),'openMultiplayer');
 textButton(['stadium','match'],'openMatch');
 textButton(['training'],'openTraining');
 textButton(['lifestyle'],'openLifestyle');
 textButton(['coaches'],'openCoaches');
 textButton(['← menu','menu'],'backToMenu');
}

function boot(){install();setTimeout(install,500);setTimeout(install,1500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',boot,{once:true});
})();
