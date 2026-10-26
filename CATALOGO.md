# CATALOGO.md — Hefesto Studio

**Single Source of Truth del ecosistema Hefesto.** Registro vivo: se actualiza en el mismo commit que el cambio que altera el estado de algo.

- **Verificado en:** 2026-10-26 (America/Santiago) contra el servidor `xeon`.
- **Alcance:** repos `hefesto-*` de `~/Dev/personal` (cuenta GitHub `buguenocesar92`).
- **Fuera de alcance:** bloque municipal `~/Dev/muni` (tiene runtime; se trata con criterio distinto — ver §8).

---

## 0. Cómo leer este documento

Cada ítem declara **exactamente uno** de estos tres estados. Presentar uno como otro es el error que más se repite en este ecosistema.

| Estado | Significado | Qué lo prueba |
|---|---|---|
| `IMPLEMENTADO` | El código existe escrito en el repo, versionado. | El archivo está en el árbol de git de la rama indicada. |
| `VERIFICADO-RUNTIME` | Probado de verdad: hay proceso o contenedor respondiendo. | Un comando de §9 que devuelve el resultado esperado ahora. |
| `PLANIFICADO` | Diseñado o especificado, sin implementación real. | Solo hay plan/spec/README, o el repo no existe. |

> **Regla dura.** `IMPLEMENTADO` no implica desplegado. Un compose en el repo no es un contenedor corriendo. Un plan en `docs/superpowers/plans/` no es código. La fuente de los planes/specs de Hefesto Portal es `docs/superpowers/` — si algo solo aparece ahí, es `PLANIFICADO`.

### Estados heredados que se corrigen aquí

La premisa heredada «nada de este bloque ha corrido en runtime» **es falsa en su GENERALIDAD** y se corrige: hay dos apps Hefesto con runtime parcial o total (ver §4). Sigue siendo cierta para **los 54 kits self-hosted**: ninguno tiene contenedor ni servicio activo.

---

## 1. Resumen ejecutivo verificado

Cifras obtenidas por comandos reproducibles de §12, no por estimación.

| Métrica | Valor | Evidencia |
|---|---|---|
| Directorios `hefesto-*` en `~/Dev/personal` | **97** | `ls -d hefesto-*/ \| wc -l` |
| De ellos, repos git (con `.git`) | **83** | conteo de `[ -d "$d/.git" ]` |
| Sin `.git` (worktrees o dirs sin versionar) | **14** | listado en §3.3 |
| Clasificación: plataforma / verticales / kits | **25 / 18 / 54** | regla determinista en §12.4 |
| Kits en rama `coolify` (rama de despliegue) | **22 de 54** | `git rev-parse --abbrev-ref HEAD` |
| Contenedores Docker activos en `xeon` | **100 de 108** | `docker ps \| wc -l` / `docker ps -a \| wc -l` |
| Contenedores activos **de repos Hefesto** | **10** (8 de lead-finder + 2 datastores de portal) | `docker ps \| grep -ci hefesto` |
| Kits self-hosted con runtime | **0 de 54** | cruce repo ↔ `docker ps` + `systemctl is-active` |
| Packs en la biblioteca de rubros | **48, todos `status: "draft"`** | `modules/plantillas/dist/catalog.json` |
| Variables de integración documentadas | **20; ausentes en `.env` y `.env.example`: 17** | matriz en §10.D5 |

---

## 2. Núcleo de plataforma (25 directorios)

