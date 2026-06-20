import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  platformRolesForUser,
  isEmailVerified,
  requireEmailVerifiedForActionCreate,
  TierGateError,
  type User,
} from "../src/identity/domain/index.js";

const baseUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  phone: null,
  passwordHash: "hash",
  role: "customer",
  status: "active",
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  verificationTier: "T0",
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("Identity domain", () => {
  it("maps customer role to platform roles", () => {
    assert.deepEqual(platformRolesForUser(baseUser), ["customer"]);
  });

  it("maps provider role", () => {
    assert.deepEqual(platformRolesForUser({ ...baseUser, role: "provider" }), [
      "provider",
    ]);
  });

  it("blocks action create without verified email", () => {
    assert.throws(
      () => requireEmailVerifiedForActionCreate(baseUser),
      (e) => e instanceof TierGateError
    );
  });

  it("allows action create with verified email", () => {
    assert.doesNotThrow(() =>
      requireEmailVerifiedForActionCreate({
        ...baseUser,
        emailVerifiedAt: new Date(),
      })
    );
  });

  it("detects email verified", () => {
    assert.equal(isEmailVerified(baseUser), false);
    assert.equal(
      isEmailVerified({ ...baseUser, emailVerifiedAt: new Date() }),
      true
    );
  });
});

describe("Password hasher", () => {
  it("hashes and verifies password", async () => {
    const { hashPassword, verifyPassword } = await import(
      "../src/identity/infrastructure/password-hasher.js"
    );
    const hash = await hashPassword("securepassword123");
    assert.equal(await verifyPassword("securepassword123", hash), true);
    assert.equal(await verifyPassword("wrongpassword12", hash), false);
  });
});
