// Prints the id of the D1 database with the given name, or nothing if there is none.
// Usage: wrangler d1 list --json | node scripts/d1-id.mjs <database-name>
import { readFileSync } from "node:fs";
import { isMain } from "./is-main.mjs";

/**
 * @param {Array<{ name: string, uuid: string }>} databases output of `wrangler d1 list --json`
 * @param {string} name
 */
export function findDatabaseId(databases, name) {
	return databases.find((database) => database.name === name)?.uuid ?? "";
}

if (isMain(import.meta.url)) {
	const name = process.argv[2];
	if (!name) {
		console.error("Usage: wrangler d1 list --json | node scripts/d1-id.mjs <database-name>");
		process.exit(1);
	}
	try {
		process.stdout.write(findDatabaseId(JSON.parse(readFileSync(0, "utf8")), name));
	} catch (error) {
		console.error(`Could not read the database list: ${error instanceof Error ? error.message : error}`);
		process.exit(1);
	}
}
