import type { Queryable } from "../../shared/db/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import type { ContractStatus } from "../../contract/domain/contract.js";
import type { ConversionStatus } from "../../conversion/domain/match-contract-conversion.js";
import type { EscrowStatus } from "../../financial/domain/escrow.js";
import type { IssueStatus } from "../../complaint/domain/issue.js";

export interface CustomerRequestRecord {
  id: string;
  customerUserId: string;
  customerId: string;
  requestText: string;
  budget: number | null;
  preferredDays: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerOfferRecord {
  id: string;
  customerRequestId: string;
  customerUserId: string;
  customerId: string;
  providerId: string;
  providerUserId: string;
  providerDisplayName: string;
  selectedActionId: string;
  selectedActionCode: string;
  status: ConversionStatus;
  contractId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerContractRecord {
  id: string;
  contractNumber: string;
  actionId: string;
  actionCode: string | null;
  actionTitle: string | null;
  providerId: string | null;
  providerDisplayName: string;
  status: ContractStatus;
  customerRequestId: string | null;
  offerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferCountByRequest {
  customerRequestId: string;
  offerCount: number;
  contractCount: number;
}

export interface MilestoneCountByContract {
  contractId: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  pendingMilestones: number;
}

export interface ContractIssueAggregate {
  contractId: string;
  openIssueCount: number;
  latestIssueStatus: IssueStatus | null;
}

export class CustomerDashboardRepository {
  constructor(private readonly identityRepo: IdentityRepository = identityRepository) {}

  async findCustomerByUserId(client: Queryable, userId: string) {
    return this.identityRepo.findCustomerByUserId(client, userId);
  }

  async listRequestsByCustomerUserId(
    client: Queryable,
    customerUserId: string,
    limit = 50
  ): Promise<CustomerRequestRecord[]> {
    const result = await client.query<{
      id: string;
      customer_user_id: string;
      customer_id: string;
      request_text: string;
      budget_minor: number | null;
      preferred_days: number | null;
      status: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT *
        FROM experience.customer_requests
        WHERE customer_user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [customerUserId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      customerUserId: row.customer_user_id,
      customerId: row.customer_id,
      requestText: row.request_text,
      budget: row.budget_minor,
      preferredDays: row.preferred_days,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listOffersByCustomerUserId(
    client: Queryable,
    customerUserId: string,
    limit = 50
  ): Promise<CustomerOfferRecord[]> {
    const result = await client.query<{
      id: string;
      customer_request_id: string;
      customer_user_id: string;
      customer_id: string;
      provider_id: string;
      provider_user_id: string;
      provider_display_name: string;
      selected_action_id: string;
      selected_action_code: string;
      status: ConversionStatus;
      contract_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          o.*,
          p.display_name AS provider_display_name
        FROM experience.match_contract_offers o
        INNER JOIN identity.providers p ON p.id = o.provider_id
        WHERE o.customer_user_id = $1
        ORDER BY o.created_at DESC
        LIMIT $2
      `,
      [customerUserId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      customerRequestId: row.customer_request_id,
      customerUserId: row.customer_user_id,
      customerId: row.customer_id,
      providerId: row.provider_id,
      providerUserId: row.provider_user_id,
      providerDisplayName: row.provider_display_name,
      selectedActionId: row.selected_action_id,
      selectedActionCode: row.selected_action_code,
      status: row.status,
      contractId: row.contract_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listContractsByCustomerUserId(
    client: Queryable,
    customerUserId: string,
    limit = 50
  ): Promise<CustomerContractRecord[]> {
    const result = await client.query<{
      id: string;
      contract_number: string;
      action_id: string;
      action_code: string | null;
      action_title: string | null;
      provider_id: string | null;
      provider_display_name: string | null;
      status: ContractStatus;
      customer_request_id: string | null;
      offer_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          c.id,
          c.contract_number,
          c.action_id,
          a.action_code,
          COALESCE(a.title, a.action_name) AS action_title,
          c.provider_id,
          COALESCE(p.display_name, 'Provider') AS provider_display_name,
          c.status,
          o.customer_request_id,
          o.id AS offer_id,
          c.created_at,
          c.updated_at
        FROM contract.contracts c
        INNER JOIN contract.contract_parties cp
          ON cp.contract_id = c.id
         AND cp.user_id = $1
         AND cp.party_role = 'customer'
        LEFT JOIN action.actions a ON a.id = c.action_id
        LEFT JOIN identity.providers p ON p.id = c.provider_id
        LEFT JOIN experience.match_contract_offers o ON o.contract_id = c.id
        ORDER BY c.updated_at DESC, c.created_at DESC
        LIMIT $2
      `,
      [customerUserId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      contractNumber: row.contract_number,
      actionId: row.action_id,
      actionCode: row.action_code,
      actionTitle: row.action_title,
      providerId: row.provider_id,
      providerDisplayName: row.provider_display_name ?? "Provider",
      status: row.status,
      customerRequestId: row.customer_request_id,
      offerId: row.offer_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async countOffersByRequest(
    client: Queryable,
    customerUserId: string
  ): Promise<OfferCountByRequest[]> {
    const result = await client.query<{
      customer_request_id: string;
      offer_count: string;
      contract_count: string;
    }>(
      `
        SELECT
          customer_request_id,
          COUNT(*) AS offer_count,
          COUNT(*) FILTER (WHERE contract_id IS NOT NULL) AS contract_count
        FROM experience.match_contract_offers
        WHERE customer_user_id = $1
        GROUP BY customer_request_id
      `,
      [customerUserId]
    );

    return result.rows.map((row) => ({
      customerRequestId: row.customer_request_id,
      offerCount: Number(row.offer_count),
      contractCount: Number(row.contract_count),
    }));
  }

  async listEscrowsByContractIds(
    client: Queryable,
    contractIds: string[]
  ): Promise<
    Array<{
      contractId: string;
      escrowId: string;
      status: EscrowStatus;
      grossAmountMinor: number;
      currencyCode: string;
    }>
  > {
    if (contractIds.length === 0) return [];

    const result = await client.query<{
      contract_id: string;
      id: string;
      status: EscrowStatus;
      gross_amount_minor: number;
      currency_code: string;
    }>(
      `
        SELECT contract_id, id, status, gross_amount_minor, currency_code
        FROM financial.escrow_agreements
        WHERE contract_id = ANY($1::uuid[])
      `,
      [contractIds]
    );

    return result.rows.map((row) => ({
      contractId: row.contract_id,
      escrowId: row.id,
      status: row.status,
      grossAmountMinor: Number(row.gross_amount_minor),
      currencyCode: row.currency_code,
    }));
  }

  async countMilestonesByContractIds(
    client: Queryable,
    contractIds: string[]
  ): Promise<MilestoneCountByContract[]> {
    if (contractIds.length === 0) return [];

    const result = await client.query<{
      contract_id: string;
      total_milestones: string;
      completed_milestones: string;
      in_progress_milestones: string;
      pending_milestones: string;
    }>(
      `
        SELECT
          contract_id,
          COUNT(*) AS total_milestones,
          COUNT(*) FILTER (WHERE status IN ('accepted', 'waived')) AS completed_milestones,
          COUNT(*) FILTER (WHERE status IN ('in_progress', 'submitted', 'disputed')) AS in_progress_milestones,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_milestones
        FROM execution.milestones
        WHERE contract_id = ANY($1::uuid[])
        GROUP BY contract_id
      `,
      [contractIds]
    );

    return result.rows.map((row) => ({
      contractId: row.contract_id,
      totalMilestones: Number(row.total_milestones),
      completedMilestones: Number(row.completed_milestones),
      inProgressMilestones: Number(row.in_progress_milestones),
      pendingMilestones: Number(row.pending_milestones),
    }));
  }

  async countEvidenceByContractIds(
    client: Queryable,
    contractIds: string[]
  ): Promise<Array<{ contractId: string; evidenceCount: number }>> {
    if (contractIds.length === 0) return [];

    const result = await client.query<{
      contract_id: string;
      evidence_count: string;
    }>(
      `
        SELECT contract_id, COUNT(*) AS evidence_count
        FROM execution.evidence
        WHERE contract_id = ANY($1::uuid[])
        GROUP BY contract_id
      `,
      [contractIds]
    );

    return result.rows.map((row) => ({
      contractId: row.contract_id,
      evidenceCount: Number(row.evidence_count),
    }));
  }

  async aggregateIssuesByContractIds(
    client: Queryable,
    contractIds: string[]
  ): Promise<ContractIssueAggregate[]> {
    if (contractIds.length === 0) return [];

    const result = await client.query<{
      contract_id: string;
      open_issue_count: string;
      latest_issue_status: IssueStatus | null;
    }>(
      `
        SELECT
          contract_id,
          COUNT(*) FILTER (
            WHERE status IN ('raised', 'escalated')
          ) AS open_issue_count,
          (
            SELECT i2.status
            FROM complaint.issues i2
            WHERE i2.contract_id = i.contract_id
            ORDER BY i2.filed_at DESC
            LIMIT 1
          ) AS latest_issue_status
        FROM complaint.issues i
        WHERE contract_id = ANY($1::uuid[])
        GROUP BY contract_id
      `,
      [contractIds]
    );

    return result.rows.map((row) => ({
      contractId: row.contract_id,
      openIssueCount: Number(row.open_issue_count),
      latestIssueStatus: row.latest_issue_status,
    }));
  }
}

export const customerDashboardRepository = new CustomerDashboardRepository();
