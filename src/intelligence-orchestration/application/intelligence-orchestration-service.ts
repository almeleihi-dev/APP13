import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildOrchestrationHealth,
  buildOrchestrationStatistics,
  toDecisionPipelineView,
  toEngineContributionView,
  toOrchestrationHealthView,
  toOrchestrationStatisticsView,
  toUnifiedSummaryView,
  validateOrchestrationContext,
} from "../domain/orchestration-pipeline.js";
import { buildUnifiedContext } from "../domain/orchestration-context.js";
import {
  collectEngineContributions,
  type OrchestrationEngineDeps,
} from "./orchestration-collector.js";
import {
  createIntelligenceOrchestrationRepository,
  type IntelligenceOrchestrationRepository,
} from "../infrastructure/intelligence-orchestration-repository.js";
import { createPersonalAssistantModule } from "../../personal-assistant/module.js";
import { createDevelopMeModule } from "../../develop-me/module.js";
import { createLearnByActionModule } from "../../learn-by-action/module.js";
import { createExpertNetworkModule } from "../../expert-network/module.js";
import { createTeamBuilderModule } from "../../team-builder/module.js";
import { createKnowledgeBankModule } from "../../knowledge-bank/module.js";
import { createMarketplaceCompilationModule } from "../../marketplace-compilation/module.js";
import { createIntelligentPricingModule } from "../../intelligent-pricing/module.js";
import { createIntelligentCommissionModule } from "../../intelligent-commission/module.js";
import { createActionBlueprintModule } from "../../action-blueprint/module.js";

export class IntelligenceOrchestrationService {
  private readonly repository: IntelligenceOrchestrationRepository;
  private readonly engines: OrchestrationEngineDeps;

  constructor(deps?: {
    repository?: IntelligenceOrchestrationRepository;
    engines?: Partial<OrchestrationEngineDeps>;
  }) {
    this.repository = deps?.repository ?? createIntelligenceOrchestrationRepository();
    const personalAssistant = deps?.engines?.personalAssistant ?? createPersonalAssistantModule().personalAssistant;
    const developMe = deps?.engines?.developMe ?? createDevelopMeModule().developMe;
    const learnByAction = deps?.engines?.learnByAction ?? createLearnByActionModule().learnByAction;
    const expertNetwork = deps?.engines?.expertNetwork ?? createExpertNetworkModule().expertNetwork;
    const teamBuilder = deps?.engines?.teamBuilder ?? createTeamBuilderModule().teamBuilder;
    const knowledgeBank = deps?.engines?.knowledgeBank ?? createKnowledgeBankModule().knowledgeBank;
    const marketplaceCompilation =
      deps?.engines?.marketplaceCompilation ?? createMarketplaceCompilationModule().marketplaceCompilation;
    const intelligentPricing =
      deps?.engines?.intelligentPricing ?? createIntelligentPricingModule().intelligentPricing;
    const intelligentCommission =
      deps?.engines?.intelligentCommission ?? createIntelligentCommissionModule().intelligentCommission;
    const actionBlueprint = deps?.engines?.actionBlueprint ?? createActionBlueprintModule().actionBlueprint;

    this.engines = {
      personalAssistant,
      developMe,
      learnByAction,
      expertNetwork,
      teamBuilder,
      knowledgeBank,
      marketplaceCompilation,
      intelligentPricing,
      intelligentCommission,
      actionBlueprint,
    };
  }

