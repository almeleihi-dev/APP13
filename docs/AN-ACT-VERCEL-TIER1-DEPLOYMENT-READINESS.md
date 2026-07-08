# AN ACT — Vercel Tier 1 Deployment Readiness

**Scope:** Tier 1 presentation deploy only (Landing, Executive, Partner, presentation surfaces).  
**Status:** ✅ **LIVE** — Production deployed 2026-07-02  
**Public URL:** https://web-eight-virid-61.vercel.app  
**Date:** 2026-07-02

---

## Executive summary

The web production build now passes end-to-end. A static Vercel deployment of `apps/web` can serve the premium partner landing and presentation shells without a backend. Live platform login, Runtime JSON journeys, and API-backed executive panels will not function on Tier 1 alone (expected).

---

## Build blocker — root cause

`npm run sync:tokens && npm --prefix apps/web run build` failed at the **`tsc`** step with **20 TypeScript errors** across `apps/web` and stale `@an-act/runtime-ui` type declarations.

### Contributing factors

1. **Stale package types** — `apps/web` tsc resolves `@an-act/runtime-ui/react` from `packages/runtime-ui/dist/*.d.ts`, which was out of date relative to source.
2. **Strict component typing** — `PremiumCard` `as` prop only allowed `"article" | "div"` while presentation pages used `"section"` and `"li"`.
3. **Control-flow narrowing** — After startup routing polish, `experience !== "landing"` inside the `!hasToken` auth branch was unreachable (TypeScript error TS2367).
4. **Union entry typing** — `PartnerLandingPage` accessed `entry.featured` on entry objects that do not all declare the property.
5. **Readonly array mismatch** — `buildHighlights()` in `founder-console.ts` required a mutable array parameter.
6. **Missing import** — `P1Components.tsx` used `ReactNode` without importing it (surfaced when rebuilding `runtime-ui`).

No runtime logic, API routes, Runtime JSON contracts, or business rules were changed.

---

## Fixes applied (build-only)

| File | Change |
|---|---|
| `packages/runtime-ui/src/react/components/premium/PremiumComponents.tsx` | Extended `PremiumCard` `as` prop to `"article" \| "div" \| "section" \| "li"` |
| `packages/runtime-ui/src/react/components/P1Components.tsx` | Added missing `ReactNode` import |
| `apps/web/package.json` | Pre-build `@an-act/runtime-ui` before web `tsc` |
| `apps/web/src/App.tsx` | Removed unreachable `experience !== "landing"` checks in auth back-navigation |
| `apps/web/src/pages/PartnerLandingPage.tsx` | Guarded `featured` with `"featured" in entry` |
| `apps/web/src/lib/founder-console.ts` | Accept `readonly PilotEventRecord[]` in `buildHighlights()` |

---

## Verification — production build

**Command (exact Vercel build sequence from repo root):**

```bash
npm run sync:tokens && npm --prefix apps/web run build
```

**Result:** ✅ **PASS** (2026-07-02)

```
✓ 130 modules transformed
✓ built in ~460ms
PWA service worker generated (sw.js, workbox)
Output: apps/web/dist/
```

**Static preview:**

```bash
npm --prefix apps/web run preview -- --host 127.0.0.1 --port 4173
```

- `http://127.0.0.1:4173/` → **HTTP 200**
- `index.html`, hashed JS/CSS, PWA manifest, icons, and service worker present in `apps/web/dist/`

---

## Recommended Vercel settings (deployed configuration)

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Vercel project** | `an-act/web` |
| **Repository root config** | `vercel.json` (repo root — required for monorepo install) |
| **Node.js Version** | 20.x |
| **Install Command** | `npm ci && npm install --prefix packages/tokens && npm install --prefix packages/runtime-core && npm install --prefix packages/runtime-ui && npm install --prefix packages/runtime-client && npm install --prefix apps/web` |
| **Build Command** | `npm run sync:tokens && npm run build:render-layer && npm --prefix apps/web run build` |
| **Output Directory** | `apps/web/dist` |

> **Note:** Deploy from the **repository root** via CLI or connect GitHub with Root Directory set to `.` (not `apps/web` alone). The monorepo requires sibling package installs before build.

---

## Environment variables (Tier 1)

| Variable | Required? | Notes |
|---|---|---|
| `VITE_AN_ACT_LOGO_URL` | Optional | Override wordmark with hosted logo |
| `VITE_RUNTIME_DEBUG` | Optional | Leave unset for public demo |
| `VITE_PILOT_INSTRUMENTATION` | Optional | Leave unset for public demo |

No backend env vars are needed for Tier 1 static hosting.

---

## Tier 1 — works without backend

| Surface | Static deploy | Notes |
|---|---|---|
| **Premium Landing** (`/`) | ✅ Yes | Canonical entry; splash → black landing; both CTAs render |
| **Executive presentation** | ✅ Partial | Shell, copy, and layout render; live API panels show graceful empty/error states |
| **Partner package** | ✅ Yes | Static documentation overview |
| **Developer demo console** | ⚠️ Shell only | UI loads; scenario playback needs API for live data |
| **Live platform experience** | ❌ No | Requires hosted API + auth |
| **Login / registration** | ❌ No | `/v1/*` calls fail on static origin |

Tier 1 is suitable for **partner/investor presentation** — landing-first narrative without live marketplace journeys.

---

## Remaining risks (non-blocking for Tier 1)

| Risk | Severity | Mitigation |
|---|---|---|
| **Large JS bundle (~571 kB)** | Low | Acceptable for demo; consider code-splitting later |
| **No SPA URL rewrites needed today** | Info | App uses React state routing; entry is `/` |
| **PWA service worker caches API paths** | Low | Tier 1 has no API; SW still precaches static assets |
| **Executive API panels empty offline** | Low | Expected; document in demo script |
| **Tier 2 live demo** | Future | Requires separate API host + `RuntimeProvider baseUrl` wiring |

---

## Pre-deploy checklist (when instructed)

- [ ] Connect Git repository to Vercel
- [ ] Set Node 20, build command, output directory (table above)
- [ ] Install from repo root
- [ ] Deploy to **preview** URL first
- [ ] Verify preview: landing hero, Trust section, both CTAs, executive entry
- [ ] Confirm no console fatal errors on `/`
- [ ] Share preview URL (`*.vercel.app`) — not production alias until approved

---

## Post-deploy smoke test

1. Open preview URL `/` — premium black landing after splash
2. Scroll Trust, Live Frame, Passport, Marketplace sections
3. Click **Executive presentation** — page loads (API warnings acceptable)
4. Click **Partner package** — static overview loads
5. Click **Enter live platform** — auth/platform path fails gracefully without API (expected on Tier 1)

---

## Files changed in this readiness pass

```
packages/runtime-ui/src/react/components/premium/PremiumComponents.tsx
packages/runtime-ui/src/react/components/P1Components.tsx
apps/web/package.json
apps/web/src/App.tsx
apps/web/src/pages/PartnerLandingPage.tsx
apps/web/src/lib/founder-console.ts
```

---

## Quick reference

| Task | Command |
|---|---|
| Production build | `npm run sync:tokens && npm --prefix apps/web run build` |
| Local static preview | `npm --prefix apps/web run preview` |
| Build output | `apps/web/dist/` |
| Redeploy production | `cd repo-root && npx vercel deploy --prod --yes --project web` |
| Dev server (local) | `npm run dev:web` → `http://localhost:5173/` |

**Deployment status:** ✅ Live at https://web-eight-virid-61.vercel.app
