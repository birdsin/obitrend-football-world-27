/* OBITREND FOOTBALL WORLD 27 — MOBILE/LANDSCAPE LAYOUT FIX */
(function(){
'use strict';
if(window.__obiMobileLayoutFix)return;
window.__obiMobileLayoutFix=true;

function install(){
 if(document.getElementById('obiMobileLayoutFixStyle'))return;
 const s=document.createElement('style');
 s.id='obiMobileLayoutFixStyle';
 s.textContent=`
 html,body,#app{
   width:100vw!important;
   max-width:100vw!important;
   min-width:0!important;
   height:100dvh!important;
   max-height:100dvh!important;
   overflow:hidden!important;
 }
 #app,#menu,#world,#game{
   left:0!important;
   right:0!important;
   width:100vw!important;
   min-width:0!important;
   max-width:100vw!important;
 }
 #menu{
   overflow:hidden!important;
 }
 #menu .hero{
   position:absolute!important;
   left:0!important;
   right:0!important;
   top:0!important;
   bottom:0!important;
   width:100vw!important;
   height:100dvh!important;
   max-width:100vw!important;
   margin:0!important;
   transform:none!important;
   translate:none!important;
   display:flex!important;
   align-items:center!important;
   justify-content:center!important;
   overflow:hidden!important;
 }
 #menu .hero>*{
   max-width:94vw!important;
   transform:none!important;
   translate:none!important;
 }
 #menu .hero h1{
   width:auto!important;
   max-width:94vw!important;
   white-space:normal!important;
   overflow-wrap:anywhere!important;
 }
 @media (orientation:landscape) and (max-height:700px){
   .brand{left:18px!important;top:max(10px,env(safe-area-inset-top))!important}
   .logo{font-size:clamp(20px,4.8vw,42px)!important;letter-spacing:-1.5px!important}
   .brandSmall{font-size:8px!important;letter-spacing:4px!important}
   .camera{right:18px!important;top:max(10px,env(safe-area-inset-top))!important;transform:scale(.72);transform-origin:top right!important}
   .hero{padding:12px 18px 82px!important;justify-content:center!important}
   .eyebrow{font-size:8px!important;letter-spacing:4px!important;margin-bottom:8px!important}
   .hero h1{font-size:clamp(34px,7vw,72px)!important;line-height:.9!important;letter-spacing:-3px!important;max-width:92vw!important}
   .tagline{margin-top:9px!important;font-size:8px!important;letter-spacing:2.5px!important}
   .menuButtons{margin-top:16px!important;gap:7px!important;max-width:94vw!important}
   .menuBtn{min-width:120px!important;padding:11px 14px!important;font-size:9px!important}
   .menuBottom{bottom:max(8px,env(safe-area-inset-bottom))!important;width:96%!important;gap:5px!important}
   .pill{padding:6px 9px!important;font-size:7px!important}
 }
 @media (max-width:600px){
   .camera{display:none!important}
   #menu .hero{
     padding:86px 16px 104px!important;
   }
   #menu .hero h1{
     font-size:clamp(31px,11.5vw,58px)!important;
     line-height:.9!important;
     letter-spacing:-2.5px!important;
   }
   .eyebrow{font-size:8px!important;letter-spacing:3px!important;margin-bottom:9px!important}
   .tagline{font-size:8px!important;letter-spacing:2px!important;margin-top:10px!important}
   .menuButtons{
     margin-top:18px!important;
     width:100%!important;
     max-width:94vw!important;
   }
   .menuBtn{min-width:132px!important;padding:12px 14px!important}
 }
 @media (max-width:430px){
   #menu .hero{padding-bottom:110px!important}
   #menu .hero h1{font-size:clamp(30px,12vw,50px)!important}
   .menuButtons{width:100%!important;flex-direction:column!important;align-items:center!important}
   .menuBtn{width:min(290px,88vw)!important}
   .menuBottom{display:none!important}
 }
 `;
 document.head.appendChild(s);
}
function run(){install();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('resize',run,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(run,120),{passive:true});
})();
