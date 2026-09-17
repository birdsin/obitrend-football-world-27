/* OBITREND FOOTBALL WORLD 27 — FIFA-STYLE MATCH ENGINE + PS5 CONTROLS */
(function(){
'use strict';
if(window.__obitrendUnifiedPS5)return;
window.__obitrendUnifiedPS5=true;

const $=id=>document.getElementById(id);
const call=(n,...a)=>typeof window[n]==='function'?window[n](...a):null;
const S=()=>{try{return window.state||(typeof state!=='undefined'?state:null)}catch(e){return null}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const screen=()=>{const r=$('replayScreen'),g=$('game'),w=$('world');if(r&&getComputedStyle(r).display!=='none')return'replay';if(g&&getComputedStyle(g).display!=='none')return'game';if(w&&getComputedStyle(w).display!=='none')return'world';return'none'};

let leftId=null,rightId=null,pad=null,prevButtons=[];
let selected=0,worldGuy=null,lastScreen='none',started=false,matchStart=0,lastFrame=0;
let paused=false,fullTime=false,half=1,ballMode='home',lastAction=0,skillUntil=0;
let ball={x:50,y:50,vx:0,vy:0,targetX:50,targetY:50,air:0,spin:0};
let players=[],home=[],away=[];

const HOME_FORM=[
 ['GK',8,50],['LB',23,18],['CB',25,42],['CB',25,58],['RB',23,82],
 ['CM',43,35],['CM',43,65],['LW',60,17],['CAM',57,50],['RW',60,83],['ST',76,50]
];
const AWAY_FORM=[
 ['GK',92,50],['LB',77,82],['CB',75,58],['CB',75,42],['RB',77,18],
 ['CM',57,65],['CM',57,35],['LW',40,83],['CAM',43,50],['RW',40,17],['ST',24,50]
];

function style(){
 if($('obiFifaStyle'))return;
 const s=document.createElement('style');s.id='obiFifaStyle';
 s.textContent=`
 #virtualPS5{position:fixed;inset:0;z-index:120;pointer-events:none;display:none;font-family:Arial,sans-serif}
 #virtualPS5.show{display:block}
 #vL{position:absolute;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:120px;height:120px;border-radius:50%;background:#07100dcc;border:2px solid #ffffff38;box-shadow:inset 0 0 25px #0008;pointer-events:auto;touch-action:none}
 #vS{position:absolute;left:50%;top:50%;width:52px;height:52px;transform:translate(-50%,-50%);border-radius:50%;background:#ffffff55;border:1px solid #fff8;pointer-events:none}
 #vR{position:absolute;right:12px;bottom:14px;width:185px;height:185px;pointer-events:auto;touch-action:none}
 .vb{position:absolute;width:58px;height:58px;border-radius:50%;background:#07100ddd;color:#fff;border:1px solid #ffffff45;font-size:13px;font-weight:1000;pointer-events:auto;touch-action:none;box-shadow:0 5px 14px #0008}
 .vb:active,.vb.h{transform:scale(.91)}
 #vX{right:5px;top:63px}#vO{right:63px;top:119px;background:#d71920e8}#vT{right:63px;top:7px}#vQ{right:121px;top:63px}
 #vShoulders{position:absolute;right:12px;bottom:208px;display:flex;gap:6px;pointer-events:none}.vs{width:70px;height:35px;border-radius:10px;background:#07100ddd;color:#fff;border:1px solid #ffffff38;font-size:8px;font-weight:1000;pointer-events:auto;touch-action:none}
 #vOpt{position:absolute;right:16px;top:14px;width:68px;height:35px;border-radius:10px;background:#07100ddd;color:#fff;font-size:8px;font-weight:1000;pointer-events:auto;touch-action:none}
 #vSel{position:absolute;width:45px;height:54px;border:2px solid #ffe52d;border-radius:50%;transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:50;box-shadow:0 0 0 2px #0005}
 .obiFifaPlayer{position:absolute;width:30px;height:47px;transform:translate(-50%,-50%);z-index:8;pointer-events:none;will-change:left,top,transform}
 .obiFifaPlayer .head{width:12px;height:12px;margin:auto;border-radius:50%;background:#9a633f;box-shadow:0 2px 4px #0008}.obiFifaPlayer .kit{width:22px;height:27px;margin:1px auto 0;border-radius:6px 6px 4px 4px;box-shadow:0 3px 5px #0008}.obiFifaPlayer .legs{width:15px;height:7px;margin:0 auto;border-radius:2px;background:#111}.obiFifaPlayer.home .kit{background:linear-gradient(#ed3038,#b90e17)}.obiFifaPlayer.away .kit{background:linear-gradient(#2563eb,#123a9e)}.obiFifaPlayer.gk .kit{background:linear-gradient(#f3c51f,#b88600)}
 .obiFifaPlayer.controlled .kit{box-shadow:0 0 0 2px #ffe52d,0 5px 10px #0009}.obiFifaPlayer.sprint .kit{filter:brightness(1.12)}
 .obiFifaPlayer .name{position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:6px;font-weight:1000;white-space:nowrap;text-shadow:0 1px 3px #000;opacity:.8}
 #obiFifaBall{position:absolute;width:13px;height:13px;border-radius:50%;background:#fff;z-index:35;transform:translate(-50%,-50%);box-shadow:0 2px 6px #000a,0 0 0 1px #0005;will-change:left,top}
 #obiFifaBall:after{content:'';position:absolute;inset:3px;border-radius:50%;background:#222;opacity:.28}
 #obiFifaHUD{position:absolute;left:50%;top:max(7px,env(safe-area-inset-top));transform:translateX(-50%);z-index:70;min-width:245px;padding:8px 14px;border-radius:13px;background:#05070bdd;border:1px solid #ffffff22;text-align:center;pointer-events:none;box-shadow:0 8px 25px #0008}
 #obiFifaHUD .teams{font-size:9px;font-weight:1000;letter-spacing:1px}.obiFifaScore{font-size:19px;margin:2px 0}.obiFifaClock{font-size:8px;opacity:.62}
 #obiFifaStats{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:65;padding:6px 10px;border-radius:9px;background:#05070baa;font-size:7px;opacity:.78;pointer-events:none;white-space:nowrap}
 #obiFifaHalf,#obiFifaResult{position:absolute;inset:0;z-index:220;display:none;align-items:center;justify-content:center;background:#000c;backdrop-filter:blur(7px);pointer-events:auto}
 #obiFifaHalf.show,#obiFifaResult.show{display:flex}.obiFifaCard{width:min(390px,90%);padding:25px;border-radius:20px;background:#0b1018;border:1px solid #ffffff30;text-align:center;box-shadow:0 20px 70px #000a}.obiFifaCard small{font-size:9px;letter-spacing:3px;opacity:.6}.obiFifaCard strong{display:block;font-size:30px;margin:9px}.obiFifaCard button{width:100%;padding:13px;margin-top:8px;border-radius:10px;background:#e3262e;color:#fff;font-weight:1000}.obiFifaCard button.secondary{background:#ffffff12}
 `;
 document.head.appendChild(s);
}

function controller(){
 style();if($('virtualPS5'))return;
 const r=document.createElement('div');r.id='virtualPS5';
 r.innerHTML='<div id="vSel"></div><div id="vL"><div id="vS"></div></div><div id="vR"><button id="vT" class="vb">△</button><button id="vO" class="vb">○</button><button id="vX" class="vb">✕</button><button id="vQ" class="vb">□</button></div><div id="vShoulders"><button id="vL2" class="vs">L2 PROTECT</button><button id="vL1" class="vs">L1 SWITCH</button><button id="vR1" class="vs">R1 SKILL</button><button id="vR2" class="vs">R2 SPRINT</button></div><button id="vOpt">OPTIONS</button>';
 document.body.appendChild(r);bindLeft();bindRight();bindButtons();
}

function bindLeft(){
 const b=$('vL'),st=$('vS');
 const update=e=>{const q=b.getBoundingClientRect(),cx=q.left+q.width/2,cy=q.top+q.height/2,m=q.width*.32;let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y)||1;if(d>m){x=x/d*m;y=y/d*m}st.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;move(x/m,y/m)};
 b.addEventListener('pointerdown',e=>{e.preventDefault();leftId=e.pointerId;b.setPointerCapture(e.pointerId);update(e)},{passive:false});
 b.addEventListener('pointermove',e=>{if(e.pointerId===leftId)update(e)},{passive:false});
 ['pointerup','pointercancel'].forEach(t=>b.addEventListener(t,e=>{if(e.pointerId===leftId){leftId=null;st.style.transform='translate(-50%,-50%)';const s=S();if(s)s.moving=false}}));
}
function bindRight(){
 const a=$('vR');
 const update=e=>{if(rightId===null)return;const q=a.getBoundingClientRect();window.vps5Camera={x:clamp((e.clientX-q.left-q.width/2)/(q.width*.45),-1,1),y:clamp((e.clientY-q.top-q.height/2)/(q.height*.45),-1,1)};if(typeof window.onVirtualCameraMove==='function')window.onVirtualCameraMove(window.vps5Camera.x,window.vps5Camera.y)};
 a.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;e.preventDefault();rightId=e.pointerId;a.setPointerCapture(e.pointerId);update(e)},{passive:false});a.addEventListener('pointermove',update,{passive:false});['pointerup','pointercancel'].forEach(t=>a.addEventListener(t,e=>{if(e.pointerId===rightId){rightId=null;window.vps5Camera={x:0,y:0}}}));
}
function bind(id,down,up){const e=$(id);if(!e)return;e.addEventListener('pointerdown',x=>{x.preventDefault();e.classList.add('h');down&&down()},{passive:false});['pointerup','pointercancel'].forEach(t=>e.addEventListener(t,x=>{x.preventDefault();e.classList.remove('h');up&&up()}));}
function bindButtons(){
 bind('vX',()=>screen()==='game'?passBall():screen()==='world'&&call('openMatch'));
 bind('vO',()=>screen()==='game'?shootBall():screen()==='world'&&call('openTraining'));
 bind('vT',()=>screen()==='game'?throughBall():screen()==='world'&&call('openLifestyle'));
 bind('vQ',()=>screen()==='game'?tackle():screen()==='world'&&call('openCoaches'));
 bind('vR2',()=>setSprint(true),()=>setSprint(false));bind('vL2',()=>protect(true),()=>protect(false));bind('vL1',switchPlayer);bind('vR1',skill);bind('vOpt',options);
}

