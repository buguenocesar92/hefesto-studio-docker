/* Render trusted, escaped templates in a real same-origin document.
   Never start animations in a hidden srcdoc or replace a live parser with document.write. */
(async()=>{
 'use strict';
 const query=new URLSearchParams(location.search),request=query.get('request');
 const signal=(status,message='')=>{if(parent!==window)parent.postMessage({type:'hefesto-preview',request,status,message},location.protocol==='file:'?'*':location.origin);};
 const bounded=(promise,ms)=>Promise.race([promise,new Promise(resolve=>setTimeout(resolve,ms))]);
 try{
  const pack=window.HEFESTO_CATALOG.packs.find(p=>p.id===query.get('pack'));
  if(!pack)throw Error('La plantilla solicitada no existe.');
  const style=['editorial','boutique','directo'].includes(query.get('style'))?query.get('style'):'editorial';
  const system=['web','gestion','atencion','documentos'].includes(query.get('system'))?query.get('system'):'web';
  const settings={};for(const key of ['name','headline','primary'])if(query.has(key))settings[key]=query.get(key);
  const html=window.HefestoEngine.render(pack,settings,style,system,{assetBase:new URL('assets/',location.href).href});
  const parsed=new DOMParser().parseFromString(html,'text/html'),scripts=[...parsed.querySelectorAll('script')].map(s=>({src:s.getAttribute('src'),text:s.textContent}));
  parsed.querySelectorAll('script').forEach(s=>s.remove());
  const links=[...parsed.querySelectorAll('link[rel=stylesheet]')];
  // Attach load handlers BEFORE adding resources. Cached CSS can load immediately.
  const cssLoads=links.map(link=>new Promise((resolve,reject)=>{link.addEventListener('load',resolve,{once:true});link.addEventListener('error',()=>reject(Error('No se pudieron cargar los estilos.')), {once:true});}));
  document.head.replaceChildren(...parsed.head.childNodes);
  document.documentElement.lang=parsed.documentElement.lang;
  document.body.replaceWith(parsed.body);
  await Promise.race([Promise.all(cssLoads),new Promise((_,reject)=>setTimeout(()=>reject(Error('Los estilos tardaron demasiado en cargar.')),10000))]);
  if(document.fonts)await bounded(document.fonts.ready,1500);
  // Start only after layout is present; observer-based enhancements remain optional.
  for(const spec of scripts){await new Promise((resolve,reject)=>{const script=document.createElement('script');if(spec.src){script.src=spec.src;script.async=false;script.onload=resolve;script.onerror=()=>reject(Error('No se pudo iniciar la interacción.'));}else script.textContent=spec.text;document.body.append(script);if(!spec.src)resolve();});}
  signal('ready');
 }catch(error){
  signal('error',error.message);
  document.body.replaceChildren();const main=document.createElement('main');main.style.cssText='padding:10vh 8%;font:16px/1.6 system-ui';const title=document.createElement('h1');title.textContent='No se pudo abrir el diseño';const note=document.createElement('p');note.textContent=error.message;const retry=document.createElement('button');retry.textContent='Reintentar';retry.onclick=()=>location.reload();const back=document.createElement('a');back.href='index.html';back.textContent=' Volver a las plantillas';main.append(title,note,retry,back);document.body.append(main);
 }
})();
