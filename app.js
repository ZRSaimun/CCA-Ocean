import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
const composer=new EffectComposer(renderer);

const scene=new THREE.Scene();
const spaceColor=new THREE.Color(0x02070c),surfaceFogColor=new THREE.Color(0x031018),shallowWaterColor=new THREE.Color(0x052b33),deepWaterColor=new THREE.Color(0x01151d);
scene.background=spaceColor.clone();
scene.fog=new THREE.FogExp2(0x031018,.015);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,2000);
camera.position.set(0,0,13);
const renderPass=new RenderPass(scene,camera),bloomPass=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.28,.7,.86),outputPass=new OutputPass();composer.addPass(renderPass);composer.addPass(bloomPass);composer.addPass(outputPass);

const ambient=new THREE.HemisphereLight(0x9ce6ef,0x061016,1.3);scene.add(ambient);
const key=new THREE.DirectionalLight(0xd9f7ff,2.2);key.position.set(8,5,10);scene.add(key);
const rim=new THREE.PointLight(0x2ab2ce,35,50);rim.position.set(-8,-1,7);scene.add(rim);

const world=new THREE.Group();scene.add(world);const QualityManager={mode:'auto',frames:0,last:performance.now(),fps:60,active:'balanced',levels:{cinematic:{ratio:2,particles:true,shafts:true},balanced:{ratio:1.5,particles:true,shafts:true},efficient:{ratio:1,particles:false,shafts:false}},apply(level){this.active=level;const q=this.levels[level];renderer.setPixelRatio(Math.min(devicePixelRatio,q.ratio));renderer.setSize(innerWidth,innerHeight,false);composer.setPixelRatio(Math.min(devicePixelRatio,q.ratio));composer.setSize(innerWidth,innerHeight);document.body.dataset.quality=level;if(typeof particles!=='undefined')particles.visible=q.particles;if(typeof shafts!=='undefined')shafts.visible=q.shafts;const b=document.querySelector('#qualityToggle');if(b)b.textContent='QUALITY · '+(this.mode==='auto'?'AUTO / ':'')+level.toUpperCase()},tick(now){if(this.mode!=='auto')return;this.frames++;if(now-this.last>2500){this.fps=this.frames*1000/(now-this.last);this.frames=0;this.last=now;if(this.fps<42&&this.active!=='efficient')this.apply(this.active==='cinematic'?'balanced':'efficient');else if(this.fps>57&&this.active==='balanced')this.apply('cinematic')}}};

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
const sun=new THREE.DirectionalLight(0xfff2d6,3.4);sun.position.set(12,4,9);scene.add(sun);
const earthHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),g=x.createRadialGradient(128,128,42,128,128,128);g.addColorStop(0,'rgba(74,174,206,.18)');g.addColorStop(.55,'rgba(36,113,156,.07)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)})(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));earthHalo.scale.set(9.4,9.4,1);earthHalo.position.z=-.45;earth.add(earthHalo);

const starsGeo=new THREE.BufferGeometry();const starCount=1500;const pos=new Float32Array(starCount*3);for(let i=0;i<starCount;i++){const r=80+Math.random()*600;const t=Math.random()*Math.PI*2;const p=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(p)*Math.cos(t);pos[i*3+1]=r*Math.cos(p);pos[i*3+2]=r*Math.sin(p)*Math.sin(t)}starsGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x9ed6db,size:.18,transparent:true,opacity:.7,sizeAttenuation:true}));scene.add(stars);

