# X30 Business Intelligence Center

**Date:** 2026-06-20  
**Scope:** Read-only executive business intelligence projection (X30)  
**Status:** Complete

## Summary

X30 answers **“Why is APP13 growing, slowing, succeeding, or failing?”** by composing marketplace intelligence, launch simulation, investor readiness, mission control, platform operations, and post-launch monitoring into strategic business insights. The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → business intelligence repository snapshot
      X14 marketplace + X17 launch simulation + X18 investor
      + X21 mission control + X27 operations + X29 post-launch monitoring
  → X30 business intelligence builders
  → BusinessIntelligenceCenterView
```

## Repository Sources

X30 composes snapshots from:

| Layer | Source |
|---|---|
| Marketplace intelligence | X14 Marketplace Intelligence |
| Launch simulation | X17 Launch Simulation Engine |
| Investor readiness | X18 Investor Readiness Center |
| Mission control | X21 Mission Control |
| Platform operations | X27 Platform Operations Center |
| Post-launch monitoring | X29 Post-Launch Monitoring Center |

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/business-intelligence/domain/business-intelligence.ts` |
| Service | `src/experience/business-intelligence/application/business-intelligence-service.ts` |
| Repository | `src/experience/business-intelligence/infrastructure/business-intelligence-repository.ts` |
| Module factory | `createBusinessIntelligenceModule(db)` |
| Routes | `src/api/routes/business-intelligence.ts` |
| Tests | `test/x30-business-intelligence.test.ts` |
| Verify script | `scripts/verify-x30.sh` |

## Core Views

| View | Contents |
|---|---|
| Business overview | Business score, growth status, platform health, generated_at |
| Marketplace intelligence | Top categories, demand/supply distribution, opportunity gaps |
| Revenue intelligence | Contract volume, escrow volume, platform revenue, revenue trend |
| User intelligence | Active users, growth rate, retention/adoption signals |
| Contract intelligence | Created/completed contracts, completion rate, average value |
| Trust intelligence | Trust score, dispute/complaint rates, reputation signal |
| Geographic intelligence | Top segments, regional growth, regional opportunities |
| Operational intelligence | Execution/escrow health, issue volume, operational efficiency |
| Growth drivers | Strongest growth, adoption, and trust drivers |
| Executive insights | What's working, weakening, requires attention, should be scaled |
| Business intelligence score | Weighted 0–100 composite |

## Business Intelligence Score Weights

| Dimension | Weight |
|---|---|
| Marketplace | 20% |
| Revenue | 20% |
| Users | 15% |
| Contracts | 15% |
| Trust | 15% |
| Operations | 15% |

## Growth Status

| Status | Meaning |
|---|---|
| `ahead` | User growth ahead of projections with healthy monitoring score |
| `on_track` | Growth aligned with launch trajectory |
| `behind` | Growth trailing projections |
| `at_risk` | Material growth variance requiring intervention |
| `stable` | Moderate growth with monitoring score below expansion threshold |

## Geographic Intelligence Note

APP13 analytics do not yet include geo coordinates. Geographic intelligence derives deterministic **marketplace segments** from top action codes (service categories) as regional proxy segments.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/business-intelligence` | Full business intelligence center |
| `GET` | `/business-intelligence/overview` | Business overview |
| `GET` | `/business-intelligence/marketplace` | Marketplace intelligence |
| `GET` | `/business-intelligence/revenue` | Revenue intelligence |
| `GET` | `/business-intelligence/users` | User intelligence |
| `GET` | `/business-intelligence/contracts` | Contract intelligence |
| `GET` | `/business-intelligence/trust` | Trust intelligence |
| `GET` | `/business-intelligence/geography` | Geographic intelligence |
| `GET` | `/business-intelligence/operations` | Operational intelligence |
| `GET` | `/business-intelligence/drivers` | Growth drivers |
| `GET` | `/business-intelligence/insights` | Executive insights |

All endpoints require `platform_admin` role. Business intelligence score is included in the full center response.

## Verification

```bash
npm run test:x30-business-intelligence
npm run verify:x30
```

The verification chain runs:

1. `npm run verify:x29`
2. `npm run test:x30-business-intelligence`
3. `npm run build`
4. `npm run lint:imports`

## Rules

- Read-only experience layer
- No mutations
- No schema changes
- No migrations
- No AI dependencies
- Deterministic calculations only