function move(dx,dy){
 const s=S();if(!s)return;
 if(screen()==='world'&&worldGuy){let x=clamp((+worldGuy.dataset.x||50)+dx*1.2,4,96),y=clamp((+worldGuy.dataset.y||70)+dy*1.2,18,82);worldGuy.dataset.x=x;worldGuy.dataset.y=y;worldGuy.style.left=x+'%';worldGuy.style.top=y+'%';return}
 if(screen()!=='game'||paused||fullTime)return;
 const sprint=!!s.sprinting||performance.now()<skillUntil;
 const speed=sprint?.105:.058;
 s.prevX=s.x;s.prevY=s.y;s.x=clamp((+s.x||50)+dx*speed*1.8,5,95);s.y=clamp((+s.y||50)+dy*speed*1.8,5,95);s.lastMoveX=dx;s.lastMoveY=dy;s.moving=Math.hypot(dx,dy)>.05;s.speed=sprint?.105:.058;
 const p=home[selected];if(p){p.x=s.x;p.y=s.y;p.dirX=dx;p.dirY=dy;p.moving=s.moving;p.sprinting=sprint;}
}

function worldMove(){
 const w=$('world');if(!w)return;if(!worldGuy){worldGuy=document.createElement('div');worldGuy.style.cssText='position:absolute;width:25px;height:38px;transform:translate(-50%,-50%);z-index:3;pointer-events:none';worldGuy.innerHTML='<div style="width:12px;height:12px;margin:auto;border-radius:50%;background:#b77a50"></div><div style="width:20px;height:24px;margin:auto;border-radius:6px;background:#e3262e"></div>';w.appendChild(worldGuy)}worldGuy.style.left=(worldGuy.dataset.x||50)+'%';worldGuy.style.top=(worldGuy.dataset.y||70)+'%';
}