const oceanUniforms={uTime:{value:0},uDeep:{value:new THREE.Color(0x011b2a)},uShallow:{value:new THREE.Color(0x08758b)},uSky:{value:new THREE.Color(0x8adce3)},uCameraY:{value:0}};
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(80,80,180,180),new THREE.ShaderMaterial({
 uniforms:oceanUniforms,transparent:true,side:THREE.DoubleSide,
 vertexShader:`
 uniform float uTime;varying vec3 vWorld;varying float vWave;
 void main(){vec3 p=position;float w=sin(p.x*.34+uTime*1.15)*.34+sin(p.y*.51-uTime*.82)*.20+sin((p.x+p.y)*.18+uTime*.55)*.16;p.z+=w;vWave=w;vec4 wp=modelMatrix*vec4(p,1.);vWorld=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
 fragmentShader:`
 uniform float uTime;uniform float uCameraY;uniform vec3 uDeep;uniform vec3 uShallow;uniform vec3 uSky;varying vec3 vWorld;varying float vWave;
 void main(){vec3 V=normalize(cameraPosition-vWorld);float fres=pow(1.-abs(dot(V,vec3(0.,1.,0.))),3.);float ripple=.5+.5*sin(vWorld.x*1.7+vWorld.z*1.25+uTime*1.7);vec3 base=mix(uDeep,uShallow,clamp(vWave+0.48,0.,1.));vec3 col=mix(base,uSky,fres*.58);float subsurface=smoothstep(-8.,-5.,uCameraY);col+=uShallow*max(vWave,0.)*.09*subsurface;col+=ripple*.025;gl_FragColor=vec4(col,.94);}`
}));ocean.rotation.x=-Math.PI/2;ocean.position.y=-6;world.add(ocean);

// Volumetric underwater shafts and current streaks.
const shafts=new THREE.Group();world.add(shafts);
for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(2.4+i*.35,22,32,1,true),new THREE.MeshBasicMaterial({color:0x74dbe4,transparent:true,opacity:.018+(i%3)*.008,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.position.set(-12+i*4,-17,-4+(i%2)*3);m.rotation.z=(i-3)*.035;shafts.add(m)}
const currentGeo=new THREE.BufferGeometry(),currentCount=220,currentPos=new Float32Array(currentCount*3);
for(let i=0;i<currentCount;i++){currentPos[i*3]=(Math.random()-.5)*50;currentPos[i*3+1]=-10-Math.random()*28;currentPos[i*3+2]=(Math.random()-.5)*30}
currentGeo.setAttribute('position',new THREE.BufferAttribute(currentPos,3));
const currents=new THREE.Points(currentGeo,new THREE.PointsMaterial({color:0xb5f5f2,size:.055,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false}));world.add(currents);
const causticPlane=new THREE.Mesh(new THREE.PlaneGeometry(44,30,1,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float uTime;void main(){vec2 p=vUv*12.;float a=sin(p.x+sin(p.y*.8+uTime)*2.)+sin(p.y*1.3+sin(p.x+uTime*.7)*1.7);float c=smoothstep(1.45,1.9,a);gl_FragColor=vec4(.35,.9,.92,c*.13);}`}));causticPlane.rotation.x=-Math.PI/2;causticPlane.position.set(0,-27,0);world.add(causticPlane);
const particlesGeo=new THREE.BufferGeometry();const count=900;const ppos=new Float32Array(count*3);for(let i=0;i<count;i++){ppos[i*3]=(Math.random()-.5)*42;ppos[i*3+1]=-8-Math.random()*30;ppos[i*3+2]=(Math.random()-.5)*32}particlesGeo.setAttribute('position',new THREE.BufferAttribute(ppos,3));const particles=new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:0x8cecf0,size:.035,transparent:true,opacity:.42}));world.add(particles);

