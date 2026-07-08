import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiOperationalOversightExperienceService,
  type AiOperationalOversightExperienceService,
  type AiOperationalOversightExperienceQuery,
} from "../../ai-operational-oversight-experience/application/ai-operational-oversight-experience-service.js";
import {
  AI_EXPERIENCE_FINAL_CLOSURE_JSON_SCHEMA,
  AI_EXPERIENCE_FINAL_CLOSURE_ROUTES,
  AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
  type FinalClosureScenarioId,
} from "../domain/ai-experience-final-closure-schema.js";
import type { AiExperienceFinalClosureContext } from "../domain/ai-experience-final-closure-context.js";
import {
  buildAiExperienceFinalClosureHome,
  buildAiExperienceFinalClosureSummary,
  toFinalClosureDomainScreen,
  toFinalClosureExplanationScreen,
  toFinalClosureSummaryScreen,
  toFinalClosureValidationScreen,
} from "../domain/ai-experience-final-closure-screens.js";
import {
  createFinalClosureContextBuilder,
  createFinalDashboardBuilder,
  createChapterSummaryBuilder,
  createExperienceRegistryBuilder,
  createArchitectureOverviewBuilder,
  createIntelligenceChainBuilder,
  createFinalCertificationBuilder,
  createFinalReadinessBuilder,
  createFinalClosureConfidenceBuilder,
  createDelegationFinalClosureBuilder,
  createFinalClosureExplanationBuilder,
} from "./ai-experience-final-closure-builder.js";
import { createAiExperienceFinalClosureValidator } from "./ai-experience-final-closure-validator.js";
import {
  createAiExperienceFinalClosureRepository,
  type AiExperienceFinalClosureRepository,
} from "../infrastructure/ai-experience-final-closure-repository.js";

export interface AiExperienceFinalClosureQuery {
  scenario_id?: FinalClosureScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiExperienceFinalClosureService {
  private readonly repository: AiExperienceFinalClosureRepository;
  private readonly aiOperationalOversightExperience: AiOperationalOversightExperienceService;
  private readonly contextBuilder = createFinalClosureContextBuilder();
  private readonly dashboardBuilder = createFinalDashboardBuilder();
  private readonly chapterSummaryBuilder = createChapterSummaryBuilder();
  private readonly registryBuilder = createExperienceRegistryBuilder();
  private readonly architectureBuilder = createArchitectureOverviewBuilder();
  private readonly chainBuilder = createIntelligenceChainBuilder();
  private readonly certificationBuilder = createFinalCertificationBuilder();
  private readonly readinessBuilder = createFinalReadinessBuilder();
  private readonly confidenceBuilder = createFinalClosureConfidenceBuilder();
  private readonly delegationBuilder = createDelegationFinalClosureBuilder();
  private readonly explanationBuilder = createFinalClosureExplanationBuilder();
  private readonly validator = createAiExperienceFinalClosureValidator();

  constructor(deps?: {
    repository?: AiExperienceFinalClosureRepository;
    aiOperationalOversightExperience?: AiOperationalOversightExperienceService;
  }) {
    this.aiOperationalOversightExperience =
      deps?.aiOperationalOversightExperience ?? createAiOperationalOversightExperienceService();
    this.repository =
      deps?.repository ??
      createAiExperienceFinalClosureRepository({
        aiOperationalOversightExperience: this.aiOperationalOversightExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const oversightHome = this.aiOperationalOversightExperience.getHome(authContext);
    return buildAiExperienceFinalClosureHome({ scenarios: oversightHome.scenarios });
  }

  getFinalDashboard(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.finalDashboard);
  }

  getChapterSummary(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.chapterSummary);
  }

  getExperienceRegistry(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.experienceRegistry);
  }

