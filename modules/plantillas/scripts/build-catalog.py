from pathlib import Path
import json,sys
sys.path.insert(0,str(Path(__file__).parent))
from catalog_data import rows
r=Path(__file__).resolve().parents[1];d=r/'dist';packs=[]
profiles={
 'Alimentos':('menu',['Recibido','En preparación','Listo para retiro'],['Pedido','Retiro','Ingredientes']),
 'Comercio':('shop',['Consulta','Cotización','Pedido confirmado'],['Catálogo','Disponibilidad','Despacho']),
 'Cuidado personal':('booking',['Consulta','Hora propuesta','Confirmada'],['Servicios','Disponibilidad','Reagendar']),
 'Servicios profesionales':('service',['Consulta','Diagnóstico','Propuesta enviada'],['Alcance','Cotización','Seguimiento']),
 'Hogar y oficios':('service',['Solicitud','Visita técnica','Presupuesto enviado'],['Visita','Presupuesto','Seguimiento']),
 'Educación y bienestar':('course',['Interés','Orientación','Inscripción'],['Programa','Horarios','Inscripción']),
 'Turismo y eventos':('booking',['Consulta','Disponibilidad revisada','Propuesta enviada'],['Fechas','Disponibilidad','Cotización']),
 'Especializados':('shop',['Consulta','En evaluación','Propuesta enviada'],['Catálogo','Cotización','Seguimiento'])}
for line in rows.strip().splitlines():
 group,id,name,brand,headline,cats,items,cta,color=line.split('|');layout,stages,tags=profiles[group];cats=cats.split(',');items=items.split(',')
 if id=='inmobiliaria':layout='property'
 if id in ['reparacion-tech','lavanderia','imprenta']:layout='service'
 if id in ['minimarket','fruteria']:layout='shop'
 p={'id':id,'version':'1.0.0','name':name,'category':group,'origin':'owner','status':'draft','featured':id in ['minimarket','peluqueria','ferreteria','cafeteria','taller-mecanico','ropa'], 'layout':layout,'minimum_plan':'basico','tags':tags,'brand':{'name':brand,'headline':headline,'primary':color,'secondary':'#f2eee5','logo':None},'cta':cta,'categories':cats,'items':[{'id':f'{id}-{i+1}','name':v,'category':cats[i],'price':None,'published':False} for i,v in enumerate(items)],'stages':stages,'pages':['Inicio','Catálogo' if layout in ['shop','menu'] else 'Servicios','Nosotros','Contacto','Privacidad','Cookies'], 'modules':['website','catalog','crm']+(['inventory','pos'] if layout in ['shop','menu'] else ['requests']), 'requirements':[]}
 if layout in ['booking','course']:p['requirements'].append('Agenda y reservas requieren un módulo o servicio adicional; la plantilla incluye solicitudes, no reservas confirmadas.')
 if id=='nutricion':p['requirements'].append('Solo información pública y consultas generales. No incluye ficha clínica ni captura de datos de salud.')
 if id=='inmobiliaria':p['requirements'].append('Los inmuebles son ejemplos; no se publican direcciones ni propietarios reales.')
 p['systems']={
 'wordpress':{'format':'gutenberg-pattern','minimum_plan':'basico','pages':p['pages'],'navigation':p['pages'][:4],'pattern':f'hefesto/{id}','theme_compatibility':'Verificar con el tema instalado; usa bloques core.'},
 'woocommerce':{'format':'native-csv-draft','minimum_plan':'basico','sample_products':p['items'],'price_policy':'Sin precio hasta revisión','automatic_publish':False},
 'odoo':{'format':'configuration-blueprint-and-category-csv','minimum_plan':'basico','categories':cats,'pipeline':stages,'roles':['Administración','Ventas','Operación'],'pos_minimum_plan':'intermedio','taxes':{'automatic_configuration':False,'review_required':True},'electronic_invoicing_enabled':False,'compatibility':'Probar y mapear en la versión de Odoo instalada; no instala módulos ni roles.'},
 'chatwoot':{'format':'adapter-input-json','minimum_plan':'intermedio','labels':[f'{id}-{n}' for n in ['consulta','cotizacion','seguimiento']], 'canned_responses':[{'short_code':'bienvenida','content':f'Hola, gracias por contactar a {{{{business_name}}}}. ¿En qué podemos ayudarte sobre {name.lower()}?'},{'short_code':'disponibilidad','content':f'Podemos orientarte sobre {cats[0].lower()}, {cats[1].lower()} y {cats[2].lower()}. Indícanos qué necesitas.'},{'short_code':'seguimiento','content':'Recibimos tu consulta. Confirmaremos los próximos pasos por este mismo canal.'}], 'business_hours':None,'channels_enabled':[], 'automation_rules':[]},
 'invoiceninja':{'format':'document-blueprint','minimum_plan':'premium','document_type':'quote','sections':['Emisor','Cliente','Detalle','Subtotal','Impuestos por revisar','Condiciones'],'taxes':None,'electronic_invoicing_enabled':False,'sample_lines':items,'sender_legal_identity':None},
 'whatsapp':{'format':'proposals-for-review','minimum_plan':'intermedio','approved':False,'proposals':[{'name':id.replace('-','_')+'_actualizacion','category_proposed':'UTILITY','body':'Hola {{1}}, tenemos una actualización de tu solicitud {{2}} en {{3}}. Puedes consultarla en {{4}}.','note':'Requiere revisión, base de contacto y aprobación del proveedor; no se envía.'}]}}
 packs.append(p)
assert len(packs)==48 and len({p['id'] for p in packs})==48
catalog={'schema_version':'1.0.0','release':'2026-10-06','status':'draft-library','runtime_ai':False,'styles':[{'id':'editorial','name':'Editorial','description':'Tipografía protagonista y composición amplia.'},{'id':'boutique','name':'Boutique','description':'Portada centrada y presentación cuidada.'},{'id':'directo','name':'Directo','description':'Catálogo visible y navegación práctica.'}],'plans':{'basico':{'label':'Básico','systems':['wordpress','woocommerce','odoo'],'pos':False},'intermedio':{'label':'Intermedio','systems':['wordpress','woocommerce','odoo','chatwoot','whatsapp'],'pos':True},'premium':{'label':'Premium','systems':['wordpress','woocommerce','odoo','chatwoot','whatsapp','invoiceninja'],'pos':True}},'packs':packs}
(d/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
(d/'catalog.js').write_text('window.HEFESTO_CATALOG='+json.dumps(catalog,ensure_ascii=False)+';\n')
manifest=r/'.openai/hosting.json';v=json.loads(manifest.read_text());v['static']={'directory':'dist'};manifest.write_text(json.dumps(v,indent=2)+'\n')
print('Built 48 sector packs / 3 styles / 6 system blueprints per pack')
