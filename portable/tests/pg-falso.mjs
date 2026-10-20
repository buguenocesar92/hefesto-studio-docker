// Postgres de mentira para la prueba de integración.
//
// Se carga con `node --import` antes que `server.mjs` y reemplaza la
// consulta a la base por filas fijas. La prueba del panel no necesita una
// base de datos real, y el CI no tiene Postgres.
//
// El stub respeta la proyección de la consulta, como Postgres: si el
// servidor pide ciertas columnas, devuelve esas. Así la prueba demuestra
// que la minimización se cumple en la consulta y no en el serialize.
//
// Sólo se usa en las pruebas: `portable/tests/pg-falso.mjs` no lo carga
// ningún archivo de producción.

import pg from "pg";

export const FILAS_DE_PRUEBA = [
  {
    id: "11111111-2222-3333-4444-555555555555",
    business: "Comercio de Prueba",
    email: "titular@example.cl",
    modules: ["web"],
    goal: "Necesito un sitio web con agenda de citas",
    consent_at: "2026-10-20T10:00:00.000Z",
    status: "new",
    external_client_id: "cliente-interno-que-no-debe-salir",
    external_quote_id: null,
    created_at: "2026-10-20T10:00:00.000Z",
  },
];

function proyectar(filas, sql) {
  const coincidencia = /select\s+([\s\S]+?)\s+from\s+quote_requests/i.exec(sql);
  if (!coincidencia) return filas;
  const columnas = coincidencia[1].split(",").map((c) => c.trim());
  // `SELECT *` devuelve la fila entera, como en Postgres.
  if (columnas.includes("*")) return filas;
  return filas.map((fila) =>
    Object.fromEntries(columnas.map((columna) => [columna, fila[columna]])),
  );
}

pg.Pool.prototype.query = async (consulta) => {
  const sql =
    typeof consulta === "string"
      ? consulta
      : (consulta && consulta.text) || "";
  const filas = proyectar(FILAS_DE_PRUEBA, sql);
  return { rows: filas, rowCount: filas.length };
};
