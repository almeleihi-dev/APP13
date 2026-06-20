import type { Queryable } from "../../shared/db/index.js";
import { BLOCKING_COMPLAINT_STATUSES } from "../domain/completion.js";

export class ComplaintReadinessRepository {
  async countBlockingComplaints(db: Queryable, contractId: string): Promise<number> {
    const result = await db.query<{ count: string }>(
      `
        SELECT COUNT(*) AS count
        FROM complaint.complaints
        WHERE contract_id = $1
          AND status::text = ANY($2::text[])
      `,
      [contractId, [...BLOCKING_COMPLAINT_STATUSES]]
    );
    return Number(result.rows[0].count);
  }

  async listPenDimensionsWithActiveComplaints(
    db: Queryable,
    contractId: string
  ): Promise<string[]> {
    const result = await db.query<{ tekrr_dimension: string }>(
      `
        SELECT DISTINCT cd.tekrr_dimension
        FROM complaint.complaint_dimensions cd
        INNER JOIN complaint.complaints c ON c.id = cd.complaint_id
        WHERE cd.contract_id = $1
          AND c.status::text = ANY($2::text[])
          AND cd.parent_status::text = ANY($2::text[])
      `,
      [contractId, [...BLOCKING_COMPLAINT_STATUSES]]
    );
    return result.rows.map((row) => row.tekrr_dimension);
  }
}

export const complaintReadinessRepository = new ComplaintReadinessRepository();
