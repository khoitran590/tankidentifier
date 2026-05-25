# Install on iPhone (PWA, no App Store)

The Vercel site can be installed like an app via **Add to Home Screen** in Safari.

## User steps

1. Open your Vercel URL in **Safari** (not Chrome/Facebook in-app browser).
2. Wait for the install banner, or tap **Install on iPhone** in the footer.
3. Tap **Share** (↑) → **Add to Home Screen** → **Add**.

The app opens full-screen with your tank icon.

## What we ship

- `src/app/manifest.ts` — Web App Manifest (`display: standalone`)
- `PwaInstallPrompt` — iOS step-by-step banner (Safari only)
- Apple meta tags in `layout.tsx` — `apple-mobile-web-app-capable`, icons
- Footer link to show instructions again

## Vercel

Deploy as usual (`npm run build`). No extra Vercel settings required — HTTPS is enough for PWAs.

## Limitations (iOS)

- Must use **Safari** for install (Apple restriction).
- No App Store discovery or push notifications unless you add a native app later.
- Offline support is limited unless you add a service worker (not included by default).
