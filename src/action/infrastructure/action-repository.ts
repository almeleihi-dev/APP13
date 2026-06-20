import type { Action, ActionStatus, TekrrDimension, TekrrProfile } from "../domain/index.js";
import type { Queryable } from "../../shared/db/index.js";

function mapAction(row: Record<string, unknown>): Action {
  return {
    id: row.id as string,
    actionCode: row.action_code as string,
    actionName: row.action_name as string,
    domain: row.domain as string,
    status: row.status as ActionStatus,
    customerId: row.customer_id as string,
    providerId: (row.provider_id as string | null) ?? null,
    invitedProviderEmail: (row.invited_provider_email as string | null) ?? null,
    companyId: (row.company_id as string | null) ?? null,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    tekrrProfile: row.tekrr_profile as TekrrProfile,
    tekrrCompleteness: row.tekrr_completeness as number,
    tekrrFrameworkVersion: row.tekrr_framework_version as string,
    templateId: (row.template_id as string | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export class ActionRepository {
  async create(
    db: Queryable,
    input: {
      actionCode: string;
      actionName: string;
      domain: string;
      customerId: string;
      title: string;
      description?: string;
      templateId: string;
    }
  ): Promise<Action> {
    const result = await db.query(
      `
        INSERT INTO action.actions (
          action_code, action_name, domain, customer_id, title, description, template_id, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
        RETURNING *
      `,
      [
        input.actionCode,
        input.actionName,
        input.domain,
        input.customerId,
        input.title,
        input.description ?? null,
        input.templateId,
      ]
    );
    return mapAction(result.rows[0]);
  }

  async findById(db: Queryable, id: string): Promise<Action | null> {
    const result = await db.query(`SELECT * FROM action.actions WHERE id = $1`, [id]);
    if (result.rowCount === 0) return null;
    return mapAction(result.rows[0]);
  }

  async findByIdForUpdate(db: Queryable, id: string): Promise<Action | null> {
    const result = await db.query(
      `SELECT * FROM action.actions WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (result.rowCount === 0) return null;
    return mapAction(result.rows[0]);
  }

  async listByCustomer(db: Queryable, customerId: string, limit = 50): Promise<Action[]> {
    const result = await db.query(
      `SELECT * FROM action.actions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [customerId, limit]
    );
    return result.rows.map(mapAction);
  }

  async updateTekrr(
    db: Queryable,
    id: string,
    profile: TekrrProfile,
    completeness: number,
    status?: ActionStatus
  ): Promise<Action> {
    const result = await db.query(
      `
        UPDATE action.actions
        SET tekrr_profile = $2,
            tekrr_completeness = $3,
            status = COALESCE($4::action.action_status, status),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [id, JSON.stringify(profile), completeness, status ?? null]
    );
    return mapAction(result.rows[0]);
  }

  async updateDimension(
    db: Queryable,
    id: string,
    dimension: TekrrDimension,
    _data: Record<string, unknown>,
    profile: TekrrProfile,
    completeness: number
  ): Promise<Action> {
    void dimension;
    return this.updateTekrr(db, id, profile, completeness, "tekrr_in_progress");
  }

  async setProvider(
    db: Queryable,
    id: string,
    providerId: string,
    invitedEmail?: string | null
  ): Promise<Action> {
    const result = await db.query(
      `
        UPDATE action.actions
        SET provider_id = $2,
            invited_provider_email = COALESCE($3, invited_provider_email),
            updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [id, providerId, invitedEmail ?? null]
    );
    return mapAction(result.rows[0]);
  }

  async transition(
    db: Queryable,
    id: string,
    toStatus: ActionStatus,
    actorUserId?: string,
    fromStatus?: ActionStatus
  ): Promise<Action | null> {
    const result = await db.query(
      `
        UPDATE action.actions
        SET status = $2::action.action_status, updated_at = now()
        WHERE id = $1 AND ($3::text IS NULL OR status = $3::action.action_status)
        RETURNING *
      `,
      [id, toStatus, fromStatus ?? null]
    );
    if (result.rowCount === 0) return null;
    await db.query(
      `
        INSERT INTO action.action_status_history (action_id, from_status, to_status, actor_user_id)
        VALUES ($1, $3, $2, $4)
      `,
      [id, toStatus, fromStatus ?? null, actorUserId ?? null]
    );
    return mapAction(result.rows[0]);
  }
}

export const actionRepository = new ActionRepository();
