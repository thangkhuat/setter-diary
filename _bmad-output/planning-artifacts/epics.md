---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - prd-setter-diary/PRD.md
  - prd-setter-diary/data-dictionary.md
  - prd-setter-diary/permissions-matrix.md
  - prd-setter-diary/reporting-requirements.md
  - architecture/architecture-setter-diary-2026-10-05/architecture.md
  - architecture/architecture-setter-diary-2026-10-05/adr/
  - ux-designs/ux-setter-diary-2026-10-05/design-system.md
  - ux-designs/ux-setter-diary-2026-10-05/ux-specification.md
  - ux-designs/ux-setter-diary-2026-10-05/mockups/screens.html
  - rfc/RFC-001-free-ai-and-passwordless-sign-in.md
---

# Setter Diary - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Setter Diary, decomposing the requirements from the PRD, the UX design (design system and UX specification) and the architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Setters and teammates have accounts, log in, and see and do only what their permissions allow; any action or view outside a role's row in the permissions matrix is refused.
FR2: A team's managers maintain its roster (no fixed positions); roster members are the hitters selectable when logging; removing a teammate keeps their history in the team's data.
FR3: Managers edit the team's set-type list, seeded with high outside, back set, quick, shoot, pipe; a new set type is selectable in logging and filterable in the trend and grid.
FR4: A setter's sets are grouped under a session with date, game or practice, notes, and the players involved, each with an optional position for that session (Outside, Setter, Opposite, Middle, Libero); every set belongs to one session, one setter and an involved player.
FR5: A setter logs their own sets in a batch (after a game set, a drill or a whole game) by recalling per player how many sets of each set type, pass quality and rating; each counted set is stored individually; no typing; one game set's sets in under 3 minutes on a phone.
FR6: A hitter gives one rating mix per session for the sets received from that session's setter — for each rating 0–3, Never, Rarely, Sometimes or Mostly — judged by comfort, with at least one above Never; available as soon as the session including them exists; stored separately from setter ratings; the setter sees each hitter's mix.
FR7: A per-setter consistency trend shows weekly average rating and % hittable sets (rating 2–3), filterable by set type.
FR8: A per-setter hitter × set-type grid shows average rating per combination and its change since a chosen date (before → now); a hitter sees only their own row.
FR9: Each player has a personal dashboard: the quality of sets they received over time, each team setter's trend, and their own grid row, and no other hitter's data.
FR10: A new team can sign up and gets its own roster, set types, sessions and data; teams never see or change each other's data.
FR11: A team manager can give any member team-wide view: every setter's diary and every hitter's data for that team; no one outside the team ever sees it.
FR12: A user can delete their account; they can no longer log in; their sets and ratings remain under an anonymous label with no name or contact details.
FR13: A user can export their own data as a CSV that opens in common phone spreadsheet apps.
FR14: A setter opens an AI discussion from an Ask AI button; the AI points to specific patterns in the setter's own data and answers follow-ups tied to that data; the conversation is saved and private; each person may start 2 discussions a day; when that or the app's daily allowance runs out, the setter is told to try again tomorrow.
FR15: A player joins a team through a manager's invite link, creating an account already on the team or adding the team to an existing account; expired or used links are refused.
FR16: One account can belong to several teams with a role per team and switch between them; a setter in one team and hitter in another sees matching views in each; no data crosses teams.
FR17: Team managers administer roster, invites, members' setter and hitter roles, set types and team-wide view grants; the creator is the first manager and a setter; new members start as hitters; non-managers are refused; the last manager cannot step down or leave.

### NonFunctional Requirements

NFR1: Ratings are outcome-based on the fixed 0–3 scale (3 full swing, 2 attack with adjustment, 1 free ball or tip, 0 unhittable or setting fault); no "how it felt" scale for setters.
NFR2: Every set opportunity is logged; no fixed sample block.
NFR3: By default a setter sees only their own diary and a hitter never sees another hitter's data; only team-wide view widens this; data never crosses teams.
NFR4: Hitter rating entry is flexible in timing (given on the spot, entered after the game or practice).
NFR5: The AI uses only data the user may see; conversations are private to their owner (not even team-wide view holders); they are deleted with the account.
NFR6: No data goes to an AI provider before consent; every user consents at sign-up; only aggregated stats are sent, with teammates' names replaced by labels; non-consenting players are never named or shown individually.
NFR7: AI runs free on a provider that does not train on our data (Cloudflare Workers AI) through one gateway; the app pays nothing; limits are daily and configurable (v1: 2 new discussions per person per day plus the app-wide allowance).
NFR8: No passwords: sign-in is Google or a passkey.
NFR9: Deleting an account anonymises the user's data rather than removing it.
NFR10: v1 users are in Australia; the product may extend worldwide (privacy obligations to be checked before inviting communities beyond the first team).
NFR11: Hitter ratings and setter ratings are kept separate; neither overwrites the other.
NFR12: Accuracy comes from design, not video; no v1 feature depends on video.
NFR13: Phone-first: every v1 flow is designed for a phone screen first.
NFR14: Logging uses large tap targets and no typing.
NFR15: Views emphasise multi-week trends over single sessions; weeks are ISO weeks (Monday start) in the team's time zone.
NFR16: Access control is designed into v1, not retrofitted.
NFR17: The whole app runs on Cloudflare's free plan at $0; limit errors degrade to friendly retry messages; nothing upgrades or bills automatically.
NFR18: Always online: no offline logging; the app shell may load offline but data is always live.

### Additional Requirements

From `architecture.md` (AD-1 to AD-22) and the ADRs:

