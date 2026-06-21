import { createMarketplaceModule } from "./application/marketplace-service.js";
import { createMarketplaceExperienceModule } from "./application/marketplace-experience-service.js";

export { MARKETPLACE_MODULE } from "./domain/index.js";
export {
  type ProviderCard,
  type RankedMarketplaceResults,
  type MarketplaceResultLimit,
  MARKETPLACE_RESULT_LIMITS,
  normalizeMarketplaceLimit,
  compareProviderCards,
  type ProviderCardView,
  type RankedProviderCardView,
  type MarketplaceResultsView,
  type ProviderSummary,
  type ProviderSummaryAction,
  type ReputationHighlight,
  buildMatchScoreExplanation,
  buildTrustScoreExplanation,
  buildLiveFrameExplanation,
  buildActionConfidenceExplanation,
  buildRankingComparison,
  mapProviderCardToView,
} from "./domain/index.js";
export {
  MarketplaceService,
  createMarketplaceService,
  createMarketplaceModule,
  type MarketplaceProviderRecord,
  type MarketplaceSearchInput,
  type MarketplaceServiceDependencies,
} from "./application/marketplace-service.js";
export {
  MarketplaceExperienceService,
  createMarketplaceExperienceService,
  createMarketplaceExperienceModule,
  type MarketplaceExperienceServiceDependencies,
} from "./application/marketplace-experience-service.js";

export type MarketplaceModule = ReturnType<typeof createMarketplaceModule>;
export type MarketplaceExperienceModule = ReturnType<typeof createMarketplaceExperienceModule>;
