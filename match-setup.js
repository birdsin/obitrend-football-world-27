/* OBITREND FOOTBALL WORLD 27 — MATCH SETUP / STARTING XI
   Lightweight selector for the existing match engine. It reuses the real-player
   roster already bundled in the game and maps the selected XI onto the 22 match
   player nodes without changing the controller workflow.
*/
(function(){
'use strict';
if(window.__obiMatchSetup)return;
window.__obiMatchSetup=true;

const roster=()=>Array.isArray(window.OBITREND_REAL_PLAYERS)?window.OBITREND_REAL_PLAYERS:[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clubs=[
 {id:'showcase',name:'OBITREND SHOWCASE XI',tag:'Mixed star showcase'},
 {id:'real-madrid',name:'REAL MADRID SHOWCASE',tag:'Madrid stars from the showcase roster'},
 {id:'psg',name:'PARIS SHOWCASE XI',tag:'Paris stars from the showcase roster'},
 {id:'world',name:'WORLD XI',tag:'International star selection'}
];
let homeClub='showcase',awayClub='world';
let selectedXI=[];

function profileClub(p){return String(p.club||'').toLowerCase()}
function pick(id,count,exclude){
 const all=roster(),used=new Set(exclude||[]),out=[];
 let pool=[];
 if(id==='real-madrid')pool=all.filter(p=>profileClub(p)==='real madrid');
 else if(id==='psg')pool=all.filter(p=>profileClub(p)==='paris saint-germain');
 else if(id==='world')pool=all.filter(p=>!used.has(p.name));
 else pool=all.slice();
 for(const p of pool){if(!used.has(p.name)&&out.length<count){out.push(p);used.add(p.name)}}
 for(const p of all){if(out.length>=count)break;if(!used.has(p.name)){out.push(p);used.add(p.name)}}
 while(out.length<count&&all.length)out.push(all[out.length%all.length]);
 return out;
}
function getXIs(){
 const home=pick(homeClub,11,[]);
 const away=pick(awayClub,11,home.map(p=>p.name));
 return {home,away};
}
function applyXIs(){
 const nodes=[...document.querySelectorAll('.obiFifaPlayer')];
 if(nodes.length!==22)return false;
 const x=getXIs();
 const all=[...x.home,...x.away];
 all.forEach((p,i)=>{
   const el=nodes[i];
   el.dataset.player=p.name;el.dataset.club=p.club;el.dataset.nation=p.nation;el.dataset.playerPos=p.pos;
   el.dataset.ovr=p.ovr;el.dataset.pace=p.pac;el.dataset.shooting=p.sho;el.dataset.passing=p.pas;el.dataset.dribbling=p.dri;el.dataset.defending=p.def;el.dataset.physical=p.phy;
   const n=el.querySelector('.name');if(n)n.textContent=p.name;
   el.title=p.name+' • '+p.pos+' • OVR '+p.ovr+' • '+p.club;
   el.setAttribute('aria-label',p.name+' '+p.pos+' overall '+p.ovr);
   el.classList.add('realPlayer');
 });
 selectedXI=x.home;
 window.OBITREND_MATCH_XI={home:x.home,away:x.away,homeClub,awayClub};
 const teams=document.querySelector('#obiFifaHUD .teams');
 if(teams)teams.textContent=clubs.find(c=>c.id===homeClub)?.name+'  vs  '+clubs.find(c=>c.id===awayClub)?.name;
 return true;
}
function css(){
 if(document.getElementById('obiMatchSetupStyle'))return;
 const s=document.createElement('style');s.id='obiMatchSetupStyle';s.textContent=`
 #obiMatchSetupBtn{position:fixed;left:14px;top:max(58px,calc(env(safe-area-inset-top) + 58px));z-index:310;border:1px solid #ffffff30;border-radius:12px;background:#070b12e8;color:#fff;padding:9px 12px;font:900 9px Arial,sans-serif;letter-spacing:.7px;box-shadow:0 8px 24px #0008;display:none}
 #obiMatchSetupBtn.show{display:block}
 #obiMatchSetup{position:fixed;inset:0;z-index:520;background:#030509f5;backdrop-filter:blur(14px);display:none;font-family:Arial,sans-serif;color:#fff}
 #obiMatchSetup.show{display:block}.obiMSwrap{height:100%;overflow:auto;padding:max(18px,env(safe-area-inset-top)) 14px max(24px,env(safe-area-inset-bottom));max-width:760px;margin:auto}
 .obiMSTop{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:15px}.obiMSTop h2{font-size:20px;margin:0}.obiMSsub{font-size:8px;opacity:.55;letter-spacing:1px;margin-top:4px}
 #obiMSClose{background:#ffffff10;border:1px solid #ffffff25;color:#fff;border-radius:10px;padding:10px 13px;font-weight:900}
 .obiMScols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.obiMSBox{background:#0b1018;border:1px solid #ffffff18;border-radius:14px;padding:12px}.obiMSBox label{display:block;font-size:8px;opacity:.55;margin-bottom:7px;font-weight:900;letter-spacing:1px}.obiMSBox select{width:100%;background:#151d29;color:#fff;border:1px solid #ffffff20;border-radius:9px;padding:10px;font-weight:800}
 .obiMSXI{margin-top:12px;background:#0b1018;border:1px solid #ffffff18;border-radius:14px;padding:12px}.obiMSXI h3{font-size:11px;margin:0 0 8px}.obiMSList{display:grid;grid-template-columns:repeat(2,1fr);gap:5px}.obiMSPlayer{background:#ffffff08;border-radius:7px;padding:6px;font-size:7px}.obiMSPlayer b{display:block;font-size:9px}.obiMSStart{width:100%;margin-top:12px;padding:13px;border:0;border-radius:12px;background:linear-gradient(135deg,#e3262e,#ff7a18);color:#fff;font-weight:1000;letter-spacing:1px}
 @media(max-width:520px){.obiMScols{grid-template-columns:1fr}.obiMSList{grid-template-columns:1fr 1fr}}
 `;document.head.appendChild(s)
}
function render(){
 const x=getXIs(),h=document.getElementById('obiMSHome'),a=document.getElementById('obiMSAway');
 if(h)h.innerHTML=x.home.map((p,i)=>`<div class="obiMSPlayer"><b>${i+1}. ${esc(p.name)}</b><span>${esc(p.pos)} • OVR ${p.ovr}</span></div>`).join('');
 if(a)a.innerHTML=x.away.map((p,i)=>`<div class="obiMSPlayer"><b>${i+1}. ${esc(p.name)}</b><span>${esc(p.pos)} • OVR ${p.ovr}</span></div>`).join('');
}
function build(){
 if(document.getElementById('obiMatchSetup'))return;
 css();
 const b=document.createElement('button');b.id='obiMatchSetupBtn';b.type='button';b.textContent='MATCH SETUP';document.body.appendChild(b);
 const h=document.createElement('div');h.id='obiMatchSetup';h.innerHTML='<div class="obiMSwrap"><div class="obiMSTop"><div><h2>MATCH SETUP</h2><div class="obiMSsub">REAL PLAYERS • STARTING XI</div></div><button id="obiMSClose" type="button">CLOSE</button></div><div class="obiMScols"><div class="obiMSBox"><label>HOME TEAM</label><select id="obiMSHomeSelect"></select></div><div class="obiMSBox"><label>AWAY TEAM</label><select id="obiMSAwaySelect"></select></div></div><div class="obiMSXI"><h3>HOME STARTING XI</h3><div id="obiMSHome" class="obiMSList"></div></div><div class="obiMSXI"><h3>AWAY STARTING XI</h3><div id="obiMSAway" class="obiMSList"></div></div><button id="obiMSStart" class="obiMSStart" type="button">START MATCH WITH THIS XI</button></div></div>';
 document.body.appendChild(h);
 const hs=document.getElementById('obiMSHomeSelect'),as=document.getElementById('obiMSAwaySelect');
 clubs.forEach(c=>{hs.insertAdjacentHTML('beforeend',`<option value="${c.id}">${esc(c.name)}</option>`);as.insertAdjacentHTML('beforeend',`<option value="${c.id}">${esc(c.name)}</option>`)});
 hs.value=homeClub;as.value=awayClub;
 hs.onchange=()=>{homeClub=hs.value;if(homeClub===awayClub){awayClub=clubs.find(c=>c.id!==homeClub)?.id||'world';as.value=awayClub}render()};
 as.onchange=()=>{awayClub=as.value;if(awayClub===homeClub){homeClub=clubs.find(c=>c.id!==awayClub)?.id||'showcase';hs.value=homeClub}render()};
 b.onclick=()=>{render();h.classList.add('show')};
 document.getElementById('obiMSClose').onclick=()=>h.classList.remove('show');
 document.getElementById('obiMSStart').onclick=()=>{applyXIs();h.classList.remove('show');if(typeof window.openMatch==='function')window.openMatch()};
}
function sync(){const b=document.getElementById('obiMatchSetupBtn');if(!b)return;const game=document.getElementById('game'),world=document.getElementById('world');const v=x=>x&&getComputedStyle(x).display!=='none';b.classList.toggle('show',v(game)||v(world))}
function init(){build();sync();setInterval(sync,300);const mo=new MutationObserver(()=>applyXIs());mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.OBITREND_GET_MATCH_XI=getXIs;
})();