const reef=new THREE.Group();reef.position.set(0,-28,0);world.add(reef);
// Multi-form procedural reef: branching, massive and plate corals with rock/sand structure.
const coralPalette=[0xb86f5b,0xd19a72,0xb8a06c,0x7c9678,0x9d6f7d].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.86,metalness:0,emissive:new THREE.Color(c).multiplyScalar(.09),emissiveIntensity:.32}));
function branch(parent,x,y,z,len,rad,depth,mat){const g=new THREE.Mesh(new THREE.CylinderGeometry(rad*.7,rad,len,7),mat);g.position.set(x,y+len/2,z);g.rotation.z=(Math.random()-.5)*.62;g.rotation.x=(Math.random()-.5)*.38;parent.add(g);if(depth>0)for(let i=0;i<2+(Math.random()>.68?1:0);i++){const tip=new THREE.Group();tip.position.set(x+(Math.random()-.5)*len*.24,y+len*.9,z+(Math.random()-.5)*len*.24);parent.add(tip);branch(tip,0,0,0,len*.62,rad*.68,depth-1,mat)}}
function massiveCoral(parent,s,mat){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(s,2),mat);m.scale.set(1,.58,1);m.position.y=s*.48;m.rotation.y=Math.random()*6.28;parent.add(m)}
function plateCoral(parent,s,mat){for(let k=0;k<3;k++){const p=new THREE.Mesh(new THREE.CylinderGeometry(s*(.62+k*.16),s*(.48+k*.14),.12,18),mat);p.position.set((Math.random()-.5)*.35,.3+k*.38,(Math.random()-.5)*.3);p.rotation.z=(Math.random()-.5)*.16;parent.add(p)}}
for(let i=0;i<46;i++){const g=new THREE.Group();g.position.set((Math.random()-.5)*25,0,(Math.random()-.5)*15);g.rotation.y=Math.random()*6.28;reef.add(g);const mat=coralPalette[i%coralPalette.length],kind=i%5;if(kind<2)branch(g,0,0,0,1.1+Math.random()*2,.12+Math.random()*.14,2,mat);else if(kind<4)massiveCoral(g,.55+Math.random()*1.25,mat);else plateCoral(g,.65+Math.random()*.8,mat)}
const rockMat=new THREE.MeshStandardMaterial({color:0x263b37,roughness:1});
for(let i=0;i<34;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.5+Math.random()*1.4,1),rockMat);r.position.set((Math.random()-.5)*30,.15,(Math.random()-.5)*18);r.scale.y=.35+Math.random()*.45;r.rotation.set(Math.random(),Math.random()*6.28,Math.random()*.3);reef.add(r)}
const floorGeo=new THREE.PlaneGeometry(60,60,48,48);const fp=floorGeo.attributes.position;for(let i=0;i<fp.count;i++){const x=fp.getX(i),y=fp.getY(i);fp.setZ(i,Math.sin(x*.28)*.13+Math.cos(y*.31)*.1+Math.sin((x+y)*.13)*.08)}floorGeo.computeVertexNormals();
const floor=new THREE.Mesh(floorGeo,new THREE.MeshStandardMaterial({color:0x102a27,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.18;reef.add(floor);
// Spatial CCA-Net overlay lives in the reef itself.
const researchVision=new THREE.Group();reef.add(researchVision);
const scanPlane=new THREE.Mesh(new THREE.PlaneGeometry(18,8),new THREE.MeshBasicMaterial({color:0x68e3df,transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));scanPlane.rotation.y=Math.PI/2;researchVision.add(scanPlane);
const boundaryCloud=new THREE.Group();researchVision.add(boundaryCloud);
for(let i=0;i<24;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.45+Math.random()*.85,.018,6,32),new THREE.MeshBasicMaterial({color:i%3===0?0xf0c785:0x6fe7e2,transparent:true,opacity:.0,depthWrite:false}));ring.position.set((Math.random()-.5)*14,.4+Math.random()*3.8,(Math.random()-.5)*8);ring.rotation.x=Math.PI/2+(Math.random()-.5)*.5;boundaryCloud.add(ring)}
// Asset-ready reef layer. Local GLB/GLTF assets can be added without making the experience dependent on a remote host.
const reefAssetLayer=new THREE.Group();reef.add(reefAssetLayer);
const gltfLoader=new GLTFLoader(),dracoLoader=new DRACOLoader();dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/');gltfLoader.setDRACOLoader(dracoLoader);
const reefAssetManifest=[
 {url:'./assets/models/coral-branching.glb',position:[-5,.1,-2],scale:1.8},
 {url:'./assets/models/coral-massive.glb',position:[3,.1,-3],scale:2.1},
 {url:'./assets/models/coral-plate.glb',position:[6,.1,2],scale:1.65}
];
let loadedReefAssets=0;
reefAssetManifest.forEach(item=>gltfLoader.load(item.url,g=>{const root=g.scene;root.position.set(...item.position);root.scale.setScalar(item.scale);root.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.material.roughness=Math.max(.68,o.material.roughness??.8)}});reefAssetLayer.add(root);loadedReefAssets++;},undefined,()=>{}));
// Lightweight schooling silhouettes add scale and parallax to the reef.
const fishSchool=new THREE.Group();fishSchool.position.set(0,-21,-5);world.add(fishSchool);
const fishGeo=new THREE.BufferGeometry();fishGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.34,0,0,.12,.13,0,.12,-.13,0,.12,0,0,.38,.18,0,.38,-.18,0],3));fishGeo.setIndex([0,1,2,3,4,5]);
const fishMat=new THREE.MeshBasicMaterial({color:0x6aa5aa,transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
for(let i=0;i<26;i++){const f=new THREE.Mesh(fishGeo,fishMat.clone());f.position.set((Math.random()-.5)*28,(Math.random()-.5)*10,(Math.random()-.5)*18);f.scale.setScalar(.45+Math.random()*1.2);f.userData.speed=.45+Math.random()*.7;f.userData.phase=Math.random()*6.28;fishSchool.add(f)}
// Bioluminescent deep-water field: restrained until the camera reaches the deeper section.
const bioGeo=new THREE.BufferGeometry(),bioCount=180,bioPos=new Float32Array(bioCount*3);
for(let i=0;i<bioCount;i++){bioPos[i*3]=(Math.random()-.5)*34;bioPos[i*3+1]=-12-Math.random()*20;bioPos[i*3+2]=(Math.random()-.5)*24}
bioGeo.setAttribute('position',new THREE.BufferAttribute(bioPos,3));
const biolume=new THREE.Points(bioGeo,new THREE.PointsMaterial({color:0x6fffe8,size:.045,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));world.add(biolume);
// Research light behaves like a real scene light rather than only a DOM state.
const researchLight=new THREE.SpotLight(0xb9ffff,0,42,Math.PI*.16,.55,1.4);researchLight.position.set(1,-18,8);researchLight.target.position.set(0,-27,0);world.add(researchLight,researchLight.target);
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
  const oceanVis=(p>.12&&p<.54)?1:0;ocean.visible=oceanVis>.02;
  reef.visible=p>.34&&p<.93;
  earth.visible=p<.28||p>.86;
  scanRing.material.opacity=p>.56&&p<.74?.6:0;
}

function animate(t){requestAnimationFrame(animate);QualityManager.tick(t);const time=t*.001;scrollY=window.scrollY;progress=getSceneProgress();updateCamera(progress);const submerged=progress>.285&&progress<.88;document.body.classList.toggle('is-submerged',submerged);document.body.classList.toggle('research-vision-active',progress>.57&&progress<.84);
 const waterDepth=submerged?THREE.MathUtils.clamp((-camera.position.y-6)/22,0,1):0,targetFog=submerged?lerp(.019,.043,waterDepth):.015;
 scene.fog.density=lerp(scene.fog.density,targetFog,.04);scene.fog.color.lerp(submerged?(waterDepth>.48?deepWaterColor:shallowWaterColor):surfaceFogColor,.04);scene.background.lerp(submerged?(waterDepth>.5?deepWaterColor:shallowWaterColor):spaceColor,.025);
 ambient.intensity=lerp(ambient.intensity,submerged?lerp(1.0,.42,waterDepth):1.3,.04);key.intensity=lerp(key.intensity,submerged?lerp(1.5,.38,waterDepth):2.2,.04);rim.intensity=lerp(rim.intensity,submerged?lerp(30,16,waterDepth):35,.04);
 renderer.toneMappingExposure=lerp(renderer.toneMappingExposure,submerged?lerp(.92,.68,waterDepth):1.05,.03);earth.rotation.y=time*.035;clouds.rotation.y=time*.045;stars.rotation.y=time*.003;
 oceanUniforms.uTime.value=time;oceanUniforms.uCameraY.value=camera.position.y;causticPlane.material.uniforms.uTime.value=time*.65;
 shafts.children.forEach((s,i)=>{s.rotation.z=(i-3)*.035+Math.sin(time*.22+i)*.018;s.material.opacity=.018+(i%3)*.008+Math.sin(time*.35+i)*.004});
 fishSchool.children.forEach((f,i)=>{f.position.x+=.008*f.userData.speed;f.position.y+=Math.sin(time*1.1+f.userData.phase)*.0018;if(f.position.x>15)f.position.x=-15;f.rotation.z=Math.sin(time*.7+f.userData.phase)*.05});
 reef.rotation.y=Math.sin(time*.13)*.025;
 const cp=currents.geometry.attributes.position;for(let i=0;i<cp.count;i++){cp.array[i*3]+=.004+.002*Math.sin(time+i);if(cp.array[i*3]>25)cp.array[i*3]=-25}cp.needsUpdate=true;scanRing.scale.setScalar(1+Math.sin(time*2.3)*.08);scanRing.rotation.z=time*.3;
 const rv=progress>.57&&progress<.84;researchVision.visible=rv;
 const deep=smoothstep(.34,.52,progress)*(1-smoothstep(.72,.84,progress));biolume.material.opacity=.04+deep*.36;biolume.rotation.y=time*.012;biolume.position.y=Math.sin(time*.18)*.22;
 researchLight.intensity=rv?38:deep*7;researchLight.position.x=Math.sin(time*.23)*4;researchLight.position.z=7+Math.cos(time*.19)*2;if(rv){scanPlane.position.x=((time*2.2)%18)-9;scanPlane.material.opacity=.035+Math.sin(time*3)*.012;boundaryCloud.children.forEach((r,i)=>{r.material.opacity=.16+.18*(.5+.5*Math.sin(time*2+i));r.rotation.z=time*.08+i})}

 particles.rotation.y=time*.006;particles.position.y=Math.sin(time*.25)*.25;
 if(earth.visible){earthHalo.material.opacity=.7+.12*Math.sin(time*.25);sun.intensity=3.2+.25*Math.sin(time*.12)}
 document.querySelector('#progressFill').style.height=`${progress*100}%`;
 const depth=Math.round(Math.max(0,Math.min(34,(progress-.28)*120)));document.querySelector('#depthValue').textContent=depth;
 bloomPass.strength=submerged?.34:.2;
 if(audioCtx&&audioSources.length){audioFilter.frequency.setTargetAtTime(submerged?620:6500,audioCtx.currentTime,.16);audioMaster.gain.setTargetAtTime(submerged?.042:.026,audioCtx.currentTime,.2);audioSources[0].frequency.setTargetAtTime(submerged?38:47,audioCtx.currentTime,.3)}
 composer.render()}
requestAnimationFrame(animate);

addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});const qualityButton=document.querySelector('#qualityToggle');if(qualityButton){const order=['cinematic','balanced','efficient'];qualityButton.addEventListener('click',()=>{QualityManager.mode='manual';QualityManager.apply(order[(order.indexOf(QualityManager.active)+1)%order.length])});QualityManager.apply(matchMedia('(max-width: 800px)').matches?'efficient':'balanced');}

