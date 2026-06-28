#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X4 visual prototype library validation"
npm run test:ch3-x4-visual-prototype-library

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH3-X4 AN ACT visual prototype library verification complete"