| Repo | Ruta | Rama actual | Stack | Estado |
|---|---|---|---|---|
| `hefesto-portal` | `~/Dev/personal/hefesto-portal` | `plan/hefesto-portal-aislamiento` | PHP ^8.4, Laravel ^13.0, Filament ^5.10.1, Inertia ^3.3, Octane ^2.15, React 19 + TS | `IMPLEMENTADO` |
| `hefesto-studio-docker` | `~/Dev/personal/hefesto-studio-docker` | `main` (upstream `origin/main`) | Docker, sitio estático, `postgres:17-alpine` | `IMPLEMENTADO` |
| `hefesto-studio` | `~/Dev/personal/hefesto-studio` | — (sin `.git`) | `caddy:2-alpine`, `postgres:17-alpine` | `IMPLEMENTADO` **sin versionar** |
| `hefesto-studio-codigo` | `~/Dev/personal/hefesto-studio-codigo` | — (sin `.git`) | — | `IMPLEMENTADO` **sin versionar** |
| `hefesto-scaffold` | `~/Dev/personal/hefesto-scaffold` | `plan/hefesto-scaffold-stack-alineado` | PHP, Node, `mariadb:11`, `redis:7-alpine` | `IMPLEMENTADO` |
| `hefesto-registro` | `~/Dev/personal/hefesto-registro` | `bugfix/strix-hefesto-registro-2026-10-20` | Bash, SQL, bats | `IMPLEMENTADO` |
| `hefesto-lead-finder` | `~/Dev/personal/hefesto-lead-finder` | `feat/frontend-caddy` | Python, `postgres:16-alpine`, `redis:7-alpine` | `IMPLEMENTADO` + `VERIFICADO-RUNTIME` (parcial) |
| `hefesto-lead-finder-coolify` | `~/Dev/personal/hefesto-lead-finder-coolify` | `ensayo/coolify-leadfinder` | worktree del anterior | `IMPLEMENTADO` |
| `hefesto-bundle` | `~/Dev/personal/hefesto-bundle` | `bugfix/strix-hefesto-bundle-2026-10-20` | WordPress + WooCommerce, Odoo 19 Community | `IMPLEMENTADO` |
| `hefesto-anonimizador` | `~/Dev/personal/hefesto-anonimizador` | `bugfix/strix-hefesto-anonimizador-2026-10-20` | Python | `IMPLEMENTADO` |
| `hefesto-arcop-open-gen-auditor` | `~/Dev/personal/hefesto-arcop-open-gen-auditor` | `plan/hefesto-arcop-open-gen-auditor` | PHP | `IMPLEMENTADO` |
| `hefesto-hermes` | `~/Dev/personal/hefesto-hermes` | `feature/agy-chat-desplegar-ghp` | Python | `IMPLEMENTADO` |
| `hefesto-pos` | `~/Dev/personal/hefesto-pos` | `bugfix/strix-hefesto-pos-2026-10-20` | Node | `IMPLEMENTADO` |
| `hefesto-pos-source` | `~/Dev/personal/hefesto-pos-source` | `main` | Node | `IMPLEMENTADO` |
| `hefesto-probanza` | `~/Dev/personal/hefesto-probanza` | `main` | Node | `IMPLEMENTADO` |
| `hefesto-vault-onedrive-api-2fa-v3` | `~/Dev/personal/hefesto-vault-onedrive-api-2fa-v3` | `main` | 14 servicios compose | `IMPLEMENTADO` |
| `hefesto-laravel-acceso` | `~/Dev/personal/hefesto-laravel-acceso` | `plan/hefesto-laravel-acceso` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-arcop-panel` | `~/Dev/personal/hefesto-laravel-arcop-panel` | `plan/hefesto-laravel-arcop-panel` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-candados` | `~/Dev/personal/hefesto-laravel-candados` | `plan/hefesto-laravel-candados` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-centinela` | `~/Dev/personal/hefesto-laravel-centinela` | `plan/hefesto-laravel-centinela` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-mfa` | `~/Dev/personal/hefesto-laravel-mfa` | `plan/hefesto-laravel-mfa` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-onboarding` | `~/Dev/personal/hefesto-laravel-onboarding` | `plan/hefesto-laravel-onboarding` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-panel-base` | `~/Dev/personal/hefesto-laravel-panel-base` | `plan/hefesto-laravel-panel-base` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-shared` | `~/Dev/personal/hefesto-laravel-shared` | `plan/hefesto-laravel-shared` | PHP | `IMPLEMENTADO` |
| `hefesto-laravel-ui` | `~/Dev/personal/hefesto-laravel-ui` | `plan/hefesto-laravel-ui` | PHP + Node | `IMPLEMENTADO` |

### 2.1 Nota de stack: no hay Nuxt en Hefesto Portal

La documentación heredada describía «Laravel + Nuxt». La realidad en `hefesto-portal/composer.json` es **Laravel 13 + Inertia 3 + React 19 + TypeScript**. Nuxt no aparece. Corregido aquí; el README del repo (`LEEME-INTEGRACIONES-HEFESTO.md`) ya dice «React 19 + Inertia v3 + TypeScript».

### 2.2 `hefesto-studio` sin versionar — riesgo de continuidad

`~/Dev/personal/hefesto-studio` **no tiene `.git`**. Su gemelo `hefesto-studio-docker` sí lo tiene (`main`, upstream `origin/main`) y contiene el mismo contenido (`README.md` idéntico: «Edición Docker de Hefesto», «Hefesto Studio · Web unificada»). Trabajar en `hefesto-studio` produce trabajo no versionado. → **Bloqueo B-1** (§9).

---

## 3. Verticales de negocio (18 directorios)

### 3.1 Verticales Odoo (15 directorios → 9 repos + 6 dirs/worktrees)

| Repo | Rama | Estado |
|---|---|---|
| `hefesto-arriendos-odoo` | — (sin `.git`) | `IMPLEMENTADO` sin versionar |
| `hefesto-arriendos-supabase-odoo` | `plan/w3-kits-odoo-a-hefesto-arriendos-supabase-odoo` | `IMPLEMENTADO` |
| `hefesto-cotizaciones-odoo` | — (sin `.git`) | `IMPLEMENTADO` sin versionar |
| `hefesto-cotizaciones-supabase-odoo` | `plan/w3-kits-odoo-a-hefesto-cotizaciones-supabase-odoo` | `IMPLEMENTADO` |
| `hefesto-distribuidora-odoo` | `bugfix/strix-hefesto-distribuidora-odoo-2026-10-20` | `IMPLEMENTADO` |
| `hefesto-mantenciones-odoo` | `bugfix/strix-hefesto-mantenciones-odoo-2026-10-20` | `IMPLEMENTADO` |
| `hefesto-reservas-odoo` | — (sin `.git`) | `IMPLEMENTADO` sin versionar |
| `hefesto-reservas-supabase-odoo` | `plan/w3-kits-odoo-a-hefesto-reservas-supabase-odoo` | `IMPLEMENTADO` |
| `hefesto-soporte-odoo` | `main` | `IMPLEMENTADO` |
| `hefesto-soporte-odoo-docs` | `wt/docs` (worktree) | `IMPLEMENTADO` |
| `hefesto-soporte-odoo-extract` | `wt/extract-seed` (worktree) | `IMPLEMENTADO` |
| `hefesto-soporte-odoo-impl` | `wt/impl` (worktree) | `IMPLEMENTADO` |
| `hefesto-soporte-supabase-odoo` | `plan/w3-kits-odoo-a-hefesto-soporte-supabase-odoo` | `IMPLEMENTADO` |
| `hefesto-taller-odoo` | `bugfix/strix-hefesto-taller-odoo-2026-10-20` | `IMPLEMENTADO` (`odoo:18.0`) |
| `hefesto-taller-v2.1-supabase-odoo` | `plan/w3-kits-odoo-a-hefesto-taller-v2.1-supabase-odoo` | `IMPLEMENTADO` |

> **Odoo 18, no 19.** `hefesto-taller-odoo/compose.yaml` fija `odoo:18.0`. La referencia a «Odoo 19 Community» en `hefesto-bundle` es un producto distinto (bundle por tenant de KraftDo SpA). No mezclarlos.

### 3.2 Otras verticales

| Repo | Rama | Estado |
|---|---|---|
| `hefesto-academia` | `main` | `IMPLEMENTADO` (`hefesto-academia-moodle:5.3`) |
| `hefesto-academia-moodle-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `IMPLEMENTADO` (`hefesto-academia-moodle:5.3`, `postgres:17-alpine`) |
| `hefesto-distribuidora-y-mantenciones` | `coolify` | `IMPLEMENTADO` |

