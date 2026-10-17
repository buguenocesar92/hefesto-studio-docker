import { pool } from "../db.mjs";
import { readdir, readFile } from "node:fs/promises";
const c = await pool.connect();
try {
  await c.query("SELECT pg_advisory_lock(724091)");
  await c.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of (await readdir(new URL("../migrations/", import.meta.url)))
    .filter((x) => x.endsWith(".sql"))
    .sort()) {
    if (
      (
        await c.query("SELECT 1 FROM schema_migrations WHERE version=$1", [
          name,
        ])
      ).rowCount
    )
      continue;
    await c.query("BEGIN");
    try {
      await c.query(
        await readFile(
          new URL("../migrations/" + name, import.meta.url),
          "utf8",
        ),
      );
      await c.query("INSERT INTO schema_migrations(version) VALUES($1)", [
        name,
      ]);
      await c.query("COMMIT");
      console.log("Applied", name);
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    }
  }
} finally {
  await c.query("SELECT pg_advisory_unlock(724091)");
  c.release();
  await pool.end();
}
