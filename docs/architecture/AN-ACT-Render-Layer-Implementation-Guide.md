# AN ACT — Render Layer Implementation Guide

**Version:** 1.0  
**Companion:** [Render Layer Architecture](./AN-ACT-Render-Layer-Architecture.md)  
**Prerequisites:** [Runtime JSON Contract](./AN-ACT-Runtime-JSON-Contract.md), [Design Tokens Specification](./AN-ACT-Design-Tokens-Specification.md), [Design Tokens Export Plan](./AN-ACT-Design-Tokens-Export-Plan.md)  
**Constraint:** Documentation only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Backend / design system exists today |
| **Concept only** | Client code to be written |
| **Recommended** | Official implementation guidance |

---

## 1. Purpose

This guide tells engineers **how to build** the Render Layer described in the Architecture document. Every step assumes **zero business logic** on the client: fetch JSON, resolve tokens, dispatch components, relay actions.

---

## 2. Prerequisites Checklist

Before writing Render Layer code:

- [ ] Read [Render Layer Architecture](./AN-ACT-Render-Layer-Architecture.md) §2 (Zero Business Logic Rule)
- [ ] Read [Runtime JSON Contract](./AN-ACT-Runtime-JSON-Contract.md) §2–§7
- [ ] Read [Design Tokens Export Plan](./AN-ACT-Design-Tokens-Export-Plan.md) §1–§4
- [ ] Backend running with auth (`POST /auth/login`) — **Implemented**
- [ ] `GET /need-experience` returns envelope — **Implemented**
- [ ] `npm run verify:ch3-x1` passes — **Implemented**

---

## 3. Recommended Monorepo Layout

**Classification:** **Recommended**

```
APP13/
├── src/                          # Existing platform (unchanged)
├── packages/
│   ├── tokens/                   # @an-act/tokens
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── resolve.ts        # TokenResolver
│   │   │   └── types.ts
│   │   └── assets/tokens.json
│   │
│   ├── runtime-core/             # @an-act/runtime-core
│   │   ├── src/
│   │   │   ├── types.ts          # AnActRuntimeScreenView, RuntimeComponentInstance
│   │   │   ├── runtime-resolver.ts
│   │   │   ├── theme-resolver.ts
│   │   │   ├── live-frame-resolver.ts
│   │   │   ├── action-relay.ts
│   │   │   └── validation.ts
│   │   └── package.json
│   │
│   ├── runtime-ui/               # @an-act/runtime-ui (React + RN)
│   │   ├── src/
│   │   │   ├── registry/
│   │   │   │   ├── component-dispatcher.ts
│   │   │   │   └── components/
│   │   │   │       ├── AnActButton.tsx
│   │   │   │       ├── AnActCard.tsx
│   │   │   │       ├── AnActInput.tsx
│   │   │   │       ├── AnActBadge.tsx
│   │   │   │       └── AnActLiveFrame.tsx
│   │   │   ├── layout/
│   │   │   │   ├── region-renderer.tsx
│   │   │   │   └── navigation-renderer.tsx
│   │   │   ├── screen/
│   │   │   │   └── runtime-screen-renderer.tsx
│   │   │   ├── transition/
│   │   │   │   └── mode-transition.tsx
│   │   │   ├── providers/
│   │   │   │   └── an-act-mode-provider.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── runtime-client/           # @an-act/runtime-client
│       ├── src/
│       │   ├── runtime-client.ts
│       │   ├── auth-client.ts
│       │   └── hooks/
│       │       ├── use-runtime-screen.ts
│       │       └── use-need-experience.ts
│       └── package.json
│
└── apps/
    └── web/                      # Vite or Next.js MVP
        ├── src/
        │   ├── App.tsx
        │   ├── pages/
        │   │   ├── LoginPage.tsx
        │   │   └── RuntimePage.tsx
        │   └── main.tsx
        └── package.json
```

---

## 4. Build Order (Week-by-Week)

Aligns with [Transition To MVP Plan](./AN-ACT-Transition-To-MVP-Plan.md).

