import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import { buildRiskModel } from "./risk-model.js";
import { buildResourceModel } from "./resource-model.js";
import { computeExecutionScore } from "./tekrr-scoring.js";
import { TEKRR_INTELLIGENCE_SCHEMA_VERSION } from "./tekrr-schema.js";
import type {
  AutomationLevel,
  DependencyComplexityLevel,
  EvidenceLevel,
  ProjectContextHint,
  SkillLevel,
  SynthesisTrace,
  TekrrExecutionProfile,
  ValidationRule,
} from "./tekrr-profile.js";

const DOMAIN_DURATION: Record<string, { min: number; max: number }> = {
  A: { min: 2, max: 8 },
  B: { min: 2, max: 12 },
  C: { min: 4, max: 40 },
  D: { min: 1, max: 8 },
  E: { min: 8, max: 160 },
  F: { min: 4, max: 80 },
  G: { min: 1, max: 20 },
  H: { min: 2, max: 6 },
};

const DOMAIN_EFFORT: Record<string, { pattern: string; intensity: "low" | "medium" | "high" }> = {
  A: { pattern: "physical_checklist", intensity: "high" },
  B: { pattern: "technical_checklist", intensity: "high" },
  C: { pattern: "deliverable_document", intensity: "low" },
  D: { pattern: "care_session", intensity: "medium" },
  E: { pattern: "creative_deliverable", intensity: "medium" },
  F: { pattern: "coordination_checkpoint", intensity: "medium" },
  G: { pattern: "session_log", intensity: "medium" },
  H: { pattern: "inspection_report", intensity: "medium" },
};

function tierToSkillLevel(tier: string): SkillLevel {
  if (tier === "T3") return "expert";
  if (tier === "T2") return "professional";
  return "entry";
}

function riskToEvidenceLevel(riskLevel: number): EvidenceLevel {
  if (riskLevel >= 5) return "critical";
  if (riskLevel >= 4) return "enhanced";
  if (riskLevel >= 3) return "standard";
  return "minimal";
}

function domainToAutomation(domain: string): AutomationLevel {
  if (domain === "E" || domain === "B") return "semi_automated";
  if (domain === "C" || domain === "F") return "assisted";
  return "manual";
}

function resolveDependencyComplexity(input: {
  milestoneCount: number;
  projectContext?: ProjectContextHint;
}): DependencyComplexityLevel {
  const nodeCount = input.projectContext?.node_count ?? input.milestoneCount;
  const edgeCount = input.projectContext?.edge_count ?? Math.max(0, nodeCount - 1);
  if (edgeCount <= nodeCount - 1 && nodeCount <= 3) return "linear";
  if (edgeCount <= nodeCount * 1.5) return "moderate";
  return "complex";
}

function buildValidationRules(templateFields: string[]): ValidationRule[] {
  const rules: ValidationRule[] = [
    {
      ruleId: "tekrr.time.scheduled_start",
      dimension: "T",
      description: "Scheduled start is required for execution planning.",
      required: true,
    },
    {
      ruleId: "tekrr.effort.deliverables",
      dimension: "E",
      description: "Deliverables must be declared before contract activation.",
      required: true,
    },
    {
      ruleId: "tekrr.knowledge.standard_of_care",
      dimension: "K",
      description: "Standard of care must match taxonomy domain expectations.",
      required: true,
    },
    {
      ruleId: "tekrr.risk.level",
      dimension: "R",
      description: "Risk level must be declared and evidence-aligned.",
      required: true,
    },
    {
      ruleId: "tekrr.responsibility.acceptance",
      dimension: "S",
      description: "Acceptance criteria must be defined for customer sign-off.",
      required: true,
    },
  ];

  for (const field of templateFields) {
    rules.push({
      ruleId: `tekrr.template.${field}`,
      dimension: "execution",
      description: `Template requires field: ${field}`,
      required: true,
    });
  }

  return rules;
}

