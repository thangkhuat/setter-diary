---
title: 'Story 1.1: Deployable app from the starter template'
type: 'feature'
created: '2026-10-06'
status: 'done'
baseline_commit: 'f2346cb754dada0a8cfe20b403ca12cf582f08d3'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-setter-diary-2026-10-05/architecture.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repository holds only planning documents. Every later story needs a deployed, rule-checked app on Cloudflare's free plan, and the Free-plan rate-limiting assumption (AD-13) is unproven.

**Approach:** Bring in the official `vite-react-template`, apply the architecture's starter delta, add the hexagonal folder layout with an enforced boundary check, wire CI (checks, per-PR preview with its own D1, production migrate and deploy, weekly backup), write the runbook, and settle the rate-limiting assumption against the deployed Worker.

## Boundaries & Constraints

**Always:**
- Layout: SPA in `web/`, Worker in `worker/`, `src/core/`, `src/adapters/`, `src/contracts/`; `wrangler.jsonc`; adapters wired only in `worker/composition.ts`.
- Exact versions from the architecture Stack table (TypeScript 6.0.3, Vite 8.3, `@vitejs/plugin-react` 6.1, React 19.3, Hono 4.13, Zod 4.6, Drizzle 0.45 / drizzle-kit 0.31, Wrangler 4.147, `@cloudflare/vite-plugin` 1.62, Vitest 4.1, pool-workers 0.22, dependency-cruiser 18.5); Node 24 in `.nvmrc` and CI.
- A package is installed by the story that first uses it. This story installs none of React Router, TanStack Query, vite-plugin-pwa, Better Auth, @pushforge/builder.
- Worker name `setter-diary`; production D1 `setter-diary`, created with `--location=oc`, bound as `DB`.
- No tables in this story: the migration journal starts empty; migrate and seed steps run as wired no-ops.
- Everything stays on the Workers Free plan; nothing bills.
- Existing files are never overwritten: starter `.gitignore` entries are merged in, `README.md` is kept and gains a "Running the app" section, `_bmad/`, `_bmad-output/`, `docs/product-brief.md` and `.agents/` are untouched.
- Every automated acceptance criterion has a test; manual checks are recorded in Implementation Notes.
- Owner decisions (2026-10-06): the full spec is kept as one story. The agent performs the Cloudflare setup from the owner's signed-in machine (create the D1, one manual deploy for the rate-limit check, commit the database id). The weekly export is encrypted with a passphrase held as a GitHub secret before upload, because the repository is public. GitHub secrets and the pull request are handled through the owner's `gh` sign-in.

**Never:**
- No sign-in, schema, design tokens, app shell or PWA config (Stories 1.2–1.5).
- No secrets in the repository; no deploy of the starter before the delta is applied.
- No table invented just to have a migration.
- The rate-limit test route does not stay in production after its result is recorded.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Health | `GET /api/health` | `200` `{ status: "ok", version }`, version = `package.json` version | N/A |
| Unknown API route | `GET /api/nope` | `404` `{ error: { code: "NOT_FOUND", message } }`, never the SPA HTML | closed error union in `src/contracts/errors.ts` |
| SPA navigation | `GET /anything` (not `/api/*`) | `index.html` from static assets, Worker not invoked | N/A |
| Rate limit | test route called above its limit | extra calls get `429` `{ error: { code: "RATE_LIMITED" } }` | binding missing on Free → record it and raise the choice to the owner |
| Boundary violation | fixture imports `hono` from `src/core/` | boundary check exits non-zero; CI step asserting this passes | fixture passing = CI fails |
| Non-linear journal | PR journal is not `main`'s journal plus appended entries | journal check fails CI | missing journal on both sides = pass |

</frozen-after-approval>

## Code Map

