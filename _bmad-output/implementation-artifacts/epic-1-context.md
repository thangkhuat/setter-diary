# Epic 1 Context: Sign in and set up my team

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A setter signs in with Google or a passkey (all consents recorded at sign-up), creates a team, adds teammates by name, edits set types and installs the app. The epic also lays the foundation every later epic stands on: the starter template with its delta, CI with an enforced boundary check, design tokens and app shell, the shared visibility function, PWA install, the logo and the privacy policy page. Covers accounts and permissions, roster, set types and team sign-up with isolated data.

## Stories

- Story 1.1: Deployable app from the starter template
- Story 1.2: App shell, design tokens and installable PWA
- Story 1.3: Sign in with Google
- Story 1.4: Sign in with a passkey
- Story 1.5: Create a team
- Story 1.6: Privacy rules: who can see what
- Story 1.7: Add teammates to the roster
- Story 1.8: Edit the team's set types
- Story 1.9: Logo designed with an AI agent
- Story 1.10: Privacy policy page

## Requirements & Constraints

- Users see and do only what their role in a team allows; anything not explicitly allowed is refused on the server. The web app may hide controls but never decides access.
- Teams are fully isolated: no data crosses teams. Access control is designed in from the first story, not retrofitted.
- Managers maintain the roster (no fixed positions); roster members can exist without an account; removing a teammate keeps their history.
- Set types are team-editable, seeded with high outside, back set, quick, shoot, pipe.
- No passwords: sign-in is Google or a passkey. Consents (18+, privacy policy, AI processing) are recorded with timestamps at sign-up, before any data can go to an AI provider.
- Everything runs on Cloudflare's free plan at $0. Limits (100k requests/day, 10 ms CPU and 50 subrequests per request; D1 500 MB, 50 queries per request, 100k rows written/day) degrade to a friendly retry (`503 SERVICE_BUSY`); nothing upgrades or bills automatically. Anything needing a paid plan or purchase is raised as an RFC first.
- Always online: the app shell may load offline, data is always live, no write is queued.
- Phone-first; tap targets at least 48px (56px on logging).
- v1 users are in Australia; the privacy policy must be live before anyone other than the owner signs up.
- Every acceptance criterion maps to an automated test unless marked as a manual check with how it is verified.
- Every feature storing personal data ships its own delete-and-anonymise `prepare*` function for the later account-deletion unit of work.

## Technical Decisions

