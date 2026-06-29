import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiInsightGenerationExperienceService,
  type AiInsightGenerationExperienceService,
} from "../../ai-insight-generation-experience/application/ai-insight-generation-experience-service.js";
import {
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_ROUTES,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  type RecommendationIntelligenceScenarioId,
} from "../domain/ai-recommendation-intelligence-experience-schema.js";
import type { AiRecommendationIntelligenceExperienceContext } from "../domain/ai-recommendation-intelligence-experience-context.js";
import {
  buildAiRecommendationIntelligenceExperienceHome,
  buildAiRecommendationIntelligenceExperienceSummary,
  toRecommendationIntelligenceContextScreen,
  toRecommendationIntelligenceDomainScreen,
  toRecommendationIntelligenceExplanationScreen,
  toRecommendationIntelligenceSummaryScreen,
  toRecommendationIntelligenceValidationScreen,
} from "../domain/ai-recommendation-intelligence-experience-screens.js";
import {
  createRecommendationContextBuilder,
  createPersonalizedRecommendationsBuilder,
  createPriorityRecommendationsBuilder,
  createOpportunityRecommendationsBuilder,
  createRiskMitigationRecommendationsBuilder,
  createStrategicRecommendationsBuilder,
  createRecommendationConfidenceBuilder,
  createRecommendationReadinessBuilder,
  createDelegationRecommendationIntelligenceBuilder,
  createRecommendationExplanationBuilder,
} from "./ai-recommendation-intelligence-experience-builder.js";
import { createAiRecommendationIntelligenceExperienceValidator } from "./ai-recommendation-intelligence-experience-validator.js";
import {
  createAiRecommendationIntelligenceExperienceRepository,
  type AiRecommendationIntelligenceExperienceRepository,
} from "../infrastructure/ai-recommendation-intelligence-experience-repository.js";

export interface AiRecommendationIntelligenceExperienceQuery {
  scenario_id?: RecommendationIntelligenceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiRecommendationIntelligenceExperienceService {
  private readonly repository: AiRecommendationIntelligenceExperienceRepository;
  private readonly aiInsightGenerationExperience: AiInsightGenerationExperienceService;
  private readonly contextBuilder = createRecommendationContextBuilder();
  private readonly personalizedBuilder = createPersonalizedRecommendationsBuilder();
  private readonly priorityBuilder = createPriorityRecommendationsBuilder();
  private readonly opportunitiesBuilder = createOpportunityRecommendationsBuilder();
  private readonly mitigationBuilder = createRiskMitigationRecommendationsBuilder();
  private readonly strategicBuilder = createStrategicRecommendationsBuilder();
  private readonly confidenceBuilder = createRecommendationConfidenceBuilder();
  private readonly readinessBuilder = createRecommendationReadinessBuilder();
  private readonly delegationBuilder = createDelegationRecommendationIntelligenceBuilder();
  private readonly explanationBuilder = createRecommendationExplanationBuilder();
  private readonly validator = createAiRecommendationIntelligenceExperienceValidator();

  constructor(deps?: {
    repository?: AiRecommendationIntelligenceExperienceRepository;
    aiInsightGenerationExperience?: AiInsightGenerationExperienceService;
  }) {
    this.aiInsightGenerationExperience =
      deps?.aiInsightGenerationExperience ?? createAiInsightGenerationExperienceService();
    this.repository =
      deps?.repository ??
      createAiRecommendationIntelligenceExperienceRepository({
        aiInsightGenerationExperience: this.aiInsightGenerationExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const insightHome = this.aiInsightGenerationExperience.getHome(authContext);
    return buildAiRecommendationIntelligenceExperienceHome({ scenarios: insightHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationIntelligenceContextScreen(this.buildOutput(authContext, query));
  }

  getPersonalized(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.personalizedRecommendations);
  }

  getPriority(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.priorityRecommendations);
  }

  getOpportunities(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.opportunityRecommendations);
  }

  getMitigation(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.riskMitigationRecommendations);
  }

  getStrategic(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.strategicRecommendations);
  }

