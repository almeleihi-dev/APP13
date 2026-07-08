# APP13 RC-1 Architecture Summary

**Generated:** 2026-06-22T01:39:52.465Z

## Marketplace Operating System slices

APP13 RC-1 is a modular monolith spanning identity, contract, execution, financial, trust, and experience layers.

### Registered experience modules (S3–S14)

- S3
- S4
- S5
- S6
- S7
- S8
- S9
- S10
- S11
- S12
- S13
- S14

## Bootstrap wiring

- Application bootstrap: `src/index.ts`
- HTTP server composition: `src/api/server.ts`
- Database migrations: `database/migrations/`

## Layer map

| Layer | Modules |
|---|---|
| Trust & reputation | S3, S5 (`createTrustModule`) |
| Provider & request experience | S6, S7 |
| Conversion & contracts | S4, S8 |
| Dashboards | S9 customer, S10 provider |
| Operations & analytics | S11 admin console, S14 analytics |
| Notifications & discovery | S12 event inbox, S13 discovery |

## Dependency boundaries

Dependency-cruiser configuration is present (`.dependency-cruiser.cjs`).

All S3–S14 module factories are registered in bootstrap with 20 migrations present.
