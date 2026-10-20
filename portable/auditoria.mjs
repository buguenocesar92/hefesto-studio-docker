// Bitácora de accesos a datos personales (Ley 21.719, CWE-778).
//
// El panel de administración entrega datos personales: el correo, el nombre
// del negocio y el objetivo de quien pidió la cotización. La Ley 21.719
// exige que de cada acceso quede constancia de quién accedió, a qué y
// cuándo. Sin ese registro no hay forma de responder a un titular que
// pregunta quién miró sus datos, ni de demostrar ante la autoridad el
// tratamiento que se hizo de ellos.
//
// Dos reglas gobiernan el contenido del registro:
//
// 1. NO se copia el dato. El registro dice cuántos registros se entregaron y
//    qué categorías de dato viajan, para que la bitácora no sea ella misma
//    una nueva copia de la PII.
// 2. NO se copia la credencial. Del token sólo se guarda una huella SHA-256
//    truncada, que permite correlacionar los accesos del mismo token sin
//    que el registro sirva de credencial.
//
// El mismo criterio ya está resuelto en el repo hermano `hefesto-pos`
// (`lib/auditoria.ts` y `lib/ip.ts`); aquí se adapta la forma a Node.

import { createHash } from "node:crypto";

/** Evento que identifica la línea de bitácora. */
export const EVENTO_DE_ACCESO = "acceso_datos_personales";

/** Categorías de dato personal que entrega el panel de administración. */
export const CATEGORIAS_DE_SOLICITUD = [
  "email",
  "nombre_negocio",
  "objetivo",
  "consentimiento",
];

const LARGO_DE_HUELLA = 12;

/**
 * Huella del token con el que se hizo la petición.
 *
 * No es el token: es un SHA-256 truncado. Sirve para correlacionar los
 * accesos hechos con la misma credencial sin que el registro sirva de
 * credencial. Un token de 32 caracteres aleatorios no se puede reconstruir
 * desde la huella.
 */
export function huellaDeToken(authorization) {
  const token = String(authorization ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) return "";
  return createHash("sha256")
    .update(token)
    .digest("hex")
    .slice(0, LARGO_DE_HUELLA);
}

/**
 * IP real del cliente.
 *
 * El edge de confianza (Caddy o el router de Coolify) escribe la IP que él
 * observó. Todo lo que va POR DELANTE en `X-Forwarded-For` lo puso el
 * cliente y es falsificable a voluntad: tomar el PRIMER elemento dejaba la
 * atribución en manos de quien hace la petición. El único elemento
 * confiable es el ÚLTIMO, que escribió el proxy.
 */
export function ipDeCliente(req) {
  const cabeceras = req?.headers ?? {};
  const reenviada = cabeceras["x-forwarded-for"];
  if (typeof reenviada === "string" && reenviada.trim()) {
    const partes = reenviada
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const ultima = partes[partes.length - 1];
    if (ultima) return ultima;
  }
  const real = cabeceras["x-real-ip"];
  if (typeof real === "string" && real.trim()) return real.trim();
  return req?.socket?.remoteAddress || "unknown";
}

/**
 * Ruta del recurso accedido, acotada a un conjunto conocido.
 *
 * La ruta llega desde el cliente, así que no puede escribirse tal cual en
 * la bitácora: un atacante podría esconder un correo en el path (y que la
 * bitácora lo guardara) o inyectar saltos de línea. Por eso la ruta se
 * reduce a una plantilla de las que el servidor reconoce.
 */
export function rutaDeAuditoria(pathname) {
  const cruda = String(pathname ?? "");
  if (/^\/api\/admin\/quotes$/i.test(cruda)) return "/api/admin/quotes";
  if (/^\/api\/admin\/quotes\/[0-9a-f-]{1,36}\/invoice-draft$/i.test(cruda))
    return "/api/admin/quotes/:id/invoice-draft";
  return "/api/admin/:recurso";
}

/**
 * Línea de bitácora del acceso a datos personales.
 *
 * Es un JSON para que la pueda leer una máquina, sin parsear texto libre.
 * `filas` se usa sólo para contarlas: su contenido nunca se copia.
 */
export function registroDeAcceso({
  metodo,
  ruta,
  recurso_id = null,
  resultado,
  ip,
  huella,
  filas,
  categorias = [],
  fecha,
}) {
  return JSON.stringify({
    evento: EVENTO_DE_ACCESO,
    fecha: fecha ?? new Date().toISOString(),
    metodo,
    ruta,
    recurso_id,
    resultado,
    ip,
    huella_token: huella ?? "",
    registros: { solicitudes: Array.isArray(filas) ? filas.length : 0 },
    categorias,
  });
}

/**
 * Escribe la línea de bitácora.
 *
 * `escribir` es inyectable para que la prueba pueda capturarla sin tener
 * que interceptar la salida del proceso.
 */
export function registrarAcceso(evento, escribir = console.log) {
  escribir(registroDeAcceso(evento));
}
