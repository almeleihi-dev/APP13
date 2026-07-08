#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH5-X17 AI Executive Advisory Experience tests"
npm run test:ch5-x17-ai-executive-advisory-experience
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH5-X17 AI Executive Advisory Experience verification complete"
