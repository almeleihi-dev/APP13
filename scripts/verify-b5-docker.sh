#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"
export DATABASE_URL="${DATABASE_URL:-postgres://app13:app13@127.0.0.1:5432/app13}"
export S3_ENDPOINT="${S3_ENDPOINT:-http://127.0.0.1:9000}"
export S3_BUCKET="${S3_BUCKET:-app13-evidence}"
export S3_ACCESS_KEY="${S3_ACCESS_KEY:-app13}"
export S3_SECRET_KEY="${S3_SECRET_KEY:-app13secret}"
export S3_REGION="${S3_REGION:-us-east-1}"

DOCKER=""
for candidate in docker /usr/local/bin/docker /opt/homebrew/bin/docker \
  "/Applications/Docker.app/Contents/Resources/bin/docker"; do
  if command -v "$candidate" >/dev/null 2>&1; then
    DOCKER="$candidate"
    break
  fi
done

if [[ -z "$DOCKER" ]]; then
  echo "Docker is required for B5 verification." >&2
  echo "Install Docker Desktop, then run: docker compose up -d postgres minio minio-init" >&2
  exit 1
fi

echo "==> Starting PostgreSQL + MinIO (Docker)"
"$DOCKER" compose up -d postgres minio minio-init

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

echo "==> Waiting for MinIO health"
for i in $(seq 1 30); do
  if curl -sf "${S3_ENDPOINT}/minio/health/live" >/dev/null 2>&1; then
    echo "MinIO ready"
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "MinIO failed to become ready" >&2
    exit 1
  fi
  sleep 1
done

echo "==> Running migrations"
npm run migrate

echo "==> Building"
npm run build

echo "==> Unit tests (B1–B5)"
npm test

echo "==> B4 integration tests (PostgreSQL)"
npm run test:integration

echo "==> B5 integration tests (PostgreSQL + MinIO)"
npm run test:b5

echo "==> Import lint"
npm run lint:imports

echo "B5 Docker verification complete"
