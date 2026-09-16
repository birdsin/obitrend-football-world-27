/*
 * OBITREND FOOTBALL WORLD 27 — STEP 1 CONTROL PATCH
 * Android touch + PS5/DualSense/Gamepad API.
 *
 * This file is intentionally additive. It does not own coins, purchases,
 * authentication, or entitlements. Those must remain server-authoritative.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "obitrend_control_mode";
  const DEADZONE = 0.14;
  const MOVE_SCALE = 1.0;
  const SPRINT_THRESHOLD = 0.35;

  const $ = (id) => document.getElementById(id);
  const has = (id) => !!$(id);

  function getState() {
    if (window.state && typeof window.state === "object") return window.state;
    return null;
  }

  function setMode(mode) {
    const state = getState();
    if (state) state.controlMode = mode;
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (_) {}
    document.body.classList.toggle("gamepad-mode", mode === "gamepad");
    document.body.classList.toggle("touch-mode", mode !== "gamepad");
    updateControllerIndicator();
  }

  function getMode() {
    const state = getState();
    if (state && (state.controlMode === "touch" || state.controlMode === "gamepad")) {
      return state.controlMode;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "gamepad" ? "gamepad" : "touch";
    } catch (_) {
      return "touch";
    }
  }

  function updateControllerIndicator() {
    const indicator = $("controlModeIndicator");
    if (!indicator) return;
    indicator.textContent = getMode() === "gamepad" ? "PS5 / CONTROLLER" : "ANDROID TOUCH";
  }

  function isGameVisible() {
    const game = $("game");
    if (!game) return false;
    return getComputedStyle(game).display !== "none";
  }

  function isButtonDown(gp, index) {
    return !!(gp && gp.buttons && gp.buttons[index] && gp.buttons[index].pressed);
  }

  function buttonValue(gp, index) {
    const b = gp && gp.buttons && gp.buttons[index];
    return b ? (typeof b.value === "number" ? b.value : (b.pressed ? 1 : 0)) : 0;
  }

  function deadzone(v) {
    if (Math.abs(v) <= DEADZONE) return 0;
    const sign = v < 0 ? -1 : 1;
    return sign * ((Math.abs(v) - DEADZONE) / (1 - DEADZONE));
  }

  function dispatchAction(id) {
    const el = $(id);
    if (el && typeof el.click === "function") el.click();
  }

  function setMovement(x, y) {
    const state = getState();
    if (!state) return;
    const mx = deadzone(x) * MOVE_SCALE;
    const my = deadzone(y) * MOVE_SCALE;

    /* Support the existing game's common movement fields without replacing
       its own touch implementation. */
    state.gamepadMoveX = mx;
    state.gamepadMoveY = my;

    if (typeof window.handlePlayerMovement === "function") {
      window.handlePlayerMovement(mx, my);
    } else if (typeof window.movePlayer === "function") {
      window.movePlayer(mx, my);
    }
  }

  function ensurePauseOverlay() {
    if ($("gamePauseOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "gamePauseOverlay";
    overlay.innerHTML = '<div class="pauseCard"><div class="pauseTitle">MATCH PAUSED</div><div class="pauseSub">OPTIONS / START</div><button id="resumeMatchBtn" type="button">RESUME</button></div>';
    document.body.appendChild(overlay);
    const style = document.createElement("style");
    style.id = "step1PauseStyle";
    style.textContent = `
      #gamePauseOverlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);backdrop-filter:blur(8px);z-index:180;pointer-events:auto}
      #gamePauseOverlay.show{display:flex}
      .pauseCard{width:min(340px,88vw);padding:28px;border-radius:20px;text-align:center;background:rgba(7,10,16,.96);border:1px solid rgba(255,255,255,.18);box-shadow:0 25px 80px rgba(0,0,0,.7)}
      .pauseTitle{font-size:24px;font-weight:1000;letter-spacing:1px}.pauseSub{margin:8px 0 20px;font-size:10px;opacity:.55;letter-spacing:2px}.pauseCard button{padding:13px 26px;border-radius:11px;background:#e3262e}
    `;
    document.head.appendChild(style);
    $("resumeMatchBtn").addEventListener("click", togglePause);
  }

  function togglePause() {
    const state = getState();
    if (state) state.paused = !state.paused;
    ensurePauseOverlay();
    const overlay = $("gamePauseOverlay");
    if (overlay) overlay.classList.toggle("show", !!(state && state.paused));
  }

  let lastButtons = [];
  let activeGamepadIndex = null;

  function pollGamepad() {
    if (getMode() !== "gamepad" || !isGameVisible()) {
      requestAnimationFrame(pollGamepad);
      return;
    }

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = activeGamepadIndex != null ? pads[activeGamepadIndex] : null;
    if (!gp) gp = Array.from(pads).find(Boolean);

    if (!gp) {
      requestAnimationFrame(pollGamepad);
      return;
    }

    activeGamepadIndex = gp.index;

    const b = Array.from({ length: 17 }, (_, i) => isButtonDown(gp, i));
    const pressed = (i) => b[i] && !lastButtons[i];

    const axes = gp.axes || [];
    setMovement(axes[0] || 0, axes[1] || 0);

    /* Standard Gamepad mapping: A/Cross=0, B/Circle=1, Start/Options=9. */
    if (pressed(0)) dispatchAction("passBtn");
    if (pressed(1)) dispatchAction("shootBtn");
    if (pressed(9)) togglePause();

    /* R2 is normally button 7. Use its analog value so partial trigger
       pressure can still control sprint. */
    const sprint = buttonValue(gp, 7) >= SPRINT_THRESHOLD;
    const state = getState();
    if (state) state.gamepadSprint = sprint;
    const sprintEl = $("sprintBtn");
    if (sprintEl) sprintEl.classList.toggle("held", sprint);
    if (typeof window.setSprint === "function") window.setSprint(sprint);

    lastButtons = b;
    requestAnimationFrame(pollGamepad);
  }

  function connected(e) {
    if (!e.gamepad) return;
    activeGamepadIndex = e.gamepad.index;
    const status = $("controllerStatus");
    if (status) status.textContent = "Controller connected: " + (e.gamepad.id || "Gamepad");
    const indicator = $("controlModeIndicator");
    if (indicator) indicator.textContent = "CONTROLLER READY";
  }

  function disconnected(e) {
    if (e.gamepad && e.gamepad.index === activeGamepadIndex) activeGamepadIndex = null;
    const status = $("controllerStatus");
    if (status) status.textContent = "No controller detected — connect a PS5/DualSense controller.";
  }

  function injectStyles() {
    if ($("step1ControlStyle")) return;
    const style = document.createElement("style");
    style.id = "step1ControlStyle";
    style.textContent = `
      .gamepad-mode .controls{display:none!important;pointer-events:none!important}
      .touch-mode .controls{display:block}
      #controlModeIndicator{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));z-index:65;padding:7px 10px;border-radius:9px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.16);font:900 8px Arial,sans-serif;letter-spacing:1px;pointer-events:none;opacity:.75}
      .gamepad-mode #controlModeIndicator{background:rgba(20,20,20,.78)}
      .actionBtn.held{transform:scale(.94);filter:brightness(1.25)}
      @media (orientation:portrait){.joystick{width:108px;height:108px}.actionButtons{width:205px;height:145px}.actionBtn{width:60px;height:60px}}
      @media (max-width:480px){.joystick{left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom))}.actionButtons{right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom))}}
      @media (min-width:900px){.joystick{left:max(28px,env(safe-area-inset-left));bottom:max(28px,env(safe-area-inset-bottom))}.actionButtons{right:max(28px,env(safe-area-inset-right));bottom:max(24px,env(safe-area-inset-bottom))}}
    `;
    document.head.appendChild(style);
  }

  function ensureIndicator() {
    if ($("controlModeIndicator")) return;
    const el = document.createElement("div");
    el.id = "controlModeIndicator";
    el.textContent = getMode() === "gamepad" ? "PS5 / CONTROLLER" : "ANDROID TOUCH";
    document.body.appendChild(el);
  }

  /* Override the existing switch function only for control selection.
     All other game functions remain untouched. */
  function installSwitch() {
    const original = window.switchControlMode;
    window.switchControlMode = function () {
      const next = getMode() === "touch" ? "gamepad" : "touch";
      setMode(next);
      if (typeof original === "function") {
        try { original(); } catch (_) {}
      }
      /* The original function may toggle again; restore our requested mode. */
      setMode(next);
      if (typeof window.openController === "function" && next === "gamepad") {
        try { window.openController(); } catch (_) {}
      }
    };
  }

  function init() {
    injectStyles();
    ensureIndicator();
    ensurePauseOverlay();
    setMode(getMode());
    installSwitch();
    window.addEventListener("gamepadconnected", connected);
    window.addEventListener("gamepaddisconnected", disconnected);
    requestAnimationFrame(pollGamepad);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