export function synthesizeTekrrProfile(input: {
  blueprint: ActionBlueprint;
  projectContext?: ProjectContextHint;
  generatedAt?: Date;
}): TekrrExecutionProfile {
  const blueprint = input.blueprint;
  const template = getTemplateByActionCode(blueprint.primaryTaxonomyCode);
  const duration = DOMAIN_DURATION[blueprint.domain] ?? { min: 2, max: 8 };
  const effort = DOMAIN_EFFORT[blueprint.domain] ?? { pattern: "general_deliverable", intensity: "medium" as const };

  const trace: SynthesisTrace[] = [
    {
      step: "load_blueprint",
      ruleId: "x43.blueprint.input",
      detail: `Loaded ActionBlueprint ${blueprint.blueprintId} for taxonomy ${blueprint.primaryTaxonomyCode}.`,
    },
    {
      step: "bind_template",
      ruleId: "x43.template.bind",
      detail: `Bound contract template ${template?.templateId ?? blueprint.tekrrBinding.templateId}.`,
    },
    {
      step: "synthesize_dimensions",
      ruleId: "x43.tekrr.synthesize",
      detail: "Synthesized T/E/K/R/S execution models from blueprint and taxonomy defaults.",
    },
  ];

  const resourceModel = buildResourceModel({
    domain: blueprint.domain,
    minProviderTier: blueprint.minProviderTier,
    requiredCredentials: blueprint.actorRequirements.requiredCredentials,
    scopeInclusions: blueprint.scope.inclusions,
  });

  const riskModel = buildRiskModel({
    domain: blueprint.domain,
    riskLevel: blueprint.riskLevelDefault,
    milestoneCount: blueprint.milestonePattern.length,
  });

  const evidenceTypes = blueprint.evidenceRequirements.map((entry) => entry.evidenceType);
  const evidenceLevel = riskToEvidenceLevel(blueprint.riskLevelDefault);

  const skillLevel = tierToSkillLevel(blueprint.minProviderTier);
  const nodeCount = input.projectContext?.node_count ?? blueprint.milestonePattern.length;
  const edgeCount = input.projectContext?.edge_count ?? Math.max(0, nodeCount - 1);
  const parallelGroups = input.projectContext?.parallel_group_count ?? 1;

  const dependencyComplexity = resolveDependencyComplexity({
    milestoneCount: blueprint.milestonePattern.length,
    projectContext: input.projectContext,
  });

  const profileBase = {
    profileId: `tekrr://${blueprint.blueprintId}@${blueprint.version}`,
    blueprintId: blueprint.blueprintId,
    primaryTaxonomyCode: blueprint.primaryTaxonomyCode,
    domain: blueprint.domain,
    templateId: template?.templateId ?? blueprint.tekrrBinding.templateId,
    status: "draft" as const,
    schemaVersion: TEKRR_INTELLIGENCE_SCHEMA_VERSION,
    timeModel: {
      scheduledStartRequired: true,
      estimatedDurationHours: duration,
      completionDeadlineRequired: true,
      slaApplicable: blueprint.domain === "B" || blueprint.domain === "D",
      milestoneCount: blueprint.milestonePattern.length,
      summary: `Time model: ${duration.min}-${duration.max} hours across ${blueprint.milestonePattern.length} milestones.`,
    },
    effortModel: {
      deliverablePattern: effort.pattern,
      locationType: blueprint.domain === "A" || blueprint.domain === "B" ? "on_site" : "hybrid",
      materialsResponsibility: blueprint.domain === "A" ? "provider" : "customer_or_provider",
      deliverables: blueprint.scope.inclusions,
      physicalIntensity: effort.intensity,
      summary: `Effort model uses ${effort.pattern} pattern with ${effort.intensity} physical intensity.`,
    },
    knowledgeModel: {
      standardOfCare: `APP13 taxonomy ${blueprint.primaryTaxonomyCode} standard of care`,
      requiredCredentials: blueprint.actorRequirements.requiredCredentials,
      minProviderTier: blueprint.minProviderTier,
      skillLevel,
      domainExpertise: blueprint.domain,
      summary: `Knowledge model requires ${skillLevel} skill at tier ${blueprint.minProviderTier}.`,
    },
    riskModel,
    resourceModel,
    skillLevel: {
      level: skillLevel,
      minProviderTier: blueprint.minProviderTier,
      rationale: `Derived from blueprint min provider tier ${blueprint.minProviderTier}.`,
    },
    requiredLicenses: resourceModel.licenses.map((license) => license.code),
    requiredTools: resourceModel.tools.map((tool) => tool.code),
    requiredEvidenceLevel: {
      level: evidenceLevel,
      requiredEvidenceTypes: [...new Set(evidenceTypes)],
      minimumForVerification: evidenceTypes.filter((_, index, array) => array.indexOf(_) === index).slice(0, 3),
      summary: `Evidence level ${evidenceLevel} driven by risk ${blueprint.riskLevelDefault}.`,
    },
    automationPotential: {
      level: domainToAutomation(blueprint.domain),
      score: blueprint.domain === "E" ? 75 : blueprint.domain === "C" ? 45 : 25,
      rationale: `Automation potential inferred from domain ${blueprint.domain}.`,
    },
    parallelExecutionCapability: {
      capable: parallelGroups > 1 || nodeCount > 3,
      maxParallelWorkstreams: Math.max(1, parallelGroups),
      rationale:
        parallelGroups > 1
          ? "Project context indicates parallel workstreams."
          : "Single-stream execution inferred from blueprint milestones.",
    },
    dependencyComplexity: {
      level: dependencyComplexity,
      edgeCount,
      nodeCount,
      rationale: `Dependency complexity ${dependencyComplexity} from ${nodeCount} nodes and ${edgeCount} edges.`,
    },
    validationRules: buildValidationRules(
      (template?.requiredTekrrFields ?? blueprint.tekrrBinding.requiredFields).map(
        (field) => `${field.dimension}.${field.field}`
      )
    ),
    synthesisTrace: trace,
  };

  const executionScore = computeExecutionScore(profileBase);

  return {
    ...profileBase,
    executionScore,
  };
}

export function synthesizeDimension(
  blueprint: ActionBlueprint,
  dimension: "time" | "effort" | "knowledge" | "risk" | "resources"
) {
  const profile = synthesizeTekrrProfile({ blueprint });
  switch (dimension) {
    case "time":
      return profile.timeModel;
    case "effort":
      return profile.effortModel;
    case "knowledge":
      return profile.knowledgeModel;
    case "risk":
      return profile.riskModel;
    case "resources":
      return profile.resourceModel;
  }
}

export function buildTekrrCompilePreview(profile: TekrrExecutionProfile): {
  profile: TekrrExecutionProfile;
  preview_only: true;
  field_checklist: Array<{ dimension: string; field: string; synthesized: boolean }>;
  summary: string;
} {
  return {
    profile,
    preview_only: true,
    field_checklist: profile.validationRules.map((rule) => ({
      dimension: rule.dimension,
      field: rule.ruleId,
      synthesized: true,
    })),
    summary: `TEKRR compile preview for ${profile.profileId} — no runtime records created.`,
  };
}
