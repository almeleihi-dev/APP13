import type { DbClient, Queryable } from "../../shared/db/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import type { CustomerRequest } from "../domain/request.js";

interface CustomerRequestRow {
  id: string;
  customer_user_id: string;
  customer_id: string;
  request_text: string;
  budget_minor: number | null;
  preferred_days: number | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface MatchableProviderRecord {
  providerId: string;
  providerUserId: string;
  displayName: string;
  actionCodes: string[];
  trustScore: number;
  availableNow: boolean;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
  completedContracts: number;
  averageRating: number;
}

function mapCustomerRequest(row: CustomerRequestRow): CustomerRequest {
  return {
    id: row.id,
    customerUserId: row.customer_user_id,
    customerId: row.customer_id,
    requestText: row.request_text,
    budget: row.budget_minor,
    preferredDays: row.preferred_days,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class RequestRepository {
  constructor(private readonly identityRepo: IdentityRepository = identityRepository) {}

  async createRequest(
    client: Queryable,
    input: {
      customerUserId: string;
      customerId: string;
      requestText: string;
      budget?: number | null;
      preferredDays?: number | null;
    }
  ): Promise<CustomerRequest> {
    const result = await client.query<CustomerRequestRow>(
      `
        INSERT INTO experience.customer_requests (
          customer_user_id,
          customer_id,
          request_text,
          budget_minor,
          preferred_days
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        input.customerUserId,
        input.customerId,
        input.requestText.trim(),
        input.budget ?? null,
        input.preferredDays ?? null,
      ]
    );

    return mapCustomerRequest(result.rows[0]);
  }

  async findById(client: Queryable, requestId: string): Promise<CustomerRequest | null> {
    const result = await client.query<CustomerRequestRow>(
      `
        SELECT *
        FROM experience.customer_requests
        WHERE id = $1
      `,
      [requestId]
    );

    return result.rows[0] ? mapCustomerRequest(result.rows[0]) : null;
  }

  async findCustomerByUserId(client: Queryable, userId: string) {
    return this.identityRepo.findCustomerByUserId(client, userId);
  }

  async listMatchableProviders(client: Queryable): Promise<MatchableProviderRecord[]> {
    const result = await client.query<{
      provider_id: string;
      provider_user_id: string;
      display_name: string;
      action_codes: string[] | null;
      trust_score: number | null;
      active_contracts: string;
      completed_contracts: string;
    }>(
      `
        SELECT
          p.id AS provider_id,
          p.user_id AS provider_user_id,
          p.display_name,
          COALESCE(
            ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.action_code), NULL),
            ARRAY[]::text[]
          ) AS action_codes,
          ts.score AS trust_score,
          COUNT(DISTINCT c.id) FILTER (
            WHERE c.status IN ('accepted', 'active', 'proposed')
          ) AS active_contracts,
          COUNT(DISTINCT c.id) FILTER (
            WHERE c.status = 'completed'
          ) AS completed_contracts
        FROM identity.providers p
        LEFT JOIN action.actions a
          ON a.provider_id = p.id
         AND a.status NOT IN ('draft', 'cancelled')
        LEFT JOIN contract.contracts c
          ON c.provider_id = p.id
        LEFT JOIN trust.trust_scores ts
          ON ts.provider_id = p.id
        WHERE p.status = 'active'
        GROUP BY p.id, p.user_id, p.display_name, ts.score
        ORDER BY p.display_name ASC
      `
    );

    return result.rows.map((row) => {
      const activeContracts = Number(row.active_contracts ?? 0);
      const completedContracts = Number(row.completed_contracts ?? 0);
      const actionCodes = row.action_codes ?? [];

      return {
        providerId: row.provider_id,
        providerUserId: row.provider_user_id,
        displayName: row.display_name,
        actionCodes,
        trustScore: row.trust_score ?? 0,
        availableNow: activeContracts < 5,
        distanceKm: 10,
        priceEstimate: 1000,
        completedContractsForAction: Math.max(0, Math.floor(completedContracts / Math.max(actionCodes.length, 1))),
        completedContracts,
        averageRating: 4,
      };
    });
  }
}

export const requestRepository = new RequestRepository();

export type RequestRepositoryClient = DbClient;
