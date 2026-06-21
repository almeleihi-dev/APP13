import type { DbPool } from "../../shared/db/index.js";
import type { SecurityRole } from "../types.js";

export class UserRoleRepository {
  constructor(private readonly db: DbPool) {}

  async grant(userId: string, role: SecurityRole): Promise<void> {
    await this.db.query(
      `
        INSERT INTO identity.user_roles (user_id, role)
        VALUES ($1, $2)
        ON CONFLICT (user_id, role) DO UPDATE
        SET revoked_at = NULL, granted_at = now()
      `,
      [userId, role]
    );
  }

  async listActive(userId: string): Promise<SecurityRole[]> {
    const result = await this.db.query<{ role: SecurityRole }>(
      `
        SELECT role FROM identity.user_roles
        WHERE user_id = $1 AND revoked_at IS NULL
        ORDER BY granted_at ASC
      `,
      [userId]
    );
    return result.rows.map((row) => row.role);
  }
}
