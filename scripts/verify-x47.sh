#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X46 marketplace compilation engine regression"
npm run verify:x46

echo "==> X47 intelligent pricing engine tests"
npm run test:x47-intelligent-pricing

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X47 intelligent pricing engine verification complete"
