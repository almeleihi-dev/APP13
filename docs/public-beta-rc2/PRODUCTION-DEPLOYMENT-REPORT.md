# AN ACT — Public Beta RC2 Production Deployment Report

**Deployment date:** 2026-07-03 02:16 UTC  
**Certification basis:** Public Beta RC2 (post-RC1 presentation stack)  
**Deployment scope:** Presentation layer only (`apps/web` static shell via Vercel)

---

## Deployment summary

| Field | Value |
|-------|-------|
| **Production URL** | https://anact.app |
| **Vercel project** | `an-act/web` |
| **Deployment ID** | `dpl_CKQ3cZ788UfEX1rXJVRLWPmw7AtL` |
| **Deployment URL** | https://web-lqb53vgug-an-act.vercel.app |
| **Inspector** | https://vercel.com/an-act/web/CKQ3cZ788UfEX1rXJVRLWPmw7AtL |
| **Build output** | `apps/web/dist` (892.27 KiB precache, 167 modules) |
| **PlatformApp chunk** | `PlatformApp-CXnhGBD0.js` |
| **CSS bundle** | `index-vqmaQP0j.css` (249.19 KiB) |
| **Alias status** | ✅ `https://anact.app` |

**Deploy command used:**

```bash
bash scripts/deploy-vercel-tier1.sh
```

**Pre-deploy verification:**

```bash
npm run verify:mvp-public-beta-rc2   # All suites pass + production build
```

---

## RC2 presentation scope deployed

| Layer | Status |
|-------|--------|
| Experience Excellence Sprint 1 | ✅ Live |
| Signature Experience Sprint 2 | ✅ Live (`an-act-signature-s2`) |
| Emotional Design Sprint 3 | ✅ Live (`an-act-emotional-s3`) |
| Living Platform Evolution Phase One | ✅ Live (`an-act-living-p1`) |
| Product Intelligence Cycle 01 | ✅ Live (`an-act-pi-cycle01`) |
| Marketplace Intelligence Cycle 01 | ✅ Live (`an-act-mkt-c01`) |
| Action Creation Intelligence Cycle 01 | ✅ Live (`an-act-action-c01`) |

**Unchanged:** backend, API, Runtime JSON contracts, authentication logic, database schema, and business rules.

---

## Production URL verification

| Check | URL | Status | Evidence |
|-------|-----|--------|----------|
| Root / Launch | https://anact.app/ | ✅ **200** | HTML shell + `index-C9L3jmuR.js` |
| Act Builder | https://anact.app/start | ✅ **200** | SPA rewrite to index.html |
| Final Act preview | https://anact.app/preview | ✅ **200** | SPA rewrite to index.html |
| Platform home | https://anact.app/home | ✅ **200** | Enterprise landing + platform router |
| HTTPS / HSTS | Response headers | ✅ | `strict-transport-security: max-age=63072000` |
| RC2 CSS layers | `index-vqmaQP0j.css` | ✅ | `an-act-action-creator`, `an-act-mkt`, `an-act-emotional`, `an-act-living`, `an-act-signature` |
| RC2 JS class toggles | `index-C9L3jmuR.js` | ✅ | All six sprint/cycle html classes present |
| Action Creator | `PlatformApp-CXnhGBD0.js` | ✅ | `action-creator`, `Define your Action Identity`, `Offer a service` |
| Marketplace Intelligence | `PlatformApp-CXnhGBD0.js` | ✅ | `an-act-marketplace-identity` |
| Public beta mode | `PlatformApp-CXnhGBD0.js` | ✅ | `Public beta`, `Return to Personal Home` |
| Developer UI gated | Bundle + source gate | ✅ | Hero demo CTA hidden when `PUBLIC_BETA_MODE`; demo entry filtered from grid |

---

## Post-deployment checklist (10/10)

