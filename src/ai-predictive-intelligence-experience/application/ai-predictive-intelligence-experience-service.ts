import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiRecommendationIntelligenceExperienceService,
  type AiRecommendationIntelligenceExperienceService,
} from "../../ai-recommendation-intelligence-experience/application/ai-recommendation-intelligence-experience-service.js";
import {
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_ROUTES,
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  type PredictiveIntelligenceScenarioId,
} from "../domain/ai-predictive-intelligence-experience-schema.js";
import type { AiPredictiveIntelligenceExperienceContext } from "../domain/ai-predictive-intelligence-experience-context.js";
import {
  buildAiPredictiveIntelligenceExperienceHome,
  buildAiPredictiveIntelligenceExperienceSummary,
  toPredictiveIntelligenceContextScreen,
  toPredictiveIntelligenceDomainScreen,
  toPredictiveIntelligenceExplanationScreen,
  toPredictiveIntelligenceSummaryScreen,
  toPredictiveIntelligenceValidationScreen,
} from "../domain/ai-predictive-intelligence-experience-screens.js";
import {
  createPredictionContextBuilder,
  createOutcomePredictionsBuilder,
  createSuccessProbabilityBuilder,
  createFutureScenariosBuilder,
  createEarlyWarningSignalsBuilder,
  createPredictiveOpportunitiesBuilder,
  createPredictiveRisksBuilder,
  createPredictionConfidenceBuilder,
  createPredictionReadinessBuilder,
  createDelegationPredictiveIntelligenceBuilder,
  createPredictionExplanationBuilder,
} from "./ai-predictive-intelligence-experience-builder.js";
import { createAiPredictiveIntelligenceExperienceValidator } from "./ai-predictive-intelligence-experience-validator.js";
import {
  createAiPredictiveIntelligenceExperienceRepository,
  type AiPredictiveIntelligenceExperienceRepository,
} from "../infrastructure/ai-predictive-intelligence-experience-repository.js";

export interface AiPredictiveIntelligenceExperienceQuery {
  scenario_id?: PredictiveIntelligenceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiPredictiveIntelligenceExperienceService {
  private readonly repository: AiPredictiveIntelligenceExperienceRepository;
  private readonly aiRecommendationIntelligenceExperience: AiRecommendationIntelligenceExperienceService;
  private readonly contextBuilder = createPredictionContextBuilder();
  private readonly outcomesBuilder = createOutcomePredictionsBuilder();
  private readonly probabilityBuilder = createSuccessProbabilityBuilder();
  private readonly scenariosBuilder = createFutureScenariosBuilder();
  private readonly warningsBuilder = createEarlyWarningSignalsBuilder();
  private readonly opportunitiesBuilder = createPredictiveOpportunitiesBuilder();
  private readonly risksBuilder = createPredictiveRisksBuilder();
  private readonly confidenceBuilder = createPredictionConfidenceBuilder();
  private readonly readinessBuilder = createPredictionReadinessBuilder();
  private readonly delegationBuilder = createDelegationPredictiveIntelligenceBuilder();
  private readonly explanationBuilder = createPredictionExplanationBuilder();
  private readonly validator = createAiPredictiveIntelligenceExperienceValidator();

  constructor(deps?: {
    repository?: AiPredictiveIntelligenceExperienceRepository;
    aiRecommendationIntelligenceExperience?: AiRecommendationIntelligenceExperienceService;
  }) {
    this.aiRecommendationIntelligenceExperience =
      deps?.aiRecommendationIntelligenceExperience ??
      createAiRecommendationIntelligenceExperienceService();
    this.repository =
      deps?.repository ??
      createAiPredictiveIntelligenceExperienceRepository({
        aiRecommendationIntelligenceExperience: this.aiRecommendationIntelligenceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const recHome = this.aiRecommendationIntelligenceExperience.getHome(authContext);
    return buildAiPredictiveIntelligenceExperienceHome({ scenarios: recHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictiveIntelligenceContextScreen(this.buildOutput(authContext, query));
  }

  getOutcomes(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.outcomePredictions);
  }

  getProbability(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.successProbability);
  }

  getScenarios(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.futureScenarios);
  }

  getWarnings(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.earlyWarningSignals);
  }

  getOpportunities(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.predictiveOpportunities);
  }

