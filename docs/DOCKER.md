# Docker

Run Tank Identifier in containers without installing Node on the host (except for optional dataset prep).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Tank images under `public/tanks/` and `src/data/tanks.json` (run `npm run prepare-data:deploy` on the host if missing)

### Windows: `'docker' is not recognized`

Docker is **not installed** (or the terminal was opened before install). Do this:

1. Download and install **[Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)** (WSL 2 backend is recommended).
2. Launch **Docker Desktop** from the Start menu and wait until the whale icon shows **Running**.
3. **Close and reopen** PowerShell or Cursor’s terminal (PATH updates only in new sessions).
4. Verify: `docker --version`
5. Run: `npm run docker:up`

Until Docker is installed, use local Node instead: `npm run dev`

## Environment

```bash
cp env.example .env.local
# Edit .env.local with Firebase keys (optional but required for auth features)
```

Compose uses `--env-file .env.local` so build args and runtime both see Firebase variables. **Production builds** need `NEXT_PUBLIC_*` at **image build** time — those come from the same file when you use the npm scripts below.

## Production

```bash
npm run docker:up
# or: docker compose --env-file .env.local up --build
```

Open [http://localhost:3000](http://localhost:3000).

Detached mode:

```bash
docker compose up --build -d
docker compose logs -f web
docker compose down
```

## Development (hot reload)

```bash
npm run docker:dev
# or: docker compose --env-file .env.local --profile dev up --build
```

Uses `Dockerfile.dev`, mounts the repo into the container, and runs `next dev` on `0.0.0.0:3000`.

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Production compose up --build |
| `npm run docker:dev` | Dev profile with hot reload |
| `npm run docker:down` | Stop containers |

## Dataset preparation

The Kaggle download script is **not** run inside the app image. On your machine:

```bash
npm run setup:python
npm run prepare-data:deploy
```

Then rebuild so `public/tanks` is copied into the image:

```bash
docker compose build --no-cache web
docker compose up
```

## Troubleshooting

- **Blank Firebase / auth errors** — Set all `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local` and rebuild (`docker compose up --build`).
- **Missing tank photos** — Ensure `public/tanks` exists before `docker compose build`.
- **Dev changes not showing** — Use the `dev` profile; production image is static after build.
