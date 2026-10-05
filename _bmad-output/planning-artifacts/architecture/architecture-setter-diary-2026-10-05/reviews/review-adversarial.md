# Adversarial Review — Setter Diary Architecture Spine

- **Target:** `../architecture.md` (draft, 2026-10-05) and `../adr/ADR-001..009`
- **Read against:** PRD.md, data-dictionary.md, permissions-matrix.md, reporting-requirements.md, ux-specification.md, RFC-001 (treated as accepted)
- **Lens:** build two units one level down (epics/stories built by different AI agents) that each obey every AD exactly and still don't fit together. Each pair found is a hole to close.
- **Reviewer:** independent adversarial pass, 2026-10-05

## Verdict

**Not ready to hand to independent builders.** The paradigm (hexagonal slices, team scope, deny-by-default policy, member separate from account) is sound, and most single-slice divergence is closed. The spine fails exactly where slices meet:

1. AD-2 forbids the cross-slice reads and writes that `progress`, `account`, `ai` and `ratings` need, and it gives no sanctioned way to do them.
2. Visibility is spread across eight `policy.ts` files with nothing tying them together.
3. Nothing says how a request picks its team, or how user-scoped (cross-team) features are allowed at all.
4. Account deletion's "one transaction" can't be done under AD-2's table ownership.

Every one of these lets two agents both comply and still ship code that doesn't fit together. 4 critical, 11 high, 10 medium, 4 low.

---

## Critical

### C1. Cross-slice reads: `progress` (and `ai`, `account`) have no legal way to read stats

- **Units:** *logging* (owns `set_entries`) vs *progress* (owns no tables, per AD-2).
- **How both comply yet clash:** AD-2 says "only that slice's adapters read or write" a table. The logging agent exports what a logging story needs, `listEntries(scope, sessionId)`. The progress agent needs weekly aggregates across months, joined to `sessions.session_date`, `set_types` and member names. It has two compliant options:
  - **(a)** Call `logging`'s index for every session and aggregate in memory. This exceeds the 10 ms CPU limit (AD-13) and reads every row from D1.
  - **(b)** Ask logging to add `weeklyTrend(...)`. Now trend logic lives in logging, and the next agent (ai, export, team stats) adds its own variant.

  ADR-008 also says "cross-stat views join through the shared session and member records", which AD-2 forbids. Two progress builders could pick (a) and (b) and both pass review.
- **Proposed AD-17 — Read models and cross-slice queries:**
  > Tables are written only by their owning slice. A read-only **query slice** (`progress`; later stat views) may read other slices' tables through its own query adapter, using only the columns those slices declare public in `src/adapters/db/d1/schema/<slice>.public.ts`. Owning slices treat public columns as a contract: they can add to it, but renaming or removing a column needs a migration plan and an update to every reader. Every other slice (`ai`, `account`, `notifications`) reads other slices' data only through the owning slice's or `progress`'s `index.ts`. All stat aggregation (averages, % hittable, weekly buckets, before → now) is implemented once, in `progress`. `ai` and `account` call it and never re-derive it. dependency-cruiser enforces that only `adapters/db/d1/queries/progress/**` imports other slices' public schema files.

  Also fix ADR-008's wording to match.

### C2. Visibility rules are decided in eight places with no single source

- **Units:** *progress* (FR-7/8/9/11 views) vs *sessions/logging* (session cards and entry lists, which the UX also shows under Team stats as "every setter's diary"). The same clash exists between *ratings* (who sees hitter ratings) and *account* (export).
- **How both comply yet clash:** AD-5 gives each slice its own `policy.ts`, built from four flags. The logging agent lets a `hasTeamView` member read another setter's session entries. The progress agent's grid policy decides "hitter sees only own row" by checking `isHitter && !isSetter`. A member who is both setter and hitter, viewing another setter's grid, then gets all rows from logging's endpoint and one row from progress. Another agent filters rows after fetching, and the full payload goes over the wire. Neither breaks AD-5, because AD-5 governs *where* the policy lives, not *what* it says.
- **Proposed AD-5 tightening (new clause):**
  > Data visibility is computed by one shared function set in `src/core/teams/visibility.ts`, exported through `teams/index.ts`, and every slice's policy calls it rather than re-deriving it:
  > - `diaryAccess(actor, setterMemberId) → 'full' | 'own_rows' | 'trend_only' | 'none'`
  > - `canSeeHitter(actor, hitterMemberId)`
  >
  > The rules: the setter themself or a `hasTeamView` holder gets `full`. Any other active member gets `trend_only` for the trend and `own_rows` for the grid, entries and ratings, decided by **row identity** (`member_id === actor.memberId`), never by the `isHitter` flag. Non-members get `none`. Row restrictions are applied inside the query (a `WHERE member_id = ?`), never by filtering a fetched result. AI conversations are outside this function and always owner-only. A shared policy test table in `src/core/teams/visibility.test.ts` encodes every row of `permissions-matrix.md`.