### 3.3 Directorios sin `.git` (14)

`hefesto-arriendos-odoo`, `hefesto-cotizaciones-odoo`, `hefesto-documentos-nextcloud-supabase`, `hefesto-ia-aplicada-dify`, `hefesto-lead-finder-coolify` (worktree), `hefesto-proyectos-openproject-postgresql-supabase`, `hefesto-reservas-odoo`, `hefesto-s3-gateway-rclone-gdrive`, `hefesto-secretos-infisical`, `hefesto-soporte-odoo-docs` (worktree), `hefesto-soporte-odoo-extract` (worktree), `hefesto-soporte-odoo-impl` (worktree), `hefesto-studio`, `hefesto-studio-codigo`.

---

## 4. Runtime verificado (2026-10-26)

### 4.1 Lo que sí responde

| Servicio | Endpoint | Respuesta | Contenedor | Desde |
|---|---|---|---|---|
| Hefesto Lead Finder — backend | `http://127.0.0.1:8250/health` | **HTTP 200** | `hefesto-lead-finder-backend-1` (healthy) | 5 días |
| Hefesto Lead Finder — backend (docs OpenAPI) | `http://127.0.0.1:8250/docs` | **HTTP 200** | ídem | 5 días |
| Hefesto Lead Finder — frontend | `http://127.0.0.1:8251/` | **HTTP 200** | `hefesto-lead-finder-frontend-1` (healthy) | 5 días |
| Hefesto Lead Finder — listmonk | `http://127.0.0.1:8255/` | **HTTP 200** | `hefesto-lead-finder-listmonk-1` (healthy) | 5 días |
| Hefesto Lead Finder — worker / beat / postgres / redis | — | contenedores `healthy` | 4 contenedores | 5 días |
| Uptime Kuma (proyecto `monitoring`) | `http://100.88.136.51:3001/` | **HTTP 302** | `uptime-kuma` | 5 días |
| Sigdom Audit (muni) | `http://127.0.0.1:8140/` | **HTTP 302** | `sigdom-audit-app-1` (healthy) | 45 h |

### 4.2 Lo que NO responde, pese a existir el repo

| Ítem | Comprobación | Resultado |
|---|---|---|
| **Hefesto Portal — aplicación** | puerto `127.0.0.1:8231` (el que declara `docker-compose.yml`) | **no escucha**. No existe contenedor `hefesto-portal-app-*` en `docker ps -a`. Solo están `hefesto-portal-app-mariadb` (Up 5 días) y `hefesto-portal-app-redis` (Up 5 días). **La app no corre; solo sus datastores.** |
| **Hefesto Lead Finder — smtpsink** | `docker logs hefesto-lead-finder-smtpsink-1` | `python: can't open file '/sink/smtpsink.py'` — **bucle de reinicio** continuo. |
| **Sitio web Hefesto Studio** | `curl http://127.0.0.1/` | Servido por Apache2 nativo → «Apache2 Ubuntu Default Page». **No hay vhost del sitio Hefesto Studio.** Apache no tiene `sites-enabled` con `DocumentRoot` de Hefesto. |

### 4.3 Servicios de kit ausentes en el host

`systemctl is-active` devuelve `inactive` para **todos** estos: `crowdsec`, `wg-quick`/`wireguard`, `kopia`, `mailu`, `rspamd`, `postfix`, `dovecot`, `signoz`, `infisical`, `dify`, `odoo`, `chatwoot`, `coolify`.Único servicio activo del set: `docker`.

Servicios nativos activos en el host que **no** son kits Hefesto: `apache2`, `mysql`, `redis-server`, `ollama`, `php8.2-fpm`, `php8.4-fpm`, `tailscaled`, `strongswan-starter` (IPsec, **no** WireGuard), `openvpn-client@xeon-x99`.

### 4.4 Procedencia de los contenedores «parecidos»

Los contenedores `uptime-kuma` y `smokeping` **no** provienen de repos Hefesto:

```
docker inspect uptime-kuma --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}'
→ /home/cesar/Dev/network_discovery/monitoring
```

Pertenecen al proyecto compose `monitoring` de `~/Dev/network_discovery/monitoring`. Los kits `hefesto-monitor-uptime-kuma` (`louislam/uptime-kuma:2.5.6-slim`) y `hefesto-diagnostico-red-openspeedtest` (`openspeedtest/latest:v2.0.6`) **siguen sin desplegar**.

### 4.5 Hefesto Lead Finder: fuente de despliegue huérfana

Los contenedores en ejecución declaran `com.docker.compose.project.working_dir = /home/cesar/Dev/hefesto-lead-finder`, **ruta que no existe**:

```
ls -d ~/Dev/hefesto-lead-finder → No existe el archivo o el directorio
```

El material git vive en `~/Dev/personal/hefesto-lead-finder`, que es un repositorio **bare** (`git worktree list` lo reporta como `(bare)`), con worktrees dispersos en `~/Dev/informes/strix-guard/2026-10-20/remediacion-1044/worktrees/` y `~/Dev/papelera-worktrees-bd944620/20261022T144315Z/`. → **Bloqueo B-2** (§9).

---

## 5. Kits self-hosted (54)

**Todos `IMPLEMENTADO` (compose versionado) y `PLANIFICADO` en cuanto a despliegue: ninguno tiene runtime.** La columna «Rama» indica dónde vive el compose; la rama `coolify` es la de despliegue en `hefesto-*`.

