import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORIAS_DE_SOLICITUD,
  EVENTO_DE_ACCESO,
  huellaDeToken,
  ipDeCliente,
  registroDeAcceso,
  registrarAcceso,
  rutaDeAuditoria,
} from "../auditoria.mjs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const portable = path.resolve(aqui, "..");

const TOKEN = "token-de-prueba-de-la-bitacora-0123456789";
const EMAIL = "titular@example.cl";
const OBJETIVO = "Necesito un sitio web con agenda de citas";
const NOMBRE = "Comercio de Prueba";

// Una fila tal como la devuelve la base: con datos personales dentro.
const FILAS = [
  {
    id: "11111111-2222-3333-4444-555555555555",
    business: NOMBRE,
    email: EMAIL,
    modules: ["web"],
    goal: OBJETIVO,
    consent_at: "2026-10-20T10:00:00.000Z",
    status: "new",
    external_quote_id: null,
    created_at: "2026-10-20T10:00:00.000Z",
  },
];

function peticionFalsa(cabeceras = {}, socket = {}) {
  return { headers: cabeceras, socket };
}

test("La huella del token no es el token", () => {
  const huella = huellaDeToken("Bearer " + TOKEN);

  assert.notEqual(huella, TOKEN);
  assert.ok(!TOKEN.includes(huella), "el token no puede contenerse en su huella");
  assert.match(huella, /^[0-9a-f]{12}$/);
  // El prefijo Bearer no cambia la huella: el mismo token es el mismo token.
  assert.equal(huellaDeToken(TOKEN), huella);
  assert.notEqual(huellaDeToken("otro-token-cualquiera"), huella);
  assert.equal(huellaDeToken(undefined), "");
  assert.equal(huellaDeToken(""), "");
});

test("El registro NO contiene el token, el correo ni el objetivo", () => {
  const linea = registroDeAcceso({
    metodo: "GET",
    ruta: "/api/admin/quotes",
    resultado: "ok",
    ip: "203.0.113.9",
    huella: huellaDeToken("Bearer " + TOKEN),
    filas: FILAS,
    categorias: CATEGORIAS_DE_SOLICITUD,
  });

  assert.ok(!linea.includes(TOKEN), "el registro no puede contener el token");
  assert.ok(!linea.includes(EMAIL), "el registro no puede contener el correo");
  assert.ok(!linea.includes(OBJETIVO), "el registro no puede contener el objetivo");
  assert.ok(!linea.includes(NOMBRE), "el registro no puede copiar la fila");
});

