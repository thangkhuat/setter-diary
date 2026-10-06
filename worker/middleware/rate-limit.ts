import type { Context, MiddlewareHandler } from "hono";
import { enforceRateLimit, type RateLimiter } from "../../src/core/shared";
import { errorResponse } from "../errors";
import { logError } from "../log";

/**
 * Refuses a request with `429 RATE_LIMITED` once `limiter` says the key is over
 * its limit. The Workers Rate Limiting binding counts approximately (Story 1.1
 * measured 8 to 12 calls let through on a limit of 5), so set limits with headroom.
 */
export function rateLimit<E extends { Bindings: Env }>(
	limiter: (c: Context<E>) => RateLimiter,
	key: (c: Context<E>) => string,
): MiddlewareHandler<E> {
	return async (c, next) => {
		const result = await enforceRateLimit(limiter(c), key(c), (error) =>
			logError("rate_limiter_failed", error),
		);
		if (!result.ok) {
			return errorResponse(c, "RATE_LIMITED", "Slow down a moment — try again.");
		}
		await next();
	};
}
