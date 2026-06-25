#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X6 living today i acted experience regression"
npm run verify:ch2-x6

echo "==> CH2-X7 living opportunities experience tests"
npm run test:ch2-x7-living-opportunities

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X7 living opportunities experience verification complete"
