import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/dashboard.js";
import { RECORDS, CLASSES } from "../lib/records.js";
import { readFile } from "node:fs/promises";

const get = () => handler(new Request("https://example.test/api/dashboard"));
const html = () => readFile(new URL("../public/index.html", import.meta.url), "utf8");

test("dashboard GET is bounded and current", async () => {
  const r = get();
  assert.equal(r.status, 200);
  const d = await r.json();
  assert.ok(d.records.length >= 5);
  assert.equal(d.retrievedOn, "2026-08-29");
  assert.equal(d.records.find(x => x.id === "ketamine-board").sourceUrl, "https://www.oversightboard.com/decision/ig-tom6ixvh/");
  assert.match(d.records.find(x => x.id === "ssdp-coalition").boundary, /Does not independently verify/);
});

test("dashboard rejects writes", () =>
  assert.equal(handler(new Request("https://example.test/api/dashboard", { method: "POST" })).status, 405));

test("routing has no catch-all soft 404", async () => {
  const c = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url)));
  assert.equal(c.rewrites.some(x => x.source === "/(.*)" || x.source === "/.*"), false);
});

test("records with no retrievable source are disclosed, not linked", async () => {
  const d = await get().json();
  const r = d.records.find(x => x.id === "congress-letter");
  assert.equal(r.sourceUrl, null);
  assert.match(r.establishes, /Nothing\./);
  assert.match(r.sourceNote, /404/);
  assert.match(await html(), /Source unavailable/);
});

test("every record states what it establishes, its boundary, and the inference it invites", async () => {
  const d = await get().json();
  for (const r of d.records) {
    assert.ok(r.establishes && r.establishes.length > 10, `${r.id} establishes`);
    assert.ok(r.boundary && r.boundary.length > 10, `${r.id} boundary`);
    assert.ok(r.misuse && r.misuse.length > 40, `${r.id} misuse`);
    assert.ok(r.whatWouldChange && r.whatWouldChange.length > 20, `${r.id} whatWouldChange`);
    assert.ok(r.type && r.status, `${r.id} classification`);
  }
});

test("every record belongs to a declared source class", async () => {
  const d = await get().json();
  for (const r of d.records) assert.ok(CLASSES[r.type], `${r.id} has undeclared class ${r.type}`);
});

test("advocacy allegations are never classified as decisions", async () => {
  const d = await get().json();
  for (const r of d.records) {
    if (/allegation|Advocacy/i.test(r.type + r.status)) assert.doesNotMatch(r.status, /overturned|upheld|decision/i, `${r.id}`);
  }
});

test("the rendered page is not stale against the record module", async () => {
  const page = await html();
  for (const r of RECORDS) {
    assert.ok(page.includes(`id="${r.id}"`), `${r.id} missing from public/index.html — run node scripts/render.mjs`);
    assert.ok(page.includes(r.boundary.slice(0, 60).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))), `${r.id} boundary stale in public/index.html`);
  }
});

test("the register carries evidence that cuts against its own thesis", async () => {
  const page = await html();
  assert.match(page, /counter-evidence|stayed up|cuts against/i);
});
