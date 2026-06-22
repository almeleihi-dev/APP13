# S12 Notification & Event Inbox

**Date:** 2026-06-19  
**Scope:** Unified read/write event inbox for customers, providers, and administrators (S12)  
**Status:** Complete

## Summary

S12 provides a user-scoped notification inbox derived from platform lifecycle events. Events are recorded transaction-safely with deterministic idempotency keys, exposed through REST APIs for listing, unread summaries, and read/unread state management. No email, SMS, or push delivery is included.

## Architecture

```
Lifecycle engines (conversion, escrow, execution, complaint, trust)
  → thin observeInbox* hooks after successful transitions
  → EventInboxService.recordEvent / recordForParties (same transaction)
  → experience.event_inbox (idempotent INSERT)
  → GET/POST /notifications APIs (user-scoped)
```

## Deliverables

| Deliverable | Path |
|---|---|
| Event inbox domain | `src/notifications/domain/event-inbox.ts` |
| Event inbox service | `src/notifications/application/event-inbox-service.ts` |
| Event inbox repository | `src/notifications/infrastructure/event-inbox-repository.ts` |
| Module factory | `createNotificationsModule(db)` |
| Routes | `src/api/routes/notifications.ts` |
| Migration | `database/migrations/020_event_inbox.sql` |
| Tests | `test/s12-event-inbox.test.ts` |
| Verify script | `scripts/verify-s12.sh` |

## Domain Models

| Model | Purpose |
|---|---|
| `InboxEvent` | User-scoped notification row |
| `InboxEventType` | Lifecycle event vocabulary |
| `InboxEventPriority` | `low`, `normal`, `high`, `critical` |
| `InboxEventStatus` | `unread`, `read` |
| `InboxSummary` | Counts by category and priority |
| `UnreadSummary` | Unread totals and recent items |

## Lifecycle Integrations

| Inbox event | Source hook |
|---|---|
| `offer_created` | Match-to-contract conversion offer creation |
| `contract_created` | Conversion offer acceptance |
| `escrow_funded` | Escrow `markFunded` |
| `escrow_released` | Escrow release after acceptance |
| `milestone_submitted` | Execution milestone submit |
| `milestone_accepted` | Contract engine milestone accept |
| `evidence_uploaded` | Execution evidence confirmation |
| `issue_raised` | Complaint issue creation |
| `issue_resolved` | Contract issue resolve/withdraw |
| `trust_updated` | Trust score recompute |

Contract-party events notify both customer and provider users. Trust updates notify the provider user only.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List inbox events with summary |
| GET | `/notifications/unread` | Unread summary with recent items |
| GET | `/notifications/:id` | Single inbox event |
| POST | `/notifications/:id/read` | Mark one event read |
| POST | `/notifications/read-all` | Mark all events read |

All endpoints require authentication. Users may only access their own inbox (`authContext.userId`).

## Design Notes

- Deterministic idempotency keys: `inbox:{eventType}:{userId}:{sourceEntityId}`
- Transaction-safe recording inside existing engine transactions
- Thin observer hooks mirror the trust integration pattern
- No changes to contract, escrow, execution, trust, request, conversion, dashboard, or admin business rules
- No external notification channels in this slice

## Verification

```bash
npm run verify:s12
```
