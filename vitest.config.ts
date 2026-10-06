import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				// Core, contracts and tooling: plain unit tests in Node.
				test: {
					name: "core",
					environment: "node",
					include: [
						"src/core/**/*.test.ts",
						"src/contracts/**/*.test.ts",
						"scripts/**/*.test.mjs",
						"tests/*.test.ts",
					],
				},
			},
			{
				// Adapters and the API edge: run inside the Workers runtime.
				plugins: [
					cloudflareTest({ wrangler: { configPath: "./wrangler.jsonc" } }),
				],
				test: {
					name: "worker",
					include: ["worker/**/*.test.ts", "src/adapters/**/*.test.ts"],
				},
			},
		],
	},
});
