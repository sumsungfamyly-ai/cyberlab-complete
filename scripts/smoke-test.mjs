const base = process.env.APP_BASE_URL;
if (!base) {
  console.error("Set APP_BASE_URL to your deployed URL, e.g. https://your-project.vercel.app");
  process.exit(1);
}
for (const path of ["/", "/api/health", "/tools.json"]) {
  const r = await fetch(base.replace(/\/$/, "") + path);
  console.log(`${r.status} ${path}`);
  if (!r.ok) process.exitCode = 1;
  if (path === "/api/health") {
    const data = await r.json();
    if (!data.ok) process.exitCode = 1;
  }
}
