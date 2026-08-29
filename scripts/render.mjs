// Writes the register into public/index.html and the method page into
// public/sources.html from the single record module in lib/records.js.
//
// This runs by hand, not at deploy time — the site has no build step and the
// committed HTML is the artefact. It exists so the page carries its own content:
// the register is readable, linkable and printable with JavaScript switched off,
// and app.js only filters what is already there.
//
//   node scripts/render.mjs

import { writeFile } from "node:fs/promises";
import { RECORDS, CLASSES, READING_RULES, RETRIEVED_ON, NEXT_REVIEW } from "../lib/records.js";

const root = new URL("../", import.meta.url);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const uniq = (values) => [...new Set(values)].sort();

const head = (title, description, canonical) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${esc(canonical)}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta property="og:title" content="${esc(title)}"><meta property="og:image" content="https://aloha-suppression-sweep.vercel.app/og-image.png"><meta property="og:type" content="website"><meta property="og:description" content="${esc(description)}">`;

function field(label, body, className) {
  if (!body) return "";
  return `<div class="field${className ? " " + className : ""}"><h4>${esc(label)}</h4><p>${esc(body)}</p></div>`;
}

function card(record) {
  const cls = CLASSES[record.type] || {};
  const search = [record.title, record.claim, record.type, record.platform, record.status, record.procedural, record.establishes, record.boundary, record.misuse, record.whatWouldChange, record.recommendations].filter(Boolean).join(" ").toLowerCase();
  return `<article class="card" id="${esc(record.id)}" data-id="${esc(record.id)}" data-platform="${esc(record.platform)}" data-type="${esc(record.type)}" data-date="${esc(record.date)}" data-title="${esc(record.title)}" data-linked="${record.sourceUrl ? "yes" : "no"}" data-text="${esc(search)}">
<div class="card-top"><div class="tags"><span class="tag tag--type">${esc(record.type)}</span><span class="tag">${esc(record.platform)}</span><span class="tag">${esc(record.status)}</span></div><a class="permalink" href="#${esc(record.id)}" aria-label="Permanent link to ${esc(record.title)}">#</a></div>
<h3>${esc(record.title)}</h3>
<p class="meta"><time datetime="${esc(record.date)}">${esc(longDate(record.date))}</time> · source checked <time datetime="${esc(record.verifiedOn)}">${esc(longDate(record.verifiedOn))}</time>${record.dateNote ? ` · ${esc(record.dateNote)}` : ""}</p>
<p class="claim">${esc(record.claim)}</p>
<div class="fields">
${field("Evidentiary weight of this class", cls.weight)}
${field("What the record shows", record.procedural)}
${field("What it establishes", record.establishes)}
${field("What it does not establish", record.boundary, "boundary")}
${field("The inference it invites, and why that fails", record.misuse, "misuse")}
${field("What the Board asked Meta to change", record.recommendations)}
${field("Note", record.note)}
${field("What would change this record", record.whatWouldChange)}
</div>
<p class="source">${record.sourceUrl
    ? `<a href="${esc(record.sourceUrl)}" rel="noopener noreferrer">Open the source<span class="sr-only"> for ${esc(record.title)} (opens in a new tab)</span></a>`
    : `<strong>Source unavailable.</strong> ${esc(record.sourceNote || "The cited source could not be retrieved.")}`}</p>
<div class="actions">
<label for="assessment-${esc(record.id)}">Your assessment of ${esc(record.title)}<select id="assessment-${esc(record.id)}" data-action="assessment"><option>Unreviewed</option><option>Priority follow-up</option><option>Context only</option></select></label>
<button type="button" data-action="save" aria-pressed="false"><span data-label>Save</span><span class="sr-only"> ${esc(record.title)}</span></button>
</div>
</article>`;
}

const platforms = uniq(RECORDS.map((r) => r.platform));
const types = uniq(RECORDS.map((r) => r.type));

const index = `${head(
  "Platform Moderation Evidence Lab",
  "A bounded, source-linked register of public platform-moderation evidence. Each record states what its source establishes, what it does not, and the inference it invites.",
  "https://aloha-suppression-sweep.vercel.app/",
)}<script src="/app.js" defer></script></head><body>
<a class="skip" href="#main">Skip to evidence register</a>
<header>
<p class="eyebrow">Evidence before inference</p>
<h1>Platform Moderation Evidence Lab</h1>
<p class="deck">Five public records about how Meta has moderated drug-policy content. Every one of them is real. Every one of them is regularly asked to prove something it cannot. This register keeps both halves on the same card.</p>
<nav aria-label="Site"><a href="/sources">Method &amp; sources</a><a href="/privacy">Privacy</a></nav>
</header>
<main id="main" tabindex="-1">

