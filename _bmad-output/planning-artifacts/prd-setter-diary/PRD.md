---
id: PRD-setter-diary
companions:
  - data-dictionary.md
  - permissions-matrix.md
  - reporting-requirements.md
  - ../ux-designs/ux-setter-diary-2026-10-05/design-system.md
  - ../ux-designs/ux-setter-diary-2026-10-05/ux-specification.md
sources:
  - ../../../docs/product-brief.md
---

> **Canonical contract.** This PRD and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Setter Diary — Product Requirements Document (PRD)

## Problem Statement

Pain to solve. A volleyball setter on a mostly-beginner team has no reliable record of whether their sets are improving: without video, post-training memory is vague and "that felt better" is not evidence. On a beginner team, adapting to each hitter matters as much as raw consistency, so progress must be visible per set type and per hitter. Teammates should see the setter's progress and their own, which means the app holds teammates' data from day one.

## Functional Requirements

- **FR-1**
  - **Requirement:** Setters and teammates have accounts, log in, and see and do only what their permissions allow.
  - **Acceptance criteria:** Each role in `permissions-matrix.md` can log in; a user attempting an action or view outside their row is refused.
- **FR-2**
  - **Requirement:** A team's managers maintain its roster; roster members are the hitters selectable when logging. The roster holds no fixed position.
  - **Acceptance criteria:** Adding or removing a teammate changes the hitter options in FR-5; a removed teammate's history stays in the team's data.
- **FR-3**
  - **Requirement:** The set-type list is editable per team by its managers, seeded with high outside, back set, quick, shoot, pipe.
  - **Acceptance criteria:** A newly added set type is selectable in FR-5 and filterable in FR-7/FR-8.
- **FR-4**
  - **Requirement:** A setter's logged sets are grouped under a session carrying date, game or practice, notes, and the players involved, each with an optional position for that session (Outside, Setter, Opposite, Middle, Libero).
  - **Acceptance criteria:** Every logged set belongs to exactly one session and one setter, and only to a player involved in it; a player's position can differ between sessions.
- **FR-5**
  - **Requirement:** A setter logs their own set opportunities in a batch — after a game set, a drill, or a whole game — by recalling, per player, how many sets of each set type, pass quality and rating they gave (see `data-dictionary.md`).
  - **Acceptance criteria:** Each counted set is stored as an individual set; logging works at any of those points with no typing; one game set's sets are logged within 3 minutes on a phone.
- **FR-6**
  - **Requirement:** A hitter gives one overall 0–3 rating per session for the sets they received from a setter, judged by how comfortable the balls were to hit.
  - **Acceptance criteria:** The rating can be given as soon as the setter's session including that hitter exists; it is stored with its hitter, setter, and session, separate from the setter's per-set ratings; that setter sees each hitter's rating.
- **FR-7**
  - **Requirement:** A per-setter consistency trend shows weekly average rating and percentage of hittable sets (2 or 3), filterable by set type.
  - **Acceptance criteria:** Filtering to high outside answers "is this setter more consistent week over week?" from logged data (definition in `reporting-requirements.md`).
- **FR-8**
  - **Requirement:** A per-setter hitter × set-type grid shows average rating per combination and its change since a chosen date.
  - **Acceptance criteria:** Choosing a date renders each cell as before → now (e.g. back sets to a given hitter: 1.4 → 2.2 since August); a hitter viewing it sees only their own row.
- **FR-9**
  - **Requirement:** Each player has a personal dashboard showing their own progress and the progress of their team's setters.
  - **Acceptance criteria:** A logged-in hitter sees the quality of sets they received over time, each team setter's FR-7 trend, and their own FR-8 row — and no other hitter's data.
- **FR-10**
  - **Requirement:** A new team can sign up and gets its own roster, set types, sessions, and data.
  - **Acceptance criteria:** Two teams use the app at once and no member of one team can see or change the other team's data.
- **FR-11**
  - **Requirement:** A team manager can give any member a view of all the team's stats; no one outside the team can ever see them.
  - **Acceptance criteria:** A member granted team-wide view sees every setter's diary and every hitter's data for their team; a member without it, and anyone outside the team, is refused.
- **FR-12**
  - **Requirement:** A user can delete their account; the stats tied to them are anonymised and kept.
  - **Acceptance criteria:** After deletion the user cannot log in, and sets and ratings involving them remain in diaries and trends under an anonymous label with no name or contact details.
- **FR-13**
  - **Requirement:** A user can export their own data in a form they can open on their phone.
  - **Acceptance criteria:** Export produces a CSV of the user's own logged sets and ratings that opens in common phone spreadsheet apps.
