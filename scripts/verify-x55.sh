#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X54 knowledge bank foundation regression"
npm run verify:x54

echo "==> X55 intelligence orchestration engine tests"
npm run test:x55-intelligence-orchestration

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X55 intelligence orchestration engine verification complete"
