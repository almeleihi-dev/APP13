# CH5-X2 — AN ACT AI Conversation Experience

Read-only AI Conversation Experience for Chapter 5, consuming CH5-X1 AI Experience Foundation.

## Chain

```
Intent → ... → AI Experience Foundation → AI Conversation Experience
```

## Module

- Path: `src/ai-conversation-experience/`
- Factory: `createAiConversationExperienceModule()`
- Bootstrap key: `aiConversationExperience`
- Service: `AiConversationExperienceService`

## Delegation Model

| Upstream | Role |
|----------|------|
| **CH5-X1** | Sole upstream — `AiExperienceFoundationService.buildOutputForValidation()` |

## Conversation Views

| View | Route |
|------|-------|
| Conversation Home | `/ai-conversation-experience` |
| Conversation Context | `/ai-conversation-experience/context` |
| Conversation Thread | `/ai-conversation-experience/thread` |
| Conversation Messages | `/ai-conversation-experience/messages` |
| Conversation Status | `/ai-conversation-experience/status` |
| Conversation Readiness | `/ai-conversation-experience/readiness` |
| Delegation | `/ai-conversation-experience/delegation` |
| Human-Readable Explanation | `/ai-conversation-experience/explanation` |
| Compact Summary | `/ai-conversation-experience/summary` |
| Validate | `/ai-conversation-experience/validate` |

## Verification

```bash
npm run verify:ch5-x2
```

## Guarantees

- Read-only — no mutations, writes, runtime execution, payment, trust, contract, or execution changes
- Delegates-only — X1 sole upstream, no duplicated business logic
- Deterministic — fixed timestamp `2026-07-01T05:00:00.000Z`, stable builders, 4 messages per thread
- Explainable — conversation narratives traceable through X1 foundation to C22 closure
- Import-lint compliant