<section class="rules" aria-labelledby="rules-title">
<h2 id="rules-title">Five reading rules</h2>
<p class="rules-lede">The characteristic failure in this subject area is not fabricated evidence. It is real evidence stretched past what it can carry — usually by one step, usually in a direction the reader already believed. These are the five steps that get taken.</p>
<ol class="rules-list">
${READING_RULES.map((r) => `<li><h3>${esc(r.rule)}</h3><p>${esc(r.body)}</p></li>`).join("")}
</ol>
</section>

<section class="classes" aria-labelledby="classes-title">
<h2 id="classes-title">What each class of source can carry</h2>
<p>Four kinds of document sit in this register. They are not interchangeable, and the difference between them is the difference between a finding and a claim.</p>
<div class="table-wrap">
<table>
<caption class="sr-only">Evidentiary weight, capacity and limits of each source class in the register</caption>
<thead><tr><th scope="col">Source class</th><th scope="col">Weight</th><th scope="col">Carries</th><th scope="col">Cannot carry</th></tr></thead>
<tbody>${Object.entries(CLASSES).map(([name, c]) => `<tr><th scope="row">${esc(name)}</th><td>${esc(c.weight)}</td><td>${esc(c.carries)}</td><td>${esc(c.cannot)}</td></tr>`).join("")}</tbody>
</table>
</div>
</section>

<section class="controls" aria-labelledby="filters-title">
<h2 id="filters-title">Filter the register</h2>
<form id="filters" role="search">
<div class="grid">
<label for="search">Search every field<input id="search" name="q" type="search" autocomplete="off" placeholder="enforcement, shadowban, branded content…"></label>
<label for="platform">Platform<select id="platform" name="platform"><option value="">All platforms</option>${platforms.map((p) => `<option>${esc(p)}</option>`).join("")}</select></label>
<label for="type">Source class<select id="type" name="type"><option value="">All source classes</option>${types.map((t) => `<option>${esc(t)}</option>`).join("")}</select></label>
<label for="assessment">Your assessment<select id="assessment" name="assessment"><option value="">All assessments</option><option>Unreviewed</option><option>Priority follow-up</option><option>Context only</option></select></label>
<label for="sort">Order<select id="sort" name="sort"><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="type">Source class</option><option value="title">Title A–Z</option></select></label>
</div>
<div class="toolbar">
<p id="summary" role="status" aria-live="polite">${RECORDS.length} of ${RECORDS.length} records shown.</p>
<button type="button" id="clear" class="secondary">Clear filters</button>
<button type="button" id="share" class="secondary" hidden>Copy link to this view</button>
<button type="button" id="export">Export JSON</button>
<button type="button" id="reset" class="secondary">Reset local review</button>
</div>
<noscript><p class="meta">Filtering, local review and export need JavaScript. All ${RECORDS.length} records are printed in full below either way.</p></noscript>
</form>
</section>

<section aria-labelledby="register-title">
<h2 id="register-title">Evidence register</h2>
<div id="cards" class="cards">${RECORDS.map(card).join("")}</div>
<p id="empty" class="notice" hidden>No records match these filters.</p>
</section>

</main>
<footer>
<p>Sources manually checked <time datetime="${esc(RETRIEVED_ON)}">${esc(longDate(RETRIEVED_ON))}</time>. Next review due <time datetime="${esc(NEXT_REVIEW)}">${esc(longDate(NEXT_REVIEW))}</time>. Nothing here is legal advice.</p>
<p><a href="/sources">Method &amp; sources</a> · <a href="/privacy">Privacy</a></p>
</footer>
</body></html>`;

const sources = `${head(
  "Method & sources · Platform Moderation Evidence Lab",
  "How each record in the evidence register was retrieved, what was read, and the boundaries that govern how it may be used.",
  "https://aloha-suppression-sweep.vercel.app/sources",
)}</head><body>
<a class="skip" href="#main">Skip to content</a>
<header>
<p class="eyebrow">Platform Moderation Evidence Lab</p>
<h1>Method &amp; sources</h1>
<nav aria-label="Site"><a href="/">Evidence register</a><a href="/privacy">Privacy</a></nav>
</header>
<main id="main" class="prose" tabindex="-1">

