# Set Log Model

## Session

Groups one setter's logged sets. Fields: date, drill or match, notes.

## Logged set

| Field | Values | Why it matters |
| --- | --- | --- |
| Hitter | A teammate on the roster | Tracks how sets adapt to each hitter |
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

A hitter gives one overall rating of the sets they received from a setter over a period (period set by UX), stored separately from the setter's per-set ratings. Same 0–3 scale, judged by how comfortable the balls were to hit; hittable (2–3) = a good ball.

## Accuracy practices

Accuracy comes from design choices, not video.

- **Outcome-based rating:** harder to fudge than "was it good?"
- **Hitter second opinion:** the gap between a hitter's overall rating and the setter's average for sets to that hitter is its own signal.
- **Log soon after:** the setter logs in a batch after a game set, a drill, or the whole game, using large one-tap buttons. Logging later means recalling more sets from memory.
- **Log every opportunity:** no fixed sample block; set chances vary too much (e.g. when the team runs two setters).
- **Monthly calibration:** film one session a month and compare against logged ratings (user practice in v1; video-linked calibration is deferred).
- **Trends over sessions:** single sessions are noisy; views emphasise multi-week trends.
