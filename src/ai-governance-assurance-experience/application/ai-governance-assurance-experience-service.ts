import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiExecutiveAdvisoryExperienceService,
  type AiExecutiveAdvisoryExperienceService,
  type AiExecutiveAdvisoryExperienceQuery,
} from "../../ai-executive-advisory-experience/application/ai-executive-advisory-experience-service.js";
import {
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_JSON_SCHEMA,
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_ROUTES,
  AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
  type GovernanceAssuranceScenarioId,
} from "../domain/ai-governance-assurance-experience-schema.js";
import type { AiGovernanceAssuranceExperienceContext } from "../domain/ai-governance-assurance-experience-context.js";
import {
  buildAiGovernanceAssuranceExperienceHome,
  buildAiGovernanceAssuranceExperienceSummary,
  toGovernanceAssuranceDomainScreen,
  toGovernanceAssuranceExplanationScreen,
  toGovernanceAssuranceSummaryScreen,
  toGovernanceAssuranceValidationScreen,
} from "../domain/ai-governance-assurance-experience-screens.js";
import {
  createGovernanceContextBuilder,
  createGovernanceDashboardBuilder,
  createPolicyAlignmentBuilder,
  createControlMapBuilder,
  createAssuranceChecksBuilder,
  createRiskControlsBuilder,
  createAccountabilityBuilder,
  createEscalationGuidanceBuilder,
  createAssuranceConfidenceBuilder,
  createDelegationGovernanceAssuranceBuilder,
  createAssuranceExplanationBuilder,
} from "./ai-governance-assurance-experience-builder.js";
import { createAiGovernanceAssuranceExperienceValidator } from "./ai-governance-assurance-experience-validator.js";
import {
  createAiGovernanceAssuranceExperienceRepository,
  type AiGovernanceAssuranceExperienceRepository,
} from "../infrastructure/ai-governance-assurance-experience-repository.js";

export interface AiGovernanceAssuranceExperienceQuery {
  scenario_id?: GovernanceAssuranceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiGovernanceAssuranceExperienceService {
  private readonly repository: AiGovernanceAssuranceExperienceRepository;
  private readonly aiExecutiveAdvisoryExperience: AiExecutiveAdvisoryExperienceService;
  private readonly contextBuilder = createGovernanceContextBuilder();
  private readonly dashboardBuilder = createGovernanceDashboardBuilder();
  private readonly policyAlignmentBuilder = createPolicyAlignmentBuilder();
  private readonly controlMapBuilder = createControlMapBuilder();
  private readonly assuranceChecksBuilder = createAssuranceChecksBuilder();
  private readonly riskControlsBuilder = createRiskControlsBuilder();
  private readonly accountabilityBuilder = createAccountabilityBuilder();
  private readonly escalationGuidanceBuilder = createEscalationGuidanceBuilder();
  private readonly confidenceBuilder = createAssuranceConfidenceBuilder();
  private readonly delegationBuilder = createDelegationGovernanceAssuranceBuilder();
  private readonly explanationBuilder = createAssuranceExplanationBuilder();
  private readonly validator = createAiGovernanceAssuranceExperienceValidator();

  constructor(deps?: {
    repository?: AiGovernanceAssuranceExperienceRepository;
    aiExecutiveAdvisoryExperience?: AiExecutiveAdvisoryExperienceService;
  }) {
    this.aiExecutiveAdvisoryExperience =
      deps?.aiExecutiveAdvisoryExperience ?? createAiExecutiveAdvisoryExperienceService();
    this.repository =
      deps?.repository ??
      createAiGovernanceAssuranceExperienceRepository({
        aiExecutiveAdvisoryExperience: this.aiExecutiveAdvisoryExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const advisoryHome = this.aiExecutiveAdvisoryExperience.getHome(authContext);
    return buildAiGovernanceAssuranceExperienceHome({ scenarios: advisoryHome.scenarios });
  }

  getGovernanceDashboard(
    authContext: AuthContext,
    query: AiGovernanceAssuranceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.governanceDashboard);
  }

  getPolicyAlignment(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.policyAlignment);
  }

  getControlMap(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.controlMap);
  }

