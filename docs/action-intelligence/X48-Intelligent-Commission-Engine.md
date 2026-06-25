# X48 Intelligent Commission Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer — intelligent commission (X48)  
**Status:** Complete

## Summary

X48 transforms APP13 Intelligent Prices (X47) plus Marketplace Listings (X46) and versioned Commission Policies into explainable, deterministic platform commissions. Calculation only — no payments, invoices, escrow, or fund transfers.

## Commission Model

```
Base Commission + Platform Cost + Risk Factor + Value Added + Marketplace Incentives
  → APP13 Commission
  → Provider Receives
  → Customer Total
  → Platform Revenue
```

## Supported Factors

- Intelligent Price
- Service Category
- Contract Type
- Execution Complexity
- Risk Level
- Live Frame Tier
- Provider / Customer Membership
- Loyalty Programs
- Promotional Campaigns
- Platform Operating Cost

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/intelligent-commission` | authenticated |
| POST | `/intelligent-commission/calculate` | authenticated |
| POST | `/intelligent-commission/preview` | authenticated |
| POST | `/intelligent-commission/explain` | authenticated |
| GET | `/intelligent-commission/policies` | authenticated |
| GET | `/intelligent-commission/breakdown?listing_id=` | authenticated |
| GET | `/intelligent-commission/version` | authenticated |
| POST | `/intelligent-commission/publish-policy` | platform_admin |
| POST | `/intelligent-commission/deprecate-policy` | platform_admin |

## Verification

```bash
npm run verify:x48
```

Chains `verify:x47`, X48 tests, build, import lint.

## Constraints

- Deterministic calculations only
- No payment processing or financial transactions
- Does not modify pricing or marketplace listings
- Read-only commission intelligence
