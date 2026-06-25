import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildTeamBuilderStatistics,
  buildTeamProfile,
  toTeamBuilderStatisticsView,
  toTeamCompatibilityView,
  toTeamCoverageView,
  toTeamMemberView,
  toTeamReadinessView,
  toTeamRecommendationView,
  toTeamRiskView,
  toTeamSummaryView,
  validateTeamBuilderContext,
} from "../domain/team-builder-profile.js";
import { buildTeamBuilderContext } from "../domain/team-builder-context.js";
import {
  createTeamBuilderRepository,
  type TeamBuilderRepository,
} from "../infrastructure/team-builder-repository.js";

export class TeamBuilderService {
  private readonly repository: TeamBuilderRepository;

  constructor(deps?: { repository?: TeamBuilderRepository }) {
    this.repository = deps?.repository ?? createTeamBuilderRepository();
  }

  getOverview(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext, listingId);
    return {
      ...toTeamSummaryView(summary),
      recommendation: toTeamRecommendationView(summary.recommendation),
      explainable: true,
      read_only: true,
    };
  }

  getRecommendations(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext, listingId);
    return {
      recommendation: toTeamRecommendationView(summary.recommendation),
      generated_at: summary.generatedAt,
    };
  }

  getReadiness(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const context = buildTeamBuilderContext({ authContext, listingId });
    const profile = buildTeamProfile(context);
    return {
      readiness: toTeamReadinessView(profile.readiness),
      generated_at: context.generatedAt,
    };
  }

  getCompatibility(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const context = buildTeamBuilderContext({ authContext, listingId });
    const profile = buildTeamProfile(context);
    return {
      compatibility: toTeamCompatibilityView(profile.compatibility),
      generated_at: context.generatedAt,
    };
  }

  getMembers(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext, listingId);
    return {
      members: summary.recommendation.members.map(toTeamMemberView),
      team_leader: toTeamMemberView(summary.recommendation.teamLeader),
      count: summary.recommendation.members.length,
      generated_at: summary.generatedAt,
    };
  }

  getCoverage(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const context = buildTeamBuilderContext({ authContext, listingId });
    const profile = buildTeamProfile(context);
    return {
      coverage: toTeamCoverageView(profile.coverage),
      generated_at: context.generatedAt,
    };
  }

  getRisks(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const context = buildTeamBuilderContext({ authContext, listingId });
    const profile = buildTeamProfile(context);
    return {
      risks: profile.risks.map(toTeamRiskView),
      count: profile.risks.length,
      generated_at: context.generatedAt,
    };
  }

  getSummary(authContext: AuthContext, listingId?: string) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getOrRefreshSummary(authContext, listingId);
    return {
      summary: toTeamSummaryView(summary),
      recommendation: toTeamRecommendationView(summary.recommendation),
      generated_at: summary.generatedAt,
    };
  }

  refresh(
    authContext: AuthContext,
    input?: { listing_id?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const context = buildTeamBuilderContext({
      authContext,
      listingId: input?.listing_id,
      generatedAt: input?.generated_at,
    });
    const validation = validateTeamBuilderContext(context);
    const summary = this.repository.refreshSummary(authContext, {
      listingId: context.listing.id,
      generatedAt: input?.generated_at,
    });
    return {
      summary: toTeamSummaryView(summary),
      recommendation: toTeamRecommendationView(summary.recommendation),
      validation: {
        valid: validation.valid,
        team_ready: validation.teamReady,
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
    const stats = buildTeamBuilderStatistics(this.repository.listSummaries());
    return toTeamBuilderStatisticsView(stats);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createTeamBuilderService(deps?: {
  repository?: TeamBuilderRepository;
}): TeamBuilderService {
  return new TeamBuilderService(deps);
}

export interface TeamBuilderModule {
  teamBuilder: TeamBuilderService;
}

export function createTeamBuilderModule(deps?: {
  repository?: TeamBuilderRepository;
}): TeamBuilderModule {
  const repository = deps?.repository ?? createTeamBuilderRepository();
  const teamBuilder = createTeamBuilderService({ repository });
  return { teamBuilder };
}
