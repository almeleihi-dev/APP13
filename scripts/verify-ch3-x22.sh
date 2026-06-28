#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X22 runtime executive dashboard validation"
npm run test:ch3-x22-runtime-executive-dashboard
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH3-X22 AN ACT runtime executive dashboard verification complete"
