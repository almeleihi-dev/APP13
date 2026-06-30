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

echo "==> Render Layer verification (Phases 1–5)"
npm run verify:render-layer-phase5

echo "==> Runtime experience verification"
npm run test:ch3-x5-need-experience
npm run test:ch3-x6-action-experience

echo "==> AI experience foundation"
npm run test:ch5-x1-ai-experience-foundation

echo "==> MVP RC1 readiness tests"
npm run test:mvp-rc1

echo "==> End-to-end journey verification (service + render layer)"
node --import tsx --input-type=module -e "
import { createNeedExperienceService, createNeedRepository } from './src/runtime-experience/need/module.ts';
import { createActionExperienceService, createActionRepository } from './src/runtime-experience/action/module.ts';

const auth = { userId: 'rc1-e2e', sessionId: 'rc1', roles: ['customer'], scopes: [], authenticated: true };
const at = '2026-06-28T12:00:00.000Z';
const need = createNeedExperienceService({ repository: createNeedRepository() });
const action = createActionExperienceService({ repository: createActionRepository() });

const home = need.getExperience(auth, { generated_at: at });
if (home.current_screen !== 'need-home') throw new Error('need home');

const search = need.performSearch(auth, { keyword: 'electrician', generated_at: at });
if (search.screen.screenId !== 'opportunity-list') throw new Error('search');

need.getRequest(auth, { opportunity_id: 'opp-1', generated_at: at });
need.dispatchAction(auth, { type: 'update-request', fields: { location: 'Riyadh', schedule: 'Mon 10:00' } });
const transition = need.continueRequest(auth, { generated_at: at });
if (transition.screen.screenId !== 'transition') throw new Error('transition');
if (transition.transition.brandLine !== 'an act...') throw new Error('brand line');

action.enterFromNeedTransition(auth, { generated_at: at, need_handoff: { actionSummary: 'Panel', location: 'Riyadh', schedule: 'Mon', estimatedCost: 850 } });
const contract = action.getContract(auth, { generated_at: at });
if (contract.screenId !== 'contract-preview') throw new Error('contract preview');

console.log('E2E journey verified: need-home → search → request → transition → contract-preview');
"

echo "==> Import lint (architecture boundaries)"
npm run lint:imports

echo "==> Brand & accessibility grep checks"
grep -q "an-act-splash" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "an-act-skip-link" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "LocalStorageAuthStorage" apps/web/src/providers/RuntimeProvider.tsx
grep -q "Try again" apps/web/src/pages/RuntimePage.tsx

echo "==> Performance budget"
BUNDLE="$(grep -o 'assets/index-[^"]*\.js' apps/web/dist/index.html | head -1)"
BUNDLE_SIZE="$(wc -c < "apps/web/dist/${BUNDLE}")"
if [ "${BUNDLE_SIZE}" -gt 524288 ]; then
  echo "Bundle exceeds 512KB: ${BUNDLE_SIZE} bytes" >&2
  exit 1
fi
echo "Bundle size OK: ${BUNDLE_SIZE} bytes"

echo ""
echo "AN ACT MVP Launch Candidate RC1 verification complete"
