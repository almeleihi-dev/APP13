#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${ROOT}/.verify/node-v20.18.1-darwin-arm64/bin:${PATH}"

echo "==> Public Beta RC1 baseline regression"
npm run verify:mvp-public-beta-rc1

echo "==> Experience Excellence Sprint 1"
npm run verify:mvp-experience-excellence-s1

echo "==> Signature Experience Sprint 2"
npm run verify:mvp-signature-experience-s2

echo "==> Emotional Design Sprint 3"
npm run verify:mvp-emotional-design-s3

echo "==> Living Platform Evolution Phase One"
npm run verify:mvp-living-platform-evolution-p1

echo "==> Product Intelligence Cycle 01"
npm run verify:mvp-product-intelligence-cycle01

echo "==> Marketplace Intelligence Cycle 01"
npm run verify:mvp-marketplace-intelligence-c01

echo "==> Action Creation Intelligence Cycle 01"
npm run verify:mvp-action-creation-intelligence-c01

echo "==> Deployment config"
test -f vercel.json
grep -q 'apps/web/dist' vercel.json

echo ""
echo "==> Public Beta RC2 certification complete"
