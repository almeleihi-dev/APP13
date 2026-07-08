import type { RiskLevel } from "../../action-blueprint/domain/action-blueprint.js";

export interface RiskFactor {
  code: string;
  label: string;
  weight: number;
}

export interface RiskModel {
  riskLevel: RiskLevel;
  hazardDeclarations: string[];
  liabilityAllocation: string;
  insuranceRequired: boolean;
  factors: RiskFactor[];
  summary: string;
}

const DOMAIN_HAZARDS: Record<string, string[]> = {
  A: ["property_damage", "access_constraints"],
  B: ["equipment_failure", "safety_exposure", "regulatory_noncompliance"],
  C: ["decision_quality", "confidentiality"],
  D: ["vulnerable_population", "care_quality"],
  E: ["intellectual_property", "delivery_quality"],
  F: ["schedule_slippage", "vendor_coordination"],
  G: ["learning_outcome", "learner_safety"],
  H: ["assessment_accuracy", "certification_liability"],
};

export function buildRiskModel(input: {
  domain: string;
  riskLevel: RiskLevel;
  milestoneCount: number;
}): RiskModel {
  const hazards = DOMAIN_HAZARDS[input.domain] ?? ["general_operational"];
  const insuranceRequired = input.riskLevel >= 4;

  return {
    riskLevel: input.riskLevel,
    hazardDeclarations: hazards,
    liabilityAllocation: input.riskLevel >= 4 ? "provider_primary" : "shared",
    insuranceRequired,
    factors: hazards.map((hazard, index) => ({
      code: hazard,
      label: hazard.replace(/_/g, " "),
      weight: Math.max(1, input.riskLevel - index),
    })),
    summary: `Risk model level ${input.riskLevel} with ${hazards.length} declared hazards.`,
  };
}
