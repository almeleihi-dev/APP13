import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  DECISION_INTELLIGENCE_JSON_SCHEMA,
  DECISION_INTELLIGENCE_ROUTES,
  DECISION_INTELLIGENCE_SCHEMA_VERSION,
  type DecisionScenarioId,
} from "../domain/decision-intelligence-schema.js";
import type { DecisionIntelligenceContext } from "../domain/decision-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildDecisionIntelligenceHome,
  buildDecisionIntelligenceSummary,
  toDecisionAlternativesScreen,
  toDecisionExplanationScreen,
  toDecisionFactorsScreen,
  toDecisionReadinessScreen,
  toDecisionRecommendationScreen,
  toDecisionSummaryScreen,
  toDecisionValidationScreen,
} from "../domain/decision-screens.js";
import {
  createDecisionReadinessBuilder,
  createDecisionTypeResolver,
  createDecisionFactorsBuilder,
  createRequiredApprovalsBuilder,
  createAlternativeOptionsBuilder,
  createMitigationRecommendationsBuilder,
  createExpectedImpactBuilder,
} from "./decision-recommendation-builder.js";
import {
  createDecisionConfidenceBuilder,
  createDecisionExplanationBuilder,
} from "./decision-explanation-builder.js";
import { createDecisionIntelligenceValidator } from "./decision-intelligence-validator.js";
import {
  createDecisionIntelligenceRepository,
  type DecisionIntelligenceRepository,
} from "../infrastructure/decision-intelligence-repository.js";

export interface DecisionIntelligenceQuery {
  scenario_id?: DecisionScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class DecisionIntelligenceEngineService {
  private readonly repository: DecisionIntelligenceRepository;
  private readonly readinessBuilder = createDecisionReadinessBuilder();
  private readonly typeResolver = createDecisionTypeResolver();
  private readonly factorsBuilder = createDecisionFactorsBuilder();
  private readonly approvalsBuilder = createRequiredApprovalsBuilder();
  private readonly alternativesBuilder = createAlternativeOptionsBuilder();
  private readonly mitigationBuilder = createMitigationRecommendationsBuilder();
  private readonly impactBuilder = createExpectedImpactBuilder();
  private readonly confidenceBuilder = createDecisionConfidenceBuilder();
  private readonly explanationBuilder = createDecisionExplanationBuilder();
  private readonly validator = createDecisionIntelligenceValidator();

  constructor(deps?: { repository?: DecisionIntelligenceRepository }) {
    this.repository = deps?.repository ?? createDecisionIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listDecisionScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildDecisionIntelligenceHome({ scenarios });
  }

  getRecommendation(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionRecommendationScreen(this.buildRecommendation(authContext, query));
  }

  getReadiness(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionReadinessScreen(this.buildRecommendation(authContext, query));
  }

  getFactors(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionFactorsScreen(this.buildRecommendation(authContext, query));
  }

  getAlternatives(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionAlternativesScreen(this.buildRecommendation(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionExplanationScreen(this.buildRecommendation(authContext, query));
  }

  getSummary(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(authContext, query);
    return toDecisionSummaryScreen(buildDecisionIntelligenceSummary(recommendation));
  }

  validate(authContext: AuthContext, query: DecisionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toDecisionValidationScreen(this.validator.validateCatalogCoverage());
    }
    const recommendation = this.buildRecommendation(authContext, query);
    return toDecisionValidationScreen(this.validator.validateRecommendation(recommendation));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
      routes: DECISION_INTELLIGENCE_ROUTES,
      json_schema: DECISION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildRecommendation(authContext: AuthContext, query: DecisionIntelligenceQuery) {
    const context = toContext(query);
    const { trust, evaluation, execution, contract } = this.repository.resolveUpstream(
      authContext,
      context,
      toTrustQuery(query)
    );

    const decisionReadiness = this.readinessBuilder.build(trust, evaluation);
    const { blocking, supporting } = this.factorsBuilder.build(trust, evaluation, execution);
    const { decision: recommendedDecision, rationale: decisionRationale } = this.typeResolver.resolve({
      readiness: decisionReadiness,
      trust,
      evaluation,
      blockingCount: blocking.length,
    });

    const requiredApprovals = this.approvalsBuilder.build(contract);
    const alternativeOptions = this.alternativesBuilder.build(recommendedDecision, evaluation.goal);
    const mitigationRecommendations = this.mitigationBuilder.build({
      trust,
      evaluation,
      blocking,
    });
    const expectedImpactAnalysis = this.impactBuilder.build({
      decision: recommendedDecision,
      trust,
      evaluation,
      execution,
      contract,
    });

    const recommendationId = `decision-${trust.recommendationId}`;

    const decisionConfidence = this.confidenceBuilder.build({
      trust,
      readiness: decisionReadiness,
      blockingCount: blocking.length,
      supportingCount: supporting.length,
    });

    const explanation = this.explanationBuilder.build({
      recommendationId,
      goal: evaluation.goal,
      decision: recommendedDecision,
      rationale: decisionRationale,
      readiness: decisionReadiness,
      blocking,
      supporting,
      impact: expectedImpactAnalysis,
      alternatives: alternativeOptions,
      mitigations: mitigationRecommendations,
    });

    return {
      recommendationId,
      trustRecommendationId: trust.recommendationId,
      outcomeEvaluationId: trust.outcomeEvaluationId,
      executionGuidanceId: trust.executionGuidanceId,
      planId: trust.planId,
      canonicalActionId: trust.canonicalActionId,
      scenarioId: trust.scenarioId,
      goal: evaluation.goal,
      decisionReadiness,
      recommendedDecision,
      decisionConfidence,
      blockingFactors: blocking,
      supportingFactors: supporting,
      requiredApprovals,
      decisionRationale,
      alternativeOptions,
      mitigationRecommendations,
      expectedImpactAnalysis,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: DecisionIntelligenceQuery): DecisionIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toTrustQuery(query: DecisionIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createDecisionIntelligenceEngineService(
  deps?: ConstructorParameters<typeof DecisionIntelligenceEngineService>[0]
): DecisionIntelligenceEngineService {
  return new DecisionIntelligenceEngineService(deps);
}

export function createDecisionIntelligenceEngineModule(deps?: {
  repository?: DecisionIntelligenceRepository;
}) {
  const decisionIntelligenceEngine = createDecisionIntelligenceEngineService(deps);
  return { decisionIntelligenceEngine };
}

export type DecisionIntelligenceEngineModule = ReturnType<
  typeof createDecisionIntelligenceEngineModule
>;
