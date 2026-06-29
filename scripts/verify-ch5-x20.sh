#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH5-X20 AI Conformance Validation Experience tests"
npm run test:ch5-x20-ai-conformance-validation-experience
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH5-X20 AI Conformance Validation Experience verification complete"
