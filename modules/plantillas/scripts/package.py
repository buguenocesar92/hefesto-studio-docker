from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json
root=Path(__file__).resolve().parents[1];dist=root/'dist';out=dist/'downloads';out.mkdir(exist_ok=True)
catalog=json.loads((dist/'catalog.json').read_text());by_id={p['id']:p for p in catalog['packs']}
shared=['components.css','system.css','system-runtime.js','GENERATED-IMAGES.md','fonts.css','experience.js','experience.js.LEGAL.txt','tailwind.css','THIRD-PARTY-NOTICES.md']
for p in sorted((dist/'packs').iterdir()):
 with ZipFile(out/(p.name+'.zip'),'w',ZIP_DEFLATED) as z:
  for f in sorted(p.rglob('*')):
   if not f.is_file():continue
   name=str(f.relative_to(p.parent))
   if f.suffix=='.html':z.writestr(name,f.read_text().replace('../../assets/','assets/'))
   else:z.write(f,name)
  for name in shared:
   if (dist/'assets'/name).exists():z.write(dist/'assets'/name,p.name+'/assets/'+name)
  photo=by_id[p.name]['design']['photo']
  if photo:z.write(dist/'assets'/'photos'/(photo+'.webp'),p.name+'/assets/photos/'+photo+'.webp')
with ZipFile(out/'hefesto-wordpress-patterns.zip','w',ZIP_DEFLATED) as z:
 for f in (dist/'integration'/'hefesto-patterns').iterdir():z.write(f,'hefesto-patterns/'+f.name)
with ZipFile(out/'hefesto-packs.zip','w',ZIP_DEFLATED) as z:
 for folder in ['packs','integration']:
  for f in sorted((dist/folder).rglob('*')):
   if not f.is_file():continue
   name=str(f.relative_to(dist))
   if f.suffix=='.html':z.writestr(name,f.read_text().replace('../../assets/','../../gallery/assets/'))
   else:z.write(f,name)
 z.write(dist/'catalog.json','catalog.json')
 for f in sorted(dist.rglob('*')):
  if not f.is_file() or any(x in ['packs','integration','downloads'] for x in f.relative_to(dist).parts):continue
  name='gallery/'+str(f.relative_to(dist))
  if f.name=='app.js':z.writestr(name,f.read_text().replace('`downloads/${p.id}.zip`','`https://hefesto-studio.cbm3lla.chatgpt.site/plantillas/downloads/${p.id}.zip`'))
  elif f.name=='index.html':z.writestr(name,f.read_text().replace('href="downloads/','href="https://hefesto-studio.cbm3lla.chatgpt.site/plantillas/downloads/'))
  else:z.write(f,name)
 for f in sorted((root/'src').rglob('*')):
  if f.is_file():z.write(f,'source/src/'+str(f.relative_to(root/'src')))
 for f in sorted((root/'integration').glob('*')):
  if f.is_file():z.write(f,'source/integration/'+f.name)
 z.write(root/'package.json','source/package.json');z.write(root/'package-lock.json','source/package-lock.json')
 for f in sorted((root/'scripts').glob('*')):
  if f.is_file():z.write(f,'source/scripts/'+f.name)
 z.writestr('source/README.md','# Editar y recompilar\n\nCopia ../gallery como dist dentro de esta carpeta y copia ../integration a dist/integration. Ejecuta npm install y npm run build. La primera construcción regenera los packs y ZIP. Abre dist/index.html para revisar. No incluye configuración de hosting ni credenciales.\n\nOriginales: src/directions.cjs (dirección por rubro), src/design-engine.js (HTML), src/design.css, src/experience.js (GSAP), src/three-scene.js (3D).\n')
 z.writestr('LEEME.md','# Hefesto Design Collection · Vol. 02\n\n48 rubros, 12 familias visuales, tres tratamientos por rubro.\n\n- Abre gallery/index.html para explorar las vistas sin instalar dependencias.\n- packs/ contiene los HTML y bases de integración. Conserva gallery/assets junto al resto del paquete: contiene fotos y librerías locales.\n- Las descargas desde la galería offline apuntan al sitio; todos los packs ya están descomprimidos en packs/.\n- source/src contiene los originales de diseño, animación GSAP y escenas Three.js; los recursos compilados están en gallery/assets.\n- Lee integration/README.md para Laravel, WordPress y los otros sistemas.\n\nLas fotos son referencias visuales, no productos reales ni trabajos propios. Créditos y licencias: gallery/assets/THIRD-PARTY-NOTICES.md.\n\nLas vistas son demos, no instalaciones completas ni pasarelas de pago.\n')
print('Biblioteca:',round((out/'hefesto-packs.zip').stat().st_size/1024/1024,2),'MiB; 48 ZIP individuales con recursos locales.')
