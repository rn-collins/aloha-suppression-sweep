import { Redis } from "@upstash/redis";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    const [ru, voidly] = await Promise.all([
      redis.get("cases:ru"),
      redis.get("cases:voidly"),
    ]);
    const all = [...(ru || []), ...(voidly || [])]
      .sort((a, b) => new Date(b.foundAt) - new Date(a.foundAt))
      .slice(0, 50);
    return res.status(200).json({ cases: all, total: all.length, generatedAt: new Date().toISOString() });
  } catch (err) {
    return res.status(200).json({ cases: [], total: 0, error: err.message, generatedAt: new Date().toISOString() });
  }
}
