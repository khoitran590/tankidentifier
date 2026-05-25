# Tank Identifier

Next.js web app to browse military **tanks** and **aircraft** from Kaggle datasets, view specifications, and compare vehicles side by side.

Deploy on **Vercel** for the web. On iPhone, install via **Safari → Add to Home Screen** (PWA, no App Store).

## Features

- **Catalog** — Tabs for tanks and aircraft; search and filter by country
- **Detail pages** — Image gallery and specification tables per vehicle (`/tanks/…`, `/aircraft/…`)
- **Compare** — Select 2–4 vehicles in one category; URL uses `compare=tanks:slug` or `compare=aircraft:slug`
- **PWA** — Install on iPhone from Safari (see [docs/PWA.md](docs/PWA.md))

## Datasets

| Category | Kaggle dataset | Prepare command |
|----------|----------------|-----------------|
| Tanks | [antoreepjana/military-tanks-dataset-images](https://www.kaggle.com/datasets/antoreepjana/military-tanks-dataset-images) | `npm run prepare-data` |
| Aircraft | [rawsi18/air-military-vehicle-dataset-yolo8-data-format](https://www.kaggle.com/datasets/rawsi18/air-military-vehicle-dataset-yolo8-data-format) | `npm run prepare-data:aircraft` |

Vercel does **not** run Kaggle downloads. Commit `public/tanks/`, `public/aircraft/`, and `src/data/tanks.json` / `aircraft.json` after preparing locally.

The aircraft dataset is large (~6 GB download). The default script keeps **one image per class**, chosen by the largest YOLO bounding box (aircraft most visible in frame).

## Prerequisites

- Node.js 20+
- Python 3.10+ (for dataset preparation)
- Kaggle account ([Kaggle API](https://github.com/Kaggle/kaggle-api))

## Setup

```bash
npm install
pip install -r requirements.txt
npm run prepare-data:deploy        # tanks — smaller images for Git/Vercel
npm run prepare-data:aircraft:deploy   # aircraft — optional, after Kaggle download
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
| `npm run prepare-data` | Full tank dataset → `public/tanks/` |
| `npm run prepare-data:deploy` | One image per tank (~30MB repo) |
| `npm run prepare-data:aircraft` | YOLO aircraft dataset → `public/aircraft/` (1 best img/class) |
| `npm run prepare-data:aircraft:deploy` | Same as above (one image per class) |

Re-use an existing download:

```bash
python3 scripts/prepare_aircraft.py --dataset-path ~/.cache/kagglehub/datasets/rawsi18/air-military-vehicle-dataset-yolo8-data-format/versions/<version>
```

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) 4
- PWA manifest + install prompt for iOS
