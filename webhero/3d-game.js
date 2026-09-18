(()=>{const game=document.getElementById('game');if(!game||typeof THREE==='undefined')return;game.querySelectorAll('.sky,.sun,.city,.street,#hero,#webLine,#anchor,#hud,#controls,#start').forEach(e=>e.style.display='none');const ui=document.createElement('div');ui.innerHTML='<div id="rHud" style="position:fixed;z-index:50;top:15px;left:15px;right:15px;display:flex;justify-content:space-between;color:white;font:900 15px Arial"><div style="background:#080b10dd;padding:10px 13px;border-radius:12px">WEB <span style="color:#e32643">HERO</span> 27<br><small style="font-weight:400;opacity:.7">3D CITY</small></div><div style="background:#080b10dd;padding:10px 13px;border-radius:12px">🪙 <span id="rCoins">0</span></div></div><div id="rControls" style="position:fixed;inset:0;z-index:60;pointer-events:none"><div id="rJoy" style="position:absolute;left:24px;bottom:28px;width:128px;height:128px;border:2px solid #ffffff33;border-radius:50%;background:#ffffff0d;pointer-events:auto"><i id="rStick" style="position:absolute;left:34px;top:34px;width:56px;height:56px;border-radius:50%;background:#ffffff2b"></i></div><button id="rJump" style="position:absolute;right:34px;bottom:118px;width:68px;height:68px;border-radius:50%;border:1px solid #ffffff33;background:#080b10dd;color:white;font-weight:900;pointer-events:auto">JUMP</button><button id="rWeb" style="position:absolute;right:116px;bottom:45px;width:80px;height:80px;border-radius:50%;border:1px solid #ffffff33;background:#b91930dd;color:white;font-weight:900;pointer-events:auto">WEB</button><button id="rHit" style="position:absolute;right:30px;bottom:24px;width:58px;height:58px;border-radius:50%;border:1px solid #ffffff33;background:#080b10dd;color:white;font-weight:900;pointer-events:auto">HIT</button></div>';game.appendChild(ui);const scene=new THREE.Scene();scene.background=new THREE.Color(0x07101b);scene.fog=new THREE.Fog(0x07101b,35,150);const cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,250);const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});ren.setPixelRatio(Math.min(devicePixelRatio,1.6));ren.setSize(innerWidth,innerHeight);ren.outputColorSpace=THREE.SRGBColorSpace;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.12;ren.shadowMap.enabled=true;game.insertBefore(ren.domElement,game.firstChild);scene.add(new THREE.HemisphereLight(0xcfe2ff,0x15181c,2.2));const sun=new THREE.DirectionalLight(0xfff3dc,3.6);sun.position.set(35,55,20);sun.castShadow=true;scene.add(sun);const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),new THREE.MeshStandardMaterial({color:0x24282d,roughness:.96,metalness:.02}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
// Realistic street dressing: sidewalks, lane markings, street lights, trees and window rows.
const asphaltMat=new THREE.MeshStandardMaterial({color:0x17191c,roughness:1,metalness:0});
for(let z=-100;z<=100;z+=18){
  for(let x=-105;x<=105;x+=12){
    const lane=new THREE.Mesh(new THREE.BoxGeometry(5,.018,.18),new THREE.MeshStandardMaterial({color:0xd7c46b,roughness:.85}));
    lane.position.set(x,.065,z);scene.add(lane);
  }
}
const sidewalkMat=new THREE.MeshStandardMaterial({color:0x55575a,roughness:.95});
for(const x of[-108,108]){
  const sw=new THREE.Mesh(new THREE.BoxGeometry(8,.22,220),sidewalkMat);
  sw.position.set(x,.12,0);scene.add(sw);
}
const poleMat=new THREE.MeshStandardMaterial({color:0x25292d,roughness:.65,metalness:.35});
for(let z=-90;z<=90;z+=30){
  for(const x of[-13,13]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,5.5,10),poleMat);
    pole.position.set(x,2.75,z);scene.add(pole);
    const lamp=new THREE.PointLight(0xffdca3,.45,18);lamp.position.set(x,5.3,z);scene.add(lamp);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),new THREE.MeshStandardMaterial({color:0xffe7bd,emissive:0xffc66b,emissiveIntensity:1.2}));
    cap.position.set(x,5.25,z);scene.add(cap);
  }
}
function addTree(x,z,s=1){
  const g=new THREE.Group();
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,2.4,10),new THREE.MeshStandardMaterial({color:0x4b3426,roughness:1}));
  trunk.position.y=1.2;g.add(trunk);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.25,14,10),new THREE.MeshStandardMaterial({color:0x315d3b,roughness:1}));
  crown.position.y=3.0;crown.scale.set(1.05,.9,1.05);g.add(crown);
  g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);
}
for(let z=-90;z<=90;z+=24){addTree(-18,z,.9+Math.random()*.25);addTree(18,z,.9+Math.random()*.25)}
for(let z=-100;z<=100;z+=18){const r=new THREE.Mesh(new THREE.BoxGeometry(240,.06,10),new THREE.MeshStandardMaterial({color:0x111419,roughness:.9}));r.position.set(0,.03,z);scene.add(r)}const mats=[0x303740,0x3d444d,0x252b34,0x4b5158,0x343a42,0x282e36];for(let x=-90;x<=90;x+=14)for(let z=-95;z<=65;z+=22){if(Math.abs(x)<8)continue;const h=9+Math.random()*38,b=new THREE.Mesh(new THREE.BoxGeometry(9+Math.random()*5,h,15),new THREE.MeshStandardMaterial({color:mats[Math.floor(Math.random()*mats.length)],roughness:.78,metalness:.08}));b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;scene.add(b)}const hero=new THREE.Group();hero.position.set(0,0,8);scene.add(hero);const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.55,metalness:.08});const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.68,1.28,10,20),mat(0x8f172c));torso.position.y=1.82;hero.add(torso);const chest=new THREE.Mesh(new THREE.CylinderGeometry(.38,.5,.72,20),mat(0x171b22));chest.rotation.x=Math.PI/2;chest.position.set(0,2.02,.53);hero.add(chest);for(let a=0;a<3;a++){const line=new THREE.Mesh(new THREE.TorusGeometry(.16+a*.07,.012,8,24),mat(0xd8dce2));line.rotation.x=Math.PI/2;line.position.set(0,2.02,.57);hero.add(line)}const head=new THREE.Mesh(new THREE.SphereGeometry(.5,24,18),mat(0xb77d62));head.position.y=3.2;hero.add(head);const mask=new THREE.Mesh(new THREE.BoxGeometry(.86,.34,.22),mat(0x11151b));mask.position.set(0,3.25,.46);hero.add(mask);const eyeL=new THREE.Mesh(new THREE.BoxGeometry(.24,.075,.025),mat(0xffffff));eyeL.position.set(-.22,3.29,.58);hero.add(eyeL);const eyeR=eyeL.clone();eyeR.position.x=.22;hero.add(eyeR);for(const s of[-1,1]){const shoulder=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),mat(0x9a1a30));shoulder.position.set(s*.62,2.45,0);hero.add(shoulder);const a=new THREE.Mesh(new THREE.CapsuleGeometry(.2,.9,8,14),mat(0xa51d34));a.position.set(s*.9,1.9,0);a.rotation.z=s*.2;hero.add(a);const l=new THREE.Mesh(new THREE.CapsuleGeometry(.23,1.05,6,12),mat(0x171b22));l.position.set(s*.32,.55,0);hero.add(l)}const cars=[];for(let i=0;i<12;i++){const car=new THREE.Group();car.position.set((Math.random()-.5)*100,.45,(Math.random()-.5)*100);const body=new THREE.Mesh(new THREE.BoxGeometry(2.4,.55,4.6),mat(i%2?0x20252b:0x6d1f2a));body.castShadow=true;car.add(body);const roof=new THREE.Mesh(new THREE.BoxGeometry(1.8,.45,2.3),mat(0x12161b));roof.position.y=.45;car.add(roof);scene.add(car);cars.push(car)}const enemies=[];for(let i=0;i<8;i++){const g=new THREE.Group();g.position.set((Math.random()-.5)*80,0,(Math.random()-.5)*100-15);const b=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.05,6,12),mat(0x4c252d));b.position.y=1.5;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.42,20,14),mat(0x946b57));h.position.y=2.9;g.add(h);g.userData.hp=100;scene.add(g);enemies.push(g)}let run=false,jx=0,jy=0,vy=0,grounded=true,web=false,coins=Number(localStorage.getItem('wh3d_coins')||0);document.getElementById('rCoins').textContent=coins;const joy=document.getElementById('rJoy'),stick=document.getElementById('rStick');let id=null;const move=(x,y)=>{const q=joy.getBoundingClientRect(),dx=x-(q.left+64),dy=y-(q.top+64),d=Math.hypot(dx,dy)||1,m=Math.min(42,d);jx=dx/d*m/42;jy=dy/d*m/42;stick.style.transform='translate('+dx/d*m+'px,'+dy/d*m+'px)'};joy.ontouchstart=e=>{id=e.changedTouches[0].identifier;move(e.changedTouches[0].clientX,e.changedTouches[0].clientY)};joy.ontouchmove=e=>{for(const t of e.changedTouches)if(t.identifier===id)move(t.clientX,t.clientY)};joy.ontouchend=()=>{id=null;jx=jy=0;stick.style.transform='translate(0,0)'};document.getElementById('rJump').ontouchstart=()=>{if(grounded){vy=10;grounded=false}else if(web){web=false;vy=8}};document.getElementById('rWeb').ontouchstart=()=>web=!web;document.getElementById('rHit').ontouchstart=()=>{let best=null,bd=3;for(const e of enemies){const d=e.position.distanceTo(hero.position);if(d<bd){bd=d;best=e}}if(best){best.userData.hp-=50;if(best.userData.hp<=0){best.visible=false;missionKills++;coins+=50;localStorage.setItem('wh3d_coins',coins);document.getElementById('rCoins').textContent=coins;setTimeout(()=>{best.userData.hp=100;best.position.set((Math.random()-.5)*80,0,(Math.random()-.5)*100-15);best.visible=true},2200)}}};game.addEventListener('click',()=>run=true,{once:true});run=true;
// Load a real 3D human asset (CC0) instead of the placeholder body.
(async()=>{
 try{
  const {GLTFLoader}=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js');
  const loader=new GLTFLoader();
  loader.load('https://cdn.3dassets.dev/assets/25259/v1/model.glb',(gltf)=>{
    const realHero=gltf.scene;
    realHero.scale.setScalar(2.05);
    realHero.position.set(0,0,8);
    realHero.traverse(o=>{
      if(o.isMesh){
        o.castShadow=true;o.receiveShadow=true;
        if(o.material&&o.material.clone){
          const m=o.material.clone();
          m.roughness=.48;m.metalness=.04;o.material=m;
        }
      }
    });
    scene.add(realHero);
    hero.visible=false;
    window.WH_REAL_HERO=realHero;
  },undefined,(err)=>console.warn('Real hero model failed to load',err));
 }catch(err){console.warn('Real hero loader unavailable',err)}
})();

