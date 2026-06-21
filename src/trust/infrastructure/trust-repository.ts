import type { DbClient, Queryable } from "../../shared/db/index.js";
import { setSessionGuc } from "../../shared/db/index.js";
import type {
  ProviderTrustScore,
  TrustEvent,
  TrustEventPayload,
  TrustEventType,
} from "../domain/trust-event.js";
import { resolveConfidenceBand } from "../domain/trust-event.js";

interface TrustEventRow {
  id: string;
  provider_id: string;
  event_type: string;
  source_entity_type: string;
  source_entity_id: string;
  contract_id: string | null;
  payload: TrustEventPayload;
  idempotency_key: string;
  occurred_at: Date;
  created_at: Date;
}

interface ProviderTrustScoreRow {
  provider_id: string;
  score: number;
  execution_score: number;
  verification_component: number;
  execution_component: number;
  time_component: number;
  complaints_component: number;
  evaluation_component: number;
  contract_count: number;
  completed_contract_count: number;
  complaint_upheld_count: number;
  confidence_band: string;
  record_state: string;
  computed_at: Date;
}

function mapTrustEvent(row: TrustEventRow): TrustEvent {
  return {
    id: row.id,
    providerId: row.provider_id,
    eventType: row.event_type as TrustEventType,
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    contractId: row.contract_id,
    payload: row.payload ?? {},
    idempotencyKey: row.idempotency_key,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

function mapProviderTrustScore(row: ProviderTrustScoreRow): ProviderTrustScore {
  return {
    providerId: row.provider_id,
    score: row.score,
    executionScore: row.execution_score,
    verificationComponent: row.verification_component,
    executionComponent: row.execution_component,
    timeComponent: row.time_component,
    complaintsComponent: row.complaints_component,
    evaluationComponent: row.evaluation_component,
    contractCount: row.contract_count,
    completedContractCount: row.completed_contract_count,
    complaintUpheldCount: row.complaint_upheld_count,
    confidenceBand: row.confidence_band as ProviderTrustScore["confidenceBand"],
    recordState: row.record_state as ProviderTrustScore["recordState"],
    computedAt: row.computed_at,
  };
}

export class TrustRepository {
  async appendEvent(
    client: Queryable,
    input: {
      providerId: string;
      eventType: TrustEventType;
      sourceEntityType: string;
      sourceEntityId: string;
      contractId?: string | null;
      payload?: TrustEventPayload;
      idempotencyKey: string;
    }
  ): Promise<{ event: TrustEvent; created: boolean }> {
    const insert = await client.query<TrustEventRow>(
      `
        INSERT INTO trust.trust_score_events (
          provider_id,
          event_type,
          source_entity_type,
          source_entity_id,
          contract_id,
          payload,
          idempotency_key
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *
      `,
      [
        input.providerId,
        input.eventType,
        input.sourceEntityType,
        input.sourceEntityId,
        input.contractId ?? null,
        JSON.stringify(input.payload ?? {}),
        input.idempotencyKey,
      ]
    );

    if (insert.rows[0]) {
      return { event: mapTrustEvent(insert.rows[0]), created: true };
    }

    const existing = await client.query<TrustEventRow>(
      `
        SELECT *
        FROM trust.trust_score_events
        WHERE idempotency_key = $1
      `,
      [input.idempotencyKey]
    );
    if (!existing.rows[0]) {
      throw new Error(`trust event idempotency key missing after conflict: ${input.idempotencyKey}`);
    }
    return { event: mapTrustEvent(existing.rows[0]), created: false };
  }

  async listEventsByProvider(client: Queryable, providerId: string): Promise<TrustEvent[]> {
    const result = await client.query<TrustEventRow>(
      `
        SELECT *
        FROM trust.trust_score_events
        WHERE provider_id = $1
        ORDER BY occurred_at ASC, created_at ASC
      `,
      [providerId]
    );
    return result.rows.map(mapTrustEvent);
  }

  async ensureProviderScoreRow(client: Queryable, providerId: string): Promise<void> {
    await client.query(
      `
        INSERT INTO trust.trust_scores (provider_id)
        VALUES ($1)
        ON CONFLICT (provider_id) DO NOTHING
      `,
      [providerId]
    );
  }

  async getProviderScore(client: Queryable, providerId: string): Promise<ProviderTrustScore | null> {
    const result = await client.query<ProviderTrustScoreRow>(
      `
        SELECT
          provider_id,
          score,
          execution_score,
          verification_component,
          execution_component,
          time_component,
          complaints_component,
          evaluation_component,
          contract_count,
          completed_contract_count,
          complaint_upheld_count,
          confidence_band,
          record_state,
          computed_at
        FROM trust.trust_scores
        WHERE provider_id = $1
      `,
      [providerId]
    );
    return result.rows[0] ? mapProviderTrustScore(result.rows[0]) : null;
  }

  async upsertProviderScore(
    client: DbClient,
    input: {
      providerId: string;
      score: number;
      executionScore: number;
      verificationComponent: number;
      executionComponent: number;
      timeComponent: number;
      complaintsComponent: number;
      evaluationComponent: number;
      contractCount: number;
      completedContractCount: number;
      complaintUpheldCount: number;
      dimensionScores: Record<string, number>;
    }
  ): Promise<ProviderTrustScore> {
    await this.ensureProviderScoreRow(client, input.providerId);
    await setSessionGuc(client, "app13.trust_recompute", "on");

    const confidenceBand = resolveConfidenceBand(input.contractCount);
    const result = await client.query<ProviderTrustScoreRow>(
      `
        UPDATE trust.trust_scores
        SET
          score = $2,
          execution_score = $3,
          verification_component = $4,
          execution_component = $5,
          time_component = $6,
          complaints_component = $7,
          evaluation_component = $8,
          contract_count = $9,
          completed_contract_count = $10,
          complaint_upheld_count = $11,
          confidence_band = $12,
          record_state = 'active',
          dimension_scores = $13::jsonb,
          computed_at = now()
        WHERE provider_id = $1
        RETURNING
          provider_id,
          score,
          execution_score,
          verification_component,
          execution_component,
          time_component,
          complaints_component,
          evaluation_component,
          contract_count,
          completed_contract_count,
          complaint_upheld_count,
          confidence_band,
          record_state,
          computed_at
      `,
      [
        input.providerId,
        input.score,
        input.executionScore,
        input.verificationComponent,
        input.executionComponent,
        input.timeComponent,
        input.complaintsComponent,
        input.evaluationComponent,
        input.contractCount,
        input.completedContractCount,
        input.complaintUpheldCount,
        confidenceBand,
        JSON.stringify(input.dimensionScores),
      ]
    );

    return mapProviderTrustScore(result.rows[0]);
  }
}

export const trustRepository = new TrustRepository();
