import type { Queryable } from "../../../shared/db/index.js";
import { liveFrameExperienceRepository } from "../../live-frame/infrastructure/live-frame-experience-repository.js";
import type { TrustReputationSnapshot } from "../domain/trust-reputation-experience.js";

export class TrustReputationRepository {
  async loadSnapshot(
    client: Queryable,
    userId: string,
    input: {
      profile: TrustReputationSnapshot["profile"];
      history: TrustReputationSnapshot["history"];
      verificationTier: string;
    }
  ): Promise<TrustReputationSnapshot> {
    const [platformContext, inboxTrustEvents] = await Promise.all([
      liveFrameExperienceRepository.getPlatformTrustContext(client),
      this.listInboxTrustEvents(client, userId),
    ]);

    return {
      profile: input.profile,
      history: input.history,
      platformContext,
      verificationTier: input.verificationTier,
      inboxTrustEvents,
    };
  }

  private async listInboxTrustEvents(client: Queryable, userId: string) {
    const result = await client.query<{
      id: string;
      event_type: string;
      title: string;
      body: string;
      created_at: Date;
    }>(
      `
        SELECT id, event_type, title, body, created_at
        FROM experience.event_inbox
        WHERE user_id = $1
          AND category = 'trust'
          AND created_at >= now() - interval '30 days'
        ORDER BY created_at DESC
        LIMIT 100
      `,
      [userId]
    );

    return result.rows.map((row) => ({
      eventId: row.id,
      eventType: row.event_type,
      title: row.title,
      description: row.body,
      occurredAt: row.created_at,
    }));
  }
}

export const trustReputationRepository = new TrustReputationRepository();
