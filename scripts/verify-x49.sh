#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X48 intelligent commission engine regression"
npm run verify:x48

echo "==> X49 personal assistant engine tests"
npm run test:x49-personal-assistant

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X49 personal assistant engine verification complete"
