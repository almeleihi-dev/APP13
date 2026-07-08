#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Living Platform Evolution Phase One tests"
npm run test:mvp-living-platform-evolution-p1

echo "==> Living evolution stylesheet"
test -f apps/web/src/styles/an-act-living-platform-evolution-p1.css
grep -q 'an-act-living-platform-evolution-p1.css' apps/web/src/styles/global.css

echo "==> Emotional Design S3 regression"
npm run test:mvp-emotional-design-s3

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Evolution report"
test -f docs/living-platform-evolution-p1/EVOLUTION-REPORT.md

echo ""
echo "==> Living Platform Evolution Phase One verification complete"
