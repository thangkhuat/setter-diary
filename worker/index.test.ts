import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import pkg from "../package.json";
import { healthResponseSchema } from "../src/contracts/common";
import { errorResponseSchema } from "../src/contracts/errors";
import app, { createApp } from "./index";

describe("GET /api/health", () => {
	it("returns 200 with the app version from package.json", async () => {
		const res = await app.request("/api/health", {}, env);

		expect(res.status).toBe(200);
		expect(healthResponseSchema.parse(await res.json())).toEqual({
			status: "ok",
			version: pkg.version,
		});
	});
});

describe("unknown API route", () => {
	it("returns a JSON 404 with code NOT_FOUND, never HTML", async () => {
		const res = await app.request("/api/nope", {}, env);

		expect(res.status).toBe(404);
		expect(res.headers.get("content-type")).toContain("application/json");
		expect(errorResponseSchema.parse(await res.json()).error.code).toBe(
			"NOT_FOUND",
		);
	});
});

describe("unhandled error in a route", () => {
	it("returns a JSON 500 with code INTERNAL_ERROR and no error detail", async () => {
		// The real app with one extra route, so this fails if the app loses its error handler.
		const failing = createApp();
		failing.get("/boom", () => {
			throw new Error("secret detail");
		});

		const res = await failing.request("/api/boom", {}, env);
		const body = await res.text();

		expect(res.status).toBe(500);
		expect(errorResponseSchema.parse(JSON.parse(body)).error.code).toBe(
			"INTERNAL_ERROR",
		);
		expect(body).not.toContain("secret detail");
	});
});