  getAssuranceChecks(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.assuranceChecks);
  }

  getRiskControls(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.riskControls);
  }

  getAccountability(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.accountability);
  }

  getEscalationGuidance(
    authContext: AuthContext,
    query: AiGovernanceAssuranceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.escalationGuidance);
  }

  getConfidence(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceDomainScreen(output, output.assuranceConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toGovernanceAssuranceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toGovernanceAssuranceSummaryScreen(buildAiGovernanceAssuranceExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toGovernanceAssuranceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toGovernanceAssuranceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_ROUTES,
      json_schema: AI_GOVERNANCE_ASSURANCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiGovernanceAssuranceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiGovernanceAssuranceExperienceQuery) {
    const context = toContext(query);
    const advisoryQuery = toExecutiveAdvisoryQuery(query);
    const { executiveAdvisory } = this.repository.resolveUpstream(
      authContext,
      context,
      advisoryQuery
    );

    const governanceContext = this.contextBuilder.build(executiveAdvisory);
    const governanceDashboard = this.dashboardBuilder.build(executiveAdvisory);
    const policyAlignment = this.policyAlignmentBuilder.build(executiveAdvisory);
    const controlMap = this.controlMapBuilder.build(executiveAdvisory);
    const assuranceChecks = this.assuranceChecksBuilder.build(executiveAdvisory);
    const riskControls = this.riskControlsBuilder.build(executiveAdvisory);
    const accountability = this.accountabilityBuilder.build(executiveAdvisory);
    const escalationGuidance = this.escalationGuidanceBuilder.build(executiveAdvisory);
    const assuranceConfidence = this.confidenceBuilder.build(executiveAdvisory);
    const delegationGovernanceAssurance = this.delegationBuilder.build(executiveAdvisory);

    const outputId = `governance-assurance-${executiveAdvisory.outputId}`;

    const assuranceExplanation = this.explanationBuilder.build({
      outputId,
      goal: executiveAdvisory.goal,
      dashboard: governanceDashboard,
      policyAlignment,
      controlMap,
      assuranceConfidenceScore: assuranceConfidence.score,
    });

    return {
      outputId,
      executiveAdvisoryOutputId: executiveAdvisory.outputId,
      predictiveForecastOutputId: executiveAdvisory.predictiveForecastOutputId,
      strategicIntelligenceOutputId: executiveAdvisory.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: executiveAdvisory.decisionIntelligenceOutputId,
      orchestrationOutputId: executiveAdvisory.orchestrationOutputId,
      foundationOutputId: executiveAdvisory.foundationOutputId,
      closureOutputId: executiveAdvisory.closureOutputId,
      canonicalActionId: executiveAdvisory.canonicalActionId,
      scenarioId: executiveAdvisory.scenarioId,
      goal: executiveAdvisory.goal,
      governanceContext,
      governanceDashboard,
      policyAlignment,
      controlMap,
      assuranceChecks,
      riskControls,
      accountability,
      escalationGuidance,
      assuranceConfidence,
      delegationGovernanceAssurance,
      assuranceExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiGovernanceAssuranceExperienceQuery
): AiGovernanceAssuranceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toExecutiveAdvisoryQuery(
  query: AiGovernanceAssuranceExperienceQuery
): AiExecutiveAdvisoryExperienceQuery {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiGovernanceAssuranceExperienceService(
  deps?: ConstructorParameters<typeof AiGovernanceAssuranceExperienceService>[0]
): AiGovernanceAssuranceExperienceService {
  return new AiGovernanceAssuranceExperienceService(deps);
}

export function createAiGovernanceAssuranceExperienceModule(deps?: {
  repository?: AiGovernanceAssuranceExperienceRepository;
  aiExecutiveAdvisoryExperience?: AiExecutiveAdvisoryExperienceService;
}) {
  const aiExecutiveAdvisoryExperience =
    deps?.aiExecutiveAdvisoryExperience ?? createAiExecutiveAdvisoryExperienceService();
  const aiGovernanceAssuranceExperience = createAiGovernanceAssuranceExperienceService({
    aiExecutiveAdvisoryExperience,
    repository:
      deps?.repository ??
      createAiGovernanceAssuranceExperienceRepository({ aiExecutiveAdvisoryExperience }),
  });
  return { aiGovernanceAssuranceExperience };
}

export type AiGovernanceAssuranceExperienceModule = ReturnType<
  typeof createAiGovernanceAssuranceExperienceModule
>;
