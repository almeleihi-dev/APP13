# AN ACT — Runtime JSON Contract

**Version:** 1.0  
**Status:** Official canonical specification (documentation)  
**Scope:** Single source of truth for all client renderers — React, React Native, Flutter, SwiftUI, Bubble, Web  
**Constraint:** Derived from repository evidence only. No source code modified.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Exists in TypeScript types, presentation builders, or REST APIs today |
| **Documented** | Described in markdown; may not be fully wired |
| **Concept only** | Recommended unified contract; not yet published as JSON Schema file |
| **Recommended** | Official v1.0 guidance requiring future implementation |

---

## 1. Overall Runtime JSON Philosophy

**Classification:** **Implemented** (CH3 runtime modules); unified envelope **Recommended**

Runtime JSON is the **server-authoritative contract** between AN ACT experience modules and every future client renderer. It replaces HTML/CSS payloads with structured, token-aware, component-instance trees.

### Core principles (from Product Bible §30 and CH3 builders)

| Principle | Rule | Status |
|-----------|------|--------|
| Server authoritative | Screen structure is built by presentation builders on the server | **Implemented** |
| Component instances, not markup | Clients map `componentId` + `variant` + `props` to native widgets | **Implemented** |
| Token paths, not hex | Colors/spacing use semantic token names; clients resolve via `DESIGN_TOKENS` | **Implemented** |
| Prototype linkage | Every screen carries `prototypeId` for design QA against CH3-X4 | **Implemented** |
| No inline styles | Typography and spacing referenced by token names only | **Implemented** |
| Deterministic timestamps | `generated_at` / `generatedAt` on every view | **Implemented** |
| Validators gate quality | Experience validators reject screens missing prototype or token compliance | **Implemented** |

### Response families in the platform today

| Family | Example endpoints | Has full `RuntimeScreenView`? | Primary use |
|--------|-------------------|-------------------------------|-------------|
| **Runtime Experience** | `GET /need-experience`, `/action-experience`, `/profile-experience` | Yes | MVP Render Layer |
| **Runtime Screen only** | `GET /need-experience/home`, `/contract-experience/review` | Yes | Single-screen fetch |
| **Semantic View** | `GET /home`, `/discover/providers`, `/live-frame` | No (data-first) | Dashboards, trust, discovery |
| **Intelligence View** | `GET /ai-experience/*`, `/marketplace-intelligence/*` | No | CH4/CH5 read-only |
| **Executive View** | `GET /runtime-executive/*` | Partial (simplified sections) | Operator dashboards |
| **Auth** | `POST /auth/login`, `GET /auth/me` | No | Session bootstrap |

**Canonical rule:** All **user-facing pixel surfaces** in MVP MUST consume **Runtime Experience** or **Runtime Screen** payloads. Semantic and Intelligence views MAY be embedded as `props` inside component instances or fetched separately.

---

## 2. Canonical Screen Contract

**Classification:** **Implemented** (per-module TypeScript interfaces); unified name **Recommended**

Every CH3 runtime experience module defines a `*RuntimeScreenView` interface with the same structural shape. The canonical type is **`AnActRuntimeScreenView`**.

### `AnActRuntimeScreenView` (canonical)

```json
{
  "screenId": "need-home",
  "prototypeId": "prototype-need-home",
  "route": "/need/home",
  "mode": "need",
  "layoutId": "need-layout",
  "designTokens": [
    "background.primary",
    "text.primary",
    "surface.secondary",
    "accent.primary",
    "border.subtle"
  ],
  "typography": {
    "header": "heading",
    "body": "body"
  },
  "spacing": {
    "contentPaddingX": "space-16",
    "contentPaddingY": "space-16",
    "gap": "space-12"
  },
  "regions": [
    "safeArea",
    "statusArea",
    "topNavigation",
    "screenHeader",
    "contentArea",
    "bottomNavigation"
  ],
  "sections": [],
  "navigation": {},
  "accessibility": {},
  "generatedAt": "2026-06-28T12:00:00.000Z"
}
```

### Source implementations (all **Implemented**)

