#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X51 learn by action engine regression"
npm run verify:x51

echo "==> X52 expert network engine tests"
npm run test:x52-expert-network

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X52 expert network engine verification complete"
