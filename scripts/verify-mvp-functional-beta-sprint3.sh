#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Functional Beta Sprint 3 tests"
npm run test:mvp-functional-beta-sprint3

echo "==> Functional beta sprint 3 stylesheet"
test -f apps/web/src/styles/an-act-functional-beta-sprint3.css
grep -q 'an-act-functional-beta-sprint3.css' apps/web/src/styles/global.css
grep -q 'an-act-living-s3' apps/web/src/main.tsx

echo "==> Functional Beta Sprint 2 regression"
npm run test:mvp-functional-beta-sprint2

echo "==> Functional Beta Sprint 1 regression"
npm run test:mvp-functional-beta-sprint1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Functional beta sprint 3 report"
test -f docs/functional-beta-sprint3/FUNCTIONAL-BETA-SPRINT3-REPORT.md

echo ""
echo "==> Functional Beta Sprint 3 verification complete"
