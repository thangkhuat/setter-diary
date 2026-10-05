---
name: Setter Diary
status: final
updated: 2026-10-05
sources:
  - ../../prd-setter-diary/PRD.md
design: design-system.md
---

# Setter Diary — UX Specification

## Foundation

Phone-first, single surface. Web vs native is an architecture decision; this document is platform-neutral. No UI system named. `design-system.md` is the visual identity reference. Light or dark follows the device setting. Always online (spec); no offline states.

Usage context: indoor gym, sweaty hands, morning or noon sessions. A game runs about 45 minutes (2–3 sets, no breaks); practice drills have no breaks, but game-play within practice has short breaks. The app is mostly opened **at the end of the session**, so the core job is fast recall-and-log in a few minutes, not live scoring.

## Information Architecture

| Surface | Reached from | Who | Purpose |
|---|---|---|---|
| Log in | App open when logged out | All | **Continue with Google** or **Use a passkey**; no passwords. "Lost access? Ask your team manager to resend your invite." Users stay logged in |
| Create account | "Create an account" link, or an invite link | All | Continue with Google or create a passkey, then display name; required checkboxes: 18+ and privacy policy, and AI processing. From an invite, shows the team and pre-fills the name. iPhone users then see an Add-to-Home-Screen tip |
| Welcome (no team) | After sign-up without an invite | All | Create a team, or join with an invite link |
| Sessions | Tab (setter home) | Setter | Session cards, newest first; each card shows every involved player's logs for that session; `+` creates a session |
| New session sheet | `+` on Sessions | Setter | Date (default today), Game or Practice, notes (optional) |
| Who played? sheet | After New session | Setter | Multi-select roster players in this session, with an optional position for each (this session only) |
| Logging | New session, or tapping a session card | Setter | Log sets per player (FR-5) |
| Progress | Tab | Setter | Consistency trend (FR-7) and hitter × set-type grid (FR-8); Ask AI button bottom-right |
| AI discussion | Ask AI button on Progress | Setter | AI discussion about the setter's own data (FR-14); past discussions; daily-limit states |
| Team | Tab | All | Roster with each member's role and a Manager tag. Team managers add players with `+`, edit set types, grant team-wide view, and make others managers; everyone else sees it read-only |
| Member sheet | Tap a roster row (managers only) | Team manager | Setter, Hitter and Team manager toggles; remove from team. (Team view is also switchable inline on the roster.) |
| Add player sheet | `+` on Team | Team manager | Name only (positions vary between sessions); produces invite link |
| Set types | Team tab section | Team manager | Edit the team's set-type list (FR-3); `+` adds a type |
| Home | Tab (hitter home) | Hitter | "To rate" cards + own received-set progress (FR-9) |
| Rate session sheet | "To rate" card or notification | Hitter | One rating mix for the session's sets from that setter: for each rating 0–3, Never / Rarely / Sometimes / Mostly (FR-6) |
| Setters | Tab | Hitter | Each team setter's trend + the hitter's own grid row |
| Team stats | Team tab, if granted | Team-wide view holders | All setters' diaries and all hitters' data (FR-11) |
| Settings | Profile button in header | All | Export CSV; delete account; join another team via invite |
| Leave team | Team switcher | All | Confirm sheet: "Leave <team>? Your stats stay with the team, and you lose access." Refused for the last manager. |

→ Visual reference: `mockups/screens.html` (all 18 v1 screens). These documents win on any conflict with the mock.

**Navigation.** [ASSUMPTION] Bottom tabs:

- **Setter:** Sessions / Progress / Team.
- **Hitter:** Home / Setters / Team.
- **Both roles:** setter tabs plus Home.
- **Multiple teams:** one account can belong to several teams, and data never mixes between them. The team name in the header is the team switcher (tap → list of your teams). Roles are per team, so the tabs follow your role in the current team (for example, setter in one team, hitter in another).
- **Sheets** stack one level deep, never two.

## Voice and Tone

Microcopy. Brand posture lives in `design-system.md`.

| Do | Don't |
|---|---|
| "Logged." / "12 sets logged for Mia." | "Great job! Your set was successfully saved!" |
| "Rate today's sets from Thang." | "Don't forget to leave feedback!!" |
| "Not enough data yet — log 2 more weeks to see a trend." | Empty charts with no explanation |
| Volleyball words the team already uses (back set, pipe, free ball) | Invented jargon |
| Short labels, one action per button ("Done", "Add player") | Multi-sentence buttons, exclamation marks |

## Component Patterns

Behavioral. Visual specs live in `design-system.md` (Components).