- Starter (`cloudflare/templates/vite-react-template`, fetched fresh with `npm create cloudflare@latest` into a temp folder, `--no-git --no-deploy`): `src/react-app/*` → `web/` (with `index.html`; Vite `root: 'web'`, build to `dist/client`); `src/worker/index.ts` → `worker/index.ts`; `wrangler.json` → `wrangler.jsonc`; `tsconfig.{app,worker,node}.json` includes updated; `eslint.config.js`, `worker-configuration.d.ts` kept. Starter ships Vite 7, plugin-react 5, TypeScript 5.9, Hono 4.11, Wrangler 4.136: all bumped.
- `wrangler.jsonc` -- `main: ./worker/index.ts`, current `compatibility_date`, `assets.run_worker_first: ["/api/*"]`, `d1_databases` (`DB`, `migrations_dir: src/adapters/db/d1/migrations`), rate-limit binding, `vars.ENV`.
- `src/core/shared/` -- `RateLimiter` port and result types (first real core code).
- `src/adapters/rate-limit/cloudflare/` -- adapter over the Workers Rate Limiting binding.
- `src/adapters/db/d1/{schema,migrations}/` -- empty Drizzle schema index; `drizzle.config.ts` at root.
- `src/contracts/{common,errors}.ts` -- health response schema; closed error-code union with HTTP statuses.
- `.dependency-cruiser.cjs` -- layer table, vendor ban for `src/core/`, slice order, progress-only public-schema rule.
- `tests/fixtures/boundary-violation/` -- deliberately broken import.
- `.github/workflows/` -- `ci.yml`, `preview-cleanup.yml`, `backup.yml`.
- `README.md`, `.gitignore`, `docs/` -- existing; extend only.

## Tasks & Acceptance

**Execution:**
- [x] temp folder → repo root -- create the starter, move its files in without overwriting, merge `.gitignore`, delete the temp folder -- AC 1
- [x] `package.json`, `.nvmrc`, `vite.config.ts`, `tsconfig*.json`, `wrangler.jsonc` -- apply the starter delta, pin versions, add scripts `dev`, `build`, `typecheck`, `lint`, `test`, `boundaries`, `boundaries:fixture`, `journal:check`, `db:migrate`, `db:seed`; inject the app version at build -- AC 1
- [x] `worker/index.ts`, `worker/composition.ts`, `src/contracts/*`, `src/core/shared/*`, `src/adapters/rate-limit/cloudflare/*` -- health route, JSON 404 for unknown `/api/*`, rate-limited test route through the port -- matrix
- [x] `vitest.config.ts` (two projects: core in Node, worker in the Workers pool) plus tests -- core unit test for the port's result handling; Workers tests for every matrix row that is HTTP -- matrix
- [x] `.dependency-cruiser.cjs`, `tests/fixtures/boundary-violation/**` -- rules and the must-fail fixture script -- AC 2
- [x] `drizzle.config.ts`, `src/adapters/db/d1/**`, `scripts/check-journal.mjs`, `scripts/seed.sql` -- empty schema, journal linearity check against `origin/main`, no-op seed, with unit tests for the check -- AC 3
- [x] `.github/workflows/ci.yml` -- PR: install, typecheck, lint, test, boundaries (real and fixture), journal check, create + migrate + seed D1 `setter-diary-pr-<N>`, upload a preview version bound to it, comment the URL. `main`: same checks, migrate production D1, deploy, smoke-test `/api/health` -- AC 3, 4
- [x] `.github/workflows/preview-cleanup.yml` -- on PR closed, delete `setter-diary-pr-<N>` -- AC 3
- [x] `.github/workflows/backup.yml` -- weekly `wrangler d1 export`, encrypted with the `BACKUP_PASSPHRASE` secret before upload, short artifact retention -- AC 6
- [x] `docs/runbook.md` -- first-time setup (API token scopes, secrets, D1 creation), deploy, `wrangler rollback`, Time Travel restore (7 days on Free), backup restore, secret rotation -- AC 6
- [x] deployed Worker -- run the rate-limit check, record calls and results in Implementation Notes, then remove the test route (keep the port and adapter) -- AC 5

