import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createActionIntelligenceFinalClosureService,
  type ActionIntelligenceFinalClosureService,
} from "../../action-intelligence-final-closure/application/action-intelligence-final-closure-service.js";
import {
  AI_EXPERIENCE_FOUNDATION_JSON_SCHEMA,
  AI_EXPERIENCE_FOUNDATION_ROUTES,
  AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
  type AiExperienceScenarioId,
} from "../domain/ai-experience-foundation-schema.js";
import type { AiExperienceFoundationContext } from "../domain/ai-experience-foundation-context.js";
import {
  buildAiExperienceFoundationHome,
  buildAiExperienceFoundationSummary,
  toAiExperienceContextScreen,
  toAiExperienceFoundationDomainScreen,
  toAiExperienceExplanationScreen,
  toAiExperienceSummaryScreen,
  toAiExperienceValidationScreen,
} from "../domain/ai-experience-foundation-screens.js";
import {
  createAiExperienceSharedContextBuilder,
  createFoundationStatusBuilder,
  createChapterHandoffIntegrationBuilder,
  createIntelligenceLineageBuilder,
  createFoundationReadinessBuilder,
  createDelegationFoundationBuilder,
  createFoundationConfidenceBuilder,
  createFoundationExplanationBuilder,
} from "./ai-experience-foundation-builder.js";
import { createAiExperienceFoundationValidator } from "./ai-experience-foundation-validator.js";
import {
  createAiExperienceFoundationRepository,
  type AiExperienceFoundationRepository,
} from "../infrastructure/ai-experience-foundation-repository.js";

export interface AiExperienceFoundationQuery {
  scenario_id?: AiExperienceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiExperienceFoundationService {
  private readonly repository: AiExperienceFoundationRepository;
  private readonly actionIntelligenceFinalClosure: ActionIntelligenceFinalClosureService;
  private readonly sharedContextBuilder = createAiExperienceSharedContextBuilder();
  private readonly foundationStatusBuilder = createFoundationStatusBuilder();
  private readonly handoffBuilder = createChapterHandoffIntegrationBuilder();
  private readonly lineageBuilder = createIntelligenceLineageBuilder();
  private readonly readinessBuilder = createFoundationReadinessBuilder();
  private readonly delegationBuilder = createDelegationFoundationBuilder();
  private readonly confidenceBuilder = createFoundationConfidenceBuilder();
  private readonly explanationBuilder = createFoundationExplanationBuilder();
  private readonly validator = createAiExperienceFoundationValidator();

  constructor(deps?: {
    repository?: AiExperienceFoundationRepository;
    actionIntelligenceFinalClosure?: ActionIntelligenceFinalClosureService;
  }) {
    this.actionIntelligenceFinalClosure =
      deps?.actionIntelligenceFinalClosure ?? createActionIntelligenceFinalClosureService();
    this.repository =
      deps?.repository ??
      createAiExperienceFoundationRepository({
        actionIntelligenceFinalClosure: this.actionIntelligenceFinalClosure,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const closureHome = this.actionIntelligenceFinalClosure.getHome(authContext);
    return buildAiExperienceFoundationHome({ scenarios: closureHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    return toAiExperienceContextScreen(this.buildOutput(authContext, query));
  }

  getFoundationStatus(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAiExperienceFoundationDomainScreen(output, output.foundationStatus);
  }

  getHandoff(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAiExperienceFoundationDomainScreen(output, output.chapterHandoffIntegration);
  }

  getLineage(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAiExperienceFoundationDomainScreen(output, output.intelligenceLineage);
  }

  getReadiness(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAiExperienceFoundationDomainScreen(output, output.foundationReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAiExperienceFoundationDomainScreen(output, output.delegationFoundation);
  }

  getExplanation(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    return toAiExperienceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAiExperienceSummaryScreen(buildAiExperienceFoundationSummary(output));
  }

  validate(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toAiExperienceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toAiExperienceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
      routes: AI_EXPERIENCE_FOUNDATION_ROUTES,
      json_schema: AI_EXPERIENCE_FOUNDATION_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: AiExperienceFoundationQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiExperienceFoundationQuery) {
    const context = toContext(query);
    const closureQuery = toClosureQuery(query);
    const { closure } = this.repository.resolveUpstream(authContext, context, closureQuery);

    const sharedContext = this.sharedContextBuilder.build(closure);
    const foundationStatus = this.foundationStatusBuilder.build(closure);
    const chapterHandoffIntegration = this.handoffBuilder.build(closure);
    const intelligenceLineage = this.lineageBuilder.build(closure);
    const foundationReadiness = this.readinessBuilder.build(closure);
    const delegationFoundation = this.delegationBuilder.build(closure);
    const foundationConfidence = this.confidenceBuilder.build(closure, foundationStatus.score);

    const outputId = `ai-foundation-${closure.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: closure.goal,
      closure,
      sharedContext,
      foundationStatus,
      handoff: chapterHandoffIntegration,
      lineage: intelligenceLineage,
      readiness: foundationReadiness,
      foundationConfidenceScore: foundationConfidence.score,
    });

    return {
      outputId,
      closureOutputId: closure.outputId,
      certificationOutputId: closure.certificationOutputId,
      executiveCenterOutputId: closure.executiveCenterOutputId,
      dashboardOutputId: closure.dashboardOutputId,
      orchestrationOutputId: closure.orchestrationOutputId,
      canonicalActionId: closure.canonicalActionId,
      scenarioId: closure.scenarioId,
      goal: closure.goal,
      sharedContext,
      foundationStatus,
      chapterHandoffIntegration,
      intelligenceLineage,
      foundationReadiness,
      delegationFoundation,
      foundationConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiExperienceFoundationQuery): AiExperienceFoundationContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toClosureQuery(query: AiExperienceFoundationQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiExperienceFoundationService(
  deps?: ConstructorParameters<typeof AiExperienceFoundationService>[0]
): AiExperienceFoundationService {
  return new AiExperienceFoundationService(deps);
}

export function createAiExperienceFoundationModule(deps?: {
  repository?: AiExperienceFoundationRepository;
  actionIntelligenceFinalClosure?: ActionIntelligenceFinalClosureService;
}) {
  const actionIntelligenceFinalClosure =
    deps?.actionIntelligenceFinalClosure ?? createActionIntelligenceFinalClosureService();
  const aiExperienceFoundation = createAiExperienceFoundationService({
    actionIntelligenceFinalClosure,
    repository:
      deps?.repository ??
      createAiExperienceFoundationRepository({ actionIntelligenceFinalClosure }),
  });
  return { aiExperienceFoundation };
}

export type AiExperienceFoundationModule = ReturnType<typeof createAiExperienceFoundationModule>;
