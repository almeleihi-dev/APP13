# X42 Project Decomposition Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer — project decomposition (X42)  
**Status:** Complete

## Summary

X42 answers **“How can any project goal be decomposed into a structured Project Blueprint Graph of reusable ActionBlueprint nodes?”** It extends X40 (Action Blueprint Foundation) and X41 (Profession Ontology) without modifying their public APIs. Projects are not runtime entities; decomposition is deterministic and compile-preview only.

## Architecture

```
Project input (name + goal)
  → template match (deterministic)
  → ProjectBlueprintGraph (DAG of blueprint nodes)
  → per-node BlueprintDraft bridge (X41/X40)
  → compile-preview (X40 compiler per node)
```

## Ontology Model

| Component | Purpose |
|---|---|
| Project phases | discovery, planning, execution, verification, completion |
| Blueprint composition nodes | Reusable ActionBlueprint anchors with taxonomy + profession bindings |
| Blueprint composition edges | finish-to-start / start-to-start dependencies |
| Parallel execution groups | Nodes at same DAG depth |
| Critical path | Longest weighted path through DAG |
| Deliverable mapping | Deliverables linked to nodes and phases |
| Blueprint reuse detection | Shared blueprint IDs across nodes |

## Bridge to X40 / X41

Each graph node binds to a profession (X41) and taxonomy code (X40 seed registry). `bridgeProfessionGraphToBlueprintDraft` produces `BlueprintDraft` inputs; X40 `compileBlueprintPreview` compiles each node without runtime side effects.

## Future Integration

X43 TEKRR Synthesizer will consume compiled project previews. X42 owns project-level DAG composition only.

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/project-decomposition` | authenticated |
| GET | `/project-decomposition/overview` | authenticated |
| POST | `/project-decomposition/transform` | authenticated |
| POST | `/project-decomposition/validate` | authenticated |
| POST | `/project-decomposition/compile-preview` | authenticated |
| GET | `/project-decomposition/schema` | authenticated |
| GET | `/project-decomposition/templates` | authenticated |
| GET | `/project-decomposition/graph?project_id=` | authenticated |
| GET | `/project-decomposition/dependencies?project_id=` | authenticated |
| GET | `/project-decomposition/critical-path?project_id=` | authenticated |
| GET | `/project-decomposition/phases?project_id=` | authenticated |
| POST | `/project-decomposition/publish` | platform_admin |
| POST | `/project-decomposition/deprecate` | platform_admin |

## Seed Templates

- build-company-website
- home-renovation
- office-relocation
- care-program
- learning-program
- annual-maintenance

## Verification

```bash
npm run verify:x42
```

Chains `verify:x41`, X42 tests, build, import lint.

## Constraints

- No Postgres migrations
- No AI calls
- No Action, Contract, Trust, Escrow, Marketplace, Browser, or Operator record creation
- Compile-preview only
