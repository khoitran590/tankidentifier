# Firebase setup (Auth + Firestore)

Tank Identifier uses **Firebase Authentication** (email/password) for sign-in and **Cloud Firestore** to store user profiles.

## 1. Create a Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Create a project (or use an existing one).
3. Register a **Web app** and copy the config object.

## 2. Enable Authentication

1. In the console: **Build → Authentication → Sign-in method**.
2. Enable **Email/Password** (Email link optional — not required).

## 3. Create Firestore

1. **Build → Firestore Database → Create database**.
2. Start in **test mode** for development, or production mode with rules below.

### Security rules (required for sign-up)

If sign-up logs you in but shows an error, Firestore rules are usually blocking the profile write.

1. Firebase Console → **Firestore Database** → **Rules**
2. Paste the contents of `firestore.rules` from this repo (or the rules below)
3. Click **Publish**

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /tanks/{tankId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

After publishing, log out and sign up again—or open **Sign up** and submit once more (your account may already exist; the app will finish saving your profile).

## 4. Environment variables

Copy `.env.example` to `.env.local` in the project root and fill in values from the Firebase web app config:

```bash
cp .env.example .env.local
```

| Variable | Firebase config field |
|----------|------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | appId |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | measurementId (optional, for Analytics) |

Restart `npm run dev` after changing env vars.

For **Vercel**, add the same variables in Project → Settings → Environment Variables.

## 5. What gets stored

On **sign up**, a document is created at:

`users/{uid}`

| Field | Description |
|-------|-------------|
| `email` | User email |
| `displayName` | Name from signup form (or email prefix) |
| `createdAt` | Server timestamp |
| `updatedAt` | Server timestamp |

Sign-in uses Firebase Auth only; Firestore is updated on registration.

## 8. My tanks (logged-in users)

Signed-in users can add custom tanks at **My tanks** (`/my-tanks`):

- Data: `users/{uid}/tanks/{tankId}` in Firestore (name, image URL, full specs)
- Photos: Firebase Storage at `users/{uid}/tanks/{tankId}/cover.*` (or paste an image URL)

### Storage rules (replace default “deny all” rules)

Firebase Console → **Build → Storage → Rules**.

Delete the default template (often `allow read, write: if false` on `{allPaths=**}`) and paste from **`storage.rules`** at the project root:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/tanks/{tankId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**. Without this, photo uploads on **Add tank** fail; image URLs still work without Storage.

### Firestore rules for user tanks

Use **`firestore.rules`** at the project root (includes `users/{userId}/tanks/{tankId}`). Republish if you only added the profile rule earlier.

## 6. Patch notes (admin)

Everyone can read **Patch notes** at `/patch-notes`. Only **admins** can create, edit, or delete entries (stored in Firestore collection `patchNotes`).

### Make yourself admin (pick one)

**Option A — Environment variable (easiest for local dev)**

1. Firebase Console → **Authentication → Users** → copy your **User UID**
2. In `.env.local` add:
   ```bash
   NEXT_PUBLIC_ADMIN_UIDS=your-uid-here
   ```
3. Restart `npm run dev`

**Option B — Firestore flag**

1. Firestore → **Data** → `users` → your user document
2. Add field: `isAdmin` = `true` (boolean)
3. Republish **`firestore.rules`** (includes `patchNotes` rules)

### Firestore rules for patch notes

Republish **`firestore.rules`** from the repo root. It must include:

```text
match /patchNotes/{noteId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

(`isAdmin()` reads `users/{uid}.isAdmin == true` in Firestore.)

### Publishing an update

1. Log in as admin → open **Patch notes**
2. Click **+ New patch note**
3. Fill title, version, summary, new tanks, and spec changes → **Publish update**

## 9. Public catalog tanks (admin)

Admins can add tanks to the **live public catalog** (not only private **My tanks** or patch-note text).

| Piece | Location |
|-------|----------|
| Firestore | `catalogTanks/{tankId}` — public read, admin write |
| Storage | `catalog/{tankId}/cover.*` — public read, admin write |
| UI | `/admin/catalog/new` (also **+ Add catalog tank** on Patch notes when admin) |

Merged with the static `tanks.json` dataset on the home catalog, compare tool, and `/tanks/[slug]` detail pages.

### Rules

Republish **`firestore.rules`** and **`storage.rules`** from the repo root. Storage admin checks use `users/{uid}.isAdmin` in Firestore (set `isAdmin: true` on your user doc).

### Add or edit tanks

| Route | Purpose |
|-------|---------|
| `/admin/catalog/new` | Add a tank with any number of photos |
| `/admin/catalog` | List and edit admin-added tanks |
| `/admin/catalog/{id}/edit` | Update live catalog tank (Firestore) |
| `/admin/dataset/{slug}/edit` | Override built-in `tanks.json` entry (specs + photos) |

**Patch notes:** On **+ New patch note**, use **Add tanks to catalog** (multiple full entries in one release) and **Update existing catalog tanks** (pick any dataset or live tank, edit specs/photos). Publishing applies catalog changes and auto-fills the changelog.

Firestore collection `tankOverrides/{slug}` stores admin edits to static dataset tanks (public read, admin write).

1. Log in as admin
2. **Patch notes** → **Manage catalog** or **+ Add catalog tank**
3. Upload multiple files and/or paste image URLs, then fill specs → **Add to catalog**
4. On a catalog tank’s public page, use **Edit catalog entry** (admins only)

Photos are stored in Firestore as `imageUrls` (array). Older entries with a single `imageUrl` still work.

Optional: publish a **patch note** describing the addition so visitors see it in **Patch notes**.

## 7. App routes

| Route | Purpose |
|-------|---------|
| `/login` | Log in |
| `/signup` | Create account |
| `/admin/catalog` | Admin: manage catalog tanks |
| `/admin/catalog/new` | Admin: add tank to public catalog |
| `/admin/catalog/{id}/edit` | Admin: edit catalog tank |

The header **Log in** button links to `/login`. Sign up is linked from the login page.
