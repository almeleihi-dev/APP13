#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH2-X19 living professional timeline tests"
npm run test:ch2-x19-living-professional-timeline

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH2-X19 living professional timeline verification complete"
