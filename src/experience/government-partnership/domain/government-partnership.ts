import { formatMinorAmount } from "../../../experience/format.js";
import {
  buildExecutiveCommandCenterSnapshot,
} from "../../executive-command-center/domain/executive-command-center.js";
import {
  buildInvestorReadinessSnapshot,
  type InvestorReadinessRawSnapshot,
  type InvestorReadinessSnapshot,
} from "../../investor-readiness/domain/investor-readiness.js";
import {
  buildLaunchSimulationSnapshot,
  findScenarioSimulation,
  type LaunchSimulationSnapshot,
} from "../../launch-simulation/domain/launch-simulation.js";

export interface GovernmentPartnershipRawSnapshot {
  investorRaw: InvestorReadinessRawSnapshot;
}

export type RegulatoryAlignmentStatus = "aligned" | "partially_aligned" | "attention_required";

export type PartnershipMatrixTarget =
  | "government"
  | "banking"
  | "insurance"
  | "workforce"
  | "enterprise";

export type IntegrationMaturity = "emerging" | "developing" | "mature";

export interface GovernmentPartnershipOverview {
  headline: string;
  governmentReadinessScore: number;
  executiveHealthScore: number;
  investorReadinessScore: number;
  marketplaceHealthScore: number;
  simulationReadinessScore: number;
  partnershipMaturityScore: number;
  summary: string;
}

export interface EconomicScaleProjection {
  level: "100k" | "1m" | "10m";
  targetUsers: number;
  projectedContractVolumeMinor: number;
  projectedContractVolumeLabel: string;
  projectedEscrowVolumeMinor: number;
  projectedEscrowVolumeLabel: string;
  projectedTransactionVolumeMinor: number;
  projectedTransactionVolumeLabel: string;
}

export interface EconomicImpact {
  currencyCode: string;
  annualizedContractVolumeMinor: number;
  annualizedContractVolumeLabel: string;
  annualizedEscrowVolumeMinor: number;
  annualizedEscrowVolumeLabel: string;
  annualizedTransactionVolumeMinor: number;
  annualizedTransactionVolumeLabel: string;
  platformEconomicActivityMinor: number;
  platformEconomicActivityLabel: string;
  scaleProjections: EconomicScaleProjection[];
  summary: string;
}

export interface WorkforceImpact {
  activeProviders: number;
  activeCustomers: number;
  opportunityCreationCount: number;
  actionExecutionVolume: number;
  skillDemandIndicators: string[];
  workforceParticipationPercent: number;
  summary: string;
}

export interface FinancialAlignmentTarget {
  target: "central_bank" | "banks" | "payment_ecosystem";
  escrowCoveragePercent: number;
  transactionProtectionScore: number;
  refundTransparencyScore: number;
  financialReadinessScore: number;
  integrationMaturity: IntegrationMaturity;
  summary: string;
}

export interface FinancialAlignment {
  targets: FinancialAlignmentTarget[];
  summary: string;
}

export interface InsuranceAlignmentTarget {
  target: "insurance_authority" | "insurers";
  insurableContracts: number;
  claimOpportunityIndicators: string[];
  riskCategories: string[];
  coverageReadinessScore: number;
  insurancePartnershipScore: number;
  summary: string;
}

export interface InsuranceAlignment {
  targets: InsuranceAlignmentTarget[];
  summary: string;
}

export interface WorkforceDevelopmentTarget {
  target: "hr_ministries" | "workforce_programs" | "sme_development";
  skillGaps: string[];
  opportunityDemand: number;
  workforceReadinessScore: number;
  smeParticipationPercent: number;
  employmentImpactScore: number;
  summary: string;
}

export interface WorkforceDevelopmentAlignment {
  targets: WorkforceDevelopmentTarget[];
  summary: string;
}

export interface DigitalGovernmentTarget {
  target: "digital_transformation" | "data_ai_authorities" | "digital_government_entities";
  verifiedUsers: number;
  trustInfrastructureScore: number;
  digitalTransactionIndicators: string[];
  complianceIndicators: string[];
  digitalReadinessScore: number;
  summary: string;
}

export interface DigitalGovernmentAlignment {
  targets: DigitalGovernmentTarget[];
  summary: string;
}

export interface RegulatoryAlignmentEntry {
  category: "identity" | "trust" | "financial" | "execution" | "escrow" | "auditability";
  status: RegulatoryAlignmentStatus;
  label: string;
  message: string;
}

export interface RegulatoryAlignment {
  entries: RegulatoryAlignmentEntry[];
  alignedCount: number;
  partiallyAlignedCount: number;
  attentionRequiredCount: number;
  summary: string;
}

export interface PartnershipMatrixEntry {
  target: PartnershipMatrixTarget;
  readinessScore: number;
  strategicValue: "high" | "medium" | "essential";
  integrationMaturity: IntegrationMaturity;
  requiredActions: string[];
  nextMilestone: string;
}

export interface PartnershipMatrix {
  entries: PartnershipMatrixEntry[];
  summary: string;
}

