#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Experience Excellence Sprint 1 tests"
npm run test:mvp-experience-excellence-s1

echo "==> Excellence stylesheet"
test -f apps/web/src/styles/an-act-experience-excellence-s1.css
grep -q 'an-act-experience-excellence-s1.css' apps/web/src/styles/global.css

echo "==> RC1 regression"
npm run test:mvp-public-beta-rc1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Experience report"
test -f docs/experience-excellence-s1/EXPERIENCE-EXCELLENCE-REPORT.md

echo ""
echo "==> Experience Excellence Sprint 1 verification complete"
