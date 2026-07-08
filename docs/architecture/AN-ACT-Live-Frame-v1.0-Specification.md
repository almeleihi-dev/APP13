# AN ACT — Live Frame v1.0 Specification

**Version:** 1.0  
**Status:** Official unified specification (documentation)  
**Scope:** Single source of truth for the AN ACT Live Frame system before Render Layer implementation  
**Constraint:** Derived from repository evidence only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists in executable TypeScript with concrete values or REST APIs |
| **Documented** | Described in markdown; may not be fully wired |
| **Concept only** | Recommended contract; not yet implemented as unified module |
| **Recommended** | Official v1.0 guidance requiring future implementation |

---

## 1. Executive Summary

The AN ACT repository contains **at least eleven distinct Live Frame–related implementations** across trust engines, experience modules, design system specs, runtime demos, living experience, marketplace, and legacy UI. They disagree on **tier names**, **score thresholds**, **color models**, and **formulas**.

**Live Frame v1.0** unifies the platform around a **two-layer model**:

| Layer | Role | Authority |
|-------|------|-----------|
| **Trust Layer** | Computes `trust_score` (0–100) and `trust_tier` from platform events | `classifyTrustLiveFrame()` + `buildTrustBreakdown()` in `src/trust/domain/trust-profile.ts` (**Implemented**) |
| **Presentation Layer** | Maps `trust_tier` → `ui_tier` → semantic design tokens / resolved hex | CH3 `core-ui-live-frame` (**Implemented**) + v1.0 mapping table (**Recommended**) |

**Composite scoring** (`live-trust-frame`, CH2 living hash formula) is classified as **Extended Frame Score (EFS)** — optional enrichment, not the MVP Live Frame standard.

**Can Live Frame v1.0 become the official trust visualization standard?**

**Yes — as a documented specification effective immediately for all new Render Layer work**, provided the migration plan consolidates tier naming conflicts and wires runtime demos to the Trust Layer. The spec itself is **Documented/Recommended** until a single adapter module is **Implemented**.

---

## 2. Current Live Frame Implementations

### Implementation Index

| # | ID | Location | Chapter / Track | Status |
|---|-----|----------|-----------------|--------|
| A | **Trust S3 Live Frame** | `src/trust/domain/live-frame.ts` | Platform (S3.5) | **Implemented** |
| B | **Trust S5 Profile Live Frame** | `src/trust/domain/trust-profile.ts` | Platform (S5) | **Implemented** |
| C | **Trust Intelligence Tiers** | `src/trust/intelligence/trust-tier-library.ts` | AI4 / Intelligence | **Implemented** |
| D | **Live Frame Service** | `src/trust/application/live-frame-service.ts` | Platform | **Implemented** |
| E | **CH3 X1 Live Frame Spec** | `src/design-system/components/live-frame.ts` | CH3-X1 | **Implemented** |
| F | **CH3 X2 Core UI Live Frame** | `src/design-system/core-ui/components/live-frame.ts` | CH3-X2 | **Implemented** |
| G | **X2 Live Frame Experience** | `src/experience/live-frame/` | Experience X2 | **Implemented** |
| H | **Live Trust Frame (X7 track)** | `src/experience/live-trust-frame/` | Experience | **Implemented** |
| I | **CH2 Living Live Frame** | `src/living-experience/live-frame/` | CH2-X4 | **Implemented** |
| J | **CH3 Runtime Demo Tiers** | `need-repository.ts`, `action-repository.ts`, `profile-summary.ts` | CH3-X5/X6/X11 | **Implemented** (demo) |
| K | **Legacy UI Trust Payload** | `src/ui/trust/trust-payload.ts` | Pre-CH3 UI | **Implemented** |
| L | **Marketplace Provider Card** | `src/marketplace/domain/provider-card.ts` | S4 Marketplace | **Implemented** |

**CH4 / CH5:** No dedicated Live Frame module. CH4 C8 (Trust Intelligence) and CH5 modules reference trust conceptually; no separate Live Frame tier system in `src/trust-intelligence/` or `src/ai-experience/`.

---

### A — Trust S3 Live Frame

| Property | Value |
|----------|-------|
| **Location** | `src/trust/domain/live-frame.ts`, `src/trust/application/live-frame-service.ts` |
| **Purpose** | Read-only projection: trust score → frame tier, color, label, risk level |
| **Formula** | `classifyLiveFrame(trustScore)` — threshold ladder only |
| **Data source** | `trust.trust_scores`, `trust.trust_score_events` (read-only) |
| **Documentation** | `docs/implementation/S3-Live-Frame-Report.md` |

**Tier names:** `PLATINUM_ELITE`, `EMERALD_PRO`, `TRUSTED`, `STANDARD`, `WATCHLIST`

**Thresholds:**

