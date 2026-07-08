#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Phase 12 premium identity tests"
npm run test:mvp-phase12

echo "==> Web typecheck"
npm --prefix apps/web exec tsc --noEmit

echo "==> Phase 12 verification complete"