**Acceptance Criteria:**
- Given the repository after this story, when `npm ci && npm run build` runs on Node 24, then it succeeds and the layout, config and versions match Boundaries.
- Given the planning folders and `README.md` before this story, when the story is done, then `git diff` shows no change to the planning folders and only an added section in `README.md`.
- Given CI on a pull request, when it runs, then every step in the `ci.yml` task passes, and closing the PR deletes its preview D1.
- Given a merge to `main`, when CI finishes, then `GET https://setter-diary.<subdomain>.workers.dev/api/health` returns `200` with the app version.
- Given the deployed Worker on the Free plan, when the test route is called faster than its limit, then extra calls return `429` and the result is recorded [manual check]. If the binding is unavailable, the owner chooses the direction before Story 1.5 and AD-13 and Stories 1.5, 2.3, 4.2 are updated.

## Implementation Notes

**Rate-limit check [manual, 2026-10-06, production Worker on the Workers Free plan].** The Workers Rate Limiting binding is available and works. Test route `GET /api/spike/rate-limit`, limit 5 calls per 10 s, one key, sequential calls from one client:
- 30 calls in 3.3 s: 12 × `200`, 18 × `429` (twice, same result).
- 10 more calls straight after: 10 × `429`.
- After a 15 s pause: 4 calls, 4 × `200`.
- Conclusion: AD-13's assumption holds. The count is approximate (8 to 12 calls passed on a limit of 5), so limits need headroom; recorded in `docs/runbook.md` and on the middleware. No fallback or RFC needed; Stories 1.5, 2.3 and 4.2 stand as written.
- The route and its binding were then removed and production redeployed; `/api/spike/rate-limit` now returns `404 NOT_FOUND`.

**Cloudflare resources created.** D1 `setter-diary` (id `49bd82dc-aee7-4a07-8e09-0bc304e26d70`, region OC). Worker `setter-diary` at `https://setter-diary.setter-diary.workers.dev` (deployed by hand twice: with the spike route, then without). `wrangler d1 migrations apply DB --remote` ran as a no-op.

**Decisions made during implementation.**
- Previews deploy a separate Worker per pull request (`setter-diary-pr-<N>`), not a preview version of the production Worker as first planned. Worker secrets are per Worker, so a shared Worker would hand production secrets (Story 1.3 onward) to unreviewed PR code. Cleanup deletes the Worker, then its D1.
- `compatibility_date` is `2026-08-22`, the newest date the pinned `@cloudflare/vitest-pool-workers` 0.22 runtime accepts, so tests and production behave the same.
- The Worker reads the app version from `package.json` directly; the web app gets it through Vite `define`. Both come from the same field.
- Matrix row "Rate limit" is covered by `worker/middleware/rate-limit.test.ts` (the reusable `rateLimit` middleware that later stories mount) now that the test route is gone, plus the manual check above.
- Matrix row "SPA navigation" is covered by the config test in `tests/project-setup.test.ts` and by `scripts/smoke.mjs`, which CI runs against every preview and production deploy (static assets are not served inside the Workers test pool).
- ESLint stays on 9.x and the starter's lint setup is kept; `jsonc-parser` was added to read `wrangler.jsonc` in scripts and tests.
- The Free plan allows 10 D1 databases, so at most 9 PRs can have previews at once (in the runbook).

**After review.** `db:seed` became `db:seed:local`; the boundary fixture became 13 fixtures in `tests/fixtures/boundaries/`; `tsconfig.core.json` type-checks core with no ambient types; the deploy job builds before it migrates.

**Not yet verified.** The three workflows have not run on GitHub: they need the repository secrets and a pushed branch (acceptance criteria 3 and 4, and the backup job).

## Spec Change Log

## Review Triage Log

**Review pass 1 (2026-10-06).** Layers: blind hunter (BH), edge-case hunter (EC), verification gap (VG). No intent_gap or bad_spec; patches applied and all Verification commands re-run green.

