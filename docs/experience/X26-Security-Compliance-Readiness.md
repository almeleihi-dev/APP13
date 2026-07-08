# X26 Security & Compliance Readiness Center

**Date:** 2026-06-19  
**Scope:** Read-only security and compliance readiness projection (X26)  
**Status:** Complete

## Summary

X26 evaluates APP13 security posture, compliance readiness, access control coverage, auditability, and production security readiness using deterministic calculations only. It answers whether authentication, authorization, API security, secrets management, data protection, auditability, and compliance controls are ready for production deployment. The experience is read-only, has no AI dependencies, requires no schema changes, and enforces `platform_admin` access.

## Architecture

```
Authenticated platform_admin
  → security readiness repository snapshot
      server/index/config/middleware/route/service/documentation sources
  → X26 security readiness builders
  → SecurityReadinessCenterView
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/experience/security-readiness/domain/security-readiness.ts` |
| Service | `src/experience/security-readiness/application/security-readiness-service.ts` |
| Repository | `src/experience/security-readiness/infrastructure/security-readiness-repository.ts` |
| Module factory | `createSecurityReadinessModule(db)` |
| Routes | `src/api/routes/security-readiness.ts` |
| Tests | `test/x26-security-readiness.test.ts` |
| Verify script | `scripts/verify-x26.sh` |

## Core Views

| View | Contents |
|---|---|
| Security overview | Security score, authentication/authorization/API/data protection/compliance scores, risk count |
| Authentication audit | JWT coverage, middleware coverage, protected/unprotected routes, admin protection |
| Authorization audit | platform_admin, customer, provider, system role enforcement statistics |
| Secrets audit | Env key coverage, required/missing keys, hardcoded secret indicators (never exposes values) |
| API security audit | Public, authenticated, admin routes, missing protection risks |
| Data protection audit | Sensitive field, storage, PII indicators, risk assessment |
| Auditability review | Logging, event tracking, audit readiness scores |
| Compliance readiness | Privacy, consent, contract, evidence, terms readiness |
| Security risk register | Critical, high, medium, low risks |
| Security recommendations | Immediate, short term, medium term, long term actions |
| Security readiness score | Weighted composite across seven security dimensions |

## Security Readiness Score Weights

| Dimension | Weight |
|---|---|
| Authentication | 15% |
| Authorization | 15% |
| API security | 15% |
| Secrets management | 15% |
| Data protection | 15% |
| Auditability | 10% |
| Compliance | 15% |

Returns `security_readiness_score` (0–100).

## Audit Model

The repository inspects deterministic filesystem and source artifacts:

- `src/api/server.ts`, `src/index.ts`, `package.json`, `.env.example`
- Route registrations under `src/api/routes/`
- Auth middleware (`require-auth`, `authenticate`) and `src/security/guards.ts`
- Security-related configuration and logging/storage sources
- Application service role enforcement patterns
- Documentation artifacts under `docs/experience/`

Calculations parse route auth flags, role enforcement counts, env key presence (names only), and artifact existence. Secret values are never returned.

## Risk Model

Risks are categorized by severity (`critical`, `high`, `medium`, `low`) and domain (`secrets`, `authentication`, `authorization`, `api_security`, `data_protection`, `auditability`, `compliance`). Missing auth on sensitive routes, missing secret keys, incomplete JWT wiring, and weak auditability produce higher-severity findings.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/security-readiness` | Full security readiness center |
| `GET` | `/security-readiness/overview` | Security overview |
| `GET` | `/security-readiness/authentication` | Authentication audit |
| `GET` | `/security-readiness/authorization` | Authorization audit |
| `GET` | `/security-readiness/secrets` | Secrets audit |
| `GET` | `/security-readiness/api` | API security audit |
| `GET` | `/security-readiness/data-protection` | Data protection audit |
| `GET` | `/security-readiness/auditability` | Auditability review |
| `GET` | `/security-readiness/compliance` | Compliance readiness |
| `GET` | `/security-readiness/risks` | Security risk register |
| `GET` | `/security-readiness/recommendations` | Security recommendations |

All endpoints require `platform_admin` role. Security readiness score is included in the full center response.

## Verification

```bash
npm run test:x26-security-readiness
npm run verify:x26
```

The verification chain runs:

1. `npm run verify:x25`
2. `npm run test:x26-security-readiness`
3. `npm run build`
4. `npm run lint:imports`

## Rules

- Read-only experience layer
- No mutations
- No schema changes
- No migrations
- No AI dependencies
- Deterministic calculations only
- Secret values never exposed in audit output