function pitch(){return $('pitch')||$('game')}
function createPlayer(team,role,x,y,i){
 const p=document.createElement('div');p.className='obiFifaPlayer '+team+(role==='GK'?' gk':'');p.innerHTML='<div class="head"></div><div class="kit"></div><div class="legs"></div><div class="name"></div>';pitch().appendChild(p);
 const o={el:p,team,role,x,y,hx:x,hy:y,dirX:team==='home'?1:-1,dirY:0,moving:false,sprinting:false,stamina:100,number:i+1};p.querySelector('.name').textContent=team==='home'?'FC '+(i+1):'XI '+(i+1);return o;
}
function setupTeams(){
 const g=pitch();if(!g)return;g.querySelectorAll('.obiFifaPlayer,#obiFifaBall,#obiFifaHUD,#obiFifaStats,#obiFifaHalf,#obiFifaResult').forEach(e=>e.remove());players=[];home=[];away=[];
 HOME_FORM.forEach((f,i)=>{const p=createPlayer('home',f[0],f[1],f[2],i);home.push(p);players.push(p)});
 AWAY_FORM.forEach((f,i)=>{const p=createPlayer('away',f[0],f[1],f[2],i);away.push(p);players.push(p)});
 const b=document.createElement('div');b.id='obiFifaBall';g.appendChild(b);ball.el=b;
 selected=10;home[selected].el.classList.add('controlled');
}

