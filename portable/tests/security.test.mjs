import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  aplicarCabecerasDeSeguridad,
  cabecerasDeSeguridad,
} from "../security.mjs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(aqui, "../../dist");

function respuestaFalsa() {
  const fijadas = new Map();
  return {
    fijadas,
    res: {
      setHeader: (nombre, valor) => fijadas.set(nombre, valor),
    },
  };
}

test("La respuesta lleva las cabeceras de seguridad", () => {
  const { fijadas, res } = respuestaFalsa();
  aplicarCabecerasDeSeguridad(res);

  assert.ok(fijadas.has("Content-Security-Policy"));
  assert.ok(fijadas.has("Strict-Transport-Security"));
  assert.ok(fijadas.has("X-Frame-Options"));
  assert.ok(fijadas.has("X-Content-Type-Options"));
  assert.ok(fijadas.has("Referrer-Policy"));
});

test("La CSP bloquea recursos de otros orígenes y las inyecciones conocidas", () => {
  const csp = cabecerasDeSeguridad()["Content-Security-Policy"];

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.match(csp, /form-action 'self'/);
});

test("La CSP deja pasar los scripts y estilos en línea que el sitio usa", () => {
  const csp = cabecerasDeSeguridad()["Content-Security-Policy"];

  assert.match(csp, /script-src 'self' 'unsafe-inline'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /img-src 'self' data:/);
  // La galería de plantillas se=enmarca a sí misma: 'none' la rompería.
  assert.match(csp, /frame-ancestors 'self'/);
});

test("HSTS está activo y sin includeSubDomains", () => {
  const hsts = cabecerasDeSeguridad()["Strict-Transport-Security"];

  assert.match(hsts, /max-age=\d+/);
  assert.ok(
    !hsts.includes("includeSubDomains"),
    "includeSubDomains alcanza subdominios que pueden no servir este sitio",
  );
});

test("La CSP no rompe el sitio construido: sin recursos de otro origen", () => {
  // Si el sitio construido empieza a cargar un CDN, la CSP 'self' lo
  // bloquearía en producción. Esta prueba lo avisa antes.
  if (!fs.existsSync(dist)) {
    return; // el sitio aún no está construido en este checkout
  }
  const offenders = [];
  const patron = /<(script|link|img|iframe)[^>]*\b(?:src|href)=["'](https?:)?\/\//gi;

  for (const archivo of fs.readdirSync(dist)) {
    if (!archivo.endsWith(".html")) continue;
    const contenido = fs.readFileSync(path.join(dist, archivo), "utf8");
    for (const match of contenido.matchAll(patron)) {
      offenders.push(`${archivo}: ${match[0].slice(0, 80)}`);
    }
  }

  assert.deepEqual(offenders, []);
});
