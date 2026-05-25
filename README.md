# Tank Identifier

Next.js web app to browse military tanks from the [Military Tanks Dataset (Images)](https://www.kaggle.com/datasets/antoreepjana/military-tanks-dataset-images) on Kaggle, view specifications, and compare vehicles side by side.

Deploy on **Vercel** for the web. On iPhone, install via **Safari → Add to Home Screen** (PWA, no App Store).

## Features

- **Catalog** — Search and filter 150 tank classes with photos from the dataset
- **Detail pages** — Image gallery and specification tables per vehicle
- **Compare** — Select 2–4 tanks and view metrics side by side
- **PWA** — Install on iPhone from Safari (see [docs/PWA.md](docs/PWA.md))

## Prerequisites

- Node.js 20+
- Python 3.10+ (for dataset preparation)
- Kaggle account ([Kaggle API](https://github.com/Kaggle/kaggle-api))

## Setup

```bash
npm install
pip install -r requirements.txt
npm run prepare-data:deploy   # smaller images, good for GitHub/Vercel
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [docs/GITHUB_PUSH.md](docs/GITHUB_PUSH.md) if `git push` fails due to large files.

## Install on iPhone (free)

1. Deploy to Vercel (connect your GitHub repo).
2. Open the site in **Safari**.
3. **Share → Add to Home Screen**.

The site shows an install banner and footer link **Install on iPhone**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (Vercel) |
| `npm run prepare-data` | Full Kaggle dataset → `public/tanks/` |
| `npm run prepare-data:deploy` | One image per tank (~30MB repo) |

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) 4
- PWA manifest + install prompt for iOS
