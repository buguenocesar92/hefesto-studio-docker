// El límite de peticiones no se puede evadir con X-Forwarded-For falsificado.
//
// El cubo del rate limit se armaba con el PRIMER elemento de
// `X-Forwarded-For`. Ese elemento lo pone el cliente y es falsificable a
// voluntad: mandando una IP distinta en cada petición, cada una abría su
// propio cubo y el límite de 15 req/min nunca se alcanzaba (CWE-290,
// CWE-770).
//
// El único elemento confiable es el ÚLTIMO, que escribió el proxy de
// confianza. Este archivo levanta el servidor de verdad y lo demuestra:
// manda 16 peticiones del mismo cliente con un prefijo distinto cada vez y
// comprueba que la 16ª rebota con 429, o sea que el cubo NO se reinicia.
//
// El criterio es el del repo hermano `hefesto-pos` (`lib/ip.ts`).

import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const portable = path.resolve(aqui, "..");

const TOKEN = "token-de-prueba-del-limite-0123456789";
const puerto = 33000 + (process.pid % 2000);

// La IP del cliente real: la escribió el proxy de confianza y no cambia
// entre peticiones.
const IP_DEL_CLIENTE = "198.51.100.9";
// Otra IP real, para comprobar que el límite es por cliente y no global.
const OTRO_CLIENTE = "198.51.100.77";
// El prefijo que falsifica el cliente: cambia a propósito en cada
// petición y es justo lo que el cubo NO debe usar.
const PREFIJO_FALSIFICADO = "203.0.113.";

// Ruta que bajo `/api/` no existe: cuenta para el cubo y la sirve el
// router con 404, así se ve que la petición llegó al servidor.
const RUTA = "/api/ratelimit-prueba";

let hijo;
let salida = "";

async function esperarA(condicion, ms = 15000) {
  const limite = Date.now() + ms;
  for (;;) {
    if (await condicion()) return;
    if (Date.now() > limite)
      throw Error("tiempo agotado esperando la condición");
    await new Promise((r) => setTimeout(r, 50));
  }
}

async function pedir(cabeceras = {}) {
  const respuesta = await fetch(`http://127.0.0.1:${puerto}${RUTA}`, {
    headers: cabeceras,
  });
  return respuesta.status;
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

test("El spoofing de X-Forwarded-For no abre un cubo nuevo", async () => {
  const estados = [];
  for (let i = 0; i < 16; i++) {
    // El prefijo cambia en cada petición (lo que el cliente controla) y el
    // último elemento es siempre el que escribió el proxy de confianza.
    estados.push(
      await pedir({
        "X-Forwarded-For": `${PREFIJO_FALSIFICADO}${i + 1}, ${IP_DEL_CLIENTE}`,
      }),
    );
  }

  // Las 15 primeras pasan y las sirve el router.
  assert.deepEqual(
    estados.slice(0, 15),
    Array(15).fill(404),
    "las 15 primeras peticiones se sirven: el cubo es el mismo cliente",
  );
  // La 16ª rebota: el límite se aplica al mismo cubo.
  assert.equal(
    estados[15],
    429,
    "la 16a peticion debe rebotar con 429: el spoofing no reinicia el cubo",
  );
});

test("El límite es por cliente, no global", async () => {
  const estado = await pedir({
    "X-Forwarded-For": `192.0.2.5, ${OTRO_CLIENTE}`,
  });

  assert.notEqual(
    estado,
    429,
    "otro cliente no puede heredar el cubo que agota el primero",
  );
});

test("El cubo no se arma con el primer elemento de X-Forwarded-For", () => {
  const fuente = fs.readFileSync(path.join(portable, "server.mjs"), "utf8");
  const inicio = fuente.indexOf("function limited(");
  const cuerpo = fuente.slice(inicio, fuente.indexOf("\n}", inicio));

  assert.ok(inicio > -1, "el servidor debe seguir teniendo el cubo del límite");
  assert.match(
    cuerpo,
    /ipDeCliente\(req\)/,
    "el cubo debe usar la IP de confianza, la misma de la bitácora",
  );
  assert.ok(
    !/\[\s*0\s*\]/.test(cuerpo),
    "el primer elemento de X-Forwarded-For lo pone el cliente y es falsificable",
  );
});
