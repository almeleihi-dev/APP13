#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X11 living action planner experience regression"
npm run verify:ch2-x11

echo "==> CH2-X12 living professional impact experience tests"
npm run test:ch2-x12-living-professional-impact

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X12 living professional impact experience verification complete"
