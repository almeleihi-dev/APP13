#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X45 blueprint governance & global registry engine regression"
npm run verify:x45

echo "==> X46 marketplace compilation engine tests"
npm run test:x46-marketplace-compilation

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X46 marketplace compilation engine verification complete"
