#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Sync design tokens"
npm run sync:tokens

echo "==> Build render layer packages"
npm run build:render-layer

echo "==> Install web app dependencies"
npm install --prefix apps/web

echo "==> Build web app"
npm --prefix apps/web run build

echo "==> Phase 1 foundation tests"
npm run test:render-layer-foundation

echo "==> Phase 2 web shell tests"
npm run test:render-layer-phase2

echo "==> Phase 3 user journey tests"
npm run test:render-layer-phase3

echo "==> Phase 4 brand experience tests"
npm run test:render-layer-phase4

echo "==> Phase 5 production experience tests"
npm run test:render-layer-phase5

echo "==> Brand verification"
test -f apps/web/public/manifest.webmanifest
test -f apps/web/public/favicon.svg
test -f apps/web/public/icons/an-act-icon-192.svg
test -f apps/web/public/icons/an-act-icon-512.svg
test -f apps/web/public/icons/an-act-apple-touch-icon.svg
test -f packages/runtime-ui/dist/react/styles/an-act-production.css
grep -q '"id": "an-act"' apps/web/public/manifest.webmanifest
grep -q "an-act-splash" packages/runtime-ui/src/react/styles/an-act-production.css

echo "==> Responsive verification"
grep -q "@media (max-width: 640px)" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "@media (min-width: 1024px)" packages/runtime-ui/src/react/styles/an-act-production.css

echo "==> Accessibility verification"
grep -q "an-act-skip-link" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q ":focus-visible" packages/runtime-ui/src/react/styles/an-act-brand.css
grep -q "prefers-reduced-motion" packages/runtime-ui/src/react/styles/an-act-production.css

echo "==> Performance verification"
grep -q "contain: layout style paint" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "touch-action: manipulation" packages/runtime-ui/src/react/styles/an-act-production.css
BUNDLE="$(grep -o 'assets/index-[^"]*\.js' apps/web/dist/index.html | head -1)"
BUNDLE_SIZE="$(wc -c < "apps/web/dist/${BUNDLE}")"
if [ "${BUNDLE_SIZE}" -gt 524288 ]; then
  echo "Bundle exceeds 512KB budget: ${BUNDLE_SIZE} bytes"
  exit 1
fi
echo "Bundle size OK: ${BUNDLE_SIZE} bytes"

echo "==> Theme verification"
node --import tsx --input-type=module -e "
import { buildThemeCssVariables, AN_ACT_TRANSITION_DURATION_MS } from './packages/tokens/src/index.ts';
const need = buildThemeCssVariables('need');
const action = buildThemeCssVariables('action');
if (need['--an-act-color-background-primary'] !== '#FFFFFF') throw new Error('Need bg');
if (action['--an-act-color-background-primary'] !== '#000000') throw new Error('Action bg');
if (AN_ACT_TRANSITION_DURATION_MS !== 640) throw new Error('transition ms');
console.log('Theme tokens verified');
"

echo "==> Need experience regression"
npm run test:ch3-x5-need-experience

echo "==> Platform build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "Render Layer Phase 5 verification complete"
