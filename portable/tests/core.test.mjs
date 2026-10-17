import test from "node:test";
import assert from "node:assert/strict";
import {
  validateQuote,
  askWorkflow,
  invoiceDraft,
  safeEndpoint,
} from "../core.mjs";
const valid = {
  business: "Demo",
  email: "test@example.com",
  goal: "Sitio web",
  modules: ["web"],
  consent: true,
};
test("Quote validates consent and known modules", () => {
  assert.deepEqual(validateQuote(valid), {
    business: "Demo",
    email: "test@example.com",
    goal: "Sitio web",
    modules: ["web"],
  });
  for (const b of [
    { ...valid, consent: false },
    { ...valid, modules: ["unknown"] },
    { ...valid, email: "invalid" },
  ])
    assert.throws(() => validateQuote(b));
  assert.throws(() => safeEndpoint("http://example.com"));
});
test("Chat configuration and response safety", async () => {
  delete process.env.N8N_CHAT_URL;
  delete process.env.N8N_CHAT_TOKEN;
  assert.equal(await askWorkflow("Hola"), null);
  process.env.N8N_CHAT_URL = "https://example.com/webhook";
  process.env.N8N_CHAT_TOKEN = "test";
  const result = await askWorkflow("Hola", async (u, o) => {
    assert.equal(o.headers.Authorization, "Bearer test");
    return {
      ok: true,
      json: async () => ({
        answer: "Respuesta",
        sources: [
          { title: "bad", url: "javascript:alert(1)" },
          { title: "Good", url: "https://example.com" },
        ],
      }),
    };
  });
  assert.equal(result.sources.length, 1);
});
test("Invoice connector reuses client and creates unsent draft", async () => {
  process.env.INVOICE_NINJA_URL = "https://invoice.example.com";
  process.env.INVOICE_NINJA_TOKEN = "test";
  const calls = [];
  const draft = await invoiceDraft(
    { ...valid, id: "req", external_client_id: "client" },
    async (u, o) => {
      calls.push({ u, b: JSON.parse(o.body) });
      return { ok: true, json: async () => ({ data: { id: "quote" } }) };
    },
  );
  assert.equal(calls.length, 0);
  assert.equal(await draft.create(), "quote");
  assert.equal(calls[0].b.client_id, "client");
  assert.equal(calls[0].b.line_items[0].cost, 0);
  assert.equal(calls[0].b.send_email, undefined);
});
