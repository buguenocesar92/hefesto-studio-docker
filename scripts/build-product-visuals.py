from pathlib import Path
from html import escape
out=Path('dist/proyectos/assets')
def text(x,y,s,size=18,fill='#b7c1d3',weight=400):return f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{fill}" font-weight="{weight}">{escape(s)}</text>'
def rect(x,y,w,h,fill,rx=10,stroke='none'):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}"/>'
for product in ['ordenia','public-lead-finder']:
 lead=product!='ordenia';bg='#101827' if lead else '#f6f8f5';panel='#192335' if lead else '#ffffff';ink='#e9eef8' if lead else '#283d39';muted='#95a4bc' if lead else '#74897b';accent='#7ba5ff' if lead else '#2f7454';line='#29394e' if lead else '#dfe7df'
 s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="930" viewBox="0 0 1440 930" role="img"><title>{product} — visualización ilustrativa con datos de ejemplo</title>'+rect(0,0,1440,930,bg,20)+rect(0,0,1440,56,panel,0)
 for x,col in [(27,'#ee7e6b'),(48,'#e2b85d'),(69,'#79b58e')]:s+=f'<circle cx="{x}" cy="28" r="5" fill="{col}"/>'
 s+=text(570,34,'VISTA ILUSTRATIVA · DATOS DE EJEMPLO',12,muted)+rect(0,56,238,874,panel,0)+text(27,115,'LEAD FINDER' if lead else 'ordenia',25,ink,700)+text(28,146,'HEFESTO / PRODUCT' if lead else 'TU ESPACIO MENTAL',10,muted)
 nav=['Resumen','Búsquedas','Negocios','Listas','Importar','Exportaciones'] if lead else ['Mi resumen','Bandeja','Eventos','Tareas','Compras','Notas']
 for i,n in enumerate(nav):
  y=215+i*57
  if i==0:s+=rect(16,y-28,205,43,line,7)
  s+=text(34,y,n,15,ink if i==0 else muted)
 s+=rect(22,733,195,135,bg,10)+text(40,765,'Datos con contexto.' if lead else 'Un mensaje.',16,ink,600)+text(40,793,'Fuentes verificables.' if lead else 'Todo en orden.',16,ink,600)+text(40,839,'Hecho con Hefesto',11,muted)
 s+=text(282,117,'Tu próxima oportunidad empieza aquí.' if lead else 'Dale espacio a lo que importa.',31,ink,600)+text(282,152,'Descubre negocios. Revisa sus fuentes. Organiza tus resultados.' if lead else 'Ideas, pendientes y recuerdos, en un solo lugar.',16,muted)
 if lead:
  s+=rect(280,189,1116,108,panel,12,line)+text(304,218,'NUEVA BÚSQUEDA',10,muted)+rect(304,233,376,44,bg,7)+text(320,261,'Restaurantes',16,ink)+rect(699,233,374,44,bg,7)+text(715,261,'Rancagua, Chile',16,ink)+rect(1093,233,279,44,accent,7)+text(1115,261,'Previsualizar búsqueda →',15,'#101827',600)
  for i,(label,value) in enumerate([('Fuentes','Trazables'),('Duplicados','Unificados'),('Exportación','CSV / XLSX')]):
   x=280+i*378;s+=rect(x,324,359,98,panel,10,line)+text(x+23,357,label,12,muted)+text(x+23,393,value,26,ink,600)
  s+=rect(280,449,1116,392,panel,12,line)+text(305,490,'Negocios encontrados',21,ink,600)+text(305,532,'NEGOCIO',11,muted)+text(725,532,'CONTACTOS PÚBLICOS',11,muted)+text(1090,532,'FUENTE',11,muted)
  for i,(a,b) in enumerate([('Restaurante de ejemplo','Sitio web · Teléfono'),('Cafetería de ejemplo','Email comercial · Web'),('Tienda de ejemplo','WhatsApp · Sitio web'),('Estudio de ejemplo','Email comercial · Teléfono')]):
   y=580+i*63;s+=f'<path d="M305 {y-25}H1370" stroke="{line}"/>'+text(305,y,a,16,ink)+text(725,y,b,14,muted)+text(1090,y,'Ver procedencia ↗',13,accent)
 else:
  s+=rect(280,192,1116,191,panel,12,line)+text(306,229,'¿Qué tienes en mente?',19,ink,600)+text(306,276,'Hacer ejercicio mañana, comprar café y guardar una idea para mi proyecto…',18,muted)+rect(1180,317,186,43,accent,7)+text(1213,345,'Organizar ↗',15,'white',600)+text(307,347,'Clasificación por reglas · categorías personales',12,muted)
  for i,(label,tag,entry) in enumerate([('Eventos','Salud / Citas','Consulta el jueves'),('Tareas','Salud / Ejercicio','Hacer ejercicio'),('Compras','Hogar / Compras','Comprar café'),('Notas','Trabajo / Ideas','Idea para mi proyecto')]):
   x=280+(i%2)*568;y=415+(i//2)*213;s+=rect(x,y,548,190,panel,12,line)+text(x+25,y+39,label,20,ink,600)+text(x+25,y+91,entry,17,ink)+rect(x+25,y+113,236,28,bg,5)+text(x+36,y+132,tag,11,muted)+text(x+25,y+168,'Ver '+label.lower()+' →',12,accent)
 s+=text(280,895,'Representación del flujo del producto. No es una captura de una cuenta real.',12,muted)+'</svg>';out.joinpath(product+'.svg').write_text(s)
