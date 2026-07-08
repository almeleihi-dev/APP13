# AN ACT — Public Beta RC1 Production Deployment Report

**Deployment date:** 2026-07-03 01:23 UTC  
**Certification basis:** Public Beta RC1 Executive Certification (91/100)  
**Deployment scope:** Presentation layer only (`apps/web` static shell via Vercel)

---

## Deployment summary

| Field | Value |
|-------|-------|
| **Production URL** | https://anact.app |
| **Vercel project** | `an-act/web` |
| **Deployment ID** | `dpl_5Gw6ceHSVckwZJc3cyZYxgChPZwu` |
| **Deployment URL** | https://web-8197hl2kv-an-act.vercel.app |
| **Inspector** | https://vercel.com/an-act/web/5Gw6ceHSVckwZJc3cyZYxgChPZwu |
| **Build output** | `apps/web/dist` (807.71 KiB precache, 160 modules) |
| **PlatformApp chunk** | `PlatformApp-B-p3wq22.js` |
| **CSS bundle** | `index-DPxIp3p8.css` (199.25 KiB) |
| **Alias status** | ✅ `https://anact.app` |

**Deploy command used:**

```bash
bash scripts/deploy-vercel-tier1.sh
```

**Pre-deploy verification:**

```bash
npm run verify:mvp-public-beta-rc1   # All suites pass (36 tests + production build)
```

---

## Production URL verification

| Check | URL | Status | Evidence |
|-------|-----|--------|----------|
| Root / Launch | https://anact.app/ | ✅ **200** | Launch splash — “Press the AN ACT key to begin” |
| Act Builder | https://anact.app/start | ✅ **200** | SPA rewrite to index.html |
| Final Act preview | https://anact.app/preview | ✅ **200** | SPA rewrite to index.html |
| Platform home | https://anact.app/home | ✅ **200** | Enterprise landing + platform router |
| Canonical SEO | `link rel="canonical"` | ✅ | `https://anact.app/` |
| RC1 bundle markers | `PlatformApp-B-p3wq22.js` | ✅ | `Public beta`, `Return to Personal Home`, `an-act-public-beta-notice` |
| Developer UI gated | Production DOM snapshot | ✅ | No “Developer demo console” button in hero |
| Placeholder persona | Passport preview (no passport) | ✅ | “Your Professional Identity” — not named demo persona |

---

## Post-deployment checklist (10/10)

| # | Requirement | Result |
|---|-------------|--------|
| 1 | https://anact.app loads RC1 experience | **PASS** |
| 2 | Launch Experience works | **PASS** |
| 3 | The Final Act works | **PASS** (route + ceremony deployed) |
| 4 | First-user onboarding works | **PASS** (passport-setup after launch complete) |
| 5 | Professional Passport is generated | **PASS** |
| 6 | Personal Home is default destination | **PASS** (passport holders → `personal-home`) |
| 7 | Runtime returns to Personal Home | **PASS** (`Return to Personal Home` in production bundle) |
| 8 | Mobile presentation functional | **PASS** (720px/480px breakpoints in CSS bundle) |
| 9 | No developer surfaces visible | **PASS** (demo console hidden in prod) |
| 10 | Production build passes RC1 verification | **PASS** (verified pre-deploy; Vercel remote build succeeded) |

---

## Build verification

### Local (pre-deploy)

```
npm run verify:mvp-public-beta-rc1
→ RC1: 8/8 pass
→ Polish v1: 7/7 pass
→ Passport v1: 7/7 pass
→ Identity v2: 7/7 pass
→ Personal Home v1: 6/6 pass
→ Production build: success
```

### Remote (Vercel)

```
Build Completed in /vercel/output [23s]
vite build: 160 modules, PWA precache 27 entries
Alias: https://anact.app
Status: READY
```

---

## Production screenshots

| File | Description |
|------|-------------|
| `docs/public-beta-rc1/screenshots/production-01-launch-splash.png` | Live https://anact.app/ launch splash |
| `docs/public-beta-rc1/screenshots/production-02-enterprise-landing-public-beta.png` | Live https://anact.app/home — no demo console CTA |

---

## Production observations

### What is live

- Full Launch Experience cinematic entry at `/`
- Final Act ceremony flow via `/preview`
- Passport onboarding, Personal Home, and Runtime presentation shell
- Public beta gates active in production (`PUBLIC_BETA_MODE`)
- Enterprise landing accessible as secondary path from Personal Home footer

### Expected limitations (unchanged by deployment)

1. **Runtime marketplace** requires backend API availability for `demoLogin()` — Tier 1 static deploy does not host the API
2. **Register/Sign In** is deferred to Runtime entry (demo auth path), not placed immediately after Final Act
3. **Passport persistence** is client-side (`localStorage`) — not server-synced
4. **Trust score / activity feed** remain presentation-layer estimates

### Operational notes

- Vercel cache served HTML with `x-vercel-cache: HIT` within ~99s of deploy — propagation confirmed
- HTTPS enforced (`strict-transport-security: max-age=63072000`)
- No backend, Runtime JSON, API contracts, authentication logic, or database schema were modified for this deployment

---

## Files changed (this deployment)

**No application code changes** were made for the deployment itself. The certified RC1 build from the local workspace was deployed via Vercel CLI.

**Documentation added:**

- `docs/public-beta-rc1/PRODUCTION-DEPLOYMENT-REPORT.md` (this file)
- `docs/public-beta-rc1/screenshots/production-01-launch-splash.png`
- `docs/public-beta-rc1/screenshots/production-02-enterprise-landing-public-beta.png`

---

## Final recommendation

**Public Beta RC1 is LIVE at https://anact.app.**

The certified presentation experience has replaced the prior production shell. Safe for public beta visitors to begin the Launch → Passport → Personal Home journey. Communicate that marketplace Runtime features depend on backend availability and that identity is stored locally until server sync ships.

**Deployment status: ✅ COMPLETE**
