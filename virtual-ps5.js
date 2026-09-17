/* OBITREND FOOTBALL WORLD 27 — GAMEPLAY LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('real-players.js');
load('virtual-ps5-base.js');
load('real-squad-hub.js');
load('match-setup.js');
load('club-squads.js');
load('multiplayer.js');
load('real-gameplay.js');
load('player-attributes.js');
})();