### C3. How a request selects its team, and how user-scoped features exist at all

- **Units:** *web app screens* vs *API slices*. Also *ratings* (cross-team "To rate" list) vs AD-4.
- **How both comply yet clash:**
  - **Picking the team.** The conventions table says the edge resolves `userId → acting member` and that paths are `/api/<slice>/...`, but it never says where the team id comes from. One agent builds `/api/sessions?teamId=`, another uses an `X-Team-Id` header, a third uses `/api/teams/:teamId/sessions`, and the web agent builds yet another. All comply.
  - **Cross-team features.** The UX "To rate across teams" Home view, CSV export of "own data" (FR-13), account deletion, push subscriptions, and the team switcher all need queries that span the user's teams. AD-4 says "there is no port method that reads or writes team data without [a TeamScope]". One agent loops over memberships. Another adds an unscoped `listPendingForUser(userId)` port and calls it an exception. Background work (push send, any cron) has no acting member to put in a TeamScope.
- **Proposed AD-4 tightening:**
  > Team-scoped routes are `/api/teams/:teamId/<slice>/...`. The edge builds `TeamScope { teamId, member }` from the path and the session user. If the user has no active member in that team, the edge returns `403 NOT_A_MEMBER` before any use case runs. User-scoped routes are `/api/me/...` and receive a `UserScope { userId, memberships[] }`. A `UserScope` use case may touch team data only by iterating `memberships` and calling the TeamScope API for each one; no repository port takes a `userId` for team data. System work (notifications, deletion) uses an explicit `SystemScope` created only in `worker/composition.ts`, and every port method that accepts it is named `*AsSystem`.

  Add this to the conventions table as well.

### C4. Account deletion's "one transaction" spans four owners

- **Units:** *account* (deletion use case) vs *teams*, *notifications*, *ai* and the *identity adapter* (owners of members, push subscriptions, AI conversations and Better Auth rows).
- **How both comply yet clash:** AD-7 requires one transaction. AD-2 forbids account from writing those tables, and "multi-row writes use a D1 batch through the repository adapter", which means each slice's own adapter. Each owning slice exposes `deleteForUser()`, and each one runs its own `db.batch`. The result is four separate transactions. Partial failure leaves a deleted login with members still named, or a user who can log in but has no conversations. Better Auth's delete runs through its own API and can't join a Drizzle batch. Separately, the "Former player N" counter owned by teams can collide when two members of one team delete their accounts at the same time.
- **Proposed AD-18 — Cross-slice writes use a unit of work:**
  > A use case that changes several slices' data uses a `UnitOfWork` port (shared kernel). Each owning slice exposes `prepare*` functions (via `index.ts`) that return deferred statements, never executing them. The orchestrator submits all statements as one D1 batch. Better Auth rows are deleted through an `Identity.prepareDeleteUser()` that returns D1 statements against Better Auth's tables (same database), or the Identity deletion runs **last** and the whole operation is idempotent and resumable. In that case the user row gets `deletion_pending_at` and retries until it completes. "Former player N" numbering uses a per-team counter column incremented inside the same batch (`UPDATE teams SET former_seq = former_seq + 1 ... RETURNING`). AD-7 applies the same unit of work to participant removal (H2) and session deletion.

---

## High

### H1. Hitter rating lock timing has no owner or definition

