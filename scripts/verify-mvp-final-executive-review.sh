#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> AN ACT v1 Final Executive Review tests"
npm run test:mvp-final-executive-review

echo "==> Chapter 10 Sprint 4 regression"
npm run test:mvp-ch10-sprint4

echo "==> Platform build"
npm run build

echo "==> AN ACT v1 Final Executive Review verification complete"
