# X39 Operator Onboarding Readiness Center

**Date:** 2026-06-20  
**Scope:** Read-only operator onboarding readiness projection (X39)  
**Status:** Complete

## Summary

X39 answers **“Can APP13 onboard a platform_admin operator to production hybrid browser + JSON workflows tomorrow?”** After X38 validates hybrid integrity, X39 aggregates blockers, warnings, a deduplicated remediation queue, an onboarding checklist, X-stack readiness, and the verify:x31–x39 chain into a single onboarding score. The experience is read-only, deterministic, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → operator onboarding readiness repository snapshot
      X38 operator experience integrity raw snapshot
      + package.json verify script registration
      + verify-x31.sh … verify-x39.sh chain sources
  → X39 onboarding builders
  → OperatorOnboardingReadinessCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/operator-onboarding-readiness/domain/operator-onboarding-readiness.ts` |
| Service | `src/experience/operator-onboarding-readiness/application/operator-onboarding-readiness-service.ts` |
| Repository | `src/experience/operator-onboarding-readiness/infrastructure/operator-onboarding-readiness-repository.ts` |
| Module factory | `createOperatorOnboardingReadinessModule(db)` |
| Routes | `src/api/routes/operator-onboarding-readiness.ts` |
| Tests | `test/x39-operator-onboarding-readiness.test.ts` |
| Verify script | `scripts/verify-x39.sh` |

## Core Views

| View | Contents |
|---|---|
| Onboarding overview | Score, status, blocker/warning counts, checklist progress, remediation queue size |
| Blocker register | Must-fix items (X31 browser_ready, X36 completeness, hybrid conflicts, verification chain) |
| Warning register | Fix-soon items (partial disclosure, orphan centers, workflow parity gaps) |
| Remediation queue | Deduplicated actions from X31/X36/X37/X38 recommendations |
| Onboarding checklist | Eight canonical pre-onboarding steps with pass/fail rationale |
| X-stack readiness | X31, X36, X37, X38 layer scores and ready flags |
| Verification chain | verify:x31 through verify:x39 script existence and chaining |
| Recommendations | Immediate, pre-onboarding, and post-onboarding actions |
| Onboarding score | Weighted 0–100 composite |

## Onboarding Status Tiers

| Status | Meaning |
|---|---|
| `onboarding_ready` | Score ≥85 with zero blockers |
| `developing` | Score ≥60 with partial readiness |
| `blocked` | Critical blockers or score below 60 |

## Onboarding Score Weights

| Dimension | Weight |
|---|---|
| Blocker clearance | 30% |
| X-stack readiness | 25% |
| Checklist completion | 20% |
| Remediation severity | 15% |
| Verification chain | 10% |

## Routes

All routes require authenticated `platform_admin` access:

- `GET /operator-onboarding-readiness`
- `GET /operator-onboarding-readiness/overview`
- `GET /operator-onboarding-readiness/blockers`
- `GET /operator-onboarding-readiness/warnings`
- `GET /operator-onboarding-readiness/remediation-queue`
- `GET /operator-onboarding-readiness/checklist`
- `GET /operator-onboarding-readiness/x-stack-readiness`
- `GET /operator-onboarding-readiness/verification`
- `GET /operator-onboarding-readiness/recommendations`
- `GET /operator-onboarding-readiness/score`

## Verification

```bash
npm run verify:x39
```

Chains `verify:x38`, runs X39 tests, build, and import lint.
