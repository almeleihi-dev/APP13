#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X16 runtime health and diagnostics validation"
npm run test:ch3-x16-runtime-health

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH3-X16 AN ACT runtime health and diagnostics verification complete"
