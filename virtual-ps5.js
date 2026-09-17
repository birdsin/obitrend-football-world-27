/* OBITREND FOOTBALL WORLD 27 — STABLE GAMEPLAY LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('mobile-layout-fix.js?v=20260917e');
load('interaction-hotfix.js?v=20260917e');
load('real-players.js');
/* Must load BEFORE virtual-ps5-base.js so its private gameLoop is captured
   from the very first requestAnimationFrame call. */
load('match-loop-heartbeat.js?v=20260917e');
load('virtual-ps5-base.js?v=20260917e');
load('real-squad-hub.js');
load('match-setup.js');
load('club-squads.js');
load('multiplayer.js');
load('real-gameplay.js');
load('player-attributes.js');
load('substitutions.js');
load('match-engine-bridge.js');
load('real-match-physics.js');
/* Last: replace the legacy async Stadium handler with the stable one. */
load('match-start-fix.js?v=20260917e');
})();
