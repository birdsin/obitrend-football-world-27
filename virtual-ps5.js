/* OBITREND FOOTBALL WORLD 27 — STABLE GAMEPLAY LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('mobile-layout-fix.js?v=20260917h');
load('interaction-hotfix.js?v=20260917h');
load('real-players.js');
/* Capture only the unified engine loop before the FIFA engine starts. */
load('match-loop-recovery.js?v=20260917h');
/* Let the unified FIFA engine create and bind the original PS5 controller itself. */
load('virtual-ps5-base.js?v=20260917h');
load('real-squad-hub.js');
load('match-setup.js');
load('club-squads.js');
load('multiplayer.js');
load('real-gameplay.js');
load('player-attributes.js');
load('substitutions.js');
load('match-engine-bridge.js');
load('real-match-physics.js');
/* Last: stable Stadium startup handler. */
load('match-start-fix.js?v=20260917h');
})();
