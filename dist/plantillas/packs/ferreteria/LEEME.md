# Ferretería

Pack propio Hefesto 1.0.0, en borrador. Marcas y productos son ejemplos.

- Abre los archivos preview en tu navegador.
- WordPress: pega el patrón en el editor de código de una página de prueba, o usa el plugin conjunto. El HTML de las vistas previas es una referencia visual independiente; el patrón nativo es una base de bloques más sencilla.
- WooCommerce: importa products.csv con su importador CSV, conserva Published=-1 (borrador) y revisa el mapeo. No establece precios, impuestos, stock ni pagos. Si repites, usa actualizar por SKU, sin duplicar productos.
- Odoo: importa categories.csv en categorías de producto y mapea External ID/Name según tu versión. Los demás ajustes son blueprints, no módulos instalables. Revisa IDs y aislamiento de cada negocio.
- Chatwoot e InvoiceNinja: los JSON son contratos de referencia para implementar adaptadores; no son archivos de importación nativos garantizados.
- WhatsApp: propuestas sin aprobar; requieren revisión y aprobación del proveedor cuando corresponda.
- selection-example.json es una selección Premium de ejemplo. La galería permite exportar otra selección con marca y plan. El ZIP contiene todas las bases; los permisos deben validarse en el servidor antes de aplicar.



No contiene datos de clientes ni realiza cambios en ningún sistema.
