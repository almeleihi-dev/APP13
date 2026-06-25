import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildExpertContributions,
  buildExpertNetworkStatistics,
  buildExpertProfile,
  buildExpertRecommendations,
  toExpertCapabilityView,
  toExpertContributionView,
  toExpertImpactView,
  toExpertNetworkStatisticsView,
  toExpertNetworkSummaryView,
  toExpertProfileView,
  toExpertRecommendationView,
  toExpertVisibilityView,
  toRoleCatalogView,
  validateExpertNetwork,
} from "../domain/expert-network-profile.js";
import { buildExpertNetworkContext } from "../domain/expert-network-context.js";
import { getSeedExpertById } from "../domain/expert-network-seed.js";
import {
  createExpertNetworkRepository,
  type ExpertNetworkRepository,
} from "../infrastructure/expert-network-repository.js";

export class ExpertNetworkService {
  private readonly repository: ExpertNetworkRepository;

  constructor(deps?: { repository?: ExpertNetworkRepository }) {
    this.repository = deps?.repository ?? createExpertNetworkRepository();
  }

  getOverview(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext);
    return {
      ...toExpertNetworkSummaryView(summary),
      explainable: true,
      read_only: true,
    };
  }

  listExperts(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext);
    const context = buildExpertNetworkContext({ authContext });
    return {
      experts: context.experts.map((expert) => toExpertProfileView(buildExpertProfile(expert))),
      count: context.experts.length,
      generated_at: summary.generatedAt,
    };
  }

  getExpert(authContext: AuthContext, expertId: string) {
    this.assertAuthenticated(authContext);
    const decodedId = decodeURIComponent(expertId);
    const expert = getSeedExpertById(decodedId, authContext.userId);
    if (!expert) {
      return null;
    }
    return toExpertProfileView(buildExpertProfile(expert));
  }

  getRoles(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = buildExpertNetworkContext({ authContext });
    return toRoleCatalogView(context.experts);
  }

  getCapabilities(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = buildExpertNetworkContext({ authContext });
    const capabilities = context.experts.flatMap((expert) =>
      buildExpertProfile(expert).capabilities.map(toExpertCapabilityView)
    );
    return {
      capabilities,
      count: capabilities.length,
      generated_at: context.generatedAt,
    };
  }

  getImpact(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = buildExpertNetworkContext({ authContext });
    const impacts = context.experts.map((expert) => toExpertImpactView(buildExpertProfile(expert).impact));
    const totalLearners = impacts.reduce((sum, impact) => sum + impact.learners_trained, 0);
    return {
      impacts,
      aggregate: {
        total_learners_trained: totalLearners,
        total_experts: impacts.length,
        average_impact_score:
          impacts.length === 0
            ? 0
            : Math.round(impacts.reduce((sum, i) => sum + i.impact_score, 0) / impacts.length),
      },
      generated_at: context.generatedAt,
    };
  }

  getRecommendations(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext);
    const context = buildExpertNetworkContext({ authContext });
    const recommendations = buildExpertRecommendations(context);
    return {
      recommendations: recommendations.map(toExpertRecommendationView),
      count: recommendations.length,
      generated_at: summary.generatedAt,
    };
  }

  getVisibility(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = buildExpertNetworkContext({ authContext });
    return {
      experts: context.experts.map((expert) =>
        toExpertVisibilityView(buildExpertProfile(expert).visibility)
      ),
      count: context.experts.length,
      generated_at: context.generatedAt,
    };
  }

  getContributions(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const context = buildExpertNetworkContext({ authContext });
    const contributions = buildExpertContributions(context.experts);
    return {
      contributions: contributions.map(toExpertContributionView),
      count: contributions.length,
      generated_at: context.generatedAt,
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const context = buildExpertNetworkContext({
      authContext,
      generatedAt: input?.generated_at,
    });
    const validation = validateExpertNetwork(context);
    const summary = this.repository.refreshSummary(authContext, input?.generated_at);
    return {
      summary: toExpertNetworkSummaryView(summary),
      validation: {
        valid: validation.valid,
        network_ready: validation.networkReady,
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.summary,
      },
      refreshed: true,
      read_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    const context = buildExpertNetworkContext({ authContext });
    const stats = buildExpertNetworkStatistics(context.experts);
    return toExpertNetworkStatisticsView(stats);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createExpertNetworkService(deps?: {
  repository?: ExpertNetworkRepository;
}): ExpertNetworkService {
  return new ExpertNetworkService(deps);
}

export interface ExpertNetworkModule {
  expertNetwork: ExpertNetworkService;
}

export function createExpertNetworkModule(deps?: {
  repository?: ExpertNetworkRepository;
}): ExpertNetworkModule {
  const repository = deps?.repository ?? createExpertNetworkRepository();
  const expertNetwork = createExpertNetworkService({ repository });
  return { expertNetwork };
}
