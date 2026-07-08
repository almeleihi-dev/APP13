#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH5-X21 AI Operational Oversight Experience tests"
npm run test:ch5-x21-ai-operational-oversight-experience
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH5-X21 AI Operational Oversight Experience verification complete"
