#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Functional Beta Sprint 2 tests"
npm run test:mvp-functional-beta-sprint2

echo "==> Functional beta sprint 2 stylesheet"
test -f apps/web/src/styles/an-act-functional-beta-sprint2.css
grep -q 'an-act-functional-beta-sprint2.css' apps/web/src/styles/global.css
grep -q 'an-act-living-s2' apps/web/src/main.tsx

echo "==> Functional Beta Sprint 1 regression"
npm run test:mvp-functional-beta-sprint1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Functional beta sprint 2 report"
test -f docs/functional-beta-sprint2/FUNCTIONAL-BETA-SPRINT2-REPORT.md

echo ""
echo "==> Functional Beta Sprint 2 verification complete"