- **Units:** *ratings* (enforces "editable until next session with that setter") vs *sessions* (owns session dates and participants), plus *web* and *notifications* (show and hide "To rate" cards).
- **Clash:** ratings computes "next" by `created_at`. The web agent hides cards by `session_date`. Both are reasonable. Other questions are also unresolved: whether two sessions on the same date lock each other, what happens when the setter backdates a session date or removes the hitter from participants after they rated, and whether the lock is stored (`locked_at`, which needs a writer when sessions change, and that writer would be sessions writing ratings' table) or derived on read.
- **Proposed rule (AD-9 tightening):**
  > A hitter can rate a session when an active `session_participants` row exists for them and they are not that session's setter. The lock is **derived on read, never stored**. A rating for session S is locked when sessions' `nextSessionWith(scope, setterId, hitterId, after: S)` returns a session, ordered by `(session_date, created_at, id)`. The open/closed/pending list ("To rate") is computed only by `ratings` and served from `GET /api/me/ratings/pending`. Web and notifications consume that list and never compute it themselves. A participant with a rating can't be removed from a session (see H2).

### H2. Participants vs set entries: who enforces "only to a player involved in it"

- **Units:** *sessions* ("Who played?" editing) vs *logging* (set entries keyed to a hitter member).
- **Clash:** logging validates a new entry's hitter against `sessions.isParticipant()`. Sessions allows unticking Leo after 6 sets were logged to him. That leaves orphan entries and breaks FR-4. Session deletion has the same problem: sessions can't delete `set_entries` (AD-2).
- **Proposed rule (AD-2 addendum):**
  > The slice that owns a parent row also owns the guard on dependent rows elsewhere. sessions refuses to remove a participant who has set entries or a rating (`409 PARTICIPANT_HAS_DATA`), using logging's and ratings' `count*` index functions. Deleting a session deletes its entries and ratings through the unit of work (C4), never by FK cascade. D1 foreign keys use `ON DELETE RESTRICT` throughout.

### H3. Set-type deletion and rename vs existing entries

- **Units:** *teams* (owns set types, FR-3 edit list) vs *logging* and *progress* (reference `set_type_id`).
- **Clash:** teams hard-deletes "pipe". RESTRICT fails it, or a cascade erases history. If teams instead asks logging whether the type is in use, it creates a teams → logging → teams dependency cycle. Rename is also ambiguous: progress labels history with the current name, while the export agent snapshots names onto rows.
- **Proposed rule:**
  > Set types are never hard-deleted. "Delete" sets `archived_at`. Archived types disappear from the tally grid but stay in progress, filters and export, under their current name. A rename relabels all history, and no other slice copies set-type names into its rows. Order is a `position` integer owned by teams. A team's five seed types are created in the same batch as the team.

### H4. Member lifecycle (removed, left, anonymised) is undefined, so lists disagree

- **Units:** *teams* (remove from roster, FR-2) vs *sessions* (Who played? list), *logging* (hitter tabs), *progress* (grid rows).
- **Clash:** AD-6 covers "leaving removes the link" but not removal by a manager. Teams soft-deletes with `removed_at`. Sessions lists every member, so removed players are still selectable. Progress uses `listActiveMembers()`, so removed hitters' history disappears from grids. Each choice complies with AD-6.
- **Proposed rule (AD-6 tightening):**
  > A member has `status: active | removed` and `link: linked | unlinked`. Removing or leaving sets `removed_at` and clears the link in one write; there is no hard delete. teams exports exactly two lists. `listSelectableMembers(scope)` returns active members only and is used for pickers. `getMembers(scope, ids)` includes removed and anonymised members and is used for any historical display. A removed member who is re-added is the same member row, reactivated.

### H5. Anonymisation misses members unlinked before deletion; AI transcripts keep names

- **Units:** *teams* (leave/remove clears `user_id`) vs *account* (AD-7 anonymises "all members" linked to the user). Also *ai* (stores replies "with names restored") vs FR-12.
- **Clash:** Mia leaves Team A, so her link is cleared. Later she deletes her account. AD-7 finds only currently linked members, so "Mia" stays in Team A's diary, which breaks FR-12 ("no name"). Separately, the ai agent stores the restored reply text, "Back sets to Josh…", in `ai_messages`. When Josh deletes his account, his name survives in Thang's saved conversations.
- **Proposed rules:**
  > (AD-6) Clearing a link records `former_user_id` on the member. Account deletion anonymises every member where `user_id = U OR former_user_id = U`, then nulls both columns.
  >
  > (AD-10) AI messages are stored **with labels** plus a per-conversation `label → member_id` map. Real names are restored when the conversation is read, using `teams.getMembers` (which returns "Former player N" after deletion). No member display name is ever persisted outside `members`.

### H6. AI conversation ownership: member or user?

- **Units:** *ai* (ER: `MEMBER owns AI_CONVERSATION`) vs *account* (AD-7: delete "that user's AI conversations"). Also *teams* (re-invite recovery re-links a member to a new account).
- **Clash:** If conversations are keyed by member, account deletion has to go through members, and conversations of members already unlinked are missed. Recovery hands a member's conversations to whoever redeems the re-invite. If they're keyed by user, a setter in two teams sees Team A's conversation while switched to Team B, which crosses team data (FR-16). The ER diagram and the AD disagree.
- **Proposed rule (AD-10):**
  > `ai_conversations` carries both `team_id` and `owner_user_id` (and `member_id` for context). Read access requires `owner_user_id = session user` **and** the current TeamScope's team. Account deletion deletes by `owner_user_id`. Leaving a team deletes that team's conversations for that user.

### H7. Invite redemption vs existing links, multi-team and recovery takeover

- **Units:** *teams* (redeem use case) vs *identity adapter* (sign-up via Google OAuth or passkey, which records consents).
- **Clash:** AD-12 says "creating the account first if needed". The identity agent runs sign-up as an OAuth redirect, and the invite token is lost unless someone defines where it is carried. That could be the OAuth `state`, a short-lived cookie, or `sessionStorage`, so three agents pick three. Redeem cases nobody owns:
  - The account is already linked to a *different* member of the same team, which breaks "at most one per team".
  - The member is already linked to another account. In recovery this is intended. Otherwise it is a takeover by anyone who sees the link.
  - Consent must exist before any link.
- **Proposed rule (AD-12 tightening):**
  > The token travels in an httpOnly `invite` cookie set by `GET /api/invites/:token/preview` (unauthenticated), and is read by `POST /api/me/invites/redeem` after sign-in. Redeem refuses if consents are missing (`CONSENT_REQUIRED`). It refuses if the account already has an active member in that team (`ALREADY_IN_TEAM`). If the target member is already linked, redeem replaces the link only when the token was issued as `kind: 'recovery'` by a manager; otherwise it refuses (`MEMBER_ALREADY_LINKED`). Redemption and link are one conditional write: `UPDATE ... WHERE used_at IS NULL AND expires_at > now`. Default expiry is configuration (proposed 7 days).

### H8. Who sets `isSetter` / `isHitter`?

- **Units:** *teams* (Add player sheet is "name only", member sheet has only Manager and Team view toggles) vs *sessions* (policy: only `isSetter` creates sessions) and *logging* (hitter picker).
- **Clash:** No requirement or AD assigns who sets the playing flags, or when. The teams agent defaults new members to `isHitter`, with no UI for `isSetter`. The sessions agent requires `isSetter`, so nobody except the team creator can ever log. Another agent treats the flags as derived ("a setter is anyone who has created a session"). The team creator's flags are also undefined.
- **Proposed rule (AD-5 addendum):**
  > `isSetter` and `isHitter` are stored flags set by a manager on the member sheet (to be added to the UX). New members default to `isHitter = true`, `isSetter = false`; the team creator gets `isSetter = true, isManager = true`. `isHitter` never gates visibility or rating (row identity does, per C2). It only controls the hitter-home tabs. Any active participant can be logged to and can rate. The last-manager invariant is enforced with a conditional update (`... WHERE (SELECT count(*) ... is_manager) > 1`), so two managers demoting each other can't both succeed.

### H9. Migrations from parallel agents, and one shared preview database

- **Units:** any two slices built in parallel PRs.
- **Clash:** Both run `drizzle-kit generate`. Both produce migration `0007_*`, with conflicting `meta/_journal.json` snapshots. Both PRs migrate the **single** preview D1, so PR A's schema breaks PR B's preview. "Migrations applied before deploy" also means the running old Worker meets the new schema, and a rename or drop breaks production for the length of the deploy.
- **Proposed AD-19 — Schema change discipline:**
  > Migrations are generated only on a branch rebased onto `main`. CI fails if the migration journal is not linear against `main`. Each PR gets its own preview D1 (created and seeded by CI, deleted on close), or previews use a local D1 in CI only. Production migrations are expand/contract: additive in one deploy, destructive only in a later deploy after no code reads the old shape. Better Auth's tables are declared in `schema/identity.ts` and owned by the identity adapter.

### H10. Passkeys and Google OAuth vs `*.workers.dev`, preview URLs and the future domain

- **Units:** *identity adapter* vs *deployment/environments*.
- **Clash:** Passkeys are bound to an RP ID (the host). Production starts on `*.workers.dev`, and Deferred plans a custom domain later. Moving domains invalidates **every passkey**, and with no email, recovery means a manager re-invite per team. Per-PR preview URLs can't be registered as Google OAuth redirect URIs (no wildcards), and passkeys don't carry over, so preview sign-in is untestable. Agents will improvise test backdoors, and those differ.
- **Proposed rule (AD-11 tightening and an environments decision):**
  > The passkey RP ID and the OAuth redirect host are configuration per environment and are fixed before launch. Either buy the domain before the first real user (raise the RFC now), or record in an ADR that a domain move requires every passkey user to re-register through a manager re-invite. Preview and local use an `Identity` test adapter (`DEV_LOGIN=true`, refused at startup when `ENV=production`) instead of Google or passkeys.

### H11. Deploy skew: cached PWA shell vs a newer API

- **Units:** *web* (service worker caches the shell, AD-14) vs *API* (contracts change).
- **Clash:** A phone keeps running an old cached shell after a deploy and sends old request shapes. Zod validation rejects them with 400, and the user sees "Couldn't save". Nothing decides the update policy for the service worker (`autoUpdate` or prompt) or API compatibility.
- **Proposed rule (AD-14 addendum):**
  > The service worker uses `registerType: 'autoUpdate'` and reloads at the next navigation. Contract changes are additive for one release: new optional fields only, and an old field is removed only in a later release. Every request carries an `X-App-Version` header. The API returns `426 APP_UPDATE_REQUIRED` below a configured minimum, and the web app reloads when it sees that.

---

## Medium

### M1. AI quota: per what, per which day, and what counts

- **Units:** *ai* (usage counters) vs *web* ("You've used today's AI discussions") vs *teams* (multi-team user).
- **Clash:** "2 discussions per setter per day" doesn't say whether "setter" means a member (2 per team, so 4 in two teams) or a user, whether the day is UTC or the team's time zone, whether follow-up messages in an older conversation count, or whether fallback-model turns count. Two concurrent starts can both read count = 1 and both proceed.
- **Proposed rule (AD-10):**
  > A "discussion" is the creation of a new conversation; follow-ups are capped at a configured message count per conversation (`AI_MAX_TURNS`). The quota is per **user** per UTC day, across teams. The counter increments with a conditional `UPDATE ... WHERE count < limit` before the model call, and refunds on provider error. The app-wide allocation is tracked in a single `ai_usage_daily` row by estimated neurons, and the fallback switch reads that row. The result is the typed `{ status: 'limit_user' | 'limit_app' | 'ok' }`, which isn't an error.

### M2. AI consent: who stores it, who checks it, what exclusion means

- **Units:** *identity adapter* (sign-up records consents, AD-11) vs *ai* (excludes "members without recorded AI consent").
- **Clash:** The identity agent stores consents as Better Auth `additionalFields` on `user`. The ai agent needs member → user → consent, but core can't read Better Auth tables, and no port method is named. On exclusion, one agent drops the excluded hitter's rows entirely, which changes the setter's own trend the AI cites. Another keeps them in totals but unlabelled. The setter's own consent check is also unspecified.
- **Proposed rule:**
  > Consents live in an app-owned `user_consents` table (owner: `account`), written by the post-sign-up use case. Core reads them only via `account.getConsents(userIds)`. AI input is built by `progress` with an `excludeMembers` set. Excluded members' sets **stay** in the setter's aggregate trend but never appear as a per-hitter row or label. The requesting setter must hold AI consent (`CONSENT_REQUIRED`).

### M3. Error codes are free-form per slice

- **Units:** any API slice vs *web* (maps errors to UX copy: invite expired, AI limit, network, free-plan limit).
- **Clash:** The teams agent returns `INVITE_EXPIRED`, the web agent switches on `TOKEN_EXPIRED`, and the D1 daily limit surfaces as a raw 500.
- **Proposed rule (Errors convention):**
  > Error codes form one closed union in `src/contracts/errors.ts`, each with a fixed HTTP status. New codes are added there, never inline. Edge middleware maps platform limit errors (D1 or AI quota, CPU) to `503 SERVICE_BUSY` with retry copy (AD-13).

### M4. Contract layout and what `src/contracts` may import

- **Units:** *web* (imports contracts only) vs *worker* vs *core/shared* (enums).
- **Clash:** The enums live in `src/core/shared`, but the layer table never says contracts may import core/shared, and web may import only contracts. One agent re-declares `good | ok | poor` in contracts and drift follows. Two agents also write two `MemberSummary` schemas.
- **Proposed rule:**
  > Use `src/contracts/<slice>.ts` plus `src/contracts/common.ts` (IDs, dates, enums, `MemberSummary`, errors). Contracts may import only `src/core/shared/enums.ts`. The slice that owns an entity owns its schema; other slices import that schema and never redefine it. dependency-cruiser enforces this.

### M5. Tally logging: write granularity, idempotency, and what "remove one" removes

- **Units:** *web Logging screen* vs *logging API*.
- **Clash:** The web agent batches taps and posts them on **Done**, which is effectively an offline queue (AD-14 forbids queued writes). The API agent built `POST` of one entry. A retry after "Couldn't save" double-inserts, because IDs are generated in core. Fix mode's "tap to remove one" sends `decrement(cell)`, and the API has to choose which row to delete. Undo sends a delete by id.
- **Proposed rule:**
  > Each tap is one request: `POST /entries` carrying a **client-generated UUIDv7** that serves as the idempotency key (this changes the IDs convention, which allows client IDs for set entries only). Undo deletes by that id. Fix mode calls `DELETE /entries/latest?member&setType&pass&rating`, which removes the newest matching row. Nothing is held client-side past a failed request.

### M6. Week boundaries computed in two languages

- **Units:** *progress* (SQL aggregation in D1/SQLite) vs *web* (chart labels in JS) vs *ai* ("trend direction").
- **Clash:** SQLite's `strftime('%W')` isn't the ISO week, and JS libraries differ. "Today" for a new session's default date and the 5-second undo window are computed with the device's time zone, not the team's. "Before → now since date": the boundary is not defined as inclusive or exclusive.
- **Proposed rule (AD-15):**
  > sessions stores `session_date` and a derived `iso_week` (`YYYY-Www`) computed in `core/shared/time.ts` at write time. All grouping uses `iso_week`. "Before" means `session_date < since`; "now" means `session_date >= since`. The default session date is "today in the team time zone", supplied by the API. Changing the team time zone doesn't rewrite stored dates.

### M7. Cross-team references inside one row

- **Units:** *logging* (writes `set_entries.team_id` from scope) vs *teams* and *sessions* (referenced ids).
- **Clash:** AD-4 checks the row's `team_id` but not that the `session_id`, `member_id` and `set_type_id` it references belong to the same team. A crafted request writes team-A entries pointing at a team-B member, and every cross-team test still passes.
- **Proposed rule (AD-4):**
  > Every team-owned table has a `UNIQUE(team_id, id)` constraint. Every reference is a composite FK `(team_id, x_id)`, so the database refuses mixed-team rows.

### M8. No slice dependency direction, so cycles follow

- **Units:** teams ↔ logging (set types and member guards), sessions ↔ ratings (participant guard, lock), notifications ↔ sessions.
- **Clash:** AD-2 allows using any slice's index, so agents create import cycles that break builds and unit-test isolation.
- **Proposed rule (AD-2):**
  > Declare a DAG, enforced by dependency-cruiser:
  > `shared ← teams ← sessions ← {logging, ratings} ← progress ← {ai, account, notifications}`
  >
  > A reverse need (for example, sessions asking logging to count entries) goes through a port the lower slice declares and the higher slice implements, wired in `composition.ts`.

### M9. Notifications trigger: who sends "rate today's sets", and when

- **Units:** *sessions* (create session plus Who played?) vs *logging* (first entry) vs *notifications*.
- **Clash:** One agent fires the push in `createSession`, before participants exist. Another fires it in `addParticipants`. A third fires it on the first logged entry. Players get duplicates or nothing. Unlinked members have no user to push to.
- **Proposed rule (AD-16):**
  > A push is sent once per `(session, participant)` when the participant is added, but only if the participant is linked. sessions publishes `ParticipantAdded` through a `DomainEvents` port after commit. notifications handles it in `ctx.waitUntil` and records `notified_at` in its own table to stay idempotent.

### M10. Export scope is deferred, but it's a divergence point

- **Units:** *account* (CSV) vs *logging* and *ratings* (data owners).
- **Clash:** Deferred hands "column layout" to the stories but also leaves scope open. One agent exports the setter's entries only. Another includes entries where the user is the hitter, which may include the setter's private pass-quality detail, so a hitter sees more than the grid row the permissions allow.
- **Proposed rule:**
  > Export = (a) set entries where the user's member is the setter, (b) the user's given hitter ratings, (c) set entries received, aggregated exactly as the hitter's own grid row. One file per team, built per `UserScope` membership through progress, logging and ratings index functions. Only the column layout stays deferred.

---

## Low

- **L1. AD-2's owner list is incomplete.** It doesn't name owners for `push_subscriptions` (notifications), `ai_messages`/`ai_usage` (ai), `user_consents` (account, per M2), team settings including time zone (teams), `notified_at` (notifications), or Better Auth tables (identity adapter). Add a full table → owner list.
- **L2. AD-15 and AD-16 lack an `[ADOPTED]` status marker.** Either mark them adopted or list them as open.
- **L3. Abuse on an open free plan.** Team sign-up and `GET /api/invites/:token/preview` are unauthenticated or cheap entry points, and a bot can burn the 100k daily requests or the D1 write budget. Add a decision: Cloudflare rate-limiting rule (free) or Turnstile on team creation.
- **L4. Operations are only partly decided.** Missing:
  - error monitoring and alerting (for example Workers Logs or Logpush, and who is told when free-plan limits hit);
  - secret rotation (`BETTER_AUTH_SECRET`, VAPID, Google client);
  - Time Travel restore runbook and backup export;
  - who can manually deploy or roll back (`wrangler rollback`).

  Record each as decided, deferred or an open question.

---

## Checklist

| Check | Result |
| --- | --- |
| Fixes the real divergence points and misses none | **Partial.** Single-slice concerns are well covered. Cross-slice reads (C1), writes (C4), visibility (C2), request scoping (C3) and entity lifecycles (H1–H8) are missed. |
| Every AD Rule is enforceable and prevents its divergence | **Mostly.** AD-1, AD-3 and AD-4 are checkable (dependency-cruiser and tests). AD-2 can be enforced but is unworkable as written (C1, C4). AD-5 fixes where policy lives, not what it says (C2). AD-7's "one transaction" can't be done under AD-2. AD-9's lock and AD-10's quota and consent are underspecified (H1, M1, M2). |
| Nothing under Deferred lets two units diverge | **Fails on two items.** "CSV export column layout" also defers scope (M10). The domain purchase is deferred, but it decides whether passkeys survive (H10). "Precomputed stats" is acceptable once C1 places all aggregation in progress. |
| Covers FR-1..FR-17 | **Mapped, but some mappings are wrong or thin.** FR-11 also needs sessions and logging (team-wide diary), see C2. FR-6 needs a lock owner (H1). FR-12 is leaky (H5). FR-13's scope is undefined (M10). FR-15 redemption edges are open (H7). FR-16 cross-team views have no scope type (C3). FR-17 has no role-flag ownership or last-manager concurrency rule (H8). FR-14 follows RFC-001 but quota and consent are vague (M1, M2). |
| Every dimension is decided, deferred or an open question | **No.** Missing: schema migration concurrency and preview data (H9), auth across environments and the domain (H10), client/API version skew (H11), rate limiting (L3), monitoring, alerting, secret rotation and rollback (L4). |

## Recommended order to close

C1 → C3 → C2 → C4 (these reshape AD-2, AD-4 and AD-5), then H4/H5/H6 (member and conversation keys, before any schema is written), then H9/H10 (before the first PR), then the rest.
