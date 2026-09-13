/**
 * Smoke checks against a running API.
 * Usage: npm run test:smoke
 * Optional: API_URL=http://localhost:3344 npm run test:smoke
 */
const base = process.env.API_URL || "http://localhost:3344";

const assert = (name, ok, detail = "") => {
  if (!ok) throw new Error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`OK: ${name}`);
};

const run = async () => {
  const root = await fetch(`${base}/`).then((r) => r.json());
  assert("root", root.success === true && String(root.name || "").includes("Brisova"));

  const health = await fetch(`${base}/api/v1/health`).then(async (r) => ({
    status: r.status,
    body: await r.json(),
  }));
  assert("health", health.status === 200 && health.body.success === true);

  const properties = await fetch(`${base}/api/v1/properties?limit=1`).then(
    async (r) => ({ status: r.status, body: await r.json() })
  );
  assert(
    "properties list",
    properties.status === 200 && properties.body.success === true
  );

  const featured = await fetch(`${base}/api/v1/properties/featured`).then(
    (r) => r.status
  );
  assert("featured properties", featured === 200);

  const legacyGone = await fetch(`${base}/addPoints`, { method: "POST" }).then(
    (r) => r.status
  );
  assert("legacy airdrop removed", legacyGone === 404);

  console.log("\nAll smoke checks passed");
};

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
