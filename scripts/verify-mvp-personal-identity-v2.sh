#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Personal Identity Integration v2 tests"
npm run test:mvp-personal-identity-v2

echo "==> Active identity module"
test -f apps/web/src/passport/personal-identity.ts
test -f apps/web/src/passport/usePersonalIdentity.ts
test -f apps/web/src/passport/ActiveIdentityProfileCard.tsx

echo "==> Platform surfaces wired"
grep -q 'usePersonalIdentity' apps/web/src/pages/PartnerLandingPage.tsx
grep -q 'PlatformIdentityRuntimeBar' apps/web/src/pages/RuntimePage.tsx
grep -q 'personalDashboardGreeting' apps/web/src/pages/PersonalPassportDashboardPage.tsx

echo "==> Identity styles imported"
grep -q 'an-act-personal-identity.css' apps/web/src/styles/global.css

echo "==> Personal Identity Integration v2 verification complete"
echo ""
echo "Local manual verification:"
echo "  1. Complete passport onboarding (or use existing saved passport)"
echo "  2. /home landing — nav chip, greeting, passport card, Live Frame tier highlight"
echo "  3. Enter live platform — runtime header chip + operating-as bar"
echo "  4. Founder / Executive / Demo consoles — identity rail in header"
echo "  5. Reload any screen — identity persists from localStorage"
