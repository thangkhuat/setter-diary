# Review: Technology Currency — Setter Diary Architecture

- **Target:** `../architecture.md` (+ `../adr/`, `../.memlog.md`)
- **Lens:** every committed decision was checked against the web, the npm registry or the current starter, not taken from training data
- **Reviewer:** independent, 2026-10-05
- **Method:** live npm registry queries (`registry.npmjs.org/<pkg>/latest`, peer and engine fields, tarball inspection), Cloudflare docs (raw `.md` and HTML), the GitHub `cloudflare/templates` repo, the Node release schedule and the Public Suffix List.

## Verdict

**The version pins are current, and most of them were properly verified on 2026-10-05.** All 17 version pins match today's npm `latest` (or the 4.x line where that was deliberate). The problems are platform facts the document asserts without checking, plus starter and tooling interactions that were never reality-checked:

- One factual error: D1 Time Travel lasts 7 days on Free, not 30.
- One routing defect: the Google OAuth callback would be served `index.html`.
- One concrete TypeScript 7 blocker: dependency-cruiser.
- An AI model plan built on a legacy model family, with an over-stated daily capacity.

None of these change the paradigm or the ADs. Each one should be fixed before stories are written.

| # | Severity | Item |
| --- | --- | --- |
| 1 | High | D1 Time Travel is 7 days on Free, not 30 |
| 2 | High | SPA navigation handling swallows `/api/auth/*` OAuth callback (assets layer + service worker) |
| 3 | High | TypeScript 7.0 breaks dependency-cruiser (and the starter's typescript-eslint) |
| 4 | Medium | AI models: Llama 3.x is a legacy family; 8B ID ambiguous; capacity overstated; cheaper/better free-tier models exist |
| 5 | Medium | Node.js "22 LTS" vs React Router 8 engine `>=22.22.0` (local is 22.14.0); Node 22 is in maintenance |
| 6 | Medium | Passkeys on `*.workers.dev`: rpID is the full hostname; buying a domain later orphans every passkey |
| 7 | Medium | Better Auth CPU fit under 10 ms not reality-checked (only password hashing was) |
| 8 | Medium | Starter defaults diverge from the doc (layout, `wrangler.json`, Vite 7, old pins, compat date) |
| 9 | Medium | D1 Free: 50 queries per Worker invocation not captured in AD-13 / ADR-009 |
| 10 | Low | `@better-auth/passkey` is a separate package, missing from the Stack table; passkey-first needs `resolveUser` + synthetic email |
| 11 | Low | AI Gateway logs: new-customer log regime since 2026-09-24; prompts logged by default |
| 12 | Low | `@cloudflare/vitest-pool-workers` 0.22 pulls its own wrangler 4.124 and an alpha miniflare; AI binding is remote-only in tests |
| 13 | Low | "Library mode" is not React Router 8 terminology; name the mode |
| 14 | Low | Drizzle 1.0 is at rc.5; plan the 0.45 to 1.0 move |
| 15 | Low | Google OAuth on workers.dev: consent screen must be "In production" |

---

## Findings

### 1. HIGH: D1 Time Travel is 7 days on Workers Free, not 30

- **Where:** Deployment table ("production D1 (Time Travel: 30-day restore)"), ADR-009 Context ("30-day Time Travel restore"), memlog entry "Time Travel ... last 30 days ... all plans".
- **Verified:** The Cloudflare D1 limits page says: "Time Travel duration (point-in-time recovery) | 30 days (Workers Paid) / 7 days (Free)". The Time Travel reference says: "up to 30 days in the past (Workers Paid plan) or 7 days (Workers Free plan)".
  - https://developers.cloudflare.com/d1/platform/limits/
  - https://developers.cloudflare.com/d1/reference/time-travel/
- **Impact:** The backup story is the only recovery path for team data. A corruption noticed after a week cannot be undone.
- **Fix:**
  - Change it to 7 days in architecture.md and ADR-009.
  - Either accept 7 days explicitly, or add a scheduled `wrangler d1 export` from GitHub Actions to an artifact or private storage as a longer backup. CI time is free; check that the export stays inside the D1 rows-read budget.

### 2. HIGH: SPA navigation handling will swallow the Google OAuth callback

- **Where:** AD-3 ("served as Cloudflare static assets, with SPA fallback, so screen loads never invoke the Worker"); Convention "Auth on the API" (`/api/auth/*`); AD-14 (service worker caches the shell).
- **Verified:** With `not_found_handling: "single-page-application"` and a compatibility date of 2025-04-01 or later, "navigation requests will not invoke the Worker script ... if you navigate to `/api/date` in your browser, you will be served an HTML file". The fix Cloudflare documents is `assets.run_worker_first: ["/api/*"]`.
  - https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/
  - The starter's `wrangler.json` sets SPA handling and **no** `run_worker_first` (https://github.com/cloudflare/templates/blob/main/vite-react-template/wrangler.json).
- **Why it matters:** Google redirects the browser to `/api/auth/callback/google`. That is a top-level navigation (`Sec-Fetch-Mode: navigate`), so sign-in breaks: the SPA shell comes back and the token exchange never runs. Second layer: vite-plugin-pwa's Workbox `navigateFallback` also answers navigations from the cached `index.html` unless `/api/` is denylisted.
- **Fix:** Add to AD-3 / the config conventions:
  - `"assets": { "not_found_handling": "single-page-application", "run_worker_first": ["/api/*"] }`
  - In vite-plugin-pwa: `workbox.navigateFallbackDenylist: [/^\/api\//]`
  - The trade-off: `/api/*` navigations count as Worker requests. This is negligible.

### 3. HIGH: TypeScript 7.0 breaks dependency-cruiser, the CI gate for AD-1

- **Where:** Stack "TypeScript 7.0 (fall back to latest 6.x if a tool lacks support)"; AD-1 ("dependency-cruiser runs in CI and fails the build").
- **Verified:**
  - `typescript@7.0.2` exports only `./lib/version.cjs` at `.` plus `./unstable/*`. The classic compiler API (`readConfigFile`, `createSourceFile`, `sys`) is gone (npm registry, `typescript/7.0.2` `exports`).
  - `dependency-cruiser@18.5.0` declares `supportedTranspilers.typescript: ">=2.0.0 <7.0.0"` and silently skips TS parsing and tsconfig resolution when no supported `typescript` is found (tarball `src/meta.cjs`, `src/config-utl/extract-ts-config.mjs`). With TS 7 installed as `typescript`, `.ts` files are not cruised properly, so the boundary check can pass while checking nothing.
  - The starter's `typescript-eslint` (latest 8.71.0) peers `typescript: ">=4.8.4 <6.1.0"`.
  - Vite 8, Vitest, drizzle-kit (tsx/esbuild) and wrangler do not depend on the `typescript` API, so they are unaffected.
- **Fix:** Decide now rather than "fall back if":
  - **(a)** Pin `typescript@6.0.3` as the `typescript` package, and use TS 7 for type-checking through `@typescript/native-preview` (`tsgo`) or a separately aliased install.
  - **(b)** Keep TS 6.0.x outright until dependency-cruiser supports 7.
  - Add a CI self-test to AD-1: a fixture that deliberately violates a boundary and must fail. That catches a silently empty cruise.

### 4. MEDIUM: AI model choice uses a legacy family; capacity overstated; better free-tier options exist

- **Where:** AD-10, ADR-004 ("Llama 3.3 70B class default, Llama 3.1 8B class fallback", "About 5–10 large-model discussions per day").
- **Verified:**
  - **IDs that exist today:** `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (model page live; $0.293/$2.253 per M tokens; 26,668 / 204,805 neurons per M in/out).
  - **8B is ambiguous:**
    - The pricing page lists `@cf/meta/llama-3.1-8b-instruct-fp8-fast` (the memlog's $0.045/$0.384 matches it), but its model page returns 404.
    - The May 2026 deprecation notice names `@cf/meta/llama-3.1-8b-instruct-fast` as remaining active.
    - `@cf/meta/llama-3.1-8b-instruct-fp8` has a live model page.
    - Plain `llama-3.1-8b-instruct` and `-awq` were **deprecated on 2026-05-30**.
  - **Cloudflare's recommended replacements** in that notice: GLM 4.7-Flash, Gemma 4 26B, Kimi K2.6.
  - Sources:
    - https://developers.cloudflare.com/workers-ai/platform/pricing/
    - https://developers.cloudflare.com/changelog/post/2026-05-08-planned-model-deprecations/
    - https://developers.cloudflare.com/workers-ai/models/
  - **Capacity math** using the memlog's own assumption (40k in + 5k out per discussion) against 10,000 neurons per day:

    | Model | Neurons per discussion | Discussions per day |
    | --- | --- | --- |
    | llama-3.3-70b-fp8-fast | ~2,090 | **~4.8** (not 5–10) |
    | gpt-oss-120b | ~1,610 | ~6 |
    | gpt-oss-20b | ~860 | ~11 |
    | gemma-4-26b-a4b-it | ~500 | ~20 |
    | glm-4.7-flash (5,500 / 36,400 neurons per M) | ~400 | ~24 |
    | qwen3-30b-a3b-fp8 | ~340 | ~30 |

- **Fix:**
  - Pin exact model IDs in `wrangler.jsonc` vars as already planned. Record them in the memlog with the date checked, and confirm them with `wrangler ai models` or the dashboard.
  - Before committing to Llama 3.3 70B, run a short quality bake-off on a real stats summary: Llama 3.3 70B against Gemma 4 26B, GLM 4.7-Flash and gpt-oss-120b/20b. Llama 3.3 is a Dec-2024 model and the costliest per output token on this list.
  - Correct the "5–10" estimate.
  - Note that `-fast` variants are the ones Cloudflare commits to keeping, so prefer them or a current-generation model for the fallback.

### 5. MEDIUM: Node.js version conflicts with React Router 8

- **Where:** Stack "Node.js (local tooling) 22 LTS"; memlog "local node 22.14.0".
- **Verified:**
  - `react-router@8.4.0` `engines.node: ">=22.22.0"`.
  - `vite@8.3.2` needs `^20.19.0 || >=22.12.0`; `wrangler@4.147.0` needs `>=22.0.0`; `dependency-cruiser@18.5.0` needs `^22||^24||>=26`.
  - Node schedule: v22 entered maintenance on 2025-10-21 (EOL 2027-04-30); v24 is Active LTS until 2026-10-20 (EOL 2028-04-30); v26 becomes LTS on 2026-10-28. Latest v22 is 22.23.3; latest v24 is 24.21.0.
  - Sources: npm registry; https://github.com/nodejs/Release/blob/main/schedule.json
- **Fix:** Pin Node 24 LTS (or at least `>=22.22`). Add an `.nvmrc` or `engines` entry, and set `node-version` in the GitHub Actions workflow. Upgrade the local 22.14.0.

### 6. MEDIUM: Passkeys bound to a `*.workers.dev` hostname

- **Where:** AD-11, ADR-005, the Production environment row ("`*.workers.dev` until a domain is bought"), Deferred (custom domain).
- **Verified:**
  - `workers.dev` is on the Public Suffix List (line ~12703, https://publicsuffix.org/list/public_suffix_list.dat). The WebAuthn rpID therefore has to be the full `setter-diary.<account>.workers.dev` hostname.
  - The Better Auth passkey plugin requires an explicit `rpID` and `origin` (https://www.better-auth.com/docs/plugins/passkey).
- **Impact:** When the deferred custom domain is bought, every passkey registered on workers.dev stops working. Passkey-only players (the ADR-005 case of no Google account) lose access until a manager re-invites them.
- **Fix:** Record this as a consequence in ADR-005 and in the "custom domain" Deferred item. Either buy the domain before inviting passkey-only players, or plan a migration where each user signs in on the old origin and registers a new passkey. WebAuthn Related Origin Requests could also help, but its browser support needs checking.

### 7. MEDIUM: Better Auth inside the 10 ms CPU budget was never measured

- **Where:** AD-11 / AD-13. The memlog verified only that *password hashing* does not fit.
- **Verified:** The Cloudflare Workers limits page says: "Heavier workloads that handle authentication, server-side rendering, or parse large payloads typically use 10-20 ms." The Free limit is 10 ms CPU and 1 s startup (https://developers.cloudflare.com/workers/platform/limits/).
  - Better Auth on Workers must be built per request, because D1 bindings only exist inside `fetch`. That adds init CPU to every authenticated `/api/*` call.
  - OAuth callbacks (JOSE verify) and WebAuthn verification (CBOR + WebCrypto) are not free either.
  - No source confirms Better Auth stays under 10 ms on Free.
- **Fix:**
  - Add a first-story spike: deploy the starter with Better Auth (Google + passkey) and the D1 session lookup, then read `cpuTime` from Workers Logs.
  - Mitigations if needed: cache the auth instance per isolate where possible, use Better Auth `cookieCache` for session reads, and keep only minimal routes on the auth instance.
  - Mark the 10 ms fit as [ASSUMPTION] until it is measured.

### 8. MEDIUM: Starter (`vite-react-template`) defaults diverge from the document

- **Verified** against https://github.com/cloudflare/templates/tree/main/vite-react-template (last commit 2026-09-22):
  - Config file is `wrangler.json`, not `wrangler.jsonc`.
  - `main: ./src/worker/index.ts`; SPA in `src/react-app/`; assets `directory: ./dist/client`, `not_found_handling: "single-page-application"`, no `run_worker_first`; `compatibility_date: "2025-10-08"`; `nodejs_compat`; observability on.
  - Pins: `vite ^7.0.0`, `@vitejs/plugin-react 5.1.1`, `react 19.2.1`, `hono 4.11.1`, `typescript 5.9.3`, `wrangler 4.136.1`, `@cloudflare/vite-plugin 1.52.1`, ESLint 9 + typescript-eslint 8.48.
  - Build script: `tsc -b && vite build`.
  - The README install command `npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template` is correct.
- **Gaps against the document:**
  - The architecture's source tree (`web/`, `worker/`, `src/core`, `src/adapters`, `src/contracts`) needs `main`, `tsconfig.*` includes and the Vite root to be rewritten.
  - Moving to Vite 8 requires `@vitejs/plugin-react` 6.x (6.1.1 peers `vite ^8.0.0`), which is not in the Stack table.
  - The compatibility date must be bumped.
  - The ESLint/typescript-eslint pair conflicts with TS 7 (finding 3).
- **Fix:** Add a "starter delta" list to the Structural Seed: rename to `wrangler.jsonc`, relocate dirs, add `run_worker_first`, bump compat date, upgrade to Vite 8 + plugin-react 6, decide on ESLint. Add `@vitejs/plugin-react` to the Stack table.

### 9. MEDIUM: D1 Free limit of 50 queries per Worker invocation not recorded

- **Verified:** "Queries per Worker invocation ... 1000 (Workers Paid) / 50 (Free)". Per-statement limits also apply inside `db.batch()` (https://developers.cloudflare.com/d1/platform/limits/). Workers Free also allows 50 subrequests per request.
- **Impact:** AD-7's account deletion is one transaction that anonymises members across every team, deletes push subscriptions and AI conversations, and so on. It, and dashboard aggregation, must stay within 50 statements.
- **Fix:** Add the 50-queries limit to AD-13 / ADR-009. Note in AD-7 that deletion statements must be set-based (`WHERE user_id = ?`), not one per row.

### 10. LOW: Passkey plugin package and passkey-first onboarding

- **Verified:**
  - The passkey plugin is the separate package `@better-auth/passkey` (1.7.7, peers `better-auth ^1.7.7`), imported from `@better-auth/passkey` and `@better-auth/passkey/client`.
  - Passkey-first sign-up needs `registration.requireSession: false` and a `resolveUser` (or `afterVerification`) hook.
  - Better Auth's user model expects `email`, so passkey-only users need a synthetic or nullable email strategy.
  - Sources: https://www.better-auth.com/docs/plugins/passkey; npm registry.
- **Fix:** Add `@better-auth/passkey 1.7` to the Stack table. Note in AD-11/AD-12 that the signed invite token is the `context` passed to `resolveUser`, and decide the email placeholder rule.

### 11. LOW: AI Gateway on Free: confirmed, but logging regime changed

- **Verified:**
  - AI Gateway is "available to use on all plans"; core features are free; the Workers AI binding accepts `gateway: { id, skipCache, cacheTtl }`.
  - Legacy Free limits: 10 gateways, 100,000 stored logs. Accounts creating their first gateway on or after 2026-09-24 follow Workers Logs limits and retention instead.
  - Sources:
    - https://developers.cloudflare.com/ai-gateway/usage/providers/workersai/
    - https://developers.cloudflare.com/ai-gateway/reference/pricing/
    - https://developers.cloudflare.com/ai-gateway/reference/limits/
- **Fix:**
  - Reference the new log regime in the "AI Gateway analytics" ops note.
  - Decide whether to turn off request/response body logging. Logs hold the prompts, which contain labelled team stats and the setter's free text, and AD-10 aims to minimise personal data.
  - Model fallback (70B to 8B) is implemented in the adapter, not by the gateway, when the binding is used. Make sure the AD wording does not imply otherwise.

### 12. LOW: Test pool details

- **Verified:**
  - `@cloudflare/vitest-pool-workers@0.22.0` peers `vitest ^4.1.0` (latest 4.x is 4.1.11; `vitest` latest is 5.0.3). The pin rationale is correct.
  - It depends on its own `wrangler 4.124.0` and `miniflare 5.20260815.0-alpha`.
- **Fix:** Expect two wrangler copies. Workers AI and AI Gateway are not emulated locally, so stub the `AiGateway` port in tests, which fits the hexagonal design, and keep integration calls out of CI so they do not burn neurons.

### 13. LOW: React Router "library mode" naming

- **Verified:** React Router 8.4.0 docs list three modes: Declarative (`<BrowserRouter>`), Data (`createBrowserRouter` + `RouterProvider`) and Framework. Both of the first two work as client-only Vite SPAs. v8 (released 2026-06-17) is ESM-only, removed `react-router-dom` and turned middleware on by default. Peers `react >=19.2.7`. Sources: https://reactrouter.com/start/modes; https://reactrouter.com/8.0.0/changelog
- **Fix:** Say "Data mode (`createBrowserRouter`), client-only" or "Declarative mode". Import from `react-router`, not `react-router-dom`.

### 14. LOW: Drizzle 1.0 is near

- **Verified:** `drizzle-orm` latest is 0.45.3 and `drizzle-kit` latest is 0.31.11, with `rc` 1.0.0-rc.4/rc.5 tags. Better Auth already peers `^0.45.2 || >=1.0.0-rc.1`.
- **Fix:** Keep 0.45. Add a Deferred note that 1.0 changes the migration folder layout, and migrate before the first production migrations pile up.

### 15. LOW: Google sign-in on workers.dev

- **Not web-verified in this review.** The Google Cloud consent screen must be published "In production"; "Testing" limits use to listed test users and sessions expire after 7 days. With basic scopes (openid, email, profile), verification should not be required, but the authorized-domain entry for a workers.dev subdomain should be tested early.
- **Fix:** Add a setup checklist item.

---

## Confirmed correct (live checks, 2026-10-05)

| Item | Doc | Verified | Source |
| --- | --- | --- | --- |
| TypeScript | 7.0 | 7.0.2 latest (see finding 3) | npm |
| Vite | 8.3 | 8.3.2 | npm |
| React | 19.3 | 19.3.0 (RR 8 needs >=19.2.7) | npm |
| React Router | 8.4 | 8.4.0; client-only Data/Declarative modes supported | npm, reactrouter.com |
| TanStack Query | 5.104 | 5.104.1, peers React 18/19 | npm |
| vite-plugin-pwa | 2.0 | 2.0.0 (released 2026-10-03; only change is the assets-generator peer); peers vite ≤8 | npm, GitHub release |
| Hono | 4.13 | 4.13.13 | npm |
| Zod | 4.6 | 4.6.5; Better Auth depends on zod ^4.5.4 | npm |
| Drizzle ORM / kit | 0.45 / 0.31 | 0.45.3 / 0.31.11 | npm |
| Better Auth | 1.7 | 1.7.7; peers drizzle-orm ^0.45.2, vitest ≤5; `drizzleAdapter(db, { provider: "sqlite" })` for D1 | npm |
| @pushforge/builder | 2.0 | 2.0.5, zero deps, Web Crypto; README lists Cloudflare Workers as supported; ~100k weekly downloads | npm |
| Wrangler / CF Vite plugin | 4.147 / 1.62 | 4.147.0 / 1.62.5 (peers vite 6–8, wrangler ^4.147) | npm |
| Vitest / pool-workers | 4.1 / 0.22 | pool peers vitest ^4.1.0 | npm |
| dependency-cruiser | 18.5 | 18.5.0 (but see finding 3) | npm |
| Starter command | `--template=cloudflare/templates/vite-react-template` | matches template README; template contains Hono, React, CF Vite plugin | GitHub |
| Workers Free | 100k req/day, 10 ms CPU | confirmed (plus 50 subrequests, 1 s startup) | CF Workers limits |
| D1 Free | 500 MB/db, 5M reads, 100k writes/day | confirmed; free limits reset 00:00 UTC | CF D1 pricing/limits |
| D1 Oceania | location hint | `oc` exists; set only at creation (`wrangler d1 create --location=oc`), not in wrangler config | CF D1 data-location |
| Workers AI free allocation | 10,000 neurons/day | confirmed | CF Workers AI pricing |
| Llama 3.3 70B on Workers AI | exists | `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, stays active after the May 2026 deprecations | CF models, changelog |
| AI Gateway + Workers AI on Free | works | confirmed, binding `gateway` option | CF AI Gateway docs |
| Better Auth Google + passkeys | supported | `@better-auth/passkey` 1.7.7; passkey-first registration supported | better-auth.com |
| SPA assets don't invoke the Worker | AD-3 claim | true for navigations (but see finding 2 for `/api` callbacks) | CF SPA routing docs |

## Process note

The memlog's version-verification entries are good practice. Two of them carried errors into the document: "Time Travel 30 days, all plans" and "D1 ... 5 GB" (5 GB is the per-account storage figure). Platform-limit claims should quote the limits table row and its URL in the memlog, as package versions already do.
