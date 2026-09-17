/* OBITREND FOOTBALL WORLD 27 — REAL PLAYER HUB */
(function(){
'use strict';
if(window.__obiRealSquadHub)return;
window.__obiRealSquadHub=true;

const players=()=>Array.isArray(window.OBITREND_REAL_PLAYERS)?window.OBITREND_REAL_PLAYERS:[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function css(){
 if(document.getElementById('obiRealHubStyle'))return;
 const s=document.createElement('style');s.id='obiRealHubStyle';
 s.textContent=`
 #obiRealHubBtn{position:fixed;right:14px;top:max(58px,calc(env(safe-area-inset-top) + 58px));z-index:310;border:1px solid #ffffff35;border-radius:12px;background:#070b12e8;color:#fff;padding:9px 12px;font:900 9px Arial,sans-serif;letter-spacing:.8px;box-shadow:0 8px 24px #0008;display:none}
 #obiRealHubBtn.show{display:block}
 #obiRealHub{position:fixed;inset:0;z-index:500;background:#030509f2;backdrop-filter:blur(12px);display:none;font-family:Arial,sans-serif;color:#fff}
 #obiRealHub.show{display:block}
 #obiRealHub .wrap{height:100%;overflow:auto;padding:max(18px,env(safe-area-inset-top)) 14px max(22px,env(safe-area-inset-bottom))}
 #obiRealHub .top{display:flex;align-items:center;justify-content:space-between;gap:10px;max-width:760px;margin:auto;padding:8px 0 14px}
 #obiRealHub h2{font-size:20px;margin:0}.obiRealSub{font-size:8px;opacity:.55;letter-spacing:1.4px;margin-top:4px}
 #obiRealClose{border:1px solid #ffffff30;background:#ffffff10;color:#fff;border-radius:10px;padding:10px 13px;font-weight:900}
 #obiRealGrid{max-width:760px;margin:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .obiRealRow{border:1px solid #ffffff16;border-radius:13px;background:linear-gradient(145deg,#101722,#080c12);padding:11px;display:grid;grid-template-columns:38px 1fr auto;gap:9px;align-items:center}
 .obiRealNum{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#e3262e;color:#fff;font-weight:1000;font-size:11px}
 .obiRealName{font-size:11px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.obiRealMeta{font-size:7px;opacity:.58;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .obiRealOvr{font-size:17px;font-weight:1000;text-align:right}.obiRealPos{font-size:7px;opacity:.55;text-align:right;margin-top:2px}
 .obiRealStats{grid-column:1/-1;display:grid;grid-template-columns:repeat(6,1fr);gap:4px}.obiRealStat{background:#ffffff08;border-radius:6px;padding:5px 2px;text-align:center;font-size:6px;opacity:.8}.obiRealStat b{display:block;font-size:9px;opacity:1;margin-bottom:2px}
 @media(max-width:520px){#obiRealGrid{grid-template-columns:1fr}.obiRealRow{grid-template-columns:38px 1fr auto}.obiRealStats{grid-template-columns:repeat(6,1fr)}}
 `;
 document.head.appendChild(s);
}

function render(){
 const list=players();
 const grid=document.getElementById('obiRealGrid');if(!grid)return;
 grid.innerHTML=list.map((p,i)=>`<article class="obiRealRow" data-player-index="${i}"><div class="obiRealNum">${i+1}</div><div><div class="obiRealName">${esc(p.name)}</div><div class="obiRealMeta">${esc(p.nation)} • ${esc(p.club)}</div></div><div><div class="obiRealOvr">${esc(p.ovr)}</div><div class="obiRealPos">${esc(p.pos)}</div></div><div class="obiRealStats"><div class="obiRealStat"><b>${p.pace}</b>PAC</div><div class="obiRealStat"><b>${p.shooting}</b>SHO</div><div class="obiRealStat"><b>${p.passing}</b>PAS</div><div class="obiRealStat"><b>${p.dribbling}</b>DRI</div><div class="obiRealStat"><b>${p.defending}</b>DEF</div><div class="obiRealStat"><b>${p.physical}</b>PHY</div></div></article>`).join('');
}

function build(){
 if(document.getElementById('obiRealHub'))return;
 css();
 const b=document.createElement('button');b.id='obiRealHubBtn';b.textContent='REAL PLAYERS';b.type='button';document.body.appendChild(b);
 const h=document.createElement('div');h.id='obiRealHub';h.innerHTML='<div class="wrap"><div class="top"><div><h2>REAL PLAYER SQUAD</h2><div class="obiRealSub">OBITREND FOOTBALL WORLD 27 • SHOWCASE ROSTER</div></div><button id="obiRealClose" type="button">CLOSE</button></div><div id="obiRealGrid"></div></div>';document.body.appendChild(h);
 b.addEventListener('click',()=>{render();h.classList.add('show')});
 document.getElementById('obiRealClose').addEventListener('click',()=>h.classList.remove('show'));
 h.addEventListener('click',e=>{if(e.target===h)h.classList.remove('show')});
}

function sync(){
 const b=document.getElementById('obiRealHubBtn');if(!b)return;
 const game=document.getElementById('game'),world=document.getElementById('world');
 const visible=x=>x&&getComputedStyle(x).display!=='none';
 b.classList.toggle('show',visible(game)||visible(world));
}

function init(){build();sync();setInterval(sync,300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
