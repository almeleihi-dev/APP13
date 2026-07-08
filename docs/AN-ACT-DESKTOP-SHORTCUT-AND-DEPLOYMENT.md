# AN ACT — Desktop Shortcut & Shareable Demo Deployment Plan

**Purpose:** Plan and preparation only. No deployment executed. No business logic, Runtime JSON, API, or redesign changes.

**Date:** 2026-06-28

---

## Repository structure (what to deploy)

| Layer | Path | Role |
|---|---|---|
| **Web app (deploy target)** | `apps/web/` | Vite + React partner landing, demo presenter, live platform shell |
| **Render packages (bundled into web)** | `packages/tokens/`, `packages/runtime-core/`, `packages/runtime-ui/`, `packages/runtime-client/` | Design tokens, Runtime JSON types, UI components, HTTP client |
| **Platform API (not Vercel-static)** | `src/` (root) | Fastify API on port **3000** — requires PostgreSQL, Redis, and S3-compatible storage |

The shareable **frontend** lives in `apps/web/`. The **backend** is a separate Node process at the repo root (`npm start` after `npm run build`).

This is **not** an npm workspaces monorepo. Local packages are linked via `file:../../packages/...` in `apps/web/package.json`. Vite resolves package **source** directly through aliases in `apps/web/vite.config.ts`, so a web production build bundles from `packages/*/src` without requiring pre-built package `dist/` folders.

---

## Part 1 — macOS desktop shortcut

### Goal

One-click launcher on the Desktop that opens the local AN ACT dev URL with the AN ACT logo as the icon.

### Recommended local URL

| Service | Default URL | Start command |
|---|---|---|
| Web shell | `http://localhost:5173/` | `npm run dev:web` (from repo root) |
| API (for live demo / login) | `http://localhost:3000/` | `npm run dev` or `npm start` |

The shortcut should open **`http://localhost:5173/`** — the standard Vite dev server defined in `apps/web/vite.config.ts`.

