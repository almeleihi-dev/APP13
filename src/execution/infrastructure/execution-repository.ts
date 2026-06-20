import type { Queryable } from "../../shared/db/index.js";

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "disputed"
  | "frozen"
  | "waived";

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
