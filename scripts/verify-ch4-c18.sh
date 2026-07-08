#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH4-C18 action intelligence experience tests"
npm run test:ch4-c18-action-intelligence-experience
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH4-C18 action intelligence experience verification complete"
