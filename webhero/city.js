(()=>{
'use strict';
const game=document.getElementById('game');
if(!game)return;
const style=document.createElement('style');
style.textContent=`
.world-traffic{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:hidden}
.wh-car{position:absolute;width:58px;height:24px;border-radius:7px 9px 5px 5px;background:linear-gradient(#68717d,#252a31);box-shadow:0 5px 9px rgba(0,0,0,.45);transform:translateX(-80px)}
.wh-car:before{content:"";position:absolute;left:12px;top:-8px;width:30px;height:12px;border-radius:8px 8px 2px 2px;background:#34404c;border:1px solid rgba(255,255,255,.12)}
.wh-car:after{content:"••";position:absolute;left:8px;bottom:-8px;letter-spacing:32px;color:#08090b;font-size:15px}
.wh-npcs{position:absolute;inset:0;pointer-events:none}
.wh-npc{position:absolute;width:10px;height:24px;border-radius:7px 7px 3px 3px;background:#d9b08b;box-shadow:0 4px 6px rgba(0,0,0,.4)}
.wh-npc:before{content:"";position:absolute;width:9px;height:9px;left:.5px;top:-8px;border-radius:50%;background:#c58e69}
.wh-npc:after{content:"";position:absolute;left:2px;bottom:-6px;width:6px;height:7px;border-left:2px solid #15171b;border-right:2px solid #15171b}
.wh-roof{position:absolute;height:5px;border-radius:3px;background:#87919c;opacity:.65;box-shadow:0 0 5px rgba(255,255,255,.15)}
`;
document.head.appendChild(style);
const traffic=document.createElement('div');traffic.className='world-traffic';game.appendChild(traffic);
const npcs=document.createElement('div');npcs.className='wh-npcs';traffic.appendChild(npcs);
const roadY=[76,82,88];
roadY.forEach((p,i)=>{const car=document.createElement('div');car.className='wh-car';car.style.top=p+'%';car.style.left=(i%2?'110%':'-70px');car.style.transform=`translateX(${i%2?'0':'0'})`;traffic.appendChild(car);let pos=i%2?110:-12;const dir=i%2?-1:1;const speed=0.018+i*.004;function move(){pos+=dir*speed*100/60;if(dir>0&&pos>112)pos=-12;if(dir<0&&pos<-12)pos=112;car.style.left=pos+'%';requestAnimationFrame(move)}move()});
for(let i=0;i<12;i++){const n=document.createElement('div');n.className='wh-npc';n.style.left=(8+Math.random()*84)+'%';n.style.top=(62+Math.random()*20)+'%';n.style.transform=`scale(${.7+Math.random()*.55})`;n.style.opacity=.55+Math.random()*.4;npcs.appendChild(n)}
[18,31,48,64,79,92].forEach((left,i)=>{const r=document.createElement('div');r.className='wh-roof';r.style.left=left+'%';r.style.top=(24+(i%3)*12)+'%';r.style.width=(7+(i%4)*3)+'%';traffic.appendChild(r)});
})();