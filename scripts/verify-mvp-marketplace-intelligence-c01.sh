#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Marketplace Intelligence Cycle 01 tests"
npm run test:mvp-marketplace-intelligence-c01

echo "==> Marketplace intelligence stylesheet"
test -f apps/web/src/styles/an-act-marketplace-intelligence-c01.css
grep -q 'an-act-marketplace-intelligence-c01.css' apps/web/src/styles/global.css

echo "==> Product Intelligence Cycle 01 regression"
npm run test:mvp-product-intelligence-cycle01

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Marketplace intelligence report"
test -f docs/marketplace-intelligence-c01/MARKETPLACE-INTELLIGENCE-REPORT.md

echo ""
echo "==> Marketplace Intelligence Cycle 01 verification complete"
