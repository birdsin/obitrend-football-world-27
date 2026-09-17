(()=>{
'use strict';
const game=document.getElementById('game'),hero=document.getElementById('hero'),start=document.getElementById('start');
if(!game||!hero)return;
const style=document.createElement('style');
style.textContent='.wh-missions{position:absolute;inset:0;z-index:35;pointer-events:none}.wh-mission-hud{position:absolute;left:15px;top:78px;padding:9px 12px;border-radius:12px;background:rgba(5,8,13,.78);border:1px solid rgba(255,255,255,.15);color:#fff;font-size:12px;min-width:190px}.wh-mission-hud b{display:block;color:#ffd45a;font-size:11px;letter-spacing:1px;margin-bottom:4px}.wh-mission-progress{height:5px;background:#30353d;border-radius:5px;margin-top:7px;overflow:hidden}.wh-mission-progress i{display:block;width:0;height:100%;background:#ffd45a;transition:width .2s}.wh-marker{position:absolute;width:34px;height:34px;border:2px solid #ffd45a;border-radius:50%;box-shadow:0 0 20px rgba(255,212,90,.7);transform:translate(-50%,-50%);display:none}.wh-marker:after{content:"";position:absolute;inset:8px;border-radius:50%;background:#ffd45a}.wh-mission-toast{position:absolute;left:50%;top:27%;transform:translateX(-50%);padding:12px 18px;border-radius:14px;background:rgba(8,10,15,.9);border:1px solid rgba(255,212,90,.5);color:#fff;font-weight:900;font-size:13px;opacity:0;transition:opacity .2s}.wh-mission-toast.show{opacity:1}';
document.head.appendChild(style);
const layer=document.createElement('div');layer.className='wh-missions';game.appendChild(layer);
const hud=document.createElement('div');hud.className='wh-mission-hud';hud.innerHTML='<b>MISSION 01</b><span id="whMissionText">Reach the golden marker</span><div class="wh-mission-progress"><i id="whMissionBar"></i></div>';layer.appendChild(hud);
const marker=document.createElement('div');marker.className='wh-marker';layer.appendChild(marker);
const toast=document.createElement('div');toast.className='wh-mission-toast';toast.textContent='MISSION COMPLETE  +100 COINS';layer.appendChild(toast);
let active=true,complete=false,px=0,py=0;
function place(){px=Math.min(innerWidth*.86,Math.max(innerWidth*.18,innerWidth*.78));py=innerHeight*.48;marker.style.left=px+'px';marker.style.top=py+'px';marker.style.display=active?'block':'none'}
function check(){if(!active)return;const hx=parseFloat(hero.style.left)||innerWidth/2,hy=parseFloat(hero.style.top)||innerHeight*.69;const d=Math.hypot(hx-px,hy-py);const progress=Math.max(0,Math.min(100,(1-d/innerHeight*.75)*100));document.getElementById('whMissionBar').style.width=progress+'%';if(d<90){active=false;complete=true;marker.style.display='none';document.getElementById('whMissionText').textContent='Completed — reward claimed';document.getElementById('whMissionBar').style.width='100%';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}}
setInterval(()=>{if(start&&start.style.display!=='none')return;place();check()},80);
window.addEventListener('resize',place);place();
})();