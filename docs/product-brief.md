# Setter Diary – Product Brief

Oct 5, 2026 · @Thang

## Overview

Setter Diary is a shareable training log that shows a volleyball setter how their set quality grows over time, by set type and by hitter. It is built for setters on mostly-beginner teams, where adapting to each hitter matters as much as raw consistency.

The core problem: without video, a setter has no reliable record of whether their sets are improving. Memory after training is vague, and "that felt better" is not evidence.

## Users and sharing

Teams sign up on their own, and each team's data is kept separate. Every player on a team has an account and their own progress view. A team can have more than one setter (for example when running two setters); each setter who uses the app logs their own sets and has their own diary. A player can be both a setter and a hitter.

| User | Can log | Can view |
| --- | --- | --- |
| Setter | Their own sets, with full detail; roster and set-type list | Their own diary only: progress across their hitters and set types, including each hitter's rating. Never another setter's diary |
| Hitter (teammate) | Overall rating of the sets they received from a setter | Own progress, plus each team setter's progress (for now, the quality of sets they received; hitting stats are out of scope). Never other hitters' data |
| Member with team-wide view | As their role | All of their team's stats. Granted by the team's setters; only team members can have it |

Accounts, login and per-user permissions are in scope from the start. This is deliberate: the app holds teammates' data, so access control is part of the design, not an add-on.

**Your data:** any user can delete their account; their stats are anonymised and kept as useful data. A player who leaves a team stays in its history but loses access to its data. Any user can export their own data as a CSV file, which opens in spreadsheet apps on a phone. Users are in Australia for now, with worldwide use possible later.

## Core goals

1. Show whether high sets to the outside are becoming more consistent, week over week.
2. Show growth in setting variations: each set type, to each hitter.
3. Make logging fast enough to do right after a game set, drill or game: one game set's sets in under 3 minutes on a phone.
4. Make self-logged data trustworthy without needing video every session.
5. Let teammates see their setters' progress and track their own.

## What gets logged

Each logged set has four core fields, grouped under a session (date, drill or match, notes). Every set opportunity is logged.

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

Hitters give one overall rating of the sets they received, on the same 0–3 scale, based on how comfortable the balls were to hit. A hittable ball (2 or 3) is a good ball. Timing must stay flexible: feedback is given on the spot, but often entered at the end of a game or practice.

## Keeping the data accurate

Accuracy comes from design choices, not from video.

- **Outcome-based rating:** the 0–3 scale asks what the hitter could do, which is harder to fudge than "was it good?"
- **Hitter second opinion:** hitters rate the sets they received overall. The gap between a hitter's rating and the setter's average for that hitter is shown as its own signal.
- **Log soon after:** the setter logs with large one-tap buttons after a game set, a drill or the whole game. Logging sooner means less to recall from memory.
- **Log every opportunity:** no fixed sample block. Set chances vary too much, for example when the team runs two setters.
- **Monthly calibration:** film one session a month and compare against the logged ratings.
- **Trends over sessions:** views emphasise multi-week trends, since single sessions are noisy.

## Key views

- **Consistency trend:** average rating and percentage of hittable sets (2 or 3) per week, filterable by set type, per setter.
- **Hitter × set type grid:** average rating for every combination, with change since a chosen date (for example, "back sets to a given hitter: 1.4 → 2.2 since August"). A hitter sees only their own row.
- **Pass-quality breakdown:** how set quality holds up off good, OK and poor passes.
- **Setter vs hitter ratings:** where the two disagree, and by how much.
- **Personal dashboard per player:** each teammate sees their own progress and their team setters' progress.

## AI discussion

A setter can open a conversation with an AI that analyses their progress data and discusses how to improve. The AI opens by pointing to specific patterns in the setter's data, such as their weakest hitter and set type combination or the direction of a trend. It then answers follow-up questions with suggestions tied to that data.

- The AI only uses data the user is allowed to see.
- Conversations are saved, and only their owner can view them.
- Every user is told, and gives consent at sign-up, before any data is sent to an AI provider.
- Setters connect their own AI account. Their provider's plan sets the limits and cost; the app pays nothing for AI and has no billing.
- AI conversations are deleted along with the account.
- AI discussion for hitters comes later, alongside logging of hitters' own quality.

## Scope

**Version 1**

- Phone-first; internet is always available at training, so no offline mode
- Team sign-up, with multiple teams and data kept separate per team
- Accounts and login for setters and teammates
- More than one setter per team, each with their own diary
- Team roster and editable set-type list
- One-tap logging of sets (hitter, set type, pass quality, rating) after a game set, drill or game
- Hitters give an overall rating of the sets they received
- Consistency trend and hitter × set type grid
- Teammates can view their setters' progress
- Team-wide stats view, granted to team members
- Account deletion (stats anonymised and kept) and CSV export of your own data
- AI discussion for setters on how to improve, based on their own data

**Later**

- Pass-quality breakdown and setter-vs-hitter comparison views
- Hitting stats and passing stats
- Calibration sessions linked to video notes
- Coach role

## Open questions

- [x] Should hitters' own hitting stats be added in a later version? Yes, along with passing stats.
- [x] Who logs during training? Each setter logs their own sets.
- [x] Phone-first web app, or a native mobile app? Phone-first; web vs native decided in architecture.
- [x] Should the setter see each hitter's individual ratings, or only averages? Individual ratings.
- [x] Is the app for this one team only, or could other teams sign up? Multiple teams in v1.
- [x] Should a team be able to give any member a view of all team stats? Yes, in v1, and only team members can have it.
- [x] Can a player delete their account? Yes; their stats are anonymised and kept.
- [x] When a player leaves a team, does the team keep their history? Yes.
- [x] Can a user export their own data? Yes, as CSV.
- [x] Where are users based? Australia for now, possibly worldwide later.
- [ ] What period does a hitter's overall rating cover, and how do they reach it? To be settled in UX; timing must stay flexible.
- [ ] Which privacy rules apply in v1 (e.g. Australian Privacy Act 1988), and which must the design anticipate for worldwide use (e.g. GDPR)?
- [x] AI: setters only, or every player? Setters in v1; hitters later, with hitter quality logging.
- [x] AI: are conversations kept, and who can see them? Kept; only their owner can view them.
- [x] AI: does sending data to an AI provider need consent? Yes.
- [x] AI cost model: paid app subscription tiers, or each user connects their own AI account? Each setter connects their own.

## Next steps in BMad

1. Install BMad in a new project folder (Claude Code plugin, or `npx skills add bmad-code-org/BMAD-METHOD`), then ask the `bmad` skill to run `bmad setup`.
2. Save this brief into the project and run the product brief workflow to refine it.
3. Run the PRD workflow to turn the brief into requirements, resolving the open questions above.
4. Move on to architecture, then epics and stories, then the implementation loop.