test("El registro deja constancia de fecha, ruta, resultado, huella e IP", () => {
  const reg = JSON.parse(
    registroDeAcceso({
      metodo: "GET",
      ruta: "/api/admin/quotes",
      resultado: "ok",
      ip: "203.0.113.9",
      huella: huellaDeToken("Bearer " + TOKEN),
      filas: FILAS,
      categorias: CATEGORIAS_DE_SOLICITUD,
    }),
  );

  assert.equal(reg.evento, EVENTO_DE_ACCESO);
  assert.match(reg.fecha, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  assert.equal(reg.metodo, "GET");
  assert.equal(reg.ruta, "/api/admin/quotes");
  assert.equal(reg.resultado, "ok");
  assert.equal(reg.ip, "203.0.113.9");
  assert.equal(reg.huella_token, huellaDeToken("Bearer " + TOKEN));
  assert.deepEqual(reg.categorias, CATEGORIAS_DE_SOLICITUD);
});

test("El registro cuenta los registros entregados, no los copia", () => {
  const reg = JSON.parse(
    registroDeAcceso({
      metodo: "GET",
      ruta: "/api/admin/quotes",
      resultado: "ok",
      ip: "203.0.113.9",
      huella: huellaDeToken("Bearer " + TOKEN),
      filas: FILAS,
      categorias: CATEGORIAS_DE_SOLICITUD,
    }),
  );

  assert.equal(reg.registros.solicitudes, 1);
});

test("La IP se toma del último elemento de X-Forwarded-For", () => {
  // Todo lo que va por delante en la cadena lo puso el cliente y es
  // falsificable: el único elemento confiable es el último, que escribió el
  // proxy de confianza.
  assert.equal(
    ipDeCliente(
      peticionFalsa({ "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.10.11.12" }),
    ),
    "9.10.11.12",
  );
  assert.equal(
    ipDeCliente(peticionFalsa({ "x-forwarded-for": "9.10.11.12" })),
    "9.10.11.12",
  );
  assert.equal(
    ipDeCliente(peticionFalsa({ "x-real-ip": "198.51.100.7" })),
    "198.51.100.7",
  );
  assert.equal(
    ipDeCliente(peticionFalsa({}, { remoteAddress: "127.0.0.1" })),
    "127.0.0.1",
  );
  assert.equal(ipDeCliente(peticionFalsa()), "unknown");
});

test("La ruta se acota a plantillas conocidas", () => {
  assert.equal(rutaDeAuditoria("/api/admin/quotes"), "/api/admin/quotes");
  assert.equal(
    rutaDeAuditoria(
      "/api/admin/quotes/11111111-2222-3333-4444-555555555555/invoice-draft",
    ),
    "/api/admin/quotes/:id/invoice-draft",
  );
  // Un correo escondido en el path no puede llegar a la bitácora.
  assert.equal(
    rutaDeAuditoria("/api/admin/juan@correo.cl"),
    "/api/admin/:recurso",
  );
  // Ni un salto de línea inyectado.
  for (const ruta of ["/api/admin/x\nInyectado", "/api/admin/" + "a".repeat(500)]) {
    const plantilla = rutaDeAuditoria(ruta);
    assert.ok(!/[\r\n]/.test(plantilla));
    assert.ok(plantilla.length <= 120);
  }
});

test("El acceso queda registrado", () => {
  const lineas = [];

  registrarAcceso(
    {
      metodo: "GET",
      ruta: "/api/admin/quotes",
      resultado: "denegado",
      ip: "203.0.113.9",
      huella: huellaDeToken("Bearer " + TOKEN),
      categorias: [],
    },
    (linea) => lineas.push(linea),
  );

  assert.equal(lineas.length, 1);
  const reg = JSON.parse(lineas[0]);
  assert.equal(reg.evento, EVENTO_DE_ACCESO);
  assert.equal(reg.resultado, "denegado");
  assert.equal(reg.registros.solicitudes, 0);
  assert.ok(!lineas[0].includes(TOKEN));
});

// --- El panel de administración debe pasar SIEMPRE por la bitácora ---

const fuenteDelServidor = fs.readFileSync(
  path.join(portable, "server.mjs"),
  "utf8",
);
const ramaAdmin = fuenteDelServidor.slice(
  fuenteDelServidor.indexOf('url.pathname.startsWith("/api/admin/")'),
);

test("El panel de administración pasa por la bitácora", () => {
  assert.match(
    fuenteDelServidor,
    /import \{[^}]*registrarAcceso[^}]*\} from "\.\/auditoria\.mjs"/,
  );

  const llamadas = ramaAdmin.match(/registrarAcceso\(/g) || [];
  assert.ok(
    llamadas.length >= 2,
    "se espera un registro por acceso entregado y otro por intento denegado",
  );
  assert.match(ramaAdmin, /resultado: "denegado"/);
  assert.match(ramaAdmin, /resultado: "ok"/);
});

test("El panel de administración no escribe las filas en crudo", () => {
  assert.ok(
    !/console\.log\(\s*(r\.rows|JSON\.stringify\(\s*r\.rows)/.test(ramaAdmin),
    "las filas con datos personales no se escriben en el log",
  );
});

test("El servidor no consulta la tabla entera", () => {
  assert.ok(
    !/select\s+\*/i.test(fuenteDelServidor),
    "con SELECT * toda columna futura se filtra sin revisión",
  );
});