| Score | Tier | Color key | Label | Risk |
|------:|------|-----------|-------|------|
| ≥95 | PLATINUM_ELITE | platinum_gold | Platinum Elite | minimal |
| ≥85 | EMERALD_PRO | emerald | Emerald Pro | low |
| ≥70 | TRUSTED | blue | Trusted | moderate |
| ≥50 | STANDARD | gray | Standard | elevated |
| <50 | WATCHLIST | red | Watchlist | high |

**JSON shape:** `ProviderLiveFrame`, `ProviderLiveFrameProjection` — camelCase domain; includes `frameTier`, `frameColor`, `frameLabel`, `riskLevel`, `trustScore`, `providerId`

**Strengths:** Documented S3 deliverable; DB-backed; pure classification; used by marketplace `ProviderCard`

**Weaknesses:** Tier names conflict with S5 (`TRUSTED` vs `SAPPHIRE_VERIFIED`, `WATCHLIST` vs `RESTRICTED`); color keys are strings not design tokens

---

### B — Trust S5 Profile Live Frame

| Property | Value |
|----------|-------|
| **Location** | `src/trust/domain/trust-profile.ts` |
| **Purpose** | S5 trust profile aggregate including live frame classification |
| **Trust score formula** | Weighted breakdown (see §7) |
| **Classification** | `classifyTrustLiveFrame(trustScore)` |
| **Data source** | Trust events → `deriveS5TrustMetrics` → `buildTrustBreakdown` |
| **Used by** | Discovery (`classifyTrustLiveFrame`), X2 Live Frame Experience, trust profile views |

**Tier names:** `PLATINUM_ELITE`, `EMERALD_PRO`, `SAPPHIRE_VERIFIED`, `STANDARD`, `RESTRICTED`

**Thresholds:** Same numeric boundaries as A (95, 85, 70, 50) — **different names at tiers 3 and 5**

**Colors:** `platinum_gold`, `emerald`, `sapphire`, `gray`, `red`

**JSON shape:** `LiveFrameView` — snake_case API: `provider_id`, `trust_score`, `tier`, `color`, `label`, `generated_at`

**Strengths:** Authoritative trust score computation; powers discovery ranking and X2 experience

**Weaknesses:** Duplicate classification logic vs A; naming drift from S3 report

---

### C — Trust Intelligence Tiers (AI4)

| Property | Value |
|----------|-------|
| **Location** | `src/trust/intelligence/trust-tier-library.ts`, `types.ts` |
| **Purpose** | Intelligence-layer trust tier for recommendations and restrictions |
| **Formula** | `resolveTrustTier(trustScore)` — range-based lookup |

**Tier names:** `platinum`, `emerald`, `gold`, `silver`, `restricted` (lowercase)

**Thresholds:**

| Tier | Min | Max | liveFrameColor | Recommendation |
|------|----:|----:|----------------|----------------|
| platinum | 95 | 100 | platinum | trusted |
| emerald | 85 | 94 | emerald | trusted |
| gold | 70 | 84 | gold | trusted |
| silver | 50 | 69 | silver | conditional |
| restricted | 0 | 49 | gray | restricted |

**Restrictions:** `enhanced_monitoring`, `contracts_require_manual_approval`, `escrow_hold_extended` at lower tiers

**Strengths:** Includes business restrictions and recommendation enum

**Weaknesses:** Different tier naming (gold/silver vs TRUSTED/STANDARD); overlaps with A/B with different vocabulary

---

### D — Live Frame Service (API projection)

| Property | Value |
|----------|-------|
| **Location** | `src/trust/application/live-frame-service.ts` |
| **Purpose** | DB read → timeline + score → `ProviderLiveFrameProjection` |
| **Delegates to** | Implementation A (`buildLiveFrame`, `buildLiveFrameProjection`) |

**Strengths:** Production DB integration path

**Weaknesses:** Inherits A's tier naming

---

### E — CH3 X1 Live Frame Component Spec

| Property | Value |
|----------|-------|
| **Location** | `src/design-system/components/live-frame.ts` |
| **Purpose** | Dimensional spec for Live Frame ring (X1 layer) |
| **Tiers** | Single default spec — **no tier variants** |
| **Ring** | strokeWidth 2, radius `circle`, glow `accent.highlight` |
| **Colors** | Semantic tokens: `surface.elevated`, `accent.primary`, `accent.highlight` |
| **minHeight** | 64px |

**Strengths:** Ring geometry defined

**Weaknesses:** No tier system at X1 level (superseded by X2)

---

### F — CH3 X2 Core UI Live Frame

| Property | Value |
|----------|-------|
| **Location** | `src/design-system/core-ui/components/live-frame.ts` |
| **Purpose** | Render-layer component specification for all CH3 runtime screens |
| **Component ID** | `core-ui-live-frame` |
| **Tier names** | `bronze`, `silver`, `gold`, `platinum`, `diamond` |
| **Colors** | Semantic token paths per tier (not hex) |

**Tier → accent token:**

| ui_tier | Accent token |
|---------|--------------|
| bronze | status.warning |
| silver | border.subtle |
| gold | status.warning |
| platinum | accent.highlight |
| diamond | accent.primary |

