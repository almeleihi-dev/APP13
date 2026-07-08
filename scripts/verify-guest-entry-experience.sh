#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Guest Entry Experience tests"
npm run test:guest-entry-experience

echo "==> Functional beta sprint 6 stylesheet"
test -f apps/web/src/styles/an-act-functional-beta-sprint6.css
grep -q 'an-act-functional-beta-sprint6.css' apps/web/src/styles/global.css
grep -q 'an-act-living-s6' apps/web/src/main.tsx

echo "==> Profession Action Inventory regression"
npm run test:profession-action-inventory

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Guest entry experience report"
test -f docs/functional-beta-sprint6/FUNCTIONAL-BETA-SPRINT6-REPORT.md

echo ""
echo "==> Guest Entry Experience verification complete"
