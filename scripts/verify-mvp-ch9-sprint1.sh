#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 9 Sprint 1 — Production Operations RC tests"
npm run test:mvp-ch9-sprint1

echo "==> Chapter 8 Sprint 4 regression"
npm run test:mvp-ch8-sprint4

echo "==> Chapter 7 Sprint 4 regression"
npm run test:mvp-ch7-sprint4

echo "==> Platform build"
npm run build

echo "==> Chapter 9 Sprint 1 verification complete"
