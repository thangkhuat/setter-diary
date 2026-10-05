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
  - **intent:** The setter and every teammate have an account, log in, and see and do only what their permissions allow.
  - **success:** Each role in `access-matrix.md` can log in; a user attempting an action or view outside their row is refused.
- **CAP-2**
  - **intent:** The setter maintains the team roster; roster members are the hitters selectable when logging.
  - **success:** Adding or removing a teammate changes the hitter options in CAP-5.
- **CAP-3**
  - **intent:** The set-type list is editable, seeded with high outside, back set, quick, shoot, pipe.
  - **success:** A newly added set type is selectable in CAP-5 and filterable in CAP-7/CAP-8.
- **CAP-4**
  - **intent:** Logged sets are grouped under a session carrying date, drill-or-match, and notes.
  - **success:** Every logged set belongs to exactly one session; a session shows its sets and metadata.
- **CAP-5**
  - **intent:** A set is logged courtside with one tap per field: hitter, set type, pass quality, rating (see `set-log-model.md`).
  - **success:** All four fields are captured through large tap targets with no typing, in a time that fits between drills (target pending — see Open Questions).
- **CAP-6**
  - **intent:** A hitter can rate a set they received on the same 0–3 scale, as a second opinion.
  - **success:** A hitter's rating is stored alongside, not in place of, the setter's rating for the same set; hitters can rate only sets logged to them.
- **CAP-7**
  - **intent:** A consistency trend shows weekly average rating and percentage of hittable sets (2 or 3), filterable by set type.
  - **success:** Filtering to high outside answers "is it more consistent week over week?" from logged data (definition in `progress-views.md`).
- **CAP-8**
  - **intent:** A hitter × set-type grid shows average rating per combination and its change since a chosen date.
  - **success:** Choosing a date renders each cell as before → now (e.g. back sets to a given hitter: 1.4 → 2.2 since August).
- **CAP-9**
  - **intent:** Each player has a personal dashboard showing their own progress and the setter's progress.
  - **success:** A teammate logged in sees the quality of sets they received over time plus the setter's CAP-7/CAP-8 views, within `access-matrix.md` limits.

## Constraints

- Rating is outcome-based: what the hitter could do with the ball, on the fixed 0–3 scale in `set-log-model.md`. No "how it felt" scale.
- Data accuracy comes from design, not video; no v1 feature may depend on video.
- Per-set entry fits courtside between drills: large one-tap targets, no typing.
- Setter and hitter ratings of the same set stay distinct; neither overwrites the other.
- Views emphasise multi-week trends over single sessions.
- Access control is designed into v1, not retrofitted.
- v1 data scope is one setter and one team.

## Non-goals

- Hitting stats for hitters (v1 tracks set quality only).
- Pass-quality breakdown view and setter-vs-hitter comparison view (deferred; see `progress-views.md`).
- Calibration sessions linked to video notes, and any video capture.
- Coach role.
- More than one setter or team.

## Success signal

- After several weeks of courtside logging, the setter opens the app and sees, without consulting video or memory, whether high sets to the outside became more consistent week over week, and how each set type to each hitter changed since a chosen date. Each teammate who logs in sees their own received-set quality and the setter's progress.

## Assumptions

- The 20-set sampling block and monthly filmed calibration are user practices in v1; the app neither enforces nor supports them.
- The setter–hitter rating gap is captured in v1 but displayed only when the comparison view ships.
- "Week" in trend views means calendar week.
- The setter manages the roster, set-type list, and sessions (the brief lists these in scope but does not name an owner).

## Open Questions

- Who logs during training: the setter or a teammate on the bench? If a teammate, they need permission to log on the setter's behalf.
- Phone-first web app or native mobile app?
- Should the setter see each hitter's individual ratings, or only averages?
- One team only, or can other teams sign up?
- Should hitting stats be added in a later version?
- Teammates can view the setter's progress: does the CAP-8 grid show every hitter's name and numbers to all teammates, or only the viewer's row?
- How does a hitter find sets they received to rate, and does rating close after some time window?
- What logging time per set makes CAP-5 testable (e.g. under N seconds)?
- Must logging work offline or on poor gym connectivity?
- Teammates' personal data: are any players minors, and what consent, data-export and account-deletion rules apply (e.g. GDPR)?
