# Edición Docker de Hefesto

Para instalar el sitio completo con PostgreSQL y conectores de servidor, comienza por [portable/README.md](portable/README.md). Credenciales e integraciones: [portable/INTEGRACIONES.md](portable/INTEGRACIONES.md). El archivo privado `.env` se entrega por separado.

# Hefesto Studio · Web unificada

La portada original está en `dist/index.html`. Conserva su identidad, animación 3D, presentación, demos, servicios, planes, integraciones, asistente, idiomas y páginas legales.

La biblioteca de 48 rubros forma parte del mismo sitio en `dist/plantillas/index.html`. No sustituye la portada. Los enlaces de selección retornan al contacto de Hefesto Studio. No se envía información ni se contratan servicios automáticamente.

## Editar

- Portada: `dist/index.html`, `dist/unified.css`, `dist/unified.js`.
- Legales: `dist/legal/`.
- Plantillas: `modules/plantillas/src/`.
- Galería base: `modules/plantillas/dist/index.html`, `app.js` y `styles.css`.

Para reconstruir la colección:

```sh
cd modules/plantillas
npm ci
npm run build
npm test
cd ../..
python3 scripts/sync-collection.py
```

El último paso sincroniza la colección con el sitio y agrega navegación y enlaces al contacto; nunca reemplaza la portada. Sirve `dist/` desde un servidor HTTP local o tu hosting. Las descargas de packs se regeneran al construir.

Las vistas de sistemas son demostraciones locales. No se modifica ninguna instalación externa. El sitio principal conserva su audiencia pública; no incorpora CV adjuntos ni credenciales.