const slider=document.querySelector('#visionSlider'),divider=document.querySelector('#demoDivider'),after=document.querySelector('.demo-after'),demo=document.querySelector('#visionDemo'),label=document.querySelector('#demoLabel');
slider.addEventListener('input',e=>{const v=e.target.value;divider.style.left=`${v}%`;after.style.clipPath=`inset(0 0 0 ${v}%)`});
document.querySelector('#colourMode').addEventListener('click',()=>{demo.classList.remove('mask');label.textContent='RAW ↔ NORMALISED VIEW';document.querySelector('#colourMode').classList.add('chip--active');document.querySelector('#maskMode').classList.remove('chip--active')});
document.querySelector('#maskMode').addEventListener('click',()=>{demo.classList.add('mask');label.textContent='STYLISED SEMANTIC OVERLAY';document.querySelector('#maskMode').classList.add('chip--active');document.querySelector('#colourMode').classList.remove('chip--active')});

let audioCtx=null,audioMaster=null,audioFilter=null,audioSources=[];
function stopOceanAudio(){if(!audioCtx)return;audioMaster.gain.setTargetAtTime(.0001,audioCtx.currentTime,.18);setTimeout(()=>{audioSources.forEach(s=>{try{s.stop()}catch{}});audioSources=[]},500)}
function startOceanAudio(){audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioMaster=audioCtx.createGain();audioFilter=audioCtx.createBiquadFilter();audioFilter.type='lowpass';audioFilter.frequency.value=9000;audioMaster.gain.value=.0001;audioFilter.connect(audioMaster).connect(audioCtx.destination);
 const deep=audioCtx.createOscillator(),drift=audioCtx.createOscillator(),deepGain=audioCtx.createGain(),driftGain=audioCtx.createGain();deep.type='sine';deep.frequency.value=43;deepGain.gain.value=.32;drift.type='sine';drift.frequency.value=91;driftGain.gain.value=.045;deep.connect(deepGain).connect(audioFilter);drift.connect(driftGain).connect(audioFilter);deep.start();drift.start();audioSources=[deep,drift];audioMaster.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.9)}
