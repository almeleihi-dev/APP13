#!/usr/bin/env bash
# Deploy AN ACT Tier 1 presentation shell to Vercel (static).
# Requires: vercel CLI auth (`npx vercel login`) once per machine.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building production bundle"
npm run sync:tokens
npm --prefix apps/web run build

echo "==> Deploying to Vercel (production)"
npx vercel deploy --prod --yes --project web

echo "==> Tier 1 deployment complete"
