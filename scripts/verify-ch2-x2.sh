#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X1 living onboarding experience regression"
npm run verify:ch2-x1

echo "==> CH2-X2 professional home experience tests"
npm run test:ch2-x2-professional-home

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X2 professional home experience verification complete"
