/* OBITREND FOOTBALL WORLD 27 — UNIFIED PS5 CONTROLLER
 * Touch PS5-style controller + physical Gamepad API support.
 * Physical controller uses the existing index.html loop for:
 *   Left Stick, Cross, Circle, R2, Options.
 * This file adds the missing physical controls without creating
 * duplicate movement or duplicate pass/shoot/pause events.
 */
(function(){
  "use strict";
  if(window.__obitrendUnifiedPS5) return;
  window.__obitrendUnifiedPS5=true;

  const $=id=>document.getElementById(id);

  function getState(){
    try{
      if(window.state) return window.state;
      if(typeof state!=="undefined") return state;
    }catch(_e){}
    return null;
  }

  let stickPointer=null;
  let rightPointer=null;
  let rightX=0;
  let rightY=0;

  /* =====================================================
     VIRTUAL PS5 TOUCH UI
  ===================================================== */

  function css(){
    if($("virtualPS5Style")) return;

    const s=document.createElement("style");
    s.id="virtualPS5Style";
    s.textContent=`
      #virtualPS5{position:fixed;inset:0;z-index:120;pointer-events:none;display:none;font-family:Arial,sans-serif}
      #virtualPS5.show{display:block}
      #vps5Left{position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:126px;height:126px;border-radius:50%;background:rgba(10,12,18,.48);border:2px solid rgba(255,255,255,.24);box-shadow:inset 0 0 25px rgba(255,255,255,.06);pointer-events:auto;touch-action:none}
      #vps5Stick{position:absolute;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.45);box-shadow:0 5px 18px rgba(0,0,0,.35)}
      #vps5Right{position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));width:178px;height:178px;pointer-events:none}
      .vps5btn{position:absolute;width:58px;height:58px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(10,12,18,.68);color:#fff;font-weight:1000;font-size:11px;pointer-events:auto;touch-action:none;box-shadow:0 6px 18px rgba(0,0,0,.3)}
      .vps5btn:active,.vps5btn.held{transform:scale(.9);filter:brightness(1.35)}
      #vCross{right:8px;top:60px}
      #vCircle{right:62px;top:108px;background:rgba(227,38,46,.72)}
      #vTriangle{right:62px;top:8px}
      #vSquare{right:116px;top:60px}
      #vps5Shoulders{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:205px;display:flex;gap:7px;pointer-events:none}
      .vps5shoulder{width:72px;height:36px;border-radius:12px;background:rgba(10,12,18,.65);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:8px;font-weight:1000;pointer-events:auto;touch-action:none}
      #vOptions{position:absolute;right:max(18px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top));width:64px;height:34px;border-radius:10px;background:rgba(10,12,18,.65);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:8px;font-weight:1000;pointer-events:auto;touch-action:none}
      #vps5Hint{position:absolute;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:6px 10px;border-radius:10px;background:rgba(0,0,0,.38);font-size:7px;letter-spacing:1px;opacity:.6;pointer-events:none;white-space:nowrap}
      #vps5WorldPlayer{position:absolute;width:26px;height:38px;transform:translate(-50%,-50%);z-index:3;pointer-events:none;display:none}
      #vps5WorldPlayer:before{content:"";position:absolute;left:7px;top:0;width:12px;height:12px;border-radius:50%;background:#b77a50}
      #vps5WorldPlayer:after{content:"";position:absolute;left:3px;top:12px;width:20px;height:24px;border-radius:6px;background:#e3262e;box-shadow:0 0 0 2px rgba(255,255,255,.25)}
      @media(max-width:600px){#vps5Left{width:112px;height:112px}.vps5btn{width:54px;height:54px}#vps5Right{width:170px;height:170px}.vps5shoulder{width:66px}}
      @media(max-height:430px){#vps5Left{width:94px;height:94px}#vps5Stick{width:42px;height:42px}#vps5Right{transform:scale(.82);transform-origin:bottom right}#vps5Shoulders{bottom:150px}}
    `;
    document.head.appendChild(s);
  }

  function build(){
    css();
    if($("virtualPS5")) return;

    const root=document.createElement("div");
    root.id="virtualPS5";
    root.innerHTML=`
      <div id="vps5WorldPlayer"></div>
      <div id="vps5Left"><div id="vps5Stick"></div></div>
      <div id="vps5Right">
        <button id="vTriangle" class="vps5btn">△</button>
        <button id="vCircle" class="vps5btn">○</button>
        <button id="vCross" class="vps5btn">✕</button>
        <button id="vSquare" class="vps5btn">□</button>
      </div>
      <div id="vps5Shoulders">
        <button id="vL2" class="vps5shoulder">L2</button>
        <button id="vL1" class="vps5shoulder">L1</button>
        <button id="vR1" class="vps5shoulder">R1</button>
        <button id="vR2" class="vps5shoulder">R2 SPRINT</button>
      </div>
      <button id="vOptions">OPTIONS</button>
      <div id="vps5Hint">PS5 CONTROLS</div>`;

    document.body.appendChild(root);
    bindStick($("vps5Left"),$("vps5Stick"));
    bindButtons();
    bindRightStick();
  }

  function activeScreen(){
    const g=$("game"),w=$("world"),r=$("replayScreen");
    if(r&&getComputedStyle(r).display!=="none") return "replay";
    if(g&&getComputedStyle(g).display!=="none") return "game";
    if(w&&getComputedStyle(w).display!=="none") return "world";
    return "none";
  }

  function show(){
    const root=$("virtualPS5");
    if(!root) return;

    const screen=activeScreen();
    root.classList.toggle("show",screen==="game"||screen==="world");

    const p=$("vps5WorldPlayer");
    if(p){
      p.style.display=screen==="world"?"block":"none";
      if(screen==="world"&&!p.dataset.x){
        p.dataset.x="50";
        p.dataset.y="70";
        p.style.left="50%";
        p.style.top="70%";
      }
    }
  }

  function move(dx,dy){
    const s=getState();
    const screen=activeScreen();

    if(screen==="game"){
      if(!s||s.paused) return;

      const speed=s.sprinting?1.15:.55;
      s.x=Math.max(10,Math.min(90,Number(s.x||50)+dx*speed));
      s.y=Math.max(10,Math.min(90,Number(s.y||50)+dy*speed));
      s.moving=Math.abs(dx)+Math.abs(dy)>.02;

      if(typeof window.updatePlayer==="function") window.updatePlayer();
      return;
    }

    if(screen==="world"){
      const p=$("vps5WorldPlayer");
      if(!p) return;
      let x=Number(p.dataset.x||50);
      let y=Number(p.dataset.y||70);
      x=Math.max(4,Math.min(96,x+dx*1.3));
      y=Math.max(18,Math.min(82,y+dy*1.3));
      p.dataset.x=x;
      p.dataset.y=y;
      p.style.left=x+"%";
      p.style.top=y+"%";
    }
  }

  function bindStick(base,stick){
    if(!base||!stick) return;

    const update=e=>{
      const r=base.getBoundingClientRect();
      const cx=r.left+r.width/2;
      const cy=r.top+r.height/2;
      let dx=e.clientX-cx;
      let dy=e.clientY-cy;
      const max=r.width*.32;
      const d=Math.hypot(dx,dy);

      if(d>max){
        dx=dx/d*max;
        dy=dy/d*max;
      }

      stick.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      move(dx/max,dy/max);
    };

    base.addEventListener("pointerdown",e=>{
      e.preventDefault();
      stickPointer=e.pointerId;
      base.setPointerCapture(e.pointerId);
      update(e);
    },{passive:false});

    base.addEventListener("pointermove",e=>{
      if(stickPointer===e.pointerId) update(e);
    },{passive:false});

    const end=e=>{
      if(stickPointer!==e.pointerId) return;
      stickPointer=null;
      stick.style.transform="translate(-50%,-50%)";
      const s=getState();
      if(s) s.moving=false;
    };

    base.addEventListener("pointerup",end);
    base.addEventListener("pointercancel",end);
  }

  function bind(id,down,up){
    const el=$(id);
    if(!el) return;

    const press=e=>{
      e.preventDefault();
      el.classList.add("held");
      if(down) down();
    };

    const release=e=>{
      e.preventDefault();
      el.classList.remove("held");
      if(up) up();
    };

    el.addEventListener("pointerdown",press);
    el.addEventListener("pointerup",release);
    el.addEventListener("pointercancel",release);
    el.addEventListener("pointerleave",release);
  }

  function pass(){
    if(typeof window.passBall==="function") window.passBall();
  }

  function shoot(){
    if(typeof window.shootBall==="function") window.shootBall();
  }

  function sprint(on){
    if(typeof window.setSprint==="function") window.setSprint(!!on);
    else{
      const s=getState();
      if(s) s.sprinting=!!on;
    }
  }

  function throughBall(){
    const s=getState();
    if(!s||s.paused||activeScreen()!=="game") return;

    s.ballX=Math.min(96,Number(s.x||50)+17);
    s.ballY=Number(s.y||50);
    if(typeof window.updateBall==="function") window.updateBall();
    if(typeof window.commentary==="function") window.commentary("A through ball splits the defence.");
    if(typeof window.recordReplayEvent==="function") window.recordReplayEvent("THROUGH_BALL");
    if(typeof window.showMessage==="function") window.showMessage("△ THROUGH BALL");
  }

  function tackle(){
    const s=getState();
    if(!s||s.paused||activeScreen()!=="game") return;

    if(typeof window.recordReplayEvent==="function") window.recordReplayEvent("TACKLE");
    if(typeof window.commentary==="function") window.commentary("Strong defensive pressure.");
    if(typeof window.showMessage==="function") window.showMessage("□ TACKLE / PRESS");
  }

  function switchPlayer(){
    if(activeScreen()!=="game") return;
    if(typeof window.recordReplayEvent==="function") window.recordReplayEvent("PLAYER_SWITCH");
    if(typeof window.showMessage==="function") window.showMessage("L1 PLAYER SWITCH");
  }

  function skill(){
    const s=getState();
    if(!s||s.paused||activeScreen()!=="game") return;
    if(typeof window.recordReplayEvent==="function") window.recordReplayEvent("SKILL");
    if(typeof window.commentary==="function") window.commentary("A quick skill move.");
    if(typeof window.showMessage==="function") window.showMessage("R1 SKILL MOVE");
  }

  function protect(on){
    if(activeScreen()!=="game") return;
    const s=getState();
    if(typeof window.showMessage==="function") window.showMessage(on?"L2 PROTECT / AIM":"L2 RELEASE");
    if(s) s.protecting=!!on;
  }

  function options(){
    if(activeScreen()==="game"&&typeof window.togglePause==="function") window.togglePause();
    else if(activeScreen()==="world"&&typeof window.backToMenu==="function") window.backToMenu();
  }

  function bindButtons(){
    bind("vCross",()=>{
      if(activeScreen()==="game") pass();
      else if(activeScreen()==="world"&&typeof window.openMatch==="function") window.openMatch();
    });

    bind("vCircle",()=>{
      if(activeScreen()==="game") shoot();
      else if(activeScreen()==="world"&&typeof window.openTraining==="function") window.openTraining();
    });

    bind("vTriangle",()=>{
      if(activeScreen()==="game") throughBall();
      else if(activeScreen()==="world"&&typeof window.openLifestyle==="function") window.openLifestyle();
    });

    bind("vSquare",()=>{
      if(activeScreen()==="game") tackle();
      else if(activeScreen()==="world"&&typeof window.openCoaches==="function") window.openCoaches();
    });

    bind("vR2",()=>sprint(true),()=>sprint(false));
    bind("vL2",()=>protect(true),()=>protect(false));
    bind("vL1",switchPlayer);
    bind("vR1",skill);
    bind("vOptions",options);
  }

  function bindRightStick(){
    const area=$("vps5Right");
    if(!area) return;

    area.addEventListener("pointerdown",e=>{
      e.preventDefault();
      rightPointer=e.pointerId;
      rightX=e.clientX;
      rightY=e.clientY;
      area.setPointerCapture(e.pointerId);
    },{passive:false});

    area.addEventListener("pointermove",e=>{
      if(rightPointer!==e.pointerId) return;
      const dx=e.clientX-rightX;
      const dy=e.clientY-rightY;
      rightX=e.clientX;
      rightY=e.clientY;
      if(Math.abs(dx)+Math.abs(dy)<2) return;

      window.vps5Camera={
        x:(window.vps5Camera?.x||0)+dx,
        y:(window.vps5Camera?.y||0)+dy
      };

      if(typeof window.onVirtualCameraMove==="function"){
        window.onVirtualCameraMove(dx,dy);
      }else if(typeof window.showMessage==="function"&&activeScreen()==="game"){
        window.showMessage("RIGHT STICK CAMERA");
      }
    },{passive:false});

    const end=e=>{
      if(rightPointer===e.pointerId) rightPointer=null;
    };

    area.addEventListener("pointerup",end);
    area.addEventListener("pointercancel",end);
  }

  /* =====================================================
     PHYSICAL GAMEPAD — ADDITIVE LAYER
     index.html already handles:
       0 Cross / pass
       1 Circle / shoot
       7 R2 / sprint
       9 Options / pause
       axes 0/1 left stick movement
     We deliberately do NOT handle those again here.
  ===================================================== */

  let physicalPadIndex=null;
  let physicalPrev=[];
  let physicalLastDpad=0;
  let physicalLastCameraMessage=0;

  function physicalPads(){
    try{
      return navigator.getGamepads?navigator.getGamepads():[];
    }catch(_e){
      return [];
    }
  }

  function findPhysicalPad(){
    const pads=physicalPads();
    if(physicalPadIndex!==null&&pads[physicalPadIndex]) return pads[physicalPadIndex];
    const pad=pads.find(Boolean)||null;
    physicalPadIndex=pad?pad.index:null;
    return pad;
  }

  function buttonPressed(pad,index){
    const b=pad?.buttons?.[index];
    return !!(b&&(b.pressed||Number(b.value||0)>.55));
  }

  function buttonEdge(pad,index){
    const now=buttonPressed(pad,index);
    return now&&!physicalPrev[index];
  }

  function analogEdge(pad,index,threshold=.35){
    const b=pad?.buttons?.[index];
    const value=Number(b?.value||0);
    return value>threshold&&!physicalPrev[index];
  }

  function physicalThroughBall(){ throughBall(); }
  function physicalTackle(){ tackle(); }
  function physicalSwitch(){ switchPlayer(); }
  function physicalSkill(){ skill(); }
  function physicalProtect(on){ protect(on); }

  function physicalDpad(pad){
    const up=buttonPressed(pad,12);
    const down=buttonPressed(pad,13);
    const left=buttonPressed(pad,14);
    const right=buttonPressed(pad,15);

    let dir=0;
    if(up) dir=12;
    else if(down) dir=13;
    else if(left) dir=14;
    else if(right) dir=15;

    if(dir&&dir!==physicalLastDpad){
      if(typeof window.recordReplayEvent==="function") window.recordReplayEvent("TACTIC_DPAD_"+dir);
      if(typeof window.showMessage==="function"){
        const names={12:"TACTIC UP",13:"TACTIC DOWN",14:"TACTIC LEFT",15:"TACTIC RIGHT"};
        window.showMessage("D-PAD • "+names[dir]);
      }
    }
    physicalLastDpad=dir;
  }

  function physicalRightStick(pad){
    const rx=Number(pad?.axes?.[2]||0);
    const ry=Number(pad?.axes?.[3]||0);
    const active=Math.hypot(rx,ry)>.22;

    if(active&&activeScreen()==="game"){
      window.vps5Camera={x:rx,y:ry};
      if(typeof window.onVirtualCameraMove==="function"){
        window.onVirtualCameraMove(rx,ry);
      }else if(Date.now()-physicalLastCameraMessage>900){
        physicalLastCameraMessage=Date.now();
        if(typeof window.showMessage==="function") window.showMessage("RIGHT STICK • CAMERA");
      }
    }
  }

  function physicalLoop(){
    const pad=findPhysicalPad();
    const s=getState();

    if(pad){
      if(s&&s.gamepad===null) s.gamepad=pad;

      /* Missing face/shoulder functions. */
      if(activeScreen()==="game"&&!s?.paused){
        if(buttonEdge(pad,2)) physicalTackle();       // Square
        if(buttonEdge(pad,3)) physicalThroughBall();  // Triangle
        if(buttonEdge(pad,4)) physicalSwitch();       // L1
        if(buttonEdge(pad,5)) physicalSkill();        // R1
        if(buttonPressed(pad,6)) physicalProtect(true);  // L2
        else if(physicalPrev[6]) physicalProtect(false);
      }

      physicalDpad(pad);
      physicalRightStick(pad);

      physicalPrev=(pad.buttons||[]).map(b=>!!(b&&(b.pressed||Number(b.value||0)>.55)));
    }else{
      physicalPadIndex=null;
      physicalPrev=[];
      physicalLastDpad=0;
    }

    requestAnimationFrame(physicalLoop);
  }

  window.addEventListener("gamepadconnected",e=>{
    if(!e.gamepad) return;
    physicalPadIndex=e.gamepad.index;
    const s=getState();
    if(s) s.gamepad=e.gamepad;

    const status=$("controllerStatus");
    if(status) status.textContent="Connected: "+e.gamepad.id;

    if(typeof window.setControlMode==="function"&&activeScreen()==="game"){
      window.setControlMode("gamepad");
      if(typeof window.closeController==="function") window.closeController();
      if(typeof window.showMessage==="function") window.showMessage("🎮 DUALSENSE CONNECTED");
    }
  });

  window.addEventListener("gamepaddisconnected",e=>{
    if(!e.gamepad) return;
    if(physicalPadIndex===e.gamepad.index) physicalPadIndex=null;

    const s=getState();
    if(s&&s.gamepad&&s.gamepad.index===e.gamepad.index){
      s.gamepad=null;
      s.sprinting=false;
      s.speed=.55;
      s.moving=false;
    }

    const status=$("controllerStatus");
    if(status) status.textContent="Controller disconnected.";

    if(s&&s.controlMode==="gamepad"&&typeof window.setControlMode==="function"){
      window.setControlMode("touch");
      if(activeScreen()==="game"&&typeof window.showMessage==="function") window.showMessage("📱 TOUCH MODE");
    }
  });

  function scanPhysicalController(){
    const pad=findPhysicalPad();
    const s=getState();
    if(pad&&s) s.gamepad=pad;

    const status=$("controllerStatus");
    if(status&&pad) status.textContent="Connected: "+pad.id;
  }

  function init(){
    build();
    scanPhysicalController();
    setInterval(show,120);
    requestAnimationFrame(physicalLoop);
    show();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();
