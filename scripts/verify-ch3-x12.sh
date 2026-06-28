#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X12 complete runtime journey validation"
npm run test:ch3-x12-runtime-journey

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH3-X12 AN ACT complete runtime journey verification complete"
