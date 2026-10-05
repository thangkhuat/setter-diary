# ADR-002: Installable web app (PWA) on Cloudflare, not a native app

- **Status:** Accepted, 2026-10-05
- **Implements:** AD-3, AD-14 in `../architecture.md`

## Context

The product must be phone-first, cheap (ideally free) and quick to iterate. Teams join through shared invite links.

## Options considered

- **Native app (React Native / Expo):** best feel and notifications, but US$99/year to publish on the Apple App Store, store review delays, and an install step before joining.
- **PWA:** chosen. Free hosting, instant updates, invite links open the app directly, and Add to Home Screen gives an icon and full-screen mode.

## Decision

One installable React PWA served as Cloudflare static assets, plus one API Worker. The service worker caches the app shell only; data is always live. A store wrapper (for example Capacitor) may be added later around the same PWA.

## Consequences

- $0 hosting and instant updates.
- iPhone push notifications only work after Add to Home Screen. In-app "To rate" cards remain the primary path, and sign-up shows an iOS Add-to-Home-Screen tip.
- No haptics in iPhone web apps.
