#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Chapter 13.5 — Above-the-Fold Optimization tests"
npm run test:mvp-ch13-5-above-fold

echo "==> Chapter 13 executive experience regression"
npm run test:mvp-ch13-executive-experience

echo "==> Chapter 12 premium polish regression"
npm run test:mvp-ch12-premium-polish

echo "==> Platform build"
npm run build

echo "==> Chapter 13.5 verification complete"
