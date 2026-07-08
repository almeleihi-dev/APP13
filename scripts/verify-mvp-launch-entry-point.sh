#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Launch entry point tests"
npm run test:mvp-launch-entry-point

echo "==> Launch bootstrap wired in main.tsx"
grep -q 'runLaunchBootstrap' apps/web/src/main.tsx
grep -q 'launch-bootstrap' apps/web/src/main.tsx

echo "==> Launch reset query support"
grep -q 'isResetLaunchUrl' apps/web/src/launch/launch-persistence.ts
grep -q 'resetAllLaunchState' apps/web/src/launch/launch-persistence.ts

echo "==> StrictMode-safe splash navigation"
grep -q 'scheduleSplashNavigate' apps/web/src/launch/launch-navigate.ts

echo "==> Launch entry point verification complete"
echo ""
echo "Local manual verification:"
echo "  1. http://127.0.0.1:5173/?launch=reset  → Splash → key → /start → ACT → /preview → Final Act → /home"
echo "  2. http://127.0.0.1:5173/?launch=replay  → same full onboarding flow"
echo "  3. http://127.0.0.1:5173/               → identity splash → /home (after completion)"
