import type { Queryable } from "../../shared/db/index.js";
import type {
  EvidenceRecord,
  EvidenceType,
  EvidenceUploadIntent,
} from "../domain/evidence.js";
import type { MilestoneStatus } from "../domain/milestone.js";

export type { MilestoneStatus };

export interface Milestone {
  id: string;
  contractId: string;
  milestoneCode: string;
  name: string;
  sequenceOrder: number;
  tekrrDimension: string | null;
  status: MilestoneStatus;
  responsibleParty: string;
  blocking: boolean;
  dueAt: Date | null;
  startedAt: Date | null;
  submittedAt: Date | null;
  acceptedAt: Date | null;
}

export interface Attestation {
  id: string;
  contractId: string;
  tekrrDimension: string;
  fulfillmentRating: string;
  attestedByUserId: string;
  attestedAt: Date;
  source: string;
}

function mapMilestone(row: Record<string, unknown>): Milestone {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    milestoneCode: row.milestone_code as string,
    name: row.name as string,
    sequenceOrder: row.sequence_order as number,
    tekrrDimension: (row.tekrr_dimension as string | null) ?? null,
    status: row.status as MilestoneStatus,
    responsibleParty: row.responsible_party as string,
    blocking: row.blocking as boolean,
    dueAt: row.due_at as Date | null,
    startedAt: row.started_at as Date | null,
    submittedAt: row.submitted_at as Date | null,
    acceptedAt: row.accepted_at as Date | null,
  };
}

function mapAttestation(row: Record<string, unknown>): Attestation {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    tekrrDimension: row.tekrr_dimension as string,
    fulfillmentRating: row.fulfillment_rating as string,
    attestedByUserId: row.attested_by_user_id as string,
    attestedAt: row.attested_at as Date,
    source: row.source as string,
  };
}

function mapUploadIntent(row: Record<string, unknown>): EvidenceUploadIntent {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    milestoneId: row.milestone_id as string,
    userId: row.user_id as string,
    storageKey: row.storage_key as string,
    contentHash: row.content_hash as string,
    evidenceType: row.evidence_type as EvidenceType,
    filename: (row.filename as string | null) ?? null,
    contentType: (row.content_type as string | null) ?? null,
    idempotencyKey: row.idempotency_key as string,
    status: row.status as EvidenceUploadIntent["status"],
    expiresAt: row.expires_at as Date,
    confirmedAt: (row.confirmed_at as Date | null) ?? null,
    createdAt: row.created_at as Date,
  };
}

function mapEvidence(row: Record<string, unknown>): EvidenceRecord {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    milestoneId: row.milestone_id as string,
    submittedByUserId: row.submitted_by_user_id as string,
    evidenceType: row.evidence_type as EvidenceType,
    storageKey: (row.storage_key as string | null) ?? null,
    contentHash: (row.content_hash as string | null) ?? null,
    metadata: row.metadata as Record<string, unknown>,
    submittedAt: row.submitted_at as Date,
    createdAt: row.created_at as Date,
  };
}

export class ExecutionRepository {
  async insertMilestone(
    db: Queryable,
    input: {
      contractId: string;
      milestoneCode: string;
      name: string;
      sequenceOrder: number;
      tekrrDimension?: string;
      responsibleParty: string;
      blocking: boolean;
    }
  ): Promise<Milestone> {
    const result = await db.query(
      `
        INSERT INTO execution.milestones (
          contract_id, milestone_code, name, sequence_order,
          tekrr_dimension, responsible_party, blocking, status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
        RETURNING *
      `,
      [
        input.contractId,
        input.milestoneCode,
        input.name,
        input.sequenceOrder,
        input.tekrrDimension ?? null,
        input.responsibleParty,
        input.blocking,
      ]
    );
    return mapMilestone(result.rows[0]);
  }

  async insertAttestationShell(
    db: Queryable,
    input: {
      contractId: string;
      tekrrDimension: string;
      attestedByUserId: string;
    }
  ): Promise<Attestation> {
    const result = await db.query(
      `
        INSERT INTO execution.attestations (
          contract_id, tekrr_dimension, fulfillment_rating,
          attested_by_user_id, source
        )
        VALUES ($1, $2, 'PEN', $3, 'mutual')
        RETURNING *
      `,
      [input.contractId, input.tekrrDimension, input.attestedByUserId]
    );
    return mapAttestation(result.rows[0]);
  }

  async listMilestones(db: Queryable, contractId: string): Promise<Milestone[]> {
    const result = await db.query(
      `SELECT * FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order`,
      [contractId]
    );
    return result.rows.map(mapMilestone);
  }

  async listAttestations(db: Queryable, contractId: string): Promise<Attestation[]> {
    const result = await db.query(
      `SELECT * FROM execution.attestations WHERE contract_id = $1`,
      [contractId]
    );
    return result.rows.map(mapAttestation);
  }

  async findMilestoneById(db: Queryable, milestoneId: string): Promise<Milestone | null> {
    const result = await db.query(
      `SELECT * FROM execution.milestones WHERE id = $1`,
      [milestoneId]
    );
    if (result.rowCount === 0) return null;
    return mapMilestone(result.rows[0]);
  }

  async findUploadIntentById(db: Queryable, intentId: string): Promise<EvidenceUploadIntent | null> {
    const result = await db.query(
      `SELECT * FROM platform.upload_intents WHERE id = $1`,
      [intentId]
    );
    if (result.rowCount === 0) return null;
    return mapUploadIntent(result.rows[0]);
  }

