#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 10 Sprint 1 — Live Marketplace Operations RC tests"
npm run test:mvp-ch10-sprint1

echo "==> Chapter 9 Sprint 4 regression"
npm run test:mvp-ch9-sprint4

echo "==> Chapter 9 Sprint 3 regression"
npm run test:mvp-ch9-sprint3

echo "==> Platform build"
npm run build

echo "==> Chapter 10 Sprint 1 verification complete"
