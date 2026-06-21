export const MARKETPLACE_APPLICATION = "marketplace.application" as const;
export {
  MarketplaceService,
  createMarketplaceService,
  createMarketplaceModule,
  type MarketplaceProviderRecord,
  type MarketplaceSearchInput,
  type MarketplaceServiceDependencies,
  type MarketplaceModule,
} from "./marketplace-service.js";
