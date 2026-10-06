import { env } from "cloudflare:test";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { errorResponseSchema } from "../../src/contracts/errors";
import type { RateLimiter } from "../../src/core/shared";
import { rateLimit } from "./rate-limit";

/** Allows `max` calls per key, then refuses. */
function countingLimiter(max: number): RateLimiter {
	const counts = new Map<string, number>();
	return {
		async limit(key) {
			const count = (counts.get(key) ?? 0) + 1;
			counts.set(key, count);
			return { allowed: count <= max };
		},
	};
}

function appWith(limiter: RateLimiter) {
	const app = new Hono<{ Bindings: Env }>();
	app.get(
		"/limited",
		rateLimit(
			() => limiter,
			(c) => c.req.header("x-user") ?? "anonymous",
		),
		(c) => c.json({ status: "ok" }),
	);
	return app;
}

describe("rateLimit middleware", () => {
	it("refuses calls above the limit with 429 RATE_LIMITED", async () => {
		const app = appWith(countingLimiter(5));
		const statuses: number[] = [];
		let lastBody: unknown;
		for (let call = 0; call < 8; call++) {
			const res = await app.request("/limited", {}, env);
			statuses.push(res.status);
			lastBody = await res.json();
		}

		expect(statuses).toEqual([200, 200, 200, 200, 200, 429, 429, 429]);
		expect(errorResponseSchema.parse(lastBody).error.code).toBe("RATE_LIMITED");
	});

	it("counts each key separately", async () => {
		const app = appWith(countingLimiter(1));
		const as = (user: string) =>
			app.request("/limited", { headers: { "x-user": user } }, env);

		expect((await as("mia")).status).toBe(200);
		expect((await as("mia")).status).toBe(429);
		expect((await as("thang")).status).toBe(200);
	});

	it("lets the call through when the limiter itself fails", async () => {
		const app = appWith({
			limit: async () => {
				throw new Error("binding unavailable");
			},
		});

		expect((await app.request("/limited", {}, env)).status).toBe(200);
	});
});
