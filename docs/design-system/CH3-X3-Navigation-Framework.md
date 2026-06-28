# CH3-X3 — AN ACT Navigation & Screen Framework

## Mission

Define how every future AN ACT screen is structured, navigated, and transitioned. Framework-independent specifications only — no runtime UI, no application screens.

Consumes **CH3-X1 Design Tokens** and **CH3-X2 Core UI Components** exclusively.

## Architecture

```
src/navigation-framework/
  foundation/     — screen schema, context, layout, safe area
  navigation/     — top, bottom, side, stack, state
  layouts/        — need, action, transition, modal
  transitions/    — transition engine, progress, background
  registry/       — screen registry
  validation/     — navigation validator
  module.ts
```

## Screen Anatomy (8 Regions)

1. Safe Area
2. Status Area
3. Top Navigation
4. Screen Header
5. Content Area
6. Floating Action Area
7. Bottom Navigation
8. Transition Layer

## Official Layouts

| Layout | Mode | Focus |
|--------|------|-------|
| Need | White bg, black text | Reading, search |
| Action | Black bg, white text | Execution, contracts |
| Transition | Terminal typography | `an act...` mode bridge |
| Modal | Overlay scrim | Focused tasks |

## Transition Philosophy

- Brand: `an act...`
- Stages: Preparing..., Matching..., Building Contract..., Securing..., Action Ready.
- Background: Need → Transition → Action (reverse supported)

## Verification

```bash
npm run verify:ch3-x3
```