| Module | TypeScript interface | Version constant |
|--------|---------------------|------------------|
| Need | `NeedRuntimeScreenView` | `an-act-need-experience-v1` |
| Action | `ActionRuntimeScreenView` | `an-act-action-experience-v1` |
| Contract | `ContractRuntimeScreenView` | `an-act-contract-experience-v1` |
| Chat | `ChatRuntimeScreenView` | `an-act-chat-experience-v1` |
| Timeline | `TimelineRuntimeScreenView` | `an-act-timeline-experience-v1` |
| Notification | `NotificationRuntimeScreenView` | `an-act-notification-experience-v1` |
| Profile | `ProfileRuntimeScreenView` | `an-act-profile-experience-v1` |

Builder entry point: `buildRuntimeScreenView()` in each module's `presentation/screen-builder.ts` — **Implemented**.

---

## 3. Screen Identity

**Classification:** **Implemented**

Each screen is identified by a stable triple:

| Field | Purpose | Example |
|-------|---------|---------|
| `screenId` | Module-local screen enum value | `"opportunity-list"` |
| `prototypeId` | CH3-X4 prototype registry key | `"prototype-opportunity-list"` |
| `route` | Canonical app route | `"/need/opportunities"` |

### Screen ID registries (**Implemented**)

| Experience | Screen IDs (sample) |
|------------|---------------------|
| Need | `need-home`, `search`, `opportunity-list`, `request`, `empty-state`, `transition` |
| Action | `action-home`, `contract-preview`, `active-action`, `progress-screen`, `completion-screen`, `waiting-screen`, `transition` |
| Contract | `contract-home`, `contract-review`, `parties`, `terms`, `timeline`, `cost`, `confirmation`, `status`, `empty-state`, `transition` |
| Profile | `profile-home`, `profile-identity`, `profile-live-frame`, `profile-achievements`, `profile-analytics`, `profile-history`, `profile-settings`, `profile-empty-state` |

Route maps: `NEED_SCREEN_ROUTES`, `ACTION_SCREEN_ROUTES`, etc. — **Implemented**.

API pattern: `GET /{experience}-experience/screen/:screenId` — **Implemented** (Need, Action, Contract, Profile, others).

---

## 4. Layout Schema

**Classification:** **Implemented**

Layouts are defined in `src/navigation-framework/layouts/` and referenced by `layoutId` on every screen.

### Registered layouts (**Implemented**)

| layoutId | mode | backgroundToken | Purpose |
|----------|------|-----------------|---------|
| `need-layout` | `need` | `background.primary` | Reading/search discovery |
| `action-layout` | `action` | `background.primary` | Execution-focused |
| `transition-layout` | `transition` | `transition.start` → interpolated | Official mode transition |
| `modal-layout` | `modal` | `surface.elevated` | Modal overlays |
| `modal-layout` (sheet variant) | `modal` | — | Bottom sheets |

### Screen regions (**Implemented**)

From `SCREEN_REGIONS` in navigation framework:

```
safeArea | statusArea | topNavigation | screenHeader | contentArea |
floatingActionArea | bottomNavigation | transitionLayer
```

Each layout declares which regions are `required`. Standard layouts include at minimum: `safeArea`, `statusArea`, `contentArea`.

### Layout binding on screen

The screen carries:

- `layoutId` — registry key
- `mode` — `"need" | "action" | "transition"` (matches `AnActMode` + transition)
- `regions` — ordered region IDs active on this screen
- `designTokens` — semantic color paths required to render (from prototype)
- `typography` — `{ header, body }` as `TypographyStyle` token names
- `spacing` — `{ contentPaddingX, contentPaddingY, gap }` as `SpacingTokenName`

---

## 5. Component Schema

**Classification:** **Implemented**

### `RuntimeComponentInstance`

