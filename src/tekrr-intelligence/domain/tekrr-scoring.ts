import type { TekrrExecutionProfile, ExecutionScore } from "./tekrr-profile.js";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeExecutionScore(
  profile: Omit<TekrrExecutionProfile, "executionScore">
): ExecutionScore {
  const timeWeight = 20;
  const effortWeight = 15;
  const knowledgeWeight = 20;
  const riskWeight = 20;
  const resourceWeight = 25;

  const timeComponent = clamp(
    profile.timeModel.milestoneCount > 0 ? 100 - profile.timeModel.milestoneCount * 5 : 50,
    40,
    100
  );
  const effortComponent = clamp(
    profile.effortModel.deliverables.length > 0 ? 85 : 50,
    0,
    100
  );
  const knowledgeComponent = clamp(
    profile.knowledgeModel.skillLevel === "expert"
      ? 95
      : profile.knowledgeModel.skillLevel === "professional"
        ? 85
        : 70,
    0,
    100
  );
  const riskComponent = clamp(100 - (profile.riskModel.riskLevel - 1) * 12, 30, 100);
  const resourceComponent = clamp(
    60 + profile.requiredTools.length * 5 + profile.requiredLicenses.length * 5,
    0,
    100
  );

  const score = Math.round(
    (timeComponent * timeWeight +
      effortComponent * effortWeight +
      knowledgeComponent * knowledgeWeight +
      riskComponent * riskWeight +
      resourceComponent * resourceWeight) /
      100
  );

  return {
    score: clamp(score, 0, 100),
    timeWeight,
    effortWeight,
    knowledgeWeight,
    riskWeight,
    resourceWeight,
    summary: `Execution score ${clamp(score, 0, 100)} synthesized from TEKRR dimensions.`,
  };
}

export function scoreTekrrProfile(profile: TekrrExecutionProfile): ExecutionScore {
  return computeExecutionScore(profile);
}
