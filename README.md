# setter-diary

## Running the app

You need Node 24 (the version in `.nvmrc`).

```sh
npm ci
npm run dev          # app and API at http://localhost:5173, with a local D1
```

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests (core) and Workers-runtime tests (API and adapters) |
| `npm run typecheck` / `npm run lint` | Type-check and lint |
| `npm run boundaries` | Checks the architecture's import rules with dependency-cruiser |
| `npm run boundaries:fixture` | Proves that check fails on a deliberately broken file |
| `npm run journal:check` | Checks the migration journal is linear against `origin/main` |
| `npm run db:generate` | Writes a migration from the Drizzle schema (on a branch rebased onto `main`) |
| `npm run db:migrate:local` | Applies migrations to the local D1 |
| `npm run preview` | Builds and serves the production build locally |
| `npm run cf-typegen` | Regenerates `worker-configuration.d.ts` after changing `wrangler.jsonc` |

The code is laid out as `web/` (React app), `worker/` (API), `src/core/` (business rules, no vendor code), `src/adapters/` (Cloudflare and other vendors) and `src/contracts/` (shapes shared by web and API).

Merging to `main` deploys. Deploying, rolling back, restoring data and rotating secrets are covered in [docs/runbook.md](docs/runbook.md).
