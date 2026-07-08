#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH5-X2 AI Conversation Experience tests"
npm run test:ch5-x2-ai-conversation-experience
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH5-X2 AI Conversation Experience verification complete"
