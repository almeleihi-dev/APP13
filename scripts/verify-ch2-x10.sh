#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X9 living professional community experience regression"
npm run verify:ch2-x9

echo "==> CH2-X10 living professional coach experience tests"
npm run test:ch2-x10-living-professional-coach

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X10 living professional coach experience verification complete"