### 5.1 Seguridad, secretos y observabilidad

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-secretos-infisical` | — (sin `.git`) | `infisical/infisical:v0.166.8`, `postgres:14-alpine`, `redis:7.4-alpine` |
| `hefesto-boveda-vaultwarden-sqlite` | `plan/w3-boveda-vaultwarden-sqlite-2026-10-20` | `vaultwarden/server:1.37.4` |
| `hefesto-secretos-privatebin-supabase` | `plan/w3-secretos-privatebin-supabase-2026-10-20` | `privatebin/nginx-fpm-alpine:2.0.6`, `postgres:17-alpine`, `caddy:2-alpine` |
| `hefesto-antispam-rspamd` | `main` | `rspamd/rspamd:4.2.2`, `clamav/clamav:1.5.4`, `redis:8.10.2` |
| `hefesto-observabilidad-signoz` | `coolify` | `signoz/signoz:v0.146.0`, `signoz/signoz-otel-collector:v0.144.14`, `clickhouse/clickhouse-server:25.12.5`, `clickhouse/clickhouse-keeper:25.12.5`, `postgres:16` |
| `hefesto-observabilidad-ia-langfuse` | `plan/langfuse-backup-var-postgres` | `cgr.dev/chainguard/minio:latest` |
| `hefesto-respaldo-kopia` | `plan/hefesto-respaldo-kopia-w2-2026-10-20` | `kopia/kopia:0.23.1` |
| `hefesto-vigilancia-changedetection` | `coolify` | `dgtlmoon/changedetection.io:0.60.9`, `alpine:3.22` |
| `hefesto-monitor-uptime-kuma` | `plan/hefesto-monitor-w2-2026-10-20` | `louislam/uptime-kuma:2.5.6-slim` |
| `hefesto-diagnostico-red-openspeedtest` | `coolify` | `openspeedtest/latest:v2.0.6`, `caddy:2-alpine` |

### 5.2 IA y automatización

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-ia-aplicada-dify` | — (sin `.git`) | `langgenius/dify-web:1.17.1`, `dify-api:1.17.1`, `dify-agent-backend:1.17.1`, `dify-sandbox:0.2.15`, `dify-plugin-daemon:0.6.10-local`, `dify-agent-local-sandbox:1.17.1`, `weaviate:1.39.2`, `postgres:15-alpine`, `redis:6-alpine`, `squid:6.13-25.04_beta`, `nginx:1.30.6-alpine`, `busybox:1.37.0` (12 servicios) |
| `hefesto-flujos-node-red` | `coolify` | `nodered/node-red:5.0.8`, `alpine:3.22` |
| `hefesto-formularios-formbricks` | `plan/formbricks-compose-valid` | `ghcr.io/formbricks/formbricks:6.0.2`, `ghcr.io/formbricks/cube:1.7.47-1`, `authzed/spicedb:v1.52.0`, `pgvector/pgvector:pg18` |
| `hefesto-metricas-umami-supabase` | `coolify` | `ghcr.io/umami-software/umami:3.4.0`, `postgres:17-alpine` |

### 5.3 Productividad y ofimática

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-documentos-nextcloud-supabase` | — (sin `.git`) | `hefesto-documentos-nextcloud:35.0.1`, `postgres:17-alpine`, `redis:7.4-alpine` |
| `hefesto-archivo-paperless-supabase` | `plan/w3-archivo-paperless-supabase-2026-10-20` | `paperlessngx/paperless-ngx:3.3.1`, `postgres:17-alpine`, `valkey/valkey:9-alpine` |
| `hefesto-ideas-fider-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `getfider/fider:v0.38.2`, `postgres:17-alpine` |
| `hefesto-notas-memos-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `neosmemo/memos:0.31.0`, `postgres:17-alpine` |
| `hefesto-reuniones-rallly-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `lukevella/rallly:4.15.4`, `postgres:17-alpine` |
| `hefesto-tareas-vikunja-supabase` | `coolify` | `vikunja/vikunja:2.7.0`, `postgres:17-alpine` |
| `hefesto-wiki-bookstack-mariadb` | `plan/w3-wiki-bookstack-mariadb-2026-10-20` | `linuxserver/bookstack:version-v26.09.1`, `mariadb:11.4` |
| `hefesto-encuestas-limesurvey-mariadb` | `coolify` | `mariadb:11.4` |
| `hefesto-agenda-easyappointments-mariadb` | `plan/w3-agenda-easyappointments-mariadb-2026-10-20` | `hefesto-agenda:1.6.0`, `mariadb:11.4` |

### 5.4 CRM, ventas y atención

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-crm-dolibarr-mariadb` | `coolify` | `hefesto-crm:24.0.2`, `mariadb:11.4`, `nginx:1.28-alpine` |
| `hefesto-atencion-chatwoot-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `chatwoot/chatwoot:v4.18.0-ce`, `postgres:17-alpine`, `redis:7.4-alpine` |
| `hefesto-base-datos-baserow` | `coolify` | `bash:4.4`, `caddy:2.11.4`, `pgvector/pgvector:pg15`, `redis:6` |
| `hefesto-enlaces-shlink-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `hefesto-enlaces:5.1.7`, `shlinkio/shlink-web-client:4.8.1`, `postgres:17-alpine` |
| `hefesto-transferencias-gokapi-sqlite` | `plan/w3-transferencias-gokapi-sqlite-2026-10-20` | `f0rc3/gokapi:v2.2.4` |
| `hefesto-suscripciones-wallos-sqlite` | `plan/w3-suscripciones-wallos-sqlite-2026-10-20` | `bellamy/wallos:5.8.3`, `alpine:3.22` |

### 5.5 Contenido, comunidad y medios

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-publicaciones-ghost-mysql` | `coolify` | `ghost:6.70.0`, `mysql:8.4` |
| `hefesto-comunidad-discourse` | `main` | sin compose en raíz |
| `hefesto-radar-freshrss-supabase` | `coolify` | `freshrss/freshrss:1.30.1`, `postgres:17-alpine` |
| `hefesto-boletines-listmonk-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `listmonk/listmonk:v6.2.0`, `postgres:17-alpine` |
| `hefesto-marketing-mautic-mysql` | `coolify` | `hefesto-marketing-mautic:7.2.1`, `mysql:8.4`, `nginx:1.28-alpine` |
| `hefesto-diagramas-drawio` | `coolify` | `jgraph/drawio:32.4.1`, `caddy:2-alpine` |

### 5.6 Eventos, reservas y finanzas

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-eventos-pretix-supabase` | `coolify` | `pretix/standalone:2026.8.0`, `postgres:17-alpine`, `redis:7.4-alpine` |
| `hefesto-finanzas-actual-budget` | `plan/w3-finanzas-actual-budget-2026-10-20` | `actualbudget/actual-server:26.10.0`, `caddy:2-alpine` |
| `hefesto-tiempo-kimai-mariadb` | `coolify` | `kimai/kimai2:2.69.0`, `mariadb:11.4` |
| `hefesto-actas-hedgedoc-supabase` | `coolify` | `quay.io/hedgedoc/hedgedoc:1.12.0`, `postgres:17-alpine` |
| `hefesto-firmas-docuseal-supabase` | `coolify` | `docuseal/docuseal:3.3.2`, `postgres:17-alpine` |
| `hefesto-activos-snipeit-mariadb` | `coolify` | `snipe/snipe-it:v8.8.0`, `mariadb:11.4` |

