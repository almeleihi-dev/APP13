import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiGovernanceAssuranceExperienceService,
  type AiGovernanceAssuranceExperienceService,
  type AiGovernanceAssuranceExperienceQuery,
} from "../../ai-governance-assurance-experience/application/ai-governance-assurance-experience-service.js";
import {
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_JSON_SCHEMA,
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_ROUTES,
  AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
  type AccountabilityLedgerScenarioId,
} from "../domain/ai-accountability-ledger-experience-schema.js";
import type { AiAccountabilityLedgerExperienceContext } from "../domain/ai-accountability-ledger-experience-context.js";
import {
  buildAiAccountabilityLedgerExperienceHome,
  buildAiAccountabilityLedgerExperienceSummary,
  toAccountabilityLedgerDomainScreen,
  toAccountabilityLedgerExplanationScreen,
  toAccountabilityLedgerSummaryScreen,
  toAccountabilityLedgerValidationScreen,
} from "../domain/ai-accountability-ledger-experience-screens.js";
import {
  createLedgerContextBuilder,
  createLedgerDashboardBuilder,
  createAccountabilityChainBuilder,
  createDecisionTraceBuilder,
  createEvidenceRegisterBuilder,
  createResponsibilityMapBuilder,
  createAuditTrailBuilder,
  createTransparencyReportBuilder,
  createLedgerConfidenceBuilder,
  createDelegationAccountabilityLedgerBuilder,
  createLedgerExplanationBuilder,
} from "./ai-accountability-ledger-experience-builder.js";
import { createAiAccountabilityLedgerExperienceValidator } from "./ai-accountability-ledger-experience-validator.js";
import {
  createAiAccountabilityLedgerExperienceRepository,
  type AiAccountabilityLedgerExperienceRepository,
} from "../infrastructure/ai-accountability-ledger-experience-repository.js";

export interface AiAccountabilityLedgerExperienceQuery {
  scenario_id?: AccountabilityLedgerScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiAccountabilityLedgerExperienceService {
  private readonly repository: AiAccountabilityLedgerExperienceRepository;
  private readonly aiGovernanceAssuranceExperience: AiGovernanceAssuranceExperienceService;
  private readonly contextBuilder = createLedgerContextBuilder();
  private readonly dashboardBuilder = createLedgerDashboardBuilder();
  private readonly chainBuilder = createAccountabilityChainBuilder();
  private readonly decisionTraceBuilder = createDecisionTraceBuilder();
  private readonly evidenceRegisterBuilder = createEvidenceRegisterBuilder();
  private readonly responsibilityMapBuilder = createResponsibilityMapBuilder();
  private readonly auditTrailBuilder = createAuditTrailBuilder();
  private readonly transparencyReportBuilder = createTransparencyReportBuilder();
  private readonly confidenceBuilder = createLedgerConfidenceBuilder();
  private readonly delegationBuilder = createDelegationAccountabilityLedgerBuilder();
  private readonly explanationBuilder = createLedgerExplanationBuilder();
  private readonly validator = createAiAccountabilityLedgerExperienceValidator();

  constructor(deps?: {
    repository?: AiAccountabilityLedgerExperienceRepository;
    aiGovernanceAssuranceExperience?: AiGovernanceAssuranceExperienceService;
  }) {
    this.aiGovernanceAssuranceExperience =
      deps?.aiGovernanceAssuranceExperience ?? createAiGovernanceAssuranceExperienceService();
    this.repository =
      deps?.repository ??
      createAiAccountabilityLedgerExperienceRepository({
        aiGovernanceAssuranceExperience: this.aiGovernanceAssuranceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const assuranceHome = this.aiGovernanceAssuranceExperience.getHome(authContext);
    return buildAiAccountabilityLedgerExperienceHome({ scenarios: assuranceHome.scenarios });
  }

  getLedgerDashboard(
    authContext: AuthContext,
    query: AiAccountabilityLedgerExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.ledgerDashboard);
  }

  getAccountabilityChain(
    authContext: AuthContext,
    query: AiAccountabilityLedgerExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.accountabilityChain);
  }

  getDecisionTrace(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.decisionTrace);
  }

