import type { Queryable } from "../../../shared/db/index.js";
import { adminConsoleRepository } from "../../../operations/infrastructure/admin-console-repository.js";
import { platformAnalyticsRepository } from "../../../analytics/infrastructure/platform-analytics-repository.js";
import type { PlatformTrustContext } from "../domain/live-frame-experience.js";

export class LiveFrameExperienceRepository {
  async getPlatformTrustContext(client: Queryable): Promise<PlatformTrustContext> {
    const [operationsTrust, analyticsSnapshot] = await Promise.all([
      adminConsoleRepository.getTrustMetrics(client),
      platformAnalyticsRepository.loadSnapshot(client),
    ]);

    return {
      providersWithScores: operationsTrust.providersWithScores,
      averageTrustScore: operationsTrust.averageTrustScore,
      lowTrustProviderCount: operationsTrust.lowTrustProviderCount,
      tierDistribution: operationsTrust.frameTierDistribution.map((entry) => ({
        tier: entry.status,
        count: entry.count,
      })),
      trustEventsLast7Days: analyticsSnapshot.trust.trustEvents.last7Days,
      trustEventsLast30Days: analyticsSnapshot.trust.trustEvents.last30Days,
    };
  }
}

export const liveFrameExperienceRepository = new LiveFrameExperienceRepository();