| Component | Use | Behavioral rules |
|---|---|---|
| `+` button | Sessions, Team | Opens the matching sheet. Same pattern everywhere something is added. |
| Sheet | Add player, new session, rate session | Opens from the bottom; large fields; primary button bottom; swipe down or Cancel closes without saving. |
| Player tabs | Logging | One tab per involved player, showing set count. Tap switches player; entries stay with their player. |
| Pass chips | Logging | Good / OK / Poor, single select, sticky per player. Applies to every tally tap until changed. |
| Tally grid | Logging | Rows = the team's set types; columns = ratings 0–3. Each cell shows how many sets this player got for that set type and rating, under the selected pass. **Tapping a cell adds one set** (player, set type, pass, rating). Haptic tick + toast "Mia · High outside · 3 · +1" with Undo (5 s). Built for recalling counts after a game rather than replaying each set. |
| Selected-cell bar | Logging, saved session in Fix | Tapping a grid cell adds one set and selects that cell. A bar at the bottom shows the selected cell ("Mia · High outside · Good · 3"), its count and 56px "−" and "+" buttons; "−" removes the newest matching set and is disabled at 0. The bar follows whichever cell was tapped last; no modes. |
| Position chips | Who played? sheet | For each selected player: OH / S / OPP / MB / L (Outside, Setter, Opposite, Middle, Libero), optional, pre-filled from that player's previous session. Saved with this session only. |
| Frequency chips | Rate session sheet | One row per rating 0–3 (numeral, colour and caption), each with Never / Rarely / Sometimes / Mostly, single select per row, default Never. Save rating is enabled once at least one row is above Never. |
| Saved session view | Session card header or player row | Saved sessions open read-only (protects against accidental taps). **Fix** unlocks the same behaviour as initial logging: tap adds and selects, the selected-cell bar adjusts. Done or leaving locks again. Wrong pass, set type or rating is corrected with − on one cell and a tap or + on another. |
| Session card | Sessions | Header: date, Game or Practice, total sets. One row per involved player: name, set count, average, rating-mix bar. Tap a player row or the header → the saved session, read-only until Fix. |
| Manager tag | Team roster | Small tag "Manager" next to the member's role. |
| "To rate" card | Hitter Home | One per unrated session from each setter; tap opens Rate session sheet. |
| Progress grid | Progress, Setters, Team stats | Hitter × set-type averages for one setter. Hitter sees only their own row (PRD). Date picker sets the "since" comparison; each cell shows before → now. |
| Trend chart | Progress, Setters, Team stats | Weekly average rating and % hittable for one setter; set-type filter chips above it (default: all types). |
| Ask AI button | Progress (setters only) | Small round button with a sparkle icon, bottom-right. Tap opens the AI discussion. Not shown to hitters. |
| AI discussion | Full screen from Ask AI button | The AI opens with 2–3 observations drawn from the setter's data (for example, lowest hitter × set-type cell, trend direction), then the setter types replies. "Past discussions" lists saved conversations, private to the setter. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| No team | Welcome | Choose: create a team or join with an invite link. |
| Sign-in failed or cancelled | Log in | "Sign-in didn't finish. Try again." Both sign-in buttons stay available. |
| Lost access | Log in | "Ask your team manager to resend your invite." The manager issues a recovery invite from the member sheet. |
| Invite link expired or used | Create account, join | "This invite has expired. Ask your team manager for a new one." |
| Empty roster | Team, New session | "Add your teammates to start logging." `+` highlighted. |
| No sessions | Sessions | "After your next game or practice, tap + to log it." |
| No players selected | Who played? sheet | Continue disabled until at least one player is selected. |
| Undo window | Logging | Toast with Undo for 5 s after each tally tap. |
| Saved session locked | Saved session view | Counts read-only; only Fix unlocks editing. |
| Zero count | Selected-cell bar | "−" is disabled at 0; no negative counts. |
| Thin data | Progress, Setters, Home | Show what exists; trend line needs 2+ weeks [ASSUMPTION]: "Not enough data yet — log 2 more weeks to see a trend." |
| Rating closed | Rate session sheet | Locks per the close rule in Hitter Rating; the card disappears. |
| To rate across teams | Home | "To rate" cards from all your teams, each labelled with its team name [ASSUMPTION]; tapping one switches to that team. |
| No team-wide view | Team | Team stats entry hidden, not shown disabled. |
| Not a team manager | Team | Roster and set types read-only: no `+`, no Team view switches, no + Add on set types. |
| Last manager | Member sheet | The only manager can't remove their own manager role or leave until another member is made manager. |
| Network error | Any save | "Couldn't save — check your connection." Entry kept on screen to retry. |
| Account deletion | Settings | Confirm sheet stating: stats stay with the team, anonymised; your AI discussions are deleted, and your name is removed from other people's saved discussions. |
| Daily limit (you) | AI discussion | "You've used today's 2 AI discussions. Back tomorrow." Past discussions stay readable. |
| AI thinking | AI discussion | Typing indicator; the setter can leave and come back, the reply is saved. |
| Daily limit (app) or AI error | AI discussion | "AI is resting for today. Try again tomorrow." Also used when a discussion reaches its follow-up cap ("Start a new discussion tomorrow"). History stays visible. |

## Interaction Primitives

- Tap to act. Every core action is reachable by tapping; no gesture is the only way to do anything.
- Swipe down closes a sheet. Swipe-to-delete on entries is allowed, always with Undo.
- Haptic feedback on each logged entry where the platform supports it.
- **Banned:** long-press-only actions, drag-to-reorder, small icon-only buttons on the logging screen, timers or countdowns.

