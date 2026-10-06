# Deferred work

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-deployable-app-from-the-starter-template.md`
  summary: Add a `web` Vitest project (DOM environment, `web/**/*.test.{ts,tsx}`, included in type-checking) when the first real screen lands in Story 1.2.
  evidence: `vitest.config.ts` has no project matching `web/**` and `tsconfig.app.json` excludes test files, so a web test added today would neither run nor be type-checked while CI stays green. It needs a DOM test environment package that is not in the architecture Stack table.