  getOverview(authContext: AuthContext, input?: { listing_id?: string }) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      listingId: input?.listing_id,
    });
    return {
      ...toUnifiedSummaryView(summary),
      explainable: true,
      read_only: true,
    };
  }

  query(
    authContext: AuthContext,
    body: { intent: string; listing_id?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: body.intent,
      listingId: body.listing_id,
      generatedAt: body.generated_at,
      force: Boolean(body.generated_at),
    });
    return toUnifiedSummaryView(summary);
  }

  recommend(
    authContext: AuthContext,
    body?: { intent?: string; listing_id?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: body?.intent,
      listingId: body?.listing_id,
      generatedAt: body?.generated_at,
      force: Boolean(body?.generated_at),
    });
    return {
      recommendation: toUnifiedSummaryView(summary).recommendation,
      confidence: toUnifiedSummaryView(summary).confidence,
      explanation: toUnifiedSummaryView(summary).explanation,
      read_only: true,
      generated_at: summary.generatedAt,
    };
  }

  plan(
    authContext: AuthContext,
    body?: { intent?: string; listing_id?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: body?.intent ?? "What is my development plan?",
      listingId: body?.listing_id,
      generatedAt: body?.generated_at,
      force: Boolean(body?.generated_at),
    });
    return {
      unified_development_plan: summary.recommendation.unifiedDevelopmentPlan,
      unified_learning_recommendation: summary.recommendation.unifiedLearningRecommendation,
      next_step: summary.recommendation.nextStep,
      explanation: toUnifiedSummaryView(summary).explanation,
      read_only: true,
      generated_at: summary.generatedAt,
    };
  }

  explain(
    authContext: AuthContext,
    body?: { intent?: string; listing_id?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: body?.intent,
      listingId: body?.listing_id,
      generatedAt: body?.generated_at,
      force: Boolean(body?.generated_at),
    });
    return {
      explanation: toUnifiedSummaryView(summary).explanation,
      pipeline: toDecisionPipelineView(summary.pipeline),
      read_only: true,
      generated_at: summary.generatedAt,
    };
  }

  getContributions(
    authContext: AuthContext,
    query?: { intent?: string; listing_id?: string }
  ) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: query?.intent,
      listingId: query?.listing_id,
    });
    return {
      contributions: summary.contributions.map(toEngineContributionView),
      count: summary.contributions.filter((entry) => entry.contributed).length,
      generated_at: summary.generatedAt,
    };
  }

  getPipeline(authContext: AuthContext, query?: { intent?: string; listing_id?: string }) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: query?.intent,
      listingId: query?.listing_id,
    });
    return toDecisionPipelineView(summary.pipeline);
  }

  refresh(
    authContext: AuthContext,
    body?: { intent?: string; listing_id?: string; generated_at?: string }
  ) {
    this.assertAuthenticated(authContext);
    const context = buildUnifiedContext({
      authContext,
      intent: body?.intent,
      listingId: body?.listing_id,
      generatedAt: body?.generated_at,
    });
    const validation = validateOrchestrationContext(context);
    const summary = this.repository.orchestrate({
      authContext,
      engines: this.engines,
      intent: body?.intent,
      listingId: body?.listing_id,
      generatedAt: body?.generated_at,
      force: true,
    });
    return {
      summary: toUnifiedSummaryView(summary),
      validation: {
        valid: validation.valid,
        orchestration_ready: validation.orchestrationReady,
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
    const stats = buildOrchestrationStatistics(this.repository.listSummaries());
    return toOrchestrationStatisticsView(stats);
  }

  getHealth(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    const latest = this.repository.listSummaries()[0];
    const contributions =
      latest?.contributions ??
      collectEngineContributions({
        authContext,
        context: buildUnifiedContext({ authContext }),
        engines: this.engines,
      });
    return toOrchestrationHealthView(buildOrchestrationHealth(contributions));
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createIntelligenceOrchestrationService(deps?: {
  repository?: IntelligenceOrchestrationRepository;
  engines?: Partial<OrchestrationEngineDeps>;
}): IntelligenceOrchestrationService {
  return new IntelligenceOrchestrationService(deps);
}

export interface IntelligenceOrchestrationModule {
  intelligenceOrchestration: IntelligenceOrchestrationService;
}

export function createIntelligenceOrchestrationModule(deps?: {
  repository?: IntelligenceOrchestrationRepository;
  engines?: Partial<OrchestrationEngineDeps>;
}): IntelligenceOrchestrationModule {
  const intelligenceOrchestration = createIntelligenceOrchestrationService(deps);
  return { intelligenceOrchestration };
}
