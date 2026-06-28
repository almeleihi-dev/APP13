# CH3-X14 — AN ACT Runtime Experience Registry

Production runtime experience registry — the single discovery layer for every runtime experience in AN ACT. References CH3-X5 through CH3-X13 only; never duplicates runtime logic, navigation, or state.

## Architecture

```
src/runtime-experience/runtime-registry/
├── domain/
│   ├── runtime-experience.ts
│   ├── runtime-catalog.ts
│   ├── runtime-capability.ts
│   └── runtime-metadata.ts
├── application/
│   ├── runtime-registry-service.ts
│   ├── runtime-discovery.ts
│   ├── runtime-loader.ts
│   └── runtime-validator.ts
├── presentation/
│   ├── registry-summary.ts
│   ├── registry-browser.ts
│   └── experience-map.ts
├── infrastructure/
│   └── runtime-registry-repository.ts
├── validation/
│   └── runtime-registry-validator.ts
└── module.ts
```

## Registered Experiences

| ID | Name | Chapter |
|----|------|---------|
| need | Need Experience | CH3-X5 |
| action | Action Experience | CH3-X6 |
| contract | Contract Experience | CH3-X7 |
| chat | Chat Experience | CH3-X8 |
| timeline | Timeline Experience | CH3-X9 |
| notification | Notification Experience | CH3-X10 |
| profile | Profile Experience | CH3-X11 |
| runtime-journey | Runtime Journey | CH3-X12 |
| runtime-state | Runtime State | CH3-X13 |

Each registration exposes: id, name, version, mode, lifecycle phase, primary route, supported routes, required/produced contexts, dependencies, capabilities, availability, and validation status.

## Discovery APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/runtime-registry` | Full registry view |
| GET | `/runtime-registry/catalog` | Complete catalog with summary |
| GET | `/runtime-registry/experiences` | List all experiences |
| GET | `/runtime-registry/experience/:id` | Single experience detail |
| GET | `/runtime-registry/map` | Experience map |
| GET | `/runtime-registry/dependencies` | Dependency graph |
| GET | `/runtime-registry/capabilities` | Capability coverage |
| POST | `/runtime-registry/reload` | Reload catalog |
| GET | `/runtime-registry/validate` | Validate registry |

## Validation

`validateRuntimeRegistry()` verifies CH3-X5–X13 registration, dependency graph integrity, route validity, lifecycle coverage, capability coverage, registry consistency, discovery correctness, no duplicate registrations, and no dependency violations.

## Verification

```bash
npm run verify:ch3-x14
```

Pipeline: runtime registry tests → TypeScript build → dependency cruiser → runtime registry validation.
