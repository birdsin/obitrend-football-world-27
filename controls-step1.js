/*
 * OBITREND FOOTBALL WORLD 27
 * DUAL TOUCH CONTROLLER SYSTEM
 *
 * 1. NORMAL TOUCH
 * 2. PS5-STYLE TOUCH
 *
 * Physical Gamepad/DualSense support is retained separately.
 * This file does not control coins, payments, authentication or entitlements.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "obitrend_control_mode";

  const MODE_NORMAL = "touch";
  const MODE_PS5 = "ps5touch";
  const MODE_GAMEPAD = "gamepad";

  const DEADZONE = 0.14;
  const SPRINT_THRESHOLD = 0.35;

  const $ = id => document.getElementById(id);

  function getState() {
    return window.state && typeof window.state === "object"
      ? window.state
      : null;
  }

  /* =====================================================
     MODE
  ===================================================== */

  function getMode() {
    const state = getState();

    if (
      state &&
      [MODE_NORMAL, MODE_PS5, MODE_GAMEPAD].includes(
        state.controlMode
      )
    ) {
      return state.controlMode;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (
        saved === MODE_PS5 ||
        saved === MODE_GAMEPAD ||
        saved === MODE_NORMAL
      ) {
        return saved;
      }
    } catch (_) {}

    return MODE_NORMAL;
  }

  function setMode(mode) {
    if (
      ![MODE_NORMAL, MODE_PS5, MODE_GAMEPAD].includes(mode)
    ) {
      mode = MODE_NORMAL;
    }

    const state = getState();

    if (state) {
      state.controlMode = mode;
    }

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {}

    document.body.classList.toggle(
      "obitouch-normal",
      mode === MODE_NORMAL
    );

    document.body.classList.toggle(
      "obitouch-ps5",
      mode === MODE_PS5
    );

    document.body.classList.toggle(
      "gamepad-mode",
      mode === MODE_GAMEPAD
    );

    document.body.classList.toggle(
      "touch-mode",
      mode !== MODE_GAMEPAD
    );

    updateIndicator();
    updateControllerUI();
  }

  function updateIndicator() {
    const el = $("controlModeIndicator");

    if (!el) return;

    const mode = getMode();

    if (mode === MODE_PS5) {
      el.textContent = "PS5 TOUCH";
    } else if (mode === MODE_GAMEPAD) {
      el.textContent = "PHYSICAL CONTROLLER";
    } else {
      el.textContent = "NORMAL TOUCH";
    }
  }

  /* =====================================================
     GAME ACTIONS
  ===================================================== */

  function action(id) {
    const el = $(id);

    if (
      el &&
      typeof el.click === "function"
    ) {
      el.click();
      return true;
    }

    return false;
  }

  function setSprint(value) {
    const state = getState();

    if (state) {
      state.gamepadSprint = !!value;
    }

    const btn = $("sprintBtn");

    if (btn) {
      btn.classList.toggle(
        "held",
        !!value
      );
    }

    if (
      typeof window.setSprint === "function"
    ) {
      try {
        window.setSprint(!!value);
      } catch (_) {}
    }
  }

  function movePlayer(x, y) {
    const state = getState();

    if (!state) return;

    const length =
      Math.sqrt(x * x + y * y);

    if (length < DEADZONE) {
      x = 0;
      y = 0;
    } else if (length > 1) {
      x /= length;
      y /= length;
    }

    state.gamepadMoveX = x;
    state.gamepadMoveY = y;

    if (
      typeof window.handlePlayerMovement ===
      "function"
    ) {
      try {
        window.handlePlayerMovement(
          x,
          y
        );
        return;
      } catch (_) {}
    }

    if (
      typeof window.movePlayer ===
      "function"
    ) {
      try {
        window.movePlayer(
          x,
          y
        );
      } catch (_) {}
    }
  }

  /* =====================================================
     CONTROLLER SELECTION
  ===================================================== */

  function createControllerSelector() {
    if ($("obitControllerSelector")) {
      updateControllerUI();
      return;
    }

    const wrap =
      document.createElement("div");

    wrap.id =
      "obitControllerSelector";

    wrap.innerHTML = `
      <div class="obitControllerCard">

        <div class="obitControllerTitle">
          CONTROLS
        </div>

        <div class="obitControllerSub">
          CHOOSE YOUR PREFERRED CONTROLLER
        </div>

        <button
          type="button"
          class="obitControllerOption"
          data-mode="touch"
        >
          <span class="obitControllerIcon">🎮</span>
          <span>
            <b>NORMAL TOUCH</b>
            <small>Classic Android football controls</small>
          </span>
        </button>

        <button
          type="button"
          class="obitControllerOption"
          data-mode="ps5touch"
        >
          <span class="obitControllerIcon">🎮</span>
          <span>
            <b>PS5 TOUCH</b>
            <small>PS5-style controller — no gamepad required</small>
          </span>
        </button>

        <button
          type="button"
          class="obitControllerOption"
          data-mode="gamepad"
        >
          <span class="obitControllerIcon">🎮</span>
          <span>
            <b>PHYSICAL CONTROLLER</b>
            <small>Bluetooth / USB gamepad</small>
          </span>
        </button>

        <button
          type="button"
          id="obitControllerClose"
          class="obitControllerClose"
        >
          CLOSE
        </button>

      </div>
    `;

    document.body.appendChild(wrap);

    wrap
      .querySelectorAll(
        ".obitControllerOption"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            const mode =
              button.dataset.mode;

            setMode(mode);

            wrap.classList.remove(
              "show"
            );
          }
        );
      });

    const close =
      $("obitControllerClose");

    if (close) {
      close.addEventListener(
        "click",
        () => {
          wrap.classList.remove(
            "show"
          );
        }
      );
    }
  }

  function updateControllerUI() {
    const mode = getMode();

    document
      .querySelectorAll(
        ".obitControllerOption"
      )
      .forEach(button => {
        button.classList.toggle(
          "selected",
          button.dataset.mode === mode
        );
      });

    const normal =
      $("obitNormalTouch");

    const ps5 =
      $("obitPs5Touch");

    if (normal) {
      normal.style.display =
        mode === MODE_NORMAL
          ? "block"
          : "none";
    }

    if (ps5) {
      ps5.style.display =
        mode === MODE_PS5
          ? "block"
          : "none";
    }
  }

  window.openOBITRENDControls =
    function () {
      createControllerSelector();

      const modal =
        $("obitControllerSelector");

      if (modal) {
        modal.classList.add("show");
        updateControllerUI();
      }
    };

  /* =====================================================
     NORMAL TOUCH
     Existing .controls remain untouched.
  ===================================================== */

  function installNormalTouch() {
    /*
     * The game's existing Android controls remain
     * exactly where they are.
     */
  }

  /* =====================================================
     PS5 TOUCH CONTROLLER
  ===================================================== */

  function createPS5Controller() {
    if ($("obitPs5Touch")) {
      return;
    }

    const controller =
      document.createElement("div");

    controller.id =
      "obitPs5Touch";

    controller.innerHTML = `

      <div class="obitPs5Left">

        <div
          id="obitPs5Stick"
          class="obitPs5Stick"
        >
          <div
            id="obitPs5StickKnob"
            class="obitPs5StickKnob"
          ></div>
        </div>

      </div>

      <div class="obitPs5Right">

        <button
          type="button"
          class="obitPs5Button triangle"
          data-action="throughBtn"
        >
          △
        </button>

        <button
          type="button"
          class="obitPs5Button circle"
          data-action="shootBtn"
        >
          ○
        </button>

        <button
          type="button"
          class="obitPs5Button cross"
          data-action="passBtn"
        >
          ×
        </button>

        <button
          type="button"
          class="obitPs5Button square"
          data-action="crossBtn"
        >
          □
        </button>

      </div>

      <div class="obitPs5Shoulders">

        <button
          type="button"
          class="obitPs5Shoulder"
          data-action="l1Btn"
        >
          L1
        </button>

        <button
          type="button"
          class="obitPs5Shoulder"
          data-action="r1Btn"
        >
          R1
        </button>

      </div>

      <div class="obitPs5Triggers">

        <button
          type="button"
          class="obitPs5Trigger"
          data-action="l2Btn"
        >
          L2
        </button>

        <button
          type="button"
          id="obitPs5Sprint"
          class="obitPs5Trigger"
        >
          R2
        </button>

      </div>

      <button
        type="button"
        id="obitPs5Options"
        class="obitPs5Options"
      >
        OPTIONS
      </button>

    `;

    document.body.appendChild(controller);

    installPS5Buttons();
    installPS5Stick();
    installPS5Sprint();
  }

  function installPS5Buttons() {
    document
      .querySelectorAll(
        "#obitPs5Touch [data-action]"
      )
      .forEach(button => {

        button.addEventListener(
          "pointerdown",
          event => {
            event.preventDefault();

            button.classList.add(
              "pressed"
            );

            action(
              button.dataset.action
            );
          },
          { passive: false }
        );

        button.addEventListener(
          "pointerup",
          event => {
            event.preventDefault();

            button.classList.remove(
              "pressed"
            );
          },
          { passive: false }
        );

        button.addEventListener(
          "pointercancel",
          () => {
            button.classList.remove(
              "pressed"
            );
          }
        );
      });

    const options =
      $("obitPs5Options");

    if (options) {
      options.addEventListener(
        "pointerdown",
        event => {
          event.preventDefault();
          options.classList.add(
            "pressed"
          );

          if (
            typeof window.togglePause ===
            "function"
          ) {
            window.togglePause();
          } else {
            const state = getState();

            if (state) {
              state.paused =
                !state.paused;
            }
          }
        },
        { passive: false }
      );

      options.addEventListener(
        "pointerup",
        () => {
          options.classList.remove(
            "pressed"
          );
        }
      );
    }
  }

  /* =====================================================
     PS5 ANALOG STICK
  ===================================================== */

  let stickActive = false;
  let stickPointer = null;

  function installPS5Stick() {
    const stick =
      $("obitPs5Stick");

    const knob =
      $("obitPs5StickKnob");

    if (!stick || !knob) {
      return;
    }

    function center() {
      knob.style.transform =
        "translate(-50%,-50%)";

      movePlayer(0, 0);
    }

    function update(event) {
      const rect =
        stick.getBoundingClientRect();

      const cx =
        rect.left +
        rect.width / 2;

      const cy =
        rect.top +
        rect.height / 2;

      const radius =
        rect.width * 0.36;

      let dx =
        event.clientX - cx;

      let dy =
        event.clientY - cy;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (distance > radius) {
        dx =
          dx / distance *
          radius;

        dy =
          dy / distance *
          radius;
      }

      const x =
        dx / radius;

      const y =
        dy / radius;

      knob.style.transform =
        `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;

      movePlayer(x, y);
    }

    stick.addEventListener(
      "pointerdown",
      event => {
        if (getMode() !== MODE_PS5) {
          return;
        }

        event.preventDefault();

        stickActive = true;
        stickPointer =
          event.pointerId;

        try {
          stick.setPointerCapture(
            event.pointerId
          );
        } catch (_) {}

        update(event);
      },
      { passive: false }
    );

    stick.addEventListener(
      "pointermove",
      event => {
        if (
          !stickActive ||
          event.pointerId !== stickPointer
        ) {
          return;
        }

        event.preventDefault();

        update(event);
      },
      { passive: false }
    );

    function release(event) {
      if (
        event &&
        event.pointerId !== stickPointer
      ) {
        return;
      }

      stickActive = false;
      stickPointer = null;

      center();
    }

    stick.addEventListener(
      "pointerup",
      release
    );

    stick.addEventListener(
      "pointercancel",
      release
    );

    stick.addEventListener(
      "lostpointercapture",
      release
    );
  }

  /* =====================================================
     R2 SPRINT
  ===================================================== */

  function installPS5Sprint() {
    const sprint =
      $("obitPs5Sprint");

    if (!sprint) return;

    function down(event) {
      if (getMode() !== MODE_PS5) {
        return;
      }

      event.preventDefault();

      sprint.classList.add(
        "pressed"
      );

      setSprint(true);

      try {
        sprint.setPointerCapture(
          event.pointerId
        );
      } catch (_) {}
    }

    function up() {
      sprint.classList.remove(
        "pressed"
      );

      setSprint(false);
    }

    sprint.addEventListener(
      "pointerdown",
      down,
      { passive: false }
    );

    sprint.addEventListener(
      "pointerup",
      up
    );

    sprint.addEventListener(
      "pointercancel",
      up
    );

    sprint.addEventListener(
      "lostpointercapture",
      up
    );
  }

  /* =====================================================
     PHYSICAL GAMEPAD
  ===================================================== */

  let activeGamepadIndex = null;
  let previousButtons = [];

  function buttonPressed(
    gp,
    index
  ) {
    return !!(
      gp &&
      gp.buttons &&
      gp.buttons[index] &&
      gp.buttons[index].pressed
    );
  }

  function buttonValue(
    gp,
    index
  ) {
    const button =
      gp &&
      gp.buttons &&
      gp.buttons[index];

    if (!button) return 0;

    return typeof button.value ===
      "number"
      ? button.value
      : button.pressed
        ? 1
        : 0;
  }

  function pollGamepad() {
    if (
      getMode() !== MODE_GAMEPAD
    ) {
      requestAnimationFrame(
        pollGamepad
      );
      return;
    }

    if (
      !navigator.getGamepads
    ) {
      requestAnimationFrame(
        pollGamepad
      );
      return;
    }

    const pads =
      navigator.getGamepads();

    let gp =
      activeGamepadIndex != null
        ? pads[
            activeGamepadIndex
          ]
        : null;

    if (!gp) {
      gp =
        Array
          .from(pads)
          .find(Boolean);
    }

    if (!gp) {
      requestAnimationFrame(
        pollGamepad
      );
      return;
    }

    activeGamepadIndex =
      gp.index;

    const buttons =
      Array.from(
        { length: 17 },
        (_, i) =>
          buttonPressed(
            gp,
            i
          )
      );

    const pressed =
      index =>
        buttons[index] &&
        !previousButtons[index];

    const axes =
      gp.axes || [];

    movePlayer(
      axes[0] || 0,
      axes[1] || 0
    );

    /* Cross */
    if (pressed(0)) {
      action("passBtn");
    }

    /* Circle */
    if (pressed(1)) {
      action("shootBtn");
    }

    /* Options */
    if (pressed(9)) {
      if (
        typeof window.togglePause ===
        "function"
      ) {
        window.togglePause();
      }
    }

    const sprint =
      buttonValue(
        gp,
        7
      ) >=
      SPRINT_THRESHOLD;

    setSprint(sprint);

    previousButtons =
      buttons;

    requestAnimationFrame(
      pollGamepad
    );
  }

  function gamepadConnected(event) {
    if (!event.gamepad) return;

    activeGamepadIndex =
      event.gamepad.index;

    const status =
      $("controllerStatus");

    if (status) {
      status.textContent =
        "Controller connected: " +
        (
          event.gamepad.id ||
          "Gamepad"
        );
    }
  }

  function gamepadDisconnected(event) {
    if (
      event.gamepad &&
      event.gamepad.index ===
        activeGamepadIndex
    ) {
      activeGamepadIndex = null;
    }

    setSprint(false);

    const status =
      $("controllerStatus");

    if (status) {
      status.textContent =
        "No physical controller connected";
    }
  }

  /* =====================================================
     STYLES
  ===================================================== */

  function injectStyles() {
    if ($("obitDualControllerStyles")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "obitDualControllerStyles";

    style.textContent = `

      /* =========================================
         CONTROLLER SELECTOR
      ========================================= */

      #obitControllerSelector{
        position:fixed;
        inset:0;
        display:none;
        align-items:center;
        justify-content:center;
        z-index:500;
        padding:20px;
        background:rgba(0,0,0,.72);
        backdrop-filter:blur(12px);
      }

      #obitControllerSelector.show{
        display:flex;
      }

      .obitControllerCard{
        width:min(430px,94vw);
        padding:24px;
        border-radius:24px;
        background:#080b12;
        border:1px solid rgba(255,255,255,.15);
        box-shadow:0 30px 100px rgba(0,0,0,.7);
      }

      .obitControllerTitle{
        text-align:center;
        font-size:25px;
        font-weight:1000;
        letter-spacing:1px;
      }

      .obitControllerSub{
        text-align:center;
        margin:7px 0 20px;
        font-size:10px;
        opacity:.55;
        letter-spacing:1.5px;
      }

      .obitControllerOption{
        width:100%;
        display:flex;
        align-items:center;
        gap:14px;
        margin:9px 0;
        padding:15px;
        border-radius:15px;
        color:#fff;
        background:#111722;
        border:1px solid rgba(255,255,255,.1);
        text-align:left;
        cursor:pointer;
      }

      .obitControllerOption.selected{
        border-color:#fff;
        background:#1b2330;
      }

      .obitControllerIcon{
        font-size:28px;
      }

      .obitControllerOption b{
        display:block;
        font-size:13px;
      }

      .obitControllerOption small{
        display:block;
        margin-top:4px;
        font-size:9px;
        opacity:.55;
      }

      .obitControllerClose{
        width:100%;
        margin-top:12px;
        padding:12px;
        border:0;
        border-radius:12px;
        background:#202632;
        color:#fff;
        font-weight:800;
      }

      /* =========================================
         ORIGINAL NORMAL TOUCH
      ========================================= */

      .obitouch-normal .controls{
        display:block;
      }

      .obitouch-ps5 .controls{
        display:none!important;
      }

      .gamepad-mode .controls{
        display:none!important;
      }

      /* =========================================
         PS5 TOUCH
      ========================================= */

      #obitPs5Touch{
        position:fixed;
        inset:0;
        z-index:120;
        display:none;
        pointer-events:none;
        touch-action:none;
        user-select:none;
      }

      .obitouch-ps5 #obitPs5Touch{
        display:block;
      }

      .obitPs5Left{
        position:absolute;
        left:max(22px,env(safe-area-inset-left));
        bottom:max(24px,env(safe-area-inset-bottom));
        width:145px;
        height:145px;
      }

      .obitPs5Stick{
        position:absolute;
        inset:0;
        border-radius:50%;
        background:
          radial-gradient(
            circle at 50% 50%,
            #2b3340 0 37%,
            #151a22 38% 65%,
            #080b10 66%
          );
        border:2px solid rgba(255,255,255,.25);
        box-shadow:
          inset 0 8px 18px rgba(255,255,255,.08),
          0 10px 35px rgba(0,0,0,.55);
        touch-action:none;
      }

      .obitPs5StickKnob{
        position:absolute;
        left:50%;
        top:50%;
        width:62px;
        height:62px;
        border-radius:50%;
        transform:translate(-50%,-50%);
        background:
          radial-gradient(
            circle at 35% 30%,
            #4c5666,
            #171d26 70%
          );
        border:2px solid rgba(255,255,255,.2);
        box-shadow:
          0 8px 18px rgba(0,0,0,.6);
      }

      .obitPs5Right{
        position:absolute;
        right:max(22px,env(safe-area-inset-right));
        bottom:max(36px,env(safe-area-inset-bottom));
        width:180px;
        height:180px;
      }

      .obitPs5Button{
        position:absolute;
        width:58px;
        height:58px;
        border-radius:50%;
        border:2px solid rgba(255,255,255,.18);
        background:#171d26;
        color:#fff;
        font-size:27px;
        font-weight:900;
        box-shadow:0 8px 20px rgba(0,0,0,.55);
        touch-action:none;
      }

      .obitPs5Button.pressed,
      .obitPs5Trigger.pressed,
      .obitPs5Shoulder.pressed,
      .obitPs5Options.pressed{
        transform:scale(.9);
        filter:brightness(1.35);
      }

      .obitPs5Button.triangle{
        left:61px;
        top:0;
      }

      .obitPs5Button.circle{
        right:0;
        top:61px;
      }

      .obitPs5Button.cross{
        left:61px;
        bottom:0;
      }

      .obitPs5Button.square{
        left:0;
        top:61px;
      }

      .obitPs5Shoulders{
        position:absolute;
        left:20px;
        right:20px;
        top:18px;
        display:flex;
        justify-content:space-between;
      }

      .obitPs5Shoulder{
        width:58px;
        height:32px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.16);
        background:#171d26;
        color:#fff;
        font-size:11px;
        font-weight:900;
        touch-action:none;
      }

      .obitPs5Triggers{
        position:absolute;
        left:20px;
        right:20px;
        top:55px;
        display:flex;
        justify-content:space-between;
      }

      .obitPs5Trigger{
        width:62px;
        height:35px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.16);
        background:#171d26;
        color:#fff;
        font-size:10px;
        font-weight:900;
        touch-action:none;
      }

      .obitPs5Options{
        position:absolute;
        left:50%;
        transform:translateX(-50%);
        bottom:190px;
        padding:8px 14px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.15);
        background:#121720;
        color:#fff;
        font-size:9px;
        font-weight:900;
        letter-spacing:1px;
        touch-action:none;
      }

      @media(max-width:480px){

        .obitPs5Left{
          width:120px;
          height:120px;
        }

        .obitPs5StickKnob{
          width:54px;
          height:54px;
        }

        .obitPs5Right{
          width:160px;
          height:160px;
          right:15px;
        }

        .obitPs5Button{
          width:52px;
          height:52px;
        }

        .obitPs5Button.triangle{
          left:54px;
        }

        .obitPs5Button.circle{
          top:54px;
        }

        .obitPs5Button.cross{
          left:54px;
        }

        .obitPs5Button.square{
          top:54px;
        }

        .obitPs5Options{
          bottom:170px;
        }
      }

    `;

    document.head.appendChild(style);
  }

  /* =====================================================
     INITIALIZE
  ===================================================== */

  function init() {
    injectStyles();

    createControllerSelector();
    createPS5Controller();

    installNormalTouch();

    setMode(getMode());

    window.addEventListener(
      "gamepadconnected",
      gamepadConnected
    );

    window.addEventListener(
      "gamepaddisconnected",
      gamepadDisconnected
    );

    requestAnimationFrame(
      pollGamepad
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once:true }
    );
  } else {
    init();
  }

})();