**Motion:** slow (400ms); properties: box-shadow, border-color  
**Accessibility:** ariaRole `img`, requiresLabel true  
**Used by** | CH3 runtime JSON (`opportunity-list.ts`, `profile-live-frame.ts`, etc.)

**Strengths:** Official render contract for CH3; mode-aware via design tokens

**Weaknesses:** No trust score mapping built-in; bronze/diamond not in trust domain

---

### G — X2 Live Frame Experience

| Property | Value |
|----------|-------|
| **Location** | `src/experience/live-frame/` |
| **Routes** | `/live-frame`, `/live-frame/progress`, `/live-frame/evolution`, `/live-frame/public` |
| **Purpose** | Full provider Live Frame dashboard from S5 trust data |
| **Data source** | S5 TrustScoreService, provider profile, platform analytics |
| **Documentation** | `docs/experience/X2-Live-Frame-Experience.md` |

**Progress tier ladder (`TIER_LADDER` in domain):**

| Tier | minScore | Label |
|------|----------|-------|
| RESTRICTED | 0 | Restricted |
| STANDARD | 50 | Standard |
| SAPPHIRE_VERIFIED | 70 | Sapphire Verified |
| EMERALD_PRO | 85 | Emerald Pro |
| PLATINUM_ELITE | 95 | Platinum Elite |

**JSON:** `LiveFrameExperienceView` — identity, summary, progress, evolution, drivers, platform_context

**Strengths:** Richest API; progress/evolution/drivers; authenticated REST

**Weaknesses:** Separate from CH3 runtime JSON screen builder pattern

---

### H — Live Trust Frame (Composite)

| Property | Value |
|----------|-------|
| **Location** | `src/experience/live-trust-frame/domain/live-trust-frame.ts` |
| **Purpose** | Multi-signal composite frame score beyond trust-only |
| **Tier names** | `bronze`, `silver`, `gold`, `platinum`, `elite` |
| **Score formula** | Weighted composite (see §7 alternate) |
| **Thresholds** | elite ≥90, platinum ≥80, gold ≥65, silver ≥50, bronze ≥0 |
| **Dispute downgrade** | Level steps + score penalty for active issues |

**FRAME_SCORE_WEIGHTS:** trust 0.4, passport 0.25, economy 0.15, completion 0.1, rating 0.1

**Strengths:** Holistic professional standing; dispute-aware

**Weaknesses:** Different tier set and formula from trust-only Live Frame; not used in CH3 runtime demos

---

### I — CH2 Living Live Frame (X4)

| Property | Value |
|----------|-------|
| **Location** | `src/living-experience/live-frame/` |
| **Routes** | `/living-live-frame/*` (17 endpoints) |
| **Purpose** | Living Professional OS frame experience with 13 sections |
| **Schema** | `living-live-frame-v1`; includes JSON Schema stub |
| **Documentation** | `docs/experience/CH2-X4-Living-Live-Frame.md` |

**Tier names:** `WATCHLIST`, `STANDARD`, `TRUSTED`, `EMERALD_PRO`, `PLATINUM_ELITE`

**Thresholds (DIFFERENT from A/B):**

| Tier | Min score |
|------|----------:|
| WATCHLIST | 0 |
| STANDARD | 35 |
| TRUSTED | 55 |
| EMERALD_PRO | 70 |
| PLATINUM_ELITE | 85 |

**Colors (hex):**

| Tier | Hex |
|------|-----|
| WATCHLIST | #9CA3AF |
| STANDARD | #60A5FA |
| TRUSTED | #34D399 |
| EMERALD_PRO | #10B981 |
| PLATINUM_ELITE | #A78BFA |

**Trust score formula:** `computeBaseTrustScore()` — onboarding hash heuristic (base 35 + verification + skills + hash mod 5) — **not event-sourced**

**Strengths:** Rich 13-section UX; JSON Schema exists; geographic adaptation

**Weaknesses:** Different thresholds and demo formula; conflicts with S3/S5 at same tier names

---

### J — CH3 Runtime Demo Data

| Property | Value |
|----------|-------|
| **Locations** | `need-repository.ts`, `action-repository.ts`, `profile-summary.ts`, `profile-sections.ts` |
| **Purpose** | Demo opportunities and profile with hardcoded UI tiers |
| **Tier names** | `bronze`, `silver`, `gold`, `platinum` (no diamond) |
| **Formula** | Static assignment in demo arrays |
| **Profile frameScore** | 847 (not 0–100 scale) — **inconsistent** |

**Runtime JSON:** `core-ui-live-frame` props `{ tier, score?, readOnly? }` in `opportunity-list.ts`, `profile-live-frame.ts`

**Strengths:** Exercises CH3 component wiring

**Weaknesses:** Not connected to trust engine; invalid score scale in profile demo

---

### K — Legacy UI Trust Payload

