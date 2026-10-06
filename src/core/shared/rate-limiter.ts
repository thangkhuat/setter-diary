import { err, ok, type Result } from "./result";

/** Port: counts one call for `key` and says whether it is within the limit. */
export interface RateLimiter {
	limit(key: string): Promise<{ allowed: boolean }>;
}

/**
 * A limiter outage must not take the app down with it, so a failing limiter
 * lets the call through and hands the failure to `onLimiterError` for logging.
 */
export async function enforceRateLimit(
	limiter: RateLimiter,
	key: string,
	onLimiterError: (error: unknown) => void = () => {},
): Promise<Result<void, "RATE_LIMITED">> {
	try {
		const { allowed } = await limiter.limit(key);
		return allowed ? ok(undefined) : err("RATE_LIMITED");
	} catch (error) {
		onLimiterError(error);
		return ok(undefined);
	}
}
