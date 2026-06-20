#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"
export DATABASE_URL="${DATABASE_URL:-postgres://app13:app13@127.0.0.1:5432/app13}"

DOCKER=""
for candidate in docker /usr/local/bin/docker /opt/homebrew/bin/docker \
  "/Applications/Docker.app/Contents/Resources/bin/docker"; do
  if command -v "$candidate" >/dev/null 2>&1; then
    DOCKER="$candidate"
    break
  fi
done

if [[ -z "$DOCKER" ]]; then
  echo "Docker is required for B4 PostgreSQL verification." >&2
  echo "Install Docker Desktop, then run: docker compose up -d postgres" >&2
  exit 1
fi

echo "==> Starting PostgreSQL (Docker)"
"$DOCKER" compose up -d postgres

echo "==> Waiting for PostgreSQL health"
for i in $(seq 1 30); do
  if "$DOCKER" compose exec -T postgres pg_isready -U app13 -d app13 >/dev/null 2>&1; then
    echo "PostgreSQL ready"
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "PostgreSQL failed to become ready" >&2
    exit 1
  fi
  sleep 1
done

echo "==> Running migrations"
npm run migrate

echo "==> Building"
npm run build

echo "==> Unit tests"
npm test

echo "==> B4 integration tests (PostgreSQL)"
npm run test:integration

echo "==> Import lint"
npm run lint:imports

echo "B4 Docker verification complete"