  getArchitectureOverview(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.architectureOverview);
  }

  getIntelligenceChain(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.intelligenceChain);
  }

  getFinalCertification(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.finalCertification);
  }

  getFinalReadiness(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.finalReadiness);
  }

  getConfidence(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureDomainScreen(output, output.finalConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    return toFinalClosureExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toFinalClosureSummaryScreen(buildAiExperienceFinalClosureSummary(output));
  }

  validate(authContext: AuthContext, query: AiExperienceFinalClosureQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toFinalClosureValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toFinalClosureValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_EXPERIENCE_FINAL_CLOSURE_SCHEMA_VERSION,
      routes: AI_EXPERIENCE_FINAL_CLOSURE_ROUTES,
      json_schema: AI_EXPERIENCE_FINAL_CLOSURE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiExperienceFinalClosureQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiExperienceFinalClosureQuery) {
    const context = toContext(query);
    const oversightQuery = toOperationalOversightQuery(query);
    const { operationalOversight } = this.repository.resolveUpstream(
      authContext,
      context,
      oversightQuery
    );

    const finalClosureContext = this.contextBuilder.build(operationalOversight);
    const finalDashboard = this.dashboardBuilder.build(operationalOversight);
    const chapterSummary = this.chapterSummaryBuilder.build(operationalOversight);
    const experienceRegistry = this.registryBuilder.build(operationalOversight);
    const architectureOverview = this.architectureBuilder.build(operationalOversight);
    const intelligenceChain = this.chainBuilder.build(operationalOversight);
    const finalCertification = this.certificationBuilder.build(operationalOversight);
    const finalReadiness = this.readinessBuilder.build(operationalOversight);
    const finalConfidence = this.confidenceBuilder.build(operationalOversight);
    const delegationFinalClosure = this.delegationBuilder.build(operationalOversight);

    const outputId = `ai-experience-final-closure-${operationalOversight.outputId}`;

    const finalClosureExplanation = this.explanationBuilder.build({
      outputId,
      goal: operationalOversight.goal,
      dashboard: finalDashboard,
      intelligenceChain,
      finalCertification,
      finalConfidenceScore: finalConfidence.score,
    });

    return {
      outputId,
      operationalOversightOutputId: operationalOversight.outputId,
      conformanceValidationOutputId: operationalOversight.conformanceValidationOutputId,
      accountabilityLedgerOutputId: operationalOversight.accountabilityLedgerOutputId,
      governanceAssuranceOutputId: operationalOversight.governanceAssuranceOutputId,
      executiveAdvisoryOutputId: operationalOversight.executiveAdvisoryOutputId,
      foundationOutputId: operationalOversight.foundationOutputId,
      closureOutputId: operationalOversight.closureOutputId,
      canonicalActionId: operationalOversight.canonicalActionId,
      scenarioId: operationalOversight.scenarioId,
      goal: operationalOversight.goal,
      finalClosureContext,
      finalDashboard,
      chapterSummary,
      experienceRegistry,
      architectureOverview,
      intelligenceChain,
      finalCertification,
      finalReadiness,
      finalConfidence,
      delegationFinalClosure,
      finalClosureExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiExperienceFinalClosureQuery): AiExperienceFinalClosureContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toOperationalOversightQuery(
  query: AiExperienceFinalClosureQuery
): AiOperationalOversightExperienceQuery {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiExperienceFinalClosureService(
  deps?: ConstructorParameters<typeof AiExperienceFinalClosureService>[0]
): AiExperienceFinalClosureService {
  return new AiExperienceFinalClosureService(deps);
}

export function createAiExperienceFinalClosureModule(deps?: {
  repository?: AiExperienceFinalClosureRepository;
  aiOperationalOversightExperience?: AiOperationalOversightExperienceService;
}) {
  const aiOperationalOversightExperience =
    deps?.aiOperationalOversightExperience ?? createAiOperationalOversightExperienceService();
  const aiExperienceFinalClosure = createAiExperienceFinalClosureService({
    aiOperationalOversightExperience,
    repository:
      deps?.repository ??
      createAiExperienceFinalClosureRepository({ aiOperationalOversightExperience }),
  });
  return { aiExperienceFinalClosure };
}

export type AiExperienceFinalClosureModule = ReturnType<
  typeof createAiExperienceFinalClosureModule
>;
