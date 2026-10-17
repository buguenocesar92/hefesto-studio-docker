import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),motion=document.querySelector('.motion-toggle');
let enabled=!reduced.matches,context,observer,threeController=null,live=true;
const selected=new Set(),dialog=document.querySelector('#request-dialog'),notice=document.querySelector('#notice');let noticeTimer;
function notify(text){notice.textContent=text;notice.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.classList.remove('visible'),2600);}
function renderSelection(){document.querySelectorAll('[data-count]').forEach(x=>x.textContent=selected.size);const holder=document.querySelector('#chosen-items');holder.replaceChildren();if(!selected.size){const p=document.createElement('p');p.textContent='Puedes preparar tu consulta sin seleccionar una opción.';holder.append(p);}for(const item of selected){const row=document.createElement('div'),label=document.createElement('span'),button=document.createElement('button');label.textContent=item;button.type='button';button.textContent='Quitar';button.addEventListener('click',()=>{selected.delete(item);renderSelection();});row.append(label,button);holder.append(row);}document.querySelectorAll('[data-add]').forEach(b=>{const added=selected.has(b.dataset.add);b.setAttribute('aria-pressed',added);b.querySelector('span').textContent=added?'Agregado a mi consulta':'Agregar a mi consulta';});}
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>{selected.has(b.dataset.add)?selected.delete(b.dataset.add):selected.add(b.dataset.add);renderSelection();notify(selected.has(b.dataset.add)?'Agregado a tu consulta.':'Opción retirada.');}));
document.querySelectorAll('[data-request]').forEach(b=>b.addEventListener('click',()=>{renderSelection();document.querySelector('#result').textContent='';dialog.showModal();}));
document.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelector('#enquiry').addEventListener('submit',e=>{e.preventDefault();document.querySelector('#result').textContent=`Consulta de ejemplo preparada${selected.size?' con '+selected.size+' opciones':''}. No se ha enviado información.`;});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('[data-category]').forEach(x=>{x.hidden=b.dataset.filter!=='all'&&x.dataset.category!==b.dataset.filter;});if(enabled)gsap.fromTo('.offer-card:not([hidden])',{y:15,opacity:.35},{y:0,opacity:1,duration:.45,stagger:.07,clearProps:'transform,opacity'});ScrollTrigger.refresh();}));
function startAnimations(){if(context)context.revert();if(observer)observer.disconnect();threeController?.setMotion(enabled);motion.setAttribute('aria-pressed',String(enabled));motion.innerHTML=enabled?'Ⅱ <span>Movimiento activo</span>':'▶ <span>Movimiento pausado</span>';if(!enabled)return;
context=gsap.context(()=>{
 gsap.from('.site-header',{y:-15,opacity:0,duration:.7,clearProps:'all'});
 gsap.from('.hero h1 .word>span',{yPercent:110,rotate:3,duration:1.1,stagger:.045,ease:'power4.out',clearProps:'all'});
 gsap.from('.hero-kicker,.hero-lead,.hero .cta,.status-line',{y:20,opacity:0,duration:.8,delay:.25,stagger:.09,clearProps:'all'});
 gsap.from('.hero .hero-photo',{scale:1.1,duration:1.6,ease:'power2.out',clearProps:'transform'});
 gsap.from('.hero .art-shape',{scale:.85,rotate:-10,transformOrigin:'50% 50%',duration:1.2,ease:'power3.out'});
 gsap.to('.round-stamp',{rotation:'+=360',duration:65,repeat:-1,ease:'none'});
 gsap.to('.hero .art-shape',{y:-12,rotation:2,duration:4,repeat:-1,yoyo:true,ease:'sine.inOut'});
 const track=document.querySelector('.marquee-track');if(track){gsap.to(track,{xPercent:-50,duration:42,repeat:-1,ease:'none'});}
 gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.3}});
 document.querySelectorAll('.story-media,.chapter-photo').forEach(el=>{const image=el.querySelector('img');if(image)gsap.fromTo(image,{yPercent:-5,scale:1.14},{yPercent:5,scale:1.14,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:.8}});});
 observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;gsap.fromTo(entry.target,{y:38,opacity:.25},{y:0,opacity:1,duration:.85,ease:'power3.out',clearProps:'all'});observer.unobserve(entry.target);}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));
 });
}
motion.addEventListener('click',()=>{enabled=!enabled;startAnimations();});reduced.addEventListener('change',()=>{enabled=!reduced.matches;startAnimations();});
document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!enabled||!fine.matches)return;const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.15,y:(e.clientY-r.top-r.height/2)*.2,duration:.35});});el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.5,ease:'power3.out'}));});
startAnimations();
const scene=document.querySelector('[data-scene]');if(scene){import('./three-scene.js').then(({createScene})=>{if(!live)return;threeController=createScene(scene,enabled);}).catch(()=>{});}
document.addEventListener('visibilitychange',()=>{if(document.hidden)gsap.globalTimeline.pause();else gsap.globalTimeline.resume();threeController?.setVisible(!document.hidden);});
window.addEventListener('pagehide',()=>{live=false;context?.revert();observer?.disconnect();threeController?.dispose();gsap.globalTimeline.clear();},{once:true});
// Detailed product/service sheet, kept local to this demonstration.
const itemDialog=document.querySelector('#item-dialog');let detailTitle='';
if(itemDialog){
 document.querySelectorAll('[data-detail-title]').forEach(button=>button.addEventListener('click',()=>{
  detailTitle=button.dataset.detailTitle;
  document.querySelector('#item-title').textContent=detailTitle;
  document.querySelector('#item-category').textContent=button.dataset.detailCategory;
  document.querySelector('#item-description').textContent=button.dataset.detailDescription;
  document.querySelector('#item-note').textContent=button.dataset.detailNote;
  itemDialog.showModal();
 }));
 document.querySelector('[data-item-close]').addEventListener('click',()=>itemDialog.close());
 document.querySelector('[data-item-select]').addEventListener('click',()=>{selected.add(detailTitle);renderSelection();itemDialog.close();notify('Agregado a tu consulta.');});
 itemDialog.addEventListener('click',event=>{if(event.target!==itemDialog)return;const r=itemDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)itemDialog.close();});
}
if(document.fonts)document.fonts.ready.then(()=>{if(live)ScrollTrigger.refresh();});
// Intent exploration: one visible panel and a local enquiry handoff.
document.querySelectorAll('[data-discover]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-discover]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelectorAll('[data-discovery-slide]').forEach(panel=>panel.hidden=panel.dataset.discoverySlide!==button.dataset.discover);
 if(enabled)gsap.fromTo('.discovery-slide:not([hidden])',{opacity:0,y:12},{opacity:1,y:0,duration:.4,clearProps:'all'});
 ScrollTrigger.refresh();
}));
document.querySelectorAll('[data-intent]').forEach(button=>button.addEventListener('click',()=>{
 renderSelection();document.querySelector('#result').textContent='';const message=document.querySelector('#enquiry textarea');if(!message.value)message.value='Me interesa el enfoque: '+button.dataset.intent+'.';dialog.showModal();
}));
const mobileMenu=document.querySelector('#mobile-menu'),mobileToggle=document.querySelector('.mobile-menu-toggle');
if(mobileMenu&&mobileToggle){
 mobileToggle.addEventListener('click',()=>mobileMenu.showModal());
 mobileMenu.querySelector('[data-menu-close]').addEventListener('click',()=>mobileMenu.close());
 mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.close()));
 mobileMenu.querySelector('[data-menu-request]').addEventListener('click',()=>{mobileMenu.close();renderSelection();document.querySelector('#result').textContent='';dialog.showModal();});
}
// Image recovery remains visible and never depends on changing preview tabs.
let imageRefresh;
function refreshImageLayout(){clearTimeout(imageRefresh);imageRefresh=setTimeout(()=>{if(live)ScrollTrigger.refresh();},100);}
document.querySelectorAll('img').forEach(img=>{
 const fail=()=>{
  if(!img.dataset.retried&&!img.src.startsWith('data:')){img.dataset.retried='true';const url=new URL(img.src,location.href);url.searchParams.set('retry','1');img.src=url.href;return;}
  if(img.dataset.unavailable)return;img.dataset.unavailable='true';img.hidden=true;
  const placeholder=document.createElement('div');placeholder.className='image-unavailable';placeholder.setAttribute('role','img');placeholder.setAttribute('aria-label',img.alt||'Imagen no disponible');
  const mark=document.createElement('span');mark.textContent='Imagen no disponible · '+(img.alt||'Referencia visual');placeholder.append(mark);img.parentElement.append(placeholder);refreshImageLayout();
 };
 img.addEventListener('load',refreshImageLayout);img.addEventListener('error',fail);
 if(img.complete&&!img.naturalWidth)fail();
});
document.querySelector('#enquiry').addEventListener('submit',()=>{document.querySelector('.request-export').hidden=false;});
document.querySelector('[data-request-download]').addEventListener('click',()=>{
 const name=document.querySelector('#enquiry input[name=name]').value,message=document.querySelector('#enquiry textarea').value;
 const text=['CONSULTA DE EJEMPLO — SIN ENVÍO',document.title,'Nombre: '+name,'Selección: '+([...selected].join(', ')||'Sin opciones elegidas'),'Mensaje: '+message].join('\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='mi-consulta.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
