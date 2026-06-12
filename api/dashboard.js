// api/dashboard.js
// Reads suppression incidents from Upstash Redis and returns them in the
// format the frontend expects: { cases: [...], total, generatedAt }
//
// Each case has: id, title, org, platform, sector, heat, date,
//               summary, evidence, source, sourceUrl, tags

function parseRedisVal(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return val; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const redis = {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  try {
    // ── READ INDEX ─────────────────────────────────────────────────────────
    const indexRes = await fetch(
      `${redis.url}/get/${encodeURIComponent('aloha:suppression:index')}`,
      { headers: { Authorization: `Bearer ${redis.token}` } }
    );
    const indexData = await indexRes.json();
    const indexKeys = parseRedisVal(indexData.result);

    if (!indexKeys || !Array.isArray(indexKeys) || indexKeys.length === 0) {
      return res.status(200).json({
        cases: [],
        total: 0,
        message: 'No incidents indexed yet. Visit /api/sweep to populate.',
        generatedAt: new Date().toISOString(),
      });
    }

    // ── FETCH ALL INCIDENTS ─────────────────────────────────────────────────
    const cases = [];
    for (const key of indexKeys) {
      try {
        const r = await fetch(
          `${redis.url}/get/${encodeURIComponent(key)}`,
          { headers: { Authorization: `Bearer ${redis.token}` } }
        );
        const d = await r.json();
        const incident = parseRedisVal(d.result);
        if (incident && incident.title) {
          cases.push(incident);
        }
      } catch (e) {
        console.error(`Error fetching ${key}:`, e);
      }
    }

    // Sort: verified incidents (inc_) first, then live (exa_), newest to oldest
    cases.sort((a, b) => {
      const aVerified = a.id?.startsWith('inc_') ? 0 : 1;
      const bVerified = b.id?.startsWith('inc_') ? 0 : 1;
      if (aVerified !== bVerified) return aVerified - bVerified;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

    return res.status(200).json({
      cases,
      total: cases.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Dashboard error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
