#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> X53 team builder engine regression"
npm run verify:x53

echo "==> X54 knowledge bank foundation tests"
npm run test:x54-knowledge-bank

echo "==> Build"
npm run build

echo "==> Import lint"
npm run lint:imports

echo "X54 knowledge bank foundation verification complete"