export interface GovernmentReadinessScore {
  score: number;
  status: "partnership_ready" | "developing" | "attention_required";
  economicWeight: number;
  workforceWeight: number;
  financialWeight: number;
  insuranceWeight: number;
  digitalWeight: number;
  regulatoryWeight: number;
  summary: string;
}

export interface GovernmentPartnershipSnapshot {
  overview: GovernmentPartnershipOverview;
  economicImpact: EconomicImpact;
  workforceImpact: WorkforceImpact;
  financialAlignment: FinancialAlignment;
  insuranceAlignment: InsuranceAlignment;
  workforceDevelopment: WorkforceDevelopmentAlignment;
  digitalGovernment: DigitalGovernmentAlignment;
  regulatoryAlignment: RegulatoryAlignment;
  partnershipMatrix: PartnershipMatrix;
  governmentScore: GovernmentReadinessScore;
  generatedAt: Date;
}

export interface GovernmentPartnershipCenter {
  overview: GovernmentPartnershipOverview;
  economicImpact: EconomicImpact;
  workforceImpact: WorkforceImpact;
  financialAlignment: FinancialAlignment;
  insuranceAlignment: InsuranceAlignment;
  workforceDevelopment: WorkforceDevelopmentAlignment;
  digitalGovernment: DigitalGovernmentAlignment;
  regulatoryAlignment: RegulatoryAlignment;
  partnershipMatrix: PartnershipMatrix;
  governmentScore: GovernmentReadinessScore;
  generatedAt: Date;
}

export interface GovernmentPartnershipOverviewView {
  headline: string;
  government_readiness_score: number;
  executive_health_score: number;
  investor_readiness_score: number;
  marketplace_health_score: number;
  simulation_readiness_score: number;
  partnership_maturity_score: number;
  summary: string;
}

export interface EconomicScaleProjectionView {
  level: "100k" | "1m" | "10m";
  target_users: number;
  projected_contract_volume_minor: number;
  projected_contract_volume_label: string;
  projected_escrow_volume_minor: number;
  projected_escrow_volume_label: string;
  projected_transaction_volume_minor: number;
  projected_transaction_volume_label: string;
}

export interface EconomicImpactView {
  currency_code: string;
  annualized_contract_volume_minor: number;
  annualized_contract_volume_label: string;
  annualized_escrow_volume_minor: number;
  annualized_escrow_volume_label: string;
  annualized_transaction_volume_minor: number;
  annualized_transaction_volume_label: string;
  platform_economic_activity_minor: number;
  platform_economic_activity_label: string;
  scale_projections: EconomicScaleProjectionView[];
  summary: string;
}

export interface WorkforceImpactView {
  active_providers: number;
  active_customers: number;
  opportunity_creation_count: number;
  action_execution_volume: number;
  skill_demand_indicators: string[];
  workforce_participation_percent: number;
  summary: string;
}

export interface FinancialAlignmentTargetView {
  target: FinancialAlignmentTarget["target"];
  escrow_coverage_percent: number;
  transaction_protection_score: number;
  refund_transparency_score: number;
  financial_readiness_score: number;
  integration_maturity: IntegrationMaturity;
  summary: string;
}

export interface FinancialAlignmentView {
  targets: FinancialAlignmentTargetView[];
  summary: string;
}

export interface InsuranceAlignmentTargetView {
  target: InsuranceAlignmentTarget["target"];
  insurable_contracts: number;
  claim_opportunity_indicators: string[];
  risk_categories: string[];
  coverage_readiness_score: number;
  insurance_partnership_score: number;
  summary: string;
}

export interface InsuranceAlignmentView {
  targets: InsuranceAlignmentTargetView[];
  summary: string;
}

export interface WorkforceDevelopmentTargetView {
  target: WorkforceDevelopmentTarget["target"];
  skill_gaps: string[];
  opportunity_demand: number;
  workforce_readiness_score: number;
  sme_participation_percent: number;
  employment_impact_score: number;
  summary: string;
}

export interface WorkforceDevelopmentView {
  targets: WorkforceDevelopmentTargetView[];
  summary: string;
}

export interface DigitalGovernmentTargetView {
  target: DigitalGovernmentTarget["target"];
  verified_users: number;
  trust_infrastructure_score: number;
  digital_transaction_indicators: string[];
  compliance_indicators: string[];
  digital_readiness_score: number;
  summary: string;
}

export interface DigitalGovernmentAlignmentView {
  targets: DigitalGovernmentTargetView[];
  summary: string;
}

export interface RegulatoryAlignmentEntryView {
  category: RegulatoryAlignmentEntry["category"];
  status: RegulatoryAlignmentStatus;
  label: string;
  message: string;
}

export interface RegulatoryAlignmentView {
  entries: RegulatoryAlignmentEntryView[];
  aligned_count: number;
  partially_aligned_count: number;
  attention_required_count: number;
  summary: string;
}

export interface PartnershipMatrixEntryView {
  target: PartnershipMatrixTarget;
  readiness_score: number;
  strategic_value: PartnershipMatrixEntry["strategicValue"];
  integration_maturity: IntegrationMaturity;
  required_actions: string[];
  next_milestone: string;
}

