# ADR-008: One table per stat type, keyed to session and member

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-8, AD-9 in `../architecture.md`

## Context

Hitting stats, passing stats and other measures are planned after v1.

## Options considered

- **One generic stats table with a type column and loose fields:** flexible, but weakly validated and awkward to query.
- **A dedicated table per stat type, owned by its feature slice:** chosen.

## Decision

v1 has `set_entries` (one row per counted set) and `hitter_session_ratings`. Every stat row references `team_id`, `session_id` and `member_id`. Future stat types add new slices and tables and never change existing ones.

## Consequences

- Each stat stays precise and type-checked.
- Cross-stat views (for example set quality vs hit outcome) are built only in the read-only `progress` slice, which joins stat tables through the shared session and member records using their declared public columns (AD-17).