  getConfidence(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.recommendationConfidence);
  }

  getReadiness(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.recommendationReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceDomainScreen(output, output.delegationRecommendationIntelligence);
  }

  getExplanation(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationIntelligenceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationIntelligenceSummaryScreen(
      buildAiRecommendationIntelligenceExperienceSummary(output)
    );
  }

  validate(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toRecommendationIntelligenceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toRecommendationIntelligenceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiRecommendationIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiRecommendationIntelligenceExperienceQuery) {
    const context = toContext(query);
    const insightQuery = toInsightGenerationQuery(query);
    const { insightGeneration } = this.repository.resolveUpstream(
      authContext,
      context,
      insightQuery
    );

    const recommendationContext = this.contextBuilder.build(insightGeneration);
    const personalizedRecommendations = this.personalizedBuilder.build(insightGeneration);
    const priorityRecommendations = this.priorityBuilder.build(insightGeneration);
    const opportunityRecommendations = this.opportunitiesBuilder.build(insightGeneration);
    const riskMitigationRecommendations = this.mitigationBuilder.build(insightGeneration);
    const strategicRecommendations = this.strategicBuilder.build(insightGeneration);
    const recommendationConfidence = this.confidenceBuilder.build(insightGeneration);
    const recommendationReadiness = this.readinessBuilder.build(insightGeneration);
    const delegationRecommendationIntelligence = this.delegationBuilder.build(insightGeneration);

    const outputId = `recommendation-intelligence-${insightGeneration.outputId}`;

    const recommendationExplanation = this.explanationBuilder.build({
      outputId,
      goal: insightGeneration.goal,
      personalized: personalizedRecommendations,
      priority: priorityRecommendations,
      readiness: recommendationReadiness,
      recommendationConfidenceScore: recommendationConfidence.score,
    });

    return {
      outputId,
      insightGenerationOutputId: insightGeneration.outputId,
      adaptiveCoachingOutputId: insightGeneration.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: insightGeneration.progressIntelligenceOutputId,
      executionCompanionOutputId: insightGeneration.executionCompanionOutputId,
      actionPlanningOutputId: insightGeneration.actionPlanningOutputId,
      decisionSupportOutputId: insightGeneration.decisionSupportOutputId,
      guidanceOutputId: insightGeneration.guidanceOutputId,
      conversationOutputId: insightGeneration.conversationOutputId,
      foundationOutputId: insightGeneration.foundationOutputId,
      closureOutputId: insightGeneration.closureOutputId,
      canonicalActionId: insightGeneration.canonicalActionId,
      scenarioId: insightGeneration.scenarioId,
      goal: insightGeneration.goal,
      recommendationContext,
      personalizedRecommendations,
      priorityRecommendations,
      opportunityRecommendations,
      riskMitigationRecommendations,
      strategicRecommendations,
      recommendationConfidence,
      recommendationReadiness,
      delegationRecommendationIntelligence,
      recommendationExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiRecommendationIntelligenceExperienceQuery
): AiRecommendationIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toInsightGenerationQuery(query: AiRecommendationIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiRecommendationIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof AiRecommendationIntelligenceExperienceService>[0]
): AiRecommendationIntelligenceExperienceService {
  return new AiRecommendationIntelligenceExperienceService(deps);
}

export function createAiRecommendationIntelligenceExperienceModule(deps?: {
  repository?: AiRecommendationIntelligenceExperienceRepository;
  aiInsightGenerationExperience?: AiInsightGenerationExperienceService;
}) {
  const aiInsightGenerationExperience =
    deps?.aiInsightGenerationExperience ?? createAiInsightGenerationExperienceService();
  const aiRecommendationIntelligenceExperience = createAiRecommendationIntelligenceExperienceService({
    aiInsightGenerationExperience,
    repository:
      deps?.repository ??
      createAiRecommendationIntelligenceExperienceRepository({ aiInsightGenerationExperience }),
  });
  return { aiRecommendationIntelligenceExperience };
}

export type AiRecommendationIntelligenceExperienceModule = ReturnType<
  typeof createAiRecommendationIntelligenceExperienceModule
>;
