import type { Queryable } from "../../shared/db/index.js";

export interface DiscoverableProviderRecord {
  providerId: string;
  providerUserId: string;
  displayName: string;
  actionCodes: string[];
  trustScore: number;
  availableNow: boolean;
  activeContracts: number;
  distanceKm: number;
  priceEstimate: number;
  completedContractsForAction: number;
  completedContracts: number;
  averageRating: number;
}

export interface DiscoverableActionRecord {
  actionCode: string;
  providerCount: number;
}

export interface DiscoverableRequestRecord {
  id: string;
  requestText: string;
  status: string;
  budgetMinor: number | null;
  preferredDays: number | null;
}

export class DiscoveryRepository {
  async listDiscoverableProviders(client: Queryable): Promise<DiscoverableProviderRecord[]> {
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
        activeContracts,
        distanceKm: 10,
        priceEstimate: 1000,
        completedContractsForAction: Math.max(
          0,
          Math.floor(completedContracts / Math.max(actionCodes.length, 1))
        ),
        completedContracts,
        averageRating: 4,
      };
    });
  }

  async listPublishedActionCounts(client: Queryable): Promise<DiscoverableActionRecord[]> {
    const result = await client.query<{
      action_code: string;
      provider_count: string;
    }>(
      `
        SELECT
          a.action_code,
          COUNT(DISTINCT a.provider_id) AS provider_count
        FROM action.actions a
        INNER JOIN identity.providers p
          ON p.id = a.provider_id
         AND p.status = 'active'
        WHERE a.status NOT IN ('draft', 'cancelled')
        GROUP BY a.action_code
        ORDER BY a.action_code ASC
      `
    );

    return result.rows.map((row) => ({
      actionCode: row.action_code,
      providerCount: Number(row.provider_count ?? 0),
    }));
  }

  async listDiscoverableRequests(client: Queryable): Promise<DiscoverableRequestRecord[]> {
    const result = await client.query<{
      id: string;
      request_text: string;
      status: string;
      budget_minor: number | null;
      preferred_days: number | null;
    }>(
      `
        SELECT
          id,
          request_text,
          status,
          budget_minor,
          preferred_days
        FROM experience.customer_requests
        WHERE status IN ('open', 'matched')
        ORDER BY created_at DESC
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      requestText: row.request_text,
      status: row.status,
      budgetMinor: row.budget_minor,
      preferredDays: row.preferred_days,
    }));
  }
}

export const discoveryRepository = new DiscoveryRepository();
