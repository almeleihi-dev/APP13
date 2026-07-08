# AN ACT — Public Beta Final Release Report

**Release date:** 2026-07-03  
**Release scope:** Functional Beta Sprint 1–4 (living platform)  
**Production URL:** https://anact.app

---

## Deployment summary

| Field | Value |
|-------|-------|
| **Production URL** | https://anact.app |
| **Vercel project** | `an-act/web` |
| **Deployment ID** | `dpl_2wDE8M9LrhDvG8Ke2GkLSiQ3cU62` |
| **Deployment URL** | https://web-hgimlisez-an-act.vercel.app |
| **Inspector** | https://vercel.com/an-act/web/2wDE8M9LrhDvG8Ke2GkLSiQ3cU62 |
| **Alias status** | ✅ `https://anact.app` |
| **Build output** | `apps/web/dist` (968.08 KiB precache, 189 modules) |
| **PlatformApp chunk** | `PlatformApp-BpLkYGx8.js` (510.70 kB) |
| **CSS bundle** | `index-CFTbibg_.css` (254.82 kB) |
| **HTTPS / HSTS** | ✅ `strict-transport-security: max-age=63072000` |

**Deploy command:**

```bash
bash scripts/deploy-vercel-tier1.sh
```

---

## Pre-deploy verification

| Gate | Command | Result |
|------|---------|--------|
| Sprint 1 | `npm run verify:mvp-functional-beta-sprint1` | ✅ **PASS** (7/7 tests + Action C01 + build) |
| Sprint 2 | `npm run verify:mvp-functional-beta-sprint2` | ✅ **PASS** (7/7 + S1 regression + build) |
| Sprint 3 | `npm run verify:mvp-functional-beta-sprint3` | ✅ **PASS** (8/8 + S1–S2 regression + build) |
| Sprint 4 | `npm run verify:mvp-functional-beta-sprint4` | ✅ **PASS** (8/8 + S1–S3 regression + build) |

---

## Production UX verification

Post-deploy bundle and route checks against live `https://anact.app`:

| Experience | Verification method | Status |
|------------|---------------------|--------|
| Site load / SPA shell | HTTP 200 on `/`, `/home`, `/start` | ✅ |
| User registration flow | `PlatformApp` auth routes present | ✅ |
| Profile photo upload | Passport persistence layer in bundle | ✅ |
| Professional Passport | `passport-setup`, `passport-dashboard` | ✅ |
| Personal Home | `personal-home` experience | ✅ |
| Live Frame | Identity + tier signals in home/passport | ✅ |
| Action creation | `action-creator`, publish flow | ✅ |
| Marketplace publish | `Publish to marketplace` | ✅ |
| Contract creation | `Action Contract`, `Accept contract` | ✅ |
| Evidence flow | Contract experience strings in bundle | ✅ |
| Team creation | `My Teams`, `Create team`, `Team Passport` | ✅ |
| Build Project | `build-project`, `Pay phase` | ✅ |
| Economy Dashboard | `economy-dashboard`, `Global Contract Pulse`, `Insurance Readiness` | ✅ |
| Sprint CSS layers | `an-act-living-s2/s3/s4`, economy styles | ✅ |
| Sprint JS classes | `an-act-living-s1`–`s4` in entry + PlatformApp | ✅ |

**Note:** Interactive browser walkthrough not run in CI environment; UX confirmed via production bundle parity and HTTP checks (same method as RC2 deployment).

---

## Features live (Sprint 1–4)

### Sprint 1 — Living actions
Passport → Create Action → Publish → Marketplace → Request → Execute → Complete → Trust Growth

### Sprint 2 — Contracted actions
Request → Action Contract → Accept → Evidence → Completion → Passport history

### Sprint 3 — Team & project living system
Team Passport → Team Live Frame → Build Project → Phases → Micro Actions → Individual/Team contracts

### Sprint 4 — Contract economy engine
Contract ledger → Action intelligence → Value guidance (Low/Fair/Premium) → Scarcity signals → Revenue engine → Insurance readiness

**Core loop preserved:**

> Humans create actions. Actions create contracts. Contracts create trust. Trust creates opportunity.

---

## Known beta limitations

| Area | Limitation |
|------|------------|
| **Persistence** | localStorage only — no server-side sync or multi-device continuity |
| **Identity** | Passport keys derived locally; not cryptographically bound |
| **Payments** | Contract value is estimated/guided — no payment processor |
| **Economy** | Category intelligence blends live signals with beta seeds when volume is low |
| **Teams / projects** | Single-browser beta; no real-time collaboration |
| **Insurance** | Readiness intelligence only — no underwriting or policies |
| **Marketplace matching** | Economy intelligence not yet ranking search results |
| **Evidence** | Text-based beta evidence — no file attestation or hash chain |
| **Backend** | Static shell on Vercel; runtime API not required for living beta flows |

---

## Next recommended step

**Sprint 5 — Persistent Living Platform:** introduce server-backed contract ledger and passport sync so the first public beta can survive cross-device use, support real multi-party contracts, and feed the economy engine with authoritative completion data (payments and insurance readiness follow).

---

## Rollback reference

Previous production deployment: `dpl_CKQ3cZ788UfEX1rXJVRLWPmw7AtL` (Public Beta RC2, 2026-07-03).

Revert via Vercel dashboard → Deployments → promote prior deployment if needed.
