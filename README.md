# Edición Docker de Hefesto

Para instalar el sitio completo con PostgreSQL y conectores de servidor, comienza por [portable/README.md](portable/README.md). Credenciales e integraciones: [portable/INTEGRACIONES.md](portable/INTEGRACIONES.md). El archivo privado `.env` se entrega por separado.

# Hefesto Studio · Web unificada

La portada original está en `dist/index.html`. Conserva su identidad, animación 3D, presentación, demos, servicios, planes, integraciones, asistente, idiomas y páginas legales.

La biblioteca de 48 rubros forma parte del mismo sitio en `dist/plantillas/index.html`. No sustituye la portada. Los enlaces de selección retornan al contacto de Hefesto Studio. No se envía información ni se contratan servicios automáticamente.

## Editar y construir (Astro 7 + React 19 + Hefesto Scaffolding API)

El frontend de Hefesto Studio está construido sobre **Astro 7 + React 19** (`output: 'static'`) y genera `dist/` dinámicamente en cada despliegue consumiendo la API de **Hefesto Scaffolding** (`src/lib/hefesto-scaffolding.ts`) con fallback automático a los documentos JSON versionados en `content/`:

- **Portada unificada (`/`)**: [`src/pages/index.astro`](src/pages/index.astro) y [`src/components/studio/EcosystemSection.astro`](src/components/studio/EcosystemSection.astro).
- **Caso KraftDo (`/proyectos/kraftdo/`)**: [`src/pages/proyectos/kraftdo/index.astro`](src/pages/proyectos/kraftdo/index.astro) + [`src/components/studio/KraftdoPage.astro`](src/components/studio/KraftdoPage.astro).
- **Productos dinámicos (`/proyectos/[slug]/`)**: [`src/pages/proyectos/[slug].astro`](src/pages/proyectos/[slug].astro) (`ordenia`, `public-lead-finder` y nuevos productos publicados en Hefesto Scaffolding).
- **Soluciones del ecosistema con configurador React (`/soluciones/[id]/`)**: [`src/pages/soluciones/[id].astro`](src/pages/soluciones/[id].astro) + [`src/components/react/SolutionConfigurator.tsx`](src/components/react/SolutionConfigurator.tsx).
- **48 rubros con explorador React (`/rubros/[id]/`)**: [`src/pages/rubros/[id].astro`](src/pages/rubros/[id].astro) + [`src/components/react/RubroExplorer.tsx`](src/components/react/RubroExplorer.tsx).
- **Casos de estudio dinámicos (`/casos/[slug]/`)**: [`src/pages/casos/[slug].astro`](src/pages/casos/[slug].astro).
- **Legales (`/legal/[slug]/`)**: [`src/pages/legal/[slug]/index.html.ts`](src/pages/legal/[slug]/index.html.ts).
- **Galería interactiva de plantillas (`/plantillas/`)**: `modules/plantillas/src/` sincronizada automáticamente por `scripts/sync-collection.py`.

Para construir y verificar todo el sitio:

```sh
npm ci
npm run check
npm run build
npm test
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

Este compose ya no incluye Caddy ni publica puertos; para uso local sin
Coolify agrega un override propio que publique `app` (p. ej.
`ports: ["8080:3000"]`). Las variables `SITE_ADDRESS`, `HTTP_PORT` y
`HTTPS_PORT` de `portable/README.md` ya no aplican.
