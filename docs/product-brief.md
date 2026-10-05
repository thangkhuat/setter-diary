# Setter Diary – Product Brief

Oct 5, 2026 · @Thang

## Overview

Setter Diary is a shareable training log that shows a volleyball setter how their set quality grows over time, by set type and by hitter. It is built for a setter on a mostly-beginner team, where adapting to each hitter matters as much as raw consistency.

The core problem: without video, a setter has no reliable record of whether their sets are improving. Memory after training is vague, and "that felt better" is not evidence.

## Users and sharing

Every player on the team has an account and their own progress view, and everyone can view the setter's progress.

| User | Can log | Can view |
| --- | --- | --- |
| Setter (primary user) | Every set, with full detail | Own progress across all hitters and set types |
| Hitter (teammate) | Optional rating on sets they received | Own progress, plus the setter's progress (for now, the quality of sets they received; hitting stats are out of scope) |

Accounts, login and per-user permissions are in scope from the start. This is deliberate: the app holds teammates' data, so access control is part of the design, not an add-on.

## Core goals

1. Show whether high sets to the outside are becoming more consistent, week over week.
2. Show growth in setting variations: each set type, to each hitter.
3. Make logging fast enough to do courtside between drills.
4. Make self-logged data trustworthy without needing video every session.
5. Let teammates see the setter's progress and track their own.

## What gets logged

Each logged set has four core fields, grouped under a session (date, drill or match, notes).

| Field | Values | Why it matters |
| --- | --- | --- |
| Hitter | A teammate on the roster | Tracks how sets adapt to each hitter |
| Set type | High outside, back set, quick, shoot, pipe (editable list) | Tracks growth in variations |
| Pass quality | Good, OK, poor | A good set off a poor pass is a bigger win |
| Rating | 0 to 3 (scale below) | The core quality measure |

The rating is based on what the hitter could do with the ball, not how the set felt:

- **3**: hitter took a full swing
- **2**: hitter could attack but had to adjust
- **1**: only a free ball or tip was possible
- **0**: unhittable, or a setting fault

## Keeping the data accurate

Accuracy comes from design choices, not from video.

- **Outcome-based rating:** the 0–3 scale asks what the hitter could do, which is harder to fudge than "was it good?"
- **Hitter second opinion:** hitters can rate sets they received. The gap between setter and hitter ratings is shown as its own signal.
- **Log in the moment:** large one-tap buttons for courtside entry between drills, or by a teammate on the bench.
- **Sample, don't log everything:** for example, one 20-set block per session, done the same way each time.
- **Monthly calibration:** film one session a month and compare against the logged ratings.
- **Trends over sessions:** views emphasise multi-week trends, since single sessions are noisy.

## Key views

- **Consistency trend:** average rating and percentage of hittable sets (2 or 3) per week, filterable by set type.
- **Hitter × set type grid:** average rating for every combination, with change since a chosen date (for example, "back sets to a given hitter: 1.4 → 2.2 since August").
- **Pass-quality breakdown:** how set quality holds up off good, OK and poor passes.
- **Setter vs hitter ratings:** where the two disagree, and by how much.
- **Personal dashboard per player:** each teammate sees their own progress and the setter's.

## Scope

**Version 1**

- Accounts and login for the setter and teammates
- Team roster and editable set-type list
- Courtside one-tap logging of sets (hitter, set type, pass quality, rating)
- Hitters can rate sets they received
- Consistency trend and hitter × set type grid
- Teammates can view the setter's progress

**Later**

- Pass-quality breakdown and setter-vs-hitter comparison views
- Calibration sessions linked to video notes
- Coach role
- Support for more than one setter or team

## Open questions

- [ ] Should hitters' own hitting stats be added in a later version? (v1 tracks set quality only.)
- [ ] Who logs during training: the setter, or a teammate on the bench?
- [ ] Phone-first web app, or a native mobile app?
- [ ] Should the setter see each hitter's individual ratings, or only averages?
- [ ] Is the app for this one team only, or could other teams sign up?

## Next steps in BMad

1. Install BMad in a new project folder (Claude Code plugin, or `npx skills add bmad-code-org/BMAD-METHOD`), then ask the `bmad` skill to run `bmad setup`.
2. Save this brief into the project and run the product brief workflow to refine it.
3. Run the PRD workflow to turn the brief into requirements, resolving the open questions above.
4. Move on to architecture, then epics and stories, then the implementation loop.