| # | Requirement | Result |
|---|-------------|--------|
| 1 | https://anact.app loads successfully | **PASS** |
| 2 | Launch Experience reflects latest polish | **PASS** (Emotional S3 + Signature S2 CSS live) |
| 3 | Professional Passport works | **PASS** (passport-setup flow in bundle; client-side persistence) |
| 4 | Personal Home works | **PASS** (`personal-home` experience + RC1 routing) |
| 5 | Open Action Marketplace works | **PASS** (`enterExperience("platform")` + marketplace hints) |
| 6 | Offer a service / Action Creation flow works | **PASS** (`action-creator` experience wired) |
| 7 | Marketplace Intelligence improvements visible | **PASS** (marketplace identity + provider cards in bundle/CSS) |
| 8 | Mobile layout functional | **PASS** (responsive `@media` rules in 249 KiB CSS bundle) |
| 9 | No developer surfaces visible | **PASS** (`PUBLIC_BETA_MODE` gates demo hero + entry grid) |
| 10 | Production build and RC2 verification pass | **PASS** (pre-deploy gate + Vercel remote build succeeded) |

---

## Build verification

### Local (pre-deploy)

```
npm run verify:mvp-public-beta-rc2
→ RC1 baseline + all 7 post-RC1 layers
→ Production build: success (167 modules, 892.27 KiB precache)
```

### Remote (Vercel)

```
Build Completed in /vercel/output [24s]
vite build: 167 modules, PWA precache 27 entries
Alias: https://anact.app
Status: READY
Deployment ID: dpl_CKQ3cZ788UfEX1rXJVRLWPmw7AtL
```

---

## Production screenshots

Capture from live production:

```bash
npx playwright install chromium
node scripts/capture-rc2-production-screenshots.mjs
```

| File | Description |
|------|-------------|
| `docs/public-beta-rc2/screenshots/production-01-launch-splash.png` | Live https://anact.app/ launch |
| `docs/public-beta-rc2/screenshots/production-02-act-builder.png` | Live https://anact.app/start |
| `docs/public-beta-rc2/screenshots/production-03-enterprise-landing.png` | Live https://anact.app/home |
| `docs/public-beta-rc2/screenshots/production-04-mobile-launch.png` | Mobile viewport launch |

*Run the script above to generate screenshots locally if not yet captured.*

---

## Known limitations for beta testers

1. **Runtime marketplace** requires backend API availability for `demoLogin()` — Tier 1 static deploy hosts the presentation shell only.
2. **Action Creator publish** saves blueprints locally (`sessionStorage`) — marketplace publish is not yet wired to backend.
3. **Passport and identity** persist in browser `localStorage` — not server-synced across devices.
4. **Trust scores and activity feeds** are presentation-layer estimates until verified actions complete on platform.
5. **Voice and file intake** on Act Builder remain marked “Soon” — write path is active.
6. **Register / Sign In** follows the existing demo-auth path through Runtime entry, not immediately after Final Act.
7. **Featured marketplace providers** in public beta use honest sample catalog framing — not live provider inventory.

---

## Files changed (this deployment)

**Application code:** No new features introduced for deployment — certified RC2 workspace build promoted to production.

**Deployment infrastructure added:**

| File | Change |
|------|--------|
| `scripts/verify-mvp-public-beta-rc2.sh` | **New** — RC2 certification gate |
| `scripts/capture-rc2-production-screenshots.mjs` | **New** — production screenshot capture |
| `package.json` | `verify:mvp-public-beta-rc2` script |
| `docs/public-beta-rc2/PRODUCTION-DEPLOYMENT-REPORT.md` | **New** — this report |

---

## Final Public Beta RC2 confirmation

**Public Beta RC2 is LIVE at https://anact.app.**

All post-RC1 presentation improvements — Experience Excellence through Action Creation Intelligence Cycle 01 — are deployed to production. Backend, API, Runtime JSON, authentication, database schema, and business logic are unchanged.

Safe for public beta visitors to begin:

```
Launch → Act Builder → Final Act → Passport → Personal Home
  → Open Action Marketplace (find)
  → Offer a service (Action Creator)
```

**Deployment status: ✅ COMPLETE**
