#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X41 profession ontology mapping engine regression"
npm run verify:x41

echo "==> X42 project decomposition engine tests"
npm run test:x42-project-decomposition

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X42 project decomposition engine verification complete"