### 5.7 Proyectos, apoyo y operaciones

| Repo | Rama | Imagen(es) fijada(s) |
|---|---|---|
| `hefesto-proyectos-openproject-postgresql-supabase` | — (sin `.git`) | `openproject/openproject:17.9.1-slim`, `openproject/hocuspocus:17.9.1`, `postgres:17-bookworm`, `memcached:1.6-alpine`, `nginx:1.28-alpine`, `alpine:3.22` |
| `hefesto-apps-internas-appsmith` | `coolify` | `appsmith/appsmith-ce:v2.5.0` |
| `hefesto-utilidades-it-tools` | `coolify` | `sharevb/it-tools:2026.9.27`, `caddy:2-alpine` |
| `hefesto-traducciones-libretranslate` | `coolify` | `libretranslate/libretranslate:v1.9.6`, `postgres:17-alpine`, `caddy:2-alpine` |
| `hefesto-s3-gateway-rclone-gdrive` | — (sin `.git`) | `rclone/rclone:latest` |
| `hefesto-alertas-ntfy-supabase` | `plan/w3-kits-odoo-a-hefesto-alertas-ntfy-supabase` | `binwiederhier/ntfy:v2.30.0`, `postgres:17-alpine` |
| `hefesto-analitica-metabase-supabase` | `plan/w3-kits-odoo-b-2026-10-20` | `metabase/metabase:v0.64.1`, `postgres:17-alpine` |
| `hefesto-biblioteca-linkding-supabase` | `coolify` | `sissbruecker/linkding:1.47.0`, `postgres:17-alpine` |
| `hefesto-inventario-homebox-supabase` | `plan/w3-kits-odoo-a-hefesto-inventario-homebox-supabase` | `ghcr.io/sysadminsmedia/homebox:0.26.2-rootless`, `postgres:17-alpine` |
| `hefesto-facturacion-chile-libredte` | `plan/libredte-lf-y-custodia-env` | sin imagen fija |
| `hefesto-correo-mailu` | `plan/mailu-compose-valid` | `redis:7.2.16-alpine` |

### 5.8 Infraestructura como kit

| Repo | Rama | Estado |
|---|---|---|
| `hefesto-vps-administrado-coolify` | `main` | `IMPLEMENTADO` |
| `hefesto-mvps-coolify` | `plan/hefesto-mvps-coolify-w2-2026-10-20` | `IMPLEMENTADO` |

### 5.9 Kits del resumen heredado: estado real

| Kit del resumen | ¿Repo? | ¿Runtime? |
|---|---|---|
| Coolify | Sí (`hefesto-vps-administrado-coolify`, `hefesto-mvps-coolify`) | No |
| SigNoz | Sí | No |
| Kopia | Sí | No |
| Infisical | Sí (**sin `.git`**) | No |
| Mailu | Sí | No |
| Rspamd | Sí | No |
| **CrowdSec** | **No existe repo** | No |
| **WireGuard** | **No existe repo** | No |
| Dify | Sí (**sin `.git`**) | No |
| LibreDTE | Sí | No |
| Odoo Community | Sí (verticales, `odoo:18.0`) | No |
| **WooCommerce** | **No hay repo propio**; vive en `hefesto-bundle/plantilla/compose.base.yml` | No |
| Chatwoot | Sí | No |
| Keycloak | No en Hefesto; es del bloque municipal (`plataforma-graneros-keycloak`) | Sí (municipal) |

---

## 6. Biblioteca de rubros: 48, todos en borrador

La biblioteca de la web unificada la define `modules/plantillas/dist/catalog.json`:

```
"schema_version": "1.0.0"
"release":        "2026-10-06"
"status":         "draft-library"
"runtime_ai":     false
"packs":          [ ...48 entradas... ]
```

Las **48 entradas** tienen `"status": "draft"` individual. La fuente de los 12 rubros mapeados a designs está en `modules/plantillas/src/directions.cjs` (`cafeteria`, `panaderia`, `restaurante`, `pasteleria`, `minimarket`, `fruteria`, `ferreteria`, `ropa`, `calzado`, `libreria`, `mascotas`, …).

**Estado del conjunto: `IMPLEMENTADO` (código y catálogo versionados) + `PLANIFICADO` (48/48 packs en `draft`, `runtime_ai: false`).** No es una biblioteca de 48 verticales operativas. El `AGENTS.md` de `hefesto-studio` lo exige explícitamente: «No presentar propuestas como integraciones activadas».

---

## 7. Secretos — mecanismos (nunca valores)

