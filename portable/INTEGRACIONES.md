# Variables y credenciales de Hefesto

## Variables que este backend sí consume

| Variable | Dónde obtenerla / uso |
|---|---|
| `APP_URL` | URL pública exacta de Hefesto; local: `http://localhost:8080`. |
| `SITE_ADDRESS`, `HTTP_PORT`, `HTTPS_PORT` | Configuración de Caddy. Local `:80`, `8080`, `8443`; producción dominio sin protocolo, `80`, `443`. |
| `PGDATABASE`, `PGUSER` | Nombres que defines; predeterminados `hefesto`. |
| `PGPASSWORD` | Generada en el TXT privado. Solo inicializa una base nueva: cambiar `.env` no cambia la contraseña de un volumen existente. |
| `ADMIN_API_TOKEN` | Generado en el TXT privado, mínimo 32 caracteres. Solo servidor/clientes administrativos. |
| `N8N_CHAT_URL` | URL Production de un nodo Webhook POST en tu instancia n8n, publicado y accesible por HTTPS. |
| `N8N_CHAT_TOKEN` | Secreto elegido por ti. En credencial Header Auth: nombre `Authorization`, valor `Bearer TU_SECRETO`. En `.env` guarda solo `TU_SECRETO`. |
| `INVOICE_NINJA_URL` | URL base HTTPS de tu instancia Invoice Ninja v5, sin `/api/v1`. |
| `INVOICE_NINJA_TOKEN` | Settings → Account Management → Integrations → API tokens, en tu cuenta Invoice Ninja. |

Después de cambiar variables ejecuta `docker compose up -d --force-recreate app`. No necesitas reconstruir la imagen por cambiar credenciales.

### Conectar el bot / RAG

1. En n8n crea Webhook POST con Header Auth. No uses la URL de test en producción.
2. Implementa recuperación de documentos públicos autorizados y generación de respuesta. La selección del proveedor/modelo y vector store se hace en n8n; sus claves quedan en credenciales n8n, no en Hefesto.
3. El backend envía `{"question":"…","locale":"es","collection":"hefesto-public"}`.
4. Responde JSON `{"answer":"…","sources":[{"title":"Fuente","url":"https://…"}]}` en menos de 20 segundos. Máximo 12.000 caracteres de respuesta. Si no hay evidencia, el bot debe decirlo.
5. Publica el workflow, pega URL/token y prueba una pregunta conocida y otra sin respuesta. No uses documentos privados de KraftDo en una colección pública.

No se entrega un RAG activo simplemente al completar las variables: primero hay que construir e indexar ese flujo.

### Conectar cotizaciones

Configura Invoice Ninja y prueba el endpoint administrativo descrito en README. El borrador lleva referencia de la solicitud. Revisa precio, moneda, impuestos, datos y destinatario en Invoice Ninja antes de enviar. Los borradores no sustituyen boletas/facturas del SII.

Fuentes oficiales:
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- https://docs.n8n.io/integrations/builtin/credentials/webhook/
- https://invoiceninja.github.io/docs/api-reference/invoice-ninja-api-reference
- https://invoiceninja.github.io/docs/developer-guide

## Integraciones de KraftDo y ampliaciones — pendientes de portar a este backend

Los nombres siguientes son una **convención propuesta para la futura implementación**. Añadirlos a `.env` hoy no activa estos servicios. Primero se necesitan sus rutas, validaciones, permisos, callbacks/webhooks y pruebas. Las conexiones documentadas como caso KraftDo pertenecen a ese proyecto; sus secretos no se exportan ni reutilizan aquí.

| Servicio | Variables a preparar | Cómo obtenerlas y paso pendiente |
|---|---|---|
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Cloud → credenciales OAuth de aplicación web, pantalla de consentimiento; registrar callback que implemente el futuro backend. |
| Facebook Login | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | App en Meta for Developers, producto Login, permisos y redirect URI del backend. |
| Instagram | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID`, `META_API_VERSION` | App y autorización oficial Meta/Instagram; los permisos dependen de la modalidad elegida. Implementar renovación y revisión de permisos. |
| Canva | `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET` | Canva Developers: app para uso externo, habilitar REST APIs y OAuth; configurar redirect. Integraciones públicas pueden requerir revisión. |
| Flow | `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_MODE` | Cuenta Flow → Mis datos → Integraciones; sandbox y producción separados. Implementar firma, confirmación servidor e idempotencia. |
| Webpay Plus | `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`, `WEBPAY_ENVIRONMENT` | Credenciales de integración oficiales; producción con comercio habilitado por Transbank. Implementar creación/commit/consulta y conciliación. |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Dashboard → API keys; secreto de firma en endpoint Webhooks. Requiere cuenta habilitada para tu entidad/país, y backend de checkout/webhooks. |
| Resend | `RESEND_API_KEY`, `MAIL_FROM` | Crear API key con alcance de envío y verificar dominio mediante DNS. Implementar envío/reintentos; no incluir datos sensibles en logs. |
| QStash | `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | Consola Upstash/QStash. Implementar consumidor y validación de firma antes de programar tareas. |
| Cloudflare R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | Cloudflare R2 → API tokens: acceso S3 limitado al bucket. Crear almacenamiento y rutas privadas/URLs temporales según necesidad. |
| Better Auth / MFA | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Secreto aleatorio propio, URL propia. Falta implementar sesiones, proveedores y recuperación MFA; no es un servicio que se active con clave externa. |
| D1 / Workers | bindings de despliegue | Son recursos Cloudflare del despliegue original; esta edición usa PostgreSQL y Node. Requieren migración explícita, no copiar un token al frontend. |
| Starken | según contrato/API elegida | KraftDo usaba tarifas locales; no afirmar API activa. Cotizar acceso comercial si se implementa API. |
| NFC / QR | URL destino pública | No requieren secreto genérico. Implementar resolución de destino y controles de administración. |
| Excel / CSV | sin credencial externa | Requiere código de importación/exportación y permisos. No está implementado en este backend de Hefesto. |
| Supabase | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Proyecto Supabase → API keys. Definir uso y RLS; clave privada solo en servidor. PostgreSQL local no incluye Supabase. |
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET` | Meta WhatsApp Business Platform: configurar número, permisos y webhook. El token de verificación lo defines tú. |
| Odoo / Moodle / otros ERP-CMS | URL y credencial de servicio específicas | Crear usuario/token de integración con permisos mínimos en cada instalación; acordar versiones y contrato API antes de implementar. No están instalados en Compose. |

Documentación oficial para obtención de credenciales:
- Flow: https://developers.flow.cl/docs/intro
- Webpay: https://transbankdevelopers.com/documentacion/webpay-plus
- Stripe: https://docs.stripe.com/keys
- R2: https://developers.cloudflare.com/r2/get-started/s3/
- Resend: https://resend.com/docs/dashboard/api-keys/introduction
- Canva: https://www.canva.dev/docs/apps/rest-apis/authentication/
- Google: https://developers.google.com/identity/protocols/oauth2/web-server
- Meta: https://developers.facebook.com/docs/
- QStash: https://upstash.com/docs/qstash/overall/getstarted
- Supabase: https://supabase.com/docs/guides/getting-started/api-keys

## Separación de secretos

El TXT privado contiene dos claves nuevas para esta instalación. No contiene claves reales de Flow, Stripe, Meta, Canva, KraftDo o tus otros proyectos. Los campos vacíos se rellenan tras crear las cuentas y conectores correspondientes. Usa secretos separados por ambiente; no pongas tokens privados en variables `VITE_*`, `NEXT_PUBLIC_*`, HTML o archivos descargables del sitio.
