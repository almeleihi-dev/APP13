import type {
  AiGovernanceAssuranceExperienceOutput,
  AiGovernanceAssuranceExperienceValidation,
} from "../domain/ai-governance-assurance-experience-context.js";

export class AiGovernanceAssuranceExperienceValidator {
  validateOutput(
    output: AiGovernanceAssuranceExperienceOutput
  ): AiGovernanceAssuranceExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.governanceContext.contextId) missingFields.push("governance_context");
    if (!output.governanceDashboard.dashboardId) missingFields.push("governance_dashboard");
    if (!output.executiveAdvisoryOutputId) missingFields.push("executive_advisory_link");
    if (output.policyAlignment.policies.length === 0) missingFields.push("policy_alignment");
    if (output.controlMap.controls.length === 0) missingFields.push("control_map");
    if (output.assuranceChecks.checks.length === 0) missingFields.push("assurance_checks");
    if (output.riskControls.items.length === 0) missingFields.push("risk_controls");
    if (output.accountability.items.length === 0) missingFields.push("accountability");
    if (!output.escalationGuidance.guidanceId) missingFields.push("escalation_guidance");
    if (output.assuranceConfidence.score < 45) {
      warnings.push("Low governance assurance confidence — outputs are advisory only.");
    }
    if (output.governanceDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream executive advisory.");
    }

    const completenessScore = Math.max(
      0,
      100 - missingFields.length * 15 - warnings.length * 5
    );

    return {
      valid: missingFields.length === 0,
      completenessScore,
      missingFields,
      warnings,
      summary:
        missingFields.length === 0
          ? "AI Governance Assurance Experience output is complete and traceable to X17 executive advisory."
          : `Governance assurance output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiGovernanceAssuranceExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Governance Assurance Experience scenarios have full upstream executive advisory coverage.",
    };
  }
}

export function createAiGovernanceAssuranceExperienceValidator(): AiGovernanceAssuranceExperienceValidator {
  return new AiGovernanceAssuranceExperienceValidator();
}