function resetMatch(){
 const s=S();if(!s)return;setupTeams();fullTime=false;paused=false;half=1;started=true;matchStart=performance.now();lastFrame=matchStart;lastAction=0;
 s.scoreHome=0;s.scoreAway=0;s.minute=1;s.x=home[selected].x;s.y=home[selected].y;s.prevX=s.x;s.prevY=s.y;s.ballX=50;s.ballY=50;s.paused=false;s.sprinting=false;s.moving=false;s.protecting=false;s.possession='home';ball={x:50,y:50,vx:0,vy:0,targetX:50,targetY:50,air:0,spin:0};
 $('scoreHome')&&($('scoreHome').textContent='0');$('scoreAway')&&($('scoreAway').textContent='0');$('matchMinute')&&($('matchMinute').textContent='1');
 buildHUD();updateRender();call('startReplayRecording');call('showMessage','KICK OFF');call('commentary','And we are underway.');call('recordReplayEvent','KICKOFF');
}
function buildHUD(){
 const g=pitch();if(!g)return;if($('obiFifaHUD'))$('obiFifaHUD').remove();if($('obiFifaStats'))$('obiFifaStats').remove();
 const h=document.createElement('div');h.id='obiFifaHUD';h.innerHTML='<div class="teams">OBITREND FC &nbsp; vs &nbsp; WORLD XI</div><div class="obiFifaScore"><span id="obiFifaHome">0</span> — <span id="obiFifaAway">0</span></div><div class="obiFifaClock" id="obiFifaClock">1ST HALF • 1:00</div>';g.appendChild(h);
 const st=document.createElement('div');st.id='obiFifaStats';st.textContent='PACE  •  STAMINA  •  POSSESSION';g.appendChild(st);
 const halfBox=document.createElement('div');halfBox.id='obiFifaHalf';halfBox.innerHTML='<div class="obiFifaCard"><small>MATCH BREAK</small><strong>HALF TIME</strong><div id="obiFifaHalfScore">0 — 0</div><button id="obiFifaSecond">START SECOND HALF</button></div>';g.appendChild(halfBox);$('obiFifaSecond').onclick=secondHalf;
 const res=document.createElement('div');res.id='obiFifaResult';res.innerHTML='<div class="obiFifaCard"><small>FULL TIME</small><strong id="obiFifaFinalScore">0 — 0</strong><div id="obiFifaFinalText">MATCH COMPLETE</div><button id="obiFifaRematch">REMATCH</button><button id="obiFifaReplay" class="secondary">WATCH REPLAY</button><button id="obiFifaWorld" class="secondary">RETURN TO WORLD</button></div>';g.appendChild(res);
 $('obiFifaRematch').onclick=()=>{res.classList.remove('show');resetMatch()};$('obiFifaReplay').onclick=()=>{res.classList.remove('show');call('openReplayList')};$('obiFifaWorld').onclick=()=>{res.classList.remove('show');call('backToWorld')};
}
function setBall(x,y){ball.x=clamp(x,1.5,98.5);ball.y=clamp(y,2,98);const s=S();if(s){s.ballX=ball.x;s.ballY=ball.y}updateBallDOM()}
function updateBallDOM(){if(!ball.el)return;ball.el.style.left=ball.x+'%';ball.el.style.top=ball.y+'%';ball.el.style.transform=`translate(-50%,-50%) scale(${1+Math.min(.5,ball.air*.02)}) rotate(${ball.spin}deg)`;const s=S();if(s){s.ballX=ball.x;s.ballY=ball.y}}
function updateRender(){
 const s=S();if(!s)return;const p=home[selected];if(p){p.x=clamp(+s.x||p.x,5,95);p.y=clamp(+s.y||p.y,5,95);p.el.style.left=p.x+'%';p.el.style.top=p.y+'%'}
 players.forEach(o=>{o.el.style.left=o.x+'%';o.el.style.top=o.y+'%';o.el.classList.toggle('controlled',o===home[selected]);o.el.classList.toggle('sprint',o.sprinting);const ang=Math.atan2(o.dirY||0,o.dirX||1)*180/Math.PI;o.el.style.transform=`translate(-50%,-50%) rotate(${ang*.035}deg)`});updateBallDOM();selectedMark();
 const hs=s.scoreHome||0,as=s.scoreAway||0;$('obiFifaHome')&&($('obiFifaHome').textContent=hs);$('obiFifaAway')&&($('obiFifaAway').textContent=as);$('obiFifaClock')&&($('obiFifaClock').textContent=(half===1?'1ST HALF':'2ND HALF')+' • '+clockText(s.minute||1));
 const stats=$('obiFifaStats');if(stats)stats.textContent='STAMINA '+Math.round(p?.stamina||100)+'%  •  POSSESSION '+(s.possession==='home'?'OBITREND FC':'WORLD XI');
}
function selectedMark(){const e=$('vSel'),g=$('game');if(!e||!g||screen()!=='game')return;const p=home[selected];if(!p)return;const r=g.getBoundingClientRect(),q=p.el.getBoundingClientRect();e.style.left=((q.left+q.width/2-r.left)/r.width*100)+'%';e.style.top=((q.top+q.height/2-r.top)/r.height*100)+'%';e.style.display='block'}
function clockText(m){m=clamp(Math.floor(m),1,90);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0')}
function direction(){const s=S();let x=+s?.lastMoveX||0,y=+s?.lastMoveY||0;if(Math.hypot(x,y)<.1){x=(+s?.x||50)-(+s?.prevX||50);y=(+s?.y||50)-(+s?.prevY||50)}const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d}}
function nearest(list,x,y){let best=null,dist=Infinity;for(const p of list){const d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;best=p}}return{p:best,d:dist}}
function nearestOpp(x,y){return nearest(away,x,y)}
function nearestMate(x,y){return nearest(home.filter((_,i)=>i!==selected),x,y)}
function givePossession(team){const s=S();if(!s)return;s.possession=team;ballMode=team}