<h2>What verification means here</h2>
<p>A record enters this register only when someone has opened the cited document, read the passage the record rests on, and written down the date. That is a narrow claim and it is worth being precise about what it excludes. It does not mean the source is correct. It does not mean the source is current. It does not mean the events described occurred as described — for two of the five records, the source is a party asserting its own case, and reading it carefully cannot make it more than that.</p>
<p>What the check does establish is that the record is not a summary of a summary. Every quotation, date, count and procedural step on the register page was taken from the document itself on <time datetime="${esc(RETRIEVED_ON)}">${esc(longDate(RETRIEVED_ON))}</time>, not from a secondary account of it.</p>

<h2>The four source classes</h2>
<p>The register sorts its material into four classes, and the class determines what a record is permitted to assert.</p>
${Object.entries(CLASSES).map(([name, c]) => `<h3>${esc(name)}</h3><p><strong>Weight.</strong> ${esc(c.weight)}</p><p><strong>Carries.</strong> ${esc(c.carries)}</p><p><strong>Cannot carry.</strong> ${esc(c.cannot)}</p>`).join("")}

<h2>Why the register holds counter-evidence</h2>
<p>One of the two adjudicated decisions here cuts against the suppression thesis: a commercial post promoting ketamine treatment stayed up through three removals and restorations, was defended by Meta, and was ordered removed only after the Board intervened. It is in the register on purpose. An evidence base assembled to support a conclusion is a brief, not a register, and the way to tell them apart is to look for the record that hurts.</p>
<p>The honest reading of the two decisions together is not that Meta suppresses this subject or that it does not. It is that enforcement in this category was found inconsistent in both directions, and that in the second case the Board identified a mechanical cause for it: reviewers working at scale cannot see the paid-partnership label and have no way to route content to the team that enforces the policy attached to it.</p>

<h2>The one failed citation</h2>
<p>One record cites a congressional press release that returned HTTP 404 when checked, with no Wayback Machine snapshot available. The claim it once supported has been withdrawn and the row kept, marked, and stripped of evidentiary weight. Deleting it would have concealed two things worth knowing: that the register once rested a claim on a source it cannot produce, and that the failure was found. A register that quietly drops its broken citations gives a reader no way to judge how often that happens.</p>

<h2>Source register</h2>
<p>Every cited source, with the retrieval result recorded on ${esc(longDate(RETRIEVED_ON))}.</p>
<ul class="source-list">${RECORDS.map((r) => `<li><h3>${esc(r.title)}</h3><p class="meta">${esc(r.type)} · ${esc(r.platform)} · ${esc(longDate(r.date))}</p>${r.sourceUrl ? `<p><a href="${esc(r.sourceUrl)}" rel="noopener noreferrer">${esc(r.sourceUrl)}</a></p><p class="meta">Retrieved and read directly.</p>` : `<p><strong>Not retrievable.</strong> ${esc(r.sourceNote)}</p>`}</li>`).join("")}</ul>

<h2>Internal assessment</h2>
<p>The assessment control on each card — Unreviewed, Priority follow-up, Context only — is optional browser-local triage. It is stored under the key <code>platform-evidence-lab-v1</code> in your own browser, is never transmitted, and is not a verified fact, a legal conclusion, or a finding about intent. The JSON export writes it alongside the record so an internal note travels with the evidence it annotates and the two stay distinguishable.</p>

<h2>Review cadence</h2>
<p>Links and claims were checked on <time datetime="${esc(RETRIEVED_ON)}">${esc(longDate(RETRIEVED_ON))}</time>. The next review is due <time datetime="${esc(NEXT_REVIEW)}">${esc(longDate(NEXT_REVIEW))}</time>. Both dates are recorded values, not generated from the clock; they change only when the work is done again.</p>

</main>
<footer><p><a href="/">Return to evidence register</a> · <a href="/privacy">Privacy</a></p></footer>
</body></html>`;

await writeFile(new URL("public/index.html", root), index);
await writeFile(new URL("public/sources.html", root), sources);
console.log(`Rendered ${RECORDS.length} records into public/index.html and public/sources.html.`);
