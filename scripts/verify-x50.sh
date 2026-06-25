#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X49 personal assistant engine regression"
npm run verify:x49

echo "==> X50 develop me engine tests"
npm run test:x50-develop-me

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X50 develop me engine verification complete"
