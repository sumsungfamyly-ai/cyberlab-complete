import test from "node:test";
import assert from "node:assert/strict";

function inspect(raw) {
  const u = new URL(raw);
  const warnings = [];
  if (u.protocol !== "https:") warnings.push("http");
  if (u.username || u.password) warnings.push("userinfo");
  if (u.hostname.toLowerCase().split(".").some(x => x.startsWith("xn--"))) warnings.push("punycode");
  if (u.hostname.split(".").length > 5) warnings.push("labels");
  return { host: u.hostname, warnings };
}
test("parses a normal HTTPS URL", () => {
  const result = inspect("https://example.com/path?a=1");
  assert.equal(result.host, "example.com");
  assert.equal(result.warnings.length, 0);
});
test("flags HTTP", () => assert.ok(inspect("http://example.com").warnings.includes("http")));
test("flags user-info trick", () => assert.ok(inspect("https://example.com@evil.test").warnings.includes("userinfo")));
test("flags punycode host", () => assert.ok(inspect("https://xn--e1afmkfd.example").warnings.includes("punycode")));
