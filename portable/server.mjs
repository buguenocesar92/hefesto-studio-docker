import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { pool } from "./db.mjs";
import { validateQuote, askWorkflow, invoiceDraft } from "./core.mjs";
import { aplicarCabecerasDeSeguridad } from "./security.mjs";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url))),
  runtime = await readFile(new URL("./public/runtime.js", import.meta.url));
const origin = new URL(process.env.APP_URL || "http://localhost:8080").origin;
if (!process.env.ADMIN_API_TOKEN || process.env.ADMIN_API_TOKEN.length < 32)
  throw Error("Set a strong ADMIN_API_TOKEN");
const buckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
}, 60000).unref();
function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}
function auth(req) {
  const got = Buffer.from(req.headers.authorization || ""),
    expected = Buffer.from("Bearer " + process.env.ADMIN_API_TOKEN);
  return got.length === expected.length && timingSafeEqual(got, expected);
}
async function body(req) {
  let size = 0,
    chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 16000) throw Error("Body too large");
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}
function limited(req) {
  const key =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress;
  const b = buckets.get(key) || { count: 0, until: Date.now() + 60000 };
  if (b.until < Date.now()) {
    b.count = 0;
    b.until = Date.now() + 60000;
  }
  b.count++;
  buckets.set(key, b);
  return b.count > 15;
}
const server = http.createServer(async (req, res) => {
  aplicarCabecerasDeSeguridad(res);
  const url = new URL(req.url, "http://local");
  try {
    if (url.pathname === "/api/health") {
      await pool.query("SELECT 1");
      return json(res, 200, { ok: true });
    }
    if (url.pathname.startsWith("/api/")) {
      if (limited(req))
        return json(res, 429, {
          error: "Espera un minuto antes de continuar.",
        });
      if (
        req.method === "POST" &&
        req.headers.origin &&
        req.headers.origin !== origin
      )
        return json(res, 403, { error: "Origin denied" });
      if (url.pathname === "/api/quotes" && req.method === "POST") {
        let q;
        try {
          q = validateQuote(await body(req));
        } catch {
          return json(res, 422, {
            error:
              "Revisa negocio, correo, servicios, objetivo y consentimiento.",
          });
        }
        const id = randomUUID();
        await pool.query(
          "INSERT INTO quote_requests(id,business,email,modules,goal,consent_at) VALUES($1,$2,$3,$4,$5,now())",
          [id, q.business, q.email, JSON.stringify(q.modules), q.goal],
        );
        return json(res, 201, { id, status: "received" });
      }
      if (url.pathname === "/api/chat" && req.method === "POST") {
        const b = await body(req);
        if (
          typeof b.question !== "string" ||
          !b.question.trim() ||
          b.question.length > 1000
        )
          return json(res, 422, { error: "Pregunta inválida" });
        const result = await askWorkflow(b.question.trim());
        return result
          ? json(res, 200, result)
          : json(res, 503, {
              error: "El asistente IA aún no está conectado.",
              mode: "unconfigured",
            });
      }
      if (url.pathname.startsWith("/api/admin/")) {
        if (!auth(req)) return json(res, 401, { error: "Unauthorized" });
        if (url.pathname === "/api/admin/quotes" && req.method === "GET") {
          const r = await pool.query(
            "SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT 100",
          );
          return json(res, 200, r.rows);
        }
        const match = url.pathname.match(
          /^\/api\/admin\/quotes\/([0-9a-f-]{36})\/invoice-draft$/,
        );
        if (match && req.method === "POST") {
          if (!process.env.INVOICE_NINJA_URL || !process.env.INVOICE_NINJA_TOKEN) return json(res, 503, {error: "Invoice Ninja no está configurado"});
          const c = await pool.connect();
          try {
            await c.query("BEGIN");
            const r = await c.query(
              "SELECT * FROM quote_requests WHERE id=$1 FOR UPDATE",
              [match[1]],
            );
            const q = r.rows[0];
            if (!q) {
              await c.query("ROLLBACK");
              return json(res, 404, { error: "Not found" });
            }
            if (q.external_quote_id) {
              await c.query("COMMIT");
              return json(res, 200, {
                id: q.external_quote_id,
                existing: true,
              });
            }
            if (q.status === "invoice_pending") {
              await c.query("ROLLBACK");
              return json(res, 409, {
                error:
                  "Reconcile previous attempt in Invoice Ninja before retrying",
              });
            }
            await c.query(
              "UPDATE quote_requests SET status='invoice_pending' WHERE id=$1",
              [q.id],
            );
            await c.query("COMMIT");
            const draft = await invoiceDraft(q);
            await c.query(
              "UPDATE quote_requests SET external_client_id=$2 WHERE id=$1",
              [q.id, draft.clientId],
            );
            const id = await draft.create();
            await c.query(
              "UPDATE quote_requests SET external_quote_id=$2,status='draft' WHERE id=$1",
              [q.id, id],
            );
            await c.query(
              "INSERT INTO integration_events(quote_id,provider,status) VALUES($1,'invoice_ninja','draft_created')",
              [q.id],
            );
            return json(res, 201, { id, priceReviewRequired: true });
          } catch (e) {
            await c.query("ROLLBACK").catch(() => {});
            throw e;
          } finally {
            c.release();
          }
        }
      }
      return json(res, 404, { error: "Not found" });
    }
    if (!["GET", "HEAD"].includes(req.method))
      return json(res, 405, { error: "Method not allowed" });
    if (url.pathname === "/portable-runtime.js") {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      return res.end(req.method === "HEAD" ? undefined : runtime);
    }
    let file = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root)
      return json(res, 403, { error: "Forbidden" });
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    let content = await readFile(file);
    const ext = path.extname(file),
      mime =
        {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "text/javascript",
          ".svg": "image/svg+xml",
          ".webp": "image/webp",
          ".png": "image/png",
          ".json": "application/json",
          ".zip": "application/zip",
          ".woff2": "font/woff2",
        }[ext] || "application/octet-stream";
    if (file === path.join(root, "index.html")) {
      const s = content.toString(),
        i = s.lastIndexOf("</body>");
      content = Buffer.from(
        s.slice(0, i) +
          '<script src="/portable-runtime.js"></script>' +
          s.slice(i),
      );
    }
    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": content.length,
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch (e) {
    if (e.code === "ENOENT") return json(res, 404, { error: "Not found" });
    console.error("request_failed", url.pathname);
    json(res, 503, {
      error:
        "Servicio temporalmente no disponible. No repitas una operación externa sin revisar su estado.",
    });
  }
});
server.listen(3000, "0.0.0.0");
process.on("SIGTERM", () => server.close(() => pool.end()));
