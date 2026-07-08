import type { DbPool, Queryable } from "../../shared/db/index.js";
import type { VerificationTier } from "../../identity/domain/user.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";

export interface ProviderProfileContext {
  providerId: string;
  userId: string;
  displayName: string;
  businessName: string | null;
  bio: string | null;
  primaryTrade: string | null;
  slug: string | null;
  status: string;
  verificationTier: VerificationTier;
}

export interface PublishedProviderAction {
  actionCode: string;
  actionName: string;
}

export interface ProviderContractActivity {
  activeContracts: number;
  completedContracts: number;
}

export class ProviderProfileRepository {
  constructor(private readonly identityRepo: IdentityRepository = identityRepository) {}

  async findProviderContextByUserId(
    db: Queryable,
    userId: string
  ): Promise<ProviderProfileContext | null> {
    const provider = await this.identityRepo.findProviderByUserId(db, userId);
    if (!provider) return null;

    const user = await this.identityRepo.findUserById(db, provider.userId);
    if (!user) return null;

    return {
      providerId: provider.id,
      userId: provider.userId,
      displayName: provider.displayName,
      businessName: provider.businessName,
      bio: provider.bio,
      primaryTrade: provider.primaryTrade,
      slug: provider.slug,
      status: provider.status,
      verificationTier: user.verificationTier,
    };
  }

  async listPublishedActions(
    db: Queryable,
    providerId: string
  ): Promise<PublishedProviderAction[]> {
    const result = await db.query<{ action_code: string; action_name: string }>(
      `
        SELECT DISTINCT action_code, action_name
        FROM action.actions
        WHERE provider_id = $1
          AND status NOT IN ('draft', 'cancelled')
        ORDER BY action_code ASC
      `,
      [providerId]
    );

    return result.rows.map((row) => ({
      actionCode: row.action_code,
      actionName: row.action_name,
    }));
  }

  async getContractActivity(db: Queryable, providerId: string): Promise<ProviderContractActivity> {
    const result = await db.query<{ active_contracts: string; completed_contracts: string }>(
      `
        SELECT
          COUNT(*) FILTER (
            WHERE status IN ('accepted', 'active', 'proposed')
          ) AS active_contracts,
          COUNT(*) FILTER (
            WHERE status = 'completed'
          ) AS completed_contracts
        FROM contract.contracts
        WHERE provider_id = $1
      `,
      [providerId]
    );

    const row = result.rows[0];
    return {
      activeContracts: Number(row?.active_contracts ?? 0),
      completedContracts: Number(row?.completed_contracts ?? 0),
    };
  }
}

export const providerProfileRepository = new ProviderProfileRepository();

export type ProviderProfileRepositoryPool = DbPool;
