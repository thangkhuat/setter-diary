import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: [
			"dist",
			".wrangler",
			"worker-configuration.d.ts",
			"tests/fixtures",
			"_bmad",
			"_bmad-output",
			".agents",
			".claude",
		],
	},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2022,
		},
	},
	{
		files: ["web/**/*.{ts,tsx}"],
		languageOptions: {
			globals: globals.browser,
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
		},
	},
	{
		extends: [js.configs.recommended],
		files: ["scripts/**/*.mjs", "*.cjs"],
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.node,
		},
	},
);
