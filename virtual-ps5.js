/* OBITREND FOOTBALL WORLD 27 — STABLE GAMEPLAY LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('mobile-layout-fix.js?v=20260917f');
load('interaction-hotfix.js?v=20260917f');
load('real-players.js');
/* Capture/recover the unified private game loop before the FIFA engine starts. */
load('game-loop-restart.js?v=20260917f');
load('virtual-ps5-base.js?v=20260917f');
load('controller-restore.js?v=20260917f');
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
load('match-start-fix.js?v=20260917f');
})();
