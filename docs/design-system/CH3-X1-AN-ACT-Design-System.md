# CH3-X1 — AN ACT Design System

## Mission

Build the official Design System for AN ACT — the visual operating system for every future screen, component, interaction, animation, and experience in Chapter 3: The Living Professional OS.

**Framework-independent. Token-based. Deterministic. Fully documented.**

## Architecture

```
src/design-system/
  foundation/
    colors.ts          — semantic color tokens
    typography.ts      — Display through Terminal styles
    spacing.ts         — 4–64 spacing scale
    radius.ts          — small through circle
    elevation.ts       — elevation levels
    shadows.ts         — paired shadow tokens
    motion.ts          — duration and easing
    transitions.ts     — official AN ACT transition
    icons.ts           — icon names and sizes
  themes/
    need-mode.ts       — white / black / gray / blue
    action-mode.ts     — black / white / dark / blue
  components/
    buttons.ts         — primary, secondary, ghost
    inputs.ts          — text, search
    cards.ts           — base, timeline, achievement, analytics
    badges.ts          — professional badge
    progress.ts        — terminal progress
    navigation.ts      — bar, bottom nav, FAB
    live-frame.ts      — live frame spec
    avatar.ts          — avatar spec
    chips.ts           — chip spec
    timeline.ts        — timeline card reference
  tokens/
    design-tokens.ts   — aggregated token export
  documentation/
    design-system.ts   — validation, accessibility, philosophy
  module.ts            — public API
```

## Design Philosophy

- Semantic colors only — components reference token paths, never raw hex
- Dual modes: **Need Mode** (reflect) and **Action Mode** (execute)
- Official transition bridges modes with terminal typography
- Accessibility by default
- Future extensibility through token layers

## Need Mode

- White background
- Black typography
- Subtle gray surfaces
- Blue accents

## Action Mode

- Black background
- White typography
- Dark surfaces
- Blue highlights

## Transition Philosophy

```
Need Mode → Transition Screen → Action Mode
```

Transition screen supports:

- `an act...` (terminal typography)
- `Preparing...`
- Progress bar
- Background interpolation: white → gray → black (semantic transition tokens)

Reverse transition (Action → Need) is also defined.

## Verification

```bash
npm run verify:ch3-x1
```

Runs design system validation tests, TypeScript build, and dependency lint.
