#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Action Creation Intelligence Cycle 01 tests"
npm run test:mvp-action-creation-intelligence-c01

echo "==> Action creation intelligence stylesheet"
test -f apps/web/src/styles/an-act-action-creation-intelligence-c01.css
grep -q 'an-act-action-creation-intelligence-c01.css' apps/web/src/styles/global.css

echo "==> Marketplace Intelligence Cycle 01 regression"
npm run test:mvp-marketplace-intelligence-c01

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Action creation intelligence report"
test -f docs/action-creation-intelligence-c01/ACTION-CREATION-REPORT.md

echo ""
echo "==> Action Creation Intelligence Cycle 01 verification complete"
