#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 6 Sprint 4 — Controlled Pilot Validation tests"
npm run test:mvp-ch6-sprint4

echo "==> Chapter 6 Sprint 3 regression"
npm run test:mvp-ch6-sprint3

echo "==> Chapter 6 Sprint 2 regression"
npm run test:mvp-ch6-sprint2

echo "==> Chapter 6 Sprint 1 regression"
npm run test:mvp-ch6-sprint1

echo "==> Sprint 0 RC2 regression"
npm run test:mvp-sprint0-rc2

echo "==> MVP RC1 regression"
npm run test:mvp-rc1

echo "==> MVP RC2 regression"
npm run test:mvp-rc2

echo "==> Need experience validation"
npm run test:ch3-x5-need-experience

echo "==> Platform build"
npm run build

echo "==> Chapter 6 Sprint 4 verification complete"