| Week | Package | Deliverable |
|------|---------|-------------|
| 1 | `@an-act/tokens` | `tokens.json`, `resolveColor`, CSS vars |
| 1 | `@an-act/runtime-core` | Types, RuntimeResolver, ThemeResolver |
| 2 | `@an-act/runtime-ui` | 5 P0 components + ComponentDispatcher |
| 2 | `@an-act/runtime-ui` | RuntimeScreenRenderer (regions + sections) |
| 3 | `@an-act/runtime-client` | Auth + fetch + action relay |
| 3 | `apps/web` | Login + Need Home pixel-perfect |
| 4 | All | Search → Opportunities → Request flow |
| 4 | `@an-act/runtime-ui` | Transition screen 640ms |
| 5+ | All | Action Home, Contract preview, E2E |

---

## 5. TokenResolver Implementation

**Classification:** **Concept only**

Port from **Implemented** server: `resolveSemanticColor`, `shadowTokenToCss`, `motionToCss`.

```typescript
// packages/tokens/src/resolve.ts — documentation example
import tokens from "../assets/tokens.json";

export type AnActMode = "need" | "action";

export function resolveColor(mode: AnActMode, path: string): string {
  const theme = tokens.colors.themes[mode];
  const flat = flattenTheme(theme);
  const value = flat[path];
  if (!value) throw new Error(`Unknown token: ${path} in mode ${mode}`);
  return value;
}

export function resolveSpacing(name: string): number {
  return tokens.spacing[name];
}
```

**Rules:**

- Never import hex constants in `runtime-ui` — only call TokenResolver
- Transition mode: interpolate between `transition.start/mid/end` using progress 0–1 — **Implemented** server spec

---

## 6. ThemeResolver Implementation

**Classification:** **Concept only**

```typescript
// packages/runtime-core/src/theme-resolver.ts — documentation example
export class ThemeResolver {
  private mode: AnActMode = "need";
  private reducedMotion = false;

  setMode(mode: AnActMode | "transition") {
    this.mode = mode === "transition" ? "need" : mode;
  }

  resolveColor(path: SemanticColorTokenPath): string {
    return resolveColor(this.mode, path);
  }

  resolveTransitionBackground(progress: number): string {
    const steps = tokens.transitions.forward.backgroundSteps;
    const token = interpolateTransitionBackground(progress, steps);
    return resolveColor("need", token);
  }
}
```

Wire from `screen.mode` on every render — **Recommended**.

---

## 7. RuntimeResolver Implementation

**Classification:** **Concept only**

```typescript
const REQUIRED_SCREEN_FIELDS = [
  "screenId", "prototypeId", "route", "mode", "layoutId",
  "designTokens", "sections", "navigation", "accessibility", "generatedAt",
] as const;

export function validateScreen(screen: unknown): ValidationResult {
  const errors: string[] = [];
  if (!screen || typeof screen !== "object") return { valid: false, errors: ["Not an object"] };
  for (const field of REQUIRED_SCREEN_FIELDS) {
    if (!(field in screen)) errors.push(`Missing ${field}`);
  }
  return { valid: errors.length === 0, errors };
}
```

Optional: validate against JSON Schema when published — **Concept only**.

---

## 8. LiveFrameResolver Implementation

**Classification:** **Concept only** — mapping **Implemented** in CH3 X2

```typescript
const TIER_ACCENT: Record<LiveFrameTier, SemanticColorTokenPath> = {
  bronze: "status.warning",
  silver: "border.subtle",
  gold: "status.warning",
  platinum: "accent.highlight",
  diamond: "accent.primary",
};

export function resolveLiveFrameAccent(tier: LiveFrameTier): SemanticColorTokenPath {
  return TIER_ACCENT[tier];
}
```

**Forbidden in Render Layer:** any function that computes tier from trust score.

---

## 9. ComponentDispatcher Implementation

**Classification:** **Concept only**

Mirror **Implemented** `CORE_UI_COMPONENT_IDS` (22 components). Register P0 first:

| componentId | Priority |
|-------------|----------|
| `core-ui-button` | P0 |
| `core-ui-input` | P0 |
| `core-ui-search` | P0 |
| `core-ui-card` | P0 |
| `core-ui-badge` | P0 |
| `core-ui-live-frame` | P0 |
| `core-ui-bottom-navigation` | P0 |
| `core-ui-navigation-bar` | P0 |
| `core-ui-loading` | P0 |
| `core-ui-progress` | P0 |

Unknown `componentId` → fallback panel + dev warning — **Recommended**.

---

## 10. RuntimeScreenRenderer Implementation

**Classification:** **Concept only**

Pipeline:

