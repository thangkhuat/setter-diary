# ADR-006: Team-scoped data and server-side policy

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-4, AD-5 in `../architecture.md`

## Context

Many teams share one D1 database, which has no row-level security. Permissions combine playing roles, team manager and team-wide view, and new roles (for example coach) are planned.

## Decision

Every team-owned table carries `team_id`. Repository ports require a `TeamScope`, so an unscoped query cannot be written. Each slice has one `policy.ts` that decides every action from independent membership flags (`isSetter`, `isHitter`, `isManager`, `hasTeamView`), deny by default. Every slice tests a cross-team read and write and expects both to fail.

## Consequences

- Isolation is structural, not something remembered per query.
- New roles are new flags plus policy entries.
