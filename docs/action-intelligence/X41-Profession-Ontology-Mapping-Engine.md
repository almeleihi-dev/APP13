# X41 Profession Ontology Mapping Engine

**Date:** 2026-06-20  
**Scope:** Action Intelligence Layer — profession ontology (X41)  
**Status:** Complete

## Summary

X41 answers **“How can APP13 understand every profession, trade, service, license, credential, and specialization in the world as a structured ontology that deterministically maps into Action Blueprints?”** It extends X40 without replacing it: Profession Ontology produces deterministic `BlueprintDraft` inputs that compile through the existing Action Blueprint Foundation Engine.

## Architecture

```
Authenticated user input
  → normalize channels (profession, trade, license, CV title, ...)
  → ProfessionGraph (in-memory ontology registry)
  → BlueprintDraft bridge (X41)
  → ActionBlueprint validation/compile (X40)
```

X41 never creates Action, Contract, Execution, Marketplace, Trust, or Browser records.

## Ontology Model

| Entity | Purpose |
|---|---|
| ProfessionOntology | Registry container |
| ProfessionNode | Hierarchy node |
| ProfessionHierarchy | Domain → profession → skill/capability tree |
| ProfessionCategory | physical_trade, advisory, creative, etc. |
| ProfessionBinding | Taxonomy + blueprint bindings |
| SkillDefinition / CapabilityDefinition | Structured capability model |
| CredentialRequirement / LicenseRequirement | Actor requirements |
| ProfessionRelationship | Related professions |
| ProfessionAlias / ProfessionKeyword | Deterministic matching |
| ProfessionGraph | Normalized classification output |
| ProfessionClassification | Classify result with trace |
| ProfessionTransformationTrace | Auditable mapping steps |

## Action Decomposition (ontology-only)

Macro, Meso, Micro, Cognitive, Interactive, Physical, Digital, Fine-grained, Nano — classified in `action_families` without execution.

## Hierarchy Levels

Domain → SubDomain → Profession → Specialization → Skill → Capability → Action Family

## Mapping Rules

1. Normalize all input channels into a single corpus.
2. Score against registry aliases, keywords, licenses, credentials, skills.
3. Select best profession with deterministic fallback.
4. Build ProfessionGraph from registry entry.
5. Bridge to X40 `BlueprintDraft` using primary taxonomy code and seed blueprint bindings.

## Bridge to X40

```
ProfessionGraph → bridgeProfessionGraphToBlueprintDraft → BlueprintDraft → ActionBlueprint (X40)
```

## Future X42 Integration

X42 Project Decomposition Engine will compose multiple profession/action-family nodes into blueprint composition graphs. X41 remains the atomic profession normalization layer.

## Routes

| Method | Path | Auth |
|---|---|---|
| GET | `/profession-ontology` | authenticated |
| GET | `/profession-ontology/overview` | authenticated |
| GET | `/profession-ontology/registry` | authenticated |
| GET | `/profession-ontology/hierarchy` | authenticated |
| GET | `/profession-ontology/professions` | authenticated |
| GET | `/profession-ontology/professions/:professionId` | authenticated |
| POST | `/profession-ontology/classify` | authenticated |
| POST | `/profession-ontology/transform` | authenticated |
| GET | `/profession-ontology/blueprint-bindings` | authenticated |
| GET | `/profession-ontology/taxonomy-bindings` | authenticated |
| GET | `/profession-ontology/schema` | authenticated |
| POST | `/profession-ontology/publish` | platform_admin |
| POST | `/profession-ontology/deprecate` | platform_admin |

## Verification

```bash
npm run verify:x41
```

Chains `verify:x40`, X41 tests, build, import lint.

## MVP Registry Professions (15)

Plumber, Electrician, Carpenter, Software Developer, Graphic Designer, Marketing Consultant, Accountant, Lawyer, Tutor, Event Organizer, Cleaner, Photographer, Property Inspector, Personal Assistant, Home Maintenance.
