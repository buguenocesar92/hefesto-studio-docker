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

## Despliegue en Coolify (MVP Hefesto)

Coolify pone Traefik delante del contenedor, así que el `compose.yaml` está
preparado para ese flujo:

- No hay servicio Caddy interno: Traefik enruta el dominio al servicio `app`.
- Las credenciales se inyectan como variables del entorno directamente en el
  panel de Coolify. Variables obligatorias:
  - `APP_URL` (URL pública exacta, p. ej. `https://hefesto-studio.cl`).
  - `ADMIN_API_TOKEN` (mínimo 32 caracteres; el `app` no arranca sin él).
  - `PGPASSWORD` (Postgres del servicio `db` incluido).
- Opcionales con valor por defecto o vacío (no rompen el arranque):
  `PGDATABASE`, `PGUSER`, `N8N_CHAT_URL`, `N8N_CHAT_TOKEN`,
  `INVOICE_NINJA_URL`, `INVOICE_NINJA_TOKEN`. Sin n8n ni Invoice Ninja
  configurados el chat queda en `unconfigured` y el borrador de cotización
  responde 503 — esperado.
- El repositorio incluye `scripts/coolify-check.sh`, que verifica en local
  que el `compose.yaml` siga cumpliendo el contrato (sin `ports:` propios,
  sin `name:` raíz ni redes/volúmenes con `name:` fijo, etc.). Ejecútalo
  antes de cada cambio relevante al `compose.yaml`.

Para flujos no-Coolify (instalación local tradicional con Caddy incluido)
el camino anterior sigue disponible usando el `.env` privado y los pasos
de `portable/README.md`; ese modo coexiste sin conflictos.
