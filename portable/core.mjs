export const modules = new Set([
  "web",
  "erp",
  "moodle",
  "bot",
  "rag",
  "lead",
  "automation",
]);
export function validateQuote(b) {
  if (!b || typeof b !== "object") throw Error("Invalid request");
  for (const [key, max] of [
    ["business", 100],
    ["email", 254],
    ["goal", 2000],
  ])
    if (typeof b[key] !== "string" || !b[key].trim() || b[key].length > max)
      throw Error("Invalid " + key);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) throw Error("Invalid email");
  if (b.consent !== true) throw Error("Consent required");
  if (
    !Array.isArray(b.modules) ||
    !b.modules.length ||
    b.modules.length > 7 ||
    b.modules.some((x) => !modules.has(x))
  )
    throw Error("Invalid modules");
  return {
    business: b.business.trim(),
    email: b.email.trim(),
    goal: b.goal.trim(),
    modules: [...new Set(b.modules)],
  };
}
export function safeEndpoint(value) {
  const u = new URL(value);
  if (u.protocol !== "https:" || u.username || u.password)
    throw Error("Integration URL must use HTTPS");
  return u;
}
export async function askWorkflow(question, fetcher = fetch) {
  if (!process.env.N8N_CHAT_URL || !process.env.N8N_CHAT_TOKEN) return null;
  const url = safeEndpoint(process.env.N8N_CHAT_URL);
  const r = await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.N8N_CHAT_TOKEN,
    },
    body: JSON.stringify({
      question,
      locale: "es",
      collection: "hefesto-public",
    }),
    signal: AbortSignal.timeout(20000),
    redirect: "error",
  });
  if (!r.ok) throw Error("Workflow unavailable");
  const data = await r.json();
  if (typeof data.answer !== "string" || data.answer.length > 12000)
    throw Error("Invalid workflow answer");
  return {
    mode: "n8n",
    answer: data.answer,
    sources: Array.isArray(data.sources)
      ? data.sources
          .filter(
            (s) =>
              s &&
              typeof s.title === "string" &&
              typeof s.url === "string" &&
              /^https:\/\//.test(s.url),
          )
          .slice(0, 8)
      : [],
  };
}
export async function invoiceDraft(quote, fetcher = fetch) {
  if (!process.env.INVOICE_NINJA_URL || !process.env.INVOICE_NINJA_TOKEN)
    throw Error("Invoice Ninja not configured");
  const base = safeEndpoint(process.env.INVOICE_NINJA_URL).href.replace(
    /\/$/,
    "",
  );
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-TOKEN": process.env.INVOICE_NINJA_TOKEN,
  };
  const send = async (path, body) => {
    const r = await fetcher(base + "/api/v1/" + path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
      redirect: "error",
    });
    if (!r.ok) throw Error("Invoice Ninja request failed");
    const result = await r.json();
    if (typeof result.data?.id !== "string")
      throw Error("Invalid Invoice Ninja result");
    return result.data.id;
  };
  const client =
    quote.external_client_id ||
    (await send("clients", {
      name: quote.business,
      contacts: [{ email: quote.email }],
      private_notes: "Hefesto request " + quote.id,
    }));
  return {
    clientId: client,
    create: async () =>
      send("quotes", {
        client_id: client,
        private_notes: "Hefesto request " + quote.id + "\n" + quote.goal,
        line_items: quote.modules.map((x) => ({
          product_key: x,
          notes: "Pendiente de valoración profesional",
          cost: 0,
          quantity: 1,
        })),
      }),
  };
}
