/* OBITREND FOOTBALL WORLD 27 — UNIFIED PS5 CONTROLLER + GAMEPLAY */
(function(){
  "use strict";
  if(window.__obitrendUnifiedPS5) return;
  window.__obitrendUnifiedPS5=true;

  const $=id=>document.getElementById(id);
  const stateRef=()=>{try{if(window.state)return window.state;if(typeof state!=="undefined")return state;}catch(e){}return null;};
  const screen=()=>{
    const r=$("replayScreen"),g=$("game"),w=$("world");
    if(r&&getComputedStyle(r).display!=="none")return "replay";
    if(g&&getComputedStyle(g).display!=="none")return "game";
    if(w&&getComputedStyle(w).display!=="none")return "world";
    return "none";
  };

  let leftId=null,rightId=null,prev=[],padIndex=null,lastCam=0,lastDpad=0,lastProtect=false;
  let selectedIndex=0,ballAnim=null;

  function call(n,...args){return typeof window[n]==="function"?window[n](...args):null;}

  function installStyle(){
    if($("virtualPS5Style"))return;
    const s=document.createElement("style");s.id="virtualPS5Style";
    s.textContent=`
#virtualPS5{position:fixed;inset:0;z-index:120;pointer-events:none;display:none;font-family:Arial,sans-serif}
#virtualPS5.show{display:block}
#vps5Left{position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:126px;height:126px;border-radius:50%;background:rgba(10,12,18,.48);border:2px solid rgba(255,255,255,.24);box-shadow:inset 0 0 25px rgba(255,255,255,.06);pointer-events:auto;touch-action:none}
#vps5Stick{position:absolute;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.45);box-shadow:0 5px 18px rgba(0,0,0,.35);pointer-events:none}
#vps5Right{position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));width:178px;height:178px;pointer-events:auto;touch-action:none}
.vps5btn{position:absolute;width:58px;height:58px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(10,12,18,.68);color:#fff;font-weight:1000;font-size:11px;pointer-events:auto;touch-action:none;box-shadow:0 6px 18px rgba(0,0,0,.3)}
.vps5btn:active,.vps5btn.held{transform:scale(.9);filter:brightness(1.35)}
#vCross{right:8px;top:60px}#vCircle{right:62px;top:108px;background:rgba(227,38,46,.72)}#vTriangle{right:62px;top:8px}#vSquare{right:116px;top:60px}
#vps5Shoulders{position:absolute;right:max(12px,env(safe-area-inset-right));bottom:205px;display:flex;gap:7px;pointer-events:none}
.vps5shoulder{width:72px;height:36px;border-radius:12px;background:rgba(10,12,18,.65);border:1px solid rgba(255,255,255,.22);color:#fff;font-size:8px;font-weight:1000;pointer-events:auto;touch-action:none}
#vOptions{position:absolute;right:max(18px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top));width:64px;height:34px;border-radius:10px;background:rgba(10,12,18,.65);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:8px;font-weight:1000;pointer-events:auto;touch-action:none}
#vps5Hint{position:absolute;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);padding:6px 10px;border-radius:10px;background:rgba(0,0,0,.38);font-size:7px;letter-spacing:1px;opacity:.6;pointer-events:none;white-space:nowrap}
#vps5WorldPlayer{position:absolute;width:26px;height:38px;transform:translate(-50%,-50%);z-index:3;pointer-events:none;display:none}
#vps5WorldPlayer:before{content:"";position:absolute;left:7px;top:0;width:12px;height:12px;border-radius:50%;background:#b77a50}
#vps5WorldPlayer:after{content:"";position:absolute;left:3px;top:12px;width:20px;height:24px;border-radius:6px;background:#e3262e;box-shadow:0 0 0 2px rgba(255,255,255,.25)}
#vps5Selected{position:absolute;width:40px;height:50px;border:2px solid rgba(255,230,80,.95);border-radius:50%;transform:translate(-50%,-50%);z-index:4;pointer-events:none;display:none;box-shadow:0 0 14px rgba(255,230,80,.55)}
@media(max-width:600px){#vps5Left{width:112px;height:112px}.vps5btn{width:54px;height:54px}#vps5Right{width:170px;height:170px}.vps5shoulder{width:66px}}
@media(max-height:430px){#vps5Left{width:94px;height:94px}#vps5Stick{width:42px;height:42px}#vps5Right{transform:scale(.82);transform-origin:bottom right}#vps5Shoulders{bottom:150px}}
`;
    document.head.appendChild(s);
  }

  function build(){
    installStyle();
    if($("virtualPS5"))return;
    const root=document.createElement("div");root.id="virtualPS5";
    root.innerHTML=`<div id="vps5WorldPlayer"></div><div id="vps5Selected"></div>
      <div id="vps5Left"><div id="vps5Stick"></div></div>
      <div id="vps5Right"><button id="vTriangle" class="vps5btn">△</button><button id="vCircle" class="vps5btn">○</button><button id="vCross" class="vps5btn">✕</button><button id="vSquare" class="vps5btn">□</button></div>
      <div id="vps5Shoulders"><button id="vL2" class="vps5shoulder">L2</button><button id="vL1" class="vps5shoulder">L1</button><button id="vR1" class="vps5shoulder">R1</button><button id="vR2" class="vps5shoulder">R2 SPRINT</button></div>
      <button id="vOptions">OPTIONS</button><div id="vps5Hint">PS5 CONTROLS</div>`;
    document.body.appendChild(root);
    bindLeft();bindButtons();bindRight();
  }

  function refresh(){
    const root=$("virtualPS5"),sc=screen();if(!root)return;
    root.classList.toggle("show",sc==="game"||sc==="world");
    const p=$("vps5WorldPlayer");
    if(p){p.style.display=sc==="world"?"block":"none";if(sc==="world"&&!p.dataset.x){p.dataset.x=50;p.dataset.y=70;p.style.left="50%";p.style.top="70%";}}
    updateSelectedIndicator();
  }

  function move(dx,dy){
    const s=stateRef(),sc=screen();
    if(sc==="game"){
      if(!s||s.paused)return;
      const k=s.sprinting?1.15:.55;
      s.x=Math.max(4,Math.min(96,Number(s.x||50)+dx*k));
      s.y=Math.max(4,Math.min(96,Number(s.y||50)+dy*k));
      s.moving=Math.hypot(dx,dy)>.02;
      s.lastMoveX=dx;s.lastMoveY=dy;
      if(typeof window.updatePlayer==="function")window.updatePlayer();
      updateSelectedIndicator();
    }else if(sc==="world"){
      const p=$("vps5WorldPlayer");if(!p)return;
      let x=Number(p.dataset.x||50),y=Number(p.dataset.y||70);
      x=Math.max(4,Math.min(96,x+dx*1.3));y=Math.max(18,Math.min(82,y+dy*1.3));
      p.dataset.x=x;p.dataset.y=y;p.style.left=x+"%";p.style.top=y+"%";
    }
  }

  function bindLeft(){
    const base=$("vps5Left"),stick=$("vps5Stick");if(!base)return;
    const update=e=>{
      const r=base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,max=r.width*.32;
      let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y);
      if(d>max){x=x/d*max;y=y/d*max}
      stick.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
      move(x/max,y/max);
    };
    base.addEventListener("pointerdown",e=>{e.preventDefault();leftId=e.pointerId;base.setPointerCapture(e.pointerId);update(e)},{passive:false});
    base.addEventListener("pointermove",e=>{if(leftId===e.pointerId)update(e)},{passive:false});
    const end=e=>{if(leftId!==e.pointerId)return;leftId=null;stick.style.transform="translate(-50%,-50%)";const s=stateRef();if(s)s.moving=false};
    base.addEventListener("pointerup",end);base.addEventListener("pointercancel",end);
  }

  function bind(id,down,up){
    const el=$(id);if(!el)return;
    const press=e=>{e.preventDefault();el.classList.add("held");if(down)down()};
    const release=e=>{e.preventDefault();el.classList.remove("held");if(up)up()};
    el.addEventListener("pointerdown",press,{passive:false});el.addEventListener("pointerup",release);el.addEventListener("pointercancel",release);el.addEventListener("pointerleave",release);
  }

  function gameBox(){return $("game")||document.body;}
  function percentFromElement(el){const g=gameBox(),r=g.getBoundingClientRect(),q=el.getBoundingClientRect();return{x:((q.left+q.width/2-r.left)/r.width)*100,y:((q.top+q.height/2-r.top)/r.height)*100};}
  function selectedPlayers(){return Array.from(document.querySelectorAll("#game .player")).filter(el=>getComputedStyle(el).display!=="none");}
  function updateSelectedIndicator(){
    if(screen()!=="game")return;
    const s=stateRef(),el=$("vps5Selected");if(!s||!el)return;
    const players=selectedPlayers();
    if(players.length){const target=players[Math.max(0,Math.min(selectedIndex,players.length-1))];const p=percentFromElement(target);el.style.left=p.x+"%";el.style.top=p.y+"%";el.style.display="block";}
    else{el.style.left=Number(s.x||50)+"%";el.style.top=Number(s.y||50)+"%";el.style.display="block";}
  }

  function ballPosition(s){return{x:Number(s.ballX??s.x??50),y:Number(s.ballY??s.y??50)};}
  function setBall(x,y){const s=stateRef();if(!s)return;s.ballX=Math.max(0,Math.min(100,x));s.ballY=Math.max(0,Math.min(100,y));if(typeof window.updateBall==="function")window.updateBall();}
  function animateBall(tx,ty,duration){
    const s=stateRef();if(!s)return;
    if(ballAnim)cancelAnimationFrame(ballAnim);
    const start=ballPosition(s),t0=performance.now();
    const frame=now=>{const p=Math.min(1,(now-t0)/duration),e=1-Math.pow(1-p,3);setBall(start.x+(tx-start.x)*e,start.y+(ty-start.y)*e);if(p<1)ballAnim=requestAnimationFrame(frame);else ballAnim=null;};
    ballAnim=requestAnimationFrame(frame);
  }

  function direction(){
    const s=stateRef();if(!s)return{x:1,y:0};
    let x=Number(s.lastMoveX||0),y=Number(s.lastMoveY||0);
    if(Math.hypot(x,y)<.08){x=Number(s.x||50)-Number(s.prevX??s.x??50);y=Number(s.y||50)-Number(s.prevY??s.y??50)}
    const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};
  }

  function through(){
    const s=stateRef();if(!s||s.paused||screen()!=="game")return;
    const b=ballPosition(s),d=direction();
    const tx=Math.max(2,Math.min(98,b.x+d.x*24)),ty=Math.max(2,Math.min(98,b.y+d.y*24));
    animateBall(tx,ty,420);
    call("commentary","A through ball is played into space.");
    if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("THROUGH_BALL");
    if(typeof window.showMessage==="function")window.showMessage("△ THROUGH BALL • INTO SPACE");
  }

  function tackle(){
    const s=stateRef();if(!s||s.paused||screen()!=="game")return;
    const b=ballPosition(s),px=Number(s.x||50),py=Number(s.y||50),dist=Math.hypot(b.x-px,b.y-py);
    if(dist<=18){
      setBall(px,py);s.ballControlled=true;s.possession="home";
      call("commentary","Successful tackle — possession won.");
      if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("TACKLE_SUCCESS");
      if(typeof window.showMessage==="function")window.showMessage("□ TACKLE • BALL WON");
    }else{
      const d={x:(b.x-px)/(dist||1),y:(b.y-py)/(dist||1)};
      s.x=Math.max(4,Math.min(96,px+d.x*2.5));s.y=Math.max(4,Math.min(96,py+d.y*2.5));
      if(typeof window.updatePlayer==="function")window.updatePlayer();
      call("commentary","Defensive pressure applied.");
      if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("TACKLE_PRESS");
      if(typeof window.showMessage==="function")window.showMessage("□ TACKLE • PRESS");
    }
  }

  function switchPlayer(){
    if(screen()!=="game")return;
    const s=stateRef(),players=selectedPlayers();
    if(players.length>1){
      selectedIndex=(selectedIndex+1)%players.length;
      const p=percentFromElement(players[selectedIndex]);
      if(s){s.x=p.x;s.y=p.y;s.selectedPlayerIndex=selectedIndex;s.ballControlled=false;}
      if(typeof window.updatePlayer==="function")window.updatePlayer();
      updateSelectedIndicator();
    }else if(s){s.selectedPlayerIndex=0;updateSelectedIndicator();}
    if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("PLAYER_SWITCH");
    if(typeof window.showMessage==="function")window.showMessage("L1 PLAYER SWITCH");
  }

  function skill(){
    const s=stateRef();if(!s||s.paused||screen()!=="game")return;
    const d=direction(),oldX=Number(s.x||50),oldY=Number(s.y||50);
    s.x=Math.max(4,Math.min(96,oldX+d.x*3.5));s.y=Math.max(4,Math.min(96,oldY+d.y*3.5));s.lastSkillAt=Date.now();
    if(typeof window.updatePlayer==="function")window.updatePlayer();
    call("commentary","A quick skill move beats the pressure.");
    if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("SKILL");
    if(typeof window.showMessage==="function")window.showMessage("R1 SKILL MOVE");
  }

  function protect(on){
    const s=stateRef();if(screen()!=="game")return;
    if(s)s.protecting=!!on;
    if(on!==lastProtect&&typeof window.showMessage==="function")window.showMessage(on?"L2 PROTECT / AIM":"L2 RELEASE");
    lastProtect=on;
  }

  function sprint(on){if(typeof window.setSprint==="function")window.setSprint(!!on);else{const s=stateRef();if(s)s.sprinting=!!on;}}
  function options(){if(screen()==="game")call("togglePause");else if(screen()==="world")call("backToMenu");}

  function bindButtons(){
    bind("vCross",()=>{if(screen()==="game")call("passBall");else if(screen()==="world")call("openMatch")});
    bind("vCircle",()=>{if(screen()==="game")call("shootBall");else if(screen()==="world")call("openTraining")});
    bind("vTriangle",()=>{if(screen()==="game")through();else if(screen()==="world")call("openLifestyle")});
    bind("vSquare",()=>{if(screen()==="game")tackle();else if(screen()==="world")call("openCoaches")});
    bind("vR2",()=>sprint(true),()=>sprint(false));
    bind("vL2",()=>protect(true),()=>protect(false));
    bind("vL1",switchPlayer);bind("vR1",skill);bind("vOptions",options);
  }

  function bindRight(){
    const area=$("vps5Right");if(!area)return;
    const pos=e=>{if(rightId===null)return;const r=area.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width*.45))),y=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height*.45)));window.vps5Camera={x,y};if(typeof window.onVirtualCameraMove==="function")window.onVirtualCameraMove(x,y);else if(screen()==="game"&&Date.now()-lastCam>900){lastCam=Date.now();if(typeof window.showMessage==="function")window.showMessage("RIGHT STICK • CAMERA")}};
    area.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;e.preventDefault();rightId=e.pointerId;area.setPointerCapture(e.pointerId);pos(e)},{passive:false});
    area.addEventListener("pointermove",pos,{passive:false});
    const end=e=>{if(rightId===e.pointerId){rightId=null;window.vps5Camera={x:0,y:0}}};
    area.addEventListener("pointerup",end);area.addEventListener("pointercancel",end);
  }

  function pads(){try{return navigator.getGamepads?navigator.getGamepads():[]}catch(e){return[]}}
  function getPad(){const p=pads();if(padIndex!==null&&p[padIndex])return p[padIndex];const n=p.find(Boolean)||null;padIndex=n?n.index:null;return n}
  function pressed(p,i){const b=p&&p.buttons&&p.buttons[i];return !!(b&&(b.pressed||Number(b.value||0)>.55))}
  function edge(p,i){return pressed(p,i)&&!prev[i]}
  function physicalCamera(p){const x=Number(p.axes?.[2]||0),y=Number(p.axes?.[3]||0);if(Math.hypot(x,y)>.22&&screen()==="game"){window.vps5Camera={x,y};if(typeof window.onVirtualCameraMove==="function")window.onVirtualCameraMove(x,y);else if(Date.now()-lastCam>900){lastCam=Date.now();if(typeof window.showMessage==="function")window.showMessage("RIGHT STICK • CAMERA")}}}
  function dpad(p){let d=pressed(p,12)?12:pressed(p,13)?13:pressed(p,14)?14:pressed(p,15)?15:0;if(d&&d!==lastDpad){if(typeof window.recordReplayEvent==="function")window.recordReplayEvent("TACTIC_DPAD_"+d);if(typeof window.showMessage==="function")window.showMessage("D-PAD • "+({12:"TACTIC UP",13:"TACTIC DOWN",14:"TACTIC LEFT",15:"TACTIC RIGHT"}[d]));}lastDpad=d;}

  function physicalLoop(){
    const p=getPad(),s=stateRef();
    if(p){
      if(s)s.gamepad=p;
      if(screen()==="game"&&!s?.paused){
        if(edge(p,2))tackle();if(edge(p,3))through();if(edge(p,4))switchPlayer();if(edge(p,5))skill();protect(pressed(p,6));
      }
      dpad(p);physicalCamera(p);
      if(s&&s.x!=null){s.prevX=s.x;s.prevY=s.y;}
      prev=(p.buttons||[]).map(b=>!!(b&&(b.pressed||Number(b.value||0)>.55)));
    }else{
      padIndex=null;prev=[];lastDpad=0;
      if(s&&s.gamepad){s.gamepad=null;s.sprinting=false;s.moving=false;}
    }
    requestAnimationFrame(physicalLoop);
  }

  window.addEventListener("gamepadconnected",e=>{
    padIndex=e.gamepad?.index??null;
    const s=stateRef();if(s)s.gamepad=e.gamepad;
    const st=$("controllerStatus");if(st)st.textContent="Connected: "+e.gamepad.id;
    if(typeof window.setControlMode==="function"&&screen()==="game"){
      window.setControlMode("gamepad");
      if(typeof window.closeController==="function")window.closeController();
      if(typeof window.showMessage==="function")window.showMessage("🎮 DUALSENSE CONNECTED");
    }
  });

  window.addEventListener("gamepaddisconnected",e=>{
    if(padIndex===e.gamepad?.index)padIndex=null;
    const s=stateRef();
    if(s&&s.gamepad&&s.gamepad.index===e.gamepad.index){s.gamepad=null;s.sprinting=false;s.moving=false;}
    const st=$("controllerStatus");if(st)st.textContent="Controller disconnected.";
    if(s&&s.controlMode==="gamepad"&&typeof window.setControlMode==="function"){
      window.setControlMode("touch");
      if(screen()==="game"&&typeof window.showMessage==="function")window.showMessage("📱 TOUCH MODE");
    }
  });

  function init(){build();refresh();setInterval(refresh,120);requestAnimationFrame(physicalLoop);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();