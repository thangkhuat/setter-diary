import { Hono } from "hono";
import pkg from "../package.json";
import type { HealthResponse } from "../src/contracts/common";
import { errorResponse, handleUnhandledError } from "./errors";

export function createApp() {
	const app = new Hono<{ Bindings: Env }>().basePath("/api");

	app.get("/health", (c) => {
		const body: HealthResponse = { status: "ok", version: pkg.version };
		return c.json(body);
	});

	app.notFound((c) => errorResponse(c, "NOT_FOUND", "Not found."));
	app.onError(handleUnhandledError);

	return app;
}

export default createApp();
