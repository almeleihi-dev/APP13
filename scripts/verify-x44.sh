#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X43 TEKRR intelligence synthesis engine regression"
npm run verify:x43

echo "==> X44 milestone & evidence compilation engine tests"
npm run test:x44-execution-blueprint

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X44 milestone & evidence compilation engine verification complete"