| Ámbito | Mecanismo | Ubicación |
|---|---|---|
| Integraciones Hefesto Portal | **SOPS + age** | `infra-contabo/group_vars/contabo/secretos.sops.yaml`, claves `islas_secretos.portal.*` |
| Ingreso de secretos | `configurar-hefesto.sh` (`--wizard`, `--solo-faltantes`, `--sandbox`, `--estado`) | `~/Dev/personal/configurar-hefesto.sh` |
| Claves age | `~/.config/sops/age/{infra-contabo,hefesto,keys}.txt` | solo en `xeon` |
| Bundles por tenant | SOPS + age, `.sops.yaml` por tenant | `hefesto-bundle/.sops.yaml` |
| Detección de fugas | `gitleaks` con `.gitleaks.toml` por repo + hook `pre-commit` | `hefesto-bundle/.githooks/pre-commit` y equivalentes |

**Este documento no contiene valores de secretos, por diseño.**

---

## 8. Bloque municipal (`~/Dev/muni`) — contexto

Trátalo con criterio distinto: **sí tiene runtime**. 47 directorios en `~/Dev/muni`; **50 contenedores activos** la ciudad de Graneros, incluidos `seguridad-graneros-app-frankenphp` (+worker, +reverb, +vision, +transcriptor, +osrm, +clamav), `ferias-api-graneros-app-*`, `plataforma-graneros-keycloak`, `plataforma-graneros-vaultwarden`, `plataforma-graneros-ollama`, `plataforma-graneros-ocr`, `plataforma-graneros-tts`, `dispositivos-graneros-app-*`, `escaneo-archivos-graneros-*`, `control-acceso-graneros-app-*`, `licencias-graneros-app-*`, `web-graneros-app-*`, `rrhh-graneros-app-redis`, `discapacidad-graneros-*`, `net_discovery_mariadb`, `scaffold-*-app-*`.

Aquí sí aplica `VERIFICADO-RUNTIME` a los contenedores listados. Los secretos institucionales (`muni-graneros`) solo existen dentro de `xeon`.

---

## 9. Bloqueos y pendientes (con siguiente paso)

| ID | Bloqueo | Evidencia | Siguiente paso | Responsable |
|---|---|---|---|---|
| **B-1** | `~/Dev/personal/hefesto-studio` y `hefesto-studio-codigo` no están bajo control de versiones; el trabajo ahí se pierde. | `ls -d ~/Dev/personal/hefesto-studio/.git` → no existe | Decidir: eliminar los dirs sin versionar y trabajar solo en `hefesto-studio-docker`, o `git init` + commit inicial. **Decisión de César** (no se ejecuta en esta pasada). | César |
| **B-2** | Los contenedores de `hefesto-lead-finder` (los únicos Hefesto en runtime completo) se desplegaron desde `~/Dev/hefesto-lead-finder`, **ruta borrada**. El repo es bare con worktrees en carpetas de informes/papelera. | `docker inspect …working_dir` vs `ls -d ~/Dev/hefesto-lead-finder` | Recrear un checkout estable de `hefesto-lead-finder` en `~/Dev/personal/hefesto-lead-finder` (o `~/Dev/hefesto-lead-finder`), y repoblar los worktrees desde ahí. | César |
| **B-3** | `hefesto-lead-finder-smtpsink` en bucle de reinicio: falta `/sink/smtpsink.py`. | `docker logs …` → `can't open file '/sink/smtpsink.py'` | Localizar el script en el repo y corregir el `command`/bind-mount del servicio `smtpsink` en el compose. | — |
| **B-4** | Hefesto Portal no tiene contenedor de aplicación; solo `mariadb` y `redis` levantados. | `docker ps -a \| grep portal` → 2 contenedores, sin `app`; puerto 8231 sin escucha | `docker compose up -d app` en `hefesto-portal` (con `BIND_HOST` correcto) y verificar `curl http://127.0.0.1:8231/up`. **Requiere autorización: es arranque de servicio.** | César |
| **B-5** | 17 de 20 variables de integración documentadas no existen en `.env` ni en `.env.example`; el código no las lee. | matriz en §12.3 | Reconciliar `LEEME-INTEGRACIONES-HEFESTO.md` con el código real: o implementar los módulos, o reetiquetar la tabla como `PLANIFICADO` y sacar el valor de ejemplo en claro. | César |
| **B-6** | `LEEME-INTEGRACIONES-HEFESTO.md` está fuera de todo repo git y contiene un valor de API key con forma de secreto en claro. | `git -C ~/Dev/personal …` → «no es un repositorio git»; grep de clave de 48 hex | Rotar esa credencial, pasar el archivo a un repo versionado con `gitleaks`, y sustituir valores de ejemplo por marcadores (`<setear-en-sops>`). | César (rotación) |
| **B-7** | Las políticas RLS de `hefesto-portal` existen solo como archivo **no commiteado** (`database/registry/politicas-rls.sql`, `??` en `git status`). | `git status --porcelain` → `?? database/registry/` | Commitear la política RLS y la migración que la aplica, con revisión de `ALTER TABLE … ENABLE ROW LEVEL SECURITY` para cada tabla del esquema `registry`. | — |
| **B-8** | `hefesto-portal` tiene 22 archivos modificados sin commitear de una sesión anterior (`feature/sitio-studio`, PID 2294956 **muerto** → marcador `sesion` obsoleto). | `ps -p 2294956` → sin proceso; `git status --porcelain \| wc -l` → 22 | Revisar y commitear por etapas, o tirar el trabajo. **No se tocó nada de eso en esta pasada.** | César |
| **B-9** | Ninguno de los 54 kits tiene runtime; 22 están listos en rama `coolify`. | §5 + `docker ps` + `systemctl is-active` | Definir el orden de despliegue y ejecutar el primero en un VPS de pruebas (recomendación: `hefesto-monitor-uptime-kuma`, imagen ya fijada `louislam/uptime-kuma:2.5.6-slim`). | César |
| **B-10** | `hefesto-secretos-infisical` y `hefesto-ia-aplicada-dify` no están versionados, siendo los dos kits más pesados. | §3.3 | `git init` + primer commit, o eliminarlos si el código vive en otro repo. | César |
| **B-11** | El marcador de sesión de `hefesto-portal` está obsoleto y confunde la detección. | `sesion estado .` → marcador con PID 2294956; `ps -p 2294956` → nada | `~/Dev/scripts/sesion soltar ~/Dev/personal/hefesto-portal --forzar`. | — |

