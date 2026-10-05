# ADR-004: Free AI through Cloudflare Workers AI behind one AI gateway

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-10, AD-13 in `../architecture.md`; PRD change proposed in RFC-001

## Context

The PRD planned a Claude discussion running on the setter's own Claude account. As verified on 2026-10-05, Anthropic does not allow Free, Pro or Max subscription logins in third-party apps (API keys only), and the API has no ongoing free tier. The owner then set the goal that AI integration must be completely free.

## Options considered

- **Claude API, app pays:** about US$0.07–0.15 per discussion; not free.
- **Bring your own API key:** free for the app, but too much friction for players.
- **Gemini free tier:** free, but Google uses free-tier content to improve its products, which is unacceptable for teammates' data.
- **DeepSeek:** very cheap, but data is processed in China, a cross-border privacy concern.
- **On-device models:** free and private, but device support is patchy and quality is weaker on phones today.
- **Cloudflare Workers AI on the Workers Free plan:** chosen. 10,000 free neurons per day. On the Free plan, exceeding them returns an error rather than a charge, and Cloudflare does not train on customer content.

## Decision

A single `AiGateway` port, whose adapter uses Workers AI through Cloudflare AI Gateway. A large open model (Llama 3.3 70B class) is the default and a small model (Llama 3.1 8B class) the fallback, followed by "try again tomorrow". Quotas are configuration: 2 discussions per setter per day, plus the account-wide free allocation. Only aggregated stats are sent, with member names replaced by labels.

## Consequences

- AI costs $0 at any usage; heavy days degrade gracefully.
- About 5 (Llama 3.3 70B) to 20–24 (Gemma 4 26B, GLM 4.7-Flash) discussions per day across the whole app, depending on the model chosen by the bake-off. Growth triggers the Workers Paid plan (US$5/month) or a paid provider through the same adapter.
- The AI is no longer branded Claude; the UX button becomes a neutral "Ask AI" (RFC-001).
