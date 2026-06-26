#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X13 living professional identity experience regression"
npm run verify:ch2-x13

echo "==> CH2-X14 living professional intelligence center tests"
npm run test:ch2-x14-living-professional-intelligence

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X14 living professional intelligence center verification complete"
