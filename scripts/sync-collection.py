"""Publish the built library under the principal Site, without replacing its homepage."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
source=root/'modules/plantillas/dist';target=root/'dist/plantillas'
shutil.copytree(source,target,ignore=shutil.ignore_patterns('.openai'),dirs_exist_ok=True)
p=target/'index.html';s=p.read_text().replace('href="./"','href="../index.html"',1)
s=s.replace('<div class="breadcrumb">Hefesto Plataforma <span>/</span> Plantillas</div>','<nav class="breadcrumb unified-navigation" aria-label="Navegación Hefesto"><a href="../index.html">← Hefesto Studio</a><a href="../index.html#plataforma">Plataforma</a><a href="../index.html#planes">Planes</a><a href="../index.html#contacto">Contacto</a><strong>Plantillas</strong></nav>')
s=s.replace('<button id="brand-reset"','<a id="studio-inquiry" class="dark-button" href="../index.html#contacto">Consultar esta plantilla ↗</a><button id="brand-reset"',1)
p.write_text(s)
p=target/'app.js';s=p.read_text();s=s.replace("$('#color-value').textContent=$('#accent').value;","$('#studio-inquiry').href='../index.html?'+new URLSearchParams({plantilla:p.id,plan:$('#detail-plan').value})+'#contacto';$('#color-value').textContent=$('#accent').value;")
s=s.replace('applyTheme();render();',"applyTheme();const route=new URLSearchParams(location.search);if(Object.hasOwn(C.plans,route.get('plan')))$('#plan').value=route.get('plan');render();if(C.packs.some(p=>p.id===route.get('pack')))open(route.get('pack'));")
p.write_text(s)
p=target/'styles.css';p.write_text(p.read_text()+'''\n/* The collection belongs to Hefesto Studio. */\n.unified-navigation{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.unified-navigation a{text-decoration:none}.unified-navigation a:first-child{font-weight:600;color:var(--ink)}.unified-navigation strong{font-size:11px;font-weight:500;color:var(--accent)}.topbar{flex-wrap:wrap}.top-actions{margin-left:auto}.unified-navigation a:focus-visible{outline:2px solid var(--accent)}@media(max-width:1150px){.topbar .unified-navigation{display:flex;width:100%;font-size:11px;gap:16px}.topbar{justify-content:flex-start}.top-actions{margin-left:0}}@media(max-width:760px){.unified-navigation{justify-content:space-between;gap:10px}.unified-navigation a{padding:8px 0}.unified-navigation strong{display:none}}\n''')
print('Integrated library at dist/plantillas; principal homepage retained.')