function kickTo(tx,ty,power,curve){
 const d=Math.hypot(tx-ball.x,ty-ball.y)||1;ball.vx=(tx-ball.x)/d*power;ball.vy=(ty-ball.y)/d*power;ball.targetX=tx;ball.targetY=ty;ball.air=power>1.5?Math.min(10,power*2):1;ball.spin=curve||0;ballMode='free';givePossession('home');
}
function passBall(){
 const s=S();if(!s||screen()!=='game'||paused||fullTime||Date.now()<lastAction)return;lastAction=Date.now()+150;const p=home[selected],b=ball,d=direction();let target=null;let best=-Infinity;
 for(const m of home){if(m===p)continue;const vx=m.x-b.x,vy=m.y-b.y,len=Math.hypot(vx,vy)||1;const dot=(vx/len)*d.x+(vy/len)*d.y;const score=dot*3-len*.018;if(dot>.18&&score>best){best=score;target=m}}
 const tx=target?target.x:clamp(b.x+d.x*18,4,96),ty=target?target.y:clamp(b.y+d.y*12,4,96);kickTo(tx,ty,.95,8);s.possession='home';call('showMessage','✕ PASS');call('recordReplayEvent','PASS');
}
function throughBall(){
 const s=S();if(!s||screen()!=='game'||paused||fullTime||Date.now()<lastAction)return;lastAction=Date.now()+180;const d=direction(),b=ball,p=home[selected];let tx=clamp(p.x+d.x*28,5,95),ty=clamp(p.y+d.y*18,5,95);const mate=nearestMate(tx,ty);if(mate.p&&mate.d<14){tx=mate.p.x+d.x*12;ty=mate.p.y+d.y*7}kickTo(tx,ty,1.3,15);call('showMessage','△ THROUGH BALL');call('recordReplayEvent','THROUGH_BALL');
}
function shootBall(){
 const s=S();if(!s||screen()!=='game'||paused||fullTime||Date.now()<lastAction)return;lastAction=Date.now()+230;const p=home[selected],b=ball,d=direction();let goalX=97,goalY=clamp(b.y+d.y*8,38,62);if(p.x<55&&d.x<.15){goalX=97;goalY=clamp(p.y+d.y*14,35,65)}const dist=Math.hypot(goalX-b.x,goalY-b.y);const power=clamp(.95+dist*.018,.95,2.15);kickTo(goalX,goalY,power,20);ball.air=power*3;call('showMessage','○ SHOT');call('commentary','He hits it!');call('recordReplayEvent','SHOT');
}
function tackle(){
 const s=S();if(!s||screen()!=='game'||paused||fullTime)return;const p=home[selected],o=nearestOpp(p.x,p.y);if(o.p&&o.d<10){if(Math.random()<.72){setBall(p.x+p.dirX*2,p.y+p.dirY*2);givePossession('home');call('showMessage','□ TACKLE • BALL WON');call('recordReplayEvent','TACKLE_WON')}else{call('showMessage','□ FOUL / LATE CHALLENGE');call('recordReplayEvent','FOUL')}}else{call('showMessage','□ PRESS');call('recordReplayEvent','PRESS')}}
