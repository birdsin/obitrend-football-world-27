/* OBITREND FOOTBALL WORLD 27 — VIRTUAL PS5 CONTROLLER
 * Phone-first PS5-style controls. No physical controller required.
 * Physical Gamepad API support remains optional and untouched.
 */
(function(){
  "use strict";
  if(window.__obitrendVirtualPS5) return;
  window.__obitrendVirtualPS5=true;

  const $=id=>document.getElementById(id);
  const state=window.state;
  let stickPointer=null;
  let rightPointer=null;
  let sprintTimer=null;
  let lastX=0,lastY=0;
  let worldPlayer=null;
  let rightX=0,rightY=0;

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
      #vCross{right:8px;top:60px} #vCircle{right:62px;top:108px;background:rgba(227,38,46,.72)} #vTriangle{right:62px;top:8px} #vSquare{right:116px;top:60px}
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
      <div id="vps5Hint">VIRTUAL PS5 CONTROLS • NO PAD REQUIRED</div>`;
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
    const root=$("virtualPS5"); if(!root) return;
    const screen=activeScreen();
    root.classList.toggle("show",screen==="game"||screen==="world");
    const p=$("vps5WorldPlayer");
    if(p) p.style.display=screen==="world"?"block":"none";
    if(screen!=="game") setSprint(false);
  }

  function move(dx,dy){
    const screen=activeScreen();
    if(screen==="game"){
      if(!window.state||window.state.paused) return;
      const speed=window.state.sprinting?1.15:.55;
      window.state.x=Math.max(10,Math.min(90,window.state.x+dx*speed));
      window.state.y=Math.max(10,Math.min(90,window.state.y+dy*speed));
      window.state.moving=Math.abs(dx)+Math.abs(dy)>.02;
      if(typeof window.updatePlayer==="function") window.updatePlayer();
      return;
    }
    if(screen==="world"){
      const p=$("vps5WorldPlayer"); if(!p) return;
      let x=Number(p.dataset.x||50),y=Number(p.dataset.y||70);
      x=Math.max(4,Math.min(96,x+dx*1.3)); y=Math.max(18,Math.min(82,y+dy*1.3));
      p.dataset.x=x;p.dataset.y=y;p.style.left=x+"%";p.style.top=y+"%";
    }
  }

  function bindStick(base,stick){
    if(!base||!stick) return;
    const update=e=>{
      const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      let dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.32,d=Math.hypot(dx,dy);
      if(d>max){dx=dx/d*max;dy=dy/d*max}
      stick.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
      move(dx/max,dy/max);
    };
    base.addEventListener("pointerdown",e=>{stickPointer=e.pointerId;base.setPointerCapture(e.pointerId);update(e)},{passive:false});
    base.addEventListener("pointermove",e=>{if(stickPointer===e.pointerId)update(e)},{passive:false});
    const end=e=>{if(stickPointer!==e.pointerId)return;stickPointer=null;stick.style.transform="translate(-50%,-50%)";if(window.state)window.state.moving=false};
    base.addEventListener("pointerup",end);base.addEventListener("pointercancel",end);
  }

  function bind(id,down,up){
    const el=$(id);if(!el)return;
    const press=e=>{e.preventDefault();el.classList.add("held");if(down)down()};
    const release=e=>{e.preventDefault();el.classList.remove("held");if(up)up()};
    el.addEventListener("pointerdown",press);el.addEventListener("pointerup",release);el.addEventListener("pointercancel",release);el.addEventListener("pointerleave",release);
  }

  function bindButtons(){
    bind("vCross",()=>{
      const s=activeScreen();
      if(s==="game"&&typeof window.passBall==="function")window.passBall();
      else if(s==="world"&&typeof window.openMatch==="function")window.openMatch();
    });
    bind("vCircle",()=>{
      const s=activeScreen();
      if(s==="game"&&typeof window.shootBall==="function")window.shootBall();
      else if(s==="world"&&typeof window.openTraining==="function")window.openTraining();
    });
    bind("vTriangle",()=>{
      const s=activeScreen();
      if(s==="game"&&typeof window.switchControlMode==="function")window.switchControlMode();
      else if(s==="world"&&typeof window.openLifestyle==="function")window.openLifestyle();
    });
    bind("vSquare",()=>{
      const s=activeScreen();
      if(s==="game"){
        if(typeof window.showMessage==="function")window.showMessage("□ TACKLE / PRESS");
        if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("TACKLE");
      }else if(s==="world"&&typeof window.openCoaches==="function")window.openCoaches();
    });
    bind("vR2",()=>setSprint(true),()=>setSprint(false));
    bind("vL2",()=>{if(typeof window.showMessage==="function")window.showMessage("L2 PROTECT / AIM")});
    bind("vL1",()=>{if(typeof window.showMessage==="function")window.showMessage("L1 SWITCH CAMERA")});
    bind("vR1",()=>{if(typeof window.showMessage==="function")window.showMessage("R1 SKILL / MODIFIER")});
    bind("vOptions",()=>{if(typeof window.togglePause==="function"&&activeScreen()==="game")window.togglePause();else if(activeScreen()==="world"&&typeof window.backToMenu==="function")window.backToMenu()});
  }

  function setSprint(on){
    if(typeof window.setSprint==="function")window.setSprint(!!on);
    else if(window.state)window.state.sprinting=!!on;
  }

  function bindRightStick(){
    const area=$("vps5Right");if(!area)return;
    area.addEventListener("pointerdown",e=>{rightPointer=e.pointerId;rightX=e.clientX;rightY=e.clientY;area.setPointerCapture(e.pointerId)},{passive:false});
    area.addEventListener("pointermove",e=>{if(rightPointer!==e.pointerId)return;const dx=e.clientX-rightX,dy=e.clientY-rightY;rightX=e.clientX;rightY=e.clientY;if(Math.abs(dx)+Math.abs(dy)<2)return;window.vps5Camera={x:(window.vps5Camera?.x||0)+dx,y:(window.vps5Camera?.y||0)+dy};if(typeof window.onVirtualCameraMove==="function")window.onVirtualCameraMove(dx,dy)},{passive:false});
    const end=e=>{if(rightPointer===e.pointerId)rightPointer=null};area.addEventListener("pointerup",end);area.addEventListener("pointercancel",end);
  }

  function init(){build();setInterval(show,120);show();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
