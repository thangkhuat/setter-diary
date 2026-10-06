import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

const fromRoot = (path: string) =>
	fileURLToPath(new URL(path, import.meta.url));

const pkg = JSON.parse(readFileSync(fromRoot("./package.json"), "utf8")) as {
	version: string;
};

export default defineConfig({
	root: "web",
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	build: {
		outDir: fromRoot("./dist"),
		emptyOutDir: true,
	},
	plugins: [
		react(),
		cloudflare({ configPath: fromRoot("./wrangler.jsonc") }),
	],
});
