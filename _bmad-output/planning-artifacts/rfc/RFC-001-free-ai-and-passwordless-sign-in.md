# RFC-001: Free AI through Cloudflare and passwordless sign-in

- **Status:** Accepted, 2026-10-05
- **Author:** Thang (with the architecture run)
- **Affects:** `prd-setter-diary/PRD.md` (FR-1, FR-14, FR-15, constraints, assumptions, open questions), `permissions-matrix.md`, `ux-designs/ux-setter-diary-2026-10-05/ux-specification.md`, `design-system.md`, `mockups/screens.html`, `docs/product-brief.md`
- **Decided in:** architecture ADR-004 (AI), ADR-005 (sign-in), ADR-009 (free-plan envelope)

## Summary

1. Replace "AI discussion with Claude on the setter's own Claude account" with **free AI through Cloudflare Workers AI**, run by the app, with a **daily limit** and no user AI account.
2. Replace the assumed **email and password** sign-in with **Sign in with Google and passkeys**, with lost access recovered by a team manager's re-invite.

## Motivation

- **Claude accounts can't be linked.** Since early 2026, Anthropic's policy forbids third-party apps from using Free, Pro or Max subscription logins; apps must use API keys. The Claude API has no ongoing free tier.
- **The owner's goal is completely free AI.** Cloudflare Workers AI gives 10,000 free neurons per day. On the Workers Free plan, exceeding them returns an error instead of a charge, and Cloudflare does not train on customer data.
- **Passwords don't fit the free plan.** Secure password hashing exceeds the Workers Free plan's 10 ms CPU per request, and email sending needs a purchased domain. Google sign-in and passkeys need neither.

## Proposal

### PRD

| Item | Now | Proposed |
| --- | --- | --- |
| FR-14 Acceptance criteria | "The AI is Claude, opened from a Claude button, and runs on a Claude account the setter connects; without one, the feature is unavailable." | "The AI is opened from an Ask AI button and runs on the app's free AI allowance; each setter has a daily discussion limit, and when the limit or the app's daily allowance is reached the setter is told to try again tomorrow." |
| Constraint | "AI runs on the setter's own connected Claude account: their plan sets limits and cost, and the app pays nothing for AI." | "AI runs on a free provider that does not train on our data, through one AI gateway; the app pays nothing for AI; limits are daily and configurable (v1: 2 discussions per setter per day)." |
| Constraint (consent) | Users consent before data goes to "an AI provider" | Unchanged in substance; name the provider as Cloudflare Workers AI, and add that only aggregated stats with teammates' names replaced by labels are sent. |
| Assumption (sign-in) | "Sign-in is email and password for now..." | "Sign-in is Google or a passkey; no passwords in v1. Lost access is recovered by a team manager re-issuing the invite link. Email login and Sign in with Apple are later options." |
| Assumption (Claude connection) | "How the Claude account is connected... is left to architecture." | Remove. |
| Open questions | Claude account connection; Claude brand guidelines | Remove both (resolved). Keep the privacy obligations question. |
| Out of Scope | — | Add: paid AI and in-app AI accounts; email delivery (no domain in v1). |

### UX

- **Progress screen:** the Claude button becomes a neutral **Ask AI** button (sparkle icon); the Claude discussion screen becomes **AI discussion**.
- **Settings:** remove the "Claude account" row.
- **New state:** "You've used today's AI discussions" and "AI is resting, try again tomorrow".
- **Create account:** replace the email and password fields with **Continue with Google** and **Use a passkey**. Keep the 18+ and privacy checkbox, and the AI consent checkbox with the provider renamed.
- **Log in:** the same two buttons; remove "Forgot password?".
- **Lost access:** the message "Ask your team manager to resend your invite".
- **iPhone:** an Add-to-Home-Screen tip after sign-up, so notifications can work.
- **Member sheet (managers):** add **Setter** and **Hitter** toggles next to Team manager and Team view. New members default to hitter; the team creator starts as setter and manager (architecture AD-5).
- **AI limits:** separate messages for "You've used today's 2 AI discussions" (per person) and "AI is resting for today" (app-wide allowance used up). Each discussion has a capped number of follow-up messages.
- **Account deletion copy:** also states that the user's names are removed from other people's saved AI discussions.

### Product brief

Update the AI discussion section and the sign-in line to match.

## Alternatives considered

See ADR-004 (Claude API paid by the app, bring-your-own key, Gemini free tier, DeepSeek, on-device models) and ADR-005 (email and password on Workers Paid, hosted sign-in services).

## Impact

- **Cost:** $0 for AI and sign-in.
- **Experience:** faster sign-in. AI limited to roughly 5–24 discussions per day across the whole app, depending on the model, degrading to a smaller model and then "try tomorrow".
- **Upgrade path:** Workers Paid (US$5/month) or a paid AI provider through the same gateway, with no code changes.
- **Players without a Google account** use a passkey (Face ID or fingerprint).

## Next steps once accepted

1. `bmad-spec`: update PRD.md and its companions.
2. `bmad-ux`: update ux-specification.md, design-system.md and the mock.
3. Update docs/product-brief.md.