// ===================== MISSION SYSTEM =====================
const missionBox=document.createElement('div');
missionBox.id='missionBox';
missionBox.style.cssText='position:fixed;z-index:55;top:105px;left:15px;max-width:310px;padding:12px 15px;border:1px solid #ffffff33;border-radius:14px;background:#070a10e8;color:#fff;font:700 13px Arial;backdrop-filter:blur(8px);box-shadow:0 8px 30px #0008';
missionBox.innerHTML='<div style="font-size:10px;letter-spacing:1.5px;color:#ffcc55">CURRENT MISSION</div><div id="mTitle" style="font-size:16px;margin-top:4px">CITY CALL</div><div id="mObjective" style="font-weight:500;margin-top:5px;line-height:1.35">Reach the marked location.</div><div id="mProgress" style="margin-top:7px;color:#ffd66b">0 / 1</div>';
ui.appendChild(missionBox);
const missionMarker=new THREE.Group();
const markerRing=new THREE.Mesh(new THREE.TorusGeometry(1.25,.12,10,32),new THREE.MeshBasicMaterial({color:0xffc933}));
const markerBeam=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,5,10),new THREE.MeshBasicMaterial({color:0xffc933,transparent:true,opacity:.45}));
markerRing.rotation.x=Math.PI/2;
markerBeam.position.y=2.5;
missionMarker.add(markerRing,markerBeam);
scene.add(missionMarker);
const missionNPC=new THREE.Group();
const npcBody=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.95,6,12),mat(0x315a70));
npcBody.position.y=1.35;
const npcHead=new THREE.Mesh(new THREE.SphereGeometry(.36,16,12),mat(0xb77d62));
npcHead.position.y=2.65;
missionNPC.add(npcBody,npcHead);
scene.add(missionNPC);
let missionIndex=0,missionKills=0,missionStartedAt=performance.now();
const missions=[
 {title:'CITY CALL',objective:'Reach the marked location and investigate the call.',type:'reach',target:new THREE.Vector3(28,0,-30),reward:100},
 {title:'STREET THREAT',objective:'Stop 3 hostile attackers in the district.',type:'kills',target:3,reward:150},
 {title:'ROOFTOP RUN',objective:'Move to the next marked rooftop area.',type:'reach',target:new THREE.Vector3(-42,0,-62),reward:200},
 {title:'CIVILIAN RESCUE',objective:'Reach the marked civilian before leaving the area.',type:'rescue',target:new THREE.Vector3(55,0,38),reward:250}
];
function setMissionMarker(){
 const m=missions[missionIndex];
 missionMarker.visible=!!m;
 missionKills=0;
 missionStartedAt=performance.now();
 if(m.type==='kills'){
   missionMarker.position.set(hero.position.x,0,hero.position.z);
   missionMarker.visible=false;
 }else{
   missionMarker.position.copy(m.target);
   missionMarker.position.y=.12;
 }
 missionNPC.visible=m.type==='rescue';
 if(m.type==='rescue')missionNPC.position.copy(m.target);
 document.getElementById('mTitle').textContent=m.title;
 document.getElementById('mObjective').textContent=m.objective;
 document.getElementById('mProgress').textContent=m.type==='kills'?'0 / '+m.target:'ACTIVE';
}
function missionComplete(){
 const m=missions[missionIndex];
 coins+=m.reward;
 localStorage.setItem('wh3d_coins',coins);
 document.getElementById('rCoins').textContent=coins;
 document.getElementById('mProgress').textContent='MISSION COMPLETE  +'+m.reward+' COINS';
 missionIndex++;
 if(missionIndex>=missions.length){
   missionIndex=0;
   setTimeout(()=>setMissionMarker(),1800);
 }else{
   setTimeout(()=>setMissionMarker(),1800);
 }
}
function missionUpdate(){
 const m=missions[missionIndex];
 if(!m)return;
 markerRing.rotation.z+=.035;
 markerRing.scale.setScalar(1+Math.sin(performance.now()*.006)*.12);
 if(m.type==='reach'){
   const d=Math.hypot(hero.position.x-m.target.x,hero.position.z-m.target.z);
   document.getElementById('mProgress').textContent=Math.round(d)+'m away';
   if(d<3)missionComplete();
 }else if(m.type==='kills'){
   document.getElementById('mProgress').textContent=missionKills+' / '+m.target+' defeated';
   if(missionKills>=m.target)missionComplete();
 }else if(m.type==='rescue'){
   const d=Math.hypot(hero.position.x-m.target.x,hero.position.z-m.target.z);
   document.getElementById('mProgress').textContent=Math.round(d)+'m away';
   if(d<3)missionComplete();
 }
}
setMissionMarker();

function loop(){requestAnimationFrame(loop);if(run){if(window.WH_REAL_HERO){window.WH_REAL_HERO.position.x=hero.position.x;window.WH_REAL_HERO.position.y=hero.position.y;window.WH_REAL_HERO.position.z=hero.position.z;window.WH_REAL_HERO.rotation.y=Math.atan2(jx,-jy||.001);window.WH_REAL_HERO.position.y+=Math.sin(performance.now()*.009)*.018}hero.position.x+=jx*.28;hero.position.z+=-jy*.28;missionUpdate();vy-=.6;hero.position.y+=vy*.055;if(hero.position.y<=0){hero.position.y=0;vy=0;grounded=true}if(web){hero.position.y=Math.max(hero.position.y,.15);hero.position.z-=.12}hero.position.x=THREE.MathUtils.clamp(hero.position.x,-112,112);hero.position.z=THREE.MathUtils.clamp(hero.position.z,-112,112);cam.position.lerp(new THREE.Vector3(hero.position.x+3.2,hero.position.y+3.4,hero.position.z+7.8),.1);cam.lookAt(hero.position.x,hero.position.y+1.9,hero.position.z-3.5)}ren.render(scene,cam)}loop();addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();ren.setSize(innerWidth,innerHeight)})})();