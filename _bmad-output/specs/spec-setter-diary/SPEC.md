---
id: SPEC-setter-diary
companions:
  - set-log-model.md
  - access-matrix.md
  - progress-views.md
sources:
  - ../../../docs/product-brief.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Setter Diary

## Why

Pain to solve. A volleyball setter on a mostly-beginner team has no reliable record of whether their sets are improving: without video, post-training memory is vague and "that felt better" is not evidence. On a beginner team, adapting to each hitter matters as much as raw consistency, so progress must be visible per set type and per hitter. Teammates should see the setter's progress and their own, which means the app holds teammates' data from day one.

## Capabilities

- **CAP-1**
  - **intent:** Setters and teammates have accounts, log in, and see and do only what their permissions allow.
  - **success:** Each role in `access-matrix.md` can log in; a user attempting an action or view outside their row is refused.
- **CAP-2**
  - **intent:** A team's setters maintain its roster; roster members are the hitters selectable when logging.
  - **success:** Adding or removing a teammate changes the hitter options in CAP-5; a removed teammate's history stays in the team's data.
- **CAP-3**
  - **intent:** The set-type list is editable per team, seeded with high outside, back set, quick, shoot, pipe.
  - **success:** A newly added set type is selectable in CAP-5 and filterable in CAP-7/CAP-8.
- **CAP-4**
  - **intent:** A setter's logged sets are grouped under a session carrying date, drill-or-match, and notes.
  - **success:** Every logged set belongs to exactly one session and one setter; a session shows its sets and metadata.
- **CAP-5**
  - **intent:** A setter logs their own set opportunities in a batch — after a game set, a drill, or a whole game — with one tap per field: hitter, set type, pass quality, rating (see `set-log-model.md`).
  - **success:** Logging works at any of those points with no typing; one game set's sets are logged within 3 minutes on a phone.
- **CAP-6**
  - **intent:** A hitter gives an overall 0–3 rating of the sets they received from a setter, judged by how comfortable the balls were to hit.
  - **success:** The rating is stored with its hitter, setter, and the period it covers, separate from the setter's per-set ratings; that setter sees each hitter's rating.
- **CAP-7**
  - **intent:** A per-setter consistency trend shows weekly average rating and percentage of hittable sets (2 or 3), filterable by set type.
  - **success:** Filtering to high outside answers "is this setter more consistent week over week?" from logged data (definition in `progress-views.md`).
- **CAP-8**
  - **intent:** A per-setter hitter × set-type grid shows average rating per combination and its change since a chosen date.
  - **success:** Choosing a date renders each cell as before → now (e.g. back sets to a given hitter: 1.4 → 2.2 since August); a hitter viewing it sees only their own row.
- **CAP-9**
  - **intent:** Each player has a personal dashboard showing their own progress and the progress of their team's setters.
  - **success:** A logged-in hitter sees the quality of sets they received over time, each team setter's CAP-7 trend, and their own CAP-8 row — and no other hitter's data.
- **CAP-10**
  - **intent:** A new team can sign up and gets its own roster, set types, sessions, and data.
  - **success:** Two teams use the app at once and no member of one team can see or change the other team's data.
- **CAP-11**
  - **intent:** A team member can be given a view of all their team's stats; no one outside the team can ever see them.
  - **success:** A member granted team-wide view sees every setter's diary and every hitter's data for their team; a member without it, and anyone outside the team, is refused.
- **CAP-12**
  - **intent:** A user can delete their account; the stats tied to them are anonymised and kept.
  - **success:** After deletion the user cannot log in, and sets and ratings involving them remain in diaries and trends under an anonymous label with no name or contact details.
- **CAP-13**
  - **intent:** A user can export their own data in a form they can open on their phone.
  - **success:** Export produces a CSV of the user's own logged sets and ratings that opens in common phone spreadsheet apps.
- **CAP-14**
  - **intent:** A setter can open a conversation with an AI that analyses their progress data and discusses how to improve.
  - **success:** The AI opens by pointing to specific patterns in the setter's own data (e.g. weakest hitter × set-type combination, trend direction), and answers follow-up questions with suggestions tied to that data; the conversation is saved and only that setter can view it. The AI runs on an AI account the setter connects; without one, the feature is unavailable.

## Constraints

- Rating is outcome-based: what the hitter could do with the ball, on the fixed 0–3 scale in `set-log-model.md`. No "how it felt" scale for setters.
- Every set opportunity is logged; no fixed sample block (set chances vary, e.g. when the team runs two setters).
- Each setter logs only their own sets and, by default, sees only their own diary with their hitters, never another setter's.
- By default a hitter never sees another hitter's data; only a granted team-wide view (CAP-11) widens this. Team data never crosses teams.
- Hitter rating entry is flexible in timing: feedback is given on the spot but often entered at the end of a game or practice.
- The AI (CAP-14) uses only data the user is permitted to see; it never widens access.
- AI conversations are private to their owner; no one else can view them, including team-wide view holders.
- No user's data is sent to an AI provider before users are told and have consented; every user gives this consent at sign-up, since a setter's analysis includes teammates' ratings.
- AI runs on the setter's own connected AI account: their provider's plan sets limits and cost, and the app pays nothing for AI.
- A user's AI conversations are deleted with their account.
- Deleting an account anonymises the user's data rather than removing it.
- v1 users are in Australia; the product may extend worldwide.
- Hitter ratings are kept separate from setter ratings; neither overwrites the other.
- Data accuracy comes from design, not video; no v1 feature may depend on video.
- Phone-first: every v1 flow is designed for a phone screen first.
- Logging uses large one-tap targets and no typing.
- Views emphasise multi-week trends over single sessions.
- Access control is designed into v1, not retrofitted.

## Non-goals

- Hitting stats and passing stats (later version). Pass quality stays only as context on each logged set.
- AI discussion for hitters (comes later, alongside hitter quality logging).
- In-app billing or paid subscription tiers.
- Pass-quality breakdown view and setter-vs-hitter comparison view (deferred; see `progress-views.md`).
- Calibration sessions linked to video notes, and any video capture.
- Coach role.
- Offline logging: internet is always available at training.

## Success signal

- After several weeks of logging, a setter opens the app and sees, without consulting video or memory, whether their high sets to the outside became more consistent week over week, and how each set type to each hitter changed since a chosen date. Each teammate who logs in sees their own received-set quality and their team's setters' progress, and nothing about other hitters unless granted team-wide view.

## Assumptions

- Any setter on a team can manage its roster and set-type list.
- A player can be both a setter and a hitter on the same team (e.g. two-setter systems).
- A hitter sees every team setter's trend and their own row of each setter's grid.
- Web vs native is left to architecture; phone-first and always-online are the only platform requirements.
- The setter–hitter rating gap is captured in v1 but displayed only when the comparison view ships.
- Monthly filmed calibration is a user practice in v1; the app does not support it.
- "Week" in trend views means calendar week.
- All players are 18 or older; no minor-specific handling.
- Team setters grant and revoke team-wide view.
- A player who leaves a team loses access to that team's data.
- Which AI providers can be connected, and how account credentials are stored securely, is left to architecture.

## Open Questions

- Hitter overall rating: what period does one rating cover, and how does the hitter reach it? (UX to settle, keeping timing flexible.)
- Which privacy obligations apply in v1 (e.g. Australian Privacy Act 1988), and which must the design anticipate for worldwide expansion (e.g. GDPR)?