| Property | Value |
|----------|-------|
| **Location** | `src/ui/trust/trust-payload.ts`, `src/ui/pages/trust-center.ts`, `provider-card.ts` |
| **Purpose** | MVP demo fixtures for legacy page builders |
| **Tier strings** | `emerald`, `bronze`, `gold` (lowercase informal) |
| **Data source** | Hardcoded `MVP_TRUST_CENTER_SOURCE` |

**Strengths:** Rich demo narrative for trust center pages

**Weaknesses:** No CH3 token import; informal tier strings; parallel UI track

---

### L — Marketplace Provider Card

| Property | Value |
|----------|-------|
| **Location** | `src/marketplace/domain/provider-card.ts` |
| **Purpose** | Ranked marketplace results with frame metadata |
| **Types imported from** | Implementation A (`live-frame.ts`) |
| **Fields** | `frameTier`, `frameColor`, `riskLevel`, `trustScore` |

**Strengths:** Connects marketplace to trust classification

**Weaknesses:** Uses A naming (WATCHLIST/TRUSTED) not B naming (RESTRICTED/SAPPHIRE_VERIFIED)

---

## 3. Comparison Matrix

### Tier Naming Comparison

| Score range | S3 (A) | S5 (B) | AI4 (C) | CH3 UI (F) | Live Trust (H) | CH2 Living (I) |
|-------------|--------|--------|---------|------------|----------------|----------------|
| 95–100 | PLATINUM_ELITE | PLATINUM_ELITE | platinum | diamond | elite | PLATINUM_ELITE |
| 85–94 | EMERALD_PRO | EMERALD_PRO | emerald | platinum | platinum | EMERALD_PRO |
| 70–84 | TRUSTED | SAPPHIRE_VERIFIED | gold | gold | gold | TRUSTED* |
| 50–69 | STANDARD | STANDARD | silver | silver | silver | STANDARD* |
| 35–49 | WATCHLIST | RESTRICTED | restricted | bronze | bronze | STANDARD* |
| 0–34 | WATCHLIST | RESTRICTED | restricted | bronze | bronze | WATCHLIST |

*CH2 Living uses different boundaries: TRUSTED at ≥55, STANDARD at ≥35, PLATINUM at ≥85.

### Threshold Comparison (Numeric Boundaries)

| Boundary | A / B / G | C | H | I |
|----------|-----------|---|---|---|
| Top tier | ≥95 | ≥95 | ≥90 (elite) | ≥85 |
| Tier 2 | ≥85 | ≥85 | ≥80 | ≥70 |
| Tier 3 | ≥70 | ≥70 | ≥65 | ≥55 |
| Tier 4 | ≥50 | ≥50 | ≥50 | ≥35 |
| Bottom | <50 | ≤49 | <50 | <35 |

### Color Model Comparison

| System | Color representation |
|--------|---------------------|
| A, B | Named keys: platinum_gold, emerald, blue/sapphire, gray, red |
| C | platinum, emerald, gold, silver, gray |
| F | Semantic tokens: accent.primary, status.warning, etc. |
| I | Fixed hex per tier |
| K | Informal strings: emerald, bronze, gold |
| Render (Need mode) | Resolved from tokens → e.g. accent.primary #2563EB |

### Formula Comparison

| System | Formula type |
|--------|--------------|
| A, D | Pure threshold on trust_score |
| B, G | S5 weighted trust breakdown → score → classify |
| C | Range lookup on trust_score + restrictions |
| H | Weighted composite (trust+passport+economy+completion+rating) + dispute downgrade |
| I | Onboarding heuristic hash (demo) |
| J | Static demo assignment |

---

## 4. Problems Caused by Multiple Implementations

1. **Same score, different tier labels** — Score 72 is `TRUSTED` (A), `SAPPHIRE_VERIFIED` (B), `gold` (C/F), `TRUSTED` (I at ≥55).
2. **Same tier name, different thresholds** — `PLATINUM_ELITE` at ≥95 (A/B) vs ≥85 (I).
3. **Render uses UI tiers; trust APIs use business tiers** — No official mapping in code.
4. **Profile demo uses score 847** — Breaks 0–100 contract.
5. **Discovery uses B; marketplace card uses A** — Import path split.
6. **CH4/CH5 lack Live Frame** — Intelligence layers don't emit unified frame object for clients.
7. **Legacy UI uses informal strings** — `emerald` vs `EMERALD_PRO`.
8. **Accessibility labels inconsistent** — Some require tier label, demo uses lowercase bronze.

---

## 5. Recommended Official Live Frame (v1.0)

**Classification:** **Recommended** (spec); partial **Implemented** (trust + CH3 components exist separately)

Live Frame v1.0 is a **contract**, not a single file today. It comprises:

```
Trust Events (DB)
    → buildTrustBreakdown()           [S5 — Implemented]
    → trust_score (0–100)
    → classifyTrustLiveFrame()        [S5 — Implemented]
    → trust_tier (5 enum)
    → resolveLiveFramePresentation()  [v1.0 adapter — Concept only]
    → ui_tier (5 enum)
    → design_tokens + resolved_colors
    → Runtime JSON core-ui-live-frame instance
```

