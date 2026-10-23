export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    ok: true,
    service: "CyberLab Defensive Toolkit",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
}
