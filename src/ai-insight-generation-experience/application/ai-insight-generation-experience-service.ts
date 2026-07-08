import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiAdaptiveCoachingExperienceService,
  type AiAdaptiveCoachingExperienceService,
} from "../../ai-adaptive-coaching-experience/application/ai-adaptive-coaching-experience-service.js";
import {
  AI_INSIGHT_GENERATION_EXPERIENCE_JSON_SCHEMA,
  AI_INSIGHT_GENERATION_EXPERIENCE_ROUTES,
  AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
  type InsightGenerationScenarioId,
} from "../domain/ai-insight-generation-experience-schema.js";
import type { AiInsightGenerationExperienceContext } from "../domain/ai-insight-generation-experience-context.js";
import {
  buildAiInsightGenerationExperienceHome,
  buildAiInsightGenerationExperienceSummary,
  toInsightGenerationContextScreen,
  toInsightGenerationDomainScreen,
  toInsightGenerationExplanationScreen,
  toInsightGenerationSummaryScreen,
  toInsightGenerationValidationScreen,
} from "../domain/ai-insight-generation-experience-screens.js";
import {
  createInsightContextBuilder,
  createGeneratedInsightsBuilder,
  createPatternDetectionBuilder,
  createKeyFindingsBuilder,
  createOpportunityAnalysisBuilder,
  createRiskAnalysisBuilder,
  createStrategicInsightsBuilder,
  createInsightReadinessBuilder,
  createDelegationInsightGenerationBuilder,
  createInsightGenerationConfidenceBuilder,
  createInsightExplanationBuilder,
} from "./ai-insight-generation-experience-builder.js";
import { createAiInsightGenerationExperienceValidator } from "./ai-insight-generation-experience-validator.js";
import {
  createAiInsightGenerationExperienceRepository,
  type AiInsightGenerationExperienceRepository,
} from "../infrastructure/ai-insight-generation-experience-repository.js";

export interface AiInsightGenerationExperienceQuery {
  scenario_id?: InsightGenerationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiInsightGenerationExperienceService {
  private readonly repository: AiInsightGenerationExperienceRepository;
  private readonly aiAdaptiveCoachingExperience: AiAdaptiveCoachingExperienceService;
  private readonly contextBuilder = createInsightContextBuilder();
  private readonly insightsBuilder = createGeneratedInsightsBuilder();
  private readonly patternsBuilder = createPatternDetectionBuilder();
  private readonly findingsBuilder = createKeyFindingsBuilder();
  private readonly opportunitiesBuilder = createOpportunityAnalysisBuilder();
  private readonly risksBuilder = createRiskAnalysisBuilder();
  private readonly strategicBuilder = createStrategicInsightsBuilder();
  private readonly readinessBuilder = createInsightReadinessBuilder();
  private readonly delegationBuilder = createDelegationInsightGenerationBuilder();
  private readonly confidenceBuilder = createInsightGenerationConfidenceBuilder();
  private readonly explanationBuilder = createInsightExplanationBuilder();
  private readonly validator = createAiInsightGenerationExperienceValidator();

  constructor(deps?: {
    repository?: AiInsightGenerationExperienceRepository;
    aiAdaptiveCoachingExperience?: AiAdaptiveCoachingExperienceService;
  }) {
    this.aiAdaptiveCoachingExperience =
      deps?.aiAdaptiveCoachingExperience ?? createAiAdaptiveCoachingExperienceService();
    this.repository =
      deps?.repository ??
      createAiInsightGenerationExperienceRepository({
        aiAdaptiveCoachingExperience: this.aiAdaptiveCoachingExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const coachingHome = this.aiAdaptiveCoachingExperience.getHome(authContext);
    return buildAiInsightGenerationExperienceHome({ scenarios: coachingHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightGenerationContextScreen(this.buildOutput(authContext, query));
  }

  getInsights(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.generatedInsights);
  }

  getPatterns(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.patternDetection);
  }

  getFindings(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.keyFindings);
  }

  getOpportunities(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.opportunityAnalysis);
  }

  getRisks(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.riskAnalysis);
  }

