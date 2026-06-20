import type { Queryable } from "../../shared/db/index.js";
import type { IssueStatus } from "../domain/issue.js";

export interface IssueRecord {
  id: string;
  contractId: string;
  caseId: string | null;
  filedByUserId: string;
  status: IssueStatus;
  description: string;
  riskLevel: number | null;
  filedAt: Date;
  createdAt: Date;
}

function mapIssue(row: Record<string, unknown>): IssueRecord {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    caseId: (row.case_id as string | null) ?? null,
    filedByUserId: row.filed_by_user_id as string,
    status: row.status as IssueStatus,
    description: row.description as string,
    riskLevel: (row.risk_level as number | null) ?? null,
    filedAt: row.filed_at as Date,
    createdAt: row.created_at as Date,
  };
}

export class ComplaintRepository {
  async findIssueById(db: Queryable, issueId: string): Promise<IssueRecord | null> {
    const result = await db.query(`SELECT * FROM complaint.issues WHERE id = $1`, [issueId]);
    if (result.rowCount === 0) return null;
    return mapIssue(result.rows[0]);
  }

  async createIssue(
    db: Queryable,
    input: {
      contractId: string;
      filedByUserId: string;
      description: string;
      dimensions?: Array<{ tekrr_dimension: string }>;
      milestoneIds?: string[];
    }
  ): Promise<IssueRecord> {
    const issueResult = await db.query(
      `
        INSERT INTO complaint.issues (contract_id, filed_by_user_id, description, status)
        VALUES ($1, $2, $3, 'raised'::complaint.issue_status)
        RETURNING *
      `,
      [input.contractId, input.filedByUserId, input.description]
    );
    const issue = mapIssue(issueResult.rows[0]);

    for (const dimension of input.dimensions ?? []) {
      await db.query(
        `
          INSERT INTO complaint.issue_dimensions (issue_id, contract_id, tekrr_dimension)
          VALUES ($1, $2, $3)
        `,
        [issue.id, input.contractId, dimension.tekrr_dimension]
      );
    }

    for (const milestoneId of input.milestoneIds ?? []) {
      await db.query(
        `
          INSERT INTO complaint.issue_milestones (issue_id, milestone_id, contract_id)
          VALUES ($1, $2, $3)
        `,
        [issue.id, milestoneId, input.contractId]
      );
    }

    await db.query(
      `
        INSERT INTO complaint.issue_status_history (issue_id, from_status, to_status, actor_user_id)
        VALUES ($1, NULL, 'raised', $2)
      `,
      [issue.id, input.filedByUserId]
    );

    return issue;
  }
}

export const complaintRepository = new ComplaintRepository();
