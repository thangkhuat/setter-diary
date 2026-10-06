import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/adapters/db/d1/schema/index.ts",
	out: "./src/adapters/db/d1/migrations",
});
