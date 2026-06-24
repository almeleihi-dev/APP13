#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"
export DATABASE_URL="${DATABASE_URL:-postgres://app13:app13@127.0.0.1:5432/app13}"
export REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
export JWT_SECRET="${JWT_SECRET:-local-dev-jwt-secret-minimum-32-chars!!}"

echo "==> X40 action blueprint foundation engine regression"
npm run verify:x40

echo "==> X41 profession ontology mapping engine tests"
npm run test:x41-profession-ontology

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X41 profession ontology mapping engine verification complete"
