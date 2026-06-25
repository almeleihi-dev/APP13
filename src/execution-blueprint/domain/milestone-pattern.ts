import type { MilestoneArchetype, EvidenceType } from "../../action-blueprint/domain/action-blueprint.js";
import type { MilestoneTemplate } from "../../contract/templates/types.js";
import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { MILESTONE_EXECUTION_MODES } from "./execution-schema.js";

export type MilestoneExecutionMode = (typeof MILESTONE_EXECUTION_MODES)[number];

export interface StandardMilestonePattern {
  patternId: string;
  milestoneCode: MilestoneArchetype;
  label: string;
  sequenceOrder: number;
  blocking: boolean;
  optional: boolean;
  executionMode: MilestoneExecutionMode;
  responsibleParty: MilestoneTemplate["responsibleParty"];
  tekrrDimension?: "T" | "E" | "K" | "R" | "S";
  estimatedDurationHours: number;
}

const MILESTONE_DURATION_WEIGHT: Record<MilestoneArchetype, number> = {
  "M-ACCESS": 1,
  "M-SCOPE": 2,
  "M-WIP": 4,
  "M-DELIVER": 3,
  "M-VERIFY": 2,
  "M-ACCEPT": 1,
  "M-COMPLETE": 1,
};

export function listStandardMilestonePatterns(): StandardMilestonePattern[] {
  const template = getTemplateByActionCode("A.2.1");
  const milestones = template?.milestones ?? [];
  return milestones.map((milestone) => ({
    patternId: `pattern://${milestone.milestoneCode}`,
    milestoneCode: milestone.milestoneCode as MilestoneArchetype,
    label: milestone.name,
    sequenceOrder: milestone.sequenceOrder,
    blocking: milestone.blocking,
    optional: !milestone.blocking,
    executionMode: milestone.blocking ? "sequential" : "parallel",
    responsibleParty: milestone.responsibleParty,
    tekrrDimension: milestone.tekrrDimension,
    estimatedDurationHours: MILESTONE_DURATION_WEIGHT[milestone.milestoneCode as MilestoneArchetype] ?? 2,
  }));
}

export function buildMilestonePatterns(blueprint: ActionBlueprint): StandardMilestonePattern[] {
  const template = getTemplateByActionCode(blueprint.primaryTaxonomyCode);
  const templateByCode = new Map(
    (template?.milestones ?? []).map((entry) => [entry.milestoneCode, entry])
  );

  return blueprint.milestonePattern.map((pattern) => {
    const templateMilestone = templateByCode.get(pattern.milestoneCode);
    return {
      patternId: `pattern://${blueprint.primaryTaxonomyCode}/${pattern.milestoneCode}`,
      milestoneCode: pattern.milestoneCode,
      label: templateMilestone?.name ?? pattern.milestoneCode,
      sequenceOrder: pattern.sequenceOrder,
      blocking: pattern.blocking,
      optional: !pattern.blocking,
      executionMode: pattern.blocking ? "sequential" : "parallel",
      responsibleParty: templateMilestone?.responsibleParty ?? "provider",
      tekrrDimension: templateMilestone?.tekrrDimension,
      estimatedDurationHours: MILESTONE_DURATION_WEIGHT[pattern.milestoneCode] ?? 2,
    };
  });
}

export interface ExecutionMilestone {
  milestoneId: string;
  milestoneCode: MilestoneArchetype;
  label: string;
  sequenceOrder: number;
  blocking: boolean;
  optional: boolean;
  executionMode: MilestoneExecutionMode;
  responsibleParty: MilestoneTemplate["responsibleParty"];
  tekrrDimension?: "T" | "E" | "K" | "R" | "S";
  estimatedDurationHours: number;
  dependsOn: MilestoneArchetype[];
}

