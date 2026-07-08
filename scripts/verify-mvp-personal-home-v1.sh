#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Personal Home Experience v1 tests"
npm run test:mvp-personal-home-v1

echo "==> Personal Home page"
test -f apps/web/src/pages/PersonalHomeDashboardPage.tsx
test -f apps/web/src/passport/personal-home-presentation.ts

echo "==> Platform routing"
grep -q 'PersonalHomeDashboardPage' apps/web/src/PlatformApp.tsx
grep -q 'personal-home' apps/web/src/PlatformApp.tsx
grep -q 'function goHome' apps/web/src/PlatformApp.tsx

echo "==> Styles"
grep -q 'an-act-personal-home.css' apps/web/src/styles/global.css

echo "==> Personal Home Experience v1 verification complete"
echo ""
echo "Local manual verification:"
echo "  1. Complete passport onboarding → lands on Personal Home (not generic landing)"
echo "  2. Reload /home → Personal Home persists"
echo "  3. Verify hero: photo, name, title, Live Frame, trust score, passport access"
echo "  4. Verify Today's Activity, Action Workspace, Trust & Growth sections"
echo "  5. Quick actions: Find Action → runtime; Edit Passport → profile form"
echo "  6. Exit runtime → returns to Personal Home"
