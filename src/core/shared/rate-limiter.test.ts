import { describe, expect, it, vi } from "vitest";
import { enforceRateLimit, type RateLimiter } from "./rate-limiter";

const limiterReturning = (allowed: boolean): RateLimiter => ({
	limit: async () => ({ allowed }),
});

describe("enforceRateLimit", () => {
	it("allows a call within the limit", async () => {
		expect(await enforceRateLimit(limiterReturning(true), "k")).toEqual({
			ok: true,
			value: undefined,
		});
	});

	it("refuses a call over the limit with RATE_LIMITED", async () => {
		expect(await enforceRateLimit(limiterReturning(false), "k")).toEqual({
			ok: false,
			error: "RATE_LIMITED",
		});
	});

	it("passes the key to the limiter", async () => {
		const limit = vi.fn(async () => ({ allowed: true }));
		await enforceRateLimit({ limit }, "user:42");
		expect(limit).toHaveBeenCalledWith("user:42");
	});

	it("lets the call through and reports it when the limiter fails", async () => {
		const failure = new Error("binding unavailable");
		const onLimiterError = vi.fn();
		const limiter: RateLimiter = {
			limit: async () => {
				throw failure;
			},
		};

		const result = await enforceRateLimit(limiter, "k", onLimiterError);

		expect(result.ok).toBe(true);
		expect(onLimiterError).toHaveBeenCalledWith(failure);
	});
});