- **Starter template (Epic 1, Story 1):** `npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template`, then apply the starter delta: rename `wrangler.json` to `wrangler.jsonc`; move the SPA to `web/` and the Worker to `worker/`; add `assets.run_worker_first: ["/api/*"]`; bump `compatibility_date`; upgrade Vite 7 → 8 with `@vitejs/plugin-react` 6; pin TypeScript 6.0.3; add dependency-cruiser; Node 24 in `.nvmrc` and CI.
- **Pinned stack:** React 19.3, Vite 8.3, React Router 8.4 (Data mode, client-only), TanStack Query 5.104, vite-plugin-pwa 2.0, Hono 4.13, Zod 4.6, Drizzle ORM 0.45 / drizzle-kit 0.31, Better Auth 1.7 + `@better-auth/passkey` 1.7, @pushforge/builder 2.0, Wrangler 4.147, @cloudflare/vite-plugin 1.62, Vitest 4.1 + @cloudflare/vitest-pool-workers 0.22, dependency-cruiser 18.5.
- **Structure (AD-1, AD-2):** hexagonal feature slices `teams`, `sessions`, `logging`, `ratings`, `progress`, `ai`, `account`, `notifications` in a fixed dependency order; core never imports vendor code; dependency-cruiser in CI plus a deliberately broken fixture that must fail; table ownership per slice; `ON DELETE RESTRICT`.
- **Delivery (AD-3, AD-14):** one PWA served as static assets plus one Hono API Worker under `/api/*`; service worker caches the shell only, `registerType: 'autoUpdate'`, `navigateFallbackDenylist: [/^\/api\//]`; `X-App-Version` header and `426 APP_UPDATE_REQUIRED`.
- **Tenancy (AD-4):** `team_id` on every team-owned row with `UNIQUE(team_id, id)` and composite foreign keys; routes `/api/teams/:teamId/...` (TeamScope, `403 NOT_A_MEMBER`), `/api/me/...` (UserScope), `SystemScope` only in `worker/composition.ts`; cross-team read, write and mixed-reference tests per slice.
- **Authorization (AD-5):** one `policy.ts` per slice, deny by default; visibility only via `teams/visibility.ts` (`diaryAccess`, `canSeeHitter`) by row identity, applied inside queries; `visibility.test.ts` covers the permissions matrix; member flags `isSetter`, `isHitter`, `isManager`, `hasTeamView`; `409 LAST_MANAGER`.
- **Members and deletion (AD-6, AD-7, AD-18):** member `status` active/removed, `user_id`, `former_user_id`; `listSelectableMembers` and `getMembers`; account deletion as one unit of work with "Former player N" via `teams.former_seq`, set-based statements (≤ 50 queries), Better Auth rows last, `deletion_pending_at` retry.
- **Stats (AD-8, AD-9, AD-17, AD-20, AD-21):** `set_entries` and `hitter_session_ratings` tables; rating lock derived from `nextSessionWith`; pending list from `GET /api/me/ratings/pending`; all aggregation only in `progress` via declared public columns; set types archived, never deleted; one idempotent `POST` per tally tap with client UUIDv7; Fix mode deletes the newest matching row.
- **AI (AD-10):** `AiGateway` port, Workers AI via AI Gateway with body logging off; model IDs in config (`AI_MODEL_PRIMARY`, `AI_MODEL_FALLBACK`) chosen by a bake-off (Gemma 4 26B, GLM 4.7-Flash, gpt-oss-20b/120b, Llama 3.3 70B fp8-fast); per-user UTC-day quota with conditional update and refund on error; `ai_usage_daily` neuron estimate drives fallback; `AI_MAX_TURNS`; messages stored with labels and a label → member map; input built by `progress` with consent exclusions.
- **Identity (AD-11, AD-12):** Better Auth on D1 for users, sessions, Google and passkeys only; synthetic `<userId>@users.invalid` for passkey-only users; cookie cache; consents in app-owned `user_consents`; dev-login adapter for local and preview (refused in production); invites hashed, `kind: join | recovery`, 7-day expiry, preview sets an httpOnly cookie, conditional redeem with `CONSENT_REQUIRED`, `ALREADY_IN_TEAM`, `MEMBER_ALREADY_LINKED`.
- **Free plan (AD-13):** stay within Workers Free limits; map limit errors to `503 SERVICE_BUSY`; Turnstile on team creation and invite preview plus one rate-limiting rule [assumption].
- **Time (AD-15):** UTC storage; team IANA time zone (default `Australia/Sydney`); `session_date` and stored `iso_week`; before = `< since`, now = `≥ since`; "today" supplied by the API.
- **Notifications (AD-16):** Web Push via `Notifier` port, VAPID secrets; `ParticipantAdded` domain event → one push per (session, linked participant), logged in `notification_log`.
- **Export (AD-22):** one CSV per membership: sets the user gave as setter, hitter ratings the user gave, and sets received aggregated as their own grid row.
- **Migrations and environments (AD-19):** linear drizzle-kit journal checked in CI; one preview D1 per PR, seeded and deleted by CI; expand/contract production migrations; D1 created with `--location=oc`.
- **Operations:** GitHub Actions CI (tests, boundary check, journal check, preview DB, migrate, deploy main); Workers Logs; Cloudflare usage notifications; weekly `wrangler d1 export` to a private retention-limited artifact; `wrangler rollback`; `docs/runbook.md` (restore, rollback, secret rotation); Google OAuth consent screen "In production".
- **First-story spikes:** measure Better Auth CPU per request in Workers Logs (10 ms limit; [assumption] until measured); AI model bake-off on a real stats summary.
- **Conventions:** UUIDv7 ids; enums in `src/core/shared/enums.ts`; Zod contracts in `src/contracts/` (`common.ts`, `errors.ts` closed error union, `<slice>.ts`); structured JSON logs without personal data; TanStack Query keyed by `[slice, teamId, ...]`; design tokens as CSS custom properties with CSS Modules.

### UX Design Requirements

