#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> CH3-FINAL runtime completion and certification validation"
npm run test:ch3-final-runtime-completion-certification
echo "==> Build"
npm run build
echo "==> Import lint"
npm run lint:imports
echo "CH3-FINAL AN ACT runtime completion and certification verification complete"
