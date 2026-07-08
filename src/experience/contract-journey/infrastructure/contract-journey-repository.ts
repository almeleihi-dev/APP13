import type { Queryable } from "../../../shared/db/index.js";
import { contractRepository } from "../../../contract/infrastructure/contract-repository.js";
import {
  customerDashboardRepository,
  type CustomerDashboardRepository,
} from "../../../customer-experience/infrastructure/customer-dashboard-repository.js";
import type { ConversionStatus } from "../../../conversion/domain/match-contract-conversion.js";
import type { ContractStatus } from "../../../contract/domain/contract.js";
import type {
  ContractJourneySnapshot,
  JourneyTimelineSourceEvent,
} from "../domain/contract-journey.js";

export class ContractJourneyRepository {
  constructor(
    private readonly dashboardRepository: CustomerDashboardRepository = customerDashboardRepository
  ) {}

  async loadSnapshot(
    client: Queryable,
    contractId: string
  ): Promise<ContractJourneySnapshot | null> {
    const contract = await contractRepository.findById(client, contractId);
    if (!contract) return null;

    const parties = await contractRepository.listParties(client, contractId);
    const customerParty = parties.find((party) => party.partyRole === "customer");
    const providerParty = parties.find((party) => party.partyRole === "provider");
    if (!customerParty || !providerParty) return null;

    const [
      context,
      escrows,
      milestoneCounts,
      evidenceCounts,
      issueAggregates,
      hasEvaluation,
      timelineEvents,
    ] = await Promise.all([
      this.loadContractContext(client, contractId),
      this.dashboardRepository.listEscrowsByContractIds(client, [contractId]),
      this.dashboardRepository.countMilestonesByContractIds(client, [contractId]),
      this.dashboardRepository.countEvidenceByContractIds(client, [contractId]),
      this.dashboardRepository.aggregateIssuesByContractIds(client, [contractId]),
      this.hasEvaluation(client, contractId),
      this.loadTimelineEvents(client, contractId, [
        customerParty.userId,
        providerParty.userId,
      ]),
    ]);

    const milestones = milestoneCounts[0] ?? {
      contractId,
      totalMilestones: 0,
      completedMilestones: 0,
      inProgressMilestones: 0,
      pendingMilestones: 0,
    };
    const issues = issueAggregates[0] ?? {
      contractId,
      openIssueCount: 0,
      latestIssueStatus: null,
    };

    return {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      actionId: contract.actionId,
      actionCode: context.actionCode,
      actionTitle: context.actionTitle,
      contractStatus: contract.status,
      customerUserId: customerParty.userId,
      providerUserId: providerParty.userId,
      customerDisplayName: context.customerDisplayName,
      providerDisplayName: context.providerDisplayName,
      contractCreatedAt: contract.createdAt,
      contractUpdatedAt: contract.updatedAt,
      request: context.request,
      offer: context.offer,
      escrow: escrows[0]
        ? {
            escrowId: escrows[0].escrowId,
            status: escrows[0].status,
          }
        : null,
      milestones: {
        totalMilestones: milestones.totalMilestones,
        completedMilestones: milestones.completedMilestones,
        inProgressMilestones: milestones.inProgressMilestones,
        pendingMilestones: milestones.pendingMilestones,
      },
      evidenceCount: evidenceCounts[0]?.evidenceCount ?? 0,
      openIssueCount: issues.openIssueCount,
      latestIssueStatus: issues.latestIssueStatus,
      hasEvaluation,
      timelineEvents,
    };
  }