1. `ThemeResolver.setMode(screen.mode)`
2. Pre-validate `screen.designTokens[]` resolve
3. `LayoutRenderer` maps `screen.regions` to containers
4. Loop `screen.sections[].components[]` → `ComponentDispatcher`
5. `NavigationRenderer.apply(screen.navigation)`

---

## 11. ActionRelay Implementation

**Classification:** **Concept only** — maps to **Implemented** Need POST routes

| Action hint | Method | Path |
|-------------|--------|------|
| `continue-request` | POST | `/need-experience/request/continue` |
| `search` | POST | `/need-experience/search` |
| `navigate-search` | GET | `/need-experience/search` |

Route table is **transport only** — server decides outcomes.

---

## 12. Authentication Flow (Client)

**Classification:** **Concept only**

1. `POST /auth/login` → store tokens
2. `GET /auth/me` → display profile metadata
3. Attach `Authorization: Bearer` on all experience fetches
4. On 401 → `POST /auth/refresh` → retry
5. `POST /auth/logout` → clear store

Never use `roles[]` for engine permission decisions — **Recommended**.

---

## 13. React Implementation Strategy

**Classification:** **Recommended** primary path

```tsx
// apps/web — documentation example
export function RuntimePage({ experiencePath }: { experiencePath: string }) {
  const { data, error, relay } = useNeedExperience(experiencePath);
  if (error) return <ProblemDetailsView error={error} />;
  if (!data) return <AnActLoading />;
  return (
    <RuntimeScreenRenderer
      screen={data.screen}
      onAction={(hint, payload) => relay(hint, payload)}
    />
  );
}
```

- Storybook: one story per component × mode
- Do not copy `src/ui/pages/*` — legacy freeze
- Do not import platform `src/design-system/` in app — use `@an-act/tokens`

---

## 14. React Native Strategy

**Classification:** **Recommended**

- Share `runtime-core` and `runtime-client`
- Platform split: `*.web.tsx` / `*.native.tsx`
- `SafeAreaView` for `safeArea` region
- Map shadows via `elevationToShadow` port
- Navigation routes mirror `screen.route` for display; refetch on focus

---

## 15. Flutter Strategy

**Classification:** **Recommended** (deferred unless mobile-primary)

- `an_act_tokens` package with bundled JSON
- `AnActThemeExtension` for semantic colors
- `RuntimeScreenWidget` + `ComponentRegistry` map
- Codegen Dart from JSON in CI

---

## 16. SwiftUI Strategy

**Classification:** **Recommended** (deferred unless iOS-primary)

- Bundle `tokens.json`
- `@Environment(\.anActColors)`
- `ComponentFactory.view(for:instance)`
- SF Mono for terminal typography
- 640ms transition animation

---

## 17. Bubble Implementation Strategy

**Classification:** **Recommended** (prototype only)

1. API Connector with Bearer auth
2. Fetch `GET /need-experience/home`
3. Repeating group over sections/components
4. Conditional on `componentId`
5. Option Set colors from flat `tokens.need.json`
6. Workflows POST to experience APIs on click

**Limits:** Need Mode only; no transition engine; no trust formulas — **Documented**.

---

## 18. Error, Loading, Offline, Accessibility

See [Render Layer Architecture](./AN-ACT-Render-Layer-Architecture.md) §12–§14, §10.

- Errors: RFC 7807 `ProblemDetailsView` — never fake Runtime JSON
- Loading: `core-ui-loading` during fetch; transition screen during mode bridge
- Offline: read-only cached screen + banner — no queued mutations MVP
- Accessibility: 44px targets, labels from JSON, `border.focus` ring

---

## 19. Testing and Verification

```bash
npm run verify:ch3-x1
npm run verify:ch3-x2
npm run verify:ch3-x5
```

E2E: login → need home → search → opportunities → request → transition.

Zero-logic audit: no trust/match/contract formulas in client packages.

---

## 20. Official Recommendations

1. Build `@an-act/tokens` + `@an-act/runtime-core` before pixels
2. Five P0 components before full screen renderer
3. Live APIs from day one
4. PR checklist enforces zero business logic
5. No new UI in `src/ui/`
6. Bubble after React validates contract
7. Flutter/SwiftUI after React milestone M1

---

*Render Layer Implementation Guide v1.0 — documentation only.*

*Architecture: [AN-ACT-Render-Layer-Architecture.md](./AN-ACT-Render-Layer-Architecture.md)*
