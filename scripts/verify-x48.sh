#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X47 intelligent pricing engine regression"
npm run verify:x47

echo "==> X48 intelligent commission engine tests"
npm run test:x48-intelligent-commission

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X48 intelligent commission engine verification complete"
