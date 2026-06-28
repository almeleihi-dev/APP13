#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X30 runtime executive launch authority validation"
npm run test:ch3-x30-runtime-executive-launch-authority
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH3-X30 AN ACT runtime executive launch authority verification complete"