export function buildExecutionMilestones(blueprint: ActionBlueprint): ExecutionMilestone[] {
  const patterns = buildMilestonePatterns(blueprint);
  const sorted = [...patterns].sort((left, right) => left.sequenceOrder - right.sequenceOrder);

  return sorted.map((pattern, index) => {
    const priorBlocking = sorted
      .slice(0, index)
      .filter((entry) => entry.blocking)
      .map((entry) => entry.milestoneCode);

    return {
      milestoneId: `milestone://${blueprint.blueprintId}/${pattern.milestoneCode}`,
      milestoneCode: pattern.milestoneCode,
      label: pattern.label,
      sequenceOrder: pattern.sequenceOrder,
      blocking: pattern.blocking,
      optional: pattern.optional,
      executionMode: pattern.executionMode,
      responsibleParty: pattern.responsibleParty,
      tekrrDimension: pattern.tekrrDimension,
      estimatedDurationHours: pattern.estimatedDurationHours,
      dependsOn: pattern.blocking ? priorBlocking : [],
    };
  });
}

export function buildParallelMilestoneGroups(milestones: ExecutionMilestone[]): MilestoneArchetype[][] {
  const groups: MilestoneArchetype[][] = [];
  let currentGroup: MilestoneArchetype[] = [];

  for (const milestone of milestones) {
    if (milestone.executionMode === "parallel" && !milestone.blocking) {
      currentGroup.push(milestone.milestoneCode);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

export interface EvidencePattern {
  patternId: string;
  evidenceType: EvidenceType;
  milestoneCode: MilestoneArchetype;
  required: boolean;
  label: string;
}

export function listStandardEvidencePatterns(): EvidencePattern[] {
  return [
    { patternId: "evidence://EV-TS", evidenceType: "EV-TS", milestoneCode: "M-ACCESS", required: true, label: "Timestamp evidence" },
    { patternId: "evidence://EV-CHECK", evidenceType: "EV-CHECK", milestoneCode: "M-SCOPE", required: true, label: "Scope checklist" },
    { patternId: "evidence://EV-PHOTO", evidenceType: "EV-PHOTO", milestoneCode: "M-WIP", required: true, label: "Work-in-progress photo" },
    { patternId: "evidence://EV-DOC", evidenceType: "EV-DOC", milestoneCode: "M-DELIVER", required: true, label: "Deliverable document" },
    { patternId: "evidence://EV-TEST", evidenceType: "EV-TEST", milestoneCode: "M-VERIFY", required: true, label: "Verification test" },
    { patternId: "evidence://EV-SIGN", evidenceType: "EV-SIGN", milestoneCode: "M-ACCEPT", required: true, label: "Customer acceptance signature" },
    { patternId: "evidence://EV-NOTE", evidenceType: "EV-NOTE", milestoneCode: "M-COMPLETE", required: false, label: "Completion note" },
  ];
}

export function buildEvidencePatterns(blueprint: ActionBlueprint): EvidencePattern[] {
  return blueprint.evidenceRequirements.map((entry, index) => ({
    patternId: `evidence://${blueprint.primaryTaxonomyCode}/${entry.evidenceType}/${index + 1}`,
    evidenceType: entry.evidenceType,
    milestoneCode: entry.milestoneCode as MilestoneArchetype,
    required: entry.required,
    label: entry.evidenceType.replace("EV-", "").toLowerCase().replace(/_/g, " "),
  }));
}

export interface ExecutionEvidenceRequirement {
  requirementId: string;
  evidenceType: EvidenceType;
  milestoneCode: MilestoneArchetype;
  required: boolean;
  label: string;
  qualityGateId?: string;
}

export function buildExecutionEvidenceRequirements(blueprint: ActionBlueprint): ExecutionEvidenceRequirement[] {
  return buildEvidencePatterns(blueprint).map((pattern) => ({
    requirementId: `evreq://${blueprint.blueprintId}/${pattern.evidenceType}/${pattern.milestoneCode}`,
    evidenceType: pattern.evidenceType,
    milestoneCode: pattern.milestoneCode,
    required: pattern.required,
    label: pattern.label,
    qualityGateId: pattern.required ? `gate://${pattern.milestoneCode}/evidence_complete` : undefined,
  }));
}
