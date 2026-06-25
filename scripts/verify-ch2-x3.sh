#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X2 professional home experience regression"
npm run verify:ch2-x2

echo "==> CH2-X3 living professional passport experience tests"
npm run test:ch2-x3-living-passport

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X3 living professional passport experience verification complete"