UX-DR1: Implement design tokens from `design-system.md` as CSS custom properties in `web/styles/tokens.css`: colours with light and dark pairs (surface-base white / true black following the device setting, surface-raised, ink, border, brand-navy, brand-red, on-brand), rating colours (0 grey, 1 amber, 2 sky blue, 3 green, dark `on-rating` numerals), error; typography roles (display-number, title, label, body, meta; system UI font; tabular numerals); spacing 4–32 plus tap-min 48 and tap-log 56; radii sm/md/lg/full.
UX-DR2: Contrast: all text and numerals meet WCAG AA (4.5:1) in both themes; brand red only for the primary action and brand, never for ratings; rating colours used only for ratings.
UX-DR3: App shell: bottom tab bar per role in the current team (setter: Sessions / Progress / Team; hitter: Home / Setters / Team; both: setter tabs plus Home); header with team name as team switcher and a profile button to Settings.
UX-DR4: `+` floating action button (red circle, bottom-right) and bottom Sheet component (title, large fields, primary button at bottom, swipe down or Cancel closes without saving); sheets stack one level deep.
UX-DR5: Toast component with Undo (5 s, ink bar, underlined Undo).
UX-DR6: Session card: header (date, Game or Practice, total sets) plus one row per involved player (name, set count, average numeral, stacked rating-mix bar).
UX-DR7: Logging screen: player tabs with set counts; pass chips (Good / OK / Poor, sticky per player); tally grid (set-type rows × rating 0–3 columns with coloured numeral headers, 56px neutral cells showing counts or a faint "+"); selected-cell bar (tapping a cell adds one and selects it; a bottom bar shows the selected cell with 56px "−" and "+" buttons; "−" disabled at 0; no modes); "Logged" toast "Mia · High outside · 3 · +1"; haptic tick where supported; grid scrolls vertically at large text sizes rather than shrinking.
UX-DR8: Who played? sheet: multi-select players with optional position chips (OH / S / OPP / MB / L, 48px, pre-filled from the player's previous session); Continue disabled until one player is selected.
UX-DR9: Saved session view: a saved session opens read-only (no accidental changes); Fix unlocks the same tap-adds-and-selects grid with the selected-cell bar as initial logging; Done or leaving locks it again.
UX-DR10: Rate session sheet with prompt "How were Thang's sets to hit today?" and frequency chips: one row per rating 3 to 0 (colour block, numeral, caption Full swing / Adjust / Free ball / Unhittable) with Never / Rarely / Sometimes / Mostly (48px, default Never); Save rating enabled once one row is above Never.
UX-DR11: "To rate" card (raised card with red left edge, team name and session in meta) on hitter Home, from all of the user's teams; tapping switches to that team.
UX-DR12: Trend chart: one column per ISO week coloured by nearest rating colour with average numeral; % hittable line in ink; set-type filter chips (default All); thin-data message "Not enough data yet — log 2 more weeks to see a trend."
UX-DR13: Progress grid: hitters × set types, cells filled with the nearest rating colour, average numeral, "before → now" in meta, "since" date picker; hitters see only their own row.
UX-DR14: Ask AI button (52px round, surface-raised, sparkle icon, bottom-right on Progress, setters only) and AI discussion screen (AI bubbles on surface-raised left, user bubbles navy right, rating numbers as rating-colour chips, "1 of 2 discussions today", Past discussions, typing indicator, message box).
UX-DR15: Team screen: Team stats entry (only with team-wide view), Set types section with "+ Add", roster with role and Manager tag and inline Team view switch (managers only); read-only for non-managers; member sheet with Setter, Hitter and Team manager toggles, recovery invite and remove; last-manager guard message.
UX-DR16: Add player sheet (name only) showing the invite link with Share link and Done.
UX-DR17: Log in screen (logo, Continue with Google, Use a passkey, "No passwords. Lost access? Ask your team manager to resend your invite.", Create an account) and Create account screen (invite card "You're joining …", name pre-filled, required 18+/privacy and AI-consent checkboxes, Continue with Google or Create a passkey); iOS Add-to-Home-Screen tip after sign-up.
UX-DR18: Welcome (no team) screen: logo placeholder, "You're not on a team yet", Create a team, Join with an invite link.
UX-DR19: Team switcher sheet (teams with role per team and to-rate count, Join another team, Create a team, Leave this team with confirmation and last-manager guard) and Settings (Export my data, Join another team, Log out, Delete account with confirm sheet copy).
UX-DR20: State and microcopy set from the UX specification: empty roster, no sessions, no players selected, zero count in Fix mode, sign-in failed, lost access, invite expired, network error ("Couldn't save — check your connection."), no team-wide view (hidden), daily AI limit (you) and (app), follow-up cap, account deletion confirm; voice rules (short, no exclamation marks, team's volleyball words).
UX-DR21: Accessibility floor: ratings always show the numeral; pass and position chips carry text; tap targets ≥ 56px on Logging and ≥ 48px elsewhere; screen-reader labels with role and state (e.g. "Mia, high outside, rating 3, 5 sets, add one"); respects device text size; Reduce Motion shows sheets and toasts instantly.
UX-DR22: Interaction primitives: tap to act everywhere; swipe down closes sheets; swipe-to-delete only with Undo; banned: long-press-only actions, drag-to-reorder, icon-only buttons on Logging, timers.
UX-DR23: PWA install: app icon and manifest in team colours, full-screen standalone display, light/dark following the device; uses a placeholder icon until UX-DR24 delivers the logo.
UX-DR24: Logo, designed with an AI agent: the agent produces several original logo concepts as SVG against the design-system requirements (unique and memorable enough to invite a tap after a session; navy, red and white; legible at home-screen icon size; works on light and dark backgrounds); the owner picks one; it is exported as the app icon set (PWA manifest sizes, maskable icon, favicon) and replaces the placeholder in Log in, Welcome and the app icon.

### FR Coverage Map

FR1: Epic 1 - Accounts, sign-in and permission enforcement (visibility foundation; every later epic adds its own checks)
FR2: Epic 1 - Roster maintained by managers, members without accounts
FR3: Epic 1 - Editable set-type list with defaults
FR4: Epic 2 - Sessions with players involved and per-session positions
FR5: Epic 2 - Tally logging after training
FR6: Epic 5 - Hitter rating mix per session
FR7: Epic 3 - Consistency trend
FR8: Epic 3 - Hitter × set-type grid with before → now
FR9: Epic 5 - Hitter dashboard
FR10: Epic 1 - Team sign-up with isolated data
FR11: Epic 4 - Team-wide view and Team stats
FR12: Epic 7 - Account deletion with anonymisation
FR13: Epic 7 - CSV export
FR14: Epic 6 - Ask AI discussion
FR15: Epic 4 - Invite links (join and recovery)
FR16: Epic 4 - One account across several teams
FR17: Epic 4 - Team manager roles (flags, last-manager guard)

## Epic List

Delivery order: 1 → 2 → 3 → field-trial checkpoint → 4 → 5 → 6 → 7. Each epic stands on the earlier ones only.

**Cross-epic rules:**
- Every feature that stores personal data includes its own delete-and-anonymise step (`prepare*` functions for the unit of work, AD-18) in its stories; Epic 7 orchestrates them.
- Release gate: no communities beyond the owner's team are invited until Epic 7 is done and the privacy check (NFR10) is complete.
- Every acceptance criterion maps to at least one automated test (Vitest unit, Workers-runtime integration, or end-to-end), unless it is marked [manual check] with how it is verified.

### Epic 1: Sign in and set up my team
A setter signs in with Google or a passkey (all consents recorded at sign-up), creates a team, adds teammates by name, edits set types and installs the app. Includes the foundation: starter template and delta, CI with boundary check, design tokens and app shell, shared visibility function with permissions-matrix tests, sign-in CPU spike, PWA install and the logo.
**FRs covered:** FR1, FR2, FR3, FR10

### Epic 2: Log a session after training
A setter creates a session, picks who played and their positions, tally-logs every set in under 3 minutes per game set, and reviews each player's logs on session cards and entry lists.
**FRs covered:** FR4, FR5

### Epic 3: See my progress as a setter
A setter sees their weekly consistency trend (filterable by set type) and the hitter × set-type grid with before → now since a chosen date.
**FRs covered:** FR7, FR8

### Field-trial checkpoint
Delivered as Story 3.3: the owner uses Epics 1–3 with the team for about two weeks, checks the success criteria, and records adjustments before Epic 4 starts.

### Epic 4: Bring teammates in
Managers invite teammates by link (join and recovery), teammates join or add the team to an existing account and switch between teams, managers set setter/hitter roles and other managers, and grant team-wide view with a Team stats screen.
**FRs covered:** FR11, FR15, FR16, FR17

### Epic 5: Hitters rate and see their own progress
Hitters get "To rate" cards across their teams (with push where supported), give one rating per session, and see their own dashboard and each setter's trend with only their own grid row; setters see each hitter's rating.
**FRs covered:** FR6, FR9

### Epic 6: Ask AI how to improve
After an AI model bake-off, setters open Ask AI for a discussion grounded in their own stats, with daily limits, private saved discussions and graceful "try again tomorrow" states.
**FRs covered:** FR14

### Epic 7: Own your data
Users export their data as CSV and delete their account; deletion anonymises them everywhere through one unit of work.
**FRs covered:** FR12, FR13

## Epic 1: Sign in and set up my team

A setter signs in with Google or a passkey, creates a team, adds teammates by name, edits set types and installs the app, on a foundation that enforces the architecture rules from day one.

### Story 1.1: Deployable app from the starter template

As the app owner,
I want the official Cloudflare starter set up with our structure, checks and pipeline,
So that every later story builds on a deployed, rule-checked app that costs nothing to run.

**Requirements:** NFR16, NFR17, NFR18 (foundation for every FR); architecture starter, AD-1, AD-2, AD-19

**Acceptance Criteria:**

**Given** a fresh repository
**When** the project is created with `npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template` and the starter delta is applied
**Then** the SPA lives in `web/`, the Worker in `worker/`, core in `src/core/`, adapters in `src/adapters/` and contracts in `src/contracts/`, with `wrangler.jsonc`, a current `compatibility_date`, `assets.run_worker_first: ["/api/*"]`, Vite 8 with `@vitejs/plugin-react` 6, TypeScript 6.0.3 and Node 24 in `.nvmrc`
**And** all versions match the architecture Stack table

**Given** the dependency-cruiser configuration for AD-1 and AD-2 (layer table and slice order)
**When** CI runs
**Then** the boundary check passes on the real code and fails on a fixture that deliberately imports a vendor package from `src/core/`

**Given** a pull request
**When** CI runs
**Then** it installs, type-checks, runs Vitest (core and Workers pool), runs the boundary check, checks that the drizzle-kit migration journal is linear against `main`, creates and seeds a preview D1 for that PR and deploys a preview Worker
**And** closing the PR deletes its preview D1

**Given** a merge to `main`
**When** CI runs
**Then** migrations are applied to the production D1 (created with `--location=oc`) and the Worker is deployed to `*.workers.dev`
**And** `GET /api/health` returns `200` with the app version

**Given** the repository
**Then** `docs/runbook.md` covers deploy, `wrangler rollback`, Time Travel restore (7 days on Free) and secret rotation
**And** a weekly GitHub Actions job runs `wrangler d1 export` to a private, retention-limited artifact

### Story 1.2: App shell, design tokens and installable PWA

As a player,
I want the app to look like our team and install to my home screen,
So that it feels like our own app and opens instantly after training.

**Requirements:** NFR13, NFR18; UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR21, UX-DR22, UX-DR23; AD-3, AD-14

**Acceptance Criteria:**

**Given** `design-system.md`
**When** `web/styles/tokens.css` is built (UX-DR1, UX-DR2)
**Then** every colour, typography, spacing (including tap-min 48px and tap-log 56px) and radius token exists as a CSS custom property, with light values on white and dark values on true black, switched by `prefers-color-scheme`
**And** an automated test checks that text and numerals on every token pair meet WCAG AA (4.5:1)

**Given** a signed-in user (stubbed until Stories 1.3 and 1.5 provide sign-in and memberships)
**When** the app shell renders
**Then** it shows the header (team name and profile button) and the bottom tab bar for the user's role in the current team (UX-DR3), using CSS Modules and React Router in Data mode, client-only
**And** sheets and toasts appear instantly when Reduce Motion is on

**Given** the PWA configuration (vite-plugin-pwa, UX-DR23)
**When** the app is built
**Then** it has a manifest (standalone display, team colours, a placeholder icon set including a maskable icon) and a service worker that caches the app shell only, with `registerType: 'autoUpdate'` and `navigateFallbackDenylist: [/^\/api\//]`
**And** API responses are never cached

**Given** the web app sends `X-App-Version` on every request
**When** the API's configured minimum version is higher
**Then** the API returns `426 APP_UPDATE_REQUIRED` and the web app reloads

**Given** the phone is offline
**When** the user opens the installed app
**Then** the shell loads and shows a "no connection" state instead of data

**Given** the shared `+` button and Sheet components (UX-DR4, UX-DR22)
**Then** the `+` button is a red 64px circle bottom-right; a sheet slides up with its title, large fields and a primary button at the bottom; swiping down or tapping Cancel closes it without saving; sheets never stack more than one level deep
**And** no core action depends on a gesture, long-press or drag; a tap always works

### Story 1.3: Sign in with Google

As a player,
I want to sign in with my Google account, without a password,
So that getting in at the gym is one tap.

**Requirements:** FR1; NFR6, NFR8; UX-DR17; AD-11

**Acceptance Criteria:**

**Given** the Log in screen (UX-DR17)
**When** a user taps Continue with Google
**Then** Better Auth (on D1 via Drizzle) signs them in and sets an httpOnly, Secure, SameSite=Lax session cookie
**And** core receives only an opaque `userId` through the `Identity` port, and Better Auth tables are declared in `schema/identity.ts`

**Given** a new user on Create account
**When** they submit
**Then** a display name is required and both required checkboxes (18+ and privacy policy; AI processing) must be ticked
**And** each consent is stored with a timestamp in the app-owned `user_consents` table (owner: account), readable only via `account.getConsents(userIds)`

**Given** sign-in is cancelled or fails
**Then** "Sign-in didn't finish. Try again." is shown and the sign-in buttons stay available

**Given** any request that changes data
**Then** the API accepts it only when its `Origin` header is the app's own origin, in addition to the SameSite cookie

**Given** a local or preview environment
**Then** sign-in uses the dev-login adapter (`DEV_LOGIN=true`)
**And** the Worker refuses to start if `DEV_LOGIN` is set with `ENV=production`

**Given** the Google OAuth consent screen
**Then** it is published "In production" with basic scopes (openid, email, profile), and sign-in is tested with an ordinary Google account that is not on a test-user list [manual check: production sign-in]

**Given** the deployed production Worker
**When** a Google sign-in and a session read run
**Then** their CPU time is read from Workers Logs and recorded in the story notes [manual check: Workers Logs readings]
**And** if either exceeds 10 ms, the cookie-cache and per-isolate mitigations are applied and re-measured, or the result is raised as an RFC

**Given** a signed-in user
**When** they open Settings and tap Log out
**Then** the session ends and the Log in screen shows

**Given** the account slice
**Then** it exposes `prepareDeleteConsentsForUser(userId)` returning deferred statements for the later account-deletion unit of work (AD-18)

### Story 1.4: Sign in with a passkey

As a player without a Google account, or who prefers Face ID or a fingerprint,
I want to sign in with a passkey,
So that I don't need any other account or a password.

**Requirements:** FR1; NFR8; UX-DR17; AD-11

**Acceptance Criteria:**

**Given** the Log in and Create account screens
**When** a user taps Use a passkey or Create a passkey
**Then** Better Auth's passkey plugin (`@better-auth/passkey`, relying-party ID and origin from per-environment configuration) registers or verifies the passkey and signs them in with the same session cookie as Story 1.3
**And** passkey-first sign-up records the same consents as Story 1.3 before the account exists

**Given** a passkey-only user
**Then** they receive the synthetic email `<userId>@users.invalid`, which is never shown or used

**Given** an iPhone browser that is not running the installed app
**When** sign-up finishes
**Then** an Add-to-Home-Screen tip is shown once

**Given** the deployed production Worker
**When** a passkey registration and a passkey sign-in run
**Then** their CPU time is read from Workers Logs and recorded in the story notes [manual check: Workers Logs readings]
**And** results over 10 ms are handled as in Story 1.3

### Story 1.5: Create a team

As a setter,
I want to create my team after signing in,
So that I have a private space for my team's data.

**Requirements:** FR10, FR17 (creator is first manager); UX-DR18; AD-4

**Acceptance Criteria:**

**Given** a signed-in user with no team
**When** they tap Create a team on the Welcome screen (UX-DR18) and enter a name
**Then** one D1 batch creates the team (time zone `Australia/Sydney` by default, `former_seq = 0`), the creator's member (`isSetter = true`, `isManager = true`, `isHitter = false`, linked to the user) and the five default set types (high outside, back set, quick, shoot, pipe) with positions
**And** the app opens on the setter tabs for that team

**Given** team creation is an entry point open to any signed-in user
**Then** it is protected by one Cloudflare rate-limiting rule (Turnstile is added in Story 4.2)

**Given** any route under `/api/teams/:teamId/...`
**When** the session user has no active member in that team
**Then** the API returns `403 NOT_A_MEMBER` before any use case runs
**And** otherwise the use case receives `TeamScope { teamId, member }`

**Given** a signed-in user
**When** the app starts
**Then** `GET /api/me/memberships` (UserScope) returns the user's active teams with their flags, and the shell uses it to pick the current team and show the matching tabs (Story 1.2); the team switcher builds on it later (Story 4.3)

**Given** the `teams` tables
**Then** each has `team_id`, `UNIQUE(team_id, id)` and composite foreign keys
**And** tests prove that a cross-team read, a cross-team write and a mixed-team reference all fail

### Story 1.6: Privacy rules: who can see what

As a player,
I want the app to decide what I can see in one consistent way,
So that my data and my teammates' data are never shown to the wrong person.

**Requirements:** FR1; NFR3, NFR16; AD-5

**Acceptance Criteria:**

**Given** `src/core/teams/visibility.ts`, exported via `teams/index.ts`
**When** `diaryAccess(actor, setterMemberId)` is called
**Then** it returns `full` for the setter themself and for `hasTeamView` holders, `trend_only` or `own_rows` for other active members (decided by row identity, never by the `isHitter` flag), and `none` for non-members
**And** `canSeeHitter(actor, hitterMemberId)` follows the same rules

**Given** `visibility.test.ts`
**Then** it encodes every row of `permissions-matrix.md` as table-driven cases, and they pass

**Given** each slice's `policy.ts`
**Then** it denies by default and calls the shared visibility functions instead of re-deriving them
**And** a boundary or test check fails if a slice re-implements visibility

### Story 1.7: Add teammates to the roster

As a team manager,
I want to add my teammates by name,
So that I can log sets to them even before they sign up.

**Requirements:** FR2; UX-DR4, UX-DR15; AD-6, AD-7

**Acceptance Criteria:**

**Given** a manager on the Team tab
**When** they tap `+`, enter a name in the Add player sheet and tap Add player
**Then** an active member is created with `isHitter = true` and no linked account, and appears in the roster
**And** the `members` table has `user_id`, `former_user_id`, `status` and `removed_at` columns from here on (AD-6), so later stories add no member columns
**And** the sheet notes that invite links arrive in a later update

**Given** a member, with or without logged data
**When** a manager removes them from the team
**Then** the member's status becomes `removed` (never hard-deleted)
**And** they disappear from `listSelectableMembers` but remain in `getMembers` for history

**Given** a member who is not a manager
**When** they open the Team tab
**Then** the roster is read-only, with no `+` and no edit controls (UX-DR15)
**And** the API refuses manager actions

**Given** a team with no other members
**Then** the Team tab shows "Add your teammates to start logging." with `+` highlighted

**Given** the teams slice
**Then** it exposes `prepareAnonymiseMembersForUser(userId)` returning deferred statements that rename linked and formerly linked members to "Former player N" using `former_seq` (AD-7, AD-18)

### Story 1.8: Edit the team's set types

As a team manager,
I want to add, rename, reorder and archive set types,
So that logging matches the sets my team actually runs.

**Requirements:** FR3; UX-DR15; AD-20

**Acceptance Criteria:**

**Given** a manager in the Team tab's Set types section
**When** they tap "+ Add" and enter a name
**Then** the set type is added at the end of the order and is available to logging

**Given** an existing set type
**When** a manager renames it
**Then** all history shows the new name, because no other slice stores set-type names

**Given** an existing set type
**When** a manager archives it
**Then** it gets `archived_at` and disappears from the tally grid
**And** it stays available to progress, filters and export; set types are never hard-deleted

**Given** the list of set types
**When** a manager moves a type up or down with buttons (no drag)
**Then** its `position` updates and the new order is used everywhere

**Given** a non-manager
**Then** set types are read-only and the API refuses changes

### Story 1.9: Logo designed with an AI agent

As the app owner,
I want an AI agent to propose original logo concepts that I choose from,
So that the app has a memorable icon players want to tap after a session.

**Requirements:** UX-DR24

**Acceptance Criteria:**

**Given** the logo brief in `design-system.md` (UX-DR24: unique and memorable; navy, red and white; legible at home-screen size; works on light and dark)
**When** the agent runs
**Then** it produces at least four original concepts as SVG, each shown at 1024px, 192px and 48px, in light and dark, on one review page [manual check: owner review]

**Given** the owner picks one concept
**When** it is exported
**Then** the PWA icon set (manifest sizes and a maskable icon), the favicon and an Apple touch icon are generated
**And** the logo replaces the placeholder on Log in, Welcome and the app icon

**Given** this story
**Then** it depends on nothing after Story 1.2 and can run at any time

## Epic 2: Log a session after training

A setter creates a session, picks who played and their positions, tally-logs every set in under 3 minutes per game set, and reviews each player's logs on session cards and entry lists.

### Story 2.1: Create a session

As a setter,
I want to start a session after a game or practice,
So that the sets I log are grouped by when and how they happened.

**Requirements:** FR4; NFR15; AD-15

**Acceptance Criteria:**

**Given** a member with `isSetter = true` on the Sessions tab
**When** they tap `+`
**Then** the New session sheet opens with the date pre-filled as today in the team's time zone (supplied by the API), Game or Practice to choose, and optional notes
**And** members without `isSetter` don't see `+`, and the API refuses to create sessions for them

**Given** the setter taps Next
**When** the session is saved
**Then** the `sessions` table stores `team_id`, the setter member (whose diary it is), the member who created it (the same person in v1), `session_date`, `iso_week` (computed in `core/shared/time.ts`), kind and notes, with `UNIQUE(team_id, id)` and composite foreign keys
**And** the Who played? step opens (Story 2.2)

**Given** the setter picks a date later than today in the team's time zone
**Then** the date is refused with a plain message, and the API rejects it too

**Given** a setter with no sessions
**Then** the Sessions tab shows "After your next game or practice, tap + to log it."

**Given** a week boundary
**Then** tests confirm that `iso_week` uses Monday-start ISO weeks in the team time zone, including sessions on Sunday night and Monday morning local time

### Story 2.2: Choose who played and their positions

As a setter,
I want to pick the players in this session and, optionally, their position today,
So that logging only shows the right players and positions can change between sessions.

**Requirements:** FR4; UX-DR8; AD-2

**Acceptance Criteria:**

**Given** the Who played? sheet (UX-DR8)
**When** it opens
**Then** it lists `listSelectableMembers` (active members only) with a check box each
**And** Continue is disabled until at least one player is selected

**Given** a selected player
**Then** position chips OH / S / OPP / MB / L (48px, screen-reader labels with full names) are shown, optional, pre-filled from that player's position in their previous session with this team

**Given** the setter taps Start logging
**Then** `session_participants` rows are saved (team-scoped, composite foreign keys) with each optional position
**And** the Logging screen opens

**Given** a session's participants
**When** the setter later edits Who played? and removes a participant
**Then** the removal is refused with `409 PARTICIPANT_HAS_DATA` if a `ParticipantDataCheck` port reports data for them; until logging exists, the port's default implementation reports no data

### Story 2.3: Tally-log sets per player

As a setter,
I want to tap a grid once for each set I remember giving a player,
So that I can log a whole game set in under 3 minutes without typing.

**Requirements:** FR5; NFR1, NFR2, NFR14, NFR18; UX-DR5, UX-DR7, UX-DR20, UX-DR21; AD-8, AD-21

**Acceptance Criteria:**

**Given** the Logging screen (UX-DR7)
**When** it opens for a session
**Then** it shows a tab per participant with their set count, pass chips (Good / OK / Poor, sticky per player) and a tally grid of the team's non-archived set types × ratings 0–3, with coloured numeral headers and 56px cells

**Given** a selected player, pass and grid cell
**When** the setter taps the cell
**Then** the web app sends one `POST /api/teams/:teamId/logging/entries` with a client-generated UUIDv7, the player, set type, pass and rating
**And** the cell count increases, the cell becomes selected (Story 2.4), a toast (UX-DR5) "Mia · High outside · 3 · +1" appears with Undo for 5 seconds, and the phone gives a haptic tick where supported

**Given** the same request is retried after a network failure
**Then** the API treats the id as an idempotency key and stores the set once

**Given** one user sends logging writes far faster than a person can tap
**Then** a per-user write limit returns `429` with "Slow down a moment — try again." so one member can't use up the shared daily D1 write allowance [ASSUMPTION: Cloudflare's rate limiting binding is available on the Free plan; otherwise a per-isolate best-effort limit]

**Given** a tap fails to save
**Then** "Couldn't save — check your connection." is shown and nothing is queued for later (UX-DR20 wording applies to every message in these stories)

**Given** the setter taps Undo within 5 seconds
**Then** the entry is deleted by its id and the count goes back down

**Given** the `set_entries` table owned by logging
**Then** each row stores `team_id`, session, setter member, hitter member, set type, pass quality and rating, team-scoped with composite foreign keys
**And** logging implements the `ParticipantDataCheck` port so a participant with entries can't be removed (Story 2.2)
**And** only the session's setter can write its entries

**Given** accessibility needs (UX-DR21)
**Then** each cell's screen-reader label reads like "Mia, high outside, rating 3, 5 sets, add one", ratings always show the numeral, and at the largest text size the grid scrolls vertically rather than shrinking cells

**Given** a setter logging one game set of about 30 sets after a game
**Then** it takes under 3 minutes on a phone [manual check: timed during the field trial]

### Story 2.4: Adjust counts with the selected-cell bar

As a setter,
I want big − and + buttons for the cell I just tapped,
So that I can take away or add sets while logging, without switching modes.

**Requirements:** FR5; UX-DR7; AD-21

**Acceptance Criteria:**

**Given** the setter taps a grid cell (Story 2.3)
**Then** that cell is highlighted as selected
**And** a bar at the bottom of the Logging screen shows the selected cell ("Mia · High outside · Good · 3"), its count, and a "−" and a "+" button, each at least 56px (UX-DR7)

**Given** a selected cell
**When** the setter taps "+" in the bar
**Then** one set is added exactly as a cell tap adds it (one `POST`, client-generated UUIDv7, stored once even if retried)

**Given** a selected cell with a count above 0
**When** the setter taps "−" in the bar
**Then** the newest matching set is removed (`DELETE .../entries/latest` with player, set type, pass and rating) and the count goes down
**And** "−" is disabled when the count is 0

**Given** the setter taps a different cell or changes player tab or pass
**Then** the new cell is selected and the bar follows it; no mode needs turning on or off

**Given** accessibility needs
**Then** the bar's buttons have screen-reader labels like "Mia, high outside, good pass, rating 3, 5 sets, remove one" or "… add one", and the bar never covers the last grid row (the grid scrolls above it)

### Story 2.5: Session cards with every player's logs

As a setter,
I want each session card to show how every player's sets went,
So that I can see the session at a glance and open any player's details.

**Requirements:** FR4, FR5; UX-DR6; AD-17

**Acceptance Criteria:**

**Given** the Sessions tab
**When** it loads
**Then** session cards are listed newest first, each with date, Game or Practice, total sets, and one row per participant showing name, set count, average rating and a stacked rating-mix bar (UX-DR6)

**Given** the aggregation behind the card
**Then** it is implemented in the `progress` slice's query adapter, reading only columns that logging, sessions and teams declare public (AD-17), with the visibility rules applied inside the query

**Given** the setter taps Done on the Logging screen
**Then** the Sessions tab opens with that session's card on top

**Given** the setter taps a card's header or a player row
**Then** the saved session opens read-only (Story 2.6)

### Story 2.6: Review a saved session, fix counts, or delete it

As a setter,
I want saved sessions locked until I choose to fix them, and then to fix them the same way I log,
So that my diary can't be changed by an accidental tap, but is easy to correct when I mean to.

**Requirements:** FR4, FR5; UX-DR9; AD-18, AD-20

**Acceptance Criteria:**

**Given** a saved session (the setter tapped Done on the Logging screen)
**When** the setter opens it from its card header or a player row
**Then** the player tabs, pass chips and grid show the logged counts read-only (UX-DR9), no selected-cell bar is shown, and tapping a cell does nothing
**And** the grid also shows any archived set types that have sets in this session, so old sets stay visible and fixable; new sessions never show archived types

**Given** a saved session open read-only
**When** the setter taps Fix
**Then** the screen behaves exactly like initial logging: a cell tap adds one and selects the cell, and the selected-cell bar offers "−" and "+" (Stories 2.3 and 2.4)
**And** the header shows that the session is being fixed

**Given** a set was logged with the wrong pass, set type or rating
**Then** the setter corrects it with "−" on one cell and a tap or "+" on another; no separate edit form exists

**Given** Fix on a saved session
**When** the setter taps Done or leaves the screen
**Then** the session locks again and the session card updates

**Given** a setter deletes a whole session after confirming
**Then** the session, its participants and its set entries are deleted in one unit of work (AD-18), using each owning slice's `prepare*` functions, never by cascade

**Given** a member who isn't the session's setter
**Then** they can't fix or delete its sets or the session, and the API refuses

## Epic 3: See my progress as a setter

A setter sees their weekly consistency trend (filterable by set type) and the hitter × set-type grid with before → now since a chosen date.

### Story 3.1: Weekly consistency trend

As a setter,
I want to see my average rating and % hittable sets week by week,
So that I can tell whether my sets, especially high balls to the outside, are getting more consistent.

**Requirements:** FR7; NFR15; UX-DR12; AD-15, AD-17

**Acceptance Criteria:**

**Given** a setter on the Progress tab
**When** the trend loads
**Then** it shows one column per ISO week (Monday start, team time zone) with the average rating as the column height and numeral, coloured by the nearest rating colour, and % hittable (ratings 2–3) as a line in ink (UX-DR12)
**And** it covers only the setter's own sessions

**Given** the set-type filter chips (All by default, then each set type including archived ones that have data)
**When** the setter picks High outside
**Then** the trend recalculates for that set type only

**Given** fewer than 2 weeks of data for the current filter
**Then** the chart shows what exists and the message "Not enough data yet — log 2 more weeks to see a trend."

**Given** the trend query
**Then** it lives only in the `progress` slice's query adapter (AD-17), groups by the stored `iso_week`, reads only declared public columns, and applies `diaryAccess` inside the query
**And** core unit tests check averages and % hittable against hand-calculated fixtures, including weeks with no sets

**Given** a preview environment seeded with a year of test data (about 10,000 sets); production is never seeded
**When** the trend endpoint runs there
**Then** its CPU time stays under the 10 ms Free-plan limit [manual check: Workers Logs]

### Story 3.2: Hitter × set-type grid with before → now

As a setter,
I want to see my average rating for every hitter and set type, and how it changed since a date I choose,
So that I know which combinations improved and which to work on.

**Requirements:** FR8; UX-DR13; AD-5, AD-17

**Acceptance Criteria:**

**Given** a setter on the Progress tab below the trend
**When** the grid loads
**Then** it shows hitters as rows and set types as columns, each cell filled with the nearest rating colour and showing the current average numeral (UX-DR13)
**And** combinations with no sets show "–"

**Given** the "since" date picker
**When** the setter chooses a date D
**Then** each cell shows "before → now" in small text, where before uses sessions with `session_date < D` and now uses `session_date ≥ D`
**And** a cell with no sets before D shows "new"

**Given** hitters who were removed or anonymised
**Then** their rows still appear for history, labelled via `teams.getMembers` (for example "Former player 2")

**Given** the grid query
**Then** it lives only in the `progress` slice (AD-17) and applies the shared visibility rules inside the query (AD-5), so a hitter-row restriction can be added later without changing the query's shape
**And** core unit tests check the before/after boundary on the exact date D

**Given** the same seeded preview environment
**When** the grid endpoint runs there
**Then** its CPU time stays under the 10 ms Free-plan limit [manual check: Workers Logs]

### Story 3.3: Run the field trial and review

As the app owner,
I want to use Epics 1–3 with my team for about two weeks and judge the results,
So that logging and the progress views are proven, or adjusted, before teammates are brought in.

**Requirements:** FR5, FR7 (field validation); NFR12

**Acceptance Criteria:**

**Given** Epics 1–3 are deployed
**When** the owner logs every game and practice for about two weeks
**Then** at least 4 out of 5 sessions are logged on the same day [manual check: session dates vs logged dates]

**Given** the logged game sets
**Then** the typical (median) logging time per game set is under 3 minutes [manual check: timed by the owner]

**Given** two weeks of data
**When** the owner opens Progress
**Then** they can answer "Are my high sets to the outside becoming more consistent?" from the app alone [manual check: owner review]

**Given** the trial ends
**Then** agreed changes (for example to the tally grid, selected-cell bar or views) are written down as decisions, or as an RFC where they change the PRD, before Epic 4 starts
**And** a real, anonymised stats summary is saved for the AI model bake-off (Story 6.1)

## Epic 4: Bring teammates in

Managers invite teammates by link (join and recovery), teammates join or add the team to an existing account and switch between teams, managers set setter/hitter roles and other managers, and grant team-wide view with a Team stats screen.

### Story 4.1: Invite a teammate with a link

As a team manager,
I want a share link for each teammate on the roster,
So that they can join the team and link to the player already logged under their name.

**Requirements:** FR15, FR17; UX-DR16; AD-12

**Acceptance Criteria:**

**Given** a manager adds a player (Story 1.7) or opens an existing unlinked member
**When** they tap Invite
**Then** a random token is created and stored only as a hash in `invites`, bound to that member, with `kind: join` and an expiry from configuration (default 7 days)
**And** the sheet shows the link with Share link and Done (UX-DR16), using the phone's share sheet where available

**Given** a member who already has an invite
**When** the manager issues a new one
**Then** earlier tokens for that member stop working

**Given** any log line, error message or analytics event
**Then** invite tokens never appear in it (tested)

**Given** a non-manager
**Then** they can't create invites, and the API refuses

### Story 4.2: Join a team from an invite link

As a teammate,
I want to open the invite link, sign in and land in my team,
So that I see my own stats without anyone retyping my name.

**Requirements:** FR15, FR16; UX-DR17, UX-DR20; AD-12, AD-13

**Acceptance Criteria:**

**Given** a valid invite link
**When** it is opened without signing in
**Then** `GET /api/invites/:token/preview` (protected by Cloudflare Turnstile and the rate-limiting rule; Turnstile is also added to team creation in this story) shows "You're joining <team>" with the member's name pre-filled, and sets an httpOnly `invite` cookie
**And** the preview reveals only the team name and that member's name, nothing else about the team

**Given** the person signs in with Google or a passkey (new or existing account) with all consents recorded
**When** `POST /api/me/invites/redeem` runs
**Then** in one conditional write (`used_at IS NULL AND expires_at > now`) the account is linked to that member and the invite is marked used
**And** the app opens in that team with the tabs for the member's roles

**Given** missing consents, an account that already has an active member in that team, or a member already linked to another account with a `join` token
**Then** redeem refuses with `CONSENT_REQUIRED`, `ALREADY_IN_TEAM` or `MEMBER_ALREADY_LINKED` respectively, with plain messages

**Given** an expired or used link
**Then** "This invite has expired. Ask your team manager for a new one." is shown

**Given** two people redeem the same link at once
**Then** only one succeeds (tested)

### Story 4.3: Switch between my teams, or leave one

As a player in more than one team,
I want to switch teams from the header and leave a team if I need to,
So that each team's data stays separate and my tabs match my role there.

**Requirements:** FR16; UX-DR19; AD-4, AD-6

**Acceptance Criteria:**

**Given** a user with several memberships
**When** they tap the team name in the header
**Then** the Team switcher sheet (UX-DR19) lists their teams with their role in each, plus Join another team and Create a team
**And** choosing a team reloads the tabs for their role in that team (setter tabs, hitter tabs, or both)

**Given** `GET /api/me/memberships` (UserScope)
**Then** it returns only the user's active memberships and is the only user-scoped source of the team list

**Given** Settings or the switcher
**When** the user taps Join another team and pastes an invite link
**Then** the same redeem flow as Story 4.2 runs

**Given** a member leaves a team
**Then** their member is set to removed, `user_id` moves to `former_user_id`, they lose access to that team, and their stats stay with the team (AD-6)
**And** the last manager can't leave until another member is a manager (`409 LAST_MANAGER`)

**Given** two teams
**Then** tests confirm a user switched to team A never receives team B data from any endpoint

### Story 4.4: Set roles and managers

As a team manager,
I want to set who is a setter, a hitter and a manager,
So that each player gets the right tabs and the team always has someone to run it.

**Requirements:** FR17; UX-DR15; AD-5, AD-12

**Acceptance Criteria:**

**Given** a manager taps a roster row
**Then** the member sheet (UX-DR15) shows Setter, Hitter and Team manager toggles, Send recovery invite, and Remove from team
**And** the roster shows a Manager tag next to managers' roles

**Given** a manager changes a member's toggles
**Then** the flags `isSetter`, `isHitter` and `isManager` update and the member's tabs follow on their next load

**Given** a change that would leave the team with no manager (demoting or removing the last one)
**Then** it is refused by a conditional update with `409 LAST_MANAGER` and the message "The team needs at least one manager."
**And** two managers demoting each other at the same moment can't both succeed (tested)

**Given** a linked member who lost access to their account
**When** a manager taps Send recovery invite
**Then** an invite with `kind: recovery` is created, and redeeming it replaces the member's account link (Story 4.2 rules)

**Given** a non-manager
**Then** they can't change roles, and the API refuses

### Story 4.5: Team-wide view and Team stats

As a team manager,
I want to let chosen teammates see all of the team's stats,
So that a captain or helper can follow every setter's progress.

**Requirements:** FR11; UX-DR15; AD-5

**Acceptance Criteria:**

**Given** a manager on the Team tab
**When** they switch on Team view for a member
**Then** that member's `hasTeamView` flag is set

**Given** a member with team-wide view
**When** they open Team stats from the Team tab
**Then** they choose any setter in the team and see that setter's full trend and grid, with every hitter's row (diaryAccess `full`)

**Given** a member without team-wide view
**Then** the Team stats entry is hidden, not shown disabled, and the API refuses team-wide queries

**Given** anyone outside the team
**Then** every Team stats request fails with `403 NOT_A_MEMBER`

## Epic 5: Hitters rate and see their own progress

Hitters get "To rate" cards across their teams (with push where supported), give one rating per session, and see their own dashboard and each setter's trend with only their own grid row; setters see each hitter's rating.

### Story 5.1: Rate a session from a "To rate" card

As a hitter,
I want a card for each session I played in, where I can rate how comfortable the sets were,
So that my setter gets my honest feedback right after the game.

**Requirements:** FR6; NFR4, NFR11; UX-DR10, UX-DR11; AD-9

**Acceptance Criteria:**

**Given** a member who is an active participant in a session and is not its setter
**Then** that session appears in `GET /api/me/ratings/pending` (UserScope, across all the user's teams), computed only by the ratings slice
**And** Home shows a "To rate" card for it (UX-DR11), labelled with the team, session and setter, from every team the user belongs to

**Given** the hitter taps a card
**Then** the app switches to that team if needed and opens the Rate session sheet (UX-DR10) with "How were Thang's sets to hit today?" and one row per rating 3 to 0, each with frequency chips Never / Rarely / Sometimes / Mostly, all starting at Never

**Given** every row is still Never
**Then** Save rating is disabled

**Given** the hitter sets, for example, 2 · Adjust to Mostly, 3 · Full swing to Sometimes and 1 · Free ball to Rarely, and taps Save rating
**Then** one row is stored in `hitter_session_ratings` (unique per session and hitter, team-scoped) holding a frequency for each rating 0–3
**And** the card disappears and "Thanks — rating saved." is shown

**Given** a single-number summary of a rating mix is needed by any view
**Then** it is derived in the progress slice (weights Never 0, Rarely 1, Sometimes 2, Mostly 3) and is never stored or asked for

**Given** a member who isn't a participant, or is the session's setter
**Then** they get no card, and the API refuses a rating from them

**Given** the ratings slice
**Then** it exposes `prepareDeleteRatingsForSession(scope, sessionId)`, and deleting a session (Story 2.6) now also deletes its ratings in the same unit of work (AD-18)

### Story 5.2: Rating lock and the setter's view of ratings

As a setter,
I want to see each hitter's rating of my session, and ratings to close once we've played again,
So that feedback stays tied to the session it was about.

**Requirements:** FR6; NFR11; AD-9

**Acceptance Criteria:**

**Given** a hitter's rating for session S with setter X
**Then** the hitter can change it until sessions' `nextSessionWith(setterId, hitterId, after: S)` returns a session, ordered by (session date, created time, id); after that it is locked
**And** the lock is derived on read, never stored, and the card disappears from "To rate" when locked

**Given** two sessions with the same setter and hitter on the same date
**Then** tests confirm the ordering locks the earlier one when the later one exists

**Given** a setter views a saved session
**Then** each participant's row shows that hitter's rating mix as a small stacked bar in the rating colours, next to the setter's own logged mix for that hitter, or "not rated yet"

**Given** a member who is neither the session's setter nor a team-wide view holder
**Then** they can't see other hitters' ratings (visibility applied in the query)

### Story 5.3: Notify hitters to rate

As a hitter,
I want a notification after a session I played in,
So that I don't forget to rate while the game is fresh.

**Requirements:** FR6; AD-16

**Acceptance Criteria:**

**Given** a signed-in user
**When** they turn on notifications (prompted once after their first "To rate" card; on iPhone only when the app is installed to the Home Screen)
**Then** a Web Push subscription is stored in `push_subscriptions` (owned by notifications), using VAPID keys held as Worker secrets

**Given** the setter saves Who played? with a participant who has a linked account
**Then** sessions publishes `ParticipantAdded` through the `DomainEvents` port after commit
**And** notifications sends "Rate today's sets from Thang." once per (session, participant) in `ctx.waitUntil`, recording it in `notification_log`

**Given** a participant without a linked account, a failed push or no subscription
**Then** nothing breaks, and the "To rate" card still appears

**Given** the notifications slice
**Then** it exposes `prepareDeletePushSubscriptionsForUser(userId)` for the account-deletion unit of work (AD-18)

### Story 5.4: Hitter Home with my received-set progress

As a hitter,
I want my Home tab to show the quality of the sets I've received over time,
So that I can see whether my setters' sets to me are improving.

**Requirements:** FR9; NFR3; UX-DR3, UX-DR12; AD-17

**Acceptance Criteria:**

**Given** a member with `isHitter` on the Home tab
**Then** below the "To rate" cards, a weekly chart shows the average rating of sets they received from all of the team's setters, in the same trend style (UX-DR12)
**And** the thin-data message shows with fewer than 2 weeks of data

**Given** the query
**Then** it lives in the progress slice (AD-17) and returns only rows where the hitter is the viewer (row identity, AD-5)

**Given** a member who is both setter and hitter
**Then** they see Home in addition to the setter tabs (UX-DR3)

### Story 5.5: Setters tab with each setter's trend and my own row

As a hitter,
I want to follow each of my team's setters,
So that I can see their consistency and how their sets to me have changed.

**Requirements:** FR9; NFR3; UX-DR13; AD-5

**Acceptance Criteria:**

**Given** the Setters tab
**When** the hitter picks one of the team's setters
**Then** it shows that setter's consistency trend (diaryAccess `trend_only`) and only the hitter's own row of that setter's grid (`own_rows`), with the since-date picker and before → now

**Given** any request for another hitter's row by a member without team-wide view
**Then** the API returns no such rows, and tests built from `permissions-matrix.md` confirm it

**Given** "Other hitters' rows are private to Thang."
**Then** this note is shown under the hitter's row

## Epic 6: Ask AI how to improve

After an AI model bake-off, setters open Ask AI for a discussion grounded in their own stats, with daily limits, private saved discussions and graceful "try again tomorrow" states.

### Story 6.1: Choose the AI model with a bake-off

As the app owner,
I want to compare the free Workers AI models on a real stats summary,
So that setters get the most useful coaching the free allowance can give.

**Requirements:** FR14; NFR7

**Acceptance Criteria:**

**Given** a real, anonymised stats summary from the field trial (labels instead of names) and three fixed questions (weakest combination, trend direction, what to practise next)
**When** each candidate model (Gemma 4 26B, GLM 4.7-Flash, gpt-oss-20b, gpt-oss-120b, Llama 3.3 70B fp8-fast; current, non-deprecated IDs checked on the day) answers
**Then** the answers, neurons used and response time are recorded side by side in `docs/ai-model-bakeoff.md`

**Given** the results
**When** the owner picks a primary and a cheaper fallback model
**Then** `AI_MODEL_PRIMARY` and `AI_MODEL_FALLBACK` are set in `wrangler.jsonc`, and the estimated discussions per day on the free allowance are recorded [manual check: owner review]

### Story 6.2: Start an AI discussion about my stats

As a setter,
I want to tap Ask AI and get observations about my own sets, then ask follow-up questions,
So that I leave with something concrete to practise.

**Requirements:** FR14; NFR5, NFR6; UX-DR14; AD-10, AD-17

**Acceptance Criteria:**

**Given** a setter on the Progress tab
**When** they tap the Ask AI button (UX-DR14)
**Then** a new discussion starts: the `progress` slice builds the input from the setter's own aggregated stats, with teammates' names replaced by labels and members without recorded AI consent left out of any per-hitter row or label (AD-10, AD-17)
**And** the setter must hold AI consent, otherwise the API returns `CONSENT_REQUIRED`
**And** session notes and any other free text are never part of the AI input (tested)

**Given** a setter with fewer than 2 weeks of data
**When** they tap Ask AI
**Then** "Not enough data yet — log 2 more weeks first." is shown, no model is called, and no daily discussion is used

**Given** the `AiGateway` port
**Then** only the ai slice calls it, through the Workers AI adapter routed via Cloudflare AI Gateway with request and response body logging off; tests use a stub, and CI never calls Workers AI

**Given** the model's reply
**Then** it opens with 2–3 observations tied to the setter's data (for example, lowest hitter × set-type cell, trend direction), shown in AI bubbles with rating numbers as rating-colour chips, and names restored for display via `teams.getMembers`

**Given** the setter sends follow-up messages
**Then** each reply uses the same data, and the discussion stops accepting messages after `AI_MAX_TURNS` with "Start a new discussion tomorrow."

**Given** a reply is still being generated
**Then** a typing indicator shows, and if the setter leaves, the reply is still saved and appears when they return

**Given** storage
**Then** `ai_conversations` store `team_id`, `owner_user_id` and member, and `ai_messages` store text with labels plus a per-discussion label → member map; no member name is stored outside `members`

**Given** this story runs before daily limits exist (Story 6.3)
**Then** usage stays free because the Workers Free plan refuses AI calls beyond the daily allocation instead of charging

### Story 6.3: Daily limits and graceful fallback

As a setter,
I want clear messages when today's AI is used up,
So that the app stays free and I know when to come back.

**Requirements:** FR14; NFR7, NFR17; UX-DR20; AD-10, AD-13

**Acceptance Criteria:**

**Given** each new discussion
**Then** a per-user counter for the UTC day (across all teams) is incremented with a conditional update before the model call (limit from config, default 2) and refunded if the provider fails

**Given** the Ask AI screen
**Then** it shows "1 of 2 discussions today" (or the current count)

**Given** the setter has used today's discussions
**When** they tap Ask AI
**Then** "You've used today's 2 AI discussions. Back tomorrow." is shown, and past discussions stay readable

**Given** the app-wide usage row `ai_usage_daily` (estimated neurons for the UTC day)
**When** it nears the free allocation
**Then** the gateway switches to the fallback model
**And** when the allocation is used up, or Workers AI returns its limit error, "AI is resting for today. Try again tomorrow." is shown and nothing is billed

**Given** two discussions started at the same moment by one setter with one remaining
**Then** only one is allowed (tested)

### Story 6.4: Past discussions, kept private

As a setter,
I want to reopen my earlier AI discussions,
So that I can remember what I decided to work on.

**Requirements:** FR14; NFR5; AD-10

**Acceptance Criteria:**

**Given** the AI discussion screen
**When** the setter taps Past discussions
**Then** it lists their discussions for the current team, newest first, and each opens read-only with names restored for display

**Given** anyone other than the owner, including team managers and team-wide view holders
**Then** they can't list or open the discussion, and the API refuses

**Given** a setter leaves a team
**Then** their discussions for that team are deleted

**Given** the ai slice
**Then** it exposes `prepareDeleteConversationsForUser(userId)` for the account-deletion unit of work (AD-18)

## Epic 7: Own your data

Users export their data as CSV and delete their account; deletion anonymises them everywhere through one unit of work.

### Story 7.1: Export my data as CSV

As a player,
I want to download my own data,
So that I can keep it or look at it in a spreadsheet on my phone.

**Requirements:** FR13; UX-DR19; AD-22

**Acceptance Criteria:**

**Given** Settings
**When** the user taps Export my data
**Then** they see one download per team they belong to, each producing a CSV built under `UserScope` through progress, logging and ratings `index.ts` functions (AD-22)

**Given** a team export
**Then** it contains only: (a) set entries where the user's member is the setter (date, session kind, hitter label or name as the user may see it, set type, pass, rating), (b) the rating mixes the user gave as a hitter, and (c) sets the user received, aggregated exactly as their own grid row
**And** it never contains another hitter's data the user couldn't already see (tested against `permissions-matrix.md`)

**Given** the file
**Then** it is UTF-8 with a byte-order mark, comma-separated with a header row, and opens correctly in Google Sheets, Apple Numbers and Excel on a phone [manual check: opened on iPhone and Android]

**Given** a large export
**Then** it is produced within the Free-plan limits (set-based queries, at most 50 per request) [manual check: Workers Logs]

**Given** a team where the user has no data
**Then** its CSV contains only the header row

### Story 7.2: Delete my account

As a player,
I want to delete my account,
So that my personal details are gone while my team keeps its history.

**Requirements:** FR12; NFR9; UX-DR19, UX-DR20; AD-7, AD-18

**Acceptance Criteria:**

**Given** Settings → Delete account
**Then** a confirm sheet says: "Your stats stay with your teams, anonymised. Your AI discussions are deleted, and your name is removed from other people's saved discussions."

**Given** the user is the last manager of any team
**Then** deletion is refused, naming those teams, until another member is made manager (`409 LAST_MANAGER`)

**Given** the user's last sign-in was more than 5 minutes ago
**Then** they must sign in again (Google or passkey) before deletion runs

**Given** the user confirms
**Then** one unit of work (AD-18) runs the slices' prepared statements: teams renames every member the user is or was linked to as "Former player N" and clears both links; account deletes consents; notifications deletes push subscriptions; ai deletes the user's discussions
**And** the Better Auth user, sessions and passkeys are deleted last; until then the user carries `deletion_pending_at` and the operation is retried until complete
**And** every statement is set-based, within 50 queries per request

**Given** another setter's saved AI discussion that mentioned the deleted player
**When** it is opened
**Then** the label resolves to "Former player N", because messages store labels, not names

**Given** a deleted account
**Then** the user is signed out, can't sign in again with the same Google account or passkey to reach the old data, and their sets and ratings still count in teammates' trends and grids under "Former player N"

**Given** an interrupted deletion
**When** it is retried
**Then** it completes without duplicating renames or failing on already-deleted rows (tested)
