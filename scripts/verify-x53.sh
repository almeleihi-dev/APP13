#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X52 expert network engine regression"
npm run verify:x52

echo "==> X53 team builder engine tests"
npm run test:x53-team-builder

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X53 team builder engine verification complete"