  async isPartyToContract(
    client: Queryable,
    contractId: string,
    userId: string
  ): Promise<boolean> {
    const result = await client.query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM contract.contract_parties
          WHERE contract_id = $1
            AND user_id = $2
        ) AS exists
      `,
      [contractId, userId]
    );
    return Boolean(result.rows[0]?.exists);
  }

  private async loadContractContext(client: Queryable, contractId: string) {
    const result = await client.query<{
      action_code: string | null;
      action_title: string | null;
      customer_display_name: string;
      provider_display_name: string;
      request_id: string | null;
      request_status: string | null;
      request_text: string | null;
      request_created_at: Date | null;
      offer_id: string | null;
      offer_status: ConversionStatus | null;
      offer_created_at: Date | null;
      offer_updated_at: Date | null;
    }>(
      `
        SELECT
          a.action_code,
          COALESCE(a.title, a.action_name) AS action_title,
          COALESCE(cust.display_name, 'Customer') AS customer_display_name,
          COALESCE(prov.display_name, 'Provider') AS provider_display_name,
          cr.id AS request_id,
          cr.status AS request_status,
          cr.request_text,
          cr.created_at AS request_created_at,
          o.id AS offer_id,
          o.status AS offer_status,
          o.created_at AS offer_created_at,
          o.updated_at AS offer_updated_at
        FROM contract.contracts c
        LEFT JOIN action.actions a ON a.id = c.action_id
        LEFT JOIN identity.providers prov ON prov.id = c.provider_id
        LEFT JOIN identity.customers cust ON cust.id = c.customer_id
        LEFT JOIN experience.match_contract_offers o ON o.contract_id = c.id
        LEFT JOIN experience.customer_requests cr ON cr.id = o.customer_request_id
        WHERE c.id = $1
        LIMIT 1
      `,
      [contractId]
    );

    const row = result.rows[0];
    if (!row) {
      return {
        actionCode: null,
        actionTitle: null,
        customerDisplayName: "Customer",
        providerDisplayName: "Provider",
        request: null,
        offer: null,
      };
    }

    return {
      actionCode: row.action_code,
      actionTitle: row.action_title,
      customerDisplayName: row.customer_display_name,
      providerDisplayName: row.provider_display_name,
      request: row.request_id
        ? {
            id: row.request_id,
            status: row.request_status ?? "open",
            requestText: row.request_text ?? "",
            createdAt: row.request_created_at ?? new Date(),
          }
        : null,
      offer: row.offer_id
        ? {
            id: row.offer_id,
            status: row.offer_status ?? "offer_created",
            createdAt: row.offer_created_at ?? new Date(),
            updatedAt: row.offer_updated_at ?? new Date(),
          }
        : null,
    };
  }

  private async hasEvaluation(client: Queryable, contractId: string): Promise<boolean> {
    const result = await client.query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM execution.customer_evaluations
          WHERE contract_id = $1
            AND superseded_at IS NULL
        ) AS exists
      `,
      [contractId]
    );
    return Boolean(result.rows[0]?.exists);
  }

  private async loadTimelineEvents(
    client: Queryable,
    contractId: string,
    userIds: string[]
  ): Promise<JourneyTimelineSourceEvent[]> {
    const [inboxEvents, statusHistory] = await Promise.all([
      client.query<{
        id: string;
        event_type: string;
        title: string;
        body: string;
        created_at: Date;
      }>(
        `
          SELECT id, event_type, title, body, created_at
          FROM experience.event_inbox
          WHERE user_id = ANY($1::uuid[])
            AND (
              metadata->>'contract_id' = $2
              OR source_entity_id = $2
            )
          ORDER BY created_at DESC
          LIMIT 100
        `,
        [userIds, contractId]
      ),
      client.query<{
        id: string;
        from_status: ContractStatus;
        to_status: ContractStatus;
        created_at: Date;
      }>(
        `
          SELECT id, from_status, to_status, created_at
          FROM contract.contract_status_history
          WHERE contract_id = $1
          ORDER BY created_at DESC
          LIMIT 100
        `,
        [contractId]
      ),
    ]);

    const inboxTimeline = inboxEvents.rows.map((row) => ({
      eventId: row.id,
      eventType: row.event_type,
      title: row.title,
      description: row.body,
      occurredAt: row.created_at,
      source: "inbox" as const,
    }));

    const statusTimeline = statusHistory.rows.map((row) => ({
      eventId: row.id,
      eventType: "contract_status_changed",
      title: `Contract status changed`,
      description: `Status moved from ${row.from_status} to ${row.to_status}.`,
      occurredAt: row.created_at,
      source: "status_history" as const,
    }));

    return [...inboxTimeline, ...statusTimeline];
  }
}

export const contractJourneyRepository = new ContractJourneyRepository();
