---
name: Setter Diary
description: Phone-first volleyball setter training log. Team colours, high-contrast logging, follows the device's light or dark setting.
status: final
updated: 2026-10-05
sources:
  - ../../../specs/spec-setter-diary/SPEC.md
colors:
  surface-base: '#FFFFFF'
  surface-raised: '#F2F4F8'
  ink-primary: '#0B0F1A'
  ink-secondary: '#5A6272'
  border: '#D9DDE5'
  brand-navy: '#14213D'
  brand-red: '#D62839'
  on-brand: '#FFFFFF'
  surface-base-dark: '#000000'
  surface-raised-dark: '#151A24'
  ink-primary-dark: '#F5F7FA'
  ink-secondary-dark: '#9AA3B2'
  border-dark: '#2A3140'
  brand-navy-dark: '#8FA8D9'
  brand-red-dark: '#FF4D5E'
  on-brand-dark: '#000000'
  rating-0: '#9AA1AC'
  rating-1: '#F5B700'
  rating-2: '#4DA3FF'
  rating-3: '#2BB673'
  on-rating: '#0B0F1A'
  error: '#D62839'
  error-dark: '#FF4D5E'
typography:
  display-number:
    fontFamily: 'system-ui, -apple-system, Roboto, sans-serif'
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.1
  title:
    fontFamily: 'system-ui, -apple-system, Roboto, sans-serif'
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
  label:
    fontFamily: 'system-ui, -apple-system, Roboto, sans-serif'
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: 'system-ui, -apple-system, Roboto, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
  meta:
    fontFamily: 'system-ui, -apple-system, Roboto, sans-serif'
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
rounded:
  sm: 8px
  md: 12px
  lg: 20px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  tap-min: 48px
  tap-log: 56px
components:
  fab-add:
    background: '{colors.brand-red}'
    foreground: '{colors.on-brand}'
    size: 64px
    rounded: '{rounded.full}'
  rating-button:
    height: '{spacing.tap-log}'
    rounded: '{rounded.md}'
    typography: '{typography.display-number}'
    foreground: '{colors.on-rating}'
  tally-cell:
    size: '{spacing.tap-log}'
    rounded: '{rounded.md}'
    background: '{colors.surface-raised}'
    typography: '{typography.display-number}'
    count-foreground: '{colors.ink-primary}'
  tally-column-header:
    height: 32px
    rounded: '{rounded.sm}'
    foreground: '{colors.on-rating}'
  set-type-row-label:
    typography: '{typography.label}'
    foreground: '{colors.brand-navy}'
  position-chip:
    height: '{spacing.tap-min}'
    rounded: '{rounded.full}'
    border: '{colors.brand-navy}'
    selected-background: '{colors.brand-navy}'
    selected-foreground: '{colors.on-brand}'
  claude-button:
    size: 52px
    rounded: '{rounded.full}'
    background: '{colors.surface-raised}'
    border: '{colors.border}'
  chat-bubble-claude:
    background: '{colors.surface-raised}'
    rounded: '{rounded.md}'
    typography: '{typography.body}'
  chat-bubble-user:
    background: '{colors.brand-navy}'
    foreground: '{colors.on-brand}'
    rounded: '{rounded.md}'
  pass-chip:
    height: '{spacing.tap-log}'
    rounded: '{rounded.sm}'
    background: '{colors.surface-raised}'
    selected-border: '{colors.ink-primary}'
  player-tab:
    height: '{spacing.tap-log}'
    rounded: '{rounded.full}'
    selected-background: '{colors.brand-navy}'
  sheet:
    background: '{colors.surface-base}'
    rounded: '{rounded.lg}'
  card:
    background: '{colors.surface-raised}'
    rounded: '{rounded.md}'
  button-primary:
    background: '{colors.brand-red}'
    foreground: '{colors.on-brand}'
    height: '{spacing.tap-min}'
    rounded: '{rounded.md}'
---

## Brand & Style

Setter Diary is a team tool used in a gym, with sweaty hands, in the minutes after a game. It should feel like the team's own kit: navy, red and white, bold and direct. Every screen is built for instant recognition: big numerals, few words, one obvious next action. Touch feels immediate; nothing waits on an animation.

**Logo.** [ASSUMPTION] Designed separately. Requirements: unique and memorable enough to invite a tap right after a session; uses navy, red and white; legible at home-screen icon size; works on both light and dark backgrounds.

## Colors

