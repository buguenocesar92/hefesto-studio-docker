'use strict';
const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),C=require('../dist/catalog.json'),E=require('../dist/template-engine.js');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function setup(html,url='https://example.test/'){
 const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 w.matchMedia=q=>({matches:q.includes('reduced-motion'),addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
 w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.scrollTo=()=>{};w.print=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.URL.createObjectURL=()=> 'blob:mock';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){w.lastDownload=this.download};return dom;
}
function finish(dom){dom.window.dispatchEvent(new dom.window.Event('pagehide'));dom.window.close();}
async function run(){
 const dom=setup(read('index.html')),w=dom.window,d=w.document;
 for(const f of ['catalog.js','design-engine.js','system-engine.js','template-engine.js','app.js'])w.eval(read(f));
 assert.equal(d.querySelectorAll('.template-card').length,12);
 const originalCards=[...d.querySelectorAll('.template-card')],originalFrames=originalCards.map(card=>card.querySelector('iframe')),originalWindows=originalFrames.map(frame=>frame.contentWindow);
 for(const count of [24,36,48]){d.querySelector('#load-more').click();assert.equal(d.querySelectorAll('.template-card').length,count);for(let i=0;i<12;i++){assert.equal(d.querySelectorAll('.template-card')[i],originalCards[i],'load more preserves card nodes');assert.equal(originalCards[i].querySelector('iframe'),originalFrames[i]);assert.equal(originalFrames[i].contentWindow,originalWindows[i],'load more preserves iframe context');}}
 assert.ok(d.querySelector('#load-more').hidden);d.querySelector('#reset').click();assert.equal(d.querySelectorAll('.template-card').length,12);
 d.querySelector('#style-filter').value='boutique';d.querySelector('#style-filter').dispatchEvent(new w.Event('change'));assert.equal(d.querySelectorAll('.template-card').length,12);assert.ok(d.querySelector('.thumb-frame').src.includes('boutique'));
 d.querySelector('#reset').click();

 assert.equal(d.querySelector('.thumb-frame').getAttribute('sandbox'),'allow-same-origin');
 const frame=d.querySelector('#preview'),setter=Object.getOwnPropertyDescriptor(w.HTMLIFrameElement.prototype,'src');
 Object.defineProperty(frame,'src',{get(){return setter.get.call(this)},set(value){if(value!=='about:blank')assert.ok(d.querySelector('#detail').open,'frame must load after dialog opens');setter.set.call(this,value)}});
 for(const id of ['cafeteria','arquitectura','tecnologia']){
  d.querySelector(`[data-open="${id}"]`).click();assert.equal(frame.getAttribute('srcdoc'),null);assert.equal(frame.getAttribute('sandbox'),null);
  let url=new URL(frame.src);assert.equal(url.searchParams.get('pack'),id);assert.equal(url.searchParams.get('system'),'web');assert.equal(url.origin,w.location.origin);assert.equal(frame.getAttribute('aria-busy'),'true');
  const post=(request,status,source=frame.contentWindow)=>w.dispatchEvent(new w.MessageEvent('message',{source,origin:w.location.origin,data:{type:'hefesto-preview',request,status}}));
  post('stale','ready');assert.ok(!d.querySelector('#preview-state').hidden);
  post(url.searchParams.get('request'),'ready',w);assert.ok(!d.querySelector('#preview-state').hidden);
  post(url.searchParams.get('request'),'ready');assert.ok(d.querySelector('#preview-state').hidden);assert.equal(frame.getAttribute('aria-busy'),'false');
  for(const system of ['gestion','atencion','documentos','web']){d.querySelector(`[data-system="${system}"]`).click();url=new URL(frame.src);assert.equal(url.searchParams.get('system'),system);post(url.searchParams.get('request'),'ready');}
  const before=url.searchParams.get('request');post(before,'error');assert.ok(!d.querySelector('#preview-retry').hidden);d.querySelector('#preview-retry').click();assert.notEqual(new URL(frame.src).searchParams.get('request'),before);
  d.querySelector('#detail').close();assert.equal(frame.src,'about:blank');
 }
 finish(dom);
 let checked=0;
 for(const pack of C.packs){for(const system of ['web','gestion','atencion','documentos']){
  const html=E.render(pack,{},'editorial',system),demo=setup(html),dw=demo.window,doc=dw.document,q=s=>doc.querySelector(s);
  if(system!=='web'){const cfg=require('../dist/design-engine.js').directions[pack.id];assert.equal(doc.body.style.getPropertyValue('--paper'),cfg[3]);assert.equal(doc.body.style.getPropertyValue('--accent'),pack.brand.primary);assert.ok(doc.body.classList.contains('brand-'+cfg[0]));const custom=setup(E.render(pack,{primary:'#123456',name:'Mi marca'},'boutique',system));assert.equal(custom.window.document.body.style.getPropertyValue('--accent'),'#123456');assert.equal(custom.window.document.body.dataset.business,'Mi marca');finish(custom);}
  const ids=[...doc.querySelectorAll('[id]')].map(n=>n.id);assert.equal(ids.length,new Set(ids).size,pack.id+' duplicate ids');
  for(const el of doc.querySelectorAll('img[src],script[src],link[href]')){const ref=el.getAttribute('src')||el.getAttribute('href');assert.ok(fs.existsSync(path.resolve(root,'packs',pack.id,ref.split('?')[0])),ref);}
  if(system==='web'){
   q('[data-scene]')?.removeAttribute('data-scene');dw.eval(read('assets/experience.js'));
   q('[data-add]').click();assert.equal(q('[data-count]').textContent,'1');
   q('[data-detail-title]').click();assert.ok(q('#item-dialog').open);q('[data-item-close]').click();
   q('.mobile-menu-toggle').click();assert.ok(q('#mobile-menu').open);q('[data-menu-request]').click();assert.ok(q('#request-dialog').open);assert.ok(!q('#mobile-menu').open);
   q('input[name=name]').value='Prueba';q('#enquiry').dispatchEvent(new dw.Event('submit',{bubbles:true,cancelable:true}));assert.ok(!q('.request-export').hidden);q('[data-request-download]').click();assert.equal(dw.lastDownload,'mi-consulta.txt');
   const filter=doc.querySelectorAll('[data-filter]')[1];filter.click();assert.equal(doc.querySelectorAll('.offer-card:not([hidden])').length,1);
   assert.equal(q('.motion-toggle').getAttribute('aria-pressed'),'false');assert.equal(doc.querySelectorAll('.practical details').length,2);
   const image=q('img');if(image){image.dispatchEvent(new dw.Event('error'));assert.equal(image.dataset.retried,'true');image.dispatchEvent(new dw.Event('error'));assert.ok(image.hidden);assert.ok(q('.image-unavailable'));}
  }else{
   dw.eval(read('assets/system-runtime.js'));
   if(system==='gestion'){const select=q('[data-stage-select]');select.value='2';select.dispatchEvent(new dw.Event('change'));assert.equal(doc.querySelectorAll('[data-stage="2"] [data-task]').length,2);q('#work-search').value='no-match-xyz';q('#work-search').dispatchEvent(new dw.Event('input'));assert.ok(!q('#work-empty').hidden);}
   if(system==='atencion'){q('[data-reply]').click();assert.ok(q('#reply-text').value);q('#reply-form').dispatchEvent(new dw.Event('submit',{cancelable:true}));assert.equal(doc.querySelectorAll('.message-out').length,2);assert.equal(q('#reply-text').value,'');}
   if(system==='documentos'){q('[data-price]').value='1250';q('[data-qty]').value='2';q('[data-price]').dispatchEvent(new dw.Event('input'));assert.ok(q('[data-line-total]').textContent.includes('2.500'));q('[data-price]').value='-1';q('[data-price]').dispatchEvent(new dw.Event('input'));assert.equal(q('[data-line-total]').textContent,'Por definir');q('[data-quote-download]').click();assert.equal(dw.lastDownload,'cotizacion-borrador.json');}
  }
  finish(demo);checked++;
 }}
 // Exercise the real demo loader without a browser/network: CSS and runtime readiness order.
 for(const system of ['web','gestion','atencion','documentos']){
  const d=setup(read('demo.html'),`https://example.test/demo.html?pack=cafeteria&system=${system}`),w=d.window;
  for(const f of ['catalog.js','design-engine.js','system-engine.js','template-engine.js'])w.eval(read(f));
  const pending=w.eval(read('demo.js'));let links=[...w.document.querySelectorAll('link[rel=stylesheet]')];assert.ok(links.length>=3);assert.equal(w.document.querySelectorAll('body script').length,0,'runtime waits for CSS');
  links.forEach(link=>link.dispatchEvent(new w.Event('load')));await new Promise(r=>setImmediate(r));
  const runtime=w.document.querySelector('body script');assert.ok(runtime,'runtime starts after CSS');runtime.dispatchEvent(new w.Event('load'));await pending;
  assert.ok(!w.document.body.textContent.includes('No se pudo abrir el diseño'));finish(d);
 }
 const broken=setup(read('demo.html'),'https://example.test/demo.html?pack=cafeteria');for(const f of ['catalog.js','design-engine.js','system-engine.js','template-engine.js'])broken.window.eval(read(f));const failed=broken.window.eval(read('demo.js'));broken.window.document.querySelector('link').dispatchEvent(new broken.window.Event('error'));await failed;assert.ok(broken.window.document.body.textContent.includes('No se pudo abrir el diseño'));finish(broken);
 console.log(`PASS: incremental pagination identity, shared branding, initial opening, ready/error/retry/stale messages, ${checked} interactive system views, resource paths, photo fallback and demo startup order.`);
}
run().catch(error=>{console.error(error);process.exitCode=1;});
