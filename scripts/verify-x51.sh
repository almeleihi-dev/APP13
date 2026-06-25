#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X50 develop me engine regression"
npm run verify:x50

echo "==> X51 learn by action engine tests"
npm run test:x51-learn-by-action

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X51 learn by action engine verification complete"
