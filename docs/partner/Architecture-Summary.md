# AN ACT — Architecture Summary (Partner Package)

**Audience:** Technical experts, strategic partners

---

## Layer model

```
Partner Landing / Demo / Executive (Phase 9 presentation)
         ↓
Render Layer — RuntimeScreenMount, relay, themes
         ↓
Runtime Client — transport only
         ↓
Experience APIs — Need, Action, Demo, Executive, AI, KB
         ↓
Domain + Intelligence engines
```

## Frozen contracts (RC2+)

- Runtime JSON schema version: `an-act-runtime-json-v1`
- Need experience: 6 screens
- Action experience: 7 screens
- Demo experience: 5 presentation screens (read-only)

## Render Layer rules

1. Components render `core-ui-*` from Runtime JSON only
2. Live Frame uses `ui_tier` — no trust calculations in UI
3. Relay intents map to backend via `@an-act/runtime-core`

## Demo architecture (CH3-X17)

- 10 scenarios including `first-user-journey`
- Playback controls: start, pause, resume, next, previous, restart, stop
- Delegates to runtime state, coordinator, registry, health

## Partner demo entry (Phase 9)

| Path | Surface |
|---|---|
| Landing | Vision, Knowledge Bank, ecosystem |
| Guided demo | `DemoPresenterPage` → `/runtime-demo/*` |
| Executive | `ExecutivePresentationPage` → executive + KB APIs |
| Live platform | Full customer/provider journey |

## Import boundaries

Enforced via `dependency-cruiser` — `npm run lint:imports`
