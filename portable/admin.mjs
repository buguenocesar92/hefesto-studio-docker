// Consultas del panel de administración.
//
// Los campos que se devuelven están escritos uno por uno, a propósito. Con
// `SELECT *` la respuesta cambia sola cada vez que se le agrega una columna
// a la tabla: una columna nueva (notas internas, origen, IP) se filtraría
// sin que nadie lo revise. La minimización de datos (Ley 21.719) se
// cumple en la consulta, no después.
//
// Lo que se devuelve es lo que el rol necesita para trabajar: quién pidió
// la cotización, qué pidió, cuándo y en qué estado. `external_client_id` es
// una referencia interna de Invoice Ninja y no sale en el listado.

/** Campos del listado de solicitudes. */
export const COLUMNAS_DE_SOLICITUD = [
  "id",
  "business",
  "email",
  "modules",
  "goal",
  "consent_at",
  "status",
  "external_quote_id",
  "created_at",
];

/** Campos que necesita el borrador de factura (ver `invoiceDraft`). */
export const COLUMNAS_DE_SOLICITUD_PARA_FACTURA = [
  "id",
  "business",
  "email",
  "modules",
  "goal",
  "external_client_id",
  "external_quote_id",
  "status",
];

export const CONSULTA_SOLICITUDES =
  `SELECT ${COLUMNAS_DE_SOLICITUD.join(", ")} ` +
  "FROM quote_requests ORDER BY created_at DESC LIMIT 100";

export const CONSULTA_SOLICITUD_PARA_FACTURA =
  `SELECT ${COLUMNAS_DE_SOLICITUD_PARA_FACTURA.join(", ")} ` +
  "FROM quote_requests WHERE id=$1 FOR UPDATE";
