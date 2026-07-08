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

echo "==> Web build (PWA)"
npm install --prefix apps/web
npm --prefix apps/web run build

echo "==> MVP RC2 regression"
npm run verify:mvp-rc2

echo "==> MVP Phase 8 evolution tests"
npm run test:mvp-phase8

echo "==> Import lint (architecture boundaries)"
npm run lint:imports

echo "==> Phase 8 feature grep checks"
grep -q "RegisterProviderPage" apps/web/src/App.tsx
grep -q "AiAssistantPanel" apps/web/src/pages/RuntimePage.tsx
grep -q "MarketplaceActionsBar" apps/web/src/pages/RuntimePage.tsx
grep -q "vite-plugin-pwa" apps/web/vite.config.ts
grep -q "getProfessionalPassport" packages/runtime-client/src/runtime-client.ts
grep -q "loadNeedEmptyState" packages/runtime-client/src/runtime-client.ts

echo "==> PWA asset check"
test -f apps/web/dist/manifest.webmanifest
SW_FILE="$(find apps/web/dist -name 'sw*.js' -o -name 'workbox-*.js' 2>/dev/null | head -1 || true)"
if [ -z "${SW_FILE}" ]; then
  echo "Service worker bundle not found in dist" >&2
  exit 1
fi
echo "Service worker OK: ${SW_FILE}"

echo "==> Performance budget"
BUNDLE="$(grep -o 'assets/index-[^"]*\.js' apps/web/dist/index.html | head -1)"
BUNDLE_SIZE="$(wc -c < "apps/web/dist/${BUNDLE}")"
if [ "${BUNDLE_SIZE}" -gt 589824 ]; then
  echo "Bundle exceeds 576KB Phase 8 budget: ${BUNDLE_SIZE} bytes" >&2
  exit 1
fi
echo "Bundle size OK: ${BUNDLE_SIZE} bytes"

echo ""
echo "AN ACT MVP Phase 8 evolution verification complete"
