import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { requireOwnership } from "../src/security/guards.js";
import {
  ContractOwnershipChecker,
  OwnershipRegistry,
} from "../src/security/ownership-registry.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { OwnershipChecker, OwnershipDecision, OwnershipResource } from "../src/security/types.js";
import { AppError } from "../src/shared/errors/index.js";

const customerContext: AuthContext = {
  userId: "11111111-1111-4111-8111-111111111111",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "session-customer",
};

const otherUserContext: AuthContext = {
  userId: "99999999-9999-4999-8999-999999999999",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "session-other",
};

const contractId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

class StubContractOwnershipChecker implements OwnershipChecker {
  constructor(private readonly allowedUserIds: Set<string>) {}

  async check(ctx: AuthContext, resource: OwnershipResource): Promise<OwnershipDecision> {
    if (resource.entityType !== "contract") {
      return { allowed: false, reason: "Unsupported entity type" };
    }
    if (this.allowedUserIds.has(ctx.userId)) {
      return { allowed: true };
    }
    return { allowed: false, reason: "Contract not found" };
  }
}

describe("B8 ownership protection", () => {
  it("allows customer access to own contract", async () => {
    const checker = new StubContractOwnershipChecker(new Set([customerContext.userId]));
    await assert.doesNotReject(() =>
      requireOwnership(
        customerContext,
        { entityType: "contract", entityId: contractId },
        checker
      )
    );
  });

  it("allows provider access to assigned contract", async () => {
    const providerContext: AuthContext = {
      ...customerContext,
      userId: "22222222-2222-4222-8222-222222222222",
      roles: ["provider"],
    };
    const checker = new StubContractOwnershipChecker(new Set([providerContext.userId]));
    await assert.doesNotReject(() =>
      requireOwnership(
        providerContext,
        { entityType: "contract", entityId: contractId },
        checker
      )
    );
  });

  it("denies access to resources belonging to others", async () => {
    const checker = new StubContractOwnershipChecker(new Set([customerContext.userId]));
    await assert.rejects(
      () =>
        requireOwnership(
          otherUserContext,
          { entityType: "contract", entityId: contractId },
          checker
        ),
      (error: unknown) => error instanceof AppError && (error as AppError).problem.status === 404
    );
  });

  it("ownership registry resolves contract checker", async () => {
    const registry = new OwnershipRegistry();
    registry.register(
      "contract",
      new StubContractOwnershipChecker(new Set([customerContext.userId]))
    );
    const checker = registry.get("contract");
    assert.ok(checker);
    const decision = await checker!.check(customerContext, {
      entityType: "contract",
      entityId: contractId,
    });
    assert.equal(decision.allowed, true);
  });

  it("ContractOwnershipChecker delegates to contract parties without business rules", async () => {
    const checker = new ContractOwnershipChecker({
      pool: {
        query: async () => ({
          rows: [{ user_id: customerContext.userId }],
          rowCount: 1,
        }),
      },
    } as never);

    const allowed = await checker.check(customerContext, {
      entityType: "contract",
      entityId: contractId,
    });
    assert.equal(allowed.allowed, true);

    const denied = await checker.check(otherUserContext, {
      entityType: "contract",
      entityId: contractId,
    });
    assert.equal(denied.allowed, false);
  });
});