document.querySelector('#soundToggle').addEventListener('click',async e=>{const on=e.currentTarget.getAttribute('aria-pressed')==='true';if(on){stopOceanAudio();e.currentTarget.setAttribute('aria-pressed','false');e.currentTarget.textContent='SOUND OFF'}else{startOceanAudio();e.currentTarget.setAttribute('aria-pressed','true');e.currentTarget.textContent='SOUND ON'}});

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


// Ambient water interface: lightweight DOM particles + pointer disturbance.
const bubbleField=document.querySelector('#waterBubbles');
if(bubbleField){
 const frag=document.createDocumentFragment();
 const count=matchMedia('(max-width: 800px)').matches?10:22;
 for(let i=0;i<count;i++){const b=document.createElement('i');b.className='water-ui__bubble';
  b.style.left=((i*47)%101)+'%';b.style.setProperty('--s',(3+(i*7)%11)+'px');
  b.style.setProperty('--d',(10+(i*3)%13)+'s');b.style.setProperty('--delay',(-((i*1.7)%16))+'s');
  b.style.setProperty('--drift',((-45+(i*29)%90))+'px');frag.appendChild(b)}
 bubbleField.appendChild(frag);
}
const waterCursor=document.querySelector('#waterCursor');
if(waterCursor&&!matchMedia('(pointer: coarse)').matches){
 let tx=innerWidth/2,ty=innerHeight/2,cx=tx,cy=ty;
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;document.body.classList.add('has-pointer')},{passive:true});
 const follow=()=>{cx+=(tx-cx)*.09;cy+=(ty-cy)*.09;waterCursor.style.left=cx+'px';waterCursor.style.top=cy+'px';requestAnimationFrame(follow)};follow();
}


