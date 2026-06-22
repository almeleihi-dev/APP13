import type { Queryable } from "../../../shared/db/index.js";
import { contractRepository } from "../../../contract/infrastructure/contract-repository.js";
import { customerDashboardRepository } from "../../../customer-experience/infrastructure/customer-dashboard-repository.js";
import { escrowRepository } from "../../../financial/infrastructure/escrow-repository.js";
import type { JournalType } from "../../../financial/domain/journal.js";
import type { EscrowStatus } from "../../../financial/domain/escrow.js";
import type { EscrowPaymentSnapshot } from "../domain/escrow-payment-experience.js";

export class EscrowPaymentExperienceRepository {
  async loadSnapshot(
    client: Queryable,
    contractId: string
  ): Promise<EscrowPaymentSnapshot | null> {
    const contract = await contractRepository.findById(client, contractId);
    if (!contract) return null;

    const parties = await contractRepository.listParties(client, contractId);
    const customerParty = parties.find((party) => party.partyRole === "customer");
    const providerParty = parties.find((party) => party.partyRole === "provider");
    if (!customerParty || !providerParty) return null;

    const [context, escrow, milestones, issues, journalEvents, inboxEvents] = await Promise.all([
        this.loadContractContext(client, contractId),
        escrowRepository.findByContractId(client, contractId),
        customerDashboardRepository.countMilestonesByContractIds(client, [contractId]),
        customerDashboardRepository.aggregateIssuesByContractIds(client, [contractId]),
        this.loadJournalEvents(client, contractId),
        this.loadFinancialInboxEvents(client, contractId, [
          customerParty.userId,
          providerParty.userId,
        ]),
      ]);

    const escrowStatusEvents = escrow
      ? await this.loadEscrowStatusEvents(client, escrow.id)
      : [];

    const milestoneSummary = milestones[0] ?? {
      contractId,
      totalMilestones: 0,
      completedMilestones: 0,
      inProgressMilestones: 0,
      pendingMilestones: 0,
    };
    const issueSummary = issues[0] ?? {
      contractId,
      openIssueCount: 0,
      latestIssueStatus: null,
    };

    return {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      contractStatus: contract.status,
      customerUserId: customerParty.userId,
      providerUserId: providerParty.userId,
      customerDisplayName: context.customerDisplayName,
      providerDisplayName: context.providerDisplayName,
      commercialTerms: contract.commercialTerms,
      contract,
      escrow,
      milestones: {
        totalMilestones: milestoneSummary.totalMilestones,
        completedMilestones: milestoneSummary.completedMilestones,
        inProgressMilestones: milestoneSummary.inProgressMilestones,
        pendingMilestones: milestoneSummary.pendingMilestones,
      },
      openIssueCount: issueSummary.openIssueCount,
      journalEvents,
      escrowStatusEvents,
      inboxEvents,
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
      customer_display_name: string;
      provider_display_name: string;
    }>(
      `
        SELECT
          COALESCE(cust.display_name, 'Customer') AS customer_display_name,
          COALESCE(prov.display_name, 'Provider') AS provider_display_name
        FROM contract.contracts c
        LEFT JOIN identity.customers cust ON cust.id = c.customer_id
        LEFT JOIN identity.providers prov ON prov.id = c.provider_id
        WHERE c.id = $1
      `,
      [contractId]
    );

    return {
      customerDisplayName: result.rows[0]?.customer_display_name ?? "Customer",
      providerDisplayName: result.rows[0]?.provider_display_name ?? "Provider",
    };
  }

  private async loadJournalEvents(client: Queryable, contractId: string) {
    const result = await client.query<{
      id: string;
      journal_type: JournalType;
      posted_at: Date;
    }>(
      `
        SELECT id, journal_type, posted_at
        FROM financial.journals
        WHERE contract_id = $1
        ORDER BY posted_at ASC
      `,
      [contractId]
    );

    return result.rows.map((row) => ({
      journalId: row.id,
      journalType: row.journal_type,
      postedAt: row.posted_at,
    }));
  }

  private async loadEscrowStatusEvents(client: Queryable, escrowId: string) {
    const result = await client.query<{
      from_status: EscrowStatus | null;
      to_status: EscrowStatus;
      created_at: Date;
    }>(
      `
        SELECT from_status, to_status, created_at
        FROM financial.escrow_status_history
        WHERE escrow_id = $1
        ORDER BY created_at ASC
      `,
      [escrowId]
    );

    return result.rows.map((row) => ({
      fromStatus: row.from_status,
      toStatus: row.to_status,
      occurredAt: row.created_at,
    }));
  }

  private async loadFinancialInboxEvents(
    client: Queryable,
    contractId: string,
    userIds: string[]
  ) {
    const result = await client.query<{
      event_type: string;
      title: string;
      body: string;
      created_at: Date;
    }>(
      `
        SELECT event_type, title, body, created_at
        FROM experience.event_inbox
        WHERE user_id = ANY($1::uuid[])
          AND category IN ('escrow', 'payment')
          AND (
            metadata->>'contract_id' = $2
            OR source_entity_id = $2
          )
        ORDER BY created_at ASC
      `,
      [userIds, contractId]
    );

    return result.rows.map((row) => ({
      eventType: row.event_type,
      title: row.title,
      description: row.body,
      occurredAt: row.created_at,
    }));
  }
}

export const escrowPaymentExperienceRepository = new EscrowPaymentExperienceRepository();
