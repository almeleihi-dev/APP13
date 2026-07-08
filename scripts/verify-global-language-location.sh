#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Global Language & Location Foundation tests"
npm run test:global-language-location

echo "==> Functional beta sprint 7 stylesheet"
test -f apps/web/src/styles/an-act-functional-beta-sprint7.css
grep -q 'an-act-functional-beta-sprint7.css' apps/web/src/styles/global.css
grep -q 'an-act-living-s7' apps/web/src/main.tsx

echo "==> Guest entry regression"
npm run test:guest-entry-experience

echo "==> Profession Action Inventory regression"
npm run test:profession-action-inventory

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Sprint 7 report"
test -f docs/functional-beta-sprint7/FUNCTIONAL-BETA-SPRINT7-REPORT.md

echo ""
echo "==> Global Language & Location Foundation verification complete"
