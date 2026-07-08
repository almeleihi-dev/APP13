#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Action Intelligence Engine tests"
npm run test:action-intelligence-engine

echo "==> Functional beta sprint 5 stylesheet"
test -f apps/web/src/styles/an-act-functional-beta-sprint5.css
grep -q 'an-act-functional-beta-sprint5.css' apps/web/src/styles/global.css
grep -q 'an-act-living-s5' apps/web/src/main.tsx

echo "==> First Input Experience regression"
npm run test:first-input-experience

echo "==> Functional Beta Sprint 4 regression"
npm run test:mvp-functional-beta-sprint4

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Action Intelligence Engine report"
test -f docs/functional-beta-sprint5/FUNCTIONAL-BETA-SPRINT5-REPORT.md

echo ""
echo "==> Action Intelligence Engine verification complete"
