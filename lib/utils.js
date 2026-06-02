import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const KNOWN_NAMES = [
  "repro uncensored","bellesa","carafem","plan c","aid access","just the pill",
  "indigenous women rising","women help women","jacarandas","my voice my choice",
  "kitkatclub","insomnia berlin","gegen","replicant events","chachorros","horn",
  "tillatec","club church","the queer agenda","butt magazine","stuart sandford",
  "sapphic paradise","mistress juju","tianna moon","spankie jackzon",
  "al-haq","al mezan","pchr","bisan owda","saleh aljafarawi","mona shtaya",
  "pheeno","universo lgbti","ezatamentchy","gayblogbr","comunidades lgbtqia",
  "kae rosado","antifreeze","montco","mark hodges","micah leroy","leighton clarke",
  "cindy gallop","censhership","whva","bureau brandeis","appeals centre europe",
  "urban studio","people over platforms","sleeping giants brasil",
  "pauline dens","chiapas sin censura","alesia lund","paola diaz","cora gamarnik",
];

export function isKnown(title, seenIds) {
  const t = title.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  for (const n of KNOWN_NAMES) {
    if (n.length > 4 && t.includes(n)) return true;
  }
  return seenIds.has(t.slice(0, 50));
}

export function makeId(title) {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, "").slice(0, 50);
}

export async function getSeenIds(source) {
  try {
    const ids = await redis.smembers(`seen:${source}`);
    return new Set(ids || []);
  } catch { return new Set(); }
}

export async function markSeen(source, id) {
  await redis.sadd(`seen:${source}`, id);
}

export async function saveCases(source, cases) {
  if (!cases.length) return;
  const existing = await redis.get(`cases:${source}`) || [];
  const updated = [...cases, ...existing].slice(0, 100);
  await redis.set(`cases:${source}`, updated);
}

export async function notify(source, cases) {
  if (!cases.length) return;
  const text = `🚨 ${cases.length} new suppression case${cases.length > 1 ? "s" : ""} — ${source}\n\n` +
    cases.map(c => `• ${c.title} (${c.date || "no date"})`).join("\n");
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => {});
  }
}
