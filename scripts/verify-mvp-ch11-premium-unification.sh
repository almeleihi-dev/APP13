#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 11 — Premium Design System Unification tests"
npm run test:mvp-ch11-premium-unification

echo "==> Phase 13 premium identity regression"
npm run test:mvp-phase13

echo "==> Phase 12 premium identity regression"
npm run test:mvp-phase12

echo "==> Platform build"
npm run build

echo "==> Chapter 11 verification complete"
