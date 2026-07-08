import type { DbPool } from "../../src/shared/db/index.js";
import { resetContractEngineData } from "./postgres-integration.js";

export async function resetS3TrustData(db: DbPool): Promise<void> {
  await db.query(`
    TRUNCATE TABLE
      trust.trust_score_event_corrections,
      trust.trust_score_snapshots,
      trust.trust_score_events,
      trust.trust_scores
    RESTART IDENTITY CASCADE
  `);
  await resetContractEngineData(db);
}
