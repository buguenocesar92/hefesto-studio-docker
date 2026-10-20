import test from "node:test";
import assert from "node:assert/strict";
import {
  COLUMNAS_DE_SOLICITUD,
  COLUMNAS_DE_SOLICITUD_PARA_FACTURA,
  CONSULTA_SOLICITUDES,
  CONSULTA_SOLICITUD_PARA_FACTURA,
} from "../admin.mjs";

// El panel de administración devuelve datos personales (correo, nombre del
// negocio, objetivo). Escribirlos uno por uno es lo que hace que la
// minimización se cumpla: con `SELECT *`, la respuesta cambia sola cuando
// se le agrega una columna a la tabla.

test("Ninguna consulta del panel devuelve la tabla entera", () => {
  assert.ok(!/select\s+\*/i.test(CONSULTA_SOLICITUDES));
  assert.ok(!/select\s+\*/i.test(CONSULTA_SOLICITUD_PARA_FACTURA));
});

test("El listado trae lo que el administrador necesita para trabajar", () => {
  for (const columna of [
    "id",
    "business",
    "email",
    "modules",
    "goal",
    "consent_at",
    "status",
    "created_at",
    "external_quote_id",
  ]) {
    assert.ok(
      COLUMNAS_DE_SOLICITUD.includes(columna),
      `el listado necesita ${columna}`,
    );
  }
});

test("El listado NO trae referencias internas de Invoice Ninja", () => {
  assert.ok(
    !COLUMNAS_DE_SOLICITUD.includes("external_client_id"),
    "external_client_id es una referencia interna y no la necesita el listado",
  );
});

test("El listado sigue: top 100 y ordenadas por fecha", () => {
  assert.match(CONSULTA_SOLICITUDES, /ORDER BY created_at DESC/);
  assert.match(CONSULTA_SOLICITUDES, /LIMIT 100/);
});

test("La consulta de la factura trae los campos que usa invoiceDraft", () => {
  // invoiceDraft() usa business, email, modules, goal, external_client_id e
  // id; el servidor usa status y external_quote_id. Si alguno falta, el
  // borrador de factura se rompe.
  for (const columna of [
    "id",
    "business",
    "email",
    "modules",
    "goal",
    "external_client_id",
    "external_quote_id",
    "status",
  ]) {
    assert.ok(
      COLUMNAS_DE_SOLICITUD_PARA_FACTURA.includes(columna),
      `el borrador de factura necesita ${columna}`,
    );
  }
  assert.match(CONSULTA_SOLICITUD_PARA_FACTURA, /FOR UPDATE/);
});