  getRisks(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.predictiveRisks);
  }

  getConfidence(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.predictionConfidence);
  }

  getReadiness(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.predictionReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceDomainScreen(output, output.delegationPredictiveIntelligence);
  }

  getExplanation(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictiveIntelligenceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveIntelligenceSummaryScreen(
      buildAiPredictiveIntelligenceExperienceSummary(output)
    );
  }

  validate(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toPredictiveIntelligenceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toPredictiveIntelligenceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiPredictiveIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiPredictiveIntelligenceExperienceQuery) {
    const context = toContext(query);
    const recQuery = toRecommendationIntelligenceQuery(query);
    const { recommendationIntelligence } = this.repository.resolveUpstream(
      authContext,
      context,
      recQuery
    );

    const predictionContext = this.contextBuilder.build(recommendationIntelligence);
    const outcomePredictions = this.outcomesBuilder.build(recommendationIntelligence);
    const successProbability = this.probabilityBuilder.build(recommendationIntelligence);
    const futureScenarios = this.scenariosBuilder.build(recommendationIntelligence);
    const earlyWarningSignals = this.warningsBuilder.build(recommendationIntelligence);
    const predictiveOpportunities = this.opportunitiesBuilder.build(recommendationIntelligence);
    const predictiveRisks = this.risksBuilder.build(recommendationIntelligence);
    const predictionConfidence = this.confidenceBuilder.build(recommendationIntelligence);
    const predictionReadiness = this.readinessBuilder.build(recommendationIntelligence);
    const delegationPredictiveIntelligence = this.delegationBuilder.build(recommendationIntelligence);

    const outputId = `predictive-intelligence-${recommendationIntelligence.outputId}`;

    const predictionExplanation = this.explanationBuilder.build({
      outputId,
      goal: recommendationIntelligence.goal,
      outcomes: outcomePredictions,
      probability: successProbability,
      readiness: predictionReadiness,
      predictionConfidenceScore: predictionConfidence.score,
    });

    return {
      outputId,
      recommendationIntelligenceOutputId: recommendationIntelligence.outputId,
      insightGenerationOutputId: recommendationIntelligence.insightGenerationOutputId,
      adaptiveCoachingOutputId: recommendationIntelligence.adaptiveCoachingOutputId,
      progressIntelligenceOutputId: recommendationIntelligence.progressIntelligenceOutputId,
      executionCompanionOutputId: recommendationIntelligence.executionCompanionOutputId,
      actionPlanningOutputId: recommendationIntelligence.actionPlanningOutputId,
      decisionSupportOutputId: recommendationIntelligence.decisionSupportOutputId,
      guidanceOutputId: recommendationIntelligence.guidanceOutputId,
      conversationOutputId: recommendationIntelligence.conversationOutputId,
      foundationOutputId: recommendationIntelligence.foundationOutputId,
      closureOutputId: recommendationIntelligence.closureOutputId,
      canonicalActionId: recommendationIntelligence.canonicalActionId,
      scenarioId: recommendationIntelligence.scenarioId,
      goal: recommendationIntelligence.goal,
      predictionContext,
      outcomePredictions,
      successProbability,
      futureScenarios,
      earlyWarningSignals,
      predictiveOpportunities,
      predictiveRisks,
      predictionConfidence,
      predictionReadiness,
      delegationPredictiveIntelligence,
      predictionExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiPredictiveIntelligenceExperienceQuery
): AiPredictiveIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toRecommendationIntelligenceQuery(query: AiPredictiveIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiPredictiveIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof AiPredictiveIntelligenceExperienceService>[0]
): AiPredictiveIntelligenceExperienceService {
  return new AiPredictiveIntelligenceExperienceService(deps);
}

export function createAiPredictiveIntelligenceExperienceModule(deps?: {
  repository?: AiPredictiveIntelligenceExperienceRepository;
  aiRecommendationIntelligenceExperience?: AiRecommendationIntelligenceExperienceService;
}) {
  const aiRecommendationIntelligenceExperience =
    deps?.aiRecommendationIntelligenceExperience ??
    createAiRecommendationIntelligenceExperienceService();
  const aiPredictiveIntelligenceExperience = createAiPredictiveIntelligenceExperienceService({
    aiRecommendationIntelligenceExperience,
    repository:
      deps?.repository ??
      createAiPredictiveIntelligenceExperienceRepository({ aiRecommendationIntelligenceExperience }),
  });
  return { aiPredictiveIntelligenceExperience };
}

export type AiPredictiveIntelligenceExperienceModule = ReturnType<
  typeof createAiPredictiveIntelligenceExperienceModule
>;
