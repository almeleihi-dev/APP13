#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-X10 notification experience validation"
npm run test:ch3-x10-notification-experience

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "CH3-X10 AN ACT notification experience verification complete"
