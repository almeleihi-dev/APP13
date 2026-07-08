#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Functional Beta Sprint 1 tests"
npm run test:mvp-functional-beta-sprint1

echo "==> Functional beta sprint stylesheet"
test -f apps/web/src/styles/an-act-functional-beta-sprint1.css
grep -q 'an-act-functional-beta-sprint1.css' apps/web/src/styles/global.css

echo "==> Action Creation Intelligence Cycle 01 regression"
npm run test:mvp-action-creation-intelligence-c01

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Functional beta sprint report"
test -f docs/functional-beta-sprint1/FUNCTIONAL-BETA-SPRINT1-REPORT.md

echo ""
echo "==> Functional Beta Sprint 1 verification complete"