function switchPlayer(){const s=S();if(!s||screen()!=='game'||fullTime)return;let best=0,score=-Infinity;for(let i=0;i<home.length;i++){if(i===selected)continue;const p=home[i],d=Math.hypot(p.x-ball.x,p.y-ball.y);const v=(s.possession==='away'?1/(d+.5):i===10?0:1/(d+1));if(v>score){score=v;best=i}}selected=best;const p=home[selected];s.x=p.x;s.y=p.y;s.prevX=p.x;s.prevY=p.y;call('showMessage','L1 • '+(p.role||'PLAYER')+' SELECTED');call('recordReplayEvent','PLAYER_SWITCH');selectedMark()}
function skill(){const s=S();if(!s||screen()!=='game'||paused||fullTime)return;const p=home[selected],d=direction(),o=nearestOpp(p.x,p.y);if(o.p&&o.d<12){o.p.x=clamp(o.p.x-d.x*3,5,95);o.p.y=clamp(o.p.y-d.y*3,5,95)}skillUntil=performance.now()+260;s.x=clamp(+s.x+d.x*4,5,95);s.y=clamp(+s.y+d.y*4,5,95);p.x=s.x;p.y=s.y;p.dirX=d.x;p.dirY=d.y;call('updatePlayer');call('showMessage','R1 • SKILL MOVE');call('recordReplayEvent','SKILL')}
function protect(on){const s=S();if(s){s.protecting=!!on;if(on)call('showMessage','L2 • PROTECT / SHIELD')}}
function setSprint(on){const s=S();if(!s)return;s.sprinting=!!on;const p=home[selected];if(p)p.sprinting=!!on}
function options(){if(screen()==='game'){paused=!paused;const s=S();if(s)s.paused=paused;call('showMessage',paused?'PAUSED':'RESUME')}else if(screen()==='world')call('backToMenu')}

function freeBallPhysics(dt){
 const s=S();if(!s)return;
 if(ballMode==='home'){const p=home[selected];if(p){const d=direction(),lead=p.moving?2.2:1.15;ball.x=p.x+d.x*lead;ball.y=p.y+d.y*lead;ball.vx=0;ball.vy=0;ball.air=Math.max(0,ball.air-dt*7);ball.spin+=p.moving?dt*240:dt*80}}
 else if(ballMode==='away'){const o=away.find(a=>a.hasBall);if(o){const d={x:o.dirX||-1,y:o.dirY||0};ball.x=o.x+d.x*1.8;ball.y=o.y+d.y*1.8;ball.air=0}}
 else{ball.x+=ball.vx*dt*60;ball.y+=ball.vy*dt*60;const drag=Math.pow(.88,dt*60);ball.vx*=drag;ball.vy*=drag;ball.air=Math.max(0,ball.air-dt*8);ball.spin+=dt*500;if(ball.air<.2){const nH=nearest(home,ball.x,ball.y),nA=nearest(away,ball.x,ball.y);if(nH.d<3.8){ballMode='home';givePossession('home')}else if(nA.d<3.6){ballMode='away';away.forEach(x=>x.hasBall=false);if(nA.p)nA.p.hasBall=true;givePossession('away')}}}
 if(ball.x>98&&ball.y>35&&ball.y<65){goal('home');return}if(ball.x<2&&ball.y>35&&ball.y<65){goal('away');return}ball.x=clamp(ball.x,1.2,98.8);ball.y=clamp(ball.y,2,98)}

