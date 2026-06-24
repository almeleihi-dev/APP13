# X35 Browser Detail & Workflow Routes

**Date:** 2026-06-20  
**Scope:** Browser detail and workflow HTML route completion (X35)  
**Status:** Complete

## Summary

X35 completes the APP13 browser surface by wiring every remaining `src/ui/pages` renderer into public HTML routes. After X34 hub and journey coverage, operators can drill down into contract review, request analysis, escrow, evidence, milestone, dispute, provider profile, and trust timeline pages, plus browse a full route catalog at `GET /browse`.

## Architecture

```
Browser request
  → browser surface service
      browser-detail-fixtures (sync MVP snapshots)
      browser-detail-pages (catalog + cross-links)
      existing UI page renderers under src/ui/pages
      buildBrowserDocumentHtml (shared shell + /browser asset links)
  → text/html response (synchronous, no outbound HTTP)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Detail fixtures | `src/browser-surface/domain/browser-detail-fixtures.ts` |
| Detail shells | `src/browser-surface/domain/browser-detail-pages.ts` |
| Service extensions | `src/browser-surface/application/browser-surface-service.ts` |
| Routes | `src/api/routes/browser-surface.ts` |
| Tests | `test/x35-browser-detail-routes.test.ts` |
| Verify script | `scripts/verify-x35.sh` |

## Browser Routes

| Route | Auth | Renderer | Purpose |
|---|---|---|---|
| `GET /browse` | Public | `renderBrowserSurfaceCatalog` | Full browser route catalog |
| `GET /contracts/review` | Public | `renderContractReviewPage` | Contract review drill-down |
| `GET /requests/analysis` | Public | `renderRequestAnalysisPage` | Customer request analysis |
| `GET /requests/result` | Public | `renderWorkflowResultPage` | Workflow result projection |
| `GET /escrow` | Public | `renderEscrowOverviewPage` | Escrow overview |
| `GET /escrow/history` | Public | `renderEscrowHistoryPage` | Escrow history |
| `GET /evidence` | Public | `renderEvidenceOverviewPage` | Evidence overview |
| `GET /evidence/details` | Public | `renderEvidenceDetailsPage` | Evidence item details |
| `GET /evidence/attestations` | Public | `renderAttestationTimelinePage` | Attestation timeline |
| `GET /execution/milestones` | Public | `renderMilestoneDetailsPage` | Milestone drill-down |
| `GET /disputes/details` | Public | `renderDisputeDetailsPage` | Dispute metadata |
| `GET /disputes/resolution` | Public | `renderResolutionTimelinePage` | Resolution timeline |
| `GET /provider/profile` | Public | `renderProviderProfilePage` | Provider profile form |
| `GET /trust/report` | Public | `renderProviderTrustReportPage` | Provider trust report |
| `GET /trust/timeline` | Public | `renderTrustTimelinePage` | Trust lifecycle timeline |

X32–X34 routes remain unchanged.

## Boundaries

- Uses synchronous MVP fixture snapshots only (no DB, HTTP, or Redis in render path)
- Does not modify experience domain services or business rules
- Public routes set `authenticate: false` so session cookie lookup cannot block HTML delivery
- Catalog and cross-link shells live in `src/browser-surface/domain` only

## Verification

```bash
npm run verify:x35
```

Chains `verify:x34`, X35 tests, build, and import lint.

## Relationship to X31 and X32–X34

X35 wires all remaining UI page renderer modules into the browser surface, completing the P-series workflow detail coverage atop X34 hub and journey routes. The `/browse` catalog provides a human-readable index of every browser HTML route in APP13.
