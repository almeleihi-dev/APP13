# AN ACT — Security Overview (Partner Package)

**Audience:** Strategic partners, investors, compliance reviewers

---

## Authentication

| Feature | Implementation |
|---|---|
| Login | `POST /v1/auth/login` |
| Registration | Customer + provider endpoints |
| Access tokens | JWT with sub, role, sessionId |
| Refresh | `POST /v1/auth/token/refresh` with rotation |
| Logout | Server + local session clear |
| Web persistence | `LocalStorageAuthStorage` |

## Session hardening (RC2)

- Silent refresh on 401 with single retry
- Logout on refresh failure
- Session expiry gate in web shell

## Authorization

- Route-level `authRequired` middleware
- Role-based guards (`customer`, `provider`, `platform_admin`)
- Ownership checks on profile mutations

## Validation

- Server-authoritative only — web displays errors, never duplicates policy
- Problem Details (RFC 7807-style) error responses

## Audit

- Security audit service (B8 verified)
- Identity engine validation on registration

## Demo mode security

- Runtime demo is **read-only** and **deterministic**
- Simulated data — no production mutations
- Requires authenticated session

## Recommendations for production

1. Enforce HTTPS everywhere
2. Rate-limit registration and login
3. Monitor refresh failure rates
4. Rotate JWT signing keys on schedule
