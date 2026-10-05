# Data Dictionary

## Session

Groups one setter's logged sets. Fields: date, game or practice, notes, and the players involved, each with an optional position for this session (Outside, Setter, Opposite, Middle, Libero). The roster holds no fixed position; positions vary between sessions.

## Logged set

| Field | Values | Why it matters |
| --- | --- | --- |
| Hitter | A player involved in the session | Tracks how sets adapt to each hitter |
| Set type | High outside, back set, quick, shoot, pipe (editable list) | Tracks growth in variations |
| Pass quality | Good, OK, poor | A good set off a poor pass is a bigger win |
| Rating | 0–3 (scale below) | The core quality measure |

## Rating scale

Rated by what the hitter could do with the ball, not how the set felt:

| Rating | Meaning |
| --- | --- |
| 3 | Hitter took a full swing |
| 2 | Hitter could attack but had to adjust |
| 1 | Only a free ball or tip was possible |
| 0 | Unhittable, or a setting fault |

"Hittable" = rating 2 or 3.

## Hitter rating

A hitter gives one **rating mix** per session for the sets they received from that session's setter: for each rating 0–3 on the scale above, how often it happened — Never, Rarely, Sometimes or Mostly — judged by how comfortable the balls were to hit. At least one rating must be above Never. It can be given as soon as the session exists and locks at the hitter's next session with that setter. Stored separately from the setter's per-set ratings. Where a single number is needed, it is derived from the mix (frequency weights Never 0, Rarely 1, Sometimes 2, Mostly 3), never asked for.

## Accuracy practices

Accuracy comes from design choices, not video.

- **Outcome-based rating:** harder to fudge than "was it good?"
- **Hitter second opinion:** the difference between a hitter's rating mix and the setter's logged mix for sets to that hitter in the same session is its own signal.
- **Log soon after, by tally:** the setter logs in a batch after a game set, a drill, or the whole game. Per player, they choose the pass quality and tap a set type × rating cell once for each set they recall; each tap stores one individual set. Logging later means recalling more sets from memory.
- **Log every opportunity:** no fixed sample block; set chances vary too much (e.g. when the team runs two setters).
- **Monthly calibration:** film one session a month and compare against logged ratings (user practice in v1; video-linked calibration is deferred).
- **Trends over sessions:** single sessions are noisy; views emphasise multi-week trends.
