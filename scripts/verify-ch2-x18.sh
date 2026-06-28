#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X18 living professional analytics tests"
npm run test:ch2-x18-living-professional-analytics

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X18 living professional analytics verification complete"
