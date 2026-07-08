import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiAccountabilityLedgerExperienceService,
  type AiAccountabilityLedgerExperienceService,
  type AiAccountabilityLedgerExperienceQuery,
} from "../../ai-accountability-ledger-experience/application/ai-accountability-ledger-experience-service.js";
import {
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_JSON_SCHEMA,
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_ROUTES,
  AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
  type ConformanceValidationScenarioId,
} from "../domain/ai-conformance-validation-experience-schema.js";
import type { AiConformanceValidationExperienceContext } from "../domain/ai-conformance-validation-experience-context.js";
import {
  buildAiConformanceValidationExperienceHome,
  buildAiConformanceValidationExperienceSummary,
  toConformanceValidationDomainScreen,
  toConformanceValidationExplanationScreen,
  toConformanceValidationSummaryScreen,
  toConformanceValidationValidationScreen,
} from "../domain/ai-conformance-validation-experience-screens.js";
import {
  createConformanceContextBuilder,
  createConformanceDashboardBuilder,
  createValidationMatrixBuilder,
  createComplianceStatusBuilder,
  createConformanceRulesBuilder,
  createDeviationAnalysisBuilder,
  createCorrectiveActionsBuilder,
  createValidationReportBuilder,
  createConformanceConfidenceBuilder,
  createDelegationConformanceValidationBuilder,
  createConformanceExplanationBuilder,
} from "./ai-conformance-validation-experience-builder.js";
import { createAiConformanceValidationExperienceValidator } from "./ai-conformance-validation-experience-validator.js";
import {
  createAiConformanceValidationExperienceRepository,
  type AiConformanceValidationExperienceRepository,
} from "../infrastructure/ai-conformance-validation-experience-repository.js";

export interface AiConformanceValidationExperienceQuery {
  scenario_id?: ConformanceValidationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiConformanceValidationExperienceService {
  private readonly repository: AiConformanceValidationExperienceRepository;
  private readonly aiAccountabilityLedgerExperience: AiAccountabilityLedgerExperienceService;
  private readonly contextBuilder = createConformanceContextBuilder();
  private readonly dashboardBuilder = createConformanceDashboardBuilder();
  private readonly matrixBuilder = createValidationMatrixBuilder();
  private readonly complianceStatusBuilder = createComplianceStatusBuilder();
  private readonly rulesBuilder = createConformanceRulesBuilder();
  private readonly deviationBuilder = createDeviationAnalysisBuilder();
  private readonly correctiveActionsBuilder = createCorrectiveActionsBuilder();
  private readonly validationReportBuilder = createValidationReportBuilder();
  private readonly confidenceBuilder = createConformanceConfidenceBuilder();
  private readonly delegationBuilder = createDelegationConformanceValidationBuilder();
  private readonly explanationBuilder = createConformanceExplanationBuilder();
  private readonly validator = createAiConformanceValidationExperienceValidator();

  constructor(deps?: {
    repository?: AiConformanceValidationExperienceRepository;
    aiAccountabilityLedgerExperience?: AiAccountabilityLedgerExperienceService;
  }) {
    this.aiAccountabilityLedgerExperience =
      deps?.aiAccountabilityLedgerExperience ?? createAiAccountabilityLedgerExperienceService();
    this.repository =
      deps?.repository ??
      createAiConformanceValidationExperienceRepository({
        aiAccountabilityLedgerExperience: this.aiAccountabilityLedgerExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const ledgerHome = this.aiAccountabilityLedgerExperience.getHome(authContext);
    return buildAiConformanceValidationExperienceHome({ scenarios: ledgerHome.scenarios });
  }

  getConformanceDashboard(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.conformanceDashboard);
  }

  getValidationMatrix(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.validationMatrix);
  }

  getComplianceStatus(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.complianceStatus);
  }

