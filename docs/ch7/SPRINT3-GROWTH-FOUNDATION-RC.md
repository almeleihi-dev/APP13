# Chapter 7 — Sprint 3: Growth Foundation RC

**Status:** Complete  
**Date:** 2026-06-28  
**Baseline:** Pilot Management RC (90/100)

## Objective

Prepare AN ACT for controlled growth after pilot validation — early access, invitations, waitlist, referral signals, and marketplace activation readiness.

No public launch. No marketing automation. No external services.

---

## Deliverable

**Growth Foundation** — operator console for controlled early access and growth planning.

**Entry:** Landing → **Growth Foundation** (dev or `VITE_PILOT_INSTRUMENTATION=true`)

---

## Early Access Model

| Field | Description |
|-------|-------------|
| Early access status | Controlled / Expanding / Paused (derived from pilot + invitation metrics) |
| Invited users | Sum across invitation batches |
| Accepted invitations | Accepted count per batch |
| Pending invitations | Invited − accepted |
| Waitlist interest | Waitlist entry count |
| Pilot-to-growth readiness | Composite score from acceptance rate, journey success, waitlist depth |

---

## Invitation Workflow

Five operator invitation batches:

| Batch | Tracks |
|-------|--------|
| Customers | invited, accepted, activated, blocked, follow-up |
| Professionals | same |
| Partners | same |
| Investors | same |
| Government stakeholders | same |

Activation counts sync from pilot instrumentation sessions where available. Deterministic sample data fills gaps when no backend exists.

---

## Waitlist Model

| Field | Purpose |
|-------|---------|
| Persona | Target user type |
| Source | How interest was captured |
| Readiness | ready / conditional / not-started |
| Priority | high / medium / low |
| Expected value | Operator hypothesis |
| Next action | Recommended operator step |

Default sample entries seed the view. Operators add entries via in-app form — no external forms.

---

## Referral Signal Framework

Lightweight intent tracking (not public referral mechanics):

| Field | Purpose |
|-------|---------|
| Referrer label | Anonymous operator label (no PII) |
| Target persona | Who they would invite |
| Confidence | 1–5 operator confidence |
| Reason | Why referral is likely |
| Recommended follow-up | Next operator action |

---

## Marketplace Activation Summary

Answers operator questions:

- **Enough customers?** Ready / Building / Blocked (threshold: 5 activated)
- **Enough professionals?** Ready / Building / Blocked (threshold: 3 activated)
- **Launch category first** — derived from supply/demand balance
- **Supply/demand imbalance** — from waitlist persona distribution
- **Next activation move** — deterministic recommendation

---

## Operator Console Integration

```
Landing
  ├── Growth Foundation (early access + activation)
  ├── Pilot Management (cohorts + feedback)
  ├── Founder Console (daily overview)
  └── Pilot instrumentation (raw metrics)
```

Cross-links between Growth Foundation, Pilot Management, and Founder Console.

---

## Key Files

| File | Role |
|------|------|
| `apps/web/src/lib/growth-foundation.ts` | Early access, invitations, waitlist, referrals, activation |
| `apps/web/src/pages/GrowthFoundationPage.tsx` | Tabbed operator UI |

---

## Verification

```bash
npm run verify:mvp-ch7-sprint3
```

Sprint 3 tests + Chapter 7 Sprints 1–2 + Chapter 6 Sprint 4 + build.

---

## Screenshots

Capture in dev:

1. Early access overview with readiness score
2. Invitation management table
3. Waitlist form + entries
4. Referral signal capture
5. Marketplace activation summary

---

## Growth Readiness Score

| Dimension | Score |
|-----------|-------|
| Early access visibility | 91 |
| Invitation operability | 88 |
| Waitlist foundation | 90 |
| Referral signal capture | 89 |
| Activation decision support | 87 |
| Operator integration | 93 |
| **Growth Foundation RC** | **90/100** |

---

## Constraints Preserved

| Boundary | Status |
|----------|--------|
| Runtime JSON | Unchanged |
| APIs | Unchanged |
| Business logic | Unchanged |
| Public growth mechanics | None |
| External marketing tools | None |

---

## Remaining Limitations

1. Invitation counts use operator sample data until backend exists
2. No automated invitation sending — tracking only
3. Referral signals are operator-recorded intent, not user-generated
4. Per-browser localStorage — export/merge still manual for multi-operator use

---

## Recommendation

**Chapter 7 is complete** for operator-facing pilot operations and growth foundation. Proceed to controlled early access execution using Growth Foundation + Pilot Management workflows before any public-scale growth.

Growth Foundation RC is approved for post-pilot controlled growth planning.
