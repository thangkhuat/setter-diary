import { existsSync, readdirSync, readFileSync } from "node:fs";
import { parse } from "jsonc-parser";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
	readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const exists = (path: string) => existsSync(new URL(`../${path}`, import.meta.url));

const wrangler = parse(read("wrangler.jsonc"));
const pkg = JSON.parse(read("package.json")) as {
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
};

describe("wrangler.jsonc", () => {
	it("serves the SPA from static assets and sends only /api/* to the Worker", () => {
		expect(wrangler.main).toBe("./worker/index.ts");
		expect(wrangler.assets.not_found_handling).toBe("single-page-application");
		expect(wrangler.assets.run_worker_first).toEqual(["/api/*"]);
	});

	it("has a compatibility date no older than the starter delta and not in the future", () => {
		expect(wrangler.compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		const date = Date.parse(wrangler.compatibility_date);
		expect(date).toBeGreaterThanOrEqual(Date.parse("2026-08-22"));
		expect(date).toBeLessThanOrEqual(Date.now());
	});

	it("binds the production D1 with the migrations folder", () => {
		expect(wrangler.name).toBe("app");
		expect(wrangler.d1_databases).toEqual([
			expect.objectContaining({
				binding: "DB",
				database_name: "setter-diary",
				migrations_dir: "src/adapters/db/d1/migrations",
			}),
		]);
	});
});

describe("migrations folder", () => {
	it("is the same for drizzle-kit, wrangler and the journal check", () => {
		const drizzleOut = /out:\s*"\.\/([^"]+)"/.exec(read("drizzle.config.ts"))?.[1];
		const journalDir = /MIGRATIONS_DIR = "([^"]+)"/.exec(read("scripts/check-journal.mjs"))?.[1];

		expect(drizzleOut).toBe("src/adapters/db/d1/migrations");
		expect(journalDir).toBe(drizzleOut);
		expect(wrangler.d1_databases[0].migrations_dir).toBe(drizzleOut);
	});
});

describe("layout", () => {
	it.each([
		"web/index.html",
		"web/main.tsx",
		"worker/index.ts",
		"worker/composition.ts",
		"src/core/shared/index.ts",
		"src/adapters/rate-limit/cloudflare/index.ts",
		"src/contracts/errors.ts",
		"docs/runbook.md",
	])("has %s", (path) => {
		expect(exists(path)).toBe(true);
	});

	it("does not keep the starter's layout or config name", () => {
		expect(exists("wrangler.json")).toBe(false);
		expect(exists("src/react-app")).toBe(false);
		expect(exists("src/worker")).toBe(false);
	});

	it("keeps src/core/ to the shared kernel and the slices in the slice order", () => {
		// Same list as SLICE_MAY_USE in .dependency-cruiser.cjs, whose core-slices-are-known
		// rule cannot see a folder whose files import nothing.
		const known = ["shared", "teams", "sessions", "logging", "ratings", "progress", "ai", "account", "notifications"];
		const folders = readdirSync(new URL("../src/core", import.meta.url), { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
		expect(folders.filter((folder) => !known.includes(folder))).toEqual([]);
	});

	it("pins Node 24", () => {
		expect(read(".nvmrc").trim()).toBe("24");
	});
});

describe("pinned versions match the architecture Stack table", () => {
	// Major.minor from architecture.md; the patch is whatever was current when pinned.
	const stack: Record<string, string> = {
		typescript: "6.0.3",
		vite: "8.3",
		"@vitejs/plugin-react": "6.1",
		react: "19.3",
		"react-dom": "19.3",
		hono: "4.13",
		zod: "4.6",
		"drizzle-orm": "0.45",
		"drizzle-kit": "0.31",
		wrangler: "4.147",
		"@cloudflare/vite-plugin": "1.62",
		vitest: "4.1",
		"@cloudflare/vitest-pool-workers": "0.22",
		"dependency-cruiser": "18.5",
	};
	const installed = { ...pkg.dependencies, ...pkg.devDependencies };

	it.each(Object.entries(stack))("%s is %s", (name, expected) => {
		expect(installed[name]).toBeDefined();
		expect(
			installed[name] === expected || installed[name].startsWith(`${expected}.`),
		).toBe(true);
	});

	it("pins every dependency to an exact version", () => {
		for (const [name, version] of Object.entries(installed)) {
			expect(version, name).toMatch(/^\d+\.\d+\.\d+$/);
		}
	});
});
