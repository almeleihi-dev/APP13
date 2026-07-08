import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerNotificationRoutes } from "../src/api/routes/notifications.js";
import {
  buildInboxSummary,
  buildPartyInboxEventInput,
  buildUnreadSummary,
  inboxIdempotencyKey,
  InboxEventCategories,
  InboxEventPriorities,
  InboxEventStatuses,
  InboxEventTypes,
} from "../src/notifications/domain/event-inbox.js";
import {
  createNotificationsModule,
  observeInboxOfferCreated,
} from "../src/notifications/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

async function seedS12Users(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s12@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-s12@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  return {
    customerUserId: customerUser.rows[0].id,
    providerUserId: providerUser.rows[0].id,
  };
}

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "s12-customer-session",
});

const PROVIDER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["provider"],
  tier: "T1",
  status: "active",
  sessionId: "s12-provider-session",
});

let db: DbPool | undefined;
let postgresReady = false;
let customerUserId: string | undefined;
let providerUserId: string | undefined;

describe("S12 Notification & Event Inbox", () => {
  describe("domain layer (unit)", () => {
    it("builds deterministic idempotency keys", () => {
      const key = inboxIdempotencyKey(
        InboxEventTypes.OFFER_CREATED,
        "user-1",
        "offer-1"
      );
      assert.equal(key, "inbox:offer_created:user-1:offer-1");
    });

    it("builds party inbox events with category and priority", () => {
      const event = buildPartyInboxEventInput({
        userId: "customer-1",
        role: "customer",
        eventType: InboxEventTypes.ISSUE_RAISED,
        sourceEntityType: "issue",
        sourceEntityId: "issue-1",
      });

      assert.equal(event.category, InboxEventCategories.ISSUE);
      assert.equal(event.priority, InboxEventPriorities.CRITICAL);
      assert.match(event.title, /Issue raised/);
    });

    it("builds inbox and unread summaries", () => {
      const events = [
        {
          id: "1",
          userId: "user-1",
          eventType: InboxEventTypes.OFFER_CREATED,
          category: InboxEventCategories.OFFER,
          priority: InboxEventPriorities.NORMAL,
          status: InboxEventStatuses.UNREAD,
          title: "Offer",
          body: "Body",
          sourceEntityType: "offer",
          sourceEntityId: "offer-1",
          metadata: {},
          idempotencyKey: "k1",
          readAt: null,
          createdAt: new Date(),
        },
        {
          id: "2",
          userId: "user-1",
          eventType: InboxEventTypes.ISSUE_RAISED,
          category: InboxEventCategories.ISSUE,
          priority: InboxEventPriorities.CRITICAL,
          status: InboxEventStatuses.READ,
          title: "Issue",
          body: "Body",
          sourceEntityType: "issue",
          sourceEntityId: "issue-1",
          metadata: {},
          idempotencyKey: "k2",
          readAt: new Date(),
          createdAt: new Date(),
        },
      ];

      const summary = buildInboxSummary(events);
      assert.equal(summary.totalCount, 2);
      assert.equal(summary.unreadCount, 1);
      assert.equal(summary.byCategory.offer, 1);
      assert.equal(summary.byPriority.critical, 1);

      const unread = buildUnreadSummary(events);
      assert.equal(unread.unreadCount, 1);
      assert.equal(unread.criticalCount, 0);
      assert.equal(unread.recentUnread.length, 1);
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.event_inbox`);
        await db.query(`DELETE FROM experience.match_contract_offers`);
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-s12@test.app13', 'provider-s12@test.app13')
          `
        );
        const users = await seedS12Users(db);
        customerUserId = users.customerUserId;
        providerUserId = users.providerUserId;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("records inbox events idempotently for both parties", async (t) => {
      if (!postgresReady || !db || !customerUserId || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { eventInbox } = createNotificationsModule(db);
      const offerId = "00000000-0000-4000-8000-0000000000a1";

      await db.withTransaction(async (tx) => {
        await observeInboxOfferCreated(eventInbox, tx, {
          offerId,
          customerUserId,
          providerUserId,
        });
        await observeInboxOfferCreated(eventInbox, tx, {
          offerId,
          customerUserId,
          providerUserId,
        });
      });

      const customerInbox = await eventInbox.listNotifications(CUSTOMER_AUTH(customerUserId));
      const providerInbox = await eventInbox.listNotifications(PROVIDER_AUTH(providerUserId));

      assert.equal(customerInbox.events.length, 1);
      assert.equal(providerInbox.events.length, 1);
      assert.equal(customerInbox.events[0].event_type, InboxEventTypes.OFFER_CREATED);
      assert.equal(customerInbox.summary.unread_count, 1);
      assert.notEqual(customerInbox.events[0].title, providerInbox.events[0].title);
    });

    it("marks notifications read individually and in bulk", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { eventInbox } = createNotificationsModule(db);
      const unreadBefore = await eventInbox.getUnreadSummary(CUSTOMER_AUTH(customerUserId));
      assert.ok(unreadBefore.unread_count >= 1);

      const eventId = unreadBefore.recent_unread[0].id;
      const readOne = await eventInbox.markNotificationRead(
        CUSTOMER_AUTH(customerUserId),
        eventId
      );
      assert.equal(readOne.status, InboxEventStatuses.READ);
      assert.ok(readOne.read_at);

      await db.withTransaction(async (tx) => {
        await observeInboxOfferCreated(eventInbox, tx, {
          offerId: "00000000-0000-4000-8000-0000000000b2",
          customerUserId: customerUserId!,
          providerUserId: providerUserId!,
        });
      });

      const readAll = await eventInbox.markAllNotificationsRead(
        CUSTOMER_AUTH(customerUserId)
      );
      assert.ok(readAll.updated_count >= 1);

      const unreadAfter = await eventInbox.getUnreadSummary(CUSTOMER_AUTH(customerUserId));
      assert.equal(unreadAfter.unread_count, 0);
    });

    it("rejects access to another user's notification", async (t) => {
      if (!postgresReady || !db || !customerUserId || !providerUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { eventInbox } = createNotificationsModule(db);
      const providerInbox = await eventInbox.listNotifications(PROVIDER_AUTH(providerUserId));
      const providerEventId = providerInbox.events[0]?.id;
      assert.ok(providerEventId);

      await assert.rejects(
        () => eventInbox.getNotification(CUSTOMER_AUTH(customerUserId), providerEventId),
        (error: unknown) => error instanceof AppError
      );
    });

    it("exposes notification routes", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { eventInbox } = createNotificationsModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = CUSTOMER_AUTH(customerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerNotificationRoutes(app, eventInbox);

      const listResponse = await app.inject({ method: "GET", url: "/notifications" });
      assert.equal(listResponse.statusCode, 200);
      const listBody = listResponse.json() as { events: unknown[]; summary: { total_count: number } };
      assert.ok(Array.isArray(listBody.events));
      assert.ok(listBody.summary.total_count >= 1);

      const unreadResponse = await app.inject({ method: "GET", url: "/notifications/unread" });
      assert.equal(unreadResponse.statusCode, 200);

      const eventId = listBody.events[0] ? (listBody.events[0] as { id: string }).id : null;
      assert.ok(eventId);

      const getResponse = await app.inject({
        method: "GET",
        url: `/notifications/${eventId}`,
      });
      assert.equal(getResponse.statusCode, 200);

      const readResponse = await app.inject({
        method: "POST",
        url: `/notifications/${eventId}/read`,
      });
      assert.equal(readResponse.statusCode, 200);

      const readAllResponse = await app.inject({
        method: "POST",
        url: "/notifications/read-all",
      });
      assert.equal(readAllResponse.statusCode, 200);

      await app.close();
    });
  });
});
