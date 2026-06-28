import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiConversationExperienceService,
  type AiConversationExperienceService,
} from "../../ai-conversation-experience/application/ai-conversation-experience-service.js";
import {
  AI_GUIDANCE_EXPERIENCE_JSON_SCHEMA,
  AI_GUIDANCE_EXPERIENCE_ROUTES,
  AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
  type GuidanceScenarioId,
} from "../domain/ai-guidance-experience-schema.js";
import type { AiGuidanceExperienceContext } from "../domain/ai-guidance-experience-context.js";
import {
  buildAiGuidanceExperienceHome,
  buildAiGuidanceExperienceSummary,
  toGuidanceContextScreen,
  toGuidanceDomainScreen,
  toGuidanceExplanationScreen,
  toGuidanceSummaryScreen,
  toGuidanceValidationScreen,
} from "../domain/ai-guidance-experience-screens.js";
import {
  createGuidanceContextBuilder,
  createGuidancePlanBuilder,
  createGuidanceStepsBuilder,
  createGuidanceRecommendationsBuilder,
  createGuidanceStatusBuilder,
  createGuidanceReadinessBuilder,
  createDelegationGuidanceBuilder,
  createGuidanceConfidenceBuilder,
  createGuidanceExplanationBuilder,
} from "./ai-guidance-experience-builder.js";
import { createAiGuidanceExperienceValidator } from "./ai-guidance-experience-validator.js";
import {
  createAiGuidanceExperienceRepository,
  type AiGuidanceExperienceRepository,
} from "../infrastructure/ai-guidance-experience-repository.js";

export interface AiGuidanceExperienceQuery {
  scenario_id?: GuidanceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiGuidanceExperienceService {
  private readonly repository: AiGuidanceExperienceRepository;
  private readonly aiConversationExperience: AiConversationExperienceService;
  private readonly contextBuilder = createGuidanceContextBuilder();
  private readonly planBuilder = createGuidancePlanBuilder();
  private readonly stepsBuilder = createGuidanceStepsBuilder();
  private readonly recommendationsBuilder = createGuidanceRecommendationsBuilder();
  private readonly statusBuilder = createGuidanceStatusBuilder();
  private readonly readinessBuilder = createGuidanceReadinessBuilder();
  private readonly delegationBuilder = createDelegationGuidanceBuilder();
  private readonly confidenceBuilder = createGuidanceConfidenceBuilder();
  private readonly explanationBuilder = createGuidanceExplanationBuilder();
  private readonly validator = createAiGuidanceExperienceValidator();

  constructor(deps?: {
    repository?: AiGuidanceExperienceRepository;
    aiConversationExperience?: AiConversationExperienceService;
  }) {
    this.aiConversationExperience =
      deps?.aiConversationExperience ?? createAiConversationExperienceService();
    this.repository =
      deps?.repository ??
      createAiGuidanceExperienceRepository({
        aiConversationExperience: this.aiConversationExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const conversationHome = this.aiConversationExperience.getHome(authContext);
    return buildAiGuidanceExperienceHome({ scenarios: conversationHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toGuidanceContextScreen(this.buildOutput(authContext, query));
  }

  getPlan(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceDomainScreen(output, output.guidancePlan);
  }

  getSteps(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceDomainScreen(output, output.guidanceSteps);
  }

  getRecommendations(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceDomainScreen(output, output.guidanceRecommendations);
  }

  getStatus(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceDomainScreen(output, output.guidanceStatus);
  }

  getReadiness(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceDomainScreen(output, output.guidanceReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceDomainScreen(output, output.delegationGuidance);
  }

  getExplanation(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toGuidanceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGuidanceSummaryScreen(buildAiGuidanceExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toGuidanceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toGuidanceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_GUIDANCE_EXPERIENCE_ROUTES,
      json_schema: AI_GUIDANCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: AiGuidanceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiGuidanceExperienceQuery) {
    const context = toContext(query);
    const conversationQuery = toConversationQuery(query);
    const { conversation } = this.repository.resolveUpstream(
      authContext,
      context,
      conversationQuery
    );

    const guidanceContext = this.contextBuilder.build(conversation);
    const guidancePlan = this.planBuilder.build(conversation);
    const guidanceSteps = this.stepsBuilder.build(conversation, guidancePlan);
    const guidanceRecommendations = this.recommendationsBuilder.build(conversation);
    const guidanceStatus = this.statusBuilder.build(conversation);
    const guidanceReadiness = this.readinessBuilder.build(conversation);
    const delegationGuidance = this.delegationBuilder.build(conversation);
    const guidanceConfidence = this.confidenceBuilder.build(conversation, guidanceStatus.score);

    const outputId = `guidance-${conversation.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: conversation.goal,
      conversation,
      plan: guidancePlan,
      steps: guidanceSteps,
      status: guidanceStatus,
      readiness: guidanceReadiness,
      guidanceConfidenceScore: guidanceConfidence.score,
    });

    return {
      outputId,
      conversationOutputId: conversation.outputId,
      foundationOutputId: conversation.foundationOutputId,
      closureOutputId: conversation.closureOutputId,
      canonicalActionId: conversation.canonicalActionId,
      scenarioId: conversation.scenarioId,
      goal: conversation.goal,
      guidanceContext,
      guidancePlan,
      guidanceSteps,
      guidanceRecommendations,
      guidanceStatus,
      guidanceReadiness,
      delegationGuidance,
      guidanceConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiGuidanceExperienceQuery): AiGuidanceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toConversationQuery(query: AiGuidanceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiGuidanceExperienceService(
  deps?: ConstructorParameters<typeof AiGuidanceExperienceService>[0]
): AiGuidanceExperienceService {
  return new AiGuidanceExperienceService(deps);
}

export function createAiGuidanceExperienceModule(deps?: {
  repository?: AiGuidanceExperienceRepository;
  aiConversationExperience?: AiConversationExperienceService;
}) {
  const aiConversationExperience =
    deps?.aiConversationExperience ?? createAiConversationExperienceService();
  const aiGuidanceExperience = createAiGuidanceExperienceService({
    aiConversationExperience,
    repository:
      deps?.repository ??
      createAiGuidanceExperienceRepository({ aiConversationExperience }),
  });
  return { aiGuidanceExperience };
}

export type AiGuidanceExperienceModule = ReturnType<typeof createAiGuidanceExperienceModule>;
