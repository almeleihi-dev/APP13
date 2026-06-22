import type { Queryable } from "../../shared/db/index.js";
import type {
  PlatformAnalyticsSnapshot,
  RawRollingRow,
} from "../domain/platform-analytics.js";

interface RollingCountRow {
  all_time: string;
  last_7_days: string;
  prior_7_days: string;
  last_30_days: string;
  prior_30_days: string;
}

function mapRollingRow(row?: RollingCountRow): RawRollingRow {
  return {
    allTime: Number(row?.all_time ?? 0),
    last7Days: Number(row?.last_7_days ?? 0),
    prior7Days: Number(row?.prior_7_days ?? 0),
    last30Days: Number(row?.last_30_days ?? 0),
    prior30Days: Number(row?.prior_30_days ?? 0),
  };
}

function rollingCountSql(timestampColumn: string, tableName: string, whereClause = ""): string {
  const where = whereClause ? `WHERE ${whereClause}` : "";
  return `
    SELECT
      COUNT(*)::text AS all_time,
      COUNT(*) FILTER (
        WHERE ${timestampColumn} >= now() - interval '7 days'
      )::text AS last_7_days,
      COUNT(*) FILTER (
        WHERE ${timestampColumn} >= now() - interval '14 days'
          AND ${timestampColumn} < now() - interval '7 days'
      )::text AS prior_7_days,
      COUNT(*) FILTER (
        WHERE ${timestampColumn} >= now() - interval '30 days'
      )::text AS last_30_days,
      COUNT(*) FILTER (
        WHERE ${timestampColumn} >= now() - interval '60 days'
          AND ${timestampColumn} < now() - interval '30 days'
      )::text AS prior_30_days
    FROM ${tableName}
    ${where}
  `;
}

function rollingAmountSql(timestampColumn: string, amountExpression: string, fromClause: string): string {
  return `
    SELECT
      COALESCE(SUM(${amountExpression}), 0)::text AS all_time,
      COALESCE(SUM(${amountExpression}) FILTER (
        WHERE ${timestampColumn} >= now() - interval '7 days'
      ), 0)::text AS last_7_days,
      COALESCE(SUM(${amountExpression}) FILTER (
        WHERE ${timestampColumn} >= now() - interval '14 days'
          AND ${timestampColumn} < now() - interval '7 days'
      ), 0)::text AS prior_7_days,
      COALESCE(SUM(${amountExpression}) FILTER (
        WHERE ${timestampColumn} >= now() - interval '30 days'
      ), 0)::text AS last_30_days,
      COALESCE(SUM(${amountExpression}) FILTER (
        WHERE ${timestampColumn} >= now() - interval '60 days'
          AND ${timestampColumn} < now() - interval '30 days'
      ), 0)::text AS prior_30_days
    FROM ${fromClause}
  `;
}

