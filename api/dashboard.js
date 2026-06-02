import { redis } from "../lib/utils.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const [ru, voidly] = await Promise.all([
    redis.get("cases:ru") || [],
    redis.get("cases:voidly") || [],
  ]);
  const all = [...(ru || []), ...(voidly || [])].sort((a, b) => new Date(b.foundAt) - new Date(a.foundAt)).slice(0, 50);
  return res.status(200).json({ cases: all, total: all.length, generatedAt: new Date().toISOString() });
}
