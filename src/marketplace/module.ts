import { createMarketplaceModule } from "./application/marketplace-service.js";

export { MARKETPLACE_MODULE } from "./domain/index.js";
export {
  type ProviderCard,
  type RankedMarketplaceResults,
  type MarketplaceResultLimit,
  MARKETPLACE_RESULT_LIMITS,
  normalizeMarketplaceLimit,
  compareProviderCards,
} from "./domain/provider-card.js";
export {
  MarketplaceService,
  createMarketplaceService,
  createMarketplaceModule,
  type MarketplaceProviderRecord,
  type MarketplaceSearchInput,
  type MarketplaceServiceDependencies,
} from "./application/marketplace-service.js";

export type MarketplaceModule = ReturnType<typeof createMarketplaceModule>;