| Source | Finding | Verdict | Route | Evidence |
|---|---|---|---|---|
| VG | `app.onError` on the real app untested | medium | patch | Test built its own Hono app. Now `createApp()` is exported and the 500 test drives the real app. |
| VG, BH | Only 1 of the boundary rules proven able to fail | medium | patch | One fixture existed. Now 13 fixtures under `tests/fixtures/boundaries/`, one per rule family, each must be rejected by the rule it is named after. |
| VG | Journal check passes vacuously if its path drifts from drizzle `out` | medium | patch | Nothing tied the paths. `tests/project-setup.test.ts` now asserts drizzle `out`, wrangler `migrations_dir` and the script's `MIGRATIONS_DIR` agree. |
| VG, EC, BH | No test project covers `web/**`; placeholder screen unverified | low | defer | True: no `web` project in `vitest.config.ts`. Needs a DOM test environment that is not in the Stack table; screen is a placeholder replaced by Story 1.2. Logged in deferred-work. |
| VG, EC, BH | `wrangler delete --yes` is not a valid flag | high | patch | `wrangler delete --help` (4.147) lists only `--dry-run` and `--force`. Flag removed. |
| BH, EC | Preview cleanup downgrades every Worker-delete failure to a warning | medium | patch | Confirmed in the workflow. Now only wrangler's "does not exist on this account" (verified message, code 10090) is tolerated; anything else fails the job. |
| VG, EC, BH | Compatibility-date age test fails from 2027-08-22 with no code change | medium | patch | Test used `Date.now()` minus 365 days. Replaced by: valid date, not before 2026-08-22, not in the future. |
| VG, EC, BH | Journal check compares only idx and tag; edited SQL passes | medium | patch | Confirmed. Now also compares `when`, and fails when a migration file already on the base differs from the base (`git diff --quiet`). |
| VG, BH | Deploy migrates before build; smoke failure leaves bad version live | medium | patch | Order was migrate → build → deploy. Now build → migrate → deploy. Auto-rollback not added; runbook and workflow comment say to roll back by hand. |
| VG, BH | Rate-limit adapter verified only against a mock; measurement not reproducible from the repo | false | reject | The measurement is the story's declared manual check, recorded with exact numbers in Implementation Notes; the frozen Never section requires the route not to stay. Adapter is a three-line mapping, unit-tested. |
| BH, EC | `npm run db:seed` targets the production D1 | medium | patch | Script used `--remote` with the default config. Replaced by `db:seed:local`; CI seeds previews with an explicit `--config`. |
| BH, EC | Preview can be orphaned when the PR closes while checks run | medium | patch | Race is real. Preview job now checks the PR is still open before doing anything, and shares a concurrency group with cleanup. |
| EC | A new push cancels a preview mid-migrate/seed/deploy | medium | patch | Workflow-level `cancel-in-progress` covered all jobs. Moved onto the `checks` job only. |
| BH | Preview D1 never reset between pushes; seed must be idempotent | low | patch | True by design (one D1 per PR). Documented in `seed.sql` and the runbook (close and reopen the PR for a fresh database). |
| BH | Preview and production are built differently | false | reject | Both run `wrangler deploy` from the repo root, which bundles `worker/index.ts` from the given config; the Vite deploy redirect lives under `web/.wrangler` and is used by neither. Verified with `--dry-run` for both configs. |
| BH, EC | `preview-config.mjs` isolates only D1; future bindings would be shared with production | medium | patch | Config was spread wholesale. Now an allowlist: an unrecognised top-level key fails the script until a rule is written for it. Test added. |
| BH | `jsonc-parser` `parse` does not throw on broken input | low | patch | Correct. `parseJsonc` now collects errors and throws; test added. |
| EC | UUID check accepts 36 arbitrary hex/dash characters | low | patch | Regex tightened to the 8-4-4-4-12 shape; test added. |
| BH | PR code runs with the production Cloudflare token; no environment gate | low | reject | Only same-repository PRs get secrets, and only the owner can push branches (architecture: owner-only access in v1). A separate token and GitHub Environments need owner setup beyond a direct correction; revisit when a collaborator is added. |
| BH | Actions pinned to major tags, not SHAs; majors unverified | low | reject | v7 exists for checkout, setup-node and upload-artifact (checked with `git ls-remote`). SHA pinning is hardening beyond a direct correction for first-party actions. |
| BH, EC | No Dependabot config; a Dependabot PR would fail the preview job | low | reject | No Dependabot or Renovate is configured, so the failing state cannot occur today. |
| BH, EC | Deploy pipes hide wrangler's exit code (no pipefail) | high | patch | Default `run` shell is `bash -e` without pipefail. All three workflows now set `defaults.run.shell: bash`. |
| BH, EC | URL grep breaks with a custom domain or `workers_dev: false` | low | reject | Custom domain is in the architecture's Deferred list; cannot occur on workers.dev. `|| true` added so the friendly error prints. |
| BH | Smoke test cannot tell which deployment answered (version is 0.1.0) | low | reject | True, but with pipefail a failed deploy now fails its own step; exposing a commit id in `/api/health` is new API surface, not a direct correction. |
| EC | Smoke: a transient 404 during propagation is not retried | maybe-false | reject | Observed on the first deploy: the fresh hostname failed at connection level (retried), never with a 404. Would need a capture of a 404 from a propagating workers.dev host; low if true. |
| EC, BH | Smoke request has no timeout | low | patch | Added `AbortSignal.timeout(15000)` per request. |
| BH | `/api/health` and smoke never touch D1 | low | reject | Health is a liveness check by the frozen matrix (`{ status, version }`); there is no table to read yet. A readiness check is new behaviour, not a correction. |
| BH | Backup has no non-empty check; gpg may need `--pinentry-mode loopback` | low | patch | Added `test -s` on the export and the ciphertext, and the loopback flag (verified harmless on gpg 2.2). |
| BH, EC | Scheduled backups stop after 60 days of repository inactivity | low | patch | GitHub behaviour is real. Documented in the workflow and the runbook; a keep-alive job was not added. |
| BH | Encrypted backup is publicly downloadable and can be attacked offline | low | patch | This is the owner's recorded decision (encrypt, repo stays public). Residual risk and the need for a long random passphrase are now stated in the runbook. |
| EC | `check-journal.mjs` main guard can silently not run (symlink, drive-letter case) | medium | patch | URL string comparison is case- and link-sensitive on Windows; a skipped `main()` exits 0. All three CLI scripts now use `scripts/is-main.mjs`, which compares real paths. |
| EC | `git show` failure for other reasons is treated as an empty base journal | medium | patch | Confirmed in `readBaseJournal`. Existence is now tested with `git cat-file -e`; if the file exists, a failing `git show` throws. |
| EC, BH | Core can import local files outside `src/` (scripts, root files) | low | patch | Rule only listed four folders. Replaced by `core-imports-core-only`: any local import outside `src/core/` fails. Fixture added. |
| EC, BH | `core-slices-are-known` misses a folder whose files import nothing | low | patch | `to: {}` needs a dependency. Added a folder-name test in `tests/project-setup.test.ts`. |
| BH | `worker/` and adapters can deep-import slice internals | false | reject | The architecture limits slice-to-slice use to `index.ts`; the API edge is allowed to call core use cases and adapters to implement core ports. No rule is broken. |
| BH | Workers ambient types let `src/core` use `Env`, `D1Database`, `fetch` without an import | medium | patch | `tsconfig.worker.json` type-checks `src` with Workers types. Added `tsconfig.core.json` (`types: []`, no DOM) so core is also checked with no ambient types. |
| BH | Nothing checks `worker-configuration.d.ts` against `wrangler.jsonc` | low | patch | Added `wrangler types --check` to the checks job (flag verified in 4.147). |
| BH | Unhandled-error log drops stack, path and request id; PII rule unenforced | low | reject | Request-scoped structured logging arrives with the scope middleware (Story 1.5); adding fields now is more than a direct correction, and stacks risk carrying user values. |
| BH | 429 has no `Retry-After`; fail-open is hard-coded | low | reject | No route uses the middleware yet. The binding exposes no reset time, and the AI quota (the cost-bearing case) is a database counter by AD-10, not this limiter. |
| EC | `HTTPException` from a route becomes 500 INTERNAL_ERROR | low | reject | Nothing throws `HTTPException` today. Mapping it needs new codes in the closed error union (400/401), which belongs to the story that adds validation and auth. |
| EC | `limiter(c)` or `key(c)` throwing synchronously gives 500 | low | reject | Both are caller-supplied accessors with no failing input shown; a guard would hide a programming error. |
| EC | Empty rate-limit key puts callers in one bucket | low | reject | No caller exists; later stories key by user id from the session, which is never empty. |
| EC | `limiter.limit` never settling hangs the request | low | reject | The platform ends a hung request; a timeout port is new surface for a state not shown reachable. |
| EC | Binding returning a non-boolean `success` makes every call 429 | low | reject | The binding's type is `{ success: boolean }` in the generated Workers types; no evidence it can differ. |
| EC, BH | `web/App.tsx`: health fetch has no timeout, no `res.ok`, no schema check | low | reject | Placeholder screen replaced by Story 1.2; the web layer may not import Zod schemas at runtime without the bundle cost being decided there. |
| EC | `/api` (no trailing segment) returns the SPA shell | low | reject | True, but the frozen spec fixes `run_worker_first: ["/api/*"]`, and no client calls bare `/api`. |
| BH | README omits database scripts; `nvm use` does not read `.nvmrc` on nvm-windows | low | patch | Added `db:generate` and `db:migrate:local`; wording changed to "the version in `.nvmrc`". |
| BH | Runbook asserts expand/contract without enforcement; lacks limit, leaked-token and bad-migration entries | low | reject | Expand/contract is an architecture rule (AD-19) reviewed per migration; the first migration is Story 1.3. Added the smoke-failure and restore-slot notes; the rest is beyond this story's four runbook topics. |
| BH | `.gitignore` bare `Icon` pattern ignores any folder named Icon | low | patch | Line 37 was `Icon` with its two carriage returns lost. Removed, with a comment saying why. |
| BH | Starter leftovers: `vite.svg` favicon, no manifest or theme-color, `nodejs_compat` | low | reject | Icon, manifest and theme are Story 1.2 and 1.9 (frozen Never: no PWA config). `nodejs_compat` is the starter's default and is left as shipped. |
| BH | Lint is not type-aware; no formatter config | low | reject | The starter's lint setup is kept as is; type-aware linting is a tooling decision, not a defect in this change. |
| EC (claim) | Spec says PR job uploads a preview version; code deploys a separate Worker | false | reject | Deliberate and recorded in Implementation Notes (secrets are per Worker). The fix would be editing this spec. |
| EC (claim) | "Closing the PR deletes its preview D1" does not hold for forks, Dependabot or a late preview job | low | patch | Forks and Dependabot never get a preview D1. The late-job race is closed by the PR-open check and shared concurrency group above. |

## Design Notes

- **Preview:** `scripts/preview-config.mjs` writes `wrangler.preview.jsonc` (Worker and D1 both `setter-diary-pr-<N>`, `ENV=preview`); CI migrates, seeds and deploys with `--config`. Production is touched only by `wrangler deploy` on `main`.
- **App version:** `package.json` `version`, imported by the Worker and injected into the web app by Vite `define`, so `/api/health` and the later `X-App-Version` check (Story 1.2) share one source.
- **Empty journal:** `wrangler d1 migrations apply` with no migrations is a successful no-op, so the pipeline is proven now and Story 1.3 only adds SQL.

## Verification

**Commands:**
- `npm ci && npm run typecheck && npm run lint && npm test` -- expected: all pass
- `npm run boundaries` -- expected: exit 0
- `npm run boundaries:fixture` -- expected: exit 0 because the fixture was rejected
- `npm run journal:check` -- expected: exit 0
- `npm run build && npx wrangler deploy --dry-run` -- expected: bundle builds, bindings listed

**Manual checks (if no CLI):**
- Rate-limit calls against the deployed Worker; results in Implementation Notes.
- First PR and first `main` run green in GitHub Actions.
