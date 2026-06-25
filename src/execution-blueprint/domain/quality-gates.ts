import type { MilestoneArchetype } from "../../action-blueprint/domain/action-blueprint.js";
import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import { QUALITY_GATE_TYPES } from "./execution-schema.js";
import type { ExecutionMilestone } from "./milestone-pattern.js";

export type QualityGateType = (typeof QUALITY_GATE_TYPES)[number];

export interface QualityGate {
  gateId: string;
  milestoneCode: MilestoneArchetype;
  gateType: QualityGateType;
  required: boolean;
  criteria: string[];
  summary: string;
}

export function buildQualityGates(input: {
  blueprint: ActionBlueprint;
  milestones: ExecutionMilestone[];
  riskLevel: number;
}): QualityGate[] {
  const gates: QualityGate[] = [];

  for (const milestone of input.milestones) {
    if (milestone.blocking) {
      gates.push({
        gateId: `gate://${milestone.milestoneCode}/evidence_complete`,
        milestoneCode: milestone.milestoneCode,
        gateType: "evidence_complete",
        required: true,
        criteria: [
          `All required evidence for ${milestone.milestoneCode} submitted`,
          `Milestone ${milestone.label} checklist complete`,
        ],
        summary: `Evidence completeness gate for ${milestone.milestoneCode}.`,
      });
    }

    if (milestone.milestoneCode === "M-VERIFY" && input.riskLevel >= 4) {
      gates.push({
        gateId: `gate://${milestone.milestoneCode}/risk_clearance`,
        milestoneCode: milestone.milestoneCode,
        gateType: "risk_clearance",
        required: true,
        criteria: [
          `Risk level ${input.riskLevel} clearance documented`,
          "Insurance or liability acknowledgment on file",
        ],
        summary: `Risk clearance gate for high-risk blueprint ${input.blueprint.primaryTaxonomyCode}.`,
      });
    }

    if (milestone.milestoneCode === "M-ACCEPT") {
      gates.push({
        gateId: `gate://${milestone.milestoneCode}/acceptance_ready`,
        milestoneCode: milestone.milestoneCode,
        gateType: "acceptance_ready",
        required: true,
        criteria: [
          "All blocking milestones verified",
          "Deliverables mapped to acceptance criteria",
        ],
        summary: "Acceptance readiness gate before customer sign-off.",
      });
    }

    if (milestone.dependsOn.length > 0) {
      gates.push({
        gateId: `gate://${milestone.milestoneCode}/dependency_clear`,
        milestoneCode: milestone.milestoneCode,
        gateType: "dependency_clear",
        required: milestone.blocking,
        criteria: milestone.dependsOn.map((code) => `${code} completed`),
        summary: `Dependency clearance for ${milestone.milestoneCode}.`,
      });
    }
  }

  return gates;
}

export function listStandardQualityGateTemplates(): QualityGate[] {
  return [
    {
      gateId: "gate://template/evidence_complete",
      milestoneCode: "M-VERIFY",
      gateType: "evidence_complete",
      required: true,
      criteria: ["Required evidence submitted", "Evidence passes validation rules"],
      summary: "Standard evidence completeness gate.",
    },
    {
      gateId: "gate://template/risk_clearance",
      milestoneCode: "M-VERIFY",
      gateType: "risk_clearance",
      required: true,
      criteria: ["Risk level documented", "Hazard declarations acknowledged"],
      summary: "Standard risk clearance gate.",
    },
    {
      gateId: "gate://template/acceptance_ready",
      milestoneCode: "M-ACCEPT",
      gateType: "acceptance_ready",
      required: true,
      criteria: ["Blocking milestones complete", "Acceptance criteria satisfied"],
      summary: "Standard acceptance readiness gate.",
    },
  ];
}
