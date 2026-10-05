# ADR-007: Members are separate from user accounts; deletion anonymises

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-6, AD-7 in `../architecture.md`

## Context

Players are on the roster before they accept an invite, and one account can be in several teams. Deleting an account must keep stats but anonymise them, and leaving a team keeps the history with the team.

## Decision

A member (a person in one team) owns all stats. A user account links to zero or more members, at most one per team. Deleting an account:

- renames every member the user is or was linked to (`user_id` or `former_user_id`) to "Former player N", using a per-team counter, and clears both links;
- deletes the user's identity data, push subscriptions and AI conversations.

Stats are never deleted by account deletion. Because the change spans several slices, it runs as one unit of work (AD-18), with the Better Auth deletion last and the whole operation retried until complete. Removing or leaving a team never deletes the member: it records the former link so later account deletion still anonymises it.

## Consequences

- Guest or not-yet-joined players work naturally.
- Anonymisation is a rename, not a data migration.
