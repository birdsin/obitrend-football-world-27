/* OBITREND FOOTBALL WORLD 27 — CINEMATIC REALISM STARTUP */
(function(){
'use strict';
if(window.__obiRealisticStartup)return;
window.__obiRealisticStartup=true;

function start(){
 if(document.getElementById('obiRealStartup'))return;
 const style=document.createElement('style');
 style.id='obiRealStartupStyle';
 style.textContent=`
#obiRealStartup{
 position:fixed;inset:0;z-index:1000000;background:#020409;overflow:hidden;
 display:flex;align-items:center;justify-content:center;opacity:1;
 transition:opacity 900ms ease;
 font-family:Arial,Helvetica,sans-serif;pointer-events:auto;
}
#obiRealStartup.fade{opacity:0;pointer-events:none}
#obiRealStartup .scene{
 position:absolute;inset:-5%;
 background-image:
 linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.62)),
 url('assets/obi-startup-stadium.jpg');
 background-size:cover;background-position:center;
 transform:scale(1.02);animation:obiStadiumPush 8s ease-out forwards;
 filter:saturate(1.08) contrast(1.05);
}
#obiRealStartup .lights{
 position:absolute;inset:0;pointer-events:none;
 background:
 radial-gradient(circle at 18% 15%,rgba(255,255,255,.32),transparent 9%),
 radial-gradient(circle at 82% 15%,rgba(255,255,255,.32),transparent 9%);
 animation:obiLightPulse 2.4s ease-in-out infinite alternate;
}
#obiRealStartup .vignette{position:absolute;inset:0;background:radial-gradient(circle,transparent 35%,rgba(0,0,0,.64) 100%)}
#obiRealStartup .content{position:relative;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px}
#obiRealStartup .brand{font-size:clamp(34px,8vw,76px);font-weight:1000;letter-spacing:-3px;text-shadow:0 8px 30px #000}
#obiRealStartup .brand span{color:#e3262e}
#obiRealStartup .sub{margin-top:10px;font-size:10px;letter-spacing:5px;opacity:.82}
#obiRealStartup .line{margin-top:22px;font-size:9px;letter-spacing:3px;opacity:.68}
#obiRealStartup .press{
 margin-top:38px;padding:15px 28px;border:1px solid rgba(255,255,255,.42);
 border-radius:13px;background:rgba(0,0,0,.42);backdrop-filter:blur(12px);
 font-size:11px;font-weight:1000;letter-spacing:1px;
 animation:obiPress 1.2s ease-in-out infinite alternate;
}
#obiRealStartup .features{position:absolute;bottom:max(18px,env(safe-area-inset-bottom));display:flex;gap:9px;flex-wrap:wrap;justify-content:center}
#obiRealStartup .features span{padding:7px 10px;border:1px solid rgba(255,255,255,.18);border-radius:20px;background:rgba(0,0,0,.3);font-size:7px;letter-spacing:1px}
#obiRealStartup .version{position:absolute;left:16px;bottom:max(18px,env(safe-area-inset-bottom));font-size:7px;opacity:.55}
@keyframes obiStadiumPush{from{transform:scale(1.02)}to{transform:scale(1.10)}}
@keyframes obiLightPulse{from{opacity:.55}to{opacity:1}}
@keyframes obiPress{from{transform:translateY(0);opacity:.72}to{transform:translateY(-3px);opacity:1}}
`;
 document.head.appendChild(style);
 const el=document.createElement('div');
 el.id='obiRealStartup';
 el.innerHTML='<div class="scene"></div><div class="lights"></div><div class="vignette"></div><div class="content"><div class="brand">OBITREND <span>27</span></div><div class="sub">FOOTBALL WORLD</div><div class="line">REAL PLAYERS • REAL STADIUMS • REAL EMOTIONS</div><div class="press">PRESS ANY BUTTON</div><div class="features"><span>CINEMATIC MATCHDAY</span><span>REALISTIC ANIMATION</span><span>DUALSENSE TOUCH</span></div><div class="version">OBITREND FOOTBALL WORLD 27 • 2026</div></div>';
 document.body.appendChild(el);
 const finish=()=>{if(!el.classList.contains('fade')){el.classList.add('fade');setTimeout(()=>el.remove(),950)}};
 setTimeout(finish,5500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();