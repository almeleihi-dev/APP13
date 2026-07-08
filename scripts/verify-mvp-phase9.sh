#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Sync design tokens"
npm run sync:tokens

echo "==> Platform build"
npm run build

echo "==> Render layer build"
npm run build:render-layer

echo "==> Web build"
npm install --prefix apps/web
npm --prefix apps/web run build

echo "==> Phase 8 regression"
npm run verify:mvp-phase8

echo "==> Phase 9 partner demo tests"
npm run test:mvp-phase9

echo "==> Phase 9.1 interactive Need MVP tests"
npm run test:mvp-phase91

echo "==> Phase 10 world-class UX tests"
npm run test:mvp-phase10

echo "==> Phase 11 runtime premium UX tests"
npm run test:mvp-phase11

echo "==> Phase 12 premium identity tests"
npm run test:mvp-phase12

echo "==> Phase 13 enterprise refinement tests"
npm run test:mvp-phase13

echo "==> Runtime demo backend verification"
npm run verify:ch3-x17

echo "==> Import lint"
npm run lint:imports

echo "==> Phase 9 presentation grep checks"
grep -q "PartnerLandingPage" apps/web/src/App.tsx
grep -q "DemoPresenterPage" apps/web/src/App.tsx
grep -q "ExecutivePresentationPage" apps/web/src/App.tsx
grep -q "demoLogin" apps/web/src/providers/RuntimeProvider.tsx
grep -q "startDemo" packages/runtime-client/src/runtime-client.ts
grep -q "an-act-runtime-premium" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "/runtime-demo" apps/web/vite.config.ts
test -f docs/demo/AN-ACT-Strategic-Partner-Demo-Guide.md
test -f docs/partner/Technical-Overview.md

echo "==> Partner demo documentation"
test -f docs/architecture/AN-ACT-Strategic-Partner-Demo-Phase-9.md
test -f docs/architecture/AN-ACT-MVP-Phase-9-Completion.md
test -f docs/implementation/MVP-Evolution-Phase-9.md

echo "==> Performance budget (Phase 9)"
BUNDLE="$(grep -o 'assets/index-[^"]*\.js' apps/web/dist/index.html | head -1)"
BUNDLE_SIZE="$(wc -c < "apps/web/dist/${BUNDLE}")"
if [ "${BUNDLE_SIZE}" -gt 655360 ]; then
  echo "Bundle exceeds 640KB Phase 9 budget: ${BUNDLE_SIZE} bytes" >&2
  exit 1
fi
echo "Bundle size OK: ${BUNDLE_SIZE} bytes"

echo ""
echo "AN ACT Strategic Partner Demo Phase 9 verification complete"
