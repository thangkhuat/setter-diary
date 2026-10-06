// Proves the boundary check can fail. Each folder under tests/fixtures/boundaries/
// is a tiny project that breaks exactly the rule it is named after; this script
// runs dependency-cruiser on each and succeeds only if every one is rejected by
// that rule. A rule that silently matches nothing fails here.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

const fixturesDir = fromRoot("tests/fixtures/boundaries");
const fixtures = readdirSync(fixturesDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name);

if (fixtures.length === 0) {
	console.error(`No fixtures found in ${fixturesDir}.`);
	process.exit(1);
}

let failed = false;

for (const rule of fixtures) {
	const cwd = join(fixturesDir, rule);
	const roots = ["src", "worker", "web"].filter((root) => existsSync(join(cwd, root)));
	const result = spawnSync(
		process.execPath,
		[
			fromRoot("node_modules/dependency-cruiser/bin/dependency-cruiser.mjs"),
			"--config",
			fromRoot(".dependency-cruiser.cjs"),
			...roots,
		],
		{ cwd, encoding: "utf8" },
	);
	const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

	if (result.error) {
		console.error(`FAIL ${rule}: could not run dependency-cruiser: ${result.error.message}`);
		failed = true;
	} else if (result.status === 0) {
		console.error(`FAIL ${rule}: the boundary check passed on a fixture that breaks this rule.`);
		failed = true;
	} else if (!new RegExp(`error ${rule}:`).test(output)) {
		console.error(`FAIL ${rule}: rejected, but not by this rule:\n${output}`);
		failed = true;
	} else {
		console.log(`ok   ${rule}: fixture rejected`);
	}
}

if (failed) {
	process.exit(1);
}
console.log(`The boundary check rejected all ${fixtures.length} broken fixtures, as it must.`);
