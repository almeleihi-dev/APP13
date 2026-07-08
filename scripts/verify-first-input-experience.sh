#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> First Input Experience tests"
npm run test:first-input-experience

echo "==> First input experience stylesheet"
test -f apps/web/src/styles/an-act-first-input-experience.css
grep -q 'an-act-first-input-experience.css' apps/web/src/styles/global.css

echo "==> Living Platform Evolution P1 regression"
npm run test:mvp-living-platform-evolution-p1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> First input experience report"
test -f docs/first-input-experience/FIRST-INPUT-EXPERIENCE-REPORT.md

echo ""
echo "==> First Input Experience verification complete"
