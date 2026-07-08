# AN ACT — Public Beta Readiness Report v1

**Date:** 2026-07-03  
**Scope:** Presentation polish for anact.app first-user journey  
**Verdict:** **Conditional GO** for public beta (presentation-ready; several capabilities remain client-side or mock)

---

## Journey reviewed

| Step | Route / experience | Status |
|------|-------------------|--------|
| Launch | `/`, `/start`, `/preview` | Ready — cinematic entry, no dev controls on public path |
| Final Act | Launch finale | Ready |
| Profile Start | `passport-setup` | Ready — create + edit modes, cancel returns to Personal Home |
| Professional Passport | `passport-dashboard` | Ready — back nav to Personal Home |
| Personal Home | `personal-home` (default for passport holders) | Ready — command center with beta notice |
| Runtime | marketplace / need flow | Ready — exit returns to Personal Home |
| Enterprise landing | secondary via footer link | Ready — demo console hidden in production |

---

## What is ready

- **Personal identity loop:** Passport → Personal Home → Runtime → Personal Home is consistent.
- **Navigation:** `goHome()` routes passport holders to Personal Home; Edit Passport cancel/back paths are wired.
- **Public beta gates:** `PUBLIC_BETA_MODE` hides developer demo console, executive AI panel, and replay-launch unless `VITE_SHOW_DEVELOPER_SURFACES=true`.
- **Empty states:** Draft Actions and Saved Opportunities show honest guidance instead of fake data.
- **Copy:** Suggested actions, Live Frame progress, and passport edit flow use production-appropriate language.
- **Mobile:** Breakpoints at 720px and 480px for passport flow, Personal Home grids, identity cards, Live Frame items.
- **Visual system:** Matte black, graphite surfaces, green accent, terminal typography preserved via existing premium + RC styles.

---

## What remains mock / presentation-only

| Area | Current behavior |
|------|------------------|
| Passport persistence | `localStorage` only — not synced to server account |
| Trust score | Client-side estimate from passport completeness |
| Live Frame tier progress | Derived locally from passport tier, not backend enrollment |
| Recent activity | Static onboarding events (passport created, Live Frame enrolled) |
| Active / draft actions | Empty until real marketplace usage populates them |
| Saved opportunities | Empty until save feature is wired |
| Auth on enterprise landing | Still uses demo login path for “Enter live platform” from partner landing |
| Operator / executive consoles | Hidden or secondary; not part of first-user path |

---

## What should not be promised yet

- Cross-device passport sync or account recovery
- Real trust scoring, verification, or Live Frame tier upgrades from platform activity
- Persistent draft actions or saved opportunities without backend integration
- Enterprise demo console, executive intelligence, or internal certification flows as customer features
- Production-grade authentication beyond the current session/demo path from partner entry

---

## Final gaps before full production (post-beta)

1. **Server-backed identity** — passport tied to authenticated user profile
2. **Real activity feed** — events from runtime/API instead of static onboarding list
3. **Marketplace persistence** — drafts and saved opportunities from API
4. **Auth UX** — replace demo-login path for public “Enter live platform” if required for beta visitors
5. **Analytics** — funnel tracking for Launch → Passport → Home → Runtime completion

---

## Go / no-go recommendation

### **GO — Public beta (presentation layer)**

The first-user journey is stable, visually consistent, and free of obvious developer/demo leakage on the production build. A real visitor can complete onboarding, land on Personal Home, enter Runtime, and return without broken navigation or misleading placeholder rows.

### **NO-GO — Full production promises**

Do not market server sync, verified trust scores, or persistent action history until backend integration is complete.

---

## Verification

```bash
npm run verify:mvp-public-beta-polish-v1
npm run build --workspace=apps/web
```

Screenshots: `docs/public-beta-v1/screenshots/`

| File | Description |
|------|-------------|
| `01-personal-home-hero.png` | Personal Home hero (passport holder) |
| `02-personal-home-full.png` | Personal Home full scroll |
| `05-enterprise-landing-public-beta.png` | Production build — demo console hidden, single CTA |
