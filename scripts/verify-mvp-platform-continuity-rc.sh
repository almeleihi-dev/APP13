#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Platform Visual Continuity RC tests"
npm run test:mvp-platform-continuity-rc

echo "==> Continuity stylesheet wired"
grep -q 'an-act-platform-continuity.css' apps/web/src/styles/global.css

echo "==> Platform Visual Continuity RC verification complete"