  async findUploadIntentByIdempotencyKey(
    db: Queryable,
    idempotencyKey: string
  ): Promise<EvidenceUploadIntent | null> {
    const result = await db.query(
      `SELECT * FROM platform.upload_intents WHERE idempotency_key = $1`,
      [idempotencyKey]
    );
    if (result.rowCount === 0) return null;
    return mapUploadIntent(result.rows[0]);
  }

  async createUploadIntent(
    db: Queryable,
    input: {
      contractId: string;
      milestoneId: string;
      userId: string;
      storageKey: string;
      contentHash: string;
      evidenceType: EvidenceType;
      filename?: string;
      contentType?: string;
      idempotencyKey: string;
      expiresAt: Date;
    }
  ): Promise<EvidenceUploadIntent> {
    const result = await db.query(
      `
        INSERT INTO platform.upload_intents (
          contract_id, milestone_id, user_id, storage_key, content_hash,
          evidence_type, filename, content_type, idempotency_key, expires_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `,
      [
        input.contractId,
        input.milestoneId,
        input.userId,
        input.storageKey,
        input.contentHash,
        input.evidenceType,
        input.filename ?? null,
        input.contentType ?? null,
        input.idempotencyKey,
        input.expiresAt,
      ]
    );
    return mapUploadIntent(result.rows[0]);
  }

  async confirmUploadIntent(db: Queryable, intentId: string): Promise<EvidenceUploadIntent | null> {
    const result = await db.query(
      `
        UPDATE platform.upload_intents
        SET status = 'confirmed', confirmed_at = now()
        WHERE id = $1 AND status = 'pending'
        RETURNING *
      `,
      [intentId]
    );
    if (result.rowCount === 0) return null;
    return mapUploadIntent(result.rows[0]);
  }

  async insertEvidence(
    db: Queryable,
    input: {
      contractId: string;
      milestoneId: string;
      submittedByUserId: string;
      evidenceType: EvidenceType;
      storageKey: string;
      contentHash: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<EvidenceRecord> {
    const result = await db.query(
      `
        INSERT INTO execution.evidence (
          contract_id, milestone_id, submitted_by_user_id,
          evidence_type, storage_key, content_hash, metadata
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `,
      [
        input.contractId,
        input.milestoneId,
        input.submittedByUserId,
        input.evidenceType,
        input.storageKey,
        input.contentHash,
        JSON.stringify(input.metadata ?? {}),
      ]
    );
    return mapEvidence(result.rows[0]);
  }

  async countAttestationEvidence(db: Queryable, attestationId: string): Promise<number> {
    const result = await db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM execution.attestation_evidence WHERE attestation_id = $1`,
      [attestationId]
    );
    return Number(result.rows[0].count);
  }

  async transitionMilestone(
    db: Queryable,
    milestoneId: string,
    toStatus: MilestoneStatus,
    fromStatus?: MilestoneStatus
  ): Promise<Milestone | null> {
    const timestamps: Record<string, string> = {
      in_progress: "started_at = COALESCE(started_at, now())",
      submitted: "submitted_at = COALESCE(submitted_at, now())",
      accepted: "accepted_at = COALESCE(accepted_at, now())",
    };
    const extra = timestamps[toStatus] ?? "updated_at = now()";
    const result = await db.query(
      `
        UPDATE execution.milestones
        SET status = $2::execution.milestone_status, ${extra}, updated_at = now()
        WHERE id = $1 AND ($3::text IS NULL OR status = $3::execution.milestone_status)
        RETURNING *
      `,
      [milestoneId, toStatus, fromStatus ?? null]
    );
    if (result.rowCount === 0) return null;
    return mapMilestone(result.rows[0]);
  }

  async rateAttestation(
    db: Queryable,
    attestationId: string,
    rating: string,
    userId: string
  ): Promise<Attestation | null> {
    const result = await db.query(
      `
        UPDATE execution.attestations
        SET fulfillment_rating = $2::execution.fulfillment_rating,
            attested_by_user_id = $3,
            attested_at = now(),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [attestationId, rating, userId]
    );
    if (result.rowCount === 0) return null;
    return mapAttestation(result.rows[0]);
  }

  async countMilestonesByStatus(
    db: Queryable,
    contractId: string
  ): Promise<{ blocking: number; done: number }> {
    const result = await db.query<{ blocking: string; done: string }>(
      `
        SELECT
          COUNT(*) FILTER (WHERE blocking) AS blocking,
          COUNT(*) FILTER (
            WHERE blocking AND status IN (
              'accepted'::execution.milestone_status,
              'waived'::execution.milestone_status
            )
          ) AS done
        FROM execution.milestones
        WHERE contract_id = $1
      `,
      [contractId]
    );
    const row = result.rows[0];
    return { blocking: Number(row.blocking), done: Number(row.done) };
  }

  async unresolvedAttestations(db: Queryable, contractId: string): Promise<number> {
    const result = await db.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count FROM execution.attestations
        WHERE contract_id = $1 AND fulfillment_rating = 'PEN'::execution.fulfillment_rating
      `,
      [contractId]
    );
    return Number(result.rows[0].count);
  }
}

export const executionRepository = new ExecutionRepository();