**Extended Frame Score (EFS)** from Implementation H remains available via separate API for enriched profile views — not mixed into MVP card rendering.

**CH2 Living Live Frame** remains a Living Professional OS experience — must call Trust Layer adapter when showing authoritative tier (migration).

---

## 6. Official Trust Formula

**Classification:** **Implemented** — `src/trust/domain/trust-profile.ts`

### Input metrics (`deriveS5TrustMetrics`)

From trust events + verification tier:

- `verificationTier` (T0–T4)
- `averageRating` (1–5 scale from evaluations)
- `completionRate` (completed / engagements)
- `cleanRecordRate` (issues and cancellations)
- `completedContracts`, `cancelledContracts`, `activeIssues`

### Component scores

| Component | Function | Range |
|-----------|----------|------:|
| verification | `scoreVerificationTier(tier)` | T0=20, T1=50, T2=70, T3=85, T4=100 |
| customer_rating | `(avgRating/5)*100` | 0–100 |
| completion_rate | `completionRate*100` | 0–100 |
| clean_record | `cleanRecordRate*100 - activeIssues*5` | 0–100 |

### Weights (`S5_TRUST_SCORE_WEIGHTS`)

| Component | Weight |
|-----------|-------:|
| verification | 0.4 |
| customer_rating | 0.3 |
| completion_rate | 0.2 |
| clean_record | 0.1 |

### Trust score

```
trust_score = clamp(round(
  verification_score * 0.4 +
  customer_rating_score * 0.3 +
  completion_rate_score * 0.2 +
  clean_record_score * 0.1
), 0, 100)
```

---

## 7. Official Score Formula

**Primary (v1.0):** `trust_score` from §6 — **Implemented**.

**Classification only (no separate frame score in MVP):**

```
presentation = classifyTrustLiveFrame(trust_score)
```

**Not official for MVP Live Frame ring:**

- CH2 `computeBaseTrustScore()` — **Deprecated** for authoritative tier
- H composite `calculateFrameTotalScore()` — **EFS only**; optional `/live-trust-frame` API
- Profile demo `frameScore: 847` — **Invalid**; replace with `trust_score`

---

## 8. Official Tier Names

### Trust tier enum (`trust_tier`) — **Recommended canonical**

Adopt S5 naming from `classifyTrustLiveFrame()` — **Implemented**:

| trust_tier | Label |
|------------|-------|
| `PLATINUM_ELITE` | Platinum Elite |
| `EMERALD_PRO` | Emerald Pro |
| `SAPPHIRE_VERIFIED` | Sapphire Verified |
| `STANDARD` | Standard |
| `RESTRICTED` | Restricted |

### Legacy alias map (for migration)

| Legacy (A / S3) | Official v1.0 |
|-------------------|---------------|
| TRUSTED | SAPPHIRE_VERIFIED |
| WATCHLIST | RESTRICTED |

| Legacy (C / AI4) | Official v1.0 |
|------------------|---------------|
| platinum | PLATINUM_ELITE |
| emerald | EMERALD_PRO |
| gold | SAPPHIRE_VERIFIED |
| silver | STANDARD |
| restricted | RESTRICTED |

### UI tier enum (`ui_tier`) — for Render Layer

From CH3 X2 — **Implemented**:

`bronze`, `silver`, `gold`, `platinum`, `diamond`

### Official trust_tier → ui_tier mapping — **Recommended**

| trust_tier | ui_tier | Risk (from A) |
|------------|---------|---------------|
| PLATINUM_ELITE | diamond | minimal |
| EMERALD_PRO | platinum | low |
| SAPPHIRE_VERIFIED | gold | moderate |
| STANDARD | silver | elevated |
| RESTRICTED | bronze | high |

---

## 9. Official Color Palette

### Presentation colors (Render Layer)

**Primary:** Resolve from CH3 semantic tokens in current mode — **Implemented** via `DESIGN_TOKENS`.

| ui_tier | Token path (accent ring) | Need mode resolved* | Action mode resolved* |
|---------|--------------------------|---------------------|----------------------|
| diamond | accent.primary | #2563EB | #3B82F6 |
| platinum | accent.highlight | #1D4ED8 | #2563EB |
| gold | status.warning | #D97706 | #FBBF24 |
| silver | border.subtle | #F3F4F6 | #1A1A1A |
| bronze | status.error | #DC2626 | #F87171 |

*From `need-mode.ts` / `action-mode.ts` — **Implemented**.

Ring: strokeWidth **2**, radius **circle**, elevation **medium**, motion **slow** (400ms) — from CH3 X2 — **Implemented**.

### Business color keys (API / logs)

From S5 — **Implemented**:

| trust_tier | color key |
|------------|-----------|
| PLATINUM_ELITE | platinum_gold |
| EMERALD_PRO | emerald |
| SAPPHIRE_VERIFIED | sapphire |
| STANDARD | gray |
| RESTRICTED | red |

