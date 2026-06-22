import type { Queryable } from "../../shared/db/index.js";
import type { StatusCount } from "../domain/admin-console.js";

const PERIOD_DAYS = 7;

interface PeriodCountRow {
  recent_count: string;
  prior_count: string;
}

function mapStatusRows(rows: Array<{ status: string; count: string }>): StatusCount[] {
  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count),
  }));
}

function mapPeriodCounts(row?: PeriodCountRow): { recentCount: number; priorCount: number } {
  return {
    recentCount: Number(row?.recent_count ?? 0),
    priorCount: Number(row?.prior_count ?? 0),
  };
}

export class AdminConsoleRepository {
  async getRequestMetrics(client: Queryable) {
    const [distribution, period] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `
          SELECT status, COUNT(*)::text AS count
          FROM experience.customer_requests
          GROUP BY status
          ORDER BY count DESC
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($2::text || ' days')::interval
                AND created_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM experience.customer_requests
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    const totalCount = mapStatusRows(distribution.rows).reduce(
      (total, entry) => total + entry.count,
      0
    );

    return {
      totalCount,
      statusDistribution: mapStatusRows(distribution.rows),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getOfferMetrics(client: Queryable) {
    const [distribution, period] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `
          SELECT status, COUNT(*)::text AS count
          FROM experience.match_contract_offers
          GROUP BY status
          ORDER BY count DESC
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($2::text || ' days')::interval
                AND created_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM experience.match_contract_offers
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    const totalCount = mapStatusRows(distribution.rows).reduce(
      (total, entry) => total + entry.count,
      0
    );

    return {
      totalCount,
      statusDistribution: mapStatusRows(distribution.rows),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getContractMetrics(client: Queryable) {
    const [distribution, period] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `
          SELECT status, COUNT(*)::text AS count
          FROM contract.contracts
          GROUP BY status
          ORDER BY count DESC
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($2::text || ' days')::interval
                AND created_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM contract.contracts
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    const totalCount = mapStatusRows(distribution.rows).reduce(
      (total, entry) => total + entry.count,
      0
    );

    return {
      totalCount,
      statusDistribution: mapStatusRows(distribution.rows),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getEscrowMetrics(client: Queryable) {
    const [distribution, period] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `
          SELECT status, COUNT(*)::text AS count
          FROM financial.escrow_agreements
          GROUP BY status
          ORDER BY count DESC
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE created_at >= now() - ($2::text || ' days')::interval
                AND created_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM financial.escrow_agreements
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    const totalCount = mapStatusRows(distribution.rows).reduce(
      (total, entry) => total + entry.count,
      0
    );

    return {
      totalCount,
      statusDistribution: mapStatusRows(distribution.rows),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getExecutionMetrics(client: Queryable) {
    const [milestones, evidence, contracts, period] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `
          SELECT status, COUNT(*)::text AS count
          FROM execution.milestones
          GROUP BY status
          ORDER BY count DESC
        `
      ),
      client.query<{ total_evidence: string }>(
        `SELECT COUNT(*)::text AS total_evidence FROM execution.evidence`
      ),
      client.query<{ contracts_with_milestones: string }>(
        `
          SELECT COUNT(DISTINCT contract_id)::text AS contracts_with_milestones
          FROM execution.milestones
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE updated_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE updated_at >= now() - ($2::text || ' days')::interval
                AND updated_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM execution.milestones
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    const milestoneStatusDistribution = mapStatusRows(milestones.rows);
    const totalMilestones = milestoneStatusDistribution.reduce(
      (total, entry) => total + entry.count,
      0
    );

    return {
      totalMilestones,
      milestoneStatusDistribution,
      totalEvidence: Number(evidence.rows[0]?.total_evidence ?? 0),
      contractsWithMilestones: Number(
        contracts.rows[0]?.contracts_with_milestones ?? 0
      ),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getIssueMetrics(client: Queryable) {
    const [distribution, period] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `
          SELECT status::text AS status, COUNT(*)::text AS count
          FROM complaint.issues
          GROUP BY status
          ORDER BY count DESC
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE filed_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE filed_at >= now() - ($2::text || ' days')::interval
                AND filed_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM complaint.issues
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    const totalCount = mapStatusRows(distribution.rows).reduce(
      (total, entry) => total + entry.count,
      0
    );

    return {
      totalCount,
      statusDistribution: mapStatusRows(distribution.rows),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getTrustMetrics(client: Queryable) {
    const [aggregate, frameDistribution, period] = await Promise.all([
      client.query<{
        providers_with_scores: string;
        average_trust_score: string;
        low_trust_provider_count: string;
      }>(
        `
          SELECT
            COUNT(*)::text AS providers_with_scores,
            COALESCE(ROUND(AVG(score)), 0)::text AS average_trust_score,
            COUNT(*) FILTER (WHERE score < 50)::text AS low_trust_provider_count
          FROM trust.trust_scores
          WHERE record_state <> 'uninitialized'
        `
      ),
      client.query<{ tier: string; count: string }>(
        `
          SELECT
            COALESCE(dimension_scores->'s5'->>'tier', 'unknown') AS tier,
            COUNT(*)::text AS count
          FROM trust.trust_scores
          WHERE record_state <> 'uninitialized'
          GROUP BY tier
          ORDER BY count DESC
        `
      ),
      client.query<PeriodCountRow>(
        `
          SELECT
            COUNT(*) FILTER (
              WHERE occurred_at >= now() - ($1::text || ' days')::interval
            )::text AS recent_count,
            COUNT(*) FILTER (
              WHERE occurred_at >= now() - ($2::text || ' days')::interval
                AND occurred_at < now() - ($1::text || ' days')::interval
            )::text AS prior_count
          FROM trust.trust_score_events
        `,
        [PERIOD_DAYS, PERIOD_DAYS * 2]
      ),
    ]);

    return {
      providersWithScores: Number(aggregate.rows[0]?.providers_with_scores ?? 0),
      averageTrustScore: Number(aggregate.rows[0]?.average_trust_score ?? 0),
      lowTrustProviderCount: Number(aggregate.rows[0]?.low_trust_provider_count ?? 0),
      frameTierDistribution: frameDistribution.rows.map((row) => ({
        status: row.tier,
        count: Number(row.count),
      })),
      ...mapPeriodCounts(period.rows[0]),
    };
  }

  async getRiskMetrics(client: Queryable) {
    const result = await client.query<{
      frozen_escrows: string;
      open_issues: string;
      escalated_issues: string;
      disputed_contracts: string;
      failed_operations: string;
      stale_offers: string;
      low_trust_providers: string;
      pending_funding_escrows: string;
    }>(
      `
        SELECT
          (SELECT COUNT(*) FROM financial.escrow_agreements WHERE status = 'frozen')::text
            AS frozen_escrows,
          (SELECT COUNT(*) FROM complaint.issues WHERE status IN ('raised', 'escalated'))::text
            AS open_issues,
          (SELECT COUNT(*) FROM complaint.issues WHERE status = 'escalated')::text
            AS escalated_issues,
          (SELECT COUNT(*) FROM contract.contracts WHERE status IN ('issue_raised', 'disputed'))::text
            AS disputed_contracts,
          (SELECT COUNT(*) FROM platform.operations WHERE status = 'failed')::text
            AS failed_operations,
          (SELECT COUNT(*) FROM experience.match_contract_offers
            WHERE status IN ('offer_created', 'draft_previewed')
              AND created_at < now() - interval '7 days')::text AS stale_offers,
          (SELECT COUNT(*) FROM trust.trust_scores
            WHERE record_state <> 'uninitialized' AND score < 50)::text AS low_trust_providers,
          (SELECT COUNT(*) FROM financial.escrow_agreements WHERE status = 'pending_funding')::text
            AS pending_funding_escrows
      `
    );

    const row = result.rows[0];
    return {
      frozenEscrows: Number(row?.frozen_escrows ?? 0),
      openIssues: Number(row?.open_issues ?? 0),
      escalatedIssues: Number(row?.escalated_issues ?? 0),
      disputedContracts: Number(row?.disputed_contracts ?? 0),
      failedOperations: Number(row?.failed_operations ?? 0),
      staleOffers: Number(row?.stale_offers ?? 0),
      lowTrustProviders: Number(row?.low_trust_providers ?? 0),
      pendingFundingEscrows: Number(row?.pending_funding_escrows ?? 0),
    };
  }

  async getFailedOperationCount(client: Queryable): Promise<number> {
    const result = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM platform.operations WHERE status = 'failed'`
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}

export const adminConsoleRepository = new AdminConsoleRepository();
