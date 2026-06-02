import { getSeenIds, markSeen, saveCases, notify, isKnown, makeId } from "../lib/utils.js";

const PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

async function fetch_page() {
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy("https://www.reprouncensored.org/cases"), { signal: AbortSignal.timeout(10000) });
      if (r.ok) return r.text();
    } catch {}
  }
  throw new Error("All proxies failed");
}

function parse(html) {
  const months = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
  const dateRe = new RegExp(`(${months})\\s+\\d{1,2},?\\s+20\\d{2}`, "i");
  const results = [];
  let lastTitle = "";
  for (const line of html.split("\n")) {
    const clean = line.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (clean.length < 10 || clean.length > 300) continue;
    if (/[A-Z]/.test(clean) && clean.split(" ").length >= 3 && !/^(All|This|For|Home|Back|Next|Cookie|Subscribe)/.test(clean)) {
      lastTitle = clean;
    }
    const d = clean.match(dateRe);
    if (d && clean.match(/20(2[4-9]|3\d)/) && lastTitle) {
      results.push({ title: lastTitle, date: d[0] });
      lastTitle = "";
    }
  }
  return results;
}

export default async function handler(req, res) {
  const seen = await getSeenIds("ru");
  let html;
  try { html = await fetch_page(); }
  catch (e) { return res.status(500).json({ error: e.message }); }

  const found = parse(html);
  const newCases = [];
  for (const c of found) {
    if (isKnown(c.title, seen)) continue;
    const id = makeId(c.title);
    seen.add(id);
    await markSeen("ru", id);
    newCases.push({ ...c, source: "reprouncensored", foundAt: new Date().toISOString() });
  }
  await saveCases("ru", newCases);
  await notify("Repro Uncensored", newCases);
  return res.status(200).json({ parsed: found.length, new: newCases.length, cases: newCases });
}