**Do not use CH2 hex palette** (`FRAME_TIER_COLORS`) for Render Layer — **Documented** as CH2-only until migrated.

---

## 10. Official Thresholds

**Classification:** **Recommended** (consolidates B/G/X2/S3 numeric boundaries)

| trust_tier | Minimum trust_score | Maximum |
|------------|--------------------:|--------:|
| PLATINUM_ELITE | 95 | 100 |
| EMERALD_PRO | 85 | 94 |
| SAPPHIRE_VERIFIED | 70 | 84 |
| STANDARD | 50 | 69 |
| RESTRICTED | 0 | 49 |

Boundary rule: **inclusive minimum** (score 95 → PLATINUM_ELITE) — matches **Implemented** behavior in A and B.

**Deprecated thresholds:** CH2 Living (`FRAME_TIER_MIN_SCORES`: 35, 55, 70, 85) — do not use for v1.0.

---

## 11. Official JSON Schema

**Classification:** **Recommended** — consolidates existing shapes; not yet published as standalone file.

CH2 stub exists: `LIVING_LIVE_FRAME_JSON_SCHEMA` — partial, **Implemented** as template only.

### `AnActLiveFramePresentation` (v1.0)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://an-act.dev/schemas/live-frame-presentation-v1.json",
  "title": "AnActLiveFramePresentation",
  "type": "object",
  "required": [
    "schema_version",
    "provider_id",
    "trust_score",
    "trust_tier",
    "trust_tier_label",
    "ui_tier",
    "risk_level",
    "generated_at"
  ],
  "properties": {
    "schema_version": { "type": "string", "const": "an-act-live-frame-v1" },
    "provider_id": { "type": "string" },
    "user_id": { "type": "string" },
    "trust_score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "trust_tier": {
      "type": "string",
      "enum": ["PLATINUM_ELITE", "EMERALD_PRO", "SAPPHIRE_VERIFIED", "STANDARD", "RESTRICTED"]
    },
    "trust_tier_label": { "type": "string" },
    "trust_color_key": {
      "type": "string",
      "enum": ["platinum_gold", "emerald", "sapphire", "gray", "red"]
    },
    "ui_tier": {
      "type": "string",
      "enum": ["bronze", "silver", "gold", "platinum", "diamond"]
    },
    "risk_level": {
      "type": "string",
      "enum": ["minimal", "low", "moderate", "elevated", "high"]
    },
    "accent_token": { "type": "string" },
    "progress": {
      "type": "object",
      "properties": {
        "next_trust_tier": { "type": ["string", "null"] },
        "next_tier_minimum_score": { "type": ["integer", "null"] },
        "points_to_next_tier": { "type": "integer" },
        "progress_percent": { "type": "integer", "minimum": 0, "maximum": 100 }
      }
    },
    "generated_at": { "type": "string", "format": "date-time" }
  }
}
```

**Existing compatible shapes:**

- `LiveFrameView` (B) — **Implemented** — subset of above
- `RuntimeComponentInstance` props `{ tier: ui_tier, score: trust_score }` — **Implemented** in CH3

---

## 12. Runtime API Contract

**Classification:** **Implemented** (multiple APIs); v1.0 adds unified field requirements — **Recommended**

### Authoritative trust data

| Endpoint | Service | Returns |
|----------|---------|---------|
| `GET /live-frame` | X2 Live Frame Experience | Full `LiveFrameExperienceView` |
| `GET /live-frame/public?user_id=` | X2 | Public frame view |
| `GET /live-frame/progress` | X2 | Tier progress |
| LiveFrameService.getProviderLiveFrame | Trust module | `ProviderLiveFrameProjection` (A) |

### CH3 runtime (presentation)

| Endpoint | Live Frame usage |
|----------|------------------|
| `GET /need-experience/opportunities` | `core-ui-live-frame` per card — demo tier today |
| `GET /profile-experience/*` | Profile live frame screen — demo tier/score |

### v1.0 requirement — **Recommended**

All public provider surfaces MUST include:

```json
{
  "live_frame": {
    "trust_score": 88,
    "trust_tier": "EMERALD_PRO",
    "ui_tier": "platinum",
    "trust_tier_label": "Emerald Pro"
  }
}
```

Nested in opportunity cards, profile sections, and contract party views.

---

## 13. Render Layer Contract

**Classification:** **Recommended** (extends **Implemented** CH3 component spec)

1. Fetch or receive `AnActLiveFramePresentation` (or compute via adapter from trust API).
2. Render `core-ui-live-frame` with `variant={ui_tier}`.
3. Resolve ring color from `accent_token` + current Need/Action mode via token package.
4. Set `accessibility.label` = `"{trust_tier_label} Live Frame, trust score {trust_score}"`.
5. Score display (if shown) MUST use `trust_score` 0–100 only.
6. Do not render `frameScore: 847` or other non-normalized scales.

**Component registry entry:**

```
core-ui-live-frame → LiveFrameWidget(variant, trustScore, label, readOnly?)
```

---

## 14. Bubble MVP Contract

**Classification:** **Recommended**

| Element | Bubble approach |
|---------|-----------------|
| Data | API Connector → `/live-frame/public` or opportunity payload |
| Tier ring | HTML element with CSS class per `ui_tier` |
| Colors | Import v1.0 hex table for Need mode (§9) |
| Score | Text element bound to `trust_score` |
| Animation | CSS transition 400ms on border-color (optional) |

**Cannot do natively:** Semantic token mode switching — use page-level theme (Need light / Action dark).

**Must not:** Compute tier in Bubble workflows — use backend `ui_tier`.

---

## 15. React Contract

**Classification:** **Recommended**

```typescript
interface LiveFrameProps {
  presentation: AnActLiveFramePresentation;
  mode: "need" | "action";
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}
```

- Use `@an-act/tokens` `resolveSemanticColor(mode, accent_token)`.
- Map `ui_tier` to border/glow styles per CH3 X2 motion (400ms).
- Export from `@an-act/runtime-ui`.

---

## 16. Flutter Contract

**Classification:** **Recommended**

```dart
class AnActLiveFrame extends StatelessWidget {
  final AnActLiveFramePresentation presentation;
  final AnActMode mode;
}
```

- `ThemeExtension<AnActLiveFrameColors>` keyed by `ui_tier`.
- `CustomPaint` or `Container` with `BoxDecoration` circle border, width 2.
- Semantics label from `trust_tier_label` + `trust_score`.

---

## 17. SwiftUI Contract

**Classification:** **Recommended**

```swift
struct AnActLiveFrameView: View {
  let presentation: AnActLiveFramePresentation
  let mode: AnActMode
}
```

- Circle stroke overlay on avatar (`strokeBorder`, lineWidth 2).
- Color from token resolver aligned with Need/Action themes.
- Accessibility: `accessibilityLabel("\(presentation.trustTierLabel) Live Frame, trust score \(presentation.trustScore)")`.

---

## 18. Animation Guidelines

**Classification:** **Implemented** (CH3 motion tokens) + **Recommended** (behavior)

| Property | Value | Source |
|----------|-------|--------|
| Tier change duration | 400ms (slow) | CH3 X2 motion |
| Easing | decelerate | MOTION_EASING |
| Animated properties | box-shadow, border-color | CH3 X2 |
| Tier upgrade | Optional subtle glow pulse once | **Recommended** |
| Reduced motion | Disable pulse; instant border color change | ACCESSIBILITY_SPEC |
| Mode transition | Follow global 640ms transition — Live Frame ring updates at end | CH3 transition |

**Do not animate** trust_score counting in MVP unless `prefers-reduced-motion` is false — **Recommended**.

---

## 19. Badge Rules

**Classification:** **Implemented** — `core-ui-badge`

Live Frame tier and professional badges are **complementary**:

| Element | Purpose | Component |
|---------|---------|-----------|
| Live Frame ring | Trust tier visualization | `core-ui-live-frame` |
| Professional badge | Credential (verified, licensed, etc.) | `core-ui-badge` |

Rules — **Recommended**:

1. Maximum **3 badges** per marketplace card (matches demo patterns).
2. Badges do not replace Live Frame ring.
3. `elite` trust tier MAY pair with badge variant `elite` — **Implemented** in badge spec.
4. RESTRICTED tier: show ring + do not imply elite badges.

---

## 20. Profile Card Rules

**Classification:** **Implemented** (CH3 profile) + **Recommended** (normalization)

Profile Live Frame section (`profile-live-frame.ts`) MUST expose:

- `currentFrame` → `ui_tier` (not trust_tier string in component props)
- `frameScore` → `trust_score` (0–100) — **fixes demo 847**
- `nextLevelProgress` → from X2 `progress_percent`
- `explanation` → static or from trust drivers

Layout: avatar with Live Frame overlay per `prototype-profile` — **Documented**.

---

## 21. Marketplace Rules

**Classification:** **Implemented** (discovery + need opportunity list)

1. **Ranking:** Discovery uses `DISCOVERY_RANK_WEIGHTS` (trust 0.35) — **Implemented**.
2. **Display:** Each opportunity card includes Live Frame + rating + distance — **Implemented** in CH3.
3. **Tier source:** MUST come from `classifyTrustLiveFrame(provider.trust_score)` → adapter → `ui_tier` — **Recommended** (today: static demo).
4. **Filter:** `SearchQuery.trustTier` uses `TrustLiveFrameTier` from B — **Implemented**.
5. **No listing SKUs:** Live Frame decorates **provider-on-action** context only (ADR-001).

Marketplace `ProviderCard` (L) should migrate types from A to v1.0 `trust_tier` enum — **Recommended**.

---

## 22. AI Consumption Rules

**Classification:** **Documented** (CH4/CH5 reference trust; no Live Frame module)

1. AI experiences (CH5) consume **trust_score** and intelligence outputs — **Implemented**.
2. AI MUST NOT invent `ui_tier` — derive from Trust Layer or receive in payload — **Recommended**.
3. AI4 `resolveTrustTier` restrictions (`escrow_hold_extended`, etc.) apply to **business rules**, not ring color — **Implemented**.
4. Personal Assistant / Develop Me (CH2 engines) may reference Live Frame in copy — must cite authoritative `trust_tier` after migration — **Recommended**.
5. CH5 explanation endpoints should include `trust_tier` in narrative when discussing provider trust — **Recommended**.

---

## 23. Accessibility Rules

**Classification:** **Implemented** (CH3 X2) + **Recommended**

| Rule | Value |
|------|-------|
| Role | `img` |
| Required label | Yes (`requiresLabel: true`) |
| Label format | `"{trust_tier_label} Live Frame, trust score {trust_score}"` |
| Minimum touch target | 44px when interactive; profile ring may be decorative (readOnly) |
| Color-only tier | Forbidden — always pair with label or score |
| Reduced motion | Honor `reducedMotion` on screen payload — **Implemented** in CH3 runtime |
| High contrast | RESTRICTED uses status.error token — meets contrast in both modes |

---

## 24. Future Extension Rules

**Classification:** **Recommended**

1. **EFS (Extended Frame Score):** Optional sixth field `efs_score` / `efs_tier` from Live Trust Frame — do not merge into v1.0 ring without major version bump.
2. **Diamond+ tiers:** Require v2.0 schema bump if adding tiers above PLATINUM_ELITE.
3. **Customer Live Frame:** Not in v1.0 — provider-only per existing implementations.
4. **Animated tier celebrations:** v1.1+ optional; gated by reduced motion.
5. **New modules:** MUST import v1.0 adapter; no new local `classify*` functions.

---

## 25. Migration Strategy

See companion document: [AN-ACT-Live-Frame-Migration-Plan.md](./AN-ACT-Live-Frame-Migration-Plan.md)

Summary:

1. Publish v1.0 adapter module (Concept only → Implemented)
2. Point runtime demos to adapter + discovery
3. Alias-map A → B tier names
4. Normalize profile frameScore
5. Deprecate CH2 threshold ladder for authoritative display

---

## 26. Deprecation Plan

| Implementation | v1.0 status | Action |
|----------------|-------------|--------|
| A `classifyLiveFrame` tier names TRUSTED/WATCHLIST | Deprecated names | Alias to SAPPHIRE_VERIFIED/RESTRICTED |
| B `classifyTrustLiveFrame` | **Official** | Keep; sole classifier |
| C AI4 tier names | Parallel | Map to trust_tier at API boundary |
| H composite as "Live Frame" | Renamed | **EFS** — separate API label |
| I CH2 thresholds/formula | Deprecated for trust | Living UX only until wired to B |
| J demo static tiers | Deprecated | Replace with adapter |
| K legacy UI strings | Deprecated | Freeze; migrate to CH3 render |
| E X1 single spec | Informational | Superseded by F |

---

## 27. Final Recommendation

### Can Live Frame v1.0 become the official trust visualization standard?

**Yes — with conditions:**

| Criterion | Status |
|-----------|--------|
| Trust score formula exists and is tested | **Implemented** (S5) |
| Tier classification exists | **Implemented** (B; conflicts with A) |
| Render component spec exists | **Implemented** (CH3 X2) |
| Unified mapping documented | **Recommended** (this spec §8–10) |
| Single adapter in codebase | **Concept only** |
| Runtime wired to real trust data | **Concept only** |
| JSON Schema published | **Recommended** (§11) |

**Immediate authority for Render Layer kickoff:**

- **Trust:** `classifyTrustLiveFrame` + `buildTrustBreakdown` from `trust-profile.ts`
- **UI:** `core-ui-live-frame` variants from CH3 X2
- **Mapping:** §8 trust_tier → ui_tier table
- **Colors:** §9 semantic tokens

**Blockers before production MVP:**

1. Implement `resolveLiveFramePresentation()` adapter — **Concept only**
2. Migrate A tier names or consolidate files — see Migration Plan
3. Fix profile `frameScore: 847` — **Required**
4. Wire need/action opportunities to discovery trust scores — **Required**

**Verdict:** Live Frame v1.0 **is ready to be adopted as the official standard for all new Render Layer and API design work today**. Full platform compliance requires executing the Migration Plan (estimated 2–3 weeks engineering).

---

*Live Frame v1.0 Specification — documentation only; no source code modified.*

*Companion: [Live Frame Migration Plan](./AN-ACT-Live-Frame-Migration-Plan.md)*

*References: [Product Bible §18](./AN-ACT-Product-Bible.md), [CH3 Design System Registry §9](./AN-ACT-CH3-Design-System-Registry.md), [S3 Live Frame Report](../implementation/S3-Live-Frame-Report.md)*
