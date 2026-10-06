import { describe, expect, it, vi } from "vitest";
import { cloudflareRateLimiter } from "./index";

describe("cloudflareRateLimiter", () => {
	it("maps the binding's success flag to allowed and passes the key", async () => {
		const limit = vi
			.fn<(options: { key: string }) => Promise<{ success: boolean }>>()
			.mockResolvedValueOnce({ success: true })
			.mockResolvedValueOnce({ success: false });
		const limiter = cloudflareRateLimiter({ limit });

		expect(await limiter.limit("user:1")).toEqual({ allowed: true });
		expect(await limiter.limit("user:1")).toEqual({ allowed: false });
		expect(limit).toHaveBeenCalledWith({ key: "user:1" });
	});
});
