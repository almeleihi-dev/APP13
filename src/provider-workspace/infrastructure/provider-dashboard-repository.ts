import type { Queryable } from "../../shared/db/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import type { ContractStatus } from "../../contract/domain/contract.js";
import type { ConversionStatus } from "../../conversion/domain/match-contract-conversion.js";
import type { EscrowStatus } from "../../financial/domain/escrow.js";
import type { IssueStatus } from "../../complaint/domain/issue.js";

export interface ProviderOfferRecord {
  id: string;
  customerRequestId: string;
  customerUserId: string;
  customerId: string;
  providerId: string;
  providerUserId: string;
  customerDisplayName: string;
  requestText: string;
  selectedActionId: string;
  selectedActionCode: string;
  status: ConversionStatus;
  contractId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderContractRecord {
  id: string;
  contractNumber: string;
  actionId: string;
  actionCode: string | null;
  actionTitle: string | null;
  customerId: string | null;
  customerDisplayName: string;
  status: ContractStatus;
  customerRequestId: string | null;
  offerId: string | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface ProviderEarningsRecord {
  currencyCode: string;
  releasedEarningsMinor: number;
  pendingHeldMinor: number;
  walletBalanceMinor: number;
  contractsWithEarnings: number;
}

export class ProviderDashboardRepository {
  constructor(private readonly identityRepo: IdentityRepository = identityRepository) {}

  async findProviderByUserId(client: Queryable, userId: string) {
    return this.identityRepo.findProviderByUserId(client, userId);
  }

  async listOffersByProviderUserId(
    client: Queryable,
    providerUserId: string,
    limit = 50
  ): Promise<ProviderOfferRecord[]> {
    const result = await client.query<{
      id: string;
      customer_request_id: string;
      customer_user_id: string;
      customer_id: string;
      provider_id: string;
      provider_user_id: string;
      customer_display_name: string;
      request_text: string;
      selected_action_id: string;
      selected_action_code: string;
      status: ConversionStatus;
      contract_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          o.id,
          o.customer_request_id,
          o.customer_user_id,
          o.customer_id,
          o.provider_id,
          o.provider_user_id,
          COALESCE(cu.display_name, 'Customer') AS customer_display_name,
          cr.request_text,
          o.selected_action_id,
          o.selected_action_code,
          o.status,
          o.contract_id,
          o.created_at,
          o.updated_at
        FROM experience.match_contract_offers o
        INNER JOIN experience.customer_requests cr ON cr.id = o.customer_request_id
        LEFT JOIN identity.customers cu ON cu.id = o.customer_id
        WHERE o.provider_user_id = $1
        ORDER BY o.created_at DESC
        LIMIT $2
      `,
      [providerUserId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      customerRequestId: row.customer_request_id,
      customerUserId: row.customer_user_id,
      customerId: row.customer_id,
      providerId: row.provider_id,
      providerUserId: row.provider_user_id,
      customerDisplayName: row.customer_display_name,
      requestText: row.request_text,
      selectedActionId: row.selected_action_id,
      selectedActionCode: row.selected_action_code,
      status: row.status,
      contractId: row.contract_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listContractsByProviderUserId(
    client: Queryable,
    providerUserId: string,
    limit = 50
  ): Promise<ProviderContractRecord[]> {
    const result = await client.query<{
      id: string;
      contract_number: string;
      action_id: string;
      action_code: string | null;
      action_title: string | null;
      customer_id: string | null;
      customer_display_name: string | null;
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
          c.customer_id,
          COALESCE(cu.display_name, 'Customer') AS customer_display_name,
          c.status,
          o.customer_request_id,
          o.id AS offer_id,
          c.created_at,
          c.updated_at
        FROM contract.contracts c
        INNER JOIN contract.contract_parties cp
          ON cp.contract_id = c.id
         AND cp.user_id = $1
         AND cp.party_role = 'provider'
        LEFT JOIN action.actions a ON a.id = c.action_id
        LEFT JOIN identity.customers cu ON cu.id = c.customer_id
        LEFT JOIN experience.match_contract_offers o ON o.contract_id = c.id
        ORDER BY c.updated_at DESC, c.created_at DESC
        LIMIT $2
      `,
      [providerUserId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      contractNumber: row.contract_number,
      actionId: row.action_id,
      actionCode: row.action_code,
      actionTitle: row.action_title,
      customerId: row.customer_id,
      customerDisplayName: row.customer_display_name ?? "Customer",
      status: row.status,
      customerRequestId: row.customer_request_id,
      offerId: row.offer_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
      platformFeeMinor: number;
      currencyCode: string;
    }>
  > {
    if (contractIds.length === 0) return [];

    const result = await client.query<{
      contract_id: string;
      id: string;
      status: EscrowStatus;
      gross_amount_minor: number;
      platform_fee_minor: number;
      currency_code: string;
    }>(
      `
        SELECT contract_id, id, status, gross_amount_minor, platform_fee_minor, currency_code
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
      platformFeeMinor: Number(row.platform_fee_minor),
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

  async aggregateProviderEarnings(
    client: Queryable,
    providerId: string
  ): Promise<ProviderEarningsRecord> {
    const ledgerResult = await client.query<{
      currency_code: string;
      released_earnings_minor: string;
      wallet_balance_minor: string;
    }>(
      `
        SELECT
          COALESCE(MAX(le.currency_code), 'USD') AS currency_code,
          COALESCE(SUM(
            CASE
              WHEN le.entry_type = 'release' AND le.direction = 'debit' THEN le.amount_minor
              ELSE 0
            END
          ), 0)::text AS released_earnings_minor,
          COALESCE(SUM(
            CASE
              WHEN le.direction = 'debit' THEN le.amount_minor
              ELSE -le.amount_minor
            END
          ), 0)::text AS wallet_balance_minor
        FROM financial.ledger_entries le
        INNER JOIN financial.accounts a ON a.id = le.account_id
        WHERE a.account_type = 'provider_wallet'
          AND a.owner_entity_id = $1
      `,
      [providerId]
    );

    const pendingResult = await client.query<{
      pending_held_minor: string;
      contracts_with_earnings: string;
    }>(
      `
        SELECT
          COALESCE(SUM(ea.gross_amount_minor - ea.platform_fee_minor), 0)::text AS pending_held_minor,
          COUNT(DISTINCT c.id)::text AS contracts_with_earnings
        FROM contract.contracts c
        LEFT JOIN financial.escrow_agreements ea ON ea.contract_id = c.id
        WHERE c.provider_id = $1
          AND (
            ea.status IN ('pending_funding', 'funded', 'held', 'in_execution', 'awaiting_acceptance')
            OR ea.status = 'released'
          )
      `,
      [providerId]
    );

    const ledgerRow = ledgerResult.rows[0];
    const pendingRow = pendingResult.rows[0];

    return {
      currencyCode: ledgerRow?.currency_code ?? "USD",
      releasedEarningsMinor: Number(ledgerRow?.released_earnings_minor ?? 0),
      pendingHeldMinor: Number(pendingRow?.pending_held_minor ?? 0),
      walletBalanceMinor: Number(ledgerRow?.wallet_balance_minor ?? 0),
      contractsWithEarnings: Number(pendingRow?.contracts_with_earnings ?? 0),
    };
  }
}

export const providerDashboardRepository = new ProviderDashboardRepository();
