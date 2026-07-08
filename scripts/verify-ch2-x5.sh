#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X4 living live frame experience regression"
npm run verify:ch2-x4

echo "==> CH2-X5 living professional journey experience tests"
npm run test:ch2-x5-living-journey

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X5 living professional journey experience verification complete"
