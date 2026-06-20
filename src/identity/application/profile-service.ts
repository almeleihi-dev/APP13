import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import { platformRolesForUser } from "../domain/index.js";
import { IdentityRepository } from "../infrastructure/index.js";

export class ProfileService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository
  ) {}

  async getMe(userId: string) {
    return this.getMeWithDisplayName(userId);
  }

  async getMeWithDisplayName(userId: string) {
    const user = await this.identityRepo.findUserById(this.db.pool, userId);
    if (!user) throw notFound();
    const customer = await this.identityRepo.findCustomerByUserId(this.db.pool, userId);
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, userId);
    return {
      user_id: user.id,
      email: user.email,
      status: user.status,
      tier: user.verificationTier,
      roles: platformRolesForUser(user),
      customer_id: customer?.id ?? null,
      provider_id: provider?.id ?? null,
      display_name: customer?.displayName ?? provider?.displayName ?? user.email,
    };
  }

  async getCustomer(customerId: string, requesterUserId: string) {
    const customer = await this.identityRepo.findCustomerById(this.db.pool, customerId);
    if (!customer) throw notFound();
    if (customer.userId !== requesterUserId) {
      throw new AppError(
        problem({
          title: "Not Found",
          status: 404,
          code: ErrorCodes.NOT_FOUND,
          engine: "identity",
          detail: "Customer not found",
        })
      );
    }
    return {
      id: customer.id,
      display_name: customer.displayName,
      legal_name: customer.legalName,
      avatar_storage_key: customer.avatarStorageKey,
    };
  }

  async getProvider(providerId: string) {
    const provider = await this.identityRepo.findProviderById(this.db.pool, providerId);
    if (!provider) throw notFound();
    return {
      id: provider.id,
      display_name: provider.displayName,
      business_name: provider.businessName,
      bio: provider.bio,
      primary_trade: provider.primaryTrade,
      slug: provider.slug,
      status: provider.status,
    };
  }

  async updateMe(
    userId: string,
    input: { display_preferences?: Record<string, unknown> }
  ) {
    void input;
    return this.getMeWithDisplayName(userId);
  }

  async updateCustomer(
    customerId: string,
    requesterUserId: string,
    input: { display_preferences?: Record<string, unknown> }
  ) {
    const customer = await this.identityRepo.findCustomerById(this.db.pool, customerId);
    if (!customer || customer.userId !== requesterUserId) {
      throw notFound();
    }
    const displayName =
      typeof input.display_preferences?.display_name === "string"
        ? input.display_preferences.display_name
        : customer.displayName;
    await this.identityRepo.updateCustomerDisplayName(
      this.db.pool,
      customerId,
      displayName
    );
    return {};
  }

  async updateProvider(
    providerId: string,
    requesterUserId: string,
    input: {
      display_name?: string;
      bio?: string;
      business_name?: string;
    }
  ) {
    const provider = await this.identityRepo.findProviderById(this.db.pool, providerId);
    if (!provider || provider.userId !== requesterUserId) {
      throw notFound();
    }
    await this.identityRepo.updateProviderProfile(this.db.pool, providerId, {
      displayName: input.display_name,
      bio: input.bio,
      businessName: input.business_name,
    });
    return {};
  }
}

export function createProfileService(
  db: DbPool,
  identityRepo: IdentityRepository
): ProfileService {
  return new ProfileService(db, identityRepo);
}
