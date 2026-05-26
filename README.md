# Tank Identifier

Next.js web app to browse military tanks from the [Military Tanks Dataset (Images)](https://www.kaggle.com/datasets/antoreepjana/military-tanks-dataset-images) on Kaggle, view specifications, and compare vehicles side by side.

Deploy on **Vercel** for the web. On iPhone, install via **Safari → Add to Home Screen** (PWA, no App Store).

## Features

- **Catalog** — Search and filter 150 tank classes with photos from the dataset
- **Detail pages** — Image gallery and specification tables per tank
- **Compare** — Visual slot picker; select 2–4 tanks and view metrics side by side
- **PWA** — Install on iPhone from Safari (see [docs/PWA.md](docs/PWA.md))
- **Accounts** — Email sign-up / log-in with Firebase Auth; profiles in Firestore (see [docs/FIREBASE.md](docs/FIREBASE.md))
- **My tanks** — Logged-in users can add custom tanks with photos and full specs (Firestore + Storage)
- **Patch notes** — Admin-published changelog of new tanks and spec updates (Firestore)

## Prerequisites

- Node.js 20+
- Python 3.10+ (for dataset preparation)
- Kaggle account ([Kaggle API](https://github.com/Kaggle/kaggle-api))

## Setup

```bash
npm install
python3 -m pip install -r requirements.txt
npm run prepare-data:deploy   # 2 images per tank (~60MB), good for GitHub/Vercel
npm run dev
```

On Windows you may have two Pythons (`python` = 3.12, `python3` = Store 3.10). This project uses **`python`** for npm scripts — run `npm run setup:python` so deps install on that interpreter.

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env.local` and add Firebase keys to enable **Log in** / **Sign up** ([docs/FIREBASE.md](docs/FIREBASE.md)).

See [docs/GITHUB_PUSH.md](docs/GITHUB_PUSH.md) if `git push` fails due to large files.

## Install on iPhone (free)

1. Deploy to Vercel (connect your GitHub repo).
2. Open the site in **Safari**.
3. **Share → Add to Home Screen**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (Vercel) |
| `npm run prepare-data` | Full Kaggle dataset → `public/tanks/` |
| `npm run prepare-data:deploy` | Two images per tank (~60MB repo) |
| `npm run patch-data:two-images` | Update `tanks.json` paths only (no Kaggle download) |

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) 4
- PWA manifest + install prompt for iOS
