#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X44 milestone & evidence compilation engine regression"
npm run verify:x44

echo "==> X45 blueprint governance & global registry engine tests"
npm run test:x45-blueprint-governance

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X45 blueprint governance & global registry engine verification complete"
