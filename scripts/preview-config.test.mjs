import { describe, expect, it } from "vitest";
import { parseJsonc, previewConfig } from "./preview-config.mjs";

const production = {
	name: "app",
	vars: { ENV: "production" },
	assets: { run_worker_first: ["/api/*"] },
	d1_databases: [
		{
			binding: "DB",
			database_name: "setter-diary",
			database_id: "11111111-1111-1111-1111-111111111111",
			migrations_dir: "src/adapters/db/d1/migrations",
		},
	],
};
const previewId = "22222222-2222-2222-2222-222222222222";

describe("previewConfig", () => {
	it("gives the preview its own Worker name, D1 and ENV", () => {
		const config = previewConfig(production, "12", previewId);

		expect(config.name).toBe("app-pr-12");
		expect(config.vars.ENV).toBe("preview");
		expect(config.d1_databases).toEqual([
			{
				binding: "DB",
				database_name: "setter-diary-pr-12",
				database_id: previewId,
				migrations_dir: "src/adapters/db/d1/migrations",
			},
		]);
	});

	it("keeps every other setting and leaves the production config untouched", () => {
		const config = previewConfig(production, "12", previewId);

		expect(config.assets).toEqual(production.assets);
		expect(production.name).toBe("app");
		expect(production.d1_databases[0].database_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("refuses a PR number that is not digits", () => {
		expect(() => previewConfig(production, "12; rm -rf", previewId)).toThrow();
	});

	it("refuses a database id that is not a UUID", () => {
		expect(() => previewConfig(production, "12", "")).toThrow();
		expect(() => previewConfig(production, "12", "-".repeat(36))).toThrow();
	});

	it("refuses a setting it has no preview rule for, so nothing is shared with production by accident", () => {
		const withKv = { ...production, kv_namespaces: [{ binding: "CACHE", id: "prod-kv" }] };
		expect(() => previewConfig(withKv, "12", previewId)).toThrow(/kv_namespaces/);
	});

	it("refuses a config without the single DB binding", () => {
		expect(() => previewConfig({ ...production, d1_databases: [] }, "12", previewId)).toThrow();
	});
});

describe("parseJsonc", () => {
	it("reads JSON with comments and trailing commas", () => {
		expect(parseJsonc('{\n\t// comment\n\t"name": "x",\n}')).toEqual({ name: "x" });
	});

	it("throws on broken JSONC instead of returning a partial object", () => {
		expect(() => parseJsonc('{ "name": ')).toThrow(/Invalid JSONC/);
	});
});
