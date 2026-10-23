import fs from "node:fs";
import path from "node:path";
const required = ["public/index.html", "public/tools.json", "api/telegram.js", "api/health.js", "api/analyze-url.js", "README.md", "vercel.json"];
const missing = required.filter(p => !fs.existsSync(new URL(`../${p}`, import.meta.url)));
if (missing.length) { console.error("Missing files:", missing.join(", ")); process.exit(1); }
const tools = JSON.parse(fs.readFileSync(new URL("../public/tools.json", import.meta.url), "utf8"));
if (!Array.isArray(tools) || tools.length < 50) { console.error("Tool catalog must contain 50+ entries"); process.exit(1); }
console.log(`Project structure OK. ${tools.length} catalog entries found.`);
