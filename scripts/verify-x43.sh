#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X42 project decomposition engine regression"
npm run verify:x42

echo "==> X43 TEKRR intelligence synthesis engine tests"
npm run test:x43-tekrr-intelligence

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X43 TEKRR intelligence synthesis engine verification complete"
