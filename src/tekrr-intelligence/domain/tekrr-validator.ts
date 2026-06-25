import type { TekrrExecutionProfile, TekrrValidationReport } from "./tekrr-profile.js";

export function validateTekrrProfile(profile: TekrrExecutionProfile): TekrrValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile.profileId.startsWith("tekrr://")) {
    errors.push("profile_id must start with tekrr://");
  }
  if (!profile.blueprintId.startsWith("blueprint://app13/")) {
    errors.push("blueprint_id must reference an X40 ActionBlueprint");
  }
  if (profile.timeModel.estimatedDurationHours.min <= 0) {
    errors.push("time model minimum duration must be positive");
  }
  if (profile.effortModel.deliverables.length === 0) {
    warnings.push("effort model has no deliverables");
  }
  if (profile.requiredLicenses.length === 0 && profile.knowledgeModel.minProviderTier !== "T1") {
    warnings.push("no licenses synthesized for non-T1 provider tier");
  }
  if (profile.requiredTools.length === 0) {
    warnings.push("no tools synthesized");
  }
  if (profile.riskModel.riskLevel < 1 || profile.riskModel.riskLevel > 5) {
    errors.push("risk level must be between 1 and 5");
  }

  const ruleResults = profile.validationRules.map((rule) => {
    const passed = !errors.some((error) => error.includes(rule.ruleId));
    return {
      ruleId: rule.ruleId,
      passed: rule.required ? passed : true,
      message: passed ? "Rule satisfied by synthesis." : "Rule requires attention.",
    };
  });

  const passedRules = ruleResults.filter((result) => result.passed).length;
  const completenessScore = Math.round((passedRules / Math.max(1, ruleResults.length)) * 100);
  const valid = errors.length === 0 && completenessScore >= 80;

  return {
    valid,
    status: valid ? "validated" : "draft",
    completenessScore,
    errors,
    warnings,
    ruleResults,
    summary: valid
      ? `TEKRR profile ${profile.profileId} validated at ${completenessScore}% completeness.`
      : `TEKRR profile ${profile.profileId} failed validation.`,
  };
}
