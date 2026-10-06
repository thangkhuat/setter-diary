import type { RateLimiter } from "../../../core/shared";

/** The part of the Workers Rate Limiting binding this adapter uses. */
export interface RateLimitBinding {
	limit(options: { key: string }): Promise<{ success: boolean }>;
}

export function cloudflareRateLimiter(binding: RateLimitBinding): RateLimiter {
	return {
		async limit(key) {
			const { success } = await binding.limit({ key });
			return { allowed: success };
		},
	};
}
