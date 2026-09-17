/* OBITREND FOOTBALL WORLD 27 — STABLE GAMEPLAY LOADER */
(function(){
'use strict';
if(window.__obiGameLoader)return;
window.__obiGameLoader=true;
function load(src){var s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('mobile-layout-fix.js?v=20260917g');
load('interaction-hotfix.js?v=20260917g');
load('real-players.js');
/* Capture the unified engine loop before the FIFA engine starts. */
load('game-loop-restart.js?v=20260917g');
load('virtual-ps5-base.js?v=20260917g');
/* Restore the exact PS5 touch layout after the base engine creates it. */
load('controller-restore.js?v=20260917g');
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
load('match-start-fix.js?v=20260917g');
})();
