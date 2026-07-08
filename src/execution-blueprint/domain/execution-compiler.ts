import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { validateBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import { synthesizeTekrrProfile } from "../../tekrr-intelligence/domain/tekrr-synthesizer.js";
import type { ProjectContextHint } from "../../tekrr-intelligence/domain/tekrr-profile.js";
import { buildAcceptanceCriteria, buildDeliverables } from "./acceptance-rules.js";
import {
  buildExecutionMilestones,
  buildExecutionEvidenceRequirements,
  buildParallelMilestoneGroups,
} from "./milestone-pattern.js";
import { buildQualityGates } from "./quality-gates.js";
import { EXECUTION_BLUEPRINT_SCHEMA_VERSION } from "./execution-schema.js";
import type {
  CompilationTraceStep,
  ExecutionBlueprint,
  ExecutionCompilePreview,
  ExecutionDependency,
  PaymentGatePreview,
  ExecutionRiskPropagation,
} from "./execution-blueprint.js";
import type { MilestoneArchetype } from "../../action-blueprint/domain/action-blueprint.js";

const PAYMENT_RELEASE_MAP: Record<MilestoneArchetype, { releaseType: PaymentGatePreview["releaseType"]; percentageHint: number }> = {
  "M-ACCESS": { releaseType: "hold", percentageHint: 0 },
  "M-SCOPE": { releaseType: "hold", percentageHint: 0 },
  "M-WIP": { releaseType: "none", percentageHint: 0 },
  "M-DELIVER": { releaseType: "partial_release", percentageHint: 25 },
  "M-VERIFY": { releaseType: "partial_release", percentageHint: 50 },
  "M-ACCEPT": { releaseType: "partial_release", percentageHint: 80 },
  "M-COMPLETE": { releaseType: "full_release", percentageHint: 100 },
};

function buildExecutionDependencies(milestones: ReturnType<typeof buildExecutionMilestones>): ExecutionDependency[] {
  const dependencies: ExecutionDependency[] = [];

  for (const milestone of milestones) {
    for (const prior of milestone.dependsOn) {
      dependencies.push({
        dependencyId: `dep://${prior}->${milestone.milestoneCode}`,
        fromMilestone: prior,
        toMilestone: milestone.milestoneCode,
        dependencyType: "finish_to_start",
        blocking: milestone.blocking,
      });
    }
  }

  return dependencies;
}

function buildPaymentGates(milestones: ReturnType<typeof buildExecutionMilestones>): PaymentGatePreview[] {
  return milestones.map((milestone) => {
    const release = PAYMENT_RELEASE_MAP[milestone.milestoneCode] ?? {
      releaseType: "none" as const,
      percentageHint: 0,
    };

    return {
      gateId: `paygate://${milestone.milestoneCode}`,
      milestoneCode: milestone.milestoneCode,
      releaseType: release.releaseType,
      percentageHint: release.percentageHint,
      blocking: milestone.blocking,
      previewOnly: true,
      summary: `Payment gate preview for ${milestone.milestoneCode}: ${release.releaseType} at ${release.percentageHint}%.`,
    };
  });
}

function buildExecutionRisk(blueprint: ActionBlueprint, tekrrRiskLevel: number): ExecutionRiskPropagation {
  const propagated = Math.min(5, Math.max(blueprint.riskLevelDefault, tekrrRiskLevel));
  const insuranceRequired = propagated >= 4;

  return {
    sourceRiskLevel: blueprint.riskLevelDefault,
    propagatedRiskLevel: propagated,
    hazardDeclarations: blueprint.scope.exclusions.length > 0 ? blueprint.scope.exclusions : ["general_operational"],
    insuranceRequired,
    summary: `Risk propagated from blueprint level ${blueprint.riskLevelDefault} to execution level ${propagated}.`,
  };
}

function aggregateDuration(
  milestones: ReturnType<typeof buildExecutionMilestones>,
  tekrrDuration: { min: number; max: number }
): { min: number; max: number } {
  const milestoneHours = milestones.reduce((sum, entry) => sum + entry.estimatedDurationHours, 0);
  return {
    min: Math.max(tekrrDuration.min, milestoneHours),
    max: Math.max(tekrrDuration.max, milestoneHours + 2),
  };
}

export function compileExecutionBlueprint(input: {
  blueprint: ActionBlueprint;
  projectContext?: ProjectContextHint;
}): ExecutionBlueprint {
  const validation = validateBlueprint(input.blueprint);
  if (!validation.compilable) {
    throw new Error(validation.summary);
  }

  const template = getTemplateByActionCode(input.blueprint.primaryTaxonomyCode);
  const tekrrProfile = synthesizeTekrrProfile({
    blueprint: input.blueprint,
    projectContext: input.projectContext,
  });

  const trace: CompilationTraceStep[] = [
    {
      step: "load_blueprint",
      ruleId: "x44.blueprint.input",
      detail: `Loaded ActionBlueprint ${input.blueprint.blueprintId}@${input.blueprint.version}.`,
    },
    {
      step: "synthesize_tekrr",
      ruleId: "x44.tekrr.bind",
      detail: `Bound TEKRR profile ${tekrrProfile.profileId} for risk and duration propagation.`,
    },
    {
      step: "compile_milestones",
      ruleId: "x44.milestone.compile",
      detail: "Compiled standardized milestones from blueprint pattern and contract template.",
    },
    {
      step: "compile_evidence",
      ruleId: "x44.evidence.compile",
      detail: "Compiled evidence requirements per milestone.",
    },
  ];

  const milestones = buildExecutionMilestones(input.blueprint);
  const parallelGroups = buildParallelMilestoneGroups(milestones);
  const evidenceRequirements = buildExecutionEvidenceRequirements(input.blueprint);
  const qualityGates = buildQualityGates({
    blueprint: input.blueprint,
    milestones,
    riskLevel: tekrrProfile.riskModel.riskLevel,
  });
  const acceptanceCriteria = buildAcceptanceCriteria({ blueprint: input.blueprint, milestones });
  const deliverables = buildDeliverables({ blueprint: input.blueprint, milestones });
  const executionDependencies = buildExecutionDependencies(milestones);
  const executionRisk = buildExecutionRisk(input.blueprint, tekrrProfile.riskModel.riskLevel);
  const estimatedDurationHours = aggregateDuration(milestones, tekrrProfile.timeModel.estimatedDurationHours);
  const paymentGates = buildPaymentGates(milestones);

  return {
    executionBlueprintId: `exec://${input.blueprint.blueprintId}@${input.blueprint.version}`,
    blueprintId: input.blueprint.blueprintId,
    version: input.blueprint.version,
    primaryTaxonomyCode: input.blueprint.primaryTaxonomyCode,
    templateId: template?.templateId ?? input.blueprint.tekrrBinding.templateId,
    domain: input.blueprint.domain,
    status: "draft",
    schemaVersion: EXECUTION_BLUEPRINT_SCHEMA_VERSION,
    milestones,
    evidenceRequirements,
    qualityGates,
    acceptanceCriteria,
    deliverables,
    executionDependencies,
    parallelGroups,
    executionRisk,
    estimatedDurationHours,
    paymentGates,
    compilationTrace: trace,
  };
}

export function buildExecutionCompilePreview(input: {
  blueprint: ActionBlueprint;
  projectContext?: ProjectContextHint;
}): ExecutionCompilePreview {
  const executionBlueprint = compileExecutionBlueprint(input);
  const template = getTemplateByActionCode(input.blueprint.primaryTaxonomyCode);

  return {
    executionBlueprint,
    preview_only: true,
    template_id: template?.templateId ?? input.blueprint.tekrrBinding.templateId,
    contract_compatible: Boolean(template),
    summary: `Execution compile preview for ${executionBlueprint.executionBlueprintId} — no runtime records created.`,
  };
}
