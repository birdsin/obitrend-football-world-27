(()=>{
'use strict';
const game=document.getElementById('game'),hero=document.getElementById('hero'),start=document.getElementById('start');
if(!game||!hero)return;
const style=document.createElement('style');
style.textContent='.wh-suits{position:absolute;right:15px;top:78px;z-index:240;pointer-events:auto}.wh-suit-btn{padding:8px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(5,8,13,.8);color:#fff;font-size:11px;font-weight:800}.wh-suit-panel{position:absolute;right:0;top:42px;width:180px;padding:10px;border-radius:14px;background:rgba(5,8,13,.95);border:1px solid rgba(255,255,255,.15);display:none}.wh-suit-panel.show{display:block}.wh-suit{width:100%;padding:9px;margin:3px 0;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:#151a22;color:#fff;text-align:left;font-size:11px}.wh-suit.active{outline:2px solid #ffd45a}.wh-upgrades{margin-top:8px;color:#bbb;font-size:10px;line-height:1.5}.wh-locked{opacity:.45}';
document.head.appendChild(style);
const box=document.createElement('div');box.className='wh-suits';box.innerHTML='<button class="wh-suit-btn" id="whSuitBtn">SUIT / UPGRADES</button><div class="wh-suit-panel" id="whSuitPanel"><button class="wh-suit active" data-suit="crimson">CRIMSON WEB</button><button class="wh-suit" data-suit="night">NIGHT RUNNER</button><button class="wh-suit" data-suit="storm">STORM GUARD</button><div class="wh-upgrades">SPEED Lv.1 • SWING Lv.1 • POWER Lv.1</div></div>';game.appendChild(box);
const panel=box.querySelector('#whSuitPanel');box.querySelector('#whSuitBtn').addEventListener('click',()=>panel.classList.toggle('show'));
const themes={crimson:['#151820','#d32138','#c52b3d'],night:['#090d16','#2868b7','#17447c'],storm:['#171a1e','#c7cbd2','#68717d']};
function apply(name){const c=themes[name];if(!c)return;hero.querySelector('.body').style.background='linear-gradient(90deg,'+c[0]+','+c[1]+' 48%,'+c[0]+')';hero.querySelectorAll('.arm').forEach(a=>a.style.background=c[2]);hero.querySelectorAll('.leg').forEach(a=>a.style.background=c[0]);}
box.querySelectorAll('.wh-suit').forEach(btn=>btn.addEventListener('click',()=>{box.querySelectorAll('.wh-suit').forEach(x=>x.classList.remove('active'));btn.classList.add('active');apply(btn.dataset.suit);panel.classList.remove('show')}));
apply('crimson');
})();