- **FR-14**
  - **Requirement:** A setter can open a conversation with an AI that analyses their progress data and discusses how to improve.
  - **Acceptance criteria:** The AI opens by pointing to specific patterns in the setter's own data (e.g. weakest hitter × set-type combination, trend direction), and answers follow-up questions with suggestions tied to that data; the conversation is saved and only that setter can view it. The AI is Claude, opened from a Claude button, and runs on a Claude account the setter connects; without one, the feature is unavailable.
- **FR-15**
  - **Requirement:** A player joins a team through an invite link from one of its managers.
  - **Acceptance criteria:** Opening the link lets a new user create an account already on the team, or adds the team to an existing account; an expired or used link is refused.
- **FR-16**
  - **Requirement:** One account can belong to several teams, with a role per team, and switch between them.
  - **Acceptance criteria:** A user who is a setter in one team and a hitter in another sees the matching views in each, and no data crosses between the two teams.
- **FR-17**
  - **Requirement:** Each team has one or more team managers who administer it: roster, invites, set-type list, and team-wide view grants. Being a manager is separate from playing as setter or hitter.
  - **Acceptance criteria:** The team creator is its first manager; a manager can make another member a manager; a non-manager trying to change the roster, invites, set types, or grants is refused.

## Constraints & Non-Functional Requirements

- Rating is outcome-based: what the hitter could do with the ball, on the fixed 0–3 scale in `data-dictionary.md`. No "how it felt" scale for setters.
- Every set opportunity is logged; no fixed sample block (set chances vary, e.g. when the team runs two setters).
- Each setter logs only their own sets and, by default, sees only their own diary with their hitters, never another setter's.
- By default a hitter never sees another hitter's data; only a granted team-wide view (FR-11) widens this. Team data never crosses teams.
- Hitter rating entry is flexible in timing: feedback is given on the spot but often entered at the end of a game or practice.
- The AI (FR-14) uses only data the user is permitted to see; it never widens access.
- AI conversations are private to their owner; no one else can view them, including team-wide view holders.
- No user's data is sent to an AI provider before users are told and have consented; every user gives this consent at sign-up, since a setter's analysis includes teammates' ratings.
- AI runs on the setter's own connected Claude account: their plan sets limits and cost, and the app pays nothing for AI.
- A user's AI conversations are deleted with their account.
- Deleting an account anonymises the user's data rather than removing it.
- v1 users are in Australia; the product may extend worldwide.
- Hitter ratings are kept separate from setter ratings; neither overwrites the other.
- Data accuracy comes from design, not video; no v1 feature may depend on video.
- Phone-first: every v1 flow is designed for a phone screen first.
- Logging uses large tap targets and no typing.
- Views emphasise multi-week trends over single sessions.
- Access control is designed into v1, not retrofitted.

## Out of Scope

- AI discussion for hitters (comes later, alongside hitter quality logging).
- Hitting stats and passing stats (later version). Pass quality stays only as context on each logged set.
- In-app billing or paid subscription tiers.
- Pass-quality breakdown view and setter-vs-hitter comparison view (deferred; see `reporting-requirements.md`).
- Fixed player positions on the roster.
- Calibration sessions linked to video notes, and any video capture.
- Coach role.
- Offline logging: internet is always available at training.

## Success Metrics

- After several weeks of logging, a setter opens the app and sees, without consulting video or memory, whether their high sets to the outside became more consistent week over week, and how each set type to each hitter changed since a chosen date. Each teammate who logs in sees their own received-set quality and their team's setters' progress, and nothing about other hitters unless granted team-wide view.

## Assumptions

- Team manager is a permission on top of a member's playing role; a team can have several managers, and the creator is the first.
- A player can be both a setter and a hitter on the same team (e.g. two-setter systems).
- A hitter sees every team setter's trend and their own row of each setter's grid.
- Web vs native is left to architecture; phone-first and always-online are the only platform requirements.
- Sign-in is email and password for now; Google/Apple sign-in and the auth implementation are left to architecture. Sign-up asks for 18+, privacy-policy and AI-processing confirmation.
- How the Claude account is connected and its credentials stored securely is left to architecture.
- A hitter's session rating locks at their next session with that setter.

- The setter–hitter rating gap is captured in v1 but displayed only when the comparison view ships.
- Monthly filmed calibration is a user practice in v1; the app does not support it.
- "Week" in trend views means calendar week.
- All players are 18 or older; no minor-specific handling.
- Setters still own their sessions and logging; managers do not log sets unless they are also setters.
- A player who leaves a team loses access to that team's data.

## Open Questions

- Which privacy obligations apply in v1 (e.g. Australian Privacy Act 1988), and which must the design anticipate for worldwide expansion (e.g. GDPR)?
- Can a setter connect their own Claude account? As far as known, Claude Pro/Max plans can't be used by third-party apps; that would need an Anthropic API key billed per use, or the app paying. Confirm in architecture.
- Using the Claude name and mark in the app must follow Anthropic's brand and trademark guidelines; check before launch.