---

## 10. Discrepancias detectadas (2026-10-26)

### D1 — «Los 48 rubros» son 48 packs en `draft`, no verticales operativas
- **Afirmación heredada:** ~26 verticales de negocio activas.
- **Realidad:** 48 packs, `status: "draft"` en los 48; biblioteca `status: "draft-library"`, `runtime_ai: false`. Las verticales de negocio reales son 18 directorios (§3), y ninguna tiene runtime.
- **Evidencia:** `modules/plantillas/dist/catalog.json`; `grep -oE '"status": "[^"]+"' | sort | uniq -c` → `48 "status": "draft"`.

### D2 — La premisa «nada de este bloque ha corrido en runtime» es falsa en su generalidad
- **Realidad:** 9 contenedores Hefesto activos; `hefesto-lead-finder` con 7 contenedores healthy y endpoints que devuelven 200.
- **Lo que sí se mantiene:** los **54 kits** no tienen runtime alguno.
- **Evidencia:** `docker ps | grep -i hefesto`; `curl -o /dev/null -w "%{http_code}" http://127.0.0.1:8251/`.

### D3 — Hefesto Portal: los datastores corren, la aplicación no
- **Documentado:** `docker-compose.yml` declara `app` con `ports: "${BIND_HOST:-127.0.0.1}:8231:8000"`.
- **Realidad:** no hay contenedor `hefesto-portal-app` (frankenphp/nginx); el puerto 8231 no escucha. Solo `hefesto-portal-app-mariadb` y `hefesto-portal-app-redis`.
- **Evidencia:** `docker ps -a | grep portal`; `ss -ltn | grep 8231` → vacío.

### D4 — Módulos «activos» del panel admin que solo existen como plan
- **Documentado** (`LEEME-INTEGRACIONES-HEFESTO.md` §1): «Módulos activos: Pagos (Webpay/Stripe con reembolsos y auditoría HMAC), Cotizaciones (Invoice Ninja v5)».
- **Realidad:**
  - No existe `env('STRIPE_*')`, `env('WEBPAY_*')` ni `env('INVOICE_NINJA_*')` en `app/`, `config/` ni `modules/` → **0 referencias**.
  - `config/acciones.php` documenta lo contrario de forma explícita: «`invoiceninja` (no se ofrece, DECISIÓN 3-11)».
  - Los únicos `Filament/Resources` presentes son: `ActivityResource`, `LegalDocumentResource`, `MockupResource`, `OutboundCommandResource`, `ProspectResource`, `StudioRequestResource`, `UploadResource`, `UserResource`. **No hay recurso de Pagos ni de Cotizaciones.**
  - Las menciones a webpay/stripe/invoiceninja en el repo están **solo** en `docs/superpowers/plans/` y `docs/superpowers/specs/`.
- **Corrección:** Pagos y Cotizaciones pasan a `PLANIFICADO`.

