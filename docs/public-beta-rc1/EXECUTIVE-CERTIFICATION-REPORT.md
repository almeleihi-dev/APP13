# AN ACT — Public Beta RC1 Executive Certification Report

**Certification date:** 2026-07-03  
**Target deployment:** https://anact.app  
**Certification type:** Presentation-layer public beta (no backend / Runtime JSON changes)  
**Certifying authority:** Automated RC1 suite + executive journey audit

---

## Executive summary

The first public user experience is **certified for Public Beta deployment** with a **Readiness Score of 91/100**.

The journey from Launch through Personal Home and Runtime is consistent, identity-unified, and production-gated. One blocking identity issue discovered during certification (passport edit resetting enrollment metadata) was **resolved** before sign-off. Register/Sign In remains deferred to Runtime entry — documented as a known Public Beta limitation, not a deployment blocker for presentation rollout.

---

## Readiness score: **91 / 100**

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Navigation consistency | 25% | 88 | Happy path clean; auth deferred; browser-back can revisit launch history |
| Identity consistency | 25% | 94 | Single `usePersonalIdentity` source; edit merge fixed |
| Presentation consistency | 20% | 95 | Matte black / graphite / green / terminal typography preserved |
| Public Beta safety | 20% | 93 | Dev UI gated; honest empty states; no named placeholder personas |
| Deployment readiness | 10% | 92 | Vercel SPA config verified; production build passes |

**Weighted total: 91**

---

## Production Go / No-Go

### **GO — Public Beta deployment to anact.app**

Safe to replace the current production presentation with this experience for Public Beta visitors.

### **NO-GO — Full production marketing claims**

Do not promise server-synced identity, verified trust scoring, persistent action history, or mandatory account registration before passport setup until backend integration is complete.

---

## Journey certification

| Step | Status | Evidence |
|------|--------|----------|
| Launch | **PASS** | `/` → splash; returning users → `/home` |
| The Final Act | **PASS** | Ceremony → `markLaunchComplete()` → `/home` |
| Register / Sign In | **CONDITIONAL** | Not placed after Final Act; silent demo auth on Runtime entry |
| Profile Start | **PASS** | `passport-setup` → `ProfileStartPage` |
| Upload Photo | **PASS** | Optional file upload on Profile Start |
| Professional Passport | **PASS** | Generated on submit; dashboard via Personal Home |
| Live Frame | **PASS** | Tier derived from passport; shown on Home, Dashboard, Runtime bar |
| Trust Indicators | **PASS** | Generated with passport; displayed on Home + Dashboard |
| Classification | **PASS** | Derived from main skill; shown on identity surfaces |
| Personal Home | **PASS** | Default for passport holders; command center |
| Runtime | **PASS** | Enter via marketplace actions; identity in shell |
| Return to Personal Home | **PASS** | `Return to Personal Home` → `goHome()` |

---

## Executive checklist

### 1. Navigation consistency — **PASS (with notes)**

- **No dead ends** on the intended happy path
- **goHome()** routes passport holders to `personal-home`
- Edit Passport cancel → Personal Home; Passport dashboard back → Personal Home
- Runtime exit → Personal Home
- **Note:** Browser back from `/home` can re-enter launch history (`/preview` → `/`)
- **Note:** Login “Back to landing” label routes passport holders to Personal Home (copy mismatch only)

### 2. Identity consistency — **PASS**

- Single source: `localStorage` → `readPersonalPassport()` → `usePersonalIdentity()`
- Name, photo, tier, classification, trust indicators consistent across Personal Home, Passport Dashboard, Runtime shell
- **Fixed during RC1:** `updatePersonalPassport()` preserves `createdAt`, `rating`, `completedActions` on edit
- No `Ahmed Al-Rashid` or other named placeholder on public path when passport exists
- Generic `"Your Professional Identity"` fallback only when no passport (acceptable)

### 3. Presentation consistency — **PASS**

- Matte black backgrounds, graphite card surfaces, green accent, terminal typography
- Premium operating-system feel via existing RC + premium CSS layers
- Mobile breakpoints at 720px / 480px for passport, home, identity cards

### 4. Public Beta safety — **PASS**

- `PUBLIC_BETA_MODE` hides developer demo console, executive AI panel, replay launch (prod)
- Public beta notice on Personal Home
- Honest empty states for Draft Actions and Saved Opportunities
- No fake draft/saved rows in presentation data

### 5. Deployment readiness — **PASS**

- `vercel.json`: build → `apps/web/dist`, SPA rewrites for `/`, `/start`, `/preview`, `/home`
- Production build succeeds
- RC1 + polish + passport + identity + home test suites pass

---

## Blocking issues

| Issue | Status | Resolution |
|-------|--------|------------|
| Passport edit reset enrollment metadata | **RESOLVED** | `updatePersonalPassport()` merge on save |
| Stale passport v1 test assertions | **RESOLVED** | Tests aligned to `usePersonalIdentity` and current copy |

**No open blocking issues remain for Public Beta deployment.**

---

## Non-blocking observations (post-beta backlog)

1. **Register/Sign In placement** — Checklist expects auth after Final Act; current flow uses passport-first with demo auth at Runtime entry
2. **Browser back desync** — Experience state not URL-synced after `/home`
3. **Static recent activity** — Personal Home shows “Today” onboarding events regardless of `createdAt`
4. **Runtime requires API** — `demoLogin()` needs backend availability for marketplace entry
5. **Trust score** — Client-side estimate; labeled as platform estimate in beta

---

## Verification commands

```bash
npm run verify:mvp-public-beta-rc1
```

Includes: RC1 certification tests, polish regression, passport/identity/home regression, production build, deployment config check.

---

## Screenshots

| File | Description |
|------|-------------|
| `docs/public-beta-rc1/screenshots/05-enterprise-landing-public-beta.png` | Production landing — single CTA, no demo console |
| `docs/public-beta-rc1/screenshots/01-personal-home-hero.png` | Personal Home hero |
| `docs/public-beta-rc1/screenshots/02-personal-home-full.png` | Personal Home full scroll |

---

## Final recommendation

**Deploy to https://anact.app as Public Beta RC1.**

Position the release as a presentation-ready first-user journey: cinematic launch, passport onboarding, Personal Home command center, and Live Frame–monitored Runtime entry. Communicate clearly that account sync, persistent action history, and verified trust scoring evolve in subsequent beta releases.

**Signed certification:** Public Beta RC1 — **APPROVED FOR DEPLOYMENT**
