import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiGuidanceExperienceService,
  type AiGuidanceExperienceService,
} from "../../ai-guidance-experience/application/ai-guidance-experience-service.js";
import {
  AI_DECISION_SUPPORT_EXPERIENCE_JSON_SCHEMA,
  AI_DECISION_SUPPORT_EXPERIENCE_ROUTES,
  AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
  type DecisionSupportScenarioId,
} from "../domain/ai-decision-support-experience-schema.js";
import type { AiDecisionSupportExperienceContext } from "../domain/ai-decision-support-experience-context.js";
import {
  buildAiDecisionSupportExperienceHome,
  buildAiDecisionSupportExperienceSummary,
  toDecisionSupportContextScreen,
  toDecisionSupportDomainScreen,
  toDecisionSupportExplanationScreen,
  toDecisionSupportSummaryScreen,
  toDecisionSupportValidationScreen,
} from "../domain/ai-decision-support-experience-screens.js";
import {
  createDecisionSupportContextBuilder,
  createDecisionOptionsBuilder,
  createDecisionAnalysisBuilder,
  createDecisionRecommendationBuilder,
  createDecisionSupportStatusBuilder,
  createDecisionSupportReadinessBuilder,
  createDelegationDecisionSupportBuilder,
  createDecisionSupportConfidenceBuilder,
  createDecisionSupportExplanationBuilder,
} from "./ai-decision-support-experience-builder.js";
import { createAiDecisionSupportExperienceValidator } from "./ai-decision-support-experience-validator.js";
import {
  createAiDecisionSupportExperienceRepository,
  type AiDecisionSupportExperienceRepository,
} from "../infrastructure/ai-decision-support-experience-repository.js";

export interface AiDecisionSupportExperienceQuery {
  scenario_id?: DecisionSupportScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiDecisionSupportExperienceService {
  private readonly repository: AiDecisionSupportExperienceRepository;
  private readonly aiGuidanceExperience: AiGuidanceExperienceService;
  private readonly contextBuilder = createDecisionSupportContextBuilder();
  private readonly optionsBuilder = createDecisionOptionsBuilder();
  private readonly analysisBuilder = createDecisionAnalysisBuilder();
  private readonly recommendationBuilder = createDecisionRecommendationBuilder();
  private readonly statusBuilder = createDecisionSupportStatusBuilder();
  private readonly readinessBuilder = createDecisionSupportReadinessBuilder();
  private readonly delegationBuilder = createDelegationDecisionSupportBuilder();
  private readonly confidenceBuilder = createDecisionSupportConfidenceBuilder();
  private readonly explanationBuilder = createDecisionSupportExplanationBuilder();
  private readonly validator = createAiDecisionSupportExperienceValidator();

  constructor(deps?: {
    repository?: AiDecisionSupportExperienceRepository;
    aiGuidanceExperience?: AiGuidanceExperienceService;
  }) {
    this.aiGuidanceExperience =
      deps?.aiGuidanceExperience ?? createAiGuidanceExperienceService();
    this.repository =
      deps?.repository ??
      createAiDecisionSupportExperienceRepository({
        aiGuidanceExperience: this.aiGuidanceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const guidanceHome = this.aiGuidanceExperience.getHome(authContext);
    return buildAiDecisionSupportExperienceHome({ scenarios: guidanceHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionSupportContextScreen(this.buildOutput(authContext, query));
  }

  getOptions(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportDomainScreen(output, output.decisionOptions);
  }

  getAnalysis(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportDomainScreen(output, output.decisionAnalysis);
  }

  getRecommendation(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportDomainScreen(output, output.decisionRecommendation);
  }

  getStatus(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportDomainScreen(output, output.decisionSupportStatus);
  }

  getReadiness(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportDomainScreen(output, output.decisionSupportReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportDomainScreen(output, output.delegationDecisionSupport);
  }

  getExplanation(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDecisionSupportExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDecisionSupportSummaryScreen(buildAiDecisionSupportExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiDecisionSupportExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toDecisionSupportValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toDecisionSupportValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_DECISION_SUPPORT_EXPERIENCE_ROUTES,
      json_schema: AI_DECISION_SUPPORT_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiDecisionSupportExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiDecisionSupportExperienceQuery) {
    const context = toContext(query);
    const guidanceQuery = toGuidanceQuery(query);
    const { guidance } = this.repository.resolveUpstream(authContext, context, guidanceQuery);

    const decisionSupportContext = this.contextBuilder.build(guidance);
    const decisionOptions = this.optionsBuilder.build(guidance);
    const decisionAnalysis = this.analysisBuilder.build(guidance);
    const decisionRecommendation = this.recommendationBuilder.build(guidance, decisionAnalysis);
    const decisionSupportStatus = this.statusBuilder.build(guidance);
    const decisionSupportReadiness = this.readinessBuilder.build(guidance);
    const delegationDecisionSupport = this.delegationBuilder.build(guidance);
    const decisionSupportConfidence = this.confidenceBuilder.build(
      guidance,
      decisionSupportStatus.score
    );

    const outputId = `decision-support-${guidance.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: guidance.goal,
      guidance,
      options: decisionOptions,
      analysis: decisionAnalysis,
      recommendation: decisionRecommendation,
      readiness: decisionSupportReadiness,
      decisionSupportConfidenceScore: decisionSupportConfidence.score,
    });

    return {
      outputId,
      guidanceOutputId: guidance.outputId,
      conversationOutputId: guidance.conversationOutputId,
      foundationOutputId: guidance.foundationOutputId,
      closureOutputId: guidance.closureOutputId,
      canonicalActionId: guidance.canonicalActionId,
      scenarioId: guidance.scenarioId,
      goal: guidance.goal,
      decisionSupportContext,
      decisionOptions,
      decisionAnalysis,
      decisionRecommendation,
      decisionSupportStatus,
      decisionSupportReadiness,
      delegationDecisionSupport,
      decisionSupportConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiDecisionSupportExperienceQuery): AiDecisionSupportExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toGuidanceQuery(query: AiDecisionSupportExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiDecisionSupportExperienceService(
  deps?: ConstructorParameters<typeof AiDecisionSupportExperienceService>[0]
): AiDecisionSupportExperienceService {
  return new AiDecisionSupportExperienceService(deps);
}

export function createAiDecisionSupportExperienceModule(deps?: {
  repository?: AiDecisionSupportExperienceRepository;
  aiGuidanceExperience?: AiGuidanceExperienceService;
}) {
  const aiGuidanceExperience =
    deps?.aiGuidanceExperience ?? createAiGuidanceExperienceService();
  const aiDecisionSupportExperience = createAiDecisionSupportExperienceService({
    aiGuidanceExperience,
    repository:
      deps?.repository ??
      createAiDecisionSupportExperienceRepository({ aiGuidanceExperience }),
  });
  return { aiDecisionSupportExperience };
}

export type AiDecisionSupportExperienceModule = ReturnType<
  typeof createAiDecisionSupportExperienceModule
>;