// CCA-Net Research Dive — staged explanatory visualisation.
const lab=document.querySelector('#researchLab');
if(lab){
 const stages=[
  {key:'raw',label:'RAW UNDERWATER FRAME',kicker:'THE VISUAL PROBLEM',title:'Water changes what the model sees.',text:'Underwater imagery can show poor colour consistency, low contrast and blur. Fine-grained coral classes can also look visually similar, making reliable pixel-level interpretation difficult.',active:0},
  {key:'normalise',label:'UCN / COLOUR NORMALISATION',kicker:'STAGE 01 · UCN',title:'First, stabilise the colour information.',text:'CCA-Net includes an Underwater Colour Normalisation component before semantic interpretation. This stage visualises the research idea of reducing underwater colour inconsistency so downstream features receive a more stable representation.',active:1},
  {key:'features',label:'SEGFORMER MiT-B2 / FEATURES',kicker:'STAGE 02 · ENCODER',title:'Read the reef at multiple scales.',text:'The SegFormer MiT-B2 encoder provides the semantic feature representation. Here the grid is an explanatory view of multi-scale scene information — not a literal display of model activations.',active:2},
  {key:'boundary',label:'BAR / BOUNDARY AWARENESS',kicker:'STAGE 03 · BAR DECODER',title:'The edge of a coral matters.',text:'The Boundary-Aware Refinement decoder is designed to produce semantic masks together with boundary information, targeting the difficult interfaces between visually similar coral regions.',active:3},
  {key:'mask',label:'FINE-GRAINED SEMANTIC MASK',kicker:'STAGE 04 · OUTPUT',title:'From pixels to a structured reef map.',text:'The final visual state represents fine-grained semantic segmentation. CCA-Net also uses hierarchical coarse supervision and a composite training objective combining cross-entropy, Dice, boundary BCE and coarse-segmentation losses.',active:4}
 ];
 let n=0;const dots=[...document.querySelectorAll('[data-lab-stage]')],arch=[...document.querySelectorAll('#labArchitecture span')];
 const render=(i)=>{n=(i+stages.length)%stages.length;const s=stages[n];lab.dataset.stage=s.key;lab.classList.remove('is-transitioning');void lab.offsetWidth;lab.classList.add('is-transitioning');
  document.querySelector('#labStageNo').textContent=String(n+1).padStart(2,'0')+' / 05';document.querySelector('#labStageLabel').textContent=s.label;document.querySelector('#labKicker').textContent=s.kicker;document.querySelector('#labTitle').textContent=s.title;document.querySelector('#labText').textContent=s.text;
  dots.forEach((d,k)=>d.classList.toggle('active',k===n));arch.forEach((a,k)=>a.classList.toggle('active',k<=s.active));
 };
 document.querySelector('#labPrev')?.addEventListener('click',()=>render(n-1));document.querySelector('#labNext')?.addEventListener('click',()=>render(n+1));dots.forEach((d,i)=>d.addEventListener('click',()=>render(i)));render(0);
}
