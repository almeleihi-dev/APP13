import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import type { TrustScoreService } from "../../../trust/application/trust-score-service.js";
import {
  buildActionEconomyExperience,
  toActionDemandSummaryView,
  toActionEconomyExperienceView,
  toActionOpportunityView,
  toActionPerformanceSummaryView,
  toActionPortfolioView,
  toEarningsPotentialView,
  toRecommendedActionView,
  type ActionDemandSummaryView,
  type ActionEconomyExperienceView,
  type ActionOpportunityView,
  type ActionPerformanceSummaryView,
  type ActionPortfolioView,
  type EarningsPotentialView,
  type RecommendedActionView,
} from "../domain/action-economy.js";
import {
  ActionEconomyRepository,
  actionEconomyRepository,
} from "../infrastructure/action-economy-repository.js";

export class ActionEconomyService {
  private readonly repository: ActionEconomyRepository;

  constructor(
    private readonly db: DbPool,
    private readonly deps: {
      trustScore: TrustScoreService;
    },
    repository?: ActionEconomyRepository
  ) {
    this.repository = repository ?? actionEconomyRepository;
  }

  async getActionEconomy(authContext: AuthContext): Promise<ActionEconomyExperienceView> {
    const experience = await this.buildExperience(authContext);
    return toActionEconomyExperienceView(experience);
  }

  async getActions(authContext: AuthContext): Promise<ActionPortfolioView> {
    const experience = await this.buildExperience(authContext);
    return toActionPortfolioView(experience.portfolio);
  }

  async getOpportunities(authContext: AuthContext): Promise<{
    opportunities: ActionOpportunityView[];
    demand: ActionDemandSummaryView[];
    growth_opportunities: ActionDemandSummaryView[];
    recommended_actions: RecommendedActionView[];
  }> {
    const experience = await this.buildExperience(authContext);
    return {
      opportunities: experience.opportunities.map(toActionOpportunityView),
      demand: experience.demand.map(toActionDemandSummaryView),
      growth_opportunities: experience.growthOpportunities.map(toActionDemandSummaryView),
      recommended_actions: experience.recommendedActions.map(toRecommendedActionView),
    };
  }

  async getEarnings(authContext: AuthContext): Promise<{
    earnings: EarningsPotentialView;
    performance: ActionPerformanceSummaryView[];
  }> {
    const experience = await this.buildExperience(authContext);
    return {
      earnings: toEarningsPotentialView(experience.earnings),
      performance: experience.performance.map(toActionPerformanceSummaryView),
    };
  }

  private async buildExperience(authContext: AuthContext) {
    const trustProfile = await this.deps.trustScore.getProfileByUserId(authContext.userId);
    const snapshot = await this.repository.loadSnapshot(
      this.db.pool,
      authContext.userId,
      trustProfile?.trust_score ?? null
    );
    if (!snapshot) {
      throw notFound("Provider profile required for action economy experience");
    }

    return buildActionEconomyExperience({ snapshot });
  }
}

export function createActionEconomyService(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
  },
  repository?: ActionEconomyRepository
): ActionEconomyService {
  return new ActionEconomyService(db, deps, repository);
}

export function createActionEconomyModule(
  db: DbPool,
  deps: {
    trustScore: TrustScoreService;
    repository?: ActionEconomyRepository;
  }
) {
  const actionEconomy = createActionEconomyService(
    db,
    { trustScore: deps.trustScore },
    deps.repository
  );

  return {
    actionEconomy,
  };
}

export type ActionEconomyModule = ReturnType<typeof createActionEconomyModule>;
