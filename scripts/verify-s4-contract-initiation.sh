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

if [[ -n "$DOCKER" ]]; then
  echo "==> Starting PostgreSQL (Docker) for S3/S4 regression suite"
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

echo "==> S3 foundation regression"
node --import tsx --test --test-concurrency=1 \
  test/s3-security.test.ts \
  test/s3-financial-safety.test.ts

echo "==> S3 trust engine regression"
node --import tsx --test --test-concurrency=1 test/s3-trust-engine.test.ts

echo "==> S3 reputation timeline regression"
node --import tsx --test --test-concurrency=1 test/s3-reputation-timeline.test.ts

echo "==> S3 live frame regression"
node --import tsx --test --test-concurrency=1 test/s3-live-frame.test.ts

echo "==> S3 matching engine regression"
node --import tsx --test test/s3-matching-engine.test.ts

echo "==> S3 action intelligence regression"
node --import tsx --test test/s3-action-intelligence.test.ts

echo "==> S3 marketplace integration regression"
node --import tsx --test --test-concurrency=1 test/s3-marketplace-integration.test.ts

echo "==> S4 marketplace experience regression"
node --import tsx --test --test-concurrency=1 test/s4-marketplace-experience.test.ts

echo "==> S4 contract initiation tests"
node --import tsx --test --test-concurrency=1 test/s4-contract-initiation.test.ts

echo "==> Building"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "S4 contract initiation verification complete"
