// Boundary rules for the architecture's layer table, vendor-free core (AD-1),
// slice order (AD-2) and public schema files (AD-17).

// Each slice may use only the slices listed for it, through their index.ts.
const SLICE_MAY_USE = {
	teams: [],
	sessions: ["teams"],
	logging: ["sessions", "teams"],
	ratings: ["sessions", "teams"],
	progress: ["logging", "ratings", "sessions", "teams"],
	ai: ["progress", "logging", "ratings", "sessions", "teams"],
	account: ["progress", "logging", "ratings", "sessions", "teams"],
	notifications: ["progress", "logging", "ratings", "sessions", "teams"],
};

const SLICES = Object.keys(SLICE_MAY_USE);

const sliceOrderRules = SLICES.map((slice) => ({
	name: `slice-order-${slice}`,
	comment: `core/${slice} may use only shared and the slices below it: ${
		SLICE_MAY_USE[slice].join(", ") || "none"
	} (AD-2).`,
	severity: "error",
	from: { path: `^src/core/${slice}/` },
	to: {
		path: "^src/core/",
		pathNot: `^src/core/(${["shared", slice, ...SLICE_MAY_USE[slice]].join("|")})/`,
	},
}));

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: "core-is-vendor-free",
			comment:
				"Nothing under src/core/ imports a package or a runtime module; core reaches the outside world only through its own ports (AD-1).",
			severity: "error",
			from: { path: "^src/core/", pathNot: "\\.test\\.ts$" },
			to: {
				dependencyTypes: [
					"npm",
					"npm-dev",
					"npm-optional",
					"npm-peer",
					"npm-bundled",
					"npm-no-pkg",
					"npm-unknown",
					"core",
					"unknown",
					"undetermined",
				],
			},
		},
		{
			name: "core-tests-use-only-vitest",
			comment: "Core tests are plain unit tests: vitest is their only package (AD-1).",
			severity: "error",
			from: { path: "^src/core/.+\\.test\\.ts$" },
			to: {
				dependencyTypes: [
					"npm",
					"npm-dev",
					"npm-optional",
					"npm-peer",
					"npm-bundled",
					"npm-no-pkg",
					"npm-unknown",
					"core",
					"unknown",
					"undetermined",
				],
				pathNot: "node_modules/vitest/",
			},
		},
		{
			name: "core-imports-core-only",
			comment:
				"src/core/ imports nothing of ours outside src/core/: no adapters, contracts, API edge, web app, scripts or root files (AD-1).",
			severity: "error",
			from: { path: "^src/core/" },
			to: { pathNot: "^(src/core/|node_modules/)", dependencyTypes: ["local"] },
		},
		{
			name: "shared-kernel-is-self-contained",
			comment: "src/core/shared/ depends on nothing outside itself.",
			severity: "error",
			from: { path: "^src/core/shared/" },
			to: { path: "^(src|worker|web)/", pathNot: "^src/core/shared/" },
		},
		{
			name: "core-slices-are-known",
			comment:
				"A folder under src/core/ must be shared or a slice listed in SLICE_MAY_USE, so every slice has a place in the order (AD-2).",
			severity: "error",
			from: { path: "^src/core/", pathNot: `^src/core/(shared|${SLICES.join("|")})/` },
			to: {},
		},
		...sliceOrderRules,
		{
			name: "slices-meet-at-index",
			comment: "A slice uses another slice only through that slice's index.ts (AD-2).",
			severity: "error",
			from: { path: "^src/core/([^/]+)/" },
			to: {
				path: "^src/core/[^/]+/",
				pathNot: ["^src/core/$1/", "^src/core/shared/", "^src/core/[^/]+/index\\.ts$"],
			},
		},
		{
			name: "contracts-depend-on-enums-only",
			comment: "src/contracts/ may import only src/core/shared/enums.ts from the rest of the app.",
			severity: "error",
			from: { path: "^src/contracts/" },
			to: {
				path: "^(src/core|src/adapters|worker|web)/",
				pathNot: "^src/core/shared/enums\\.ts$",
			},
		},
		{
			name: "adapters-depend-on-core-only",
			comment: "Adapters implement core ports; they never import contracts, the API edge or the web app.",
			severity: "error",
			from: { path: "^src/adapters/" },
			to: { path: "^(src/contracts|worker|web)/" },
		},
		{
			name: "adapters-wired-only-in-composition",
			comment: "Only worker/composition.ts imports adapters.",
			severity: "error",
			from: { path: "^worker/", pathNot: "^worker/composition\\.ts$" },
			to: { path: "^src/adapters/" },
		},
		{
			name: "api-edge-does-not-import-web",
			severity: "error",
			from: { path: "^worker/" },
			to: { path: "^web/" },
		},
		{
			name: "web-imports-contracts-only",
			comment: "The web app talks to the rest of the app only through src/contracts/.",
			severity: "error",
			from: { path: "^web/" },
			to: { path: "^(src/core|src/adapters|worker)/" },
		},
		{
			name: "public-schema-read-by-progress-only",
			comment:
				"Only the progress query adapter (and the schema folder itself) imports a slice's public schema file (AD-17).",
			severity: "error",
			from: { pathNot: "^src/adapters/db/d1/(queries/progress|schema)/" },
			to: { path: "^src/adapters/db/d1/schema/[^/]+\\.public\\.ts$" },
		},
		{
			name: "no-circular",
			severity: "error",
			from: {},
			to: { circular: true },
		},
	],
	options: {
		doNotFollow: { path: "node_modules" },
		tsPreCompilationDeps: true,
		enhancedResolveOptions: {
			extensions: [".ts", ".tsx", ".mjs", ".js", ".json"],
			conditionNames: ["import", "types", "default"],
		},
	},
};
