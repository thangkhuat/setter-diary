# ADR-003: React + Vite SPA, Hono API Worker, D1 with Drizzle

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-3 and the Stack table in `../architecture.md`

## Context

The app must run on the Workers Free plan (10 ms CPU per request), stay portable (ADR-001), and be easy for AI agents and developers to work on.

## Options considered

- **Server-rendered frameworks (React Router framework mode, TanStack Start):** spend CPU on every page. Server rendering mainly helps public, searchable sites, and this app is private.
- **SvelteKit:** smaller ecosystem for agents and developers.
- **React + Vite SPA with a Hono API:** chosen, starting from Cloudflare's official `vite-react-template`.

## Decision

React 19 + Vite 8 PWA; Hono 4 API Worker; Cloudflare D1 through Drizzle ORM (standard SQL, Postgres-capable); Zod schemas shared between web and API; Vitest 4.x; TypeScript 6.0.3 throughout (TypeScript 7 removes the compiler API that dependency-cruiser and typescript-eslint rely on); Node 24 LTS. Versions are pinned in `../architecture.md`.

## Consequences

- Screen loads never invoke the Worker, so they cost nothing; API requests are light.
- Hono and Drizzle are new to the owner; both are widely documented.
- Vitest stays on 4.x until the Cloudflare Workers test pool supports 5.x.
