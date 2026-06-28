import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  TRUST_INTELLIGENCE_JSON_SCHEMA,
  TRUST_INTELLIGENCE_ROUTES,
  TRUST_INTELLIGENCE_SCHEMA_VERSION,
  type TrustScenarioId,
} from "../domain/trust-intelligence-schema.js";
import type { TrustIntelligenceContext } from "../domain/trust-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildTrustIntelligenceHome,
  buildTrustIntelligenceSummary,
  toTrustExplanationScreen,
  toTrustReadinessScreen,
  toTrustRecommendationScreen,
  toTrustReputationScreen,
  toTrustScoreScreen,
  toTrustSummaryScreen,
  toTrustValidationScreen,
} from "../domain/trust-screens.js";
import {
  createTrustReadinessBuilder,
  createTrustScoreBuilder,
  createVerificationConfidenceBuilder,
  createReputationProjectionBuilder,
  createRiskConfidenceBuilder,
  createEvidenceCompletenessBuilder,
  createReliabilityProjectionBuilder,
  createPlatformTrustRecommendationBuilder,
} from "./trust-recommendation-builder.js";
import {
  createTrustConfidenceBuilder,
  createTrustExplanationBuilder,
} from "./trust-explanation-builder.js";
import { createTrustIntelligenceValidator } from "./trust-intelligence-validator.js";
import {
  createTrustIntelligenceRepository,
  type TrustIntelligenceRepository,
} from "../infrastructure/trust-intelligence-repository.js";

export interface TrustIntelligenceQuery {
  scenario_id?: TrustScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class TrustIntelligenceEngineService {
  private readonly repository: TrustIntelligenceRepository;
  private readonly readinessBuilder = createTrustReadinessBuilder();
  private readonly scoreBuilder = createTrustScoreBuilder();
  private readonly verificationBuilder = createVerificationConfidenceBuilder();
  private readonly reputationBuilder = createReputationProjectionBuilder();
  private readonly riskBuilder = createRiskConfidenceBuilder();
  private readonly evidenceBuilder = createEvidenceCompletenessBuilder();
  private readonly reliabilityBuilder = createReliabilityProjectionBuilder();
  private readonly platformBuilder = createPlatformTrustRecommendationBuilder();
  private readonly confidenceBuilder = createTrustConfidenceBuilder();
  private readonly explanationBuilder = createTrustExplanationBuilder();
  private readonly validator = createTrustIntelligenceValidator();

  constructor(deps?: { repository?: TrustIntelligenceRepository }) {
    this.repository = deps?.repository ?? createTrustIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listTrustScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildTrustIntelligenceHome({ scenarios });
  }

  getRecommendation(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toTrustRecommendationScreen(this.buildRecommendation(authContext, query));
  }

  getReadiness(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toTrustReadinessScreen(this.buildRecommendation(authContext, query));
  }

  getScore(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toTrustScoreScreen(this.buildRecommendation(authContext, query));
  }

  getReputation(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toTrustReputationScreen(this.buildRecommendation(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toTrustExplanationScreen(this.buildRecommendation(authContext, query));
  }

  getSummary(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const recommendation = this.buildRecommendation(authContext, query);
    return toTrustSummaryScreen(buildTrustIntelligenceSummary(recommendation));
  }

  validate(authContext: AuthContext, query: TrustIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toTrustValidationScreen(this.validator.validateCatalogCoverage());
    }
    const recommendation = this.buildRecommendation(authContext, query);
    return toTrustValidationScreen(this.validator.validateRecommendation(recommendation));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
      routes: TRUST_INTELLIGENCE_ROUTES,
      json_schema: TRUST_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildRecommendation(authContext: AuthContext, query: TrustIntelligenceQuery) {
    const context = toContext(query);
    const { evaluation, execution, contract, canonicalAction } = this.repository.resolveUpstream(
      authContext,
      context,
      toOutcomeQuery(query)
    );

    const trustReadiness = this.readinessBuilder.build(evaluation, execution);
    const trustScoreRecommendation = this.scoreBuilder.build({
      evaluation,
      execution,
      contract,
      readiness: trustReadiness,
    });
    const verificationConfidence = this.verificationBuilder.build(execution);
    const reputationProjection = this.reputationBuilder.build(evaluation, trustScoreRecommendation);
    const riskConfidence = this.riskBuilder.build(canonicalAction, contract);
    const evidenceCompleteness = this.evidenceBuilder.build(evaluation);
    const reliability = this.reliabilityBuilder.build({
      evaluation,
      execution,
      trustScore: trustScoreRecommendation,
    });
    const platformTrustRecommendation = this.platformBuilder.build({
      contract,
      execution,
      readiness: trustReadiness,
      canonicalAction,
    });

    const recommendationId = `trust-${evaluation.evaluationId}`;

    const trustConfidence = this.confidenceBuilder.build({
      evaluation,
      readiness: trustReadiness,
      trustScore: trustScoreRecommendation,
      verificationConfidence,
    });

    const explanation = this.explanationBuilder.build({
      recommendationId,
      goal: evaluation.goal,
      readiness: trustReadiness,
      trustScore: trustScoreRecommendation,
      reputation: reputationProjection,
      riskConfidence,
      evidenceCompleteness,
      platformAction: platformTrustRecommendation.action,
    });

    return {
      recommendationId,
      outcomeEvaluationId: evaluation.evaluationId,
      executionGuidanceId: evaluation.executionGuidanceId,
      contractRecommendationId: evaluation.contractRecommendationId,
      planId: evaluation.planId,
      canonicalActionId: evaluation.canonicalActionId,
      scenarioId: evaluation.scenarioId,
      goal: evaluation.goal,
      trustReadiness,
      trustScoreRecommendation,
      verificationConfidence,
      reputationProjection,
      riskConfidence,
      evidenceCompleteness,
      providerReliabilityProjection: reliability.provider,
      customerReliabilityProjection: reliability.customer,
      platformTrustRecommendation,
      explanation,
      trustConfidence,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: TrustIntelligenceQuery): TrustIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toOutcomeQuery(query: TrustIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createTrustIntelligenceEngineService(
  deps?: ConstructorParameters<typeof TrustIntelligenceEngineService>[0]
): TrustIntelligenceEngineService {
  return new TrustIntelligenceEngineService(deps);
}

export function createTrustIntelligenceEngineModule(deps?: {
  repository?: TrustIntelligenceRepository;
}) {
  const trustIntelligenceEngine = createTrustIntelligenceEngineService(deps);
  return { trustIntelligenceEngine };
}

export type TrustIntelligenceEngineModule = ReturnType<typeof createTrustIntelligenceEngineModule>;
