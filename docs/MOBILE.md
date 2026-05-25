# Mobile app (Capacitor)

The web app can run as native **iOS** and **Android** apps via [Capacitor](https://capacitorjs.com/). The UI is your Next.js site exported as static HTML/JS and loaded in a native WebView.

## How it works

| Web (Vercel) | Mobile (Capacitor) |
|--------------|-------------------|
| `npm run build` | `npm run build:mobile` |
| Next.js server/SSG on Vercel | Static files in `out/` bundled into the app |
| — | `webDir: "out"` in `capacitor.config.ts` |

Set `CAPACITOR_BUILD=true` so Next.js uses `output: "export"` and copies assets into `out/`.

## Prerequisites

### All platforms

- Node.js 20+
- Prepared dataset (`public/tanks/`, `src/data/tanks.json`) — use `npm run prepare-data:deploy` before shipping to keep the app bundle smaller.

### iOS (macOS only)

- Xcode 15+
- CocoaPods (usually installed with Xcode command line tools)

### Android

- Android Studio
- JDK 17+
- Android SDK

## Build and run

```bash
# 1. Export the web app into out/
npm run build:mobile

# 2. Copy web assets into native projects
npx cap sync

# Or combine both:
npm run cap:sync
```

### iOS

```bash
npm run cap:ios          # open Xcode
# or
npm run cap:run:ios      # build & run on simulator/device
```

In Xcode: select a simulator or device → Run (▶).

### Android

```bash
npm run cap:android      # open Android Studio
# or
npm run cap:run:android  # build & run on emulator/device
```

## After web code changes

Whenever you change React/Next code:

```bash
npm run cap:sync
```

Then rebuild from Xcode or Android Studio.

## App identity

Edit `capacitor.config.ts` if you need a different bundle ID:

- **appId:** `com.tankidentifier.app`
- **appName:** `Tank Identifier`

For store release, update signing in Xcode / Android Studio and replace placeholder icons in `ios/App/App/Assets.xcassets` and `android/app/src/main/res`.

## Plugins included

- **@capacitor/app** — Android hardware back button
- **@capacitor/splash-screen** — launch splash
- **@capacitor/status-bar** — status bar styling

Configured in `src/components/CapacitorBridge.tsx`.

## Troubleshooting

**Blank screen**

- Run `npm run cap:sync` after `build:mobile`.
- Confirm `out/index.html` exists.

**Images missing in the app**

- Ensure `public/tanks/` was generated and included in the static export (check `out/tanks/`).

**Large repo / slow sync**

- Use `npm run prepare-data:deploy` (one image per tank) before `build:mobile`.
