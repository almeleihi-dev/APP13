#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Profession Action Inventory tests"
npm run test:profession-action-inventory

echo "==> Action Intelligence Engine regression"
npm run test:action-intelligence-engine

echo "==> First Input Experience regression"
npm run test:first-input-experience

echo "==> Production build"
npm run build --workspace=apps/web

echo ""
echo "==> Profession Action Inventory verification complete"
