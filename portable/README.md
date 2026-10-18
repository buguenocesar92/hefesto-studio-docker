# Hefesto — edición Docker

Incluye la web completa, Node.js 24, PostgreSQL 17 y Caddy. Conserva portada, catálogo, legales, KraftDo y fichas de productos. **No es Laravel**: el frontend puede migrarse después a Blade y las migraciones/contratos sirven de referencia.

## Alcance real

- Sitio y fichas comerciales estáticos; imágenes de productos son ilustraciones UI, no capturas del despliegue.
- Solicitudes de cotización: API y persistencia PostgreSQL con validación y consentimiento.
- Catálogo JSON importable a `content_documents`. El frontend todavía lee el contenido generado en HTML, no esa tabla. No se incluyen datos privados del servidor de KraftDo ni un volcado de producción.
- Chat: conector HTTP autenticado hacia un workflow n8n externo. **No contiene un motor RAG, embeddings ni un workflow IA terminado.** Sin configuración informa que no está conectado.
- Invoice Ninja: conector para crear cliente y cotización borrador con precio cero pendiente de valoración, sin envío automático. No emite documentos tributarios.
- Otros proveedores mostrados en la web son servicios ofrecidos/casos documentados: **no quedan activados por Docker**. Véase `INTEGRACIONES.md`.
- No se incluyen panel administrador, cuentas de clientes ni login social funcional en este backend. Administración por API con token privado.

## Inicio en Windows PowerShell

Instala y abre Docker Desktop con contenedores Linux. No necesitas pnpm para esta edición. Descomprime el ZIP y entra a la carpeta que contiene `compose.yaml`.

Copia el TXT privado descargado como `.env` en esa carpeta (su contenido ya usa formato dotenv). Nunca lo incluyas en Git.

```powershell
Copy-Item "$HOME\Downloads\hefesto-secretos-iniciales.txt" .env
docker compose build app
docker compose up -d db
docker compose run --rm app npm run migrate
docker compose run --rm app npm run seed
docker compose up -d
docker compose ps
Invoke-RestMethod http://localhost:8080/api/health
```

Abre http://localhost:8080. En Linux también puedes usar `sh portable/scripts/setup.sh`. `seed` actualiza el catálogo, no borra solicitudes. Las migraciones registran versiones y usan bloqueo y transacciones.

## Producción

Este compose ya no incluye Caddy ni publica puertos; para uso local sin Coolify agrega un override propio que publique `app` (p. ej. `ports: ["8080:3000"]`). Las variables `SITE_ADDRESS`, `HTTP_PORT` y `HTTPS_PORT` ya no aplican. **Esto sustituiría el alojamiento Sites actual; el paquete no cambia DNS ni migra la publicación por sí solo.** Puedes validar primero con otro subdominio de tu propiedad.

No publiques el puerto de PostgreSQL ni el de Node. Caddy recibe tráfico y fija la IP de origen para el límite de solicitudes. El límite es local a cada proceso; antes de escalar a varias réplicas utiliza un almacén compartido y medidas antiabuso. No copies tokens al JavaScript del navegador.

## API administrativa

Desde un cliente privado envía `Authorization: Bearer <ADMIN_API_TOKEN>`:

- `GET /api/admin/quotes`: últimas 100 solicitudes.
- `POST /api/admin/quotes/{uuid}/invoice-draft`: crear borrador en Invoice Ninja. Requiere proveedor configurado y revisión manual del precio antes de enviar.

Las llamadas externas inciertas quedan `invoice_pending` para evitar duplicar clientes/cotizaciones al reintentar. Reconciliar en Invoice Ninja antes de reabrir la solicitud; no limpiar ese estado a ciegas. La base no guarda el token del proveedor.

## Respaldo y mantenimiento

```sh
sh portable/scripts/backup.sh
sh portable/scripts/restore.sh backups/archivo.dump CONFIRM_RESTORE
```

Restaurar reemplaza datos: exige confirmación explícita y crea un respaldo previo. Guarda copias cifradas fuera del VPS; `backups/` se excluye de Git. No hay tarea programada todavía: define frecuencia, retención, America/Santiago y alerta de fallos antes de instalarla. No uses `docker compose down -v` salvo que quieras eliminar los volúmenes.

Si una operación manual se repite más de dos veces, conviértela en script versionado; si es periódica, en tarea programada, según `AGENTS.md`.

## GitHub

Crea un repositorio para Hefesto (distinto del repositorio de Lead Finder). Desde la carpeta descomprimida:

```sh
git init
git add .
git status --short
git commit -m "Hefesto: sitio completo y edición Docker"
git branch -M main
git remote add origin URL_DE_TU_REPOSITORIO
git push -u origin main
```

El ZIP excluye secretos, metadatos del hosting, Git y dependencias. `.env.example` contiene solo ejemplos. `.gitignore` y `.dockerignore` excluyen `.env`, respaldos y secretos. El workflow de GitHub comprueba el backend y construye la imagen, pero no despliega al VPS.

## Verificación y límites de esta entrega

Se ejecutaron pruebas del contenido original, interacciones DOM y conectores con respuestas simuladas. Docker, PostgreSQL real, credenciales externas y navegación visual no se pudieron ejecutar en este entorno. Comprueba `/api/health`, una solicitud real y los proveedores en pruebas antes de usarlo en producción. Las etiquetas de imágenes Docker fijan versión mayor, no digest; fija digests en tu despliegue validado.
