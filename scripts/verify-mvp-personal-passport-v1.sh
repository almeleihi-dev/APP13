#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Personal Professional Passport v1 tests"
npm run test:mvp-personal-passport-v1

echo "==> Platform router wired for passport journey"
grep -q 'shouldStartPassportJourney' apps/web/src/PlatformApp.tsx
grep -q 'ProfileStartPage' apps/web/src/PlatformApp.tsx
grep -q 'PersonalPassportDashboardPage' apps/web/src/PlatformApp.tsx

echo "==> Passport persistence module"
test -f apps/web/src/passport/personal-passport-persistence.ts

echo "==> Presentation styles"
grep -q 'an-act-personal-passport.css' apps/web/src/styles/global.css

echo "==> Launch reset clears passport"
grep -q 'clearPersonalPassport' apps/web/src/launch/launch-bootstrap.ts

echo "==> Personal Professional Passport v1 verification complete"
echo ""
echo "Local manual verification:"
echo "  1. http://127.0.0.1:5173/?launch=reset"
echo "     Splash → key → /start → ACT → /preview → Final Act → /home"
echo "  2. Profile Start — enter name, title, location, skill, summary; upload photo"
echo "  3. Passport Dashboard — verify Live Frame, Action Groups, Trust, Classification"
echo "  4. Enter platform — landing passport card shows your name (not placeholder)"
echo "  5. Reload /home — passport journey skipped; landing shows saved identity"
