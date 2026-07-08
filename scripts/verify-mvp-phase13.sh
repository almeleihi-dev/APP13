#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Phase 13 enterprise refinement tests"
npm run test:mvp-phase13

echo "==> Root build"
npm run build

echo "==> Phase 13 verification complete"
