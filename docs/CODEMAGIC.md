# Codemagic mobile builds

Codemagic’s onboarding UI may show **React Native** steps. This project is **Next.js + Capacitor** — use the `codemagic.yaml` in the repo root (same 4-step flow, different stack).

## Step 1 — Configuration file

`codemagic.yaml` is already in the project root with three workflows:

| Workflow ID | What it builds |
|-------------|----------------|
| `tank-identifier-android-debug` | Debug **APK** (no signing setup) — **start here** |
| `tank-identifier-android-release` | Release **AAB** (needs Android keystore in Codemagic) |
| `tank-identifier-ios` | **IPA** (needs Apple code signing + API key) |

Build steps (each workflow):

1. `npm ci`
2. `npm run build:mobile` — Next.js static export → `out/`
3. `npx cap sync` — copy into `android/` / `ios/`
4. Native build (`assembleDebug`, `bundleRelease`, or `build-ipa`)

## Step 2 — Commit the file

**Before pushing**, ensure the app data is in Git (Codemagic has no Kaggle step):

```bash
# Smaller repo (~30MB) — recommended
npm run prepare-data:deploy

git add codemagic.yaml src/data/tanks.json public/tanks public/logo.png
git add android/ ios/   # native projects required for Capacitor CI
git status
```

If push fails due to size, see [GITHUB_PUSH.md](GITHUB_PUSH.md).

## Step 3 — Push to GitHub

```bash
git add codemagic.yaml docs/CODEMAGIC.md
git commit -m "Add Codemagic CI for Capacitor Android and iOS"
git push -u origin main
```

## Step 4 — Codemagic UI

1. Open [codemagic.io](https://codemagic.io) → **Applications** → your app (or **Add application** → connect GitHub repo).
2. Select the **branch** you pushed (e.g. `main`).
3. Click **Check for configuration file** (top right).
4. Codemagic should detect `codemagic.yaml` and list the workflows.
5. Run **Tank Identifier Android (Debug APK)** first.

## Customize before iOS / Play Store

### Android debug (no changes)

Download the `.apk` from build **Artifacts**.

### Android release

1. Codemagic → **Team settings** → **Code signing identities** → **Android keystores** → upload keystore.
2. Note the **reference name** (e.g. `tank_identifier_keystore`).
3. In `codemagic.yaml`, uncomment `android_signing` under `tank-identifier-android-release`.
4. Replace the email under `publishing.email.recipients`.

### iOS

1. Apple Developer Program membership.
2. Codemagic → **Team integrations** → **App Store Connect API key**.
3. Codemagic → **Code signing identities** → certificates + provisioning profiles for `com.tankidentifier.app`.
4. In `codemagic.yaml` under `tank-identifier-ios`:
   - Set `integrations.app_store_connect` to your integration name.
   - Set `APP_STORE_APP_ID` to your app’s numeric Apple ID.
   - Change `distribution_type` to `app_store` when ready for TestFlight.

Capacitor 8 iOS uses **Swift Package Manager** (no `pod install`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Empty app / no tanks | Commit `public/tanks/` and `src/data/tanks.json` |
| `out/` missing | Workflow runs `npm run build:mobile` — check build logs |
| iOS signing failed | Complete certificates + profiles in Codemagic; bundle id must match `com.tankidentifier.app` |
| Android release failed | Upload keystore and enable `android_signing` in release workflow |

## Local vs Codemagic

| | Local | Codemagic |
|--|--------|-----------|
| Web (Vercel) | `npm run build` | Not used |
| Mobile bundle | `npm run build:mobile` | Same in CI |
| Native compile | Xcode / Android Studio | Cloud Mac (`mac_mini_m2`) |