### D5 — 17 de 20 variables de integración documentadas no existen
Matriz completa en §12.3. Resultado: `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`, `WEBPAY_ENVIRONMENT`, `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `INVOICE_NINJA_URL`, `INVOICE_NINJA_TOKEN`, `N8N_CHAT_URL`, `N8N_CHAT_TOKEN`, `PAGOS_AUDIT_HMAC_KEY`, `RECRAFT_API_KEY`, `TURNSTILE_SECRET_KEY` → **ausentes en `.env` y en `.env.example`**. Solo `RESEND_API_KEY`, `TURNSTILE_SITE_KEY` y `ANTHROPIC_API_KEY` existen en `.env.example` (y ninguna de las 20 está en el `.env` real, que tiene 75 claves frente a 124 del `.env.example`).

### D6 — Documento maestro de integraciones fuera de control de versiones y con valor de secreto en claro
- `~/Dev/personal/LEEME-INTEGRACIONES-HEFESTO.md` **no pertenece a ningún repo git** (`git -C ~/Dev/personal status` → «no es un repositorio git»).
- Contiene un valor de 48 caracteres hexadecimales etiquetado como `WEBPAY_API_KEY` en la tabla de la §3.
- Además, 14 líneas del documento contienen patrones `KEY|SECRET|TOKEN|PASSWORD`.
- **Principio aplicado:** en este catálogo solo se registra el **mecanismo** (SOPS+age bajo `islas_secretos.portal.*`), nunca el valor.

### D7 — RLS implementado pero no versionado
- `hefesto-portal/database/registry/politicas-rls.sql` contiene `ALTER TABLE registry.tenants ENABLE ROW LEVEL SECURITY` y `registry.subscriptions ENABLE ROW LEVEL SECURITY`.
- El archivo está **sin trackear** (`?? database/registry/` en `git status`): no está en ningún commit.
- **Corrección:** RLS pasa de «implementado» a `IMPLEMENTADO` **no commiteado / pendiente de revisión**.

### D8 — CrowdSec y WireGuard no existen como repos
- No hay `hefesto-*crowdsec*` ni `hefesto-*wireguard*`.
- No hay servicio `crowdsec` ni `wg-quick` activo. El VPN activo en el host es `strongswan-starter` (IPsec) y `openvpn-client@xeon-x99`, no WireGuard.
- **Corrección:** estos dos kits salen del catálogo hasta que exista su implementación.

### D9 — WooCommerce no tiene repo propio
- No existe `hefesto-*woocommerce*`. El stack WooCommerce vive dentro de `hefesto-bundle/plantilla/compose.base.yml` (WordPress + MariaDB, Odoo + Postgres).
- `hefesto-bundle/README.md` declara: «Nada de este repo es desplegable todavía».

### D10 — La web Hefesto Studio no está publicada
- `hefesto-studio`/`hefesto-studio-docker` construyen el sitio estático (`dist/`), pero en `xeon` el puerto 80 lo sirve Apache2 con la página por defecto y **no hay vhost** de Hefesto Studio.
- `modules/plantillas/dist/catalog.json` marca `runtime_ai: false`: las vistas de sistemas son demostraciones locales.

### D11 — Doble checkout de `hefesto-lead-finder` sin checkout principal
- `~/Dev/personal/hefesto-lead-finder` es **bare**; los worktrees viven en `~/Dev/informes/…` y `~/Dev/papelera-worktrees-bd944620/…`.
- El `working_dir` declarado por los contenedores en ejecución (`~/Dev/hefesto-lead-finder`) no existe.

### D12 — Versión de Odoo
- Las verticales usan `odoo:18.0`. La mención a «Odoo 19 Community» corresponde a `hefesto-bundle`, otro producto (KraftDo SpA).

---

## 11. Decisiones registradas

| Fecha | Decisión | Motivo | Consecuencia |
|---|---|---|---|
| 2026-10-26 | Este `CATALOGO.md` vive en `hefesto-studio-docker` (rama `main`) | Es el único repo versionado que se identifica como «Hefesto Studio» (`README.md`: «Hefesto Studio · Web unificada»), está en `main` con upstream `origin/main`, no tiene marcador de sesión y tiene 1 solo cambio ajeno (`.gitignore`, que se excluye del commit) | `hefesto-studio/` (sin `.git`) queda como copia de trabajo; ver B-1 |
| 2026-10-26 | Se corrige la premisa «nada de este bloque corre en runtime» | La evidencia (contenedores + HTTP 200) la contradice; mantenerla habría propagado un error al documento | §4 pasa a listar los 9 contenedores y los endpoints que responden |
| 2026-10-26 | Los 48 packs se catalogan como `IMPLEMENTADO + PLANIFICADO` | `catalog.json` declara `status: "draft"` en los 48 y `runtime_ai: false` | No se pueden presentar como verticales activas |
| 2026-10-26 | Pagos (Webpay/Stripe) y Cotizaciones (Invoice Ninja) se reclasifican a `PLANIFICADO` | 0 referencias a `env()` de esas variables y `config/acciones.php` dice «no se ofrece, DECISIÓN 3-11» | `LEEME-INTEGRACIONES-HEFESTO.md` queda marcado como desalineado (B-5) |
| 2026-10-26 | Se registra el mecanismo de secretos, no los valores | Regla dura del bloque; además hay un valor con forma de clave en claro en un archivo fuera de git | B-6 exige rotación |

---

## 12. Anexo — comandos de verificación

Todo lo de este documento es reproducible desde `xeon`.

### 12.1 Census de repos y runtime

```bash
# Census de directorios y de repos git
cd ~/Dev/personal
ls -d hefesto-*/ | wc -l                                    # 97
for d in hefesto-*/; do [ -d "$d/.git" ] && echo "$d"; done | wc -l   # 83

# Rama, remoto y último commit de cada repo
for d in hefesto-*/; do
  printf "%s %s %s\n" "${d%/}" \
    "$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null)" \
    "$(git -C "$d" log -1 --format=%ad --date=short 2>/dev/null)"
done

# Runtime: contenedores
docker ps --format "{{.Names}}|{{.Image}}|{{.Status}}" | grep -i hefesto
docker ps -a --format "{{.Names}}|{{.Status}}" | grep -iE "portal|lead-finder"

# Runtime: servicios de kit
for s in crowdsec wireguard kopia mailu rspamd signoz infisical dify odoo chatwoot coolify; do
  printf "%-12s %s\n" "$s" "$(systemctl is-active $s 2>/dev/null)"
done
```

### 12.2 Estado de sesión (obligatorio antes de tocar un repo)

```bash
cd ~/Dev/personal/hefesto-studio-docker && ~/Dev/scripts/sesion estado .
# Verificado 2026-10-26: "Sin marcador de sesión"
```

### 12.3 Matriz de variables de integración (D5)

```bash
cd ~/Dev/personal/hefesto-portal
for v in WEBPAY_COMMERCE_CODE WEBPAY_API_KEY WEBPAY_ENVIRONMENT STRIPE_KEY STRIPE_SECRET \
         STRIPE_WEBHOOK_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET FACEBOOK_CLIENT_ID \
         FACEBOOK_CLIENT_SECRET INVOICE_NINJA_URL INVOICE_NINJA_TOKEN N8N_CHAT_URL \
         N8N_CHAT_TOKEN PAGOS_AUDIT_HMAC_KEY RECRAFT_API_KEY RESEND_API_KEY \
         TURNSTILE_SITE_KEY TURNSTILE_SECRET_KEY ANTHROPIC_API_KEY; do
  a=$(grep -cE "^$v=" .env 2>/dev/null)
  b=$(grep -cE "^$v=" .env.example 2>/dev/null)
  printf "%-26s env=%s example=%s\n" "$v" "$a" "$b"
done
```

### 12.4 Clasificación reproducible (§1)

Regla: un `hefesto-*` es **plataforma** si su nombre casa con
`portal|studio|scaffold|laravel-|registro|pos|probanza|bundle|lead-finder|hermes|anonimizador|arcop-open-gen-auditor`;
es **vertical** si casa con `odoo|academia|distribuidora-y-mantenciones`; en otro caso es **kit**.
Resultado: plataforma 25, verticales 18, kits 54.

### 12.5 Biblioteca de rubros (§6)

```bash
cd ~/Dev/personal/hefesto-studio-docker
python3 -m json.tool modules/plantillas/dist/catalog.json | grep -oE '"status": "[^"]+"' | sort | uniq -c
# 48 "status": "draft"
#  1 "status": "draft-library"
```

---

*Fin del catálogo. Última verificación: 2026-10-26. Cualquier cambio de estado debe reflejarse aquí en el mismo commit.*
