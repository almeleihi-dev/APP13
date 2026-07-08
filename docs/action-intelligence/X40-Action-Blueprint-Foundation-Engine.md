# X40 Action Blueprint Foundation Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer foundation (X40)  
**Status:** Complete

## Summary

X40 answers **“How can any human service, profession, or project be transformed into a standardized executable Action Blueprint?”** It establishes the Action Blueprint schema v1, deterministic transform channels, validation engine, compile-preview (no runtime side effects), seed registry with 15 MVP taxonomy blueprints, and taxonomy bridge to APP13 Action Taxonomy v1.

## Architecture

```
Authenticated user
  → Action Blueprint service
      deterministic transformers (service / profession / project)
      validation engine
      compile-preview compiler
      in-memory seed + published registry
  → ActionBlueprint views (preview only)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Domain | `src/action-blueprint/domain/action-blueprint.ts` |
| Schema | `src/action-blueprint/domain/blueprint-schema.ts` |
| Transformers | `src/action-blueprint/domain/blueprint-transform.ts` |
| Taxonomy bridge | `src/action-blueprint/domain/taxonomy-bridge.ts` |
| Compiler | `src/action-blueprint/domain/blueprint-compiler.ts` |
| Service | `src/action-blueprint/application/action-blueprint-service.ts` |
| Repository | `src/action-blueprint/infrastructure/action-blueprint-repository.ts` |
| Module | `createActionBlueprintModule()` |
| Routes | `src/api/routes/action-blueprint.ts` |
| Tests | `test/x40-action-blueprint.test.ts` |
| Verify | `scripts/verify-x40.sh` |

## Blueprint Lifecycle

| Status | Meaning |
|---|---|
| `draft` | Transformed, not yet validated |
| `validated` | Passes schema and taxonomy rules |
| `published` | Registry-visible, compilable |
| `deprecated` | Superseded, compilable with warning |
| `archived` | Read-only historical |

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/action-blueprint` | authenticated |
| GET | `/action-blueprint/overview` | authenticated |
| POST | `/action-blueprint/transform/service` | authenticated |
| POST | `/action-blueprint/transform/profession` | authenticated |
| POST | `/action-blueprint/transform/project` | authenticated |
| POST | `/action-blueprint/validate` | authenticated |
| POST | `/action-blueprint/compile-preview` | authenticated |
| GET | `/action-blueprint/registry` | authenticated |
| GET | `/action-blueprint/registry/:blueprintId` | authenticated |
| GET | `/action-blueprint/registry/:blueprintId/versions/:version` | authenticated |
| GET | `/action-blueprint/schema` | authenticated |
| GET | `/action-blueprint/taxonomy-bridge` | authenticated |
| POST | `/action-blueprint/registry/publish` | platform_admin |
| POST | `/action-blueprint/registry/deprecate` | platform_admin |

## Verification

```bash
npm run verify:x40
```

Chains `verify:x39`, X40 tests, build, and import lint.

## Constraints

- No Postgres schema migrations
- No external AI calls
- No Action, Contract, Escrow, Execution, Marketplace, Trust, or Browser record creation
- Compile-preview only
