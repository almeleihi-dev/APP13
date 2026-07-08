#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Public Beta Readiness Polish v1 tests"
npm run test:mvp-public-beta-polish-v1

echo "==> Public beta gates"
test -f apps/web/src/lib/public-beta.ts
grep -q 'PUBLIC_BETA_MODE' apps/web/src/lib/public-beta.ts

echo "==> Polish styles"
test -f apps/web/src/styles/an-act-public-beta-polish.css
grep -q 'an-act-public-beta-polish.css' apps/web/src/styles/global.css

echo "==> Journey pages"
test -f apps/web/src/pages/PersonalHomeDashboardPage.tsx
test -f apps/web/src/pages/ProfileStartPage.tsx
test -f apps/web/src/pages/PersonalPassportDashboardPage.tsx
test -f apps/web/src/pages/RuntimePage.tsx

echo "==> Readiness report"
test -f docs/public-beta-v1/PUBLIC-BETA-READINESS-REPORT.md

echo "==> Public Beta Readiness Polish v1 verification complete"
echo ""
echo "Manual verification (production build):"
echo "  1. Launch → Final Act → Profile Start → Passport → Personal Home"
echo "  2. Runtime exit → Personal Home; Edit Passport cancel → Personal Home"
echo "  3. No developer demo console on enterprise landing in prod"
echo "  4. Empty draft/saved panels show guidance copy"
echo "  5. Mobile layout at 375px for passport, home, Live Frame cards"
