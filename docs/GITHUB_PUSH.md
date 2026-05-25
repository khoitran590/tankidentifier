# Fixing GitHub push errors (~200MB dataset)

If `git push` fails with **HTTP 400**, **RPC failed**, or **remote end hung up**, the repo pack is too large for a normal HTTPS push (~200MB of images).

## Option A — Smaller repo (recommended for Vercel Hobby)

Keep **one image per tank** (~30MB). Catalog, detail pages, and compare still work.

```bash
npm run prepare-data:deploy

# Replace images in your last commit (if you already committed the full set)
git add public/tanks src/data/tanks.json
git commit --amend -m "First"

git config http.postBuffer 524288000
git push -u origin main
```

## Option B — Full gallery with Git LFS

All images per tank, stored via [Git LFS](https://git-lfs.github.com/).

```bash
# Install once: brew install git-lfs  (macOS)

git lfs install
git lfs track "public/tanks/**"
git add .gitattributes   # created by the track command

# Move existing images in history to LFS (one-commit repos)
git lfs migrate import --include="public/tanks/**" --everything

git config http.postBuffer 524288000
git push -u origin main
```

GitHub includes LFS bandwidth/storage quotas on free accounts. Vercel will clone LFS files during build when the repo uses LFS.

## Option C — Larger HTTP buffer only

Sometimes enough if the pack is borderline:

```bash
git config http.postBuffer 524288000
git config http.version HTTP/1.1
git push -u origin main
```

If it still fails, use Option A or B.

## Do not commit the full dataset without LFS

| Approach | Repo size | GitHub push | Vercel |
|----------|-----------|-------------|--------|
| `--thumbnails-only` | ~30MB | Usually works | Works |
| All images + Git LFS | Small git pack | Works | Works (LFS clone) |
| All images, no LFS | ~200MB+ | Often fails | N/A |
