# Integración de la biblioteca en Hefesto

48 packs × 3 estilos = 144 combinaciones visuales, no 144 sistemas completos. Los diseños web son HTML independientes; las vistas de Odoo, Chatwoot e InvoiceNinja son maquetas.

## Contenido utilizable
- catalog.json: fuente versionada, con origen owner y estado draft.
- packs/: un directorio por rubro, vistas HTML, patrón Gutenberg, CSV de productos en borrador, categorías y blueprints.
- hefesto-patterns/: plugin WordPress que registra 48 patrones básicos; no aplica la apariencia completa de las vistas HTML. Comprime esta carpeta e instálala en un WordPress de pruebas.
- TemplateCatalog.php: servicio PHP sin dependencias, usable desde Laravel. Resuelve selecciones usando plan y estilo permitidos. No llama APIs.
- gallery/: código de la galería estática; abre index.html. Sus descargas ZIP requieren copiar la carpeta downloads desde el sitio o regenerar los paquetes con los scripts del repositorio.

## Laravel / Blade
Copia catalog.json fuera del directorio público (por ejemplo storage/app/hefesto/catalog.json), y la clase a app/Services adaptando su namespace. Sirve vistas Blade desde datos escapados. El HTML exportado puede convertirse en Blade; no ejecutes HTML recibido de usuarios.

El controlador debe obtener tenant, plan vigente y permisos desde la sesión y la base de datos del servidor. No confíes en plan, status, systems ni origin enviados por el navegador. Pasa a resolve únicamente los identificadores y valores de marca permitidos; los sistemas se recalculan a partir del catálogo. La marca admite texto y color hexadecimal, no scripts ni HTML.

## Flujo que debe implementar el backend
1. Autenticar, autorizar propiedad del tenant y leer el plan real.
2. Resolver pack + versión + estilo; exigir aprobación editorial del pack y del propietario.
3. Generar diff y revisión; guardar respaldo con identificador y recursos afectados.
4. Aplicar en cola con bloqueo por tenant, versión y sistema. Clave de idempotencia: tenant_id + pack_id + pack_version + style_id + hash de configuración.
5. Cada adaptador registra IDs externos creados y actualizados, estado previo y resultado. Reintentos no deben duplicar registros.
6. Verificar y permitir reversión a partir del estado anterior. No borrar datos ajenos al pack ni sobrescribir cambios posteriores sin revisión.

Este paquete NO implementa los adaptadores, la cola, el respaldo ni el rollback. El servicio solo calcula una selección determinista. Los impuestos, documentos fiscales, pagos, reservas, inventario y permisos requieren configuración del sistema real.

## Disponibilidad por plan
Básico: WordPress, WooCommerce, Odoo; sin POS. Intermedio: agrega Chatwoot, propuestas WhatsApp y POS cuando el rubro lo contempla. Premium: agrega InvoiceNinja. Comprueba límites comerciales contra tu configuración real antes de integrar. La presencia de un archivo en el ZIP no otorga permisos de plan.

## Pruebas antes de activar
Prueba versiones concretas de WordPress/WooCommerce/Odoo/Chatwoot/InvoiceNinja, mapeo CSV, aislamiento de tenants, repetición de tareas, fallos parciales, recuperación, permisos y bloqueo del plan. No enviar mensajes ni publicar productos durante pruebas. Las vistas y configuraciones son borradores.

## Fuentes de formatos
- https://developer.wordpress.org/reference/functions/register_block_pattern/
- https://github.com/woocommerce/woocommerce/wiki/Product-CSV-Import-Schema
- https://www.odoo.com/documentation/19.0/applications/essentials/export_import_data.html

## Colección visual 02

Las vistas web se rediseñaron en 12 familias (espresso, atelier, retreat, ritual, brutalist, kinetic, market, workshop, academy, flora, noir, journal). Los 48 conceptos comparten componentes dentro de su familia; los tres tratamientos cambian tipografía, ritmo y orden editorial. No se presentan como 144 diseños hechos desde cero.

Se utiliza Tailwind CSS compilado, GSAP con ScrollTrigger y Three.js en los conceptos tecnológicos, industriales y joyería. No hay CDN de librerías en runtime. Los recursos viven en gallery/assets y se incluyen en cada ZIP individual. Las fotos son referencias visuales con créditos; sustituye las que no correspondan al negocio real.

Los controles del catálogo, la consulta de ejemplo, el movimiento y la selección funcionan localmente. Ningún formulario envía mensajes, cobra ni modifica sistemas. En móvil se recompone cada familia, y las animaciones respetan prefers-reduced-motion. El usuario puede pausar el movimiento.

