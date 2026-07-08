# AN ACT — Functional Beta Sprint 1 Report

**Date:** 2026-07-03  
**Scope:** First living action lifecycle — connect existing presentation to persistent beta store  
**Baseline:** Public Beta RC2

---

## Flow summary

The first real heartbeat of AN ACT is now wired end-to-end in the web shell:

```
Human
  → Professional Passport (localStorage source of truth + photo)
  → Action Creator (Draft → Preview → Publish)
  → Marketplace listing (published actions with passport ownership)
  → Discover (browse published actions + beta catalog)
  → Request (service request attached to identity)
  → Execute (progress states on tracking timeline)
  → Complete (passport trust growth + completed actions count)
  → Personal Home (My Actions, Active Requests, Completed Actions, Trust Progress)
```

### Lifecycle states

| Stage | What happens |
|-------|----------------|
| **Create** | Professional builds blueprint in Action Creator |
| **Draft** | Saved to living platform store + session draft |
| **Preview** | Blueprint, trust, marketplace preview (unchanged UI) |
| **Publish** | Action attached to creator passport identity → marketplace |
| **Discover** | Published actions appear in marketplace browse |
| **Request** | Customer requests action → tracking ID + request record |
| **Execute** | Advance progress through 5 lifecycle steps |
| **Complete** | Trust indicators + completedActions updated on passport |
| **Grow** | Personal Home reflects live activity and trust progress |

---

## Architecture approach

**Connected, not rebuilt:**

- Existing Action Creator UI, Need MVP flow, Personal Home, and passport systems preserved
- New thin layer: `apps/web/src/lib/living-platform/` (localStorage beta persistence)
- Passport remains source of truth for identity, photo, Live Frame, trust indicators
- Backend APIs (`/v1/actions`, `/requests`, `/action-blueprint`) unchanged — ready for Sprint 2 wiring

**Beta honesty:**

- Actions, requests, and activity persist in `localStorage` (`an-act-living-platform-v1`)
- UI labels: "Public beta · actions persist locally in this browser"
- Sample catalog providers remain alongside community-published actions

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/src/lib/living-platform/types.ts` | **New** — living platform types |
| `apps/web/src/lib/living-platform/professional-action-store.ts` | **New** — publish, request, lifecycle store |
| `apps/web/src/lib/living-platform/useLivingPlatform.ts` | **New** — reactive store hook |
| `apps/web/src/components/action-creator/useActionCreatorPresentation.ts` | Publish flow |
| `apps/web/src/components/action-creator/ActionCreatorFlow.tsx` | Publish UI |
| `apps/web/src/components/action-creator/action-creator-persistence.ts` | Clear draft on publish |
| `apps/web/src/components/need-mvp/useNeedPresentation.ts` | Request + lifecycle hooks |
| `apps/web/src/components/need-mvp/NeedMvpFlow.tsx` | Progress + complete actions |
| `apps/web/src/components/need-mvp/NeedSearchPresentation.tsx` | Published actions browse |
| `apps/web/src/components/need-mvp/opportunity-presentation.ts` | Passport-owned published detail |
| `apps/web/src/passport/personal-home-presentation.ts` | Live home data |
| `apps/web/src/pages/PersonalHomeDashboardPage.tsx` | Living Action Workspace |
| `apps/web/src/pages/ActionCreatorPage.tsx` | Functional beta messaging |
| `apps/web/src/pages/RuntimePage.tsx` | Published action selection |
| `apps/web/src/passport/usePersonalIdentity.ts` | Refresh on living platform updates |
| `apps/web/src/PlatformApp.tsx` | Marketplace link after publish |
| `apps/web/src/styles/an-act-functional-beta-sprint1.css` | **New** — living platform styles |
| `apps/web/src/styles/global.css` | Import sprint CSS |
| `apps/web/src/main.tsx` | `an-act-living-s1` class |
| `test/mvp-functional-beta-sprint1.test.ts` | **New** — 7 tests |
| `scripts/verify-mvp-functional-beta-sprint1.sh` | **New** |
| `package.json` | test + verify scripts |

---

## Verification report

```bash
npm run verify:mvp-functional-beta-sprint1
```

| Check | Result |
|-------|--------|
| Functional Beta Sprint 1 tests | **7/7 pass** |
| Action Creation C01 regression | **8/8 pass** |
| Production build | **OK** |

---

## Screenshots

Capture locally after starting dev server:

```bash
npm run dev --workspace=apps/web
# 1. Personal Home → Living Action Workspace
# 2. Action Creator → Publish to marketplace
# 3. Marketplace → Published by professionals
# 4. Request tracking → Advance / Complete
```

Target paths: `docs/functional-beta-sprint1/screenshots/`

---

## Remaining gaps before full production beta

1. **Server sync** — Publish/request/complete should call `/action-blueprint/registry/publish`, `/requests`, `/v1/actions`
2. **Cross-device identity** — Passport and actions are browser-local only
3. **Real provider matching** — Need experience still uses in-memory beta catalog for sample providers
4. **Contract + payment** — Execute stage is progress simulation, not contract-backed execution
5. **Multi-user discovery** — Published actions visible to all visitors only within same browser storage (Sprint 2: API-backed marketplace feed)
6. **Action Creator → blueprint API** — Transform/validate/compile-preview endpoints exist but not yet called
7. **Notification layer** — No push/email when request received or action completed

---

## First living loop confirmation

**Functional Beta Sprint 1 activates the first real action lifecycle** within existing AN ACT architecture. Visual identity, passport, Live Frame, Personal Home, and marketplace design are preserved. The platform now beats with a complete local loop from professional identity through trust growth.
