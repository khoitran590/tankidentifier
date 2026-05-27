#!/usr/bin/env node
/**
 * Runs `docker …` with a clear error if Docker is missing.
 * On Windows, also checks the default Docker Desktop install path.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const WIN_DOCKER =
  "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe";

function tryDocker(cmd) {
  const result = spawnSync(cmd, ["--version"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return result.status === 0 ? cmd : null;
}

function resolveDocker() {
  const fromPath = tryDocker("docker");
  if (fromPath) return fromPath;
  if (process.platform === "win32" && existsSync(WIN_DOCKER)) {
    const fromInstall = tryDocker(`"${WIN_DOCKER}"`);
    if (fromInstall) return WIN_DOCKER;
  }
  return null;
}

const docker = resolveDocker();

if (!docker) {
  console.error(`
Docker is not installed or not available in your PATH.

To use npm run docker:up / docker:dev on Windows:

  1. Install Docker Desktop:
     https://docs.docker.com/desktop/setup/install/windows-install/

  2. Start Docker Desktop and wait until it says "Docker is running".

  3. Close and reopen PowerShell (or Cursor's terminal), then run:
     npm run docker:up

To run the app without Docker:
     npm install
     npm run dev
`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/docker-run.mjs <docker args…>");
  process.exit(1);
}

const run = spawnSync(docker, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(run.status ?? 1);
