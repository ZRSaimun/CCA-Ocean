import * as THREE from 'three';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x02070c);
scene.fog=new THREE.FogExp2(0x031018,.015);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,2000);
camera.position.set(0,0,13);

const ambient=new THREE.HemisphereLight(0x9ce6ef,0x061016,1.3);scene.add(ambient);
const key=new THREE.DirectionalLight(0xd9f7ff,2.2);key.position.set(8,5,10);scene.add(key);
const rim=new THREE.PointLight(0x2ab2ce,35,50);rim.position.set(-8,-1,7);scene.add(rim);

const world=new THREE.Group();scene.add(world);

const earth=new THREE.Group();world.add(earth);
const textureLoader=new THREE.TextureLoader();
const earthTexture=textureLoader.load('https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg');
earthTexture.colorSpace=THREE.SRGBColorSpace;
earthTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const globe=new THREE.Mesh(
 new THREE.SphereGeometry(3.35,128,128),
 new THREE.MeshPhysicalMaterial({map:earthTexture,roughness:.72,metalness:0,clearcoat:.08,clearcoatRoughness:.65})
);earth.add(globe);
// A separate translucent cloud shell gives the planet depth without the artificial blue orbit ring.
const cloudCanvas=document.createElement('canvas');cloudCanvas.width=1024;cloudCanvas.height=512;
const cc=cloudCanvas.getContext('2d');const cloudImage=cc.createImageData(1024,512);
for(let y=0;y<512;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4;const n=(Math.sin(x*.031+Math.sin(y*.017)*4)+Math.sin(x*.071-y*.023)+Math.sin((x+y)*.013))*0.33;const a=Math.max(0,n-.18)*105;cloudImage.data[i]=255;cloudImage.data[i+1]=255;cloudImage.data[i+2]=255;cloudImage.data[i+3]=a}
cc.putImageData(cloudImage,0,0);const cloudTex=new THREE.CanvasTexture(cloudCanvas);
const clouds=new THREE.Mesh(new THREE.SphereGeometry(3.385,96,96),new THREE.MeshStandardMaterial({map:cloudTex,transparent:true,opacity:.38,depthWrite:false,roughness:1}));earth.add(clouds);
const atmosphere=new THREE.Mesh(
 new THREE.SphereGeometry(3.48,96,96),
 new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
 uniforms:{glowColor:{value:new THREE.Color(0x55b8d6)}},
 vertexShader:`varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`varying vec3 vNormal;uniform vec3 glowColor;void main(){float i=pow(0.68-dot(vNormal,vec3(0.,0.,1.)),3.2);gl_FragColor=vec4(glowColor,i*.55);}`})
);earth.add(atmosphere);
const nightRim=new THREE.PointLight(0x2c7b96,5,30);nightRim.position.set(-7,1,-3);earth.add(nightRim);

const starsGeo=new THREE.BufferGeometry();const starCount=1500;const pos=new Float32Array(starCount*3);for(let i=0;i<starCount;i++){const r=80+Math.random()*600;const t=Math.random()*Math.PI*2;const p=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(p)*Math.cos(t);pos[i*3+1]=r*Math.cos(p);pos[i*3+2]=r*Math.sin(p)*Math.sin(t)}starsGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x9ed6db,size:.18,transparent:true,opacity:.7,sizeAttenuation:true}));scene.add(stars);

const ocean=new THREE.Mesh(new THREE.PlaneGeometry(70,70,120,120),new THREE.MeshStandardMaterial({color:0x063d52,roughness:.22,metalness:.18,transparent:true,opacity:.92,side:THREE.DoubleSide}));ocean.rotation.x=-Math.PI/2;ocean.position.y=-6;world.add(ocean);
const oceanBase=ocean.geometry.attributes.position.array.slice();

const particlesGeo=new THREE.BufferGeometry();const count=900;const ppos=new Float32Array(count*3);for(let i=0;i<count;i++){ppos[i*3]=(Math.random()-.5)*42;ppos[i*3+1]=-8-Math.random()*30;ppos[i*3+2]=(Math.random()-.5)*32}particlesGeo.setAttribute('position',new THREE.BufferAttribute(ppos,3));const particles=new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:0x8cecf0,size:.035,transparent:true,opacity:.42}));world.add(particles);

const reef=new THREE.Group();reef.position.set(0,-28,0);world.add(reef);
const coralMat=new THREE.MeshStandardMaterial({color:0xc98265,roughness:.78,emissive:0x351916,emissiveIntensity:.35});const coralGold=new THREE.MeshStandardMaterial({color:0xc5a86d,roughness:.8,emissive:0x312513,emissiveIntensity:.3});
function branch(parent,x,y,z,len,rad,depth,mat){const g=new THREE.Mesh(new THREE.CylinderGeometry(rad*.72,rad, len,8),mat);g.position.set(x,y+len/2,z);g.rotation.z=(Math.random()-.5)*.55;g.rotation.x=(Math.random()-.5)*.35;parent.add(g);if(depth>0){for(let i=0;i<2+(Math.random()>.55?1:0);i++){const tip=new THREE.Group();tip.position.set(x+(Math.random()-.5)*len*.28,y+len*.92,z+(Math.random()-.5)*len*.28);parent.add(tip);branch(tip,0,0,0,len*.64,rad*.7,depth-1,mat)}}}
for(let i=0;i<18;i++){const g=new THREE.Group();g.position.set((Math.random()-.5)*16,0,(Math.random()-.5)*8);reef.add(g);branch(g,0,0,0,1.4+Math.random()*2,.16+Math.random()*.15,2,Math.random()>.45?coralMat:coralGold)}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60,40,40),new THREE.MeshStandardMaterial({color:0x0b2020,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.1;reef.add(floor);

const scanRing=new THREE.Mesh(new THREE.TorusGeometry(4.8,.018,8,180),new THREE.MeshBasicMaterial({color:0x75edf0,transparent:true,opacity:.0}));scanRing.rotation.x=Math.PI/2;reef.add(scanRing);

const sections=[...document.querySelectorAll('[data-scene]')];
let scrollY=0,progress=0;
function getSceneProgress(){const max=document.documentElement.scrollHeight-innerHeight;return max?scrollY/max:0}
function smoothstep(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}

function updateCamera(p){
  const a=smoothstep(0,.17,p),b=smoothstep(.14,.34,p),c=smoothstep(.30,.50,p),d=smoothstep(.46,.67,p),e=smoothstep(.63,.82,p),f=smoothstep(.80,1,p);
  if(p<.18){camera.position.set(lerp(0,2.4,a),lerp(.2,-.5,a),lerp(13,8.7,a));camera.lookAt(0,0,0);earth.position.set(lerp(2.2,.8,a),0,0)}
  else if(p<.36){camera.position.set(lerp(2.4,0,b),lerp(-.5,-5,b),lerp(8.7,7,b));camera.lookAt(0,-5,0);earth.position.y=lerp(0,-11,b)}
  else if(p<.54){camera.position.set(0,lerp(-5,-24,c),lerp(7,5,c));camera.lookAt(0,lerp(-8,-26,c),0);earth.position.y=-20}
  else if(p<.72){camera.position.set(lerp(0,5,d),lerp(-24,-27,d),lerp(5,9,d));camera.lookAt(0,-26,0)}
  else if(p<.88){camera.position.set(lerp(5,-3,e),lerp(-27,-24,e),lerp(9,6,e));camera.lookAt(0,-25,0)}
  else{camera.position.set(lerp(-3,0,f),lerp(-24,0,f),lerp(6,16,f));camera.lookAt(0,lerp(-25,0,f),0);earth.position.set(0,0,0)}
  const oceanVis=(p>.12&&p<.54)?1:0;ocean.material.opacity=lerp(ocean.material.opacity,oceanVis*.92,.08);
  reef.visible=p>.34&&p<.93;
  earth.visible=p<.28||p>.86;
  scanRing.material.opacity=p>.56&&p<.74?.6:0;
}

function animate(t){requestAnimationFrame(animate);const time=t*.001;scrollY=window.scrollY;progress=getSceneProgress();updateCamera(progress);earth.rotation.y=time*.035;clouds.rotation.y=time*.045;stars.rotation.y=time*.003;scanRing.scale.setScalar(1+Math.sin(time*2.3)*.08);scanRing.rotation.z=time*.3;
 const arr=ocean.geometry.attributes.position.array;for(let i=0;i<arr.length;i+=3){const x=oceanBase[i],y=oceanBase[i+1];arr[i+2]=Math.sin(x*.55+time*1.2)*.18+Math.cos(y*.42-time*.9)*.12}ocean.geometry.attributes.position.needsUpdate=true;ocean.geometry.computeVertexNormals();
 particles.rotation.y=time*.006;particles.position.y=Math.sin(time*.25)*.25;
 document.querySelector('#progressFill').style.height=`${progress*100}%`;
 const depth=Math.round(Math.max(0,Math.min(34,(progress-.28)*120)));document.querySelector('#depthValue').textContent=depth;
 renderer.render(scene,camera)}
requestAnimationFrame(animate);

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

const slider=document.querySelector('#visionSlider'),divider=document.querySelector('#demoDivider'),after=document.querySelector('.demo-after'),demo=document.querySelector('#visionDemo'),label=document.querySelector('#demoLabel');
slider.addEventListener('input',e=>{const v=e.target.value;divider.style.left=`${v}%`;after.style.clipPath=`inset(0 0 0 ${v}%)`});
document.querySelector('#colourMode').addEventListener('click',()=>{demo.classList.remove('mask');label.textContent='RAW ↔ NORMALISED VIEW';document.querySelector('#colourMode').classList.add('chip--active');document.querySelector('#maskMode').classList.remove('chip--active')});
document.querySelector('#maskMode').addEventListener('click',()=>{demo.classList.add('mask');label.textContent='STYLISED SEMANTIC OVERLAY';document.querySelector('#maskMode').classList.add('chip--active');document.querySelector('#colourMode').classList.remove('chip--active')});

let audioCtx=null,osc=null,gain=null;document.querySelector('#soundToggle').addEventListener('click',async e=>{const on=e.currentTarget.getAttribute('aria-pressed')==='true';if(on){gain?.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.4);setTimeout(()=>{osc?.stop();osc=null},450);e.currentTarget.setAttribute('aria-pressed','false');e.currentTarget.textContent='SOUND OFF'}else{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();osc=audioCtx.createOscillator();gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=58;gain.gain.value=.0001;osc.connect(gain).connect(audioCtx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.018,audioCtx.currentTime+.8);e.currentTarget.setAttribute('aria-pressed','true');e.currentTarget.textContent='SOUND ON'}});

window.addEventListener('load',()=>setTimeout(()=>document.querySelector('#loader').classList.add('is-hidden'),650));

// Interactive field discoveries — inspired by spatial storytelling, grounded in the CCA Ocean narrative.
const discoveryData={
 biodiversity:{title:'A dense web of reef life',text:'Coral reefs occupy a very small fraction of the ocean floor yet provide habitat for an extraordinary diversity of marine life. Reef condition therefore matters far beyond a single coral colony.'},
 stress:{title:'Stress can become visible',text:'Thermal stress can cause corals to expel their symbiotic algae, producing bleaching. Repeated or severe stress can reduce survival, making consistent observation important.'},
 vision:{title:'Water changes what a camera sees',text:'Colour attenuation, low contrast, blur and visually similar coral classes complicate underwater image interpretation — the visual problem addressed by the CCA-Net research direction.'}
};
document.querySelectorAll('.hotspot').forEach(btn=>btn.addEventListener('click',()=>{
 const d=discoveryData[btn.dataset.hotspot]; if(!d)return;
 document.querySelector('#discoveryTitle').textContent=d.title;
 document.querySelector('#discoveryText').textContent=d.text;
 document.querySelectorAll('.hotspot').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');
}));
const scanButton=document.querySelector('#scanMode');
if(scanButton)scanButton.addEventListener('click',()=>{
 const box=document.querySelector('#visionDemo'),status=document.querySelector('#scanStatus');
 box.classList.remove('is-scanning');void box.offsetWidth;box.classList.add('is-scanning');status.textContent='SCANNING';
 setTimeout(()=>{box.classList.add('mask');status.textContent='BOUNDARIES / MASK';document.querySelector('#maskMode')?.classList.add('chip--active')},1150);
 setTimeout(()=>{status.textContent='SCAN COMPLETE';box.classList.remove('is-scanning')},2350);
});
const chapterObserver=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-near',e.isIntersecting)),{threshold:.35});
document.querySelectorAll('.chapter').forEach(x=>chapterObserver.observe(x));


// Deep-ocean two-state research light.
const deepLightStage=document.querySelector('#deepLightStage');
const deepLightToggle=document.querySelector('#deepLightToggle');
if(deepLightStage&&deepLightToggle){
 const state=document.querySelector('#lightState'),caption=document.querySelector('#lightCaption');
 deepLightToggle.addEventListener('click',()=>{
   const on=deepLightToggle.getAttribute('aria-pressed')==='true';
   deepLightToggle.setAttribute('aria-pressed',String(!on));
   deepLightStage.classList.toggle('lights-on',!on);
   state.textContent=!on?'ILLUMINATED STATE':'LOW-LIGHT STATE';
   caption.textContent=!on?'Research light · revealed structure · stronger colour information':'Ambient visibility · silhouettes · low colour information';
 });
}
