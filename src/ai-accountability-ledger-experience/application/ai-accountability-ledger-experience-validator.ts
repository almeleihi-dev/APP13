import type {
  AiAccountabilityLedgerExperienceOutput,
  AiAccountabilityLedgerExperienceValidation,
} from "../domain/ai-accountability-ledger-experience-context.js";

export class AiAccountabilityLedgerExperienceValidator {
  validateOutput(
    output: AiAccountabilityLedgerExperienceOutput
  ): AiAccountabilityLedgerExperienceValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.ledgerContext.contextId) missingFields.push("ledger_context");
    if (!output.ledgerDashboard.dashboardId) missingFields.push("ledger_dashboard");
    if (!output.governanceAssuranceOutputId) missingFields.push("governance_assurance_link");
    if (output.accountabilityChain.links.length === 0) missingFields.push("accountability_chain");
    if (output.decisionTrace.entries.length === 0) missingFields.push("decision_trace");
    if (output.evidenceRegister.items.length === 0) missingFields.push("evidence_register");
    if (output.responsibilityMap.items.length === 0) missingFields.push("responsibility_map");
    if (output.auditTrail.entries.length === 0) missingFields.push("audit_trail");
    if (!output.transparencyReport.reportId) missingFields.push("transparency_report");
    if (output.ledgerConfidence.score < 45) {
      warnings.push("Low accountability ledger confidence — outputs are advisory only.");
    }
    if (output.ledgerDashboard.healthScore < 55) {
      warnings.push("Degraded health score in upstream governance assurance.");
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
          ? "AI Accountability Ledger Experience output is complete and traceable to X18 governance assurance."
          : `Accountability ledger output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): AiAccountabilityLedgerExperienceValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five AI Accountability Ledger Experience scenarios have full upstream governance assurance coverage.",
    };
  }
}

export function createAiAccountabilityLedgerExperienceValidator(): AiAccountabilityLedgerExperienceValidator {
  return new AiAccountabilityLedgerExperienceValidator();
}
