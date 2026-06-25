#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X3 living professional passport experience regression"
npm run verify:ch2-x3

echo "==> CH2-X4 living live frame experience tests"
npm run test:ch2-x4-living-live-frame

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X4 living live frame experience verification complete"