export interface PartnershipMatrixView {
  entries: PartnershipMatrixEntryView[];
  summary: string;
}

export interface GovernmentReadinessScoreView {
  score: number;
  status: GovernmentReadinessScore["status"];
  economic_weight: number;
  workforce_weight: number;
  financial_weight: number;
  insurance_weight: number;
  digital_weight: number;
  regulatory_weight: number;
  summary: string;
}

export interface GovernmentPartnershipCenterView {
  overview: GovernmentPartnershipOverviewView;
  economic_impact: EconomicImpactView;
  workforce: WorkforceImpactView;
  financial: FinancialAlignmentView;
  insurance: InsuranceAlignmentView;
  workforce_development: WorkforceDevelopmentView;
  digital_government: DigitalGovernmentAlignmentView;
  regulatory: RegulatoryAlignmentView;
  partnerships: PartnershipMatrixView;
  government_score: GovernmentReadinessScoreView;
  generated_at: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveIntegrationMaturity(score: number): IntegrationMaturity {
  if (score >= 75) return "mature";
  if (score >= 55) return "developing";
  return "emerging";
}

function deriveRegulatoryStatus(score: number): RegulatoryAlignmentStatus {
  if (score >= 75) return "aligned";
  if (score >= 50) return "partially_aligned";
  return "attention_required";
}

function annualizeDaily(minor: number): number {
  return minor * 365;
}

function getSimulationContext(raw: InvestorReadinessRawSnapshot, generatedAt?: Date) {
  const investor = buildInvestorReadinessSnapshot({ raw, generatedAt });
  const simulation = buildLaunchSimulationSnapshot({
    raw: raw.launchRaw,
    generatedAt,
  });
  const executive = buildExecutiveCommandCenterSnapshot({
    raw: raw.launchRaw.executiveRaw,
    generatedAt,
  });

  return { investor, simulation, executive };
}

export function buildGovernmentPartnershipOverview(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  governmentScore: number;
}): GovernmentPartnershipOverview {
  const governmentTarget = input.investor.partnershipReadiness.targets.find(
    (entry) => entry.target === "government"
  );

  return {
    headline: "Government partnership center",
    governmentReadinessScore: input.governmentScore,
    executiveHealthScore: input.investor.overview.executiveHealthScore,
    investorReadinessScore: input.investor.investorScore.score,
    marketplaceHealthScore: input.investor.overview.marketplaceHealthScore,
    simulationReadinessScore: input.simulation.overview.executiveSimulationScore,
    partnershipMaturityScore: governmentTarget?.readinessScore ?? 0,
    summary: `Government partnership overview with readiness ${input.governmentScore}, investor score ${input.investor.investorScore.score}, and simulation readiness ${input.simulation.overview.executiveSimulationScore}.`,
  };
}

export function buildEconomicImpact(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
}): EconomicImpact {
  const currencyCode = input.investor.revenuePotential.currencyCode;
  const dailyContract =
    input.simulation.baseline.averageContractValueMinor * input.simulation.baseline.dailyContracts;
  const dailyEscrow = Math.round(dailyContract * 0.95);
  const dailyTransaction = dailyContract;
  const annualizedContractVolumeMinor = annualizeDaily(dailyContract);
  const annualizedEscrowVolumeMinor = annualizeDaily(dailyEscrow);
  const annualizedTransactionVolumeMinor = annualizeDaily(dailyTransaction);
  const platformEconomicActivityMinor =
    annualizedContractVolumeMinor + input.investor.revenuePotential.currentPlatformRevenueMinor;

  const scaleProjections: EconomicScaleProjection[] = input.investor.revenuePotential.projections.map(
    (projection) => ({
      level: projection.level,
      targetUsers: projection.targetUsers,
      projectedContractVolumeMinor: annualizeDaily(projection.projectedTransactionVolumeMinor),
      projectedContractVolumeLabel: formatMinorAmount(
        annualizeDaily(projection.projectedTransactionVolumeMinor),
        currencyCode
      ),
      projectedEscrowVolumeMinor: annualizeDaily(projection.projectedEscrowVolumeMinor),
      projectedEscrowVolumeLabel: formatMinorAmount(
        annualizeDaily(projection.projectedEscrowVolumeMinor),
        currencyCode
      ),
      projectedTransactionVolumeMinor: annualizeDaily(projection.projectedTransactionVolumeMinor),
      projectedTransactionVolumeLabel: formatMinorAmount(
        annualizeDaily(projection.projectedTransactionVolumeMinor),
        currencyCode
      ),
    })
  );

  return {
    currencyCode,
    annualizedContractVolumeMinor,
    annualizedContractVolumeLabel: formatMinorAmount(annualizedContractVolumeMinor, currencyCode),
    annualizedEscrowVolumeMinor,
    annualizedEscrowVolumeLabel: formatMinorAmount(annualizedEscrowVolumeMinor, currencyCode),
    annualizedTransactionVolumeMinor,
    annualizedTransactionVolumeLabel: formatMinorAmount(
      annualizedTransactionVolumeMinor,
      currencyCode
    ),
    platformEconomicActivityMinor,
    platformEconomicActivityLabel: formatMinorAmount(platformEconomicActivityMinor, currencyCode),
    scaleProjections,
    summary: `Annualized contract volume ${formatMinorAmount(annualizedContractVolumeMinor, currencyCode)} with scale projections through 10m users.`,
  };
}