> **Note:** The landing page and executive presentation work without the API. Live platform, guided demo with live data, and login require the API server plus Docker services (Postgres, Redis, MinIO). See [How to run the local app](#how-to-run-the-local-app).

### Where the logo / icon should come from

Official brand assets already exist under the web public folder:

| Asset | Path | Use |
|---|---|---|
| Favicon | `apps/web/public/favicon.svg` | Browser tab; base for small icons |
| 512×512 icon | `apps/web/public/icons/an-act-icon-512.svg` | **Recommended source** for Desktop icon |
| 192×192 icon | `apps/web/public/icons/an-act-icon-192.svg` | PWA / medium size |
| Apple touch | `apps/web/public/icons/an-act-apple-touch-icon.svg` | iOS / macOS touch targets |

The in-app **3D keyboard key** mark (`packages/runtime-ui/src/react/brand/AnActLogoKey.tsx`) is CSS-rendered and is **not** suitable as a `.icns` source without exporting a raster first.

**Recommended icon workflow:**

1. Export `apps/web/public/icons/an-act-icon-512.svg` to PNG at 1024×1024 (Preview, Figma, or `qlmanage -t`).
2. On macOS, open the PNG → **Copy** → select the shortcut → **Get Info** → click the icon in the top-left → **Paste**.

For a polished `.icns`, use macOS `iconutil` or any SVG→ICNS converter; source artwork should remain the public SVG above.

### Option A — Simple `.webloc` (fastest, limited icon control)

1. Open Safari or Chrome and navigate to `http://localhost:5173/`.
2. Drag the URL from the address bar to the Desktop.
3. macOS creates `localhost.webloc`.
4. Rename to `AN ACT.webloc`.
5. Apply custom icon via **Get Info** (PNG paste method above).

**Pros:** Zero scripts. **Cons:** Does not start the dev server; only opens the URL if something is already listening on 5173.

### Option B — Automator `.app` (recommended)

Creates a real Desktop application with a custom icon.

1. Open **Automator** → **New Document** → **Application**.
2. Add action **Run Shell Script** (shell: `/bin/bash`).
3. Paste:

```bash
#!/bin/bash
# Opens AN ACT local dev shell (assumes Vite is already running)
open "http://localhost:5173/"
```

4. **File → Save** as `AN ACT.app` on the Desktop.
5. **Get Info** on `AN ACT.app` → paste the PNG icon (from `an-act-icon-512.svg` export).

**To open:** Double-click `AN ACT.app` on the Desktop.

### Option C — `.app` that starts servers, then opens the browser

Use when you want one click to boot everything (first launch is slower).

```bash
#!/bin/bash
REPO="$HOME/Desktop/APP13"   # adjust to your clone path
cd "$REPO" || exit 1

# Start API in background if not already listening
if ! curl -sf http://127.0.0.1:3000/health >/dev/null 2>&1; then
  osascript -e 'tell app "Terminal" to do script "cd '"$REPO"' && npm run dev"'
fi

# Start web shell in background if not already listening
if ! curl -sf http://127.0.0.1:5173/ >/dev/null 2>&1; then
  osascript -e 'tell app "Terminal" to do script "cd '"$REPO"' && npm run dev:web"'
fi

# Wait for Vite (up to ~30s)
for i in $(seq 1 30); do
  curl -sf http://127.0.0.1:5173/ >/dev/null 2>&1 && break
  sleep 1
done

open "http://localhost:5173/"
```

Save via Automator as `AN ACT (Dev).app` and apply the same icon.

### Option D — Install as PWA (Dock icon, no Automator)

With the dev or production web shell served over **HTTPS** (or `localhost`):

1. Open `http://localhost:5173/` in Chrome.
2. **Install AN ACT** from the address-bar install prompt (manifest: `apps/web/public/manifest.webmanifest`).
3. Launch from Applications or Dock — uses manifest icons automatically.

Best for production/preview builds; less ideal for day-to-day dev with HMR unless you accept reinstall on URL changes.

---

## How to run the local app

### Minimal (landing + presentation only)

```bash
cd /path/to/APP13
npm run dev:web
```

Open **http://localhost:5173/** — partner landing, executive presentation shell, and static partner content render without the API.

### Full partner demo (live platform, login, guided demo with API)

**Terminal 1 — infrastructure:**

```bash
cd /path/to/APP13
docker compose up -d    # Postgres, Redis, MinIO
npm run migrate         # first time / after schema changes
```

**Terminal 2 — API:**

```bash
cd /path/to/APP13
cp .env.example .env    # first time only
npm run dev             # or: npm run build && npm start
```

**Terminal 3 — web:**

```bash
cd /path/to/APP13
npm run dev:web
```

**Verify (optional):**

```bash
npm run verify:mvp-phase9
```

**Demo credentials** (from `docs/demo/AN-ACT-Strategic-Partner-Demo-Guide.md`):

- Email: `customer.demo@anact.local`
- Password: `demo-password-123`

### Production build (local preview)

```bash
cd /path/to/APP13
npm run sync:tokens
npm run build:render-layer          # optional; Vite aliases bundle from src
npm install --prefix apps/web
npm --prefix apps/web run build     # output: apps/web/dist/
npm --prefix apps/web run preview   # serves dist locally
```

See [Risks / blockers](#risks--blockers-before-sharing-externally) — the web production build currently has known issues.

---

## Part 2 — Shareable external demo (Vercel preparation)

### Why localhost is not shareable

`http://localhost:5173` and `http://127.0.0.1:3000` are only reachable on your machine. External stakeholders need a public HTTPS URL — Vercel is the fastest path for the **static React shell**.

### Deployment scope decision

| Demo tier | What works | What you need |
|---|---|---|
| **Tier 1 — Presentation** | Partner landing, executive UI shell, static copy, premium identity | Vercel static deploy of `apps/web` only |
| **Tier 2 — Live demo** | Login, Runtime JSON journeys, guided demo with API data | Vercel frontend **+** API hosted elsewhere (Railway, Render, Fly.io, etc.) **+** managed Postgres/Redis/S3 |

Vercel alone cannot host the full Fastify monolith with Postgres/Redis/MinIO without a separate backend project. Plan for **Tier 1 first**, then add API URL wiring for Tier 2.

### Correct Vercel project settings

| Setting | Recommended value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `apps/web` |
| **Node.js Version** | 20.x |
| **Install Command** | `cd ../.. && npm ci && npm install --prefix apps/web` |
| **Build Command** | `cd ../.. && npm run sync:tokens && npm --prefix apps/web run build` |
| **Output Directory** | `dist` |
| **Development Command** | `npm run dev` (default) |

**Why root is `apps/web`:** That directory contains `vite.config.ts`, `index.html`, and the Vite entry. Vercel must still reach sibling `packages/` during install/build — hence the `cd ../..` prefix in install/build commands.

### Optional `vercel.json` (prepare later, do not commit until build is green)

Place at **repository root** or **`apps/web/vercel.json`** when ready:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && npm run sync:tokens && npm --prefix apps/web run build",
  "outputDirectory": "dist",
  "installCommand": "cd ../.. && npm ci && npm install --prefix apps/web",
  "framework": "vite"
}
```

No SPA rewrites are required today — routing is **React state** inside `apps/web/src/App.tsx`, not URL-based paths. All visitor entry is `/`.

If URL-based routes are added later, add:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Environment variables (Vercel)

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_AN_ACT_LOGO_URL` | Optional | Override wordmark with a hosted logo URL |
| `VITE_RUNTIME_DEBUG` | Optional | `"true"` enables runtime debug logging in production (avoid for public demo) |
| `VITE_PILOT_INSTRUMENTATION` | Optional | Pilot metrics collection |
| **`VITE_API_BASE_URL`** | **Not defined today** | Would point the web shell at a hosted API — **needs a one-line wiring change** in `App.tsx` to pass into `<RuntimeProvider baseUrl={...}>` |

**Backend env vars** (`.env.example` at repo root — for API host, **not** Vercel static project):

- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` (≥32 chars), `S3_*`, etc.

These belong on the API deployment platform, not on a frontend-only Vercel project.

### API proxy note (dev vs production)

Locally, `apps/web/vite.config.ts` proxies `/v1`, `/need-experience`, `/action-experience`, and other experience paths to `http://127.0.0.1:3000`. **Vercel static hosting has no equivalent proxy** unless you add Vercel rewrites to an external API origin or deploy the API as Vercel serverless functions (not recommended for this codebase without major rework).

For Tier 2, either:

- Host API at `https://api.demo.anact.example` and wire `RuntimeProvider` `baseUrl`, or
- Add Vercel `rewrites` from `/v1/*` → external API URL.

---

## Deployment checklist (when explicitly instructed to deploy)

### Pre-flight (local)

- [ ] Confirm Node ≥ 20 (`node -v`)
- [ ] Run `npm ci` at repo root
- [ ] Run `npm run sync:tokens`
- [ ] Fix web TypeScript build errors (see blockers below)
- [ ] Confirm `npm --prefix apps/web run build` succeeds and produces `apps/web/dist/`
- [ ] Smoke-test: `npm --prefix apps/web run preview` → landing loads, both CTAs visible
- [ ] Decide demo tier: presentation-only (Tier 1) vs live API (Tier 2)

### Vercel project setup

- [ ] Import Git repository
- [ ] Set **Root Directory** = `apps/web`
- [ ] Set install/build/output commands (table above)
- [ ] Set Node 20
- [ ] Add optional `VITE_*` vars if needed
- [ ] Deploy to preview URL first — do **not** share production alias until verified

### Post-deploy verification

- [ ] Preview URL loads without console errors
- [ ] Partner landing hero, both CTAs, Trust section visible on laptop viewport
- [ ] Executive presentation entry opens (partial API failures acceptable for Tier 1)
- [ ] PWA manifest and favicon resolve (`/favicon.svg`, `/manifest.webmanifest`)
- [ ] If Tier 2: login with demo credentials succeeds against hosted API
- [ ] Share preview URL (`*.vercel.app`) with stakeholders

### Tier 2 additional steps (full live demo)

- [ ] Deploy API + Postgres + Redis + object storage (see `docker-compose.yml` for local parity)
- [ ] Run migrations against production database
- [ ] Configure CORS / cookie domain for Vercel origin
- [ ] Wire API base URL into web shell (env + `RuntimeProvider`)
- [ ] Seed demo user (`customer.demo@anact.local`)

---

## Risks / blockers before sharing externally

| Risk | Severity | Detail |
|---|---|---|
| **Web production build fails TypeScript check** | **High** | `npm --prefix apps/web run build` runs `tsc` before Vite. As of this plan, TS errors exist in several pages (`PremiumCard` `as` prop, `PartnerLandingPage` `featured`, `founder-console.ts` readonly). Must fix or temporarily use `vite build` only before Vercel deploy. |
| **PWA service worker generation** | Medium | `vite-plugin-pwa` may fail in constrained environments during `vite build`. Verify locally; disable PWA plugin temporarily if blocking deploy. |
| **No public API URL env var** | **High** for Tier 2 | `RuntimeProvider` defaults `baseUrl=""` (same-origin). Static Vercel deploy will 404 on `/v1/*` calls unless API is co-hosted or env wiring is added. |
| **Backend not Vercel-static-compatible** | **High** for Tier 2 | API requires PostgreSQL, Redis, JWT secrets, S3 — typical Vercel static project cannot satisfy this. |
| **Monorepo install path** | Medium | Vercel must install from repo root so `file:../../packages/*` links resolve. Wrong root → missing packages. |
| **Demo credentials in docs** | Low | Demo password is intentional for partner demos; rotate or disable for public internet if needed. |
| **HTTPS / cookies** | Medium | Auth cookies and PWA install require HTTPS (Vercel provides this on `*.vercel.app`). |
| **CORS** | Medium | Hosted API must allow the Vercel preview/production origin. |

### What works on a frontend-only Vercel deploy today

Per `docs/demo/AN-ACT-Strategic-Partner-Demo-Guide.md`:

- Partner landing (vision, trust narrative, entry points) — **no backend required**
- Premium executive presentation **shell** and static partner content
- Partial executive dashboard if APIs fail gracefully

### What will not work without a hosted API

- Live platform experience (login + Runtime JSON journeys)
- Guided demonstration with live scenario data
- Knowledge Bank / executive dashboard live API panels

---

## Quick reference

| Task | Command / path |
|---|---|
| Start web dev | `npm run dev:web` → http://localhost:5173/ |
| Start API dev | `npm run dev` → http://localhost:3000/ |
| Web build output | `apps/web/dist/` |
| Logo for Desktop icon | `apps/web/public/icons/an-act-icon-512.svg` |
| Vercel app root | `apps/web` |
| Partner demo guide | `docs/demo/AN-ACT-Strategic-Partner-Demo-Guide.md` |
| Deployment overview | `docs/partner/Deployment-Overview.md` |

---

## Summary

1. **Desktop shortcut:** Use Automator **Option B** (open `http://localhost:5173/`) with icon exported from `apps/web/public/icons/an-act-icon-512.svg`. Use **Option C** if the shortcut should also start dev servers.
2. **External demo:** Deploy **`apps/web`** to Vercel as a static Vite site. Tier 1 (presentation) is achievable once the production build is green. Tier 2 (live demo) requires a separate API deployment and API URL configuration — not yet wired via environment variables.
3. **Do not deploy yet** until TypeScript build errors are resolved and a preview URL is smoke-tested locally with `vite preview`.
