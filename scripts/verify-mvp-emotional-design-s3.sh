#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Emotional Design Sprint 3 tests"
npm run test:mvp-emotional-design-s3

echo "==> Emotional stylesheet"
test -f apps/web/src/styles/an-act-emotional-design-s3.css
grep -q 'an-act-emotional-design-s3.css' apps/web/src/styles/global.css

echo "==> Signature S2 regression"
npm run test:mvp-signature-experience-s2

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Emotional design report"
test -f docs/emotional-design-s3/EMOTIONAL-DESIGN-REPORT.md

echo ""
echo "==> Emotional Design Sprint 3 verification complete"