export function buildWorkforceImpact(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  activeCustomers: number;
}): WorkforceImpact {
  const analytics = input.simulation.baseline;
  const expected1m = findScenarioSimulation(input.simulation.scenarios, "expected", "1m");
  const skillDemandIndicators = [
    `Provider demand ratio ${expected1m?.marketplace.providerDemandRatio ?? analytics.providerDemandRatio}`,
    `${input.investor.marketOpportunity.opportunityCount} marketplace opportunity signals`,
    `${input.executive.marketplace.openRequests} open request intents`,
  ];
  const workforceParticipationPercent = clamp(
    Math.round(
      (analytics.activeProviders / Math.max(1, analytics.activeUsers + analytics.activeProviders)) *
        100
    ),
    0,
    100
  );

  return {
    activeProviders: analytics.activeProviders,
    activeCustomers: input.activeCustomers,
    opportunityCreationCount: input.investor.marketOpportunity.opportunityCount,
    actionExecutionVolume: Math.round(
      input.simulation.baseline.dailyContracts * input.simulation.baseline.evidencePerContract
    ),
    skillDemandIndicators,
    workforceParticipationPercent,
    summary: `${analytics.activeProviders} active providers and ${workforceParticipationPercent}% workforce participation with ${input.investor.marketOpportunity.opportunityCount} opportunity signals.`,
  };
}

function buildFinancialTarget(input: {
  target: FinancialAlignmentTarget["target"];
  investor: InvestorReadinessSnapshot;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
}): FinancialAlignmentTarget {
  const escrowCoveragePercent = clamp(
    Math.round(
      (input.executive.financial.fundedMinor /
        Math.max(1, input.executive.financial.fundedMinor + input.executive.financial.pendingFundingCount)) *
        100
    ),
    0,
    100
  );
  const transactionProtectionScore = clamp(
    100 - input.executive.financial.frozenEscrowCount * 15,
    0,
    100
  );
  const refundTransparencyScore = clamp(90 - input.investor.riskMatrix.highRiskCount * 10, 0, 100);
  const financialReadinessScore = input.investor.overview.financialScore;
  const integrationMaturity = deriveIntegrationMaturity(financialReadinessScore);

  return {
    target: input.target,
    escrowCoveragePercent,
    transactionProtectionScore,
    refundTransparencyScore,
    financialReadinessScore,
    integrationMaturity,
    summary: `${input.target.replace("_", " ")} alignment with ${escrowCoveragePercent}% escrow coverage and financial readiness ${financialReadinessScore}.`,
  };
}

export function buildFinancialAlignment(input: {
  investor: InvestorReadinessSnapshot;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
}): FinancialAlignment {
  const targets = (
    ["central_bank", "banks", "payment_ecosystem"] as FinancialAlignmentTarget["target"][]
  ).map((target) => buildFinancialTarget({ target, ...input }));

  return {
    targets,
    summary: `Financial ecosystem alignment across ${targets.length} institutional targets with average readiness ${Math.round(targets.reduce((total, entry) => total + entry.financialReadinessScore, 0) / targets.length)}.`,
  };
}

export function buildInsuranceAlignment(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
}): InsuranceAlignment {
  const insuranceTarget = input.investor.partnershipReadiness.targets.find(
    (entry) => entry.target === "insurance"
  );
  const expected1m = findScenarioSimulation(input.simulation.scenarios, "expected", "1m");
  const insurableContracts = expected1m?.marketplace.completedContracts ?? input.simulation.baseline.dailyContracts;
  const coverageReadinessScore = insuranceTarget?.readinessScore ?? input.investor.overview.trustScore;
  const insurancePartnershipScore = clamp(
    Math.round(coverageReadinessScore * 0.6 + input.investor.overview.trustScore * 0.4),
    0,
    100
  );

  const base = {
    insurableContracts,
    claimOpportunityIndicators: [
      `${expected1m?.trust.disputes ?? 0} projected daily disputes at 1m scale`,
      `${input.investor.riskMatrix.highRiskCount} high-risk investor categories`,
    ],
    riskCategories: input.investor.riskMatrix.entries.map((entry) => entry.category),
    coverageReadinessScore,
    insurancePartnershipScore,
  };

  return {
    targets: [
      {
        target: "insurance_authority",
        ...base,
        summary: `Insurance authority review with coverage readiness ${coverageReadinessScore}.`,
      },
      {
        target: "insurers",
        ...base,
        summary: `Insurer partnership score ${insurancePartnershipScore} with ${insurableContracts} insurable daily contracts at scale.`,
      },
    ],
    summary: `Insurance ecosystem alignment with partnership score ${insurancePartnershipScore}.`,
  };
}

