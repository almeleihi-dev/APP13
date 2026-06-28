#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH4-B0 architecture stabilization validation"
npm run test:ch4-b0-architecture-stabilization
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "==> CH3-FINAL regression spot-check"
npm run verify:ch3-final
echo "CH4-B0 AN ACT architecture stabilization verification complete"
