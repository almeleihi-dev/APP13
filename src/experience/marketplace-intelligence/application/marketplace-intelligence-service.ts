import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildMarketplaceIntelligence,
  buildMarketplaceIntelligenceSnapshot,
  toDemandAnalyticsView,
  toMarketplaceHealthAnalyticsView,
  toMarketplaceIntelligenceView,
  toOpportunityInsightsView,
  toPricingAnalyticsView,
  toSupplyAnalyticsView,
  type DemandAnalyticsView,
  type MarketplaceHealthAnalyticsView,
  type MarketplaceIntelligenceView,
  type OpportunityInsightsView,
  type PricingAnalyticsView,
  type SupplyAnalyticsView,
} from "../domain/marketplace-intelligence.js";
import {
  MarketplaceIntelligenceRepository,
  marketplaceIntelligenceRepository,
} from "../infrastructure/marketplace-intelligence-repository.js";

export class MarketplaceIntelligenceService {
  private readonly repository: MarketplaceIntelligenceRepository;

  constructor(
    private readonly db: DbPool,
    repository?: MarketplaceIntelligenceRepository
  ) {
    this.repository = repository ?? marketplaceIntelligenceRepository;
  }

  async getMarketplaceIntelligence(authContext: AuthContext): Promise<MarketplaceIntelligenceView> {
    this.assertAdminAccess(authContext);
    const intelligence = await this.buildIntelligence();
    return toMarketplaceIntelligenceView(intelligence);
  }

  async getDemandAnalytics(authContext: AuthContext): Promise<DemandAnalyticsView> {
    this.assertAdminAccess(authContext);
    const intelligence = await this.buildIntelligence();
    return toDemandAnalyticsView(intelligence.demand);
  }

  async getSupplyAnalytics(authContext: AuthContext): Promise<SupplyAnalyticsView> {
    this.assertAdminAccess(authContext);
    const intelligence = await this.buildIntelligence();
    return toSupplyAnalyticsView(intelligence.supply);
  }

  async getPricingAnalytics(authContext: AuthContext): Promise<PricingAnalyticsView> {
    this.assertAdminAccess(authContext);
    const intelligence = await this.buildIntelligence();
    return toPricingAnalyticsView(intelligence.pricing);
  }

  async getMarketplaceHealth(authContext: AuthContext): Promise<MarketplaceHealthAnalyticsView> {
    this.assertAdminAccess(authContext);
    const intelligence = await this.buildIntelligence();
    return toMarketplaceHealthAnalyticsView(intelligence.health);
  }

  async getOpportunityInsights(authContext: AuthContext): Promise<OpportunityInsightsView> {
    this.assertAdminAccess(authContext);
    const intelligence = await this.buildIntelligence();
    return toOpportunityInsightsView(intelligence.opportunities);
  }

  private async buildIntelligence() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildMarketplaceIntelligenceSnapshot({ raw });
    return buildMarketplaceIntelligence({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createMarketplaceIntelligenceService(
  db: DbPool,
  repository?: MarketplaceIntelligenceRepository
): MarketplaceIntelligenceService {
  return new MarketplaceIntelligenceService(db, repository);
}

export function createMarketplaceIntelligenceModule(
  db: DbPool,
  deps?: { repository?: MarketplaceIntelligenceRepository }
) {
  const marketplaceIntelligence = createMarketplaceIntelligenceService(db, deps?.repository);

  return {
    marketplaceIntelligence,
  };
}

export type MarketplaceIntelligenceModule = ReturnType<typeof createMarketplaceIntelligenceModule>;