export function buildWorkforceDevelopmentAlignment(input: {
  investor: InvestorReadinessSnapshot;
  simulation: LaunchSimulationSnapshot;
}): WorkforceDevelopmentAlignment {
  const workforceTarget = input.investor.partnershipReadiness.targets.find(
    (entry) => entry.target === "workforce_development"
  );
  const expected1m = findScenarioSimulation(input.simulation.scenarios, "expected", "1m");
  const opportunityDemand = expected1m?.marketplace.dailyRequests ?? input.simulation.baseline.dailyRequests;
  const workforceReadinessScore = workforceTarget?.readinessScore ?? 0;
  const smeParticipationPercent = clamp(
    Math.round(
      (input.simulation.baseline.activeProviders /
        Math.max(1, expected1m?.targetUsers ?? input.simulation.baseline.activeUsers)) *
        10000
    ) / 100,
    0,
    100
  );
  const employmentImpactScore = clamp(
    Math.round(workforceReadinessScore * 0.5 + smeParticipationPercent * 0.5),
    0,
    100
  );
  const skillGaps = [
    "Thin provider coverage for high-demand action codes",
    `${input.investor.marketOpportunity.demandSupplyBalance} demand/supply balance at scale`,
  ];

  const base = {
    skillGaps,
    opportunityDemand,
    workforceReadinessScore,
    smeParticipationPercent,
    employmentImpactScore,
  };

  return {
    targets: (
      ["hr_ministries", "workforce_programs", "sme_development"] as WorkforceDevelopmentTarget["target"][]
    ).map((target) => ({
      target,
      ...base,
      summary: `${target.replace("_", " ")} alignment with workforce readiness ${workforceReadinessScore} and employment impact ${employmentImpactScore}.`,
    })),
    summary: `Workforce development alignment with ${opportunityDemand} projected daily opportunities at 1m scale.`,
  };
}

export function buildDigitalGovernmentAlignment(input: {
  investor: InvestorReadinessSnapshot;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
  simulation: LaunchSimulationSnapshot;
}): DigitalGovernmentAlignment {
  const verifiedUsers = input.simulation.baseline.activeUsers + input.simulation.baseline.activeProviders;
  const trustInfrastructureScore = input.executive.trust.averageTrustScore;
  const digitalReadinessScore = clamp(
    Math.round(
      trustInfrastructureScore * 0.35 +
        input.investor.overview.releaseReadinessScore * 0.25 +
        input.investor.scaleReadiness.simulationConfidenceScore * 0.4
    ),
    0,
    100
  );
  const digitalTransactionIndicators = [
    `${input.simulation.baseline.dailyContracts} daily contract transactions`,
    `${input.executive.financial.fundedLabel} escrow-backed activity`,
  ];
  const complianceIndicators = [
    `${input.investor.overview.releaseReadinessScore} release readiness score`,
    `${input.executive.releaseReadiness.blockerCount} launch blockers`,
  ];

  const base = {
    verifiedUsers,
    trustInfrastructureScore,
    digitalTransactionIndicators,
    complianceIndicators,
    digitalReadinessScore,
  };

  return {
    targets: (
      [
        "digital_transformation",
        "data_ai_authorities",
        "digital_government_entities",
      ] as DigitalGovernmentTarget["target"][]
    ).map((target) => ({
      target,
      ...base,
      summary: `${target.replace("_", " ")} digital readiness ${digitalReadinessScore} with ${verifiedUsers} verified marketplace participants.`,
    })),
    summary: `Digital government alignment with trust infrastructure score ${trustInfrastructureScore} and digital readiness ${digitalReadinessScore}.`,
  };
}

export function buildRegulatoryAlignment(input: {
  investor: InvestorReadinessSnapshot;
  executive: ReturnType<typeof buildExecutiveCommandCenterSnapshot>;
}): RegulatoryAlignment {
  const entries: RegulatoryAlignmentEntry[] = [
    {
      category: "identity",
      status: deriveRegulatoryStatus(input.investor.overview.releaseReadinessScore),
      label: "Identity verification",
      message: `${input.investor.overview.releaseReadinessScore} release readiness supports identity controls.`,
    },
    {
      category: "trust",
      status: deriveRegulatoryStatus(input.executive.trust.averageTrustScore),
      label: "Trust governance",
      message: input.executive.trust.summary,
    },
    {
      category: "financial",
      status: deriveRegulatoryStatus(input.investor.overview.financialScore),
      label: "Financial oversight",
      message: input.executive.financial.summary,
    },
    {
      category: "execution",
      status: deriveRegulatoryStatus(input.investor.scaleReadiness.operationalReadinessScore),
      label: "Execution oversight",
      message: input.investor.scaleReadiness.summary,
    },
    {
      category: "escrow",
      status: deriveRegulatoryStatus(
        input.executive.financial.frozenEscrowCount === 0 ? 85 : 55
      ),
      label: "Escrow regulation",
      message: `${input.executive.financial.frozenEscrowCount} frozen escrows under oversight review.`,
    },
    {
      category: "auditability",
      status: deriveRegulatoryStatus(input.investor.overview.executiveHealthScore),
      label: "Auditability",
      message: `${input.executive.strengths.length} operational strengths and ${input.investor.riskMatrix.entries.length} tracked risk categories.`,
    },
  ];

  return {
    entries,
    alignedCount: entries.filter((entry) => entry.status === "aligned").length,
    partiallyAlignedCount: entries.filter((entry) => entry.status === "partially_aligned").length,
    attentionRequiredCount: entries.filter((entry) => entry.status === "attention_required").length,
    summary: `${entries.filter((entry) => entry.status === "aligned").length} aligned and ${entries.filter((entry) => entry.status === "attention_required").length} attention-required regulatory categories.`,
  };
}