  getConformanceRules(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.conformanceRules);
  }

  getDeviationAnalysis(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.deviationAnalysis);
  }

  getCorrectiveActions(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.correctiveActions);
  }

  getValidationReport(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.validationReport);
  }

  getConfidence(authContext: AuthContext, query: AiConformanceValidationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationDomainScreen(output, output.conformanceConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiConformanceValidationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toConformanceValidationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiConformanceValidationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toConformanceValidationSummaryScreen(buildAiConformanceValidationExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiConformanceValidationExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toConformanceValidationValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toConformanceValidationValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_CONFORMANCE_VALIDATION_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_CONFORMANCE_VALIDATION_EXPERIENCE_ROUTES,
      json_schema: AI_CONFORMANCE_VALIDATION_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiConformanceValidationExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiConformanceValidationExperienceQuery) {
    const context = toContext(query);
    const ledgerQuery = toAccountabilityLedgerQuery(query);
    const { accountabilityLedger } = this.repository.resolveUpstream(
      authContext,
      context,
      ledgerQuery
    );

    const conformanceContext = this.contextBuilder.build(accountabilityLedger);
    const conformanceDashboard = this.dashboardBuilder.build(accountabilityLedger);
    const validationMatrix = this.matrixBuilder.build(accountabilityLedger);
    const complianceStatus = this.complianceStatusBuilder.build(accountabilityLedger);
    const conformanceRules = this.rulesBuilder.build(accountabilityLedger);
    const deviationAnalysis = this.deviationBuilder.build(accountabilityLedger);
    const correctiveActions = this.correctiveActionsBuilder.build(accountabilityLedger);
    const validationReport = this.validationReportBuilder.build(accountabilityLedger);
    const conformanceConfidence = this.confidenceBuilder.build(accountabilityLedger);
    const delegationConformanceValidation = this.delegationBuilder.build(accountabilityLedger);

    const outputId = `conformance-validation-${accountabilityLedger.outputId}`;

    const conformanceExplanation = this.explanationBuilder.build({
      outputId,
      goal: accountabilityLedger.goal,
      dashboard: conformanceDashboard,
      validationMatrix,
      conformanceRules,
      conformanceConfidenceScore: conformanceConfidence.score,
    });

    return {
      outputId,
      accountabilityLedgerOutputId: accountabilityLedger.outputId,
      governanceAssuranceOutputId: accountabilityLedger.governanceAssuranceOutputId,
      executiveAdvisoryOutputId: accountabilityLedger.executiveAdvisoryOutputId,
      predictiveForecastOutputId: accountabilityLedger.predictiveForecastOutputId,
      strategicIntelligenceOutputId: accountabilityLedger.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: accountabilityLedger.decisionIntelligenceOutputId,
      orchestrationOutputId: accountabilityLedger.orchestrationOutputId,
      foundationOutputId: accountabilityLedger.foundationOutputId,
      closureOutputId: accountabilityLedger.closureOutputId,
      canonicalActionId: accountabilityLedger.canonicalActionId,
      scenarioId: accountabilityLedger.scenarioId,
      goal: accountabilityLedger.goal,
      conformanceContext,
      conformanceDashboard,
      validationMatrix,
      complianceStatus,
      conformanceRules,
      deviationAnalysis,
      correctiveActions,
      validationReport,
      conformanceConfidence,
      delegationConformanceValidation,
      conformanceExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiConformanceValidationExperienceQuery
): AiConformanceValidationExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toAccountabilityLedgerQuery(
  query: AiConformanceValidationExperienceQuery
): AiAccountabilityLedgerExperienceQuery {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiConformanceValidationExperienceService(
  deps?: ConstructorParameters<typeof AiConformanceValidationExperienceService>[0]
): AiConformanceValidationExperienceService {
  return new AiConformanceValidationExperienceService(deps);
}

export function createAiConformanceValidationExperienceModule(deps?: {
  repository?: AiConformanceValidationExperienceRepository;
  aiAccountabilityLedgerExperience?: AiAccountabilityLedgerExperienceService;
}) {
  const aiAccountabilityLedgerExperience =
    deps?.aiAccountabilityLedgerExperience ?? createAiAccountabilityLedgerExperienceService();
  const aiConformanceValidationExperience = createAiConformanceValidationExperienceService({
    aiAccountabilityLedgerExperience,
    repository:
      deps?.repository ??
      createAiConformanceValidationExperienceRepository({ aiAccountabilityLedgerExperience }),
  });
  return { aiConformanceValidationExperience };
}

export type AiConformanceValidationExperienceModule = ReturnType<
  typeof createAiConformanceValidationExperienceModule
>;
