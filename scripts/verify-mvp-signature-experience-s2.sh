#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Signature Experience Sprint 2 tests"
npm run test:mvp-signature-experience-s2

echo "==> Signature stylesheet"
test -f apps/web/src/styles/an-act-signature-experience-s2.css
grep -q 'an-act-signature-experience-s2.css' apps/web/src/styles/global.css

echo "==> Excellence S1 regression"
npm run test:mvp-experience-excellence-s1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Signature report"
test -f docs/signature-experience-s2/SIGNATURE-EXPERIENCE-REPORT.md

echo ""
echo "==> Signature Experience Sprint 2 verification complete"