const PARTNERSHIP_TARGET_MAP: Record<
  PartnershipMatrixTarget,
  "government" | "banking" | "insurance" | "workforce_development" | "enterprise_partners"
> = {
  government: "government",
  banking: "banking",
  insurance: "insurance",
  workforce: "workforce_development",
  enterprise: "enterprise_partners",
};

export function buildPartnershipMatrix(input: {
  investor: InvestorReadinessSnapshot;
}): PartnershipMatrix {
  const entries: PartnershipMatrixEntry[] = (
    Object.keys(PARTNERSHIP_TARGET_MAP) as PartnershipMatrixTarget[]
  ).map((target) => {
    const source = input.investor.partnershipReadiness.targets.find(
      (entry) => entry.target === PARTNERSHIP_TARGET_MAP[target]
    );
    const readinessScore = source?.readinessScore ?? 0;

    return {
      target,
      readinessScore,
      strategicValue:
        target === "government" || target === "banking"
          ? "essential"
          : target === "insurance" || target === "workforce"
            ? "high"
            : "medium",
      integrationMaturity: source?.integrationMaturity ?? "emerging",
      requiredActions: source?.requiredActions ?? [],
      nextMilestone:
        readinessScore >= 75
          ? "Formal partnership review and pilot agreement"
          : readinessScore >= 55
            ? "Close readiness gaps and schedule stakeholder workshop"
            : "Complete platform readiness improvements",
    };
  });

  return {
    entries,
    summary: `Partnership matrix across ${entries.length} government and ecosystem targets with highest readiness ${Math.max(...entries.map((entry) => entry.readinessScore))}.`,
  };
}

export function computeGovernmentReadinessScore(input: {
  economicImpact: EconomicImpact;
  workforceImpact: WorkforceImpact;
  financialAlignment: FinancialAlignment;
  insuranceAlignment: InsuranceAlignment;
  digitalGovernment: DigitalGovernmentAlignment;
  regulatoryAlignment: RegulatoryAlignment;
}): GovernmentReadinessScore {
  const economicWeight = 20;
  const workforceWeight = 15;
  const financialWeight = 20;
  const insuranceWeight = 15;
  const digitalWeight = 15;
  const regulatoryWeight = 15;

  const economicScore = clamp(
    Math.round(input.economicImpact.platformEconomicActivityMinor / 100_000),
    0,
    100
  );
  const workforceScore = input.workforceImpact.workforceParticipationPercent;
  const financialScore = Math.round(
    input.financialAlignment.targets.reduce(
      (total, entry) => total + entry.financialReadinessScore,
      0
    ) / Math.max(1, input.financialAlignment.targets.length)
  );
  const insuranceScore = Math.round(
    input.insuranceAlignment.targets.reduce(
      (total, entry) => total + entry.insurancePartnershipScore,
      0
    ) / Math.max(1, input.insuranceAlignment.targets.length)
  );
  const digitalScore = Math.round(
    input.digitalGovernment.targets.reduce(
      (total, entry) => total + entry.digitalReadinessScore,
      0
    ) / Math.max(1, input.digitalGovernment.targets.length)
  );
  const regulatoryScore = clamp(
    Math.round(
      (input.regulatoryAlignment.alignedCount * 100 +
        input.regulatoryAlignment.partiallyAlignedCount * 60) /
        Math.max(1, input.regulatoryAlignment.entries.length)
    ),
    0,
    100
  );

  const score = Math.round(
    economicScore * (economicWeight / 100) +
      workforceScore * (workforceWeight / 100) +
      financialScore * (financialWeight / 100) +
      insuranceScore * (insuranceWeight / 100) +
      digitalScore * (digitalWeight / 100) +
      regulatoryScore * (regulatoryWeight / 100)
  );

  let status: GovernmentReadinessScore["status"] = "attention_required";
  if (score >= 75) status = "partnership_ready";
  else if (score >= 55) status = "developing";

  return {
    score,
    status,
    economicWeight,
    workforceWeight,
    financialWeight,
    insuranceWeight,
    digitalWeight,
    regulatoryWeight,
    summary: `Government readiness score ${score} (${status.replace("_", " ")}) across economic, workforce, financial, insurance, digital, and regulatory dimensions.`,
  };
}

