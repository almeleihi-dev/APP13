#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Public Beta RC1 certification tests"
npm run test:mvp-public-beta-rc1

echo "==> Public Beta Polish v1 regression"
npm run test:mvp-public-beta-polish-v1

echo "==> Personal Passport v1 regression"
npm run test:mvp-personal-passport-v1

echo "==> Personal Identity v2 regression"
npm run test:mvp-personal-identity-v2

echo "==> Personal Home v1 regression"
npm run test:mvp-personal-home-v1

echo "==> Production build"
npm run build --workspace=apps/web

echo "==> Deployment config"
test -f vercel.json
grep -q 'apps/web/dist' vercel.json

echo "==> Executive certification report"
test -f docs/public-beta-rc1/EXECUTIVE-CERTIFICATION-REPORT.md

echo ""
echo "==> Public Beta RC1 certification complete"
