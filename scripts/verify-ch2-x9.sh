#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X8 living partner ecosystem experience regression"
npm run verify:ch2-x8

echo "==> CH2-X9 living professional community experience tests"
npm run test:ch2-x9-living-professional-community

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X9 living professional community experience verification complete"
