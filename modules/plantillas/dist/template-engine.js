(function(root){
'use strict';
const Systems=typeof module==='object'?require('./system-engine.js'):root.HefestoSystems;
const Design=typeof module==='object'?require('./design-engine.js'):root.HefestoDesign;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validColor=v=>/^#[0-9a-f]{6}$/i.test(v||'');
function brand(pack,settings={}){return {name:String(settings.name||pack.brand.name).slice(0,80),headline:String(settings.headline||pack.brand.headline).slice(0,160),primary:validColor(settings.primary)?settings.primary:pack.brand.primary};}
function selection(catalog,pack,settings={},plan='basico',style='editorial'){
 if(!catalog.plans[plan])throw Error('Plan no válido');if(!catalog.styles.some(s=>s.id===style))throw Error('Estilo no válido');
 const enabled=catalog.plans[plan].systems;return {schema_version:catalog.schema_version,pack_id:pack.id,pack_version:pack.version,style_id:style,plan,brand:brand(pack,settings),origin:'owner',status:'draft',requires_owner_review:true,runtime_ai:false,systems:Object.fromEntries(Object.entries(pack.systems).filter(([key])=>enabled.includes(key))),pos_enabled:catalog.plans[plan].pos&&pack.modules.includes('pos'),deployment:{applied:false,requires_adapter:true,requires_backup:true},requirements:pack.requirements};
}
function render(pack,settings={},style='editorial',system='web',options={}){
 if(system==='web')return Design.render(pack,settings,style,system,options);
 return Systems.render(pack,brand(pack,settings),style,system,options);
}

root.HefestoEngine={esc,brand,selection,render};if(typeof module==='object')module.exports=root.HefestoEngine;
})(typeof window==='object'?window:globalThis);
