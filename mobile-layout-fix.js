/* OBITREND FOOTBALL WORLD 27 — MOBILE HARD LAYOUT FIX */
(function(){
'use strict';
if(window.__obiMobileLayoutFix)return;
window.__obiMobileLayoutFix=true;

function install(){
 let s=document.getElementById('obiMobileLayoutFixStyle');
 if(!s){s=document.createElement('style');s.id='obiMobileLayoutFixStyle';document.head.appendChild(s)}
 s.textContent=`
html,body{
 width:100%!important;min-width:0!important;max-width:none!important;
 height:100%!important;min-height:0!important;max-height:none!important;
 margin:0!important;padding:0!important;overflow:hidden!important;
 position:fixed!important;inset:0!important;
}
#app{
 position:fixed!important;inset:0!important;width:100%!important;height:100%!important;
 min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;
 overflow:hidden!important;transform:none!important;translate:none!important;scale:1!important;rotate:none!important;
}
#menu,#world,#game,#replayScreen{
 position:absolute!important;left:0!important;top:0!important;right:0!important;bottom:0!important;
 width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;
 min-height:0!important;max-height:none!important;margin:0!important;overflow:hidden!important;
 transform:none!important;translate:none!important;scale:1!important;rotate:none!important;
}
#menu .hero{
 position:absolute!important;left:0!important;top:0!important;right:0!important;bottom:0!important;
 width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;
 min-height:0!important;max-height:none!important;margin:0!important;padding:65px 12px 95px!important;
 display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
 text-align:center!important;overflow:hidden!important;transform:none!important;translate:none!important;
 scale:1!important;rotate:none!important;animation:none!important;
}
#menu .hero>*{
 position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
 margin-left:auto!important;margin-right:auto!important;transform:none!important;translate:none!important;
 scale:1!important;rotate:none!important;animation:none!important;max-width:94vw!important;min-width:0!important;
}
#menu .hero h1{
 width:auto!important;max-width:94vw!important;height:auto!important;max-height:none!important;
 white-space:normal!important;overflow:visible!important;overflow-wrap:normal!important;word-break:normal!important;
 writing-mode:horizontal-tb!important;direction:ltr!important;text-align:center!important;
 font-size:clamp(30px,12vw,50px)!important;line-height:.88!important;letter-spacing:-2.5px!important;
 margin:0 auto!important;
}
#menu .hero .eyebrow{font-size:8px!important;line-height:1!important;letter-spacing:3px!important;margin:0 auto 10px!important}
#menu .hero .tagline{font-size:8px!important;line-height:1.2!important;letter-spacing:2px!important;margin:11px auto 0!important}
#menu .menuButtons{width:100%!important;max-width:94vw!important;margin:18px auto 0!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;transform:none!important}
#menu .menuBtn{min-width:132px!important;max-width:88vw!important;padding:12px 14px!important}
#menu .brand{left:18px!important;right:auto!important;top:max(10px,env(safe-area-inset-top))!important;transform:none!important;animation:none!important}
#menu .camera{display:none!important}
#menu .menuBottom{left:50%!important;right:auto!important;bottom:max(8px,env(safe-area-inset-bottom))!important;width:96%!important;transform:translateX(-50%)!important;animation:none!important}
@media (max-width:430px){
 #menu .hero{padding:62px 10px 92px!important}
 #menu .hero h1{font-size:clamp(29px,12vw,50px)!important}
 #menu .menuButtons{flex-direction:column!important;gap:7px!important}
 #menu .menuBtn{width:min(290px,88vw)!important}
 #menu .menuBottom{display:none!important}
}
@media (orientation:landscape) and (max-height:700px){
 #menu .hero{padding:40px 18px 68px!important}
 #menu .hero h1{font-size:clamp(34px,7vw,72px)!important}
 #menu .menuButtons{margin-top:14px!important;gap:7px!important}
 #menu .menuBtn{min-width:120px!important;padding:10px 13px!important;font-size:9px!important}
}
`;
}
function run(){install();setTimeout(install,250);setTimeout(install,1000);setTimeout(install,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('load',run,{once:true});
window.addEventListener('resize',run,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(run,150),{passive:true});
})();
