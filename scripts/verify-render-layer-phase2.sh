#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Sync design tokens"
tsx scripts/sync-an-act-tokens.ts

echo "==> Build render layer packages"
npm run build:render-layer
npm run build:runtime-client

echo "==> Install web app dependencies"
npm install --prefix apps/web

echo "==> Build web app"
npm --prefix apps/web run build

echo "==> Phase 1 foundation tests"
npm run test:render-layer-foundation

echo "==> Phase 2 web shell tests"
npm run test:render-layer-phase2

echo "==> Platform build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "Render Layer Phase 2 verification complete"