export function buildGovernmentPartnershipSnapshot(input: {
  raw: GovernmentPartnershipRawSnapshot;
  generatedAt?: Date;
}): GovernmentPartnershipSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const { investor, simulation, executive } = getSimulationContext(input.raw.investorRaw, generatedAt);

  const activeCustomers =
    input.raw.investorRaw.launchRaw.executiveRaw.marketplaceRaw.analyticsSnapshot.users
      .activeCustomers;

  const economicImpact = buildEconomicImpact({ investor, simulation });
  const workforceImpact = buildWorkforceImpact({
    investor,
    simulation,
    executive,
    activeCustomers,
  });
  const financialAlignment = buildFinancialAlignment({ investor, executive });
  const insuranceAlignment = buildInsuranceAlignment({ investor, simulation });
  const workforceDevelopment = buildWorkforceDevelopmentAlignment({ investor, simulation });
  const digitalGovernment = buildDigitalGovernmentAlignment({ investor, executive, simulation });
  const regulatoryAlignment = buildRegulatoryAlignment({ investor, executive });
  const partnershipMatrix = buildPartnershipMatrix({ investor });
  const governmentScore = computeGovernmentReadinessScore({
    economicImpact,
    workforceImpact,
    financialAlignment,
    insuranceAlignment,
    digitalGovernment,
    regulatoryAlignment,
  });
  const overview = buildGovernmentPartnershipOverview({
    investor,
    simulation,
    governmentScore: governmentScore.score,
  });

  return {
    overview,
    economicImpact,
    workforceImpact,
    financialAlignment,
    insuranceAlignment,
    workforceDevelopment,
    digitalGovernment,
    regulatoryAlignment,
    partnershipMatrix,
    governmentScore,
    generatedAt,
  };
}

