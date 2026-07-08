# AN ACT — Technical Overview (Partner Package)

**Audience:** Technical experts, technology companies  
**Version:** Phase 9 partner demo  
**Status:** Presentation reference — architecture frozen at RC2

---

## Platform stack

| Layer | Technology |
|---|---|
| API server | Node.js 20+, Fastify, TypeScript |
| Web shell | React 18, Vite 6, Render Layer (`@an-act/runtime-ui`) |
| Transport | `@an-act/runtime-client` (auth, relay, experience GET/POST) |
| Contracts | Runtime JSON `an-act-runtime-json-v1` |
| Persistence | PostgreSQL (identity, sessions, domain aggregates) |
| Intelligence | 50+ compiled engines via Knowledge Bank |

## Architecture principles

1. **Server authoritative** — all business logic in backend experience services.
2. **Runtime JSON driven** — web renders screens; never computes trust or business rules.
3. **Transport only client** — no direct fetch in web shell for experience APIs.
4. **Modular monolith** — bounded contexts with dependency-cruiser import lint.

## Key packages

| Package | Role |
|---|---|
| `packages/runtime-core` | Relay maps, intent resolver, contract validation |
| `packages/runtime-client` | HTTP + auth + experience transport |
| `packages/runtime-ui` | Render Layer React components |
| `packages/tokens` | Design tokens, theme CSS variables |
| `apps/web` | Production SPA + PWA |

## Experience APIs

- Need, Action, Contract, Profile, Chat, Timeline, Notification
- Runtime Demo (CH3-X17), Runtime Executive (CH3-X22)
- AI guidance, execution companion, contract intelligence
- Knowledge Bank (X54), Living onboarding, Professional passport

## Verification

```bash
npm run verify:mvp-phase9
```
