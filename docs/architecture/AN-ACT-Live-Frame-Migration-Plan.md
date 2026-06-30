# AN ACT — Live Frame Migration Plan

**Version:** 1.0  
**Companion:** [AN ACT Live Frame v1.0 Specification](./AN-ACT-Live-Frame-v1.0-Specification.md)  
**Constraint:** Planning document only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists today in repository |
| **Documented** | Specified in docs |
| **Concept only** | Not yet built |
| **Recommended** | Required migration action |

---

## 1. Which Implementation Becomes Official

| Layer | Official v1.0 source | Classification |
|-------|------------------------|----------------|
| **Trust score computation** | `buildTrustBreakdown()` + `deriveS5TrustMetrics()` in `src/trust/domain/trust-profile.ts` | **Implemented** |
| **Trust tier classification** | `classifyTrustLiveFrame()` in `src/trust/domain/trust-profile.ts` | **Implemented** → **Official** |
| **Trust tier labels & color keys** | Same function (S5) | **Implemented** → **Official** |
| **UI tier + ring rendering** | `LIVE_FRAME_COMPONENT` / `core-ui-live-frame` in `src/design-system/core-ui/components/live-frame.ts` | **Implemented** → **Official** |
| **Presentation adapter** | New `resolveLiveFramePresentation()` (proposed path: `src/trust/domain/live-frame-presentation.ts` or `src/design-system/adapters/live-frame.ts`) | **Concept only** → **Recommended** |
| **Provider API (rich dashboard)** | X2 `src/experience/live-frame/` — `/live-frame/*` | **Implemented** → **Retained** (add v1.0 fields) |
| **DB projection service** | `src/trust/application/live-frame-service.ts` | **Implemented** → **Retained** (delegate to B not A) |

### Not official for MVP Live Frame ring

| Implementation | v1.0 role |
|----------------|-----------|
| `src/trust/domain/live-frame.ts` (S3 classifyLiveFrame) | **Deprecated** as separate classifier — merge into B |
| `src/trust/intelligence/trust-tier-library.ts` | **Parallel** — map at intelligence API boundary only |
| `src/experience/live-trust-frame/` | **EFS** — Extended Frame Score; separate product surface |
| `src/living-experience/live-frame/` CH2 thresholds | **Deprecated** for authoritative tier — experience wrapper only |
| CH3 demo repositories static tiers | **Deprecated** — replace with adapter + discovery |
| `src/ui/trust/trust-payload.ts` | **Deprecated** — legacy UI freeze |

---

## 2. Which Implementations Become Deprecated

### Deprecation tiers

| Tier | Meaning | Timeline |
|------|---------|----------|
| **D1 — Name alias** | Old names accepted, mapped to v1.0 | Phase 1 |
| **D2 — Read-only legacy** | No new features; existing tests must pass | Phase 2 |
| **D3 — Remove** | Delete or redirect imports | Phase 3+ |

### Deprecation table

| ID | Path | Deprecation | Target |
|----|------|-------------|--------|
| A | `trust/domain/live-frame.ts` `classifyLiveFrame` | **D3** | Re-export from B or thin wrapper |
| A | Tier names TRUSTED, WATCHLIST | **D1** | Alias → SAPPHIRE_VERIFIED, RESTRICTED |
| C | lowercase tier in intelligence API responses | **D1** | Add `trust_tier` field alongside |
| H | Marketing as "Live Frame" without qualifier | **D2** | Rename docs to "Extended Frame Score" |
| I | `FRAME_TIER_MIN_SCORES` (35,55,70,85) | **D2** | Call v1.0 adapter for `currentTier` |
| I | `computeBaseTrustScore()` for display tier | **D2** | Use S5 trust_score when provider exists |
| J | Static `liveFrameTier` in need/action repos | **D3** | Discovery + adapter |
| J | `frameScore: 847` in profile-summary | **D3** | Use trust_score 0–100 |
| K | `src/ui/pages/*` trust tier strings | **D2** | Freeze; no new pages |
| E | X1 single-tier spec only | **D2** | Informational; X2 is canonical |

---

## 3. Required Code Changes

**Classification:** **Recommended** — not yet implemented

### Phase 1 — Adapter (P0)

