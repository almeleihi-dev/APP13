import type { Queryable } from "../../../shared/db/index.js";
import { platformAnalyticsRepository } from "../../../analytics/infrastructure/platform-analytics-repository.js";
import { discoveryRepository } from "../../../discovery/infrastructure/discovery-repository.js";
import type { MarketplaceIntelligenceRawSnapshot } from "../domain/marketplace-intelligence.js";

export class MarketplaceIntelligenceRepository {
  async loadRawSnapshot(client: Queryable): Promise<MarketplaceIntelligenceRawSnapshot> {
    const [analyticsSnapshot, providers, actionCounts, requests] = await Promise.all([
      platformAnalyticsRepository.loadSnapshot(client),
      discoveryRepository.listDiscoverableProviders(client),
      discoveryRepository.listPublishedActionCounts(client),
      discoveryRepository.listDiscoverableRequests(client),
    ]);

    return {
      analyticsSnapshot,
      providers,
      actionCounts,
      requests,
    };
  }
}

export const marketplaceIntelligenceRepository = new MarketplaceIntelligenceRepository();
