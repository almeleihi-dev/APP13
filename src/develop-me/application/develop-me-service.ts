import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildDevelopmentStatistics,
  toDevelopmentProfileView,
  toDevelopmentRoadmapView,
  toDevelopmentStatisticsView,
  toGapRadarView,
  toIncomeRadarView,
  toMarketRadarView,
  toOpportunityRadarView,
  toReadinessScoreView,
  validateDevelopmentContext,
  type DevelopmentProfile,
} from "../domain/development-profile.js";
import { buildDevelopmentContext } from "../domain/development-context.js";
import {
  createDevelopMeRepository,
  type DevelopMeRepository,
} from "../infrastructure/develop-me-repository.js";

export class DevelopMeService {
  private readonly repository: DevelopMeRepository;

  constructor(deps?: { repository?: DevelopMeRepository }) {
    this.repository = deps?.repository ?? createDevelopMeRepository();
  }

  getOverview(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return {
      ...toDevelopmentProfileView(profile),
      explainable: true,
      read_only: true,
    };
  }

  getProfile(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toDevelopmentProfileView(profile);
  }

  getGapRadar(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toGapRadarView(profile.gapRadar);
  }

  getMarketRadar(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toMarketRadarView(profile.marketRadar);
  }

  getIncomeRadar(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toIncomeRadarView(profile.incomeRadar);
  }

  getOpportunities(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toOpportunityRadarView(profile.opportunityRadar);
  }

  getReadiness(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toReadinessScoreView(profile.readiness);
  }

  getRoadmap(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const profile = this.repository.getOrRefreshProfile(authContext);
    return toDevelopmentRoadmapView(profile.roadmap);
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    this.assertAuthenticated(authContext);
    const context = buildDevelopmentContext({
      authContext,
      generatedAt: input?.generated_at,
    });
    const validation = validateDevelopmentContext(context);
    const profile = this.repository.refreshProfile(authContext, input?.generated_at);
    return {
      profile: toDevelopmentProfileView(profile),
      validation: {
        valid: validation.valid,
        guidance_ready: validation.guidanceReady,
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
    const profiles = this.repository.listProfiles();
    const stats = buildDevelopmentStatistics(profiles);
    return toDevelopmentStatisticsView(stats);
  }

  getFullProfile(authContext: AuthContext): DevelopmentProfile {
    this.assertAuthenticated(authContext);
    return this.repository.getOrRefreshProfile(authContext);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createDevelopMeService(deps?: {
  repository?: DevelopMeRepository;
}): DevelopMeService {
  return new DevelopMeService(deps);
}

export interface DevelopMeModule {
  developMe: DevelopMeService;
}

export function createDevelopMeModule(deps?: {
  repository?: DevelopMeRepository;
}): DevelopMeModule {
  const repository = deps?.repository ?? createDevelopMeRepository();
  const developMe = createDevelopMeService({ repository });
  return { developMe };
}
