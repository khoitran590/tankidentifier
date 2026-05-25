# Codemagic — iOS builds

This project uses **Next.js + Capacitor** (not React Native). The main workflow is **Tank Identifier iOS**.

## Workflows

| Workflow | When to use |
|----------|-------------|
| **Tank Identifier iOS** | Default — development IPA, runs on push to `main` |
| **Tank Identifier iOS (App Store)** | TestFlight — run manually after signing works |

## One-time Apple + Codemagic setup

### 1. Apple Developer Program

You need an active membership ($99/year).

### 2. App Store Connect API key (Codemagic)

1. [App Store Connect](https://appstoreconnect.apple.com/access/integrations/api) → **Users and Access** → **Integrations** → **App Store Connect API** → create key (**App Manager** role).
2. Download the `.p8` file once; note **Issuer ID** and **Key ID**.
3. Codemagic → **Team integrations** → **Developer Portal** → **Add key** → upload `.p8`.
4. In `codemagic.yaml`, set `integrations.app_store_connect` to that key’s name (replace `codemagic`).

### 3. Code signing (Codemagic)

1. **Team settings** → **codemagic.yaml settings** → **Code signing identities**.
2. **iOS certificates** — generate or upload **Apple Development** (for `tank-identifier-ios`) and **Apple Distribution** (for App Store workflow).
3. **iOS provisioning profiles** — **Fetch profiles** for bundle id `com.tankidentifier.app` (and extensions if any).

Codemagic matches `bundle_identifier` in the yaml to your profiles.

### 4. App record (TestFlight only)

Create the app in App Store Connect with bundle ID `com.tankidentifier.app`, then set `APP_STORE_APP_ID` in the **App Store** workflow (General → App Information → Apple ID).

## Push and build

### Commit app data + native projects

```bash
npm run prepare-data:deploy   # recommended (~30MB)

git add codemagic.yaml src/data/tanks.json public/tanks ios/ android/
git commit -m "Add Codemagic iOS workflow"
git push origin main
```

### Codemagic UI

1. [codemagic.io](https://codemagic.io) → your application.
2. Select branch **main**.
3. **Check for configuration file**.
4. Start **Tank Identifier iOS** (also runs automatically on push).

Download the **`.ipa`** from **Artifacts** when the build succeeds.

## Edit `codemagic.yaml`

| Field | What to set |
|-------|-------------|
| `app_store_connect:` under `integrations` | Your Codemagic API key name |
| `publishing.email.recipients` | Your email |
| `distribution_type` | `development` (dev IPA) or `app_store` (TestFlight) |
| `APP_STORE_APP_ID` | Numeric Apple ID (App Store workflow only) |

## Build steps (what Codemagic runs)

1. `npm ci`
2. `npm run build:mobile` — static site → `out/`
3. `npx cap sync ios` — copy into `ios/`
4. `xcode-project use-profiles` — signing
5. `xcode-project build-ipa` — `.ipa` artifact

No CocoaPods — Capacitor 8 uses Swift Package Manager.

## Troubleshooting

| Error | Fix |
|-------|-----|
| No configuration file | `codemagic.yaml` must be on the branch you selected |
| Signing failed | Add Development cert + profile for `com.tankidentifier.app` |
| Integration not found | Fix `app_store_connect` name in yaml |
| Empty app | Commit `public/tanks/` and `src/data/tanks.json` |
| `APP_STORE_APP_ID` / publish failed | Create app in App Store Connect; set numeric Apple ID |

## Android (optional)

Android workflows were removed from the default config. To add them back, see [Codemagic Ionic/Capacitor docs](https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/) or git history.
