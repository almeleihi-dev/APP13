#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X55 intelligence orchestration engine regression"
npm run verify:x55

echo "==> CH2-X1 living onboarding experience tests"
npm run test:ch2-x1-living-onboarding

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X1 living onboarding experience verification complete"