| Change | File(s) | Description |
|--------|---------|-------------|
| Create adapter | `src/trust/domain/live-frame-presentation.ts` (new) | `resolveLiveFramePresentation(trustScore, providerId?)` → `AnActLiveFramePresentation` |
| Export types | same | `trust_tier`, `ui_tier`, `risk_level`, `accent_token` |
| Unit tests | `test/live-frame-presentation.test.ts` (new) | Boundary scores 95,85,70,50,49; mapping table |
| JSON Schema | `schemas/live-frame-presentation-v1.json` (new) | From spec §11 |

### Phase 2 — Trust consolidation (P0)

| Change | File(s) | Description |
|--------|---------|-------------|
| Unify classifier | `trust/domain/live-frame.ts` | Delegate `classifyLiveFrame` → `classifyTrustLiveFrame` + name mapping for backward compat |
| Update marketplace types | `marketplace/domain/provider-card.ts` | Use S5 tier enum or v1.0 presentation type |
| LiveFrameService | `trust/application/live-frame-service.ts` | Use B classification; add `ui_tier` to projection |
| Risk level | adapter | Map from tier (minimal→high per spec) |

### Phase 3 — Runtime wiring (P0)

| Change | File(s) | Description |
|--------|---------|-------------|
| Need opportunities | `need-repository.ts`, `need-experience-service.ts` | Inject discovery/trust; set `ui_tier` from adapter |
| Action repository | `action-repository.ts` | Same |
| Profile summary | `profile-summary.ts`, `profile-sections.ts` | `frameScore` → trust_score; `currentFrame` → ui_tier |
| Opportunity list builder | `opportunity-list.ts` | Pass `trust_score` in props |
| Profile live frame | `profile-live-frame.ts` | Normalize props |

### Phase 4 — API enrichment (P1)

| Change | File(s) | Description |
|--------|---------|-------------|
| X2 experience views | `live-frame-experience.ts` | Add `ui_tier`, `schema_version` to summary |
| Discovery results | `discovery-service.ts` | Include v1.0 presentation on `ProviderResult` |
| OpenAPI supplement | docs or yaml fragment | Document unified live_frame object |

### Phase 5 — CH2 / Legacy (P2)

| Change | File(s) | Description |
|--------|---------|-------------|
| Living live frame sections | `live-frame-sections.ts` | Source tier from adapter when trust profile available |
| Legacy UI | `src/ui/trust/*` | Optional: read from API instead of fixtures |

### No change required (retain)

- CH3 X2 component spec — already official UI contract
- CH4/CH5 — consume trust_score from upstream; optional `live_frame` block in projections later
- Design tokens — no change

---

## 4. Compatibility Strategy

### Backward compatibility rules

1. **API responses:** Add fields (`ui_tier`, `trust_tier` v1.0 names); do not remove existing fields until Phase 3 complete.
2. **Legacy tier names:** Adapter accepts TRUSTED/WATCHLIST as input aliases; always outputs SAPPHIRE_VERIFIED/RESTRICTED.
3. **CH3 Runtime JSON:** `core-ui-live-frame` props continue `tier` = `ui_tier` (bronze–diamond) — no breaking change for render clients using ui_tier.
4. **Marketplace:** `frameTier` field temporarily dual-write: legacy A name + new `trust_tier` — **Recommended** for one release.
5. **Tests:** Existing verify scripts must pass throughout; add new tests for adapter without breaking S3 live-frame tests until consolidated.

### Version field

All new payloads include:

```json
"schema_version": "an-act-live-frame-v1"
```

---

## 5. Migration Phases

```
Phase 0  Documentation (this spec)          ✅ Complete
    ↓
Phase 1  Adapter + tests + JSON Schema      ~3–5 days
    ↓
Phase 2  Trust domain consolidation         ~2–3 days
    ↓
Phase 3  Runtime demo → real trust data     ~3–5 days
    ↓
Phase 4  API enrichment (X2, discovery)     ~2–3 days
    ↓
Phase 5  CH2 living + legacy UI (optional)  ~3–5 days
    ↓
Phase 6  Remove deprecated classifiers      ~1–2 days
```

**Total estimated effort:** 14–23 engineering days (2.5–4.5 weeks)

**Parallel with Render Layer:** Phase 1 can complete **before** first React Live Frame widget; Render uses spec §8–9 mapping manually until adapter ships.

---

## 6. Estimated Effort

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| 0 — Documentation | 0 dev days | — |
| 1 — Adapter | 3–5 days | None |
| 2 — Trust consolidation | 2–3 days | Phase 1 |
| 3 — Runtime wiring | 3–5 days | Phase 1, discovery service |
| 4 — API enrichment | 2–3 days | Phase 1–2 |
| 5 — CH2/Legacy | 3–5 days | Phase 1–3 |
| 6 — Cleanup | 1–2 days | All tests green |

