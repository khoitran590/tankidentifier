# Tank Identifier

Next.js web app to browse military tanks from the [Military Tanks Dataset (Images)](https://www.kaggle.com/datasets/antoreepjana/military-tanks-dataset-images) on Kaggle, view specifications, and compare vehicles side by side.

## Features

- **Catalog** — Search and filter 150 tank classes with photos from the dataset
- **Detail pages** — Full image gallery and specification tables per vehicle
- **Compare** — Select 2–4 tanks and view metrics in a side-by-side table (highlights best numeric values per row)

## Prerequisites

- Node.js 20+
- Python 3.10+ (for dataset preparation)
- Kaggle account (for `kagglehub` downloads; configure credentials per [Kaggle API docs](https://github.com/Kaggle/kaggle-api))

## Setup

### 1. Install dependencies

```bash
npm install
pip install -r requirements.txt
```

### 2. Download dataset and build app data

This uses the same Kaggle flow as your snippet:

```python
import kagglehub
path = kagglehub.dataset_download("antoreepjana/military-tanks-dataset-images")
```

Or run the project script (copies images to `public/tanks/` and writes `src/data/tanks.json`):

```bash
npm run prepare-data
# or: python3 scripts/prepare_dataset.py
```

For **GitHub / Vercel** (smaller repo, avoids push errors), use one image per tank:

```bash
npm run prepare-data:deploy
```

See [docs/GITHUB_PUSH.md](docs/GITHUB_PUSH.md) if `git push` fails with HTTP 400.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mobile app (iOS & Android)

This project includes [Capacitor](https://capacitorjs.com/) to wrap the site as native apps.

```bash
npm run cap:sync      # build static web app + sync to native projects
npm run cap:ios       # open in Xcode
npm run cap:android   # open in Android Studio
```

See [docs/MOBILE.md](docs/MOBILE.md) for prerequisites, signing, and store builds.

### Cloud builds (Codemagic)

```bash
git add codemagic.yaml && git commit -m "Add Codemagic CI" && git push
```

Then in Codemagic: select branch → **Check for configuration file** → run **Tank Identifier Android (Debug APK)**.

Full guide: [docs/CODEMAGIC.md](docs/CODEMAGIC.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run prepare-data` | Download Kaggle data and regenerate `tanks.json` |
| `npm run build:mobile` | Static export for Capacitor (`out/`) |
| `npm run cap:sync` | Build mobile web bundle and sync native projects |
| `npm run cap:ios` / `cap:android` | Open native IDE |

## Data notes

- **Images** come directly from the Kaggle dataset folder structure (`images/<tank_slug>/`).
- **Specifications** are approximate reference values (overrides for well-known models + family-based defaults). They are intended for educational comparison, not operational or classified use.

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [kagglehub](https://github.com/Kaggle/kagglehub) for dataset download
