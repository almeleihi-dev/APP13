#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X16 living professional goals tests"
npm run test:ch2-x16-living-professional-goals

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X16 living professional goals verification complete"
