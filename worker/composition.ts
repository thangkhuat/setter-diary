// The only place adapters are created and wired to core ports
// (dependency-cruiser rule `adapters-wired-only-in-composition`).
// Nothing is wired yet: Story 1.3 adds the identity adapter and Story 1.5 the
// first rate limiter, e.g. `cloudflareRateLimiter(env.TEAM_CREATE_LIMITER)`.
export type Composition = Record<string, never>;

export function compose(): Composition {
	return {};
}