function aiTeams(dt){
 const s=S();if(!s)return;const b=ball;
 const h=home[selected];
 home.forEach((p,i)=>{if(i===selected)return;let tx=p.hx,ty=p.hy;if(s.possession==='away'&&Math.hypot(b.x-p.x,b.y-p.y)<26){tx=b.x;ty=b.y}else if(s.possession==='home'&&p.role!=='GK'){tx=clamp(p.hx+(b.x-50)*.28,6,94);ty=clamp(p.hy+(b.y-50)*.18,6,94)}moveAI(p,tx,ty,dt,.052)});
 away.forEach((p,i)=>{let tx=p.hx,ty=p.hy;if(ballMode==='home'||s.possession==='home'){const chase=i===nearest(away,b.x,b.y).p?.number-1||p.role==='GK'&&b.x>72; if(chase){tx=b.x;ty=b.y}else{tx=clamp(p.hx+(b.x-50)*.38,8,94);ty=clamp(p.hy+(b.y-50)*.22,6,94)}}else if(p.hasBall){tx=clamp(p.x-.35,8,94);ty=clamp(p.y+(50-p.y)*.035,8,92)}moveAI(p,tx,ty,dt,.046)});
 const closest=nearest(away,b.x,b.y);if(s.possession==='home'&&closest.p&&closest.d<5.5&&Math.random()<dt*.85&&!s.protecting&&!s.sprinting){ballMode='away';away.forEach(x=>x.hasBall=false);closest.p.hasBall=true;s.possession='away';call('showMessage','INTERCEPTED')}
 if(s.possession==='away'){const o=away.find(x=>x.hasBall)||closest.p;if(o){o.hasBall=true;const dGoal=Math.hypot(o.x-2, o.y-50);if(o.x<18&&Math.random()<dt*.65){const ty=clamp(50+(Math.random()-.5)*12,40,60);ballMode='free';ball.x=o.x;ball.y=o.y;ball.vx=-clamp(.9+dGoal*.01,1,1.8);ball.vy=(ty-o.y)*.025;call('showMessage','WORLD XI SHOT');call('recordReplayEvent','AI_SHOT')}}}
}
function moveAI(p,tx,ty,dt,speed){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1;const sprint=p.stamina>30&&d>8&&Math.random()<.15;const step=speed*(sprint?1.45:1)*dt*60;p.x=clamp(p.x+dx/d*step,4,96);p.y=clamp(p.y+dy/d*step,4,96);p.dirX=dx/d;p.dirY=dy/d;p.moving=d>.8;p.sprinting=sprint;p.stamina=clamp(p.stamina+(sprint?-7:3)*dt,0,100)}

function goal(team){
 const s=S();if(!s||fullTime)return;team==='home'?s.scoreHome++:s.scoreAway++;s.possession=team==='home'?'home':'away';$('scoreHome')&&($('scoreHome').textContent=s.scoreHome);$('scoreAway')&&($('scoreAway').textContent=s.scoreAway);call('showMessage','⚽ GOAL — '+(team==='home'?'OBITREND FC':'WORLD XI'));call('commentary',team==='home'?'GOAL! OBITREND FC finish it!':'Goal for World XI.');call('recordReplayEvent',team==='home'?'GOAL':'GOAL_AWAY');ballMode='free';setTimeout(()=>{if(!fullTime)kickoff()},900)}