export function buildGovernmentPartnershipCenter(input: {
  snapshot: GovernmentPartnershipSnapshot;
}): GovernmentPartnershipCenter {
  return {
    overview: input.snapshot.overview,
    economicImpact: input.snapshot.economicImpact,
    workforceImpact: input.snapshot.workforceImpact,
    financialAlignment: input.snapshot.financialAlignment,
    insuranceAlignment: input.snapshot.insuranceAlignment,
    workforceDevelopment: input.snapshot.workforceDevelopment,
    digitalGovernment: input.snapshot.digitalGovernment,
    regulatoryAlignment: input.snapshot.regulatoryAlignment,
    partnershipMatrix: input.snapshot.partnershipMatrix,
    governmentScore: input.snapshot.governmentScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function toGovernmentPartnershipOverviewView(
  overview: GovernmentPartnershipOverview
): GovernmentPartnershipOverviewView {
  return {
    headline: overview.headline,
    government_readiness_score: overview.governmentReadinessScore,
    executive_health_score: overview.executiveHealthScore,
    investor_readiness_score: overview.investorReadinessScore,
    marketplace_health_score: overview.marketplaceHealthScore,
    simulation_readiness_score: overview.simulationReadinessScore,
    partnership_maturity_score: overview.partnershipMaturityScore,
    summary: overview.summary,
  };
}

export function toEconomicScaleProjectionView(
  projection: EconomicScaleProjection
): EconomicScaleProjectionView {
  return {
    level: projection.level,
    target_users: projection.targetUsers,
    projected_contract_volume_minor: projection.projectedContractVolumeMinor,
    projected_contract_volume_label: projection.projectedContractVolumeLabel,
    projected_escrow_volume_minor: projection.projectedEscrowVolumeMinor,
    projected_escrow_volume_label: projection.projectedEscrowVolumeLabel,
    projected_transaction_volume_minor: projection.projectedTransactionVolumeMinor,
    projected_transaction_volume_label: projection.projectedTransactionVolumeLabel,
  };
}

export function toEconomicImpactView(impact: EconomicImpact): EconomicImpactView {
  return {
    currency_code: impact.currencyCode,
    annualized_contract_volume_minor: impact.annualizedContractVolumeMinor,
    annualized_contract_volume_label: impact.annualizedContractVolumeLabel,
    annualized_escrow_volume_minor: impact.annualizedEscrowVolumeMinor,
    annualized_escrow_volume_label: impact.annualizedEscrowVolumeLabel,
    annualized_transaction_volume_minor: impact.annualizedTransactionVolumeMinor,
    annualized_transaction_volume_label: impact.annualizedTransactionVolumeLabel,
    platform_economic_activity_minor: impact.platformEconomicActivityMinor,
    platform_economic_activity_label: impact.platformEconomicActivityLabel,
    scale_projections: impact.scaleProjections.map(toEconomicScaleProjectionView),
    summary: impact.summary,
  };
}

export function toWorkforceImpactView(impact: WorkforceImpact): WorkforceImpactView {
  return {
    active_providers: impact.activeProviders,
    active_customers: impact.activeCustomers,
    opportunity_creation_count: impact.opportunityCreationCount,
    action_execution_volume: impact.actionExecutionVolume,
    skill_demand_indicators: impact.skillDemandIndicators,
    workforce_participation_percent: impact.workforceParticipationPercent,
    summary: impact.summary,
  };
}

export function toFinancialAlignmentTargetView(
  target: FinancialAlignmentTarget
): FinancialAlignmentTargetView {
  return {
    target: target.target,
    escrow_coverage_percent: target.escrowCoveragePercent,
    transaction_protection_score: target.transactionProtectionScore,
    refund_transparency_score: target.refundTransparencyScore,
    financial_readiness_score: target.financialReadinessScore,
    integration_maturity: target.integrationMaturity,
    summary: target.summary,
  };
}

export function toFinancialAlignmentView(alignment: FinancialAlignment): FinancialAlignmentView {
  return {
    targets: alignment.targets.map(toFinancialAlignmentTargetView),
    summary: alignment.summary,
  };
}

export function toInsuranceAlignmentTargetView(
  target: InsuranceAlignmentTarget
): InsuranceAlignmentTargetView {
  return {
    target: target.target,
    insurable_contracts: target.insurableContracts,
    claim_opportunity_indicators: target.claimOpportunityIndicators,
    risk_categories: target.riskCategories,
    coverage_readiness_score: target.coverageReadinessScore,
    insurance_partnership_score: target.insurancePartnershipScore,
    summary: target.summary,
  };
}

export function toInsuranceAlignmentView(alignment: InsuranceAlignment): InsuranceAlignmentView {
  return {
    targets: alignment.targets.map(toInsuranceAlignmentTargetView),
    summary: alignment.summary,
  };
}

export function toWorkforceDevelopmentTargetView(
  target: WorkforceDevelopmentTarget
): WorkforceDevelopmentTargetView {
  return {
    target: target.target,
    skill_gaps: target.skillGaps,
    opportunity_demand: target.opportunityDemand,
    workforce_readiness_score: target.workforceReadinessScore,
    sme_participation_percent: target.smeParticipationPercent,
    employment_impact_score: target.employmentImpactScore,
    summary: target.summary,
  };
}

export function toWorkforceDevelopmentView(
  alignment: WorkforceDevelopmentAlignment
): WorkforceDevelopmentView {
  return {
    targets: alignment.targets.map(toWorkforceDevelopmentTargetView),
    summary: alignment.summary,
  };
}

export function toDigitalGovernmentTargetView(
  target: DigitalGovernmentTarget
): DigitalGovernmentTargetView {
  return {
    target: target.target,
    verified_users: target.verifiedUsers,
    trust_infrastructure_score: target.trustInfrastructureScore,
    digital_transaction_indicators: target.digitalTransactionIndicators,
    compliance_indicators: target.complianceIndicators,
    digital_readiness_score: target.digitalReadinessScore,
    summary: target.summary,
  };
}

export function toDigitalGovernmentAlignmentView(
  alignment: DigitalGovernmentAlignment
): DigitalGovernmentAlignmentView {
  return {
    targets: alignment.targets.map(toDigitalGovernmentTargetView),
    summary: alignment.summary,
  };
}

export function toRegulatoryAlignmentEntryView(
  entry: RegulatoryAlignmentEntry
): RegulatoryAlignmentEntryView {
  return {
    category: entry.category,
    status: entry.status,
    label: entry.label,
    message: entry.message,
  };
}

export function toRegulatoryAlignmentView(alignment: RegulatoryAlignment): RegulatoryAlignmentView {
  return {
    entries: alignment.entries.map(toRegulatoryAlignmentEntryView),
    aligned_count: alignment.alignedCount,
    partially_aligned_count: alignment.partiallyAlignedCount,
    attention_required_count: alignment.attentionRequiredCount,
    summary: alignment.summary,
  };
}

export function toPartnershipMatrixEntryView(
  entry: PartnershipMatrixEntry
): PartnershipMatrixEntryView {
  return {
    target: entry.target,
    readiness_score: entry.readinessScore,
    strategic_value: entry.strategicValue,
    integration_maturity: entry.integrationMaturity,
    required_actions: entry.requiredActions,
    next_milestone: entry.nextMilestone,
  };
}

export function toPartnershipMatrixView(matrix: PartnershipMatrix): PartnershipMatrixView {
  return {
    entries: matrix.entries.map(toPartnershipMatrixEntryView),
    summary: matrix.summary,
  };
}

export function toGovernmentReadinessScoreView(
  score: GovernmentReadinessScore
): GovernmentReadinessScoreView {
  return {
    score: score.score,
    status: score.status,
    economic_weight: score.economicWeight,
    workforce_weight: score.workforceWeight,
    financial_weight: score.financialWeight,
    insurance_weight: score.insuranceWeight,
    digital_weight: score.digitalWeight,
    regulatory_weight: score.regulatoryWeight,
    summary: score.summary,
  };
}

export function toGovernmentPartnershipCenterView(
  center: GovernmentPartnershipCenter
): GovernmentPartnershipCenterView {
  return {
    overview: toGovernmentPartnershipOverviewView(center.overview),
    economic_impact: toEconomicImpactView(center.economicImpact),
    workforce: toWorkforceImpactView(center.workforceImpact),
    financial: toFinancialAlignmentView(center.financialAlignment),
    insurance: toInsuranceAlignmentView(center.insuranceAlignment),
    workforce_development: toWorkforceDevelopmentView(center.workforceDevelopment),
    digital_government: toDigitalGovernmentAlignmentView(center.digitalGovernment),
    regulatory: toRegulatoryAlignmentView(center.regulatoryAlignment),
    partnerships: toPartnershipMatrixView(center.partnershipMatrix),
    government_score: toGovernmentReadinessScoreView(center.governmentScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
