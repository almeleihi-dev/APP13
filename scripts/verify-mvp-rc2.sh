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

echo "==> MVP RC1 regression"
npm run test:mvp-rc1

echo "==> MVP RC2 readiness tests"
npm run test:mvp-rc2

echo "==> End-to-end first-user journey (service layer)"
node --import tsx --input-type=module -e "
import { createNeedExperienceService, createNeedRepository } from './src/runtime-experience/need/module.ts';
import { createActionExperienceService, createActionRepository } from './src/runtime-experience/action/module.ts';

const auth = { userId: 'rc2-e2e', sessionId: 'rc2', roles: ['customer'], scopes: [], authenticated: true };
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

const entered = action.enterFromNeedTransition(auth, {
  generated_at: at,
  need_handoff: { actionSummary: 'Panel', location: 'Riyadh', schedule: 'Mon', estimatedCost: 850 },
});
if (entered.current_screen !== 'action-home') throw new Error('action home');

const contract = action.getContract(auth, { generated_at: at });
if (contract.screenId !== 'contract-preview') throw new Error('contract preview');

const active = action.continueContract(auth, { generated_at: at });
if (active.screen.screenId !== 'active-action') throw new Error('active action');

const progress = action.getProgress(auth, { generated_at: at });
if (progress.screenId !== 'progress-screen') throw new Error('progress');

const completed = action.completeAction(auth, { generated_at: at });
if (completed.screen.screenId !== 'completion-screen') throw new Error('completion');

const returned = action.startReturnTransition(auth, { generated_at: at });
if (returned.next_mode !== 'need') throw new Error('return to need');

console.log('E2E journey verified: splash path → need → search → request → contract → action → execution → completion → feedback');
"

echo "==> Import lint (architecture boundaries)"
npm run lint:imports

echo "==> Registration & authentication grep checks"
grep -q "RegisterPage" apps/web/src/App.tsx
grep -q "registerCustomer" packages/runtime-client/src/auth-client.ts
grep -q "onRefresh" packages/runtime-client/src/http-client.ts
grep -q "action.continue-contract" apps/web/src/providers/RuntimeProvider.tsx
grep -q "start-return-transition" packages/runtime-core/src/action-intent-resolver.ts

echo "==> Accessibility grep checks"
grep -q "an-act-skip-link" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "prefers-reduced-motion" packages/runtime-ui/src/react/styles/an-act-production.css
grep -q "role=\"alert\"" apps/web/src/pages/RegisterPage.tsx

echo "==> Performance budget"
BUNDLE="$(grep -o 'assets/index-[^"]*\.js' apps/web/dist/index.html | head -1)"
BUNDLE_SIZE="$(wc -c < "apps/web/dist/${BUNDLE}")"
if [ "${BUNDLE_SIZE}" -gt 524288 ]; then
  echo "Bundle exceeds 512KB: ${BUNDLE_SIZE} bytes" >&2
  exit 1
fi
echo "Bundle size OK: ${BUNDLE_SIZE} bytes"

echo ""
echo "AN ACT MVP Launch Candidate RC2 verification complete"
