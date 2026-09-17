/* OBITREND FOOTBALL WORLD 27 — GAMEPLAY LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('virtual-ps5-base.js');
load('real-players.js');
load('real-squad-hub.js');
load('multiplayer.js');
})();
