import type { Queryable } from "../../shared/db/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import type { UserActivitySnapshot } from "../domain/home-experience.js";

export class HomeExperienceRepository {
  constructor(private readonly identityRepo: IdentityRepository = identityRepository) {}

  async getUserActivitySnapshot(client: Queryable, userId: string): Promise<UserActivitySnapshot> {
    const [customer, provider, counts] = await Promise.all([
      this.identityRepo.findCustomerByUserId(client, userId),
      this.identityRepo.findProviderByUserId(client, userId),
      this.loadActivityCounts(client, userId),
    ]);

    return {
      userId,
      hasCustomerProfile: customer !== null,
      hasProviderProfile: provider !== null,
      customerRequestCount: counts.customerRequestCount,
      customerOfferCount: counts.customerOfferCount,
      customerContractCount: counts.customerContractCount,
      providerOfferCount: counts.providerOfferCount,
      providerContractCount: counts.providerContractCount,
    };
  }

  private async loadActivityCounts(client: Queryable, userId: string) {
    const result = await client.query<{
      customer_request_count: string;
      customer_offer_count: string;
      customer_contract_count: string;
      provider_offer_count: string;
      provider_contract_count: string;
    }>(
      `
        SELECT
          (
            SELECT COUNT(*)::text
            FROM experience.customer_requests
            WHERE customer_user_id = $1
          ) AS customer_request_count,
          (
            SELECT COUNT(*)::text
            FROM experience.match_contract_offers
            WHERE customer_user_id = $1
          ) AS customer_offer_count,
          (
            SELECT COUNT(*)::text
            FROM contract.contracts c
            INNER JOIN contract.contract_parties cp
              ON cp.contract_id = c.id
             AND cp.user_id = $1
             AND cp.party_role = 'customer'
          ) AS customer_contract_count,
          (
            SELECT COUNT(*)::text
            FROM experience.match_contract_offers
            WHERE provider_user_id = $1
          ) AS provider_offer_count,
          (
            SELECT COUNT(*)::text
            FROM contract.contracts c
            INNER JOIN contract.contract_parties cp
              ON cp.contract_id = c.id
             AND cp.user_id = $1
             AND cp.party_role = 'provider'
          ) AS provider_contract_count
      `,
      [userId]
    );

    const row = result.rows[0];
    return {
      customerRequestCount: Number(row.customer_request_count),
      customerOfferCount: Number(row.customer_offer_count),
      customerContractCount: Number(row.customer_contract_count),
      providerOfferCount: Number(row.provider_offer_count),
      providerContractCount: Number(row.provider_contract_count),
    };
  }
}

export const homeExperienceRepository = new HomeExperienceRepository();
