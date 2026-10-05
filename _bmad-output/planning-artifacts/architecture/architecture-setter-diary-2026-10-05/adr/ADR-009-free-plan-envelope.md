# ADR-009: Stay inside the Cloudflare Free plan; degrade, never bill

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-13, AD-14 in `../architecture.md`

## Context

The owner's goal is a cheap app with completely free AI. Limits verified on 2026-10-05:

- **Workers Free:** 100k requests per day, 10 ms CPU per request.
- **D1 Free:** 500 MB per database; 5M rows read and 100k rows written per day; 7-day Time Travel restore (30 days only on Paid); 50 queries per request.
- **Workers AI:** 10,000 neurons per day.

## Decision

Every feature must run within these limits. Limit errors become friendly retry messages, and nothing upgrades automatically. Any need for a paid plan or a purchased resource (a domain, an Apple developer account) is raised as an RFC first.

## Consequences

- $0 running cost for one team and early communities.
- The upgrade path is configuration, not code: Workers Paid (US$5/month) raises every limit.
