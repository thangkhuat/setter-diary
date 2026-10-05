# ADR-005: Passwordless sign-in with Better Auth (Google + passkeys)

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-11, AD-12 in `../architecture.md`; PRD change proposed in RFC-001

## Context

The PRD assumed email and password. Secure password hashing at recommended strength cannot run within the Workers Free plan's 10 ms CPU per request, and guidance is never to weaken it. Email sending also needs a purchased domain.

## Options considered

- **Email and password on Workers Paid:** US$5/month.
- **Hosted service (WorkOS AuthKit, free to 1M monthly active users; Clerk, free to 50k):** email and password for free, but user accounts live with a third party and are hard to move, and team roles would still live in our database.
- **Better Auth in our own D1, passwordless:** chosen.

## Decision

Better Auth handles identity only: users, sessions, Google sign-in and passkeys. Teams, members, roles and invites live in the app's `teams` slice. Better Auth's organization plugin is not used, because its members require an account, which conflicts with roster-before-sign-up and anonymisation (ADR-007). Core sees only a `userId` through an Identity port. Lost access is recovered by a manager re-issuing the member's invite link.

## Consequences

- $0, fast sign-in on phones, and no passwords to leak.
- Players without a Google account use a passkey.
- A hosted provider can replace the adapter later if email login becomes necessary.
- Passkeys are bound to the site's hostname. On `*.workers.dev` that is the full app hostname, so moving to a custom domain later invalidates every passkey, and passkey-only players must re-register through a manager's recovery invite. Decide on the domain before inviting real users (see Deferred in `../architecture.md`).
- Passkey-only users get a synthetic, non-routable email (`<userId>@users.invalid`) because Better Auth's user model requires one.
- Whether Better Auth fits the Free plan's 10 ms CPU per request is measured in the first story.