- **Paradigm:** hexagonal feature slices. `src/core/shared/` (kernel) → `src/core/<slice>/` (model, policy, ports, use-cases, `index.ts`) → `src/adapters/<port>/<vendor>/`; `src/contracts/` (Zod; may import only `src/core/shared/enums.ts`); `worker/` (Hono API edge; adapters wired only in `worker/composition.ts`); `web/` (React PWA; imports only `src/contracts/`).
- **Vendor-free core:** nothing under `src/core/` imports adapters, `worker/`, `web/` or vendor packages (`hono`, `drizzle-orm`, `better-auth`, `cloudflare:*`, `@cloudflare/*`, AI SDKs). dependency-cruiser enforces this, the layer table and the slice order in CI, and CI also runs it on a deliberately broken fixture that must fail.
- **Slice order** (a slice uses only slices below it, through their `index.ts`): shared ← teams ← sessions ← logging, ratings ← progress ← ai, account, notifications. Each table has one owning slice; foreign keys are `ON DELETE RESTRICT`.
- **Delivery:** one PWA as Cloudflare static assets with SPA fallback, plus one Hono Worker under `/api/*` (`assets.run_worker_first: ["/api/*"]`). No server-side rendering. Service worker caches the shell only (`registerType: 'autoUpdate'`, `navigateFallbackDenylist: [/^\/api\//]`). `X-App-Version` header; below the minimum the API returns `426 APP_UPDATE_REQUIRED`.
- **Stack (pinned):** TypeScript 6.0.3; Node 24 LTS; Vite 8.3 with `@vitejs/plugin-react` 6.1; React 19.3; React Router 8.4 (Data mode, client-only); TanStack Query 5.104; vite-plugin-pwa 2.0; Hono 4.13; Zod 4.6; Drizzle ORM 0.45 / drizzle-kit 0.31; Better Auth 1.7 + `@better-auth/passkey` 1.7; Wrangler 4.147; `@cloudflare/vite-plugin` 1.62; Vitest 4.1 + `@cloudflare/vitest-pool-workers` 0.22; dependency-cruiser 18.5. Starter: `npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template`.
- **Starter delta:** `wrangler.json` → `wrangler.jsonc`; SPA to `web/`, Worker to `worker/` (update `main`, Vite root, tsconfig includes); `run_worker_first`; bump `compatibility_date`; Vite 7 → 8; pin TypeScript; add dependency-cruiser; Node 24 in `.nvmrc` and CI.
- **Tenancy:** every team-owned row has `team_id`, `UNIQUE(team_id, id)` and composite foreign keys. Routes: `/api/teams/:teamId/<slice>/...` (TeamScope, `403 NOT_A_MEMBER` before any use case), `/api/me/...` (UserScope), `/api/auth/*`. Each slice tests cross-team read, write and mixed reference.
- **Authorization:** one deny-by-default `policy.ts` per slice. Visibility only from `src/core/teams/visibility.ts` (`diaryAccess`, `canSeeHitter`), by row identity, applied inside queries. Member flags `isSetter`, `isHitter`, `isManager`, `hasTeamView`; creator gets setter + manager; new members default to hitter.
- **Members:** separate from user accounts; `status` active/removed, `user_id`, `former_user_id`, `removed_at`; never hard-deleted; re-adding reactivates the same row. Two lists only: `listSelectableMembers` and `getMembers`.
- **Identity:** Better Auth on D1 behind an `Identity` port; core sees an opaque `userId`. Passkey-only users get `<userId>@users.invalid`. Dev-login adapter for local and preview (`DEV_LOGIN=true`), refused when `ENV=production`. Cookies httpOnly, Secure, SameSite=Lax. Consents in app-owned `user_consents` (owner: account).
- **Set types:** archived (`archived_at`), never deleted; ordered by `position`; names never copied into other slices' rows.
- **Migrations and environments:** linear drizzle-kit journal checked in CI against `main`; one preview D1 per PR, created and seeded by CI, deleted when the PR closes; production D1 created with `--location=oc`; expand/contract migrations. Production deploys to `*.workers.dev` on merge to `main`.
- **Operations:** GitHub Actions; Workers Logs; `wrangler rollback`; D1 Time Travel (7 days on Free) plus a weekly `wrangler d1 export` artifact; `docs/runbook.md`.
- **Conventions:** files and slices kebab-case; tables plural snake_case; UUIDv7 ids generated in core; errors `{ error: { code, message, details? } }` from one closed union in `src/contracts/errors.ts`; structured JSON logs with `requestId` and no personal data; config in `wrangler.jsonc` vars, keys as Worker secrets; CSS custom-property tokens in `web/styles/tokens.css` with CSS Modules, no CSS framework.
- **Open assumptions to settle in this epic:** the Workers Rate Limiting binding works on the Free plan (Story 1.1; fallback is a per-isolate best-effort limit or an RFC); Better Auth fits the 10 ms CPU limit (measured in Stories 1.3 and 1.4).

## UX & Interaction Patterns

- Tokens: light on white, dark on true black, following the device; brand navy and red; rating colours used only for ratings; all text meets WCAG AA in both themes.
- Shell: header (team name, profile button) and a bottom tab bar per role; red `+` button bottom-right; bottom sheets one level deep, closed by swipe down or Cancel; Reduce Motion shows sheets and toasts instantly.
- Tap always works: no long-press-only, drag or gesture-only actions.
- Voice: short, plain, no exclamation marks.
- Log in: Continue with Google, Use a passkey, Create an account. Welcome (no team): Create a team, Join with an invite link.
- Team tab: set types with "+ Add", roster with role tags; read-only for non-managers.

## Cross-Story Dependencies

- 1.1 is the base for everything; it confirms (or replaces) the rate-limiting approach that 1.5, 2.3 and 4.2 rely on.
- 1.2's shell uses a stubbed signed-in user until 1.3 (sign-in) and 1.5 (memberships) exist.
- 1.3 links to `/privacy`, delivered by 1.10; 1.10 must be live before anyone other than the owner signs up.
- 1.4 reuses 1.3's session cookie and consent recording.
- 1.6's visibility functions are consumed by every later slice's policy.
- 1.7 fixes the `members` columns so later stories add none; invites arrive in Epic 4.
- 1.9 and 1.10 depend only on 1.2 and can run at any time; 1.9 replaces 1.2's placeholder icon.
