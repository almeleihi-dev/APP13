#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Product Intelligence Cycle 01 tests"
npm run test:mvp-product-intelligence-cycle01

echo "==> Product intelligence stylesheet"
test -f apps/web/src/styles/an-act-product-intelligence-cycle01.css
grep -q 'an-act-product-intelligence-cycle01.css' apps/web/src/styles/global.css

echo "==> Living Platform P1 regression"
npm run test:mvp-living-platform-evolution-p1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Product intelligence report"
test -f docs/product-intelligence-cycle01/PRODUCT-INTELLIGENCE-REPORT.md

echo ""
echo "==> Product Intelligence Cycle 01 verification complete"
