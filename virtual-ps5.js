/* OBITREND FOOTBALL WORLD 27 — MULTIPLAYER LOADER */
(function(){
'use strict';
if(window.__obiMultiplayerLoader)return;
window.__obiMultiplayerLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('virtual-ps5-base.js');
load('multiplayer.js');
})();
