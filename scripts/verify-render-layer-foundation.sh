#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Sync design tokens to @an-act/tokens"
tsx scripts/sync-an-act-tokens.ts

echo "==> Build render layer packages"
npm run build:render-layer

echo "==> Render layer foundation tests"
npm run test:render-layer-foundation

echo "==> Platform build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "Render Layer Phase 1 foundation verification complete"
