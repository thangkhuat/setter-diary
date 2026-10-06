// Writes wrangler.preview.jsonc for one pull request: its own Worker (app-pr-<N>)
// and its own D1 (setter-diary-pr-<N>), so a preview never shares production's Worker, secrets or data (AD-19).
// Usage: node scripts/preview-config.mjs <pr-number> <d1-database-id>
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse, printParseErrorCode } from "jsonc-parser";
import { isMain } from "./is-main.mjs";

export const previewWorkerName = (prNumber) => `app-pr-${prNumber}`;
export const previewDatabaseName = (prNumber) => `setter-diary-pr-${prNumber}`;

/**
 * Settings a preview may copy from production as they are. A new top-level key in
 * wrangler.jsonc (a KV namespace, a route, a cron…) must be added here, or given
 * its own preview value below, before previews build again: that forces a decision
 * on whether the preview may share it with production.
 */
const COPIED_AS_IS = new Set([
	"$schema",
	"main",
	"compatibility_date",
	"compatibility_flags",
	"observability",
	"upload_source_maps",
	"assets",
]);
const OVERRIDDEN = new Set(["name", "vars", "d1_databases"]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * @param {Record<string, any>} production parsed wrangler.jsonc
 * @param {string} prNumber
 * @param {string} databaseId
 */
export function previewConfig(production, prNumber, databaseId) {
	if (!/^\d+$/.test(prNumber)) {
		throw new Error(`PR number must be digits, got "${prNumber}".`);
	}
	if (!UUID.test(databaseId)) {
		throw new Error(`D1 database id must be a UUID, got "${databaseId}".`);
	}
	const undecided = Object.keys(production).filter(
		(key) => !COPIED_AS_IS.has(key) && !OVERRIDDEN.has(key),
	);
	if (undecided.length > 0) {
		throw new Error(
			`wrangler.jsonc has settings previews have no rule for: ${undecided.join(", ")}. Decide in scripts/preview-config.mjs whether a preview may share them with production.`,
		);
	}
	const databases = production.d1_databases ?? [];
	if (databases.length !== 1 || databases[0].binding !== "DB") {
		throw new Error("Expected exactly one D1 binding named DB in wrangler.jsonc.");
	}
	return {
		...production,
		name: previewWorkerName(prNumber),
		vars: { ...production.vars, ENV: "preview" },
		d1_databases: [
			{ ...databases[0], database_name: previewDatabaseName(prNumber), database_id: databaseId },
		],
	};
}

/** @param {string} text content of a .jsonc file */
export function parseJsonc(text) {
	const errors = [];
	const value = parse(text, errors, { allowTrailingComma: true });
	if (errors.length > 0) {
		throw new Error(`Invalid JSONC: ${errors.map((e) => printParseErrorCode(e.error)).join(", ")}.`);
	}
	return value;
}

if (isMain(import.meta.url)) {
	const [prNumber, databaseId] = process.argv.slice(2);
	const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
	try {
		const production = parseJsonc(readFileSync(fromRoot("wrangler.jsonc"), "utf8"));
		const config = previewConfig(production, prNumber ?? "", databaseId ?? "");
		writeFileSync(fromRoot("wrangler.preview.jsonc"), `${JSON.stringify(config, null, "\t")}\n`);
		console.log(`Wrote wrangler.preview.jsonc for ${config.name}.`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
