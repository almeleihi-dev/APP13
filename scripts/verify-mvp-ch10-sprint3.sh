#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 10 Sprint 3 — Executive Intelligence Center RC tests"
npm run test:mvp-ch10-sprint3

echo "==> Chapter 10 Sprint 2 regression"
npm run test:mvp-ch10-sprint2

echo "==> Chapter 10 Sprint 1 regression"
npm run test:mvp-ch10-sprint1

echo "==> Platform build"
npm run build

echo "==> Chapter 10 Sprint 3 verification complete"
