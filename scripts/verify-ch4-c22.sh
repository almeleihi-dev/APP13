#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH4-C22 action intelligence final closure tests"
npm run test:ch4-c22-action-intelligence-final-closure
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH4-C22 action intelligence final closure verification complete"
