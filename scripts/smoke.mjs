// Smoke test for a running app (local preview, PR preview or production).
// Usage: node scripts/smoke.mjs <base-url>
import { readFileSync } from "node:fs";

const baseUrl = (process.argv[2] ?? "").replace(/\/$/, "");
if (!baseUrl) {
	console.error("Usage: node scripts/smoke.mjs <base-url>");
	process.exit(1);
}

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const failures = [];

async function check(name, run) {
	try {
		await run();
		console.log(`ok   ${name}`);
	} catch (error) {
		failures.push(name);
		console.error(`FAIL ${name}: ${error instanceof Error ? error.message : error}`);
	}
}

function expectEqual(actual, expected, what) {
	if (actual !== expected) {
		throw new Error(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
	}
}

// A fresh deployment can take a minute or two to answer on workers.dev.
async function fetchWithRetry(path, attempts = 18) {
	let lastError;
	for (let attempt = 0; attempt < attempts; attempt++) {
		try {
			const res = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(15000) });
			if (res.status < 500) return res;
			lastError = new Error(`HTTP ${res.status}`);
		} catch (error) {
			lastError = error;
		}
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}
	throw lastError;
}

await check("GET /api/health returns 200 with the app version", async () => {
	const res = await fetchWithRetry("/api/health");
	expectEqual(res.status, 200, "status");
	const body = await res.json();
	expectEqual(body.status, "ok", "body.status");
	expectEqual(body.version, version, "body.version");
});

await check("unknown /api route returns a JSON 404, not the SPA", async () => {
	const res = await fetchWithRetry("/api/nope");
	expectEqual(res.status, 404, "status");
	const body = await res.json();
	expectEqual(body.error?.code, "NOT_FOUND", "body.error.code");
});

await check("a screen route returns the SPA shell", async () => {
	const res = await fetchWithRetry("/sessions/anything");
	expectEqual(res.status, 200, "status");
	const type = res.headers.get("content-type") ?? "";
	if (!type.includes("text/html")) throw new Error(`content-type: ${type}`);
	const html = await res.text();
	if (!html.includes('<div id="root">')) throw new Error("SPA root element missing");
});

if (failures.length > 0) {
	console.error(`${failures.length} smoke check(s) failed against ${baseUrl}.`);
	process.exitCode = 1;
} else {
	console.log(`Smoke checks passed against ${baseUrl}.`);
}