  getStrategic(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.strategicInsights);
  }

  getReadiness(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.insightReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationDomainScreen(output, output.delegationInsightGeneration);
  }

  getExplanation(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightGenerationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightGenerationSummaryScreen(buildAiInsightGenerationExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiInsightGenerationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toInsightGenerationValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toInsightGenerationValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_INSIGHT_GENERATION_EXPERIENCE_ROUTES,
      json_schema: AI_INSIGHT_GENERATION_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiInsightGenerationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiInsightGenerationExperienceQuery) {
    const context = toContext(query);
    const coachingQuery = toAdaptiveCoachingQuery(query);
    const { adaptiveCoaching } = this.repository.resolveUpstream(
      authContext,
      context,
      coachingQuery
    );

    const insightContext = this.contextBuilder.build(adaptiveCoaching);
    const generatedInsights = this.insightsBuilder.build(adaptiveCoaching);
    const patternDetection = this.patternsBuilder.build(adaptiveCoaching);
    const keyFindings = this.findingsBuilder.build(adaptiveCoaching);
    const opportunityAnalysis = this.opportunitiesBuilder.build(adaptiveCoaching);
    const riskAnalysis = this.risksBuilder.build(adaptiveCoaching);
    const strategicInsights = this.strategicBuilder.build(adaptiveCoaching);
    const insightReadiness = this.readinessBuilder.build(adaptiveCoaching);
    const delegationInsightGeneration = this.delegationBuilder.build(adaptiveCoaching);
    const insightGenerationConfidence = this.confidenceBuilder.build(
      adaptiveCoaching,
      insightReadiness.readinessScore
    );

    const outputId = `insight-generation-${adaptiveCoaching.outputId}`;

    const insightExplanation = this.explanationBuilder.build({
      outputId,
      goal: adaptiveCoaching.goal,
      generatedInsights,
      keyFindings,
      readiness: insightReadiness,
      insightGenerationConfidenceScore: insightGenerationConfidence.score,
    });

    return {
      outputId,
      adaptiveCoachingOutputId: adaptiveCoaching.outputId,
      progressIntelligenceOutputId: adaptiveCoaching.progressIntelligenceOutputId,
      executionCompanionOutputId: adaptiveCoaching.executionCompanionOutputId,
      actionPlanningOutputId: adaptiveCoaching.actionPlanningOutputId,
      decisionSupportOutputId: adaptiveCoaching.decisionSupportOutputId,
      guidanceOutputId: adaptiveCoaching.guidanceOutputId,
      conversationOutputId: adaptiveCoaching.conversationOutputId,
      foundationOutputId: adaptiveCoaching.foundationOutputId,
      closureOutputId: adaptiveCoaching.closureOutputId,
      canonicalActionId: adaptiveCoaching.canonicalActionId,
      scenarioId: adaptiveCoaching.scenarioId,
      goal: adaptiveCoaching.goal,
      insightContext,
      generatedInsights,
      patternDetection,
      keyFindings,
      opportunityAnalysis,
      riskAnalysis,
      strategicInsights,
      insightReadiness,
      delegationInsightGeneration,
      insightGenerationConfidence,
      insightExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiInsightGenerationExperienceQuery): AiInsightGenerationExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toAdaptiveCoachingQuery(query: AiInsightGenerationExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiInsightGenerationExperienceService(
  deps?: ConstructorParameters<typeof AiInsightGenerationExperienceService>[0]
): AiInsightGenerationExperienceService {
  return new AiInsightGenerationExperienceService(deps);
}

export function createAiInsightGenerationExperienceModule(deps?: {
  repository?: AiInsightGenerationExperienceRepository;
  aiAdaptiveCoachingExperience?: AiAdaptiveCoachingExperienceService;
}) {
  const aiAdaptiveCoachingExperience =
    deps?.aiAdaptiveCoachingExperience ?? createAiAdaptiveCoachingExperienceService();
  const aiInsightGenerationExperience = createAiInsightGenerationExperienceService({
    aiAdaptiveCoachingExperience,
    repository:
      deps?.repository ??
      createAiInsightGenerationExperienceRepository({ aiAdaptiveCoachingExperience }),
  });
  return { aiInsightGenerationExperience };
}

export type AiInsightGenerationExperienceModule = ReturnType<
  typeof createAiInsightGenerationExperienceModule
>;
