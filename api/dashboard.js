export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ 
    status: "ok", 
    cases: [], 
    total: 0, 
    generatedAt: new Date().toISOString() 
  });
}