```json
{
  "id": "home-search",
  "componentId": "core-ui-search",
  "variant": "search",
  "props": {
    "placeholder": "Search for services...",
    "route": "/need/search"
  },
  "accessibility": {
    "label": "Search opportunities",
    "role": "searchbox",
    "tabIndex": 0
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique within screen; stable for tests and focus |
| `componentId` | Yes | Key in `CORE_UI_COMPONENT_REGISTRY` |
| `variant` | No | Variant id from component definition |
| `props` | Yes | Component-specific data (plain JSON) |
| `accessibility` | Recommended | `label`, `role`, `tabIndex`, `describedBy` |

### Registered component IDs (**Implemented** — 23 components)

From `src/design-system/core-ui/registry/component-registry.ts`:

`core-ui-button`, `core-ui-input`, `core-ui-search`, `core-ui-card`, `core-ui-timeline-card`, `core-ui-achievement-card`, `core-ui-analytics-card`, `core-ui-contract-card`, `core-ui-recommendation-card`, `core-ui-live-frame`, `core-ui-badge`, `core-ui-chip`, `core-ui-avatar`, `core-ui-progress`, `core-ui-navigation-bar`, `core-ui-side-navigation`, `core-ui-bottom-navigation`, `core-ui-floating-action-button`, `core-ui-modal`, `core-ui-dialog`, `core-ui-sheet`, `core-ui-toast`, `core-ui-loading`

### Section wrapper

```json
{
  "id": "search-entry",
  "label": "Search Entry",
  "purpose": "Primary search entry point for discovering opportunities.",
  "components": []
}
```

Sections group components by UX purpose. Validators map allowed `componentId` values per `screenId` — **Implemented** (e.g. `need-experience-validator.ts`, `contract-experience-validator.ts`).

### Nested component references

Cards MAY embed component hints in `props` (not separate instances):

```json
{
  "liveFrame": {
    "componentId": "core-ui-live-frame",
    "tier": "gold"
  },
  "badges": [
    { "componentId": "core-ui-badge", "variant": "professional", "label": "Licensed" }
  ]
}
```

Pattern from `opportunity-list.ts` — **Implemented**.

---

## 6. Action Schema

**Classification:** **Implemented** (server-side); client dispatch **Concept only**

Actions describe **user intents** posted back to experience APIs. Each module defines typed action unions.

### Need Experience actions (**Implemented**)

| type | Purpose |
|------|---------|
| `navigate` | `{ targetScreen: NeedScreenId }` |
| `back` | Pop navigation stack |
| `bottom-nav` | `{ itemId: string }` |
| `search` | `{ keyword, category? }` |
| `filter-category` | `{ category }` |
| `select-opportunity` | `{ opportunityId }` |
| `update-request` | `{ fields: Partial<RequestDraft> }` |
| `continue-request` | Advance request flow |
| `start-transition` | Begin need→action transition |
| `advance-transition` | `{ progress, stageIndex? }` |

POST endpoints: `/need-experience/search`, `/need-experience/request/continue`, `/need-experience/transition/advance` — **Implemented**.

### Component-level action hints

Buttons and inputs MAY include action hints in `props`:

```json
{ "label": "Continue", "action": "continue-request" }
{ "action": "navigate-search" }
```

Clients MUST map these to the corresponding POST/GET experience endpoints — **Recommended** client contract.

### Profile actions (**Implemented**)

Includes `return-need-home`, `return-action-home`, `return-timeline`, `return-notifications` for cross-experience navigation.

---

## 7. Navigation Schema

**Classification:** **Implemented**

### Screen-level navigation view

Embedded on every `RuntimeScreenView`:

```json
{
  "pattern": "stack",
  "canGoBack": true,
  "backRoute": "/need/search",
  "bottomNavigationVisible": true,
  "activeBottomNavId": "search",
  "stackDepth": 3,
  "nextRoute": "/need/request/create"
}
```

| Field | Values | Source |
|-------|--------|--------|
| `pattern` | `stack`, `tab`, `modal`, `sheet` | Per-screen builder |
| `canGoBack` | boolean | `NavigationState.canGoBack` |
| `backRoute` | string? | Previous stack entry |
| `bottomNavigationVisible` | boolean | Hidden during transition/modal |
| `activeBottomNavId` | string? | Bottom nav item id |
| `stackDepth` | number | Stack length |
| `nextRoute` | string? | Suggested forward route |

### Session-level navigation state

Full experience envelopes include `NavigationState`:

```json
{
  "mode": "need",
  "phase": "idle",
  "stack": [
    { "screenId": "root", "route": "/", "presentation": "push", "timestamp": "..." }
  ],
  "activeRoute": "/need/opportunities",
  "canGoBack": true,
  "bottomNavigationVisible": true,
  "sideNavigationVisible": false,
  "transitionActive": false
}
```

Phases: `idle`, `transitioning`, `modal-open`, `sheet-open`, `overlay-open` — **Implemented**.

### Runtime Journey orchestration

`GET /runtime-journey/*` coordinates multi-experience flows — **Implemented**. Journey responses include `active` step resolution delegating to child experiences.

---

## 8. Theme Contract

**Classification:** **Implemented**

### Design system version

`an-act-design-system-v1` — aggregate `DESIGN_TOKENS` in `src/design-system/tokens/design-tokens.ts`.

### Mode themes

| Mode | Theme object | Key tokens |
|------|--------------|------------|
| `need` | `NEED_MODE_THEME` | White background, black typography, minimal chrome |
| `action` | `ACTION_MODE_THEME` | Dark background `#111111`, white typography |

Screen `mode` field tells clients which theme to apply. Transition screens interpolate background tokens per `NeedTransitionView.backgroundSteps` — **Implemented**.

### Token resolution rule

1. Read `designTokens[]` from screen (required palette for this view)
2. Resolve each path against `DESIGN_TOKENS.colors.themes[mode]`
3. Never use raw hex from JSON payloads (except legacy intelligence views — deprecated for render)

### Typography and spacing tokens

- Typography styles: `heading`, `body`, `title`, `caption`, `terminal`, etc. — **Implemented**
- Spacing: `space-8`, `space-12`, `space-16`, `space-24`, etc. — **Implemented**

Export target for clients: `@an-act/tokens` package — **Concept only** (Transition To MVP Plan P0).

---

## 9. Live Frame Contract

**Classification:** **Implemented** (multiple shapes); unified v1.0 **Recommended**

See [Live Frame v1.0 Specification](./AN-ACT-Live-Frame-v1.0-Specification.md).

### In Runtime JSON (presentation layer)

`core-ui-live-frame` component props:

```json
{
  "tier": "gold",
  "score": 88,
  "readOnly": true
}
```

`tier` MUST be a UI tier: `bronze | silver | gold | platinum | diamond` — **Implemented** in CH3 X2.

### Embedded in card props

```json
{
  "liveFrame": {
    "componentId": "core-ui-live-frame",
    "tier": "gold"
  }
}
```

### Trust data API (semantic, not screen tree)

`GET /live-frame` returns `LiveFrameExperienceView` with S5 trust tiers — **Implemented**.

**v1.0 requirement (**Recommended**):** Runtime screens SHOULD include both `trust_score` (0–100) and `ui_tier` when trust data is available. Demo repos today use static tiers — **Implemented** (demo only).

---

## 10. Authentication Contract

**Classification:** **Implemented**

### Login / register response (`AuthTokens`)

```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "<refresh>"
}
```

Endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` — **Implemented**.

### Session profile (`GET /auth/me`)

```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "role": "customer",
  "roles": ["customer"],
  "session_id": "sess_xyz789"
}
```

### Request authentication

| Mechanism | Rule |
|-----------|------|
| Header | `Authorization: Bearer <access_token>` |
| Route config | `{ authRequired: true }` on experience routes |
| Context | `AuthContext`: `userId`, `roles`, `tier`, `status`, `sessionId?` |

Protected runtime routes reject unauthenticated requests with RFC 7807 problem details — **Implemented**.

---

## 11. Session Contract

**Classification:** **Implemented** (in-memory per experience module)

### Runtime Experience envelope

Full experience responses wrap screen + session state:

```json
{
  "version": "an-act-need-experience-v1",
  "current_screen": "need-home",
  "mode": "need",
  "screen": { },
  "navigation": { },
  "search": { },
  "request_draft": { },
  "transition": null,
  "flow": [ ],
  "generated_at": "2026-06-28T12:00:00.000Z",
  "runtime_experience": true
}
```

### Session fields by module

| Module | Session fields |
|--------|----------------|
| Need | `search`, `request_draft`, `transition`, `selectedOpportunityId` |
| Contract | `summary`, `visited_sections`, `review`, `transition` |
| Profile | `summary` (compact), cross-experience version refs |
| Journey | `session_id`, `state`, `history`, `presentation` |

Sessions are keyed by `userId`, stored in-memory — **Implemented** (demo/MVP). Persistence flag on Profile: `persistence: false` — **Implemented**.

Query param: `generated_at` — optional deterministic timestamp for demos — **Implemented**.

---

## 12. Error Contract

**Classification:** **Implemented**

RFC 7807 Problem Details (`ProblemDetails`):

```json
{
  "type": "https://app13.dev/problems/NOT_FOUND",
  "title": "Not Found",
  "status": 404,
  "detail": "Unknown need screen: invalid-id",
  "code": "NOT_FOUND",
  "engine": "platform",
  "request_id": "req_abc123"
}
```

### Standard error codes (**Implemented**)

`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, `TIER_INSUFFICIENT`, `ACCOUNT_SUSPENDED`, `EXECUTION_BLOCKED`, etc.

Clients MUST NOT attempt to render a `RuntimeScreenView` from error responses. Display error UI using `title`, `detail`, and `code`.

---

## 13. Loading Contract

**Classification:** **Implemented**

### Transition screen (official loading UX)

Screen id: `transition` with `layoutId: transition-layout`.

`NeedTransitionView` (**Implemented**):

```json
{
  "brandLine": "an act...",
  "stageText": "Preparing action mode",
  "stageTexts": ["...", "...", "...", "...", "..."],
  "progress": 0.4,
  "progressVariant": "linear",
  "progressValue": 40,
  "phase": "running",
  "direction": "need-to-action",
  "backgroundToken": "transition.mid",
  "components": {
    "loadingComponentId": "core-ui-loading",
    "progressComponentId": "core-ui-progress"
  }
}
```

Duration: 640ms (`MOTION_DURATIONS.extraSlow`), 5 stages — **Implemented** in transition spec.

### Waiting screens

Action experience `waiting-screen` uses `core-ui-loading` + `core-ui-progress` — **Implemented**.

### Client rule

When `navigation.phase === "transitioning"` or `transitionActive === true`, block interaction — **Implemented** in navigation state spec.

---

## 14. Empty State Contract

**Classification:** **Implemented**

Dedicated screen id: `empty-state` (Need, Contract, Profile modules).

Structure:

- `screenId`: `"empty-state"`
- `prototypeId`: `"prototype-empty-state"`
- Section `empty-content` with:
  - `core-ui-card` — title + message
  - `core-ui-button` — primary recovery action
  - Optional `core-ui-search` — alternate path

Opportunity list with zero results delegates to `buildEmptyStateScreen()` — **Implemented**.

Empty state props pattern:

```json
{
  "title": "No opportunities",
  "message": "No matching opportunities were found.",
  "actionLabel": "Back to search"
}
```

---

## 15. Validation Contract

**Classification:** **Implemented**

### Server-side validation

Each experience exposes `GET /{experience}-experience/validate` returning validation result — **Implemented**.

Checks include:

- Prototype exists for every screen id
- Components used are in allow-list for screen
- Design tokens are semantic paths
- Navigation patterns valid
- Accessibility minimums met

### Client-side validation (**Recommended**)

Before rendering:

1. Verify `componentId` exists in local component registry (mirror of `CORE_UI_COMPONENT_IDS`)
2. Verify `designTokens` resolve in current mode theme
3. Verify `prototypeId` is known (optional warning)
4. Reject screens missing `accessibility.minimumTouchTargetPx >= 44`

### Form field validation

Input components carry validation hints in props:

```json
{
  "name": "location",
  "label": "Location",
  "value": "",
  "placeholder": "Enter service location",
  "required": true
}
```

Server validates on POST actions; client SHOULD validate `required` before submit — **Recommended**.

---

## 16. Dashboard Contract

**Classification:** **Implemented** (multiple patterns)

### Type A — Full Runtime Screen (MVP standard)

Executive/operator modules that need pixels SHOULD migrate to `AnActRuntimeScreenView`. Today partial:

- `runtime-executive` returns simplified `{ screenId, readOnly, sections[] }` without full layout block — **Implemented** (incomplete vs canonical)

### Type B — Semantic dashboard (data-first)

`GET /home`, `GET /runtime-executive` return structured data without component tree — **Implemented**.

Required fields for semantic dashboards:

```json
{
  "generated_at": "ISO-8601",
  "read_only": true,
  "summary": { },
  "quick_actions": [ ]
}
```

### Type C — Intelligence dashboard (CH4/CH5)

Read-only JSON with `schema_version`, `read_only: true`, domain-specific views — **Implemented**.

**v1.0 rule (**Recommended**):** Customer/provider MVP dashboards SHOULD use **Type A** (Need Home, Action Home, Profile Home). Operator tools MAY use Type B until migrated.

---

## 17. Form Contract

**Classification:** **Implemented**

Forms are composed of `core-ui-input` instances inside screen sections (not a separate form type).

### Request screen pattern (**Implemented**)

| Section id | Component | props.name |
|------------|-----------|------------|
| `location` | `core-ui-input` | `location` |
| `schedule` | `core-ui-input` | `schedule` |
| `notes` | `core-ui-input` | `notes` |
| `cost-summary` | `core-ui-card` | display only |
| `continue-action` | `core-ui-button` | `continue-request` |

Draft state lives in experience session (`request_draft`) — **Implemented**.

### Form submission

POST to experience action endpoints with partial field updates — **Implemented**. Client collects `props.name` → value map from input components.

---

## 18. Marketplace Contract

**Classification:** **Implemented** (discovery + intelligence; runtime embedding **Recommended**)

### Discovery API (`GET /discover/providers`) — **Implemented**

Returns ranked provider results (semantic, not screen tree):

```json
{
  "providers": [
    {
      "provider_id": "prv_001",
      "display_name": "Licensed Electrician Co.",
      "trust_score": 88,
      "trust_tier": "SAPPHIRE_VERIFIED",
      "trust_label": "Sapphire Verified",
      "rank_score": 0.92,
      "available_now": true,
      "average_rating": 4.9,
      "completed_contracts": 47
    }
  ],
  "summary": { },
  "generated_at": "2026-06-28T12:00:00.000Z"
}
```

### Marketplace intelligence (`GET /marketplace-intelligence/*`) — **Implemented**

Admin-only analytics views — not render-tree payloads.

### Runtime Need opportunities — **Implemented** (demo)

`GET /need-experience/opportunities` returns full `RuntimeScreenView` with static demo data.

**v1.0 (**Recommended**):** Wire opportunities to `DiscoveryService.searchProviders()` and map `trust_tier` → `ui_tier` for `core-ui-live-frame`.

### Marketplace domain model

`ProviderCard` in marketplace engine uses S3 frame tiers — separate from CH3 UI tiers. See Live Frame migration plan.

---

## 19. AI Response Contract

**Classification:** **Implemented** (CH5 foundation)

AI Experience modules return **read-only semantic JSON**, not full runtime screens.

### Foundation envelope (`GET /ai-experience`)

```json
{
  "schema_version": "ai-experience-foundation-v1",
  "headline": "AN ACT AI Experience Foundation",
  "read_only": true,
  "foundation_chain": ["intent", "canonical_action", "..."],
  "chapter_number": 5,
  "upstream_module": "CH4-C22",
  "scenarios": [],
  "generated_at": "2026-07-01T04:00:00.000Z"
}
```

### Context / domain screens

```json
{
  "schema_version": "ai-experience-foundation-v1",
  "output_id": "ai-exp-001",
  "shared_context": { },
  "foundation_confidence": { "level": "high", "score": 0.91 },
  "read_only": true
}
```

### Client rule

AI responses MUST NOT be rendered as pixel screens without an adapter layer that maps intelligence data into `RuntimeComponentInstance` trees — **Recommended**. CH5 modules are **delegates-only** — no business logic duplication.

---

## 20. Runtime Metadata

**Classification:** **Implemented**

### Per-response metadata

| Field | Location | Purpose |
|-------|----------|---------|
| `version` / `schema_version` | Envelope root | Module version |
| `generated_at` / `generatedAt` | Envelope + screen | Freshness |
| `runtime_experience` | Experience envelope | Marker boolean |
| `read_only` | Profile, executive, AI | Mutation guard |
| `runtime_executive` | Executive envelope | Module marker |
| Cross-version refs | Profile envelope | `need_experience_version`, etc. |

### Registry metadata (`GET /runtime-registry`) — **Implemented**

Exposes: experience id, version, mode, routes, dependencies, capabilities, validation status.

### Coordinator metadata (`GET /runtime-coordinator`) — **Implemented**

Delegation targets: need, action, contract, chat, timeline, notification, profile, runtime-journey, runtime-state, runtime-registry.

---

## 21. Versioning Strategy

**Classification:** **Implemented** (per-module); umbrella **Recommended**

### Module version strings (**Implemented**)

| Module | Version |
|--------|---------|
| Design system | `an-act-design-system-v1` |
| Core UI schema | `an-act-core-ui-v1` |
| Navigation framework | `an-act-navigation-framework-v1` |
| Need experience | `an-act-need-experience-v1` |
| Action experience | `an-act-action-experience-v1` |
| Profile experience | `an-act-profile-experience-v1` |
| Runtime state | `an-act-runtime-state-v1` |
| AI foundation | `ai-experience-foundation-v1` |

### Umbrella contract version (**Recommended**)

```json
{ "schema_version": "an-act-runtime-json-v1" }
```

Clients SHOULD accept any module version they declare support for in a compatibility matrix.

### Version negotiation

1. Client sends `Accept-Version: an-act-runtime-json-v1` header — **Concept only**
2. Server includes `schema_version` in envelope — **Recommended**
3. Breaking changes increment major module version (`v1` → `v2`)

---

## 22. Extension Rules

**Classification:** **Recommended**

1. **New components:** Register in `CORE_UI_COMPONENT_REGISTRY` before use in JSON
2. **New screens:** Add to module screen enum, prototype map, route map, validator allow-list
3. **New props:** Document in component definition; unknown props MUST be ignored by clients (forward compatible)
4. **New sections:** Free-form `id` + `label` + `purpose`; no central registry required
5. **Custom experiences:** Register in runtime registry (CH3-X14) before exposing routes
6. **No HTML/CSS fields** in Runtime JSON extensions
7. **Intelligence extensions** use separate `schema_version` namespace (CH4/CH5)

---

## 23. Backward Compatibility Policy

**Classification:** **Recommended**

| Change type | Policy |
|-------------|--------|
| Add optional field | Allowed in minor version |
| Add new component id | Allowed; old clients ignore unknown components with warning |
| Add new screen id | Allowed; old clients 404 gracefully |
| Rename component id | Major version bump + 6-month alias |
| Change token path semantics | Design system major bump |
| Remove field | Major version bump; deprecate for 1 release |
| Change trust tier mapping | Live Frame v1.0 migration plan |

Dual-write period: when consolidating Live Frame tiers, emit both legacy and v1.0 fields — per [Migration Plan](./AN-ACT-Live-Frame-Migration-Plan.md).

---

## 24. Bubble Consumption Strategy

**Classification:** **Documented** / **Recommended**

Bubble is **API prototype only** — executive modules explicitly flag `noBubbleIntegration: true` — **Implemented**.

### Bubble rules

1. Fetch Runtime Experience via API Connector (`GET /need-experience`)
2. Iterate `screen.sections[].components[]`
3. Map `core-ui-*` ids to Bubble reusable elements (manual mapping table)
4. Resolve colors via pre-synced token JSON (not dynamic token engine)
5. Use `ui_tier` only for Live Frame (not S5 enum names)
6. Do NOT hardcode HTML in Bubble workflows
7. Auth: store `access_token` in Bubble custom state; attach as Bearer header

### Limitations

- No native transition animation engine — approximate with Bubble animations
- Repeating groups for section components
- Forms: bind input `props.name` to Bubble input elements

---

## 25. React Consumption Strategy

**Classification:** **Recommended** (reference renderer **Concept only**)

Primary MVP path per Transition To MVP Plan.

### Architecture

```
GET /need-experience → RuntimeExperienceEnvelope
  → RuntimeScreenRenderer
    → ComponentRegistry["core-ui-card"] → <AnActCard {...props} />
    → ThemeProvider(mode) resolves designTokens
```

### Rules

1. **`@an-act/tokens`** — import `DESIGN_TOKENS`, `resolveSemanticColor(mode, path)`
2. **`RuntimeScreenRenderer`** — maps sections → layout regions
3. **Component registry** — one React component per `core-ui-*` id (start with 5 P0 components)
4. **Navigation** — read `navigation.nextRoute` + POST actions for mutations
5. **Auth** — `Authorization: Bearer` via context; refresh via `/auth/refresh`
6. **Reduced motion** — pass `reduced_motion=true` query param; honor `accessibility.reducedMotion`
7. **Do not** extend legacy `src/ui/pages/` for MVP

Target: React + React Native shared component library — **Recommended**.

---

## 26. Flutter Consumption Strategy

**Classification:** **Recommended**

1. Parse JSON into Dart models mirroring `AnActRuntimeScreenView`
2. `ComponentRegistry` maps `componentId` → Flutter `Widget` builder
3. `ThemeExtension` resolves semantic tokens from bundled `design_tokens.json`
4. Use `ListView` per section; `Semantics` from `accessibility.label`
5. Navigation: `go_router` routes match `screen.route`
6. Platform channels for auth token storage

Deferred post-MVP unless Flutter is primary — per Transition To MVP Plan P2.

---

## 27. SwiftUI Consumption Strategy

**Classification:** **Recommended**

1. Codable structs matching canonical schema
2. `@ViewBuilder` registry: `componentId` → SwiftUI view
3. `AnActTheme` environment object with mode (`need`/`action`)
4. `NavigationStack` driven by `navigation.stack`
5. Keychain for tokens; `URLSession` with Bearer interceptor
6. SF Symbols map to `ICON_NAMES` where possible

iOS-first native path — deferred unless chosen over React Native.

---

## Appendix A — Canonical JSON Schema (Recommended)

**Classification:** **Concept only** — not yet published as `schemas/an-act-runtime-json-v1.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://an-act.dev/schemas/runtime-json-v1.json",
  "title": "AnActRuntimeScreenView",
  "type": "object",
  "required": [
    "screenId", "prototypeId", "route", "mode", "layoutId",
    "designTokens", "typography", "spacing", "regions",
    "sections", "navigation", "accessibility", "generatedAt"
  ],
  "properties": {
    "screenId": { "type": "string" },
    "prototypeId": { "type": "string", "pattern": "^prototype-" },
    "route": { "type": "string" },
    "mode": { "enum": ["need", "action", "transition"] },
    "layoutId": { "type": "string" },
    "designTokens": { "type": "array", "items": { "type": "string" } },
    "typography": {
      "type": "object",
      "required": ["header", "body"],
      "properties": {
        "header": { "type": "string" },
        "body": { "type": "string" }
      }
    },
    "spacing": {
      "type": "object",
      "required": ["contentPaddingX", "contentPaddingY", "gap"],
      "properties": {
        "contentPaddingX": { "type": "string" },
        "contentPaddingY": { "type": "string" },
        "gap": { "type": "string" }
      }
    },
    "regions": { "type": "array", "items": { "type": "string" } },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "label", "purpose", "components"],
        "properties": {
          "id": { "type": "string" },
          "label": { "type": "string" },
          "purpose": { "type": "string" },
          "components": {
            "type": "array",
            "items": { "$ref": "#/$defs/RuntimeComponentInstance" }
          }
        }
      }
    },
    "navigation": { "type": "object" },
    "accessibility": { "type": "object" },
    "generatedAt": { "type": "string", "format": "date-time" }
  },
  "$defs": {
    "RuntimeComponentInstance": {
      "type": "object",
      "required": ["id", "componentId", "props"],
      "properties": {
        "id": { "type": "string" },
        "componentId": { "type": "string", "pattern": "^core-ui-" },
        "variant": { "type": "string" },
        "props": { "type": "object" },
        "accessibility": {
          "type": "object",
          "properties": {
            "label": { "type": "string" },
            "role": { "type": "string" },
            "tabIndex": { "type": "integer" },
            "describedBy": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

## Appendix B — Primary API Route Catalog

**Classification:** **Implemented**

| Route | Returns |
|-------|---------|
| `GET /need-experience` | Full Need experience envelope |
| `GET /need-experience/home` | Need home screen |
| `GET /need-experience/opportunities` | Opportunity list screen |
| `GET /action-experience` | Full Action experience envelope |
| `GET /contract-experience` | Full Contract experience envelope |
| `GET /profile-experience` | Full Profile experience envelope |
| `GET /runtime-journey` | Journey orchestration view |
| `GET /runtime-registry` | Experience catalog |
| `GET /home` | Platform home semantic view |
| `GET /live-frame` | Live Frame trust semantic view |
| `GET /discover/providers` | Marketplace discovery |
| `GET /ai-experience` | AI foundation home |
| `GET /runtime-executive` | Executive dashboard |
| `POST /auth/login` | Auth tokens |

---

## Final Recommendation

**Can this contract become the official Runtime JSON standard for all AN ACT frontends?**

**Yes — effective immediately for documentation and Render Layer design.**

- **Implemented:** CH3 runtime screen shape, component registry, token model, experience APIs, auth, errors, transitions, empty states
- **Recommended:** Umbrella `an-act-runtime-json-v1` schema, `@an-act/tokens` export, discovery wiring, unified Live Frame props, executive dashboard migration to full screen contract
- **Concept only:** Published JSON Schema file, client reference renderers, version negotiation header

All new frontend work (React, Flutter, SwiftUI, Bubble) MUST treat this document as the consumption contract. See [Runtime JSON Examples](./AN-ACT-Runtime-JSON-Examples.md) for complete payloads.

---

*Runtime JSON Contract v1.0 — documentation only; no source code modified.*

*Related: [Product Bible §30](./AN-ACT-Product-Bible.md) · [Live Frame v1.0](./AN-ACT-Live-Frame-v1.0-Specification.md) · [Transition To MVP Plan](./AN-ACT-Transition-To-MVP-Plan.md)*
