import { getSeenIds, markSeen, saveCases, notify, isKnown, makeId } from "../lib/utils.js";

export default async function handler(req, res) {
  const seen = await getSeenIds("voidly");
  const newCases = [];

  for (const topic of ["women-health", "news"]) {
    try {
      const r = await fetch(`https://api.voidly.ai/data/incidents?topic=${topic}&limit=20`, {
        signal: AbortSignal.timeout(10000),
        headers: { "Accept": "application/json" },
      });
      if (!r.ok) continue;
      const data = await r.json();
      const incidents = Array.isArray(data) ? data : (data.incidents || []);
      for (const inc of incidents) {
        const title = inc.title || inc.id || "";
        if (!title || isKnown(title, seen)) continue;
        const id = makeId(title);
        seen.add(id);
        await markSeen("voidly", id);
        newCases.push({ title, date: inc.created_at, country: inc.country, topic, source: "voidly", foundAt: new Date().toISOString() });
      }
    } catch {}
  }

  await saveCases("voidly", newCases);
  await notify("Voidly Atlas", newCases);
  return res.status(200).json({ new: newCases.length, cases: newCases });
}
