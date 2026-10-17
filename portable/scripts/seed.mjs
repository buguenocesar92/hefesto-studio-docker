import { pool } from "../db.mjs";
import { readdir, readFile } from "node:fs/promises";
try {
  for (const file of (
    await readdir(new URL("../../content/", import.meta.url))
  ).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(
      await readFile(new URL("../../content/" + file, import.meta.url), "utf8"),
    );
    await pool.query(
      "INSERT INTO content_documents(id,payload) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=now()",
      [file.slice(0, -5), JSON.stringify(data)],
    );
    console.log("Seeded", file);
  }
} finally {
  await pool.end();
}