- **Background (`surface-base`)** follows the device: white in light mode, true black (`#000000`) in dark mode. No in-app theme override in v1.
- **Navy (`brand-navy`)** is the structural colour: headers, selected tabs, set-type row labels, selected position chips. Lightened in dark mode for contrast against black.
- **Red (`brand-red`)** is reserved for the primary action (the `+` button, primary buttons) and the brand. Never used for ratings or decoration.
- **Rating scale** [ASSUMPTION]: 0 grey, 1 amber, 2 sky blue, 3 green, all with dark numerals (`on-rating`). The same four colours appear everywhere a rating appears: tally headers, rating buttons, session-card bars, progress-grid cells and trend columns. They mean only the rating; no other feature uses them.
- **Error** shares the brand red, always paired with text.
- **Contrast:** all text and numerals meet WCAG AA (4.5:1) against their fill in both modes; ratings always use dark numerals on the four rating colours.

Each logging element has its own visual treatment so they never blur together: set types are navy row labels, pass quality is neutral square chips, ratings are the four coloured column headers, and counts sit in neutral cells.

## Typography

[ASSUMPTION] System UI font on every platform: fast to load, familiar, legible. Heavy weights carry the hierarchy: `display-number` for ratings and key stats, `label` for chips and tabs, `body` for prose, `meta` for dates and counts. Stats use tabular numerals so columns line up. Respects the device text-size setting.

## Layout & Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32 px. Single column, 16px side margins. The tally grid fills the lower part of the logging screen, within thumb reach; the pass selector sits directly above it. Minimum tap target is 48px everywhere and 56px on the logging screen.

## Elevation & Depth

Flat. Cards sit on `surface-raised`, separated from the background by tone, not shadow. The only shadowed elements are the `+` button and bottom sheets, which float above content.

## Shapes

Pills (`rounded.full`) for position chips, player tabs and the `+` button. `rounded.md` for rating blocks and cards. `rounded.sm` for pass-quality chips, so their shape differs from the pill-shaped chips at a glance. Sheets use `rounded.lg` top corners.

## Components

→ Visual reference: `mockups/screens.html`. DESIGN.md wins on any conflict with the mock.

- **`+` button (`fab-add`)**: red circle, white plus, bottom-right. Opens a pop-up sheet to add a player or create a session.
- **Sheet**: pop-up form sliding up from the bottom; title, large fields, red primary button at the bottom.
- **Player tab**: pill per involved player in a horizontal strip; selected tab is filled navy with the player's set count.
- **Tally grid**: set types as navy row labels on the left; four rating columns headed by the rating colours with the numeral only (captions live on the hitter rating sheet and in screen-reader labels); each cell a 56px neutral square showing the count in `display-number` (empty cells show a faint "+"). In Fix mode, cells get a "−" badge.
- **Pass chip**: square-cornered neutral chip with label (Good / OK / Poor); selected gets a heavy ink border.
- **Position chip**: 48px navy outline pill with the standard abbreviation (OH / S / OPP / MB / L) under a selected player on the Who played? sheet; selected fills navy.
- **Rating button** (hitter rating sheet): four equal coloured blocks in one row, numeral centred in `display-number`, one-word caption underneath in `meta`: 3 Full swing, 2 Adjust, 1 Free ball, 0 Unhittable [ASSUMPTION on captions].
- **Session card**: header with date, Game or Practice, total sets; one row per involved player with name, set count, average as a bold numeral, and a stacked bar of the four rating colours.
- **Progress grid**: hitters as rows, set types as columns; each cell filled with the rating colour nearest its average, average numeral inside, and "before → now" since the chosen date underneath in `meta`.
- **Trend chart**: one column per week, height = average rating, coloured by the nearest rating colour; % hittable as an `ink-primary` line on top (navy-dark is too close to the rating blue in dark mode); set-type filter chips above, styled like position chips.
- **"To rate" card**: `card` with a 6px brand-red left edge, team name and session in `meta`, setter and date in `label`.
- **Manager tag**: small outline pill "Manager" in `meta`, beside the member's role on the roster.
- **Fix toggle**: outline pill above the tally grid; when on, fills ink with "Fix: tap to remove".
- **Toast**: ink bar above the bottom edge, message left, "Undo" right in bold underlined text (rating colours stay reserved for ratings).
- **Claude button**: 52px round button, `surface-raised` with a hairline border, showing the Claude mark; sits bottom-right on Progress. Neutral on purpose: red stays the primary action. Use of the Claude name and mark follows Anthropic's brand guidelines; the mock uses a placeholder glyph.
- **Chat bubble**: Claude messages on `surface-raised`, left-aligned; the setter's messages navy with `on-brand` text, right-aligned. Numbers Claude cites (ratings) keep their rating colour chips.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Show the numeral on every rating colour | Rely on colour alone to convey a rating |
| Keep red for the primary action and the brand | Use red for a low rating or decoration |
| Keep logging controls at least 56px tall | Shrink controls to fit more on screen |
| Follow the device light/dark setting | Use mid-grey backgrounds that wash out in a bright gym |
| Use the same rating colours on every screen | Introduce a second colour scale for anything else |