  getEvidenceRegister(
    authContext: AuthContext,
    query: AiAccountabilityLedgerExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.evidenceRegister);
  }

  getResponsibilityMap(
    authContext: AuthContext,
    query: AiAccountabilityLedgerExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.responsibilityMap);
  }

  getAuditTrail(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.auditTrail);
  }

  getTransparencyReport(
    authContext: AuthContext,
    query: AiAccountabilityLedgerExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.transparencyReport);
  }

  getConfidence(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerDomainScreen(output, output.ledgerConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toAccountabilityLedgerExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toAccountabilityLedgerSummaryScreen(buildAiAccountabilityLedgerExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toAccountabilityLedgerValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toAccountabilityLedgerValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_ROUTES,
      json_schema: AI_ACCOUNTABILITY_LEDGER_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiAccountabilityLedgerExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiAccountabilityLedgerExperienceQuery) {
    const context = toContext(query);
    const assuranceQuery = toGovernanceAssuranceQuery(query);
    const { governanceAssurance } = this.repository.resolveUpstream(
      authContext,
      context,
      assuranceQuery
    );

    const ledgerContext = this.contextBuilder.build(governanceAssurance);
    const ledgerDashboard = this.dashboardBuilder.build(governanceAssurance);
    const accountabilityChain = this.chainBuilder.build(governanceAssurance);
    const decisionTrace = this.decisionTraceBuilder.build(governanceAssurance);
    const evidenceRegister = this.evidenceRegisterBuilder.build(governanceAssurance);
    const responsibilityMap = this.responsibilityMapBuilder.build(governanceAssurance);
    const auditTrail = this.auditTrailBuilder.build(governanceAssurance);
    const transparencyReport = this.transparencyReportBuilder.build(governanceAssurance);
    const ledgerConfidence = this.confidenceBuilder.build(governanceAssurance);
    const delegationAccountabilityLedger = this.delegationBuilder.build(governanceAssurance);

    const outputId = `accountability-ledger-${governanceAssurance.outputId}`;

    const ledgerExplanation = this.explanationBuilder.build({
      outputId,
      goal: governanceAssurance.goal,
      dashboard: ledgerDashboard,
      accountabilityChain,
      evidenceRegister,
      ledgerConfidenceScore: ledgerConfidence.score,
    });

    return {
      outputId,
      governanceAssuranceOutputId: governanceAssurance.outputId,
      executiveAdvisoryOutputId: governanceAssurance.executiveAdvisoryOutputId,
      predictiveForecastOutputId: governanceAssurance.predictiveForecastOutputId,
      strategicIntelligenceOutputId: governanceAssurance.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: governanceAssurance.decisionIntelligenceOutputId,
      orchestrationOutputId: governanceAssurance.orchestrationOutputId,
      foundationOutputId: governanceAssurance.foundationOutputId,
      closureOutputId: governanceAssurance.closureOutputId,
      canonicalActionId: governanceAssurance.canonicalActionId,
      scenarioId: governanceAssurance.scenarioId,
      goal: governanceAssurance.goal,
      ledgerContext,
      ledgerDashboard,
      accountabilityChain,
      decisionTrace,
      evidenceRegister,
      responsibilityMap,
      auditTrail,
      transparencyReport,
      ledgerConfidence,
      delegationAccountabilityLedger,
      ledgerExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiAccountabilityLedgerExperienceQuery
): AiAccountabilityLedgerExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toGovernanceAssuranceQuery(
  query: AiAccountabilityLedgerExperienceQuery
): AiGovernanceAssuranceExperienceQuery {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiAccountabilityLedgerExperienceService(
  deps?: ConstructorParameters<typeof AiAccountabilityLedgerExperienceService>[0]
): AiAccountabilityLedgerExperienceService {
  return new AiAccountabilityLedgerExperienceService(deps);
}

export function createAiAccountabilityLedgerExperienceModule(deps?: {
  repository?: AiAccountabilityLedgerExperienceRepository;
  aiGovernanceAssuranceExperience?: AiGovernanceAssuranceExperienceService;
}) {
  const aiGovernanceAssuranceExperience =
    deps?.aiGovernanceAssuranceExperience ?? createAiGovernanceAssuranceExperienceService();
  const aiAccountabilityLedgerExperience = createAiAccountabilityLedgerExperienceService({
    aiGovernanceAssuranceExperience,
    repository:
      deps?.repository ??
      createAiAccountabilityLedgerExperienceRepository({ aiGovernanceAssuranceExperience }),
  });
  return { aiAccountabilityLedgerExperience };
}

export type AiAccountabilityLedgerExperienceModule = ReturnType<
  typeof createAiAccountabilityLedgerExperienceModule
>;