function kickoff(){const s=S();if(!s)return;HOME_FORM.forEach((f,i)=>{home[i].x=f[1];home[i].y=f[2];home[i].stamina=clamp(home[i].stamina+8,0,100)});AWAY_FORM.forEach((f,i)=>{away[i].x=f[1];away[i].y=f[2];away[i].hasBall=false});s.x=home[selected].x;s.y=home[selected].y;s.prevX=s.x;s.prevY=s.y;setBall(50,50);ballMode='home';s.possession='home';call('updatePlayer');call('updateBall')}
function halfTime(){paused=true;const s=S();if(s)s.paused=true;if($('obiFifaHalfScore'))$('obiFifaHalfScore').textContent=(s?.scoreHome||0)+' — '+(s?.scoreAway||0);$('obiFifaHalf')?.classList.add('show');call('showMessage','HALF TIME');call('recordReplayEvent','HALFTIME')}
function secondHalf(){half=2;paused=false;const s=S();if(s)s.paused=false;matchStart=performance.now()-45000;lastFrame=performance.now();$('obiFifaHalf')?.classList.remove('show');kickoff();call('showMessage','SECOND HALF');call('recordReplayEvent','SECOND_HALF')}
function finish(){if(fullTime)return;fullTime=true;paused=true;const s=S();if(s)s.paused=true;const hs=s?.scoreHome||0,as=s?.scoreAway||0;$('obiFifaFinalScore')&&($('obiFifaFinalScore').textContent=hs+' — '+as);$('obiFifaFinalText')&&($('obiFifaFinalText').textContent=hs>as?'OBITREND FC WIN • FULL TIME':as>hs?'WORLD XI WIN • FULL TIME':'DRAW • FULL TIME');$('obiFifaResult')?.classList.add('show');call('stopReplayRecording',true);call('showMessage','FULL TIME');call('recordReplayEvent','FULL_TIME')}

function refresh(){const sc=screen(),r=$('virtualPS5');if(r)r.classList.toggle('show',sc==='game'||sc==='world');if(sc==='world')worldMove();if(sc==='game'&&lastScreen!=='game'){started=false;fullTime=false;setTimeout(()=>{if(screen()==='game'&&!started)resetMatch()},0)}lastScreen=sc}
function gameLoop(now){
 const s=S();if(screen()==='game'&&s&&!paused&&!fullTime){if(!started){started=true;matchStart=now}const elapsed=(now-matchStart)/1000;const minute=half===1?Math.floor(elapsed)+1:45+Math.floor(elapsed-45)+1;s.minute=clamp(minute,1,90);if(half===1&&elapsed>=45)halfTime();else if(elapsed>=90)finish();else{const dt=Math.min(.05,(now-(lastFrame||now))/1000);lastFrame=now;const p=home[selected];if(p){const sprint=!!s.sprinting||now<skillUntil;p.stamina=clamp(p.stamina+(sprint?-8:2)*dt,0,100);if(p.stamina<8)s.sprinting=false}s.prevX=s.x;s.prevY=s.y;freeBallPhysics(dt);aiTeams(dt);updateRender();call('updatePlayer');call('updateBall')}}lastFrame=now;requestAnimationFrame(gameLoop)}
function physical(){
 const pads=navigator.getGamepads?navigator.getGamepads():[];const p=pad!==null&&pads[pad]?pads[pad]:Array.from(pads).find(Boolean);const s=S();
 if(p){pad=p.index;if(s)s.gamepad=p;const ax=+p.axes?.[0]||0,ay=+p.axes?.[1]||0;if(Math.hypot(ax,ay)>.12)move(ax,ay);else if(s)s.moving=false;const pressed=i=>!!(p.buttons?.[i]?.pressed||(+p.buttons?.[i]?.value||0)>.55),edge=i=>pressed(i)&&!prevButtons[i];if(screen()==='game'&&!paused&&!fullTime){if(edge(0))passBall();if(edge(1))shootBall();if(edge(2))tackle();if(edge(3))throughBall();if(edge(4))switchPlayer();if(edge(5))skill();protect(pressed(6));setSprint(pressed(7));if(edge(9))options()}}else{pad=null;prevButtons=[]}prevButtons=(p?.buttons||[]).map(b=>!!(b.pressed||(+b.value||0)>.55));requestAnimationFrame(physical)}

window.resetMatch=resetMatch;window.passBall=passBall;window.shootBall=shootBall;window.setSprint=setSprint;window.throughBall=throughBall;window.through=throughBall;window.tackle=tackle;window.switchPlayer=switchPlayer;window.skill=skill;window.protect=protect;window.togglePause=options;
window.addEventListener('gamepadconnected',e=>{pad=e.gamepad.index;const s=S();if(s)s.gamepad=e.gamepad;const st=$('controllerStatus');if(st)st.textContent='Connected: '+e.gamepad.id;call('showMessage','🎮 DUALSENSE CONNECTED')});
window.addEventListener('gamepaddisconnected',e=>{if(pad===e.gamepad.index)pad=null;const s=S();if(s&&s.gamepad&&s.gamepad.index===e.gamepad.index){s.gamepad=null;s.sprinting=false;s.moving=false}});

function init(){style();controller();refresh();requestAnimationFrame(gameLoop);requestAnimationFrame(physical);setInterval(refresh,150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
