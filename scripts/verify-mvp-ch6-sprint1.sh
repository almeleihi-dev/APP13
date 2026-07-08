#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 6 Sprint 1 — Pilot Experience RC tests"
npm run test:mvp-ch6-sprint1

echo "==> Sprint 0 RC2 regression"
npm run test:mvp-sprint0-rc2

echo "==> MVP RC1 regression"
npm run test:mvp-rc1

echo "==> MVP RC2 regression"
npm run test:mvp-rc2

echo "==> Phase 11–13 presentation regression"
npm run test:mvp-phase11
npm run test:mvp-phase12
npm run test:mvp-phase13

echo "==> Platform build"
npm run build

echo "==> Chapter 6 Sprint 1 verification complete"
