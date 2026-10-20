import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { EVENTO_DE_ACCESO } from "../auditoria.mjs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const portable = path.resolve(aqui, "..");

const TOKEN = "token-de-prueba-de-la-bitacora-0123456789";
const TOKEN_MALO = "token-incorrecto-de-prueba-0123456789";
const EMAIL = "titular@example.cl";
const OBJETIVO = "Necesito un sitio web con agenda de citas";

// Columnas que el listado del panel debe entregar, escritas una por una.
// `external_client_id` NO va: es una referencia interna de Invoice Ninja.
const COLUMNAS_ESPERADAS = [
  "business",
  "consent_at",
  "created_at",
  "email",
  "external_quote_id",
  "goal",
  "id",
  "modules",
  "status",
];

let hijo;
let salida = "";
const puerto = 31000 + (process.pid % 2000);

async function esperarA(condicion, ms = 15000) {
  const limite = Date.now() + ms;
  for (;;) {
    if (await condicion()) return;
    if (Date.now() > limite)
      throw Error("tiempo agotado esperando la condición");
    await new Promise((r) => setTimeout(r, 50));
  }
}

function registrosDe(salida) {
  return salida
    .split("\n")
    .filter((l) => l.includes(`"evento":"${EVENTO_DE_ACCESO}"`))
    .map((l) => JSON.parse(l));
}

async function pedir(ruta, token) {
  const respuesta = await fetch(`http://127.0.0.1:${puerto}${ruta}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      // El edge de confianza escribe la cadena completa: lo de adelante lo
      // puso el cliente y es falsificable.
      "X-Forwarded-For": "203.0.113.9, 198.51.100.7",
    },
  });
  return { respuesta, cuerpo: await respuesta.json() };
}

before(async () => {
  hijo = spawn(
    process.execPath,
    [
      "--import",
      path.join(portable, "tests", "pg-falso.mjs"),
      path.join(portable, "server.mjs"),
    ],
    {
      env: {
        ...process.env,
        ADMIN_API_TOKEN: TOKEN,
        PORT: String(puerto),
        APP_URL: "http://localhost:8080",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  hijo.stdout.on("data", (d) => (salida += d.toString()));
  hijo.stderr.on("data", (d) => (salida += d.toString()));

  await esperarA(async () => {
    try {
      const r = await fetch(`http://127.0.0.1:${puerto}/api/health`);
      return r.ok;
    } catch {
      return false;
    }
  });
});

after(() => {
  if (hijo) hijo.kill("SIGTERM");
});

test("El panel de administración entrega sólo las columnas acordadas", async () => {
  const { respuesta, cuerpo } = await pedir("/api/admin/quotes", TOKEN);

  assert.equal(respuesta.status, 200);
  assert.ok(Array.isArray(cuerpo));
  assert.equal(cuerpo.length, 1);
  // Ni una columna de más: la base tiene `external_client_id` y el listado
  // no la entrega.
  assert.deepEqual(Object.keys(cuerpo[0]).sort(), COLUMNAS_ESPERADAS);
  assert.ok(
    !("external_client_id" in cuerpo[0]),
    "el listado no entrega referencias internas de Invoice Ninja",
  );
});

test("El acceso al panel queda en la bitácora, sin el token ni la PII", async () => {
  await pedir("/api/admin/quotes", TOKEN);

  await esperarA(() => registrosDe(salida).some((r) => r.resultado === "ok"));
  const reg = registrosDe(salida).find((r) => r.resultado === "ok");

  assert.equal(reg.metodo, "GET");
  assert.equal(reg.ruta, "/api/admin/quotes");
  assert.equal(reg.resultado, "ok");
  // La IP se atribuye al último elemento de la cadena, el que escribió el
  // proxy de confianza.
  assert.equal(reg.ip, "198.51.100.7");
  assert.equal(
    reg.huella_token,
    createHash("sha256").update(TOKEN).digest("hex").slice(0, 12),
  );
  assert.equal(reg.registros.solicitudes, 1);

  assert.ok(!salida.includes(TOKEN), "la bitácora no puede contener el token");
  assert.ok(!salida.includes(EMAIL), "la bitácora no puede contener el correo");
  assert.ok(
    !salida.includes(OBJETIVO),
    "la bitácora no puede contener el objetivo",
  );
});

test("Un intento sin credencial también queda registrado", async () => {
  const { respuesta } = await pedir("/api/admin/quotes", TOKEN_MALO);

  assert.equal(respuesta.status, 401);

  await esperarA(() => registrosDe(salida).some((r) => r.resultado === "denegado"));
  const reg = registrosDe(salida).find((r) => r.resultado === "denegado");

  assert.equal(reg.metodo, "GET");
  assert.equal(reg.ruta, "/api/admin/quotes");
  assert.equal(reg.resultado, "denegado");
  assert.equal(
    reg.huella_token,
    createHash("sha256").update(TOKEN_MALO).digest("hex").slice(0, 12),
  );
  assert.equal(reg.registros.solicitudes, 0);
  assert.ok(
    !salida.includes(TOKEN_MALO),
    "la bitácora no puede contener el token, ni siquiera el incorrecto",
  );
});
