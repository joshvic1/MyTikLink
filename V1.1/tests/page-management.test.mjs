import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const source = await fs.readFile(new URL("../lib/leadExport.js", import.meta.url), "utf8");
const { leadsCsv } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
const { normalizeLeadPhone } = await import("../lib/leadPhone.js");
test("CSV neutralizes formulas, preserves quotes, and retains international numbers as text", () => {
  for (const name of ["=1+1", "+1+1", "-1+1", "@SUM(A1)", "  =1+1", "\t=1+1"]) {
    assert.ok(leadsCsv([{ name, whatsapp: "+2348012345678" }]).includes(`"'${name}"`));
  }
  assert.ok(leadsCsv([{ name: 'Ada "A"', whatsapp: "+447911123456" }]).includes('"Ada ""A"""'));
  assert.ok(leadsCsv([{ whatsapp: "+447911123456" }]).includes('"\'+447911123456"'));
});
test("international WhatsApp numbers are normalized without guessing local-country context", () => {
  assert.equal(normalizeLeadPhone("+234 801 234 5678"), "+2348012345678");
  assert.equal(normalizeLeadPhone("0044 7911 123456"), "+447911123456");
  assert.equal(normalizeLeadPhone("08012345678"), null);
  assert.equal(normalizeLeadPhone("hello"), null);
});

const { loadPageCollection } = await import("../lib/pageCollection.js");
test("new collection API does not request page details or lead records", async () => {
  const payload = { pages: [{ _id: "one", builderType: "custom" }], summary: { pages: 1, leads: 3 }, total: 1, page: 1, limit: 20 };
  const result = await loadPageCollection({ pageCollection: async () => payload, pageDetail() { throw new Error("Unexpected detail request"); } });
  assert.equal(result, payload);
});
test("legacy rollout loads private metadata only for the displayed search results", async () => {
  const calls = [];
  const result = await loadPageCollection({
    pageCollection: async () => [{ _id: "one", title: "Offer", slug: "offer", leadsCount: 2 }, { _id: "two", title: "Training", slug: "training", leadsCount: 4 }],
    pageDetail: async id => { calls.push(id); return { builderType: "custom", customContent: [{ type: "form" }] }; },
  }, { search: "offer", page: 1 });
  assert.deepEqual(calls, ["one"]);
  assert.equal(result.pages[0].builderType, "custom");
  assert.equal(result.pages[0].availability, "unverified");
  assert.equal(result.pages[0].hasLeadForm, true);
  assert.equal(result.summary.leads, 6);
  assert.equal(result.total, 1);
});
test("failed collection requests never become a successful empty state", async () => {
  await assert.rejects(loadPageCollection({ pageCollection: async () => { throw new Error("offline"); } }), /offline/);
});

const apiSource = await fs.readFile(new URL("../lib/api.js", import.meta.url), "utf8");
const { v11Api, apiRequest } = await import(`data:text/javascript;base64,${Buffer.from(apiSource).toString("base64")}`);
test("malformed lead responses are errors, not empty collections", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, headers: { get: () => "application/json" }, json: async () => ({ unexpected: true }) });
    await assert.rejects(v11Api.pageLeads("page"), /Could not load leads/);
  } finally { globalThis.fetch = original; }
});
test("bounded read requests abort a stalled connection", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
    await assert.rejects(apiRequest("/pages", { timeoutMs: 10 }), /aborted/);
  } finally { globalThis.fetch = original; }
});

const { isV11Enabled } = await import("../lib/release.js");
test("V1.1 stays hidden in production even with an old enable flag", () => {
  const previous = { node: process.env.NODE_ENV, flag: process.env.NEXT_PUBLIC_ENABLE_V11 };
  try {
    process.env.NODE_ENV = "production"; delete process.env.NEXT_PUBLIC_ENABLE_V11;
    assert.equal(isV11Enabled(), false);
    process.env.NODE_ENV = "development"; assert.equal(isV11Enabled(), true);
    process.env.NODE_ENV = "production"; process.env.NEXT_PUBLIC_ENABLE_V11 = "true";
    assert.equal(isV11Enabled(), false);
  } finally {
    if (previous.node === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous.node;
    if (previous.flag === undefined) delete process.env.NEXT_PUBLIC_ENABLE_V11; else process.env.NEXT_PUBLIC_ENABLE_V11 = previous.flag;
  }
});
