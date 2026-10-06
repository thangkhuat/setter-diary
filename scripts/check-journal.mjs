// Fails when the drizzle-kit migration journal is not the base branch's journal
// plus appended entries, or when a migration already on the base was edited (AD-19).
// Usage: node scripts/check-journal.mjs [base-ref]
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isMain } from "./is-main.mjs";

export const MIGRATIONS_DIR = "src/adapters/db/d1/migrations";
export const JOURNAL_PATH = `${MIGRATIONS_DIR}/meta/_journal.json`;

/** @param {string | null} json journal file content, or null when the file does not exist */
export function journalEntries(json) {
	if (json === null) return [];
	const journal = JSON.parse(json);
	if (!Array.isArray(journal.entries)) {
		throw new Error("Journal has no entries array.");
	}
	return journal.entries;
}

/**
 * @typedef {{ idx: number, tag: string, when?: number }} JournalEntry
 * @param {JournalEntry[]} base entries on the base branch
 * @param {JournalEntry[]} head entries on this branch
 * @returns {{ linear: true } | { linear: false, reason: string }}
 */
export function checkLinear(base, head) {
	for (let i = 0; i < head.length; i++) {
		if (head[i].idx !== i) {
			return { linear: false, reason: `Entry ${i} has idx ${head[i].idx}; indexes must run 0, 1, 2…` };
		}
	}
	if (head.length < base.length) {
		return {
			linear: false,
			reason: `This branch has ${head.length} migrations but the base has ${base.length}. Rebase onto the base branch.`,
		};
	}
	for (let i = 0; i < base.length; i++) {
		if (head[i].tag !== base[i].tag || head[i].when !== base[i].when) {
			return {
				linear: false,
				reason: `Migration ${i} is "${head[i].tag}" here but "${base[i].tag}" on the base (or was regenerated). Rebase, then regenerate only your own migration.`,
			};
		}
	}
	return { linear: true };
}

const git = (args) => spawnSync("git", args, { encoding: "utf8" });

function readBaseJournal(baseRef) {
	if (git(["rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`]).status !== 0) {
		throw new Error(`Base ref "${baseRef}" not found. Fetch it first (git fetch origin main).`);
	}
	// cat-file -e exits 1 only when the object is absent: no journal on the base yet.
	if (git(["cat-file", "-e", `${baseRef}:${JOURNAL_PATH}`]).status !== 0) {
		return null;
	}
	return execFileSync("git", ["show", `${baseRef}:${JOURNAL_PATH}`], { encoding: "utf8" });
}

/** Tags of base migrations whose SQL file differs from the base branch (edited or deleted). */
function editedMigrations(baseRef, base) {
	return base
		.map((entry) => entry.tag)
		.filter((tag) => {
			const file = `${MIGRATIONS_DIR}/${tag}.sql`;
			const status = git(["diff", "--quiet", baseRef, "--", file]).status;
			if (status !== 0 && status !== 1) {
				throw new Error(`Could not compare ${file} with ${baseRef}.`);
			}
			return status === 1;
		});
}

function main() {
	const baseRef = process.argv[2] ?? process.env.JOURNAL_BASE_REF ?? "origin/main";
	const headPath = fileURLToPath(new URL(`../${JOURNAL_PATH}`, import.meta.url));
	const head = journalEntries(existsSync(headPath) ? readFileSync(headPath, "utf8") : null);
	const base = journalEntries(readBaseJournal(baseRef));

	const result = checkLinear(base, head);
	if (!result.linear) {
		console.error(`Migration journal is not linear against ${baseRef}: ${result.reason}`);
		process.exit(1);
	}
	const edited = editedMigrations(baseRef, base);
	if (edited.length > 0) {
		console.error(
			`Migrations already on ${baseRef} were edited or deleted: ${edited.join(", ")}. Never change an applied migration; add a new one.`,
		);
		process.exit(1);
	}
	console.log(`Migration journal is linear against ${baseRef} (${base.length} on base, ${head.length} here).`);
}

if (isMain(import.meta.url)) {
	try {
		main();
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