## Accessibility Floor

Behavioral. Visual contrast lives in `design-system.md`.

- Ratings always show the numeral; colour is never the only cue. Pass and position chips carry text labels.
- Tap targets ≥ 56px on Logging, ≥ 48px elsewhere.
- Screen readers: every control labelled with role and state ("Mia, high outside, rating 3, 5 sets, add one"; "Pass good, selected").
- Respects device text size; logging controls must stay usable at the largest size; the tally grid scrolls vertically rather than shrinking cells.
- Reduce Motion: no sheet slide or toast fade; show instantly.

## Hitter Rating

Resolves the PRD's open question on hitter rating period and flow.

- **Period:** one rating mix **per session, per setter**: for each rating 0–3, how often it happened (Never, Rarely, Sometimes, Mostly).
- **When:** available as soon as the setter creates the session with that hitter included, so the hitter can rate right after the game, which is when reflection happens. Feedback during play stays verbal.
- **How the hitter gets there:** a "To rate" card on Home, plus a notification if the platform supports it [ASSUMPTION].
- **Closes:** at the hitter's next session with that setter [ASSUMPTION].
- **Prompt wording:** "How were Thang's sets to hit today?" with one frequency row per rating, from 3 Full swing down to 0 Unhittable.

## Key Flows

### Flow 1 — Log a Saturday game (Thang, setter, noon, on the bench after the game)

1. Thang taps the Setter Diary icon.
2. Sessions opens; Thang taps `+`.
3. New session sheet: today's date is pre-filled; Thang taps **Game**, then **Next**.
4. Who played? sheet: Thang taps Mia, Josh and Leo. Mia played outside last time; today Thang switches Mia to **Opposite**, then taps **Start logging**.
5. Logging opens on Mia's tab with **Good** pass selected. Recalling "about five clean high balls to Mia", Thang taps the High outside × 3 cell five times, then High outside × 2 twice.
6. Thang switches pass to **Poor**, taps Back set × 1 once, then works through Josh's and Leo's tabs the same way; tab counts climb.
7. Thang taps **Done**; Sessions opens with today's card on top.
8. **Climax:** the session card lists every player Thang logged: Mia 14 sets, average 2.4, a mostly green bar; Josh 9 sets, 1.8; Leo 6 sets, 2.2. Thang sees how each hitter's sets went today and can tap any row to check the entries.

Failure: a mis-tap → Undo on the toast, or "−" in the selected-cell bar.

### Flow 2 — Rate the setter after the game (Mia, outside hitter, same noon)

1. Mia gets a notification, "Rate today's sets from Thang.", or opens the app and sees the "To rate" card on Home.
2. Mia taps it; the Rate session sheet opens.
3. Mia sets **2 · Adjust** to Mostly, **3 · Full swing** to Sometimes and **1 · Free ball** to Rarely, then taps **Save rating**.
4. **Climax:** "Thanks — rating saved." Home now shows the quality of the sets Mia received this month, trending up.

Edge: Thang hasn't created the session yet → no card yet; it appears once the session exists.

### Flow 3 — Weekly progress check (Thang, Sunday morning)

1. Thang opens **Progress**, filters the trend to High outside: hittable sets rising three weeks in a row.
2. On the grid, Thang sets "since" to 1 August.
3. Back sets to Mia read 1.4 → 2.2; back sets to Josh are still the lowest cell at 1.3.
4. Thang taps the **Ask AI** button. The AI opens: "Back sets to Josh are your lowest combination (1.3), and most came off OK or poor passes."
5. Thang asks how to work on it; the AI answers using Thang's data.
6. **Climax:** Thang leaves with one concrete focus for Tuesday's practice, saved under Past discussions.

Thin data: fewer than 2 weeks logged → trend shows "Not enough data yet". Daily limit used → the Ask AI button opens the limit message.

### Flow 4 — Add a new teammate (Thang, team manager, before practice)

1. Team tab, tap `+`.
2. Add player sheet: name "Sam".
3. **Add player** saves Sam to the roster and shows an invite link to share.
4. **Climax:** Sam opens the link, creates an account, and lands on Home already on the team.

Edge: Sam already plays for another team → the link adds this team to Sam's existing account; the header switcher now lists both.

### Flow 5 — Start a new team (Thang, opening the app for the first time)

1. Thang signs up.
2. No team yet: Thang taps **Create a team** and names it, becoming its first team manager.
3. The team starts with the default set types (high outside, back set, quick, shoot, pipe) and an empty roster.
4. **Climax:** on the Team tab, Thang adds the first teammates with `+` and shares their invite links, ready for Saturday's game.

## PRD Feedback

All items raised here were absorbed into the PRD on 2026-10-05 (FR-4, FR-6, FR-14, FR-15, FR-16). Later changes from the architecture step:

- RFC-001 (accepted): free AI via Cloudflare with an Ask AI button and daily limits; Google or passkey sign-in; manager-set setter and hitter roles.
