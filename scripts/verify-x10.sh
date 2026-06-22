#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"
export DATABASE_URL="${DATABASE_URL:-postgres://app13:app13@127.0.0.1:5432/app13}"
export REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
export JWT_SECRET="${JWT_SECRET:-local-dev-jwt-secret-minimum-32-chars!!}"

DOCKER=""
for candidate in docker /usr/local/bin/docker /opt/homebrew/bin/docker \
  "/Applications/Docker.app/Contents/Resources/bin/docker"; do
  if command -v "$candidate" >/dev/null 2>&1; then
    DOCKER="$candidate"
    break
  fi
done

if [[ -n "$DOCKER" ]]; then
  echo "==> Starting PostgreSQL (Docker) for X10 regression suite"
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
fi

echo "==> X9.5 professional seals regression"
bash scripts/verify-x9-5.sh

echo "==> X10 live trust frame experience tests"
node --import tsx --test --test-concurrency=1 test/x10-live-trust-frame.test.ts

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X10 live trust frame experience verification complete"
