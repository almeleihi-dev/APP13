#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X29 runtime launch readiness authority validation"
npm run test:ch3-x29-runtime-launch-readiness-authority
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH3-X29 AN ACT runtime launch readiness authority verification complete"