El botón HTML autónomo incrusta CSS, bundle e imágenes en un archivo. Para Blade es preferible separar vistas, CSS y JavaScript del paquete, conservar el escape de datos y cargar los recursos con Vite. Los patrones Gutenberg siguen siendo bases nativas sencillas: no incluyen automáticamente la composición y animación del HTML de referencia.

Validación: generación de todos los conceptos, estructura HTML, recursos y pruebas DOM. No se ejecutó una revisión visual en navegador real ni una validación WebGL con GPU en este entorno.

### Refinamiento 02.1

Las secciones de catálogo tienen composiciones propias por familia: carta gastronómica, lookbook, experiencias, rituales, índice de proyectos, especificaciones, mercado, servicios técnicos, programas, composición botánica, hoja de contactos e índice profesional. Cada opción dispone de una ficha de detalle y puede añadirse a la consulta local. No se inventan precios ni disponibilidad.

DM Sans y Cormorant Garamond se distribuyen localmente, con sus licencias OFL dentro de fonts.css; la descarga HTML las conserva embebidas. La portada, las vistas móviles y las descargas utilizan la misma edición.


## Diseño 3.0
Portadas fotográficas propias para Cafetería, Arquitectura y Ropa; capítulos visuales para los rubros con fotografía. Las imágenes conceptuales generadas se identifican en cada diseño y sus prompts están en assets/GENERATED-IMAGES.md. Vista previa a todo el ancho con editor desplegable y demo.html para abrir cada sitio por separado. La funcionalidad de compra y consulta continúa siendo una demostración local.

## Diseño 3.1
Tecnología, Cabañas y Florería cuentan con nuevas composiciones y exploradores de intención de tres opciones. La elección precarga una consulta local, sin envío externo. Las 48 plantillas web incluyen un menú móvil en diálogo nativo. La versión respeta movimiento reducido. Comprobaciones de estructura e interacción realizadas; revisión visual de navegador y GPU pendiente.


## Diseño 4.0 — componentes e interacciones

- daisyUI 5.7.47 compilado localmente con Tailwind 4. Componentes con prefijo `du-`, sin React: el HTML y CSS pueden integrarse en Blade. `src/components.css` define los componentes y colores.
- La galería abre documentos de la misma procedencia mediante `demo.html`, conserva el acceso a recursos privados y espera CSS antes de inicializar la interacción. Cada carga lleva un identificador; se ignoran respuestas de vistas anteriores. Se muestra carga/error/reintento.
- En las 48 plantillas web: filtros, ficha, selección, preguntas desplegables, menú móvil y consulta descargable local. Las imágenes tienen recuperación y alternativa visible ante un fallo; las portadas se cargan con prioridad.
- Gestión: búsqueda y movimiento local entre etapas. Atención: respuestas rápidas y conversación local. Documentos: cantidades/precios editables, total CLP sin impuestos, descarga JSON e impresión. No se conectan a los sistemas reales, ni envían mensajes, ni emiten documentos tributarios.
- Fuentes nuevas: `src/system-engine.js`, `src/system-runtime.js`, `src/system.css`. Se conservan bibliotecas y fotos locales en los ZIP. No requiere CDN para visualizar.
- Verificación: pruebas DOM de apertura, cambio de pestaña, señales de carga, estilos fallidos, interacciones y rutas de recursos. La revisión visual en navegador/GPU no estuvo disponible.


## Diseño 4.1 — branding y adaptación

Las vistas de Gestión, Atención y Documentos heredan la paleta, el contraste claro/oscuro, el nombre y la familia tipográfica de cada plantilla web. Los acentos personalizados se transmiten a las cuatro vistas. El branding de las demos no modifica instalaciones externas de Odoo, Chatwoot ni InvoiceNinja.

La paginación agrega tarjetas al DOM sin reconstruir los iframes existentes. Las pruebas comprueban la identidad de tarjetas, marcos y contextos al pasar de 12 a 24, 36 y 48 resultados.

Los diálogos de consulta y detalle usan posición fija, inset cero y margen automático para contrarrestar el reset de Tailwind. Los paneles grandes mantienen su navegación a pantalla completa; los formularios internos se centran y permiten desplazarse en pantallas bajas.

Adaptaciones adicionales para escritorio amplio, tabletas y móviles: tablas con desplazamiento propio, paneles de trabajo contenidos, controles táctiles y formularios legibles. Revisión visual de navegador pendiente.
