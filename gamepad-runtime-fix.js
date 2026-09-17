/* OBITREND FOOTBALL WORLD 27 - GAMEPAD RUNTIME FIX */
(function(){
  "use strict";

  function movement(x,y){
    const s = window.state;
    if(!s || s.paused || s.controlMode !== "gamepad") return;

    x = Number(x) || 0;
    y = Number(y) || 0;

    const length = Math.hypot(x,y);
    const deadzone = 0.14;

    if(length <= deadzone){
      s.moving = false;
      return;
    }

    const nx = x / Math.max(1,length);
    const ny = y / Math.max(1,length);
    const speed = Number(s.speed) || 0.55;

    s.x = Math.max(10, Math.min(90, s.x + nx * speed));
    s.y = Math.max(10, Math.min(90, s.y + ny * speed));
    s.moving = true;

    if(typeof window.updatePlayer === "function"){
      window.updatePlayer();
    }
  }

  /* controls-step1.js calls this when its physical Gamepad loop reads the stick. */
  window.handlePlayerMovement = movement;

  /* The original index.html controller loop also reads the same pad.
     Disable that duplicate loop; controls-step1.js owns physical Gamepad input. */
  window.controllerLoop = function(){
    window.requestAnimationFrame(window.controllerLoop);
  };

  window.addEventListener("gamepadconnected", function(event){
    if(!window.state || !event.gamepad) return;

    window.state.gamepad = event.gamepad;

    if(window.game && window.game.style.display === "block"){
      if(typeof window.setControlMode === "function"){
        window.setControlMode("gamepad");
      }

      const indicator = document.getElementById("controlIndicator");
      if(indicator) indicator.textContent = "🎮 DUALSENSE";

      if(typeof window.showMessage === "function"){
        window.showMessage("🎮 CONTROLLER CONNECTED");
      }
    }
  });

  window.addEventListener("gamepaddisconnected", function(event){
    if(!window.state) return;

    if(
      window.state.gamepad &&
      event.gamepad &&
      window.state.gamepad.index === event.gamepad.index
    ){
      window.state.gamepad = null;
    }

    window.state.sprinting = false;
    window.state.speed = 0.55;
    window.state.moving = false;

    if(window.state.controlMode === "gamepad" && typeof window.setControlMode === "function"){
      window.setControlMode("touch");
    }

    const indicator = document.getElementById("controlIndicator");
    if(indicator) indicator.textContent = "📱 TOUCH";
  });
})();
