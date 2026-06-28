#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X17 runtime demo mode validation"
npm run test:ch3-x17-runtime-demo

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH3-X17 AN ACT runtime demo mode verification complete"
