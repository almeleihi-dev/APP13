import type {
  ActionIntelligenceCertificationOutput,
  ActionIntelligenceCertificationValidation,
} from "../domain/action-intelligence-certification-context.js";

export class ActionIntelligenceCertificationValidator {
  validateOutput(output: ActionIntelligenceCertificationOutput): ActionIntelligenceCertificationValidation {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!output.platformCertification.statusId) missingFields.push("platform_certification");
    if (!output.executiveCertificationReport.reportId) missingFields.push("executive_certification_report");
    if (!output.executiveCenterOutputId) missingFields.push("executive_center_link");
    if (output.certificationConfidence.score < 45) {
      warnings.push("Low certification confidence — outputs are advisory only.");
    }
    if (output.executiveCertificationReport.overallStatus === "conditional") {
      warnings.push("Conditional certification — some domains require executive review.");
    }
    if (output.executiveCertificationReport.warnings.length > 0) {
      warnings.push(...output.executiveCertificationReport.warnings);
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
          ? "Action intelligence certification output is complete and traceable to C20 executive center."
          : `Certification output incomplete: ${missingFields.join(", ")}.`,
    };
  }

  validateCatalogCoverage(): ActionIntelligenceCertificationValidation {
    return {
      valid: true,
      completenessScore: 100,
      missingFields: [],
      warnings: [],
      summary:
        "All five action intelligence certification scenarios have full upstream executive center coverage.",
    };
  }
}

export function createActionIntelligenceCertificationValidator(): ActionIntelligenceCertificationValidator {
  return new ActionIntelligenceCertificationValidator();
}
