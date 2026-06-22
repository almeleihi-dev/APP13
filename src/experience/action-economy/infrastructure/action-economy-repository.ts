import type { Queryable } from "../../../shared/db/index.js";
import type { ActionStatus } from "../../../action/domain/action.js";
import { providerProfileRepository } from "../../../provider-experience/infrastructure/provider-profile-repository.js";
import { discoveryRepository } from "../../../discovery/infrastructure/discovery-repository.js";
import { providerDashboardRepository } from "../../../provider-workspace/infrastructure/provider-dashboard-repository.js";
import type {
  ActionEconomySnapshot,
  ActionPerformanceRecord,
  ProviderActionRecord,
} from "../domain/action-economy.js";

export class ActionEconomyRepository {
  async loadSnapshot(
    client: Queryable,
    providerUserId: string,
    trustScore: number | null
  ): Promise<ActionEconomySnapshot | null> {
    const context = await providerProfileRepository.findProviderContextByUserId(
      client,
      providerUserId
    );
    if (!context) return null;

    const [
      actions,
      performanceByActionCode,
      platformProviderCounts,
      openRequests,
      earnings,
      platformPublishedActions,
    ] = await Promise.all([
      this.listProviderActions(client, context.providerId),
      this.loadPerformanceByActionCode(client, context.providerId),
      discoveryRepository.listPublishedActionCounts(client),
      discoveryRepository.listDiscoverableRequests(client),
      providerDashboardRepository.aggregateProviderEarnings(client, context.providerId),
      this.countPlatformPublishedActions(client),
    ]);

    return {
      providerId: context.providerId,
      providerUserId: context.userId,
      displayName: context.displayName,
      verificationTier: context.verificationTier,
      trustScore,
      trustTierLabel: null,
      actions,
      performanceByActionCode,
      platformProviderCounts,
      openRequests,
      earnings: {
        currencyCode: earnings.currencyCode,
        releasedEarningsMinor: earnings.releasedEarningsMinor,
        pendingHeldMinor: earnings.pendingHeldMinor,
        walletBalanceMinor: earnings.walletBalanceMinor,
        contractsWithEarnings: earnings.contractsWithEarnings,
      },
      platformPublishedActions,
    };
  }

  private async listProviderActions(
    client: Queryable,
    providerId: string
  ): Promise<ProviderActionRecord[]> {
    const result = await client.query<{
      id: string;
      action_code: string;
      action_name: string;
      title: string;
      status: ActionStatus;
      tekrr_completeness: number;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          id,
          action_code,
          action_name,
          title,
          status,
          tekrr_completeness,
          created_at,
          updated_at
        FROM action.actions
        WHERE provider_id = $1
          AND status <> 'cancelled'
        ORDER BY updated_at DESC, created_at DESC
      `,
      [providerId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      actionCode: row.action_code,
      actionName: row.action_name,
      title: row.title,
      status: row.status,
      tekrrCompleteness: row.tekrr_completeness,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  private async loadPerformanceByActionCode(
    client: Queryable,
    providerId: string
  ): Promise<ActionPerformanceRecord[]> {
    const result = await client.query<{
      action_code: string;
      total_contracts: string;
      active_contracts: string;
      completed_contracts: string;
    }>(
      `
        SELECT
          a.action_code,
          COUNT(DISTINCT c.id)::text AS total_contracts,
          COUNT(DISTINCT c.id) FILTER (
            WHERE c.status IN ('accepted', 'active', 'proposed', 'issue_raised', 'disputed')
          )::text AS active_contracts,
          COUNT(DISTINCT c.id) FILTER (
            WHERE c.status IN ('completed', 'resolved', 'closed')
          )::text AS completed_contracts
        FROM action.actions a
        LEFT JOIN contract.contracts c ON c.action_id = a.id
        WHERE a.provider_id = $1
          AND a.status <> 'cancelled'
        GROUP BY a.action_code
        ORDER BY a.action_code ASC
      `,
      [providerId]
    );

    return result.rows.map((row) => ({
      actionCode: row.action_code,
      totalContracts: Number(row.total_contracts),
      activeContracts: Number(row.active_contracts),
      completedContracts: Number(row.completed_contracts),
    }));
  }

  private async countPlatformPublishedActions(client: Queryable): Promise<number> {
    const result = await client.query<{ count: string }>(
      `
        SELECT COUNT(DISTINCT action_code)::text AS count
        FROM action.actions
        WHERE provider_id IS NOT NULL
          AND status NOT IN ('draft', 'cancelled')
      `
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}

export const actionEconomyRepository = new ActionEconomyRepository();
