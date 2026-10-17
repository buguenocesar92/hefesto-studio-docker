import * as THREE from 'three';
export function createScene(container,initialMotion){
 const host=container.querySelector('.three-host'),kind=container.dataset.scene;
 let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(0,.3,8.5);
 const accent=new THREE.Color(getComputedStyle(document.body).getPropertyValue('--accent').trim());
 const group=new THREE.Group();scene.add(group);const material=new THREE.MeshStandardMaterial({color:accent,metalness:.68,roughness:.27});const dark=new THREE.MeshStandardMaterial({color:0x1c2825,metalness:.5,roughness:.35});const white=new THREE.MeshStandardMaterial({color:0xe7eee0,metalness:.8,roughness:.22});
 const light=new THREE.DirectionalLight(0xffffff,5);light.position.set(4,5,6);scene.add(light);const edge=new THREE.DirectionalLight(accent,8);edge.position.set(-5,1,-2);scene.add(edge);scene.add(new THREE.HemisphereLight(0xffffff,0x283330,3));
 const add=(geometry,mat=material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);group.add(m);return m;};
 const pieces=[];
 if(kind==='device'){
  const base=add(new THREE.BoxGeometry(3.4,.14,2.25),white,0,-.65,.2);base.rotation.x=.05;
  const display=add(new THREE.BoxGeometry(3.3,2.15,.12),dark,0,.42,-.85);display.rotation.x=-.13;
  const screen=add(new THREE.PlaneGeometry(2.98,1.85),new THREE.MeshBasicMaterial({color:accent}),0,.42,-.765);screen.rotation.x=-.13;
  const grid=new THREE.GridHelper(2.8,12,0x222a23,0x456248);grid.rotation.x=Math.PI/2;grid.scale.z=.62;grid.position.set(0,.42,-.69);group.add(grid);
  for(let row=0;row<4;row++)for(let col=0;col<11;col++)add(new THREE.BoxGeometry(.19,.03,.15),dark,-1.35+col*.27,-.55,-.5+row*.21);
  add(new THREE.BoxGeometry(.85,.018,.42),dark,0,-.56,.73);group.rotation.set(.12,-.5,-.06);
 }else if(['gear','circuit','pipe'].includes(kind)){
  const rings=kind==='gear'?5:4;
  for(let i=0;i<rings;i++){const radius=1.3-Math.abs(i-2)*.18;const m=add(new THREE.TorusGeometry(radius,.15,20,72),i%2?white:material,0,(i-2)*.54,0);m.rotation.x=Math.PI/2;pieces.push(m);
   if(kind==='gear'&&i%2===0){for(let t=0;t<14;t++){const tooth=new THREE.Mesh(new THREE.BoxGeometry(.27,.24,.3),i===2?material:white);tooth.position.set(Math.cos(t*Math.PI/7)*radius,Math.sin(t*Math.PI/7)*radius,0);tooth.rotation.z=t*Math.PI/7;m.add(tooth);}}
  }group.rotation.set(.65,.1,-.3);
 }else if(kind==='rings'){
  for(let i=0;i<3;i++){const m=add(new THREE.TorusGeometry(1.35,.12,32,100),i===1?white:material);m.rotation.set(i*.85,i*.7,.4);pieces.push(m);}add(new THREE.IcosahedronGeometry(.32,1),white);group.rotation.z=.2;
 }else{
  const m=add(new THREE.TorusKnotGeometry(1.05,.31,144,20,2,3));pieces.push(m);const halo=add(new THREE.TorusGeometry(2,.013,8,120),white);halo.rotation.x=.65;halo.rotation.y=.3;
 }
 let moving=initialMotion,visible=true,inView=true,disposed=false,time=0,last=0,px=0,py=0;const initialRotation=group.rotation.clone();
 function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();render();}
 function render(){if(!disposed)renderer.render(scene,camera);}
 function tick(ms){if(disposed||!moving||!visible||!inView)return;const dt=Math.min((ms-(last||ms))/1000,.05);last=ms;time+=dt;group.rotation.y=initialRotation.y+Math.sin(time*.23)*.3+px*.22;group.rotation.x=initialRotation.x+Math.cos(time*.21)*.05+py*.12;group.position.y=Math.sin(time*.65)*.08;if(kind==='sculpture')pieces[0].rotation.z=time*.09;render();}
 function loop(){last=0;renderer.setAnimationLoop(moving&&visible&&inView?tick:null);render();}
 const ro=new ResizeObserver(resize);ro.observe(host);const io=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;loop();},{threshold:.01});io.observe(container);
 const pointer=e=>{const r=host.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;};container.addEventListener('pointermove',pointer);
 resize();container.classList.add('scene-ready');loop();
 return{setMotion(v){moving=v;loop();},setVisible(v){visible=v;loop();},dispose(){disposed=true;renderer.setAnimationLoop(null);ro.disconnect();io.disconnect();container.removeEventListener('pointermove',pointer);scene.traverse(o=>{o.geometry?.dispose();});material.dispose();dark.dispose();white.dispose();scene.traverse(o=>{if(o.material&&!Array.isArray(o.material))o.material.dispose();});renderer.dispose();renderer.domElement.remove();}};
}
