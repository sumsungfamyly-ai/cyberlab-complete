const PRIVATE_HOSTS = /^(localhost|.*\.localhost|.*\.local|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|\[::1\])$/i;

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Use POST." });
  }
  let raw = req.body?.url;
  if (typeof raw !== "string" || raw.length > 2048) {
    return res.status(400).json({ ok: false, error: "Provide a URL up to 2048 characters." });
  }
  let parsed;
  try { parsed = new URL(raw.trim()); } catch {
    return res.status(400).json({ ok: false, error: "Invalid URL format." });
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ ok: false, error: "Only http:// and https:// URLs are supported." });
  }
  const host = parsed.hostname.toLowerCase();
  const warnings = [];
  if (parsed.protocol !== "https:") warnings.push("The URL uses HTTP, not HTTPS.");
  if (parsed.username || parsed.password) warnings.push("The URL contains user-info before the @ symbol; this can be deceptive.");
  if (host.startsWith("xn--") || host.includes(".xn--")) warnings.push("The domain contains Punycode labels; verify the displayed domain carefully.");
  if (PRIVATE_HOSTS.test(host)) warnings.push("This appears to be a local/private hostname; do not expose internal services.");
  if (host.split(".").length > 5) warnings.push("The hostname has many labels; check for deceptive subdomain structure.");
  if (parsed.port && !["80","443"].includes(parsed.port)) warnings.push("A non-default port is specified.");
  if (parsed.href.length > 180) warnings.push("The URL is unusually long.");
  const suspiciousWords = /(login|verify|secure|account|wallet|password|update|auth|support|telegram|paypal|bank)/i;
  if (suspiciousWords.test(parsed.pathname + parsed.search)) warnings.push("The path or query contains account/security-related words; context matters.");
  return res.status(200).json({
    ok: true,
    result: {
      protocol: parsed.protocol,
      hostname: host,
      port: parsed.port || (parsed.protocol === "https:" ? "443 (default)" : "80 (default)"),
      path: parsed.pathname || "/",
      queryParameterCount: [...parsed.searchParams.keys()].length,
      fragmentPresent: Boolean(parsed.hash),
      warnings,
      note: "Heuristic only. No network request was made, the destination was not opened, and this is not a verdict that a site is safe or malicious."
    }
  });
}
