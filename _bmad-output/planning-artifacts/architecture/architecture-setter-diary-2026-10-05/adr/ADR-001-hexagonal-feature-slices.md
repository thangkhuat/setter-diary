# ADR-001: Hexagonal architecture organised by feature slices

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-1, AD-2 in `../architecture.md`

## Context

Setter Diary starts free on Cloudflare but must be able to move to paid plans, other AI providers or other hosts as it grows. It must also absorb future features (hitting and passing stats, coach role, video calibration) without rewrites. It is built mostly by one person plus AI agents, so the structure must be easy to navigate and hard to break.

## Options considered

- **Layered (MVC):** simple, but business logic calls the database and AI directly, so moving touches everything.
- **Framework-first:** fastest start, but framework and host assumptions spread through the app.
- **Feature slices alone:** readable, but nothing keeps vendor code out of the logic.
- **Hexagonal + feature slices:** chosen.

## Decision

Each feature slice has a pure core (model, use cases, policy, ports). Vendor code lives only in adapters. The delivery edges (Hono API, React PWA) hold no rules. Core never imports vendor packages, enforced by an import-boundary check in CI. Each table has one owning slice, and slices talk through public `index.ts` exports.

## Consequences

- Moving host, database or AI provider means swapping adapters, not rewriting features.
- New features arrive as new slices and tables.
- Slightly more structure up front (ports, a composition file).
