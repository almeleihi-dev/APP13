import type { Queryable } from "../../shared/db/index.js";
import type {
  AccountStatus,
  CustomerProfile,
  PrimaryUserRole,
  ProviderProfile,
  User,
  VerificationTier,
} from "../domain/user.js";

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    phone: (row.phone as string | null) ?? null,
    passwordHash: (row.password_hash as string | null) ?? null,
    role: row.role as PrimaryUserRole,
    status: row.status as AccountStatus,
    emailVerifiedAt: row.email_verified_at as Date | null,
    phoneVerifiedAt: row.phone_verified_at as Date | null,
    verificationTier: row.verification_tier as VerificationTier,
    lastLoginAt: row.last_login_at as Date | null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    deletedAt: row.deleted_at as Date | null,
  };
}

function mapCustomer(row: Record<string, unknown>): CustomerProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    displayName: row.display_name as string,
    legalName: (row.legal_name as string | null) ?? null,
    avatarStorageKey: (row.avatar_storage_key as string | null) ?? null,
    companyId: (row.company_id as string | null) ?? null,
    defaultLocation: (row.default_location as Record<string, unknown> | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

function mapProvider(row: Record<string, unknown>): ProviderProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    displayName: row.display_name as string,
    businessName: (row.business_name as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    primaryTrade: (row.primary_trade as string | null) ?? null,
    slug: (row.slug as string | null) ?? null,
    status: row.status as ProviderProfile["status"],
    avatarStorageKey: (row.avatar_storage_key as string | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export class IdentityRepository {
  async findUserByEmail(db: Queryable, email: string): Promise<User | null> {
    const result = await db.query(
      `SELECT * FROM identity.users WHERE lower(email) = lower($1) AND deleted_at IS NULL`,
      [email]
    );
    if (result.rowCount === 0) return null;
    return mapUser(result.rows[0]);
  }

  async findUserById(db: Queryable, id: string): Promise<User | null> {
    const result = await db.query(
      `SELECT * FROM identity.users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapUser(result.rows[0]);
  }

  async createUser(
    db: Queryable,
    input: {
      email: string;
      passwordHash: string;
      role: PrimaryUserRole;
      phone?: string;
    }
  ): Promise<User> {
    const result = await db.query(
      `
        INSERT INTO identity.users (email, password_hash, role, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [input.email.toLowerCase(), input.passwordHash, input.role, input.phone ?? null]
    );
    return mapUser(result.rows[0]);
  }

  async updateLastLogin(db: Queryable, userId: string): Promise<void> {
    await db.query(
      `UPDATE identity.users SET last_login_at = now() WHERE id = $1`,
      [userId]
    );
  }

  async setEmailVerified(db: Queryable, userId: string): Promise<User> {
    const result = await db.query(
      `
        UPDATE identity.users
        SET email_verified_at = COALESCE(email_verified_at, now())
        WHERE id = $1
        RETURNING *
      `,
      [userId]
    );
    return mapUser(result.rows[0]);
  }

  async setPhoneVerified(db: Queryable, userId: string, phone: string): Promise<User> {
    const result = await db.query(
      `
        UPDATE identity.users
        SET phone = $2, phone_verified_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [userId, phone]
    );
    return mapUser(result.rows[0]);
  }

  async updatePasswordHash(
    db: Queryable,
    userId: string,
    passwordHash: string
  ): Promise<void> {
    await db.query(
      `UPDATE identity.users SET password_hash = $2 WHERE id = $1`,
      [userId, passwordHash]
    );
  }

  async setVerificationTier(
    db: Queryable,
    userId: string,
    tier: VerificationTier
  ): Promise<User> {
    const result = await db.query(
      `
        UPDATE identity.users SET verification_tier = $2 WHERE id = $1 RETURNING *
      `,
      [userId, tier]
    );
    return mapUser(result.rows[0]);
  }

  async createCustomer(
    db: Queryable,
    input: { userId: string; displayName: string; legalName?: string }
  ): Promise<CustomerProfile> {
    const result = await db.query(
      `
        INSERT INTO identity.customers (user_id, display_name, legal_name)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [input.userId, input.displayName, input.legalName ?? null]
    );
    return mapCustomer(result.rows[0]);
  }

  async createProvider(
    db: Queryable,
    input: {
      userId: string;
      displayName: string;
      businessName: string;
      primaryTrade: string;
      slug: string;
    }
  ): Promise<ProviderProfile> {
    const result = await db.query(
      `
        INSERT INTO identity.providers (
          user_id, display_name, business_name, primary_trade, slug, status
        )
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING *
      `,
      [
        input.userId,
        input.displayName,
        input.businessName,
        input.primaryTrade,
        input.slug,
      ]
    );
    return mapProvider(result.rows[0]);
  }

  async findCustomerByUserId(
    db: Queryable,
    userId: string
  ): Promise<CustomerProfile | null> {
    const result = await db.query(
      `SELECT * FROM identity.customers WHERE user_id = $1`,
      [userId]
    );
    if (result.rowCount === 0) return null;
    return mapCustomer(result.rows[0]);
  }

  async findProviderByUserId(
    db: Queryable,
    userId: string
  ): Promise<ProviderProfile | null> {
    const result = await db.query(
      `SELECT * FROM identity.providers WHERE user_id = $1`,
      [userId]
    );
    if (result.rowCount === 0) return null;
    return mapProvider(result.rows[0]);
  }

  async findCustomerById(
    db: Queryable,
    customerId: string
  ): Promise<CustomerProfile | null> {
    const result = await db.query(
      `SELECT * FROM identity.customers WHERE id = $1`,
      [customerId]
    );
    if (result.rowCount === 0) return null;
    return mapCustomer(result.rows[0]);
  }

  async findProviderById(
    db: Queryable,
    providerId: string
  ): Promise<ProviderProfile | null> {
    const result = await db.query(
      `SELECT * FROM identity.providers WHERE id = $1`,
      [providerId]
    );
    if (result.rowCount === 0) return null;
    return mapProvider(result.rows[0]);
  }

  async updateCustomerDisplayName(
    db: Queryable,
    customerId: string,
    displayName: string
  ): Promise<CustomerProfile> {
    const result = await db.query(
      `
        UPDATE identity.customers SET display_name = $2 WHERE id = $1 RETURNING *
      `,
      [customerId, displayName]
    );
    return mapCustomer(result.rows[0]);
  }

  async updateProviderProfile(
    db: Queryable,
    providerId: string,
    input: { displayName?: string; bio?: string; businessName?: string }
  ): Promise<ProviderProfile> {
    const result = await db.query(
      `
        UPDATE identity.providers
        SET display_name = COALESCE($2, display_name),
            bio = COALESCE($3, bio),
            business_name = COALESCE($4, business_name)
        WHERE id = $1
        RETURNING *
      `,
      [providerId, input.displayName ?? null, input.bio ?? null, input.businessName ?? null]
    );
    return mapProvider(result.rows[0]);
  }
}

export const identityRepository = new IdentityRepository();
