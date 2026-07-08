# CH3-X4 — AN ACT Visual Prototype Library

## Mission

Define the complete visual blueprint of AN ACT before any runtime screens are implemented. Consumes only CH3-X1 Design System, CH3-X2 Core UI Components, and CH3-X3 Navigation Framework.

**No application logic. No runtime UI. Deterministic visual specifications only.**

## Architecture

```
src/prototype-library/
  foundation/     — prototype schema, context
  screens/        — 15 screen specification files (19 prototypes)
  flows/          — 5 visual flow definitions (9 flows)
  registry/       — prototype, flow, navigation catalogs
  validation/     — token, component, navigation compliance
  module.ts
```

## Prototype Catalog

### Need Side
- Need Home, Search, Request Creation, Opportunity List, Empty State

### Action Side
- Action Home, Contract, Active Action, Completion, Success, Rating

### Shared
- Chat, Timeline, Analytics, Profile, Notifications

### System
- Loading, Error, Transition

## Visual Flows

1. **First User Journey** — onboarding through first search
2. **Search to Action** — discovery to Action Mode via official transition
3. **Request to Contract** — request creation to contract review
4. **Action Flow** — contract through active execution
5. **Contract to Completion** — signing through success
6. **Completion to Rating** — completion, rating, return to Need Mode

## Official Transition

Every transition includes `an act...`, dynamic stages (Preparing... through Action Ready.), terminal progress, and Need ↔ Action background interpolation.

## Verification

```bash
npm run verify:ch3-x4
```