| Role | Involvement |
|------|-------------|
| Backend engineer | Phases 1–4, 6 |
| Frontend engineer | Phase 3 props, Render contract validation |
| Design | Confirm §9 color table in Need/Action modes |
| QA | Boundary tests, E2E opportunity card tier |

---

## 7. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking S3 live-frame tests when merging A→B | High | Wrapper with alias map; dual-run tests one sprint |
| Discovery latency when wiring need repo | Medium | Cache trust scores per provider |
| CH2 living shows different tier than marketplace | High | Phase 5 or document "illustrative" until wired |
| Render starts before adapter | Medium | Use spec mapping table manually; pin version |
| Profile frameScore 847 breaks client parsers | Medium | Phase 3 priority fix |
| AI4 restrictions confused with ui_tier | Low | Document separation in API |
| Bubble hardcodes old tier names | Medium | Bubble contract §14 — use ui_tier only |

---

## 8. Verification Checklist

### Phase 1 complete when

- [ ] `resolveLiveFramePresentation(95)` → `{ trust_tier: PLATINUM_ELITE, ui_tier: diamond }`
- [ ] `resolveLiveFramePresentation(72)` → `{ trust_tier: SAPPHIRE_VERIFIED, ui_tier: gold }`
- [ ] `resolveLiveFramePresentation(49)` → `{ trust_tier: RESTRICTED, ui_tier: bronze }`
- [ ] JSON Schema validates sample payloads
- [ ] `npm run test` includes live-frame-presentation tests — all pass
- [ ] `npm run build` clean

### Phase 2 complete when

- [ ] `classifyLiveFrame` in live-frame.ts delegates to B (or removed)
- [ ] `npm run test:s3-live-frame` still passes (or updated expectations documented)
- [ ] Marketplace ProviderCard uses v1.0 trust_tier enum
- [ ] No new imports of A classifier outside trust module

### Phase 3 complete when

- [ ] `GET /need-experience/opportunities` returns tiers from trust/discovery (not static demo)
- [ ] Profile `frameScore` is 0–100
- [ ] `core-ui-live-frame` props use ui_tier from adapter
- [ ] `npm run verify:ch3-x5` and `verify:ch3-x11` pass

### Phase 4 complete when

- [ ] `GET /live-frame` summary includes `ui_tier` and `schema_version`
- [ ] Discovery ProviderResult includes live_frame presentation block

### Full v1.0 compliance when

- [ ] All checklist items above complete
- [ ] CH2 living current tier matches S5 for providers with trust profile
- [ ] Legacy UI frozen (no new features in `src/ui/pages/trust-*`)
- [ ] Render Layer uses `@an-act/tokens` + v1.0 props
- [ ] Product Bible §18 marked **Implemented** for adapter
- [ ] Migration Plan Phase 6 cleanup merged

### Regression commands

```bash
npm run verify:ch3-x2    # Core UI Live Frame component
npm run test:s3-live-frame
npm run verify:x2        # Live Frame Experience
npm run verify:ch2-x4    # Living Live Frame
npm run verify:ch3-x5
npm run verify:ch3-x11
npm run build
npm run lint:imports
```

---

## 9. Final Recommendation

**Adopt Live Frame v1.0 Specification immediately** for all Render Layer, API design, and documentation work.

**Execute migration Phases 1–3 before production MVP** — these are **Required fixes** identified in the [Platform MVP Readiness Assessment](./AN-ACT-Platform-MVP-Readiness-Assessment.md).

**Render Layer may start in parallel** using the spec's mapping table (§8–9) while Phase 1 adapter is built — do not wait for full platform compliance to build the first `core-ui-live-frame` widget.

**Do not** use CH2 living thresholds, composite EFS tiers, or legacy UI strings as authoritative trust visualization.

**Answer:** Live Frame v1.0 **can and should** become the official trust visualization standard **now** (documented). Platform-wide **implementation** of that standard completes when Phase 3 verification checklist passes.

---

*Migration Plan v1.0 — documentation only; no source code modified.*

*Specification: [AN-ACT-Live-Frame-v1.0-Specification.md](./AN-ACT-Live-Frame-v1.0-Specification.md)*

*Index: [Master Architecture Index](./AN-ACT-Master-Architecture-Index.md)*
