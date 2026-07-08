#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 9 Sprint 4 — AN ACT v1 Certification RC tests"
npm run test:mvp-ch9-sprint4

echo "==> Chapter 9 Sprint 3 regression"
npm run test:mvp-ch9-sprint3

echo "==> Chapter 9 Sprint 2 regression"
npm run test:mvp-ch9-sprint2

echo "==> Chapter 8 Sprint 4 regression"
npm run test:mvp-ch8-sprint4

echo "==> Platform build"
npm run build

echo "==> Chapter 9 Sprint 4 verification complete"