export class PlatformAnalyticsRepository {
  async loadSnapshot(client: Queryable): Promise<PlatformAnalyticsSnapshot> {
    const [
      requests,
      offers,
      contracts,
      issues,
      escrows,
      fundedAmount,
      releasedAmount,
      platformFeeAmount,
      currency,
      execution,
      milestoneActivity,
      trustAggregate,
      trustTiers,
      trustEvents,
      discovery,
      activeUsers,
      activeProviders,
      activeCustomers,
      providerUtilization,
    ] = await Promise.all([
      client.query<RollingCountRow & { matched: string; open: string }>(
        `
          SELECT
            COUNT(*)::text AS all_time,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text AS last_7_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '14 days'
                AND created_at < now() - interval '7 days'
            )::text AS prior_7_days,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::text AS last_30_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '60 days'
                AND created_at < now() - interval '30 days'
            )::text AS prior_30_days,
            COUNT(*) FILTER (WHERE status = 'matched')::text AS matched,
            COUNT(*) FILTER (WHERE status = 'open')::text AS open
          FROM experience.customer_requests
        `
      ),
      client.query<
        RollingCountRow & { contract_created: string; cancelled: string }
      >(
        `
          SELECT
            COUNT(*)::text AS all_time,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text AS last_7_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '14 days'
                AND created_at < now() - interval '7 days'
            )::text AS prior_7_days,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::text AS last_30_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '60 days'
                AND created_at < now() - interval '30 days'
            )::text AS prior_30_days,
            COUNT(*) FILTER (WHERE status = 'contract_created')::text AS contract_created,
            COUNT(*) FILTER (WHERE status = 'cancelled')::text AS cancelled
          FROM experience.match_contract_offers
        `
      ),
      client.query<
        RollingCountRow & {
          completed: string;
          active: string;
          disputed: string;
        }
      >(
        `
          SELECT
            COUNT(*)::text AS all_time,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text AS last_7_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '14 days'
                AND created_at < now() - interval '7 days'
            )::text AS prior_7_days,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::text AS last_30_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '60 days'
                AND created_at < now() - interval '30 days'
            )::text AS prior_30_days,
            COUNT(*) FILTER (WHERE status = 'completed')::text AS completed,
            COUNT(*) FILTER (
              WHERE status IN ('accepted', 'active', 'proposed')
            )::text AS active,
            COUNT(*) FILTER (
              WHERE status IN ('issue_raised', 'disputed')
            )::text AS disputed
          FROM contract.contracts
        `
      ),
      client.query<RollingCountRow & { total: string; open: string }>(
        `
          SELECT
            COUNT(*)::text AS all_time,
            COUNT(*) FILTER (WHERE filed_at >= now() - interval '7 days')::text AS last_7_days,
            COUNT(*) FILTER (
              WHERE filed_at >= now() - interval '14 days'
                AND filed_at < now() - interval '7 days'
            )::text AS prior_7_days,
            COUNT(*) FILTER (WHERE filed_at >= now() - interval '30 days')::text AS last_30_days,
            COUNT(*) FILTER (
              WHERE filed_at >= now() - interval '60 days'
                AND filed_at < now() - interval '30 days'
            )::text AS prior_30_days,
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status IN ('raised', 'escalated'))::text AS open
          FROM complaint.issues
        `
      ),
      client.query<
        RollingCountRow & {
          funded: string;
          released: string;
          frozen: string;
          pending_funding: string;
        }
      >(
        `
          SELECT
            COUNT(*)::text AS all_time,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::text AS last_7_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '14 days'
                AND created_at < now() - interval '7 days'
            )::text AS prior_7_days,
            COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::text AS last_30_days,
            COUNT(*) FILTER (
              WHERE created_at >= now() - interval '60 days'
                AND created_at < now() - interval '30 days'
            )::text AS prior_30_days,
            COUNT(*) FILTER (
              WHERE status IN ('funded', 'held', 'in_execution', 'awaiting_acceptance', 'released', 'partially_refunded', 'refunded')
            )::text AS funded,
            COUNT(*) FILTER (WHERE status = 'released')::text AS released,
            COUNT(*) FILTER (WHERE status = 'frozen')::text AS frozen,
            COUNT(*) FILTER (WHERE status = 'pending_funding')::text AS pending_funding
          FROM financial.escrow_agreements
        `
      ),
      client.query<RollingCountRow>(
        rollingAmountSql(
          "j.posted_at",
          "le.amount_minor",
          `financial.journals j
           INNER JOIN financial.ledger_entries le ON le.journal_id = j.id
           WHERE j.journal_type = 'escrow_hold'
             AND le.entry_type = 'hold'`
        )
      ),
      client.query<RollingCountRow>(
        rollingAmountSql(
          "j.posted_at",
          "le.amount_minor",
          `financial.journals j
           INNER JOIN financial.ledger_entries le ON le.journal_id = j.id
           WHERE j.journal_type = 'escrow_release'
             AND le.entry_type = 'release'`
        )
      ),
      client.query<RollingCountRow>(
        rollingAmountSql(
          "j.posted_at",
          "le.amount_minor",
          `financial.journals j
           INNER JOIN financial.ledger_entries le ON le.journal_id = j.id
           WHERE le.entry_type = 'fee'`
        )
      ),
      client.query<{ currency_code: string }>(
        `
          SELECT COALESCE(MAX(currency_code), 'USD') AS currency_code
          FROM financial.escrow_agreements
        `
      ),
      client.query<{
        total_milestones: string;
        completed_milestones: string;
        in_progress_milestones: string;
        total_evidence: string;
        contracts_with_milestones: string;
      }>(
        `
          SELECT
            (SELECT COUNT(*)::text FROM execution.milestones) AS total_milestones,
            (SELECT COUNT(*)::text FROM execution.milestones WHERE status = 'accepted') AS completed_milestones,
            (SELECT COUNT(*)::text FROM execution.milestones WHERE status IN ('in_progress', 'submitted')) AS in_progress_milestones,
            (SELECT COUNT(*)::text FROM execution.evidence) AS total_evidence,
            (SELECT COUNT(DISTINCT contract_id)::text FROM execution.milestones) AS contracts_with_milestones
        `
      ),
      client.query<RollingCountRow>(
        rollingCountSql("updated_at", "execution.milestones")
      ),
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
      client.query<RollingCountRow>(rollingCountSql("occurred_at", "trust.trust_score_events")),
      client.query<{
        open_requests: string;
        matchable_providers: string;
        published_actions: string;
      }>(
        `
          SELECT
            (SELECT COUNT(*)::text FROM experience.customer_requests WHERE status = 'open') AS open_requests,
            (SELECT COUNT(*)::text FROM identity.providers WHERE status = 'active') AS matchable_providers,
            (SELECT COUNT(DISTINCT action_code)::text
             FROM action.actions
             WHERE status NOT IN ('draft', 'cancelled')) AS published_actions
        `
      ),
      client.query<RollingCountRow>(
        rollingCountSql(
          "updated_at",
          "identity.users",
          "status = 'active'"
        )
      ),
      client.query<RollingCountRow>(
        rollingCountSql(
          "updated_at",
          "identity.providers",
          "status = 'active'"
        )
      ),
      client.query<{ count: string }>(
        `
          SELECT COUNT(*)::text AS count
          FROM identity.customers c
          INNER JOIN identity.users u ON u.id = c.user_id
          WHERE u.status = 'active'
        `
      ),
      client.query<{ utilization_percent: string }>(
        `
          SELECT COALESCE(
            ROUND(
              AVG(
                LEAST(
                  100,
                  (COALESCE(active_contracts.count, 0)::numeric / 5) * 100
                )
              )
            ),
            0
          )::text AS utilization_percent
          FROM identity.providers p
          LEFT JOIN (
            SELECT provider_id, COUNT(*) AS count
            FROM contract.contracts
            WHERE status IN ('accepted', 'active', 'proposed')
            GROUP BY provider_id
          ) active_contracts ON active_contracts.provider_id = p.id
          WHERE p.status = 'active'
        `
      ),
    ]);

    const requestRow = requests.rows[0];
    const offerRow = offers.rows[0];
    const contractRow = contracts.rows[0];
    const issueRow = issues.rows[0];
    const escrowRow = escrows.rows[0];
    const executionRow = execution.rows[0];

    return {
      requests: {
        ...mapRollingRow(requestRow),
        matched: Number(requestRow?.matched ?? 0),
        open: Number(requestRow?.open ?? 0),
      },
      offers: {
        ...mapRollingRow(offerRow),
        contractCreated: Number(offerRow?.contract_created ?? 0),
        cancelled: Number(offerRow?.cancelled ?? 0),
      },
      contracts: {
        ...mapRollingRow(contractRow),
        completed: Number(contractRow?.completed ?? 0),
        active: Number(contractRow?.active ?? 0),
        disputed: Number(contractRow?.disputed ?? 0),
      },
      issues: {
        ...mapRollingRow(issueRow),
        total: Number(issueRow?.total ?? 0),
        open: Number(issueRow?.open ?? 0),
      },
      escrows: {
        ...mapRollingRow(escrowRow),
        funded: Number(escrowRow?.funded ?? 0),
        released: Number(escrowRow?.released ?? 0),
        frozen: Number(escrowRow?.frozen ?? 0),
        pendingFunding: Number(escrowRow?.pending_funding ?? 0),
      },
      escrowAmounts: {
        fundedMinor: mapRollingRow(fundedAmount.rows[0]),
        releasedMinor: mapRollingRow(releasedAmount.rows[0]),
        platformFeeMinor: mapRollingRow(platformFeeAmount.rows[0]),
        currencyCode: currency.rows[0]?.currency_code ?? "USD",
      },
      execution: {
        totalMilestones: Number(executionRow?.total_milestones ?? 0),
        completedMilestones: Number(executionRow?.completed_milestones ?? 0),
        inProgressMilestones: Number(executionRow?.in_progress_milestones ?? 0),
        totalEvidence: Number(executionRow?.total_evidence ?? 0),
        contractsWithMilestones: Number(executionRow?.contracts_with_milestones ?? 0),
        milestoneActivity: mapRollingRow(milestoneActivity.rows[0]),
      },
      trust: {
        providersWithScores: Number(trustAggregate.rows[0]?.providers_with_scores ?? 0),
        averageTrustScore: Number(trustAggregate.rows[0]?.average_trust_score ?? 0),
        lowTrustProviderCount: Number(trustAggregate.rows[0]?.low_trust_provider_count ?? 0),
        tierDistribution: trustTiers.rows.map((row) => ({
          tier: row.tier,
          count: Number(row.count),
        })),
        trustEvents: mapRollingRow(trustEvents.rows[0]),
      },
      discovery: {
        openRequests: Number(discovery.rows[0]?.open_requests ?? 0),
        matchableProviders: Number(discovery.rows[0]?.matchable_providers ?? 0),
        publishedActions: Number(discovery.rows[0]?.published_actions ?? 0),
      },
      users: {
        activeUsers: mapRollingRow(activeUsers.rows[0]),
        activeProviders: mapRollingRow(activeProviders.rows[0]),
        activeCustomers: Number(activeCustomers.rows[0]?.count ?? 0),
        providerUtilizationPercent: Number(providerUtilization.rows[0]?.utilization_percent ?? 0),
      },
    };
  }
}

export const platformAnalyticsRepository = new PlatformAnalyticsRepository();
