import type { RiskAssessmentInput, RiskLevel, RiskProfile } from "./types.js";

const COMPLEXITY_SIGNALS = [
  "integration",
  "dashboard",
  "admin",
  "api",
  "custom",
  "multi",
  "complex",
  "migration",
  "legacy",
  "enterprise",
  "security",
  "compliance",
  "تكامل",
  "لوحة",
  "مخصص",
  "معقد",
];

const CATEGORY_BASE_SCORE: Record<RiskAssessmentInput["category"], number> = {
  cleaning: 0,
  design: 2,
  software: 3,
  construction: 4,
  consulting: 2,
  events: 3,
  education: 1,
  general: 2,
};

function countComplexitySignals(text: string): number {
  const lower = text.toLowerCase();
  return COMPLEXITY_SIGNALS.filter(
    (signal) => lower.includes(signal.toLowerCase()) || text.includes(signal)
  ).length;
}

function valueRiskScore(contractValue: number): number {
  if (contractValue <= 0) return 1;
  if (contractValue < 5_000) return 0;
  if (contractValue < 15_000) return 2;
  if (contractValue < 50_000) return 4;
  return 6;
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= 3) return "low";
  if (score <= 7) return "medium";
  return "high";
}

function buildRiskReason(input: RiskAssessmentInput, score: number, level: RiskLevel): string {
  const parts: string[] = [];

  if (input.category === "software" || input.category === "construction") {
    parts.push(`${input.category} engagements carry elevated delivery variance`);
  } else if (input.category === "cleaning") {
    parts.push("Routine service scope with short delivery cycle");
  } else {
    parts.push(`${input.category} category baseline applied`);
  }

  if (input.contractValue >= 15_000) {
    parts.push(`contract value ${input.contractValue} ${input.currency} increases exposure`);
  } else if (input.contractValue > 0) {
    parts.push(`moderate contract value ${input.contractValue} ${input.currency}`);
  }

  const complexityCount = countComplexitySignals(input.requirementText);
  if (complexityCount >= 2) {
    parts.push("multiple complexity signals detected in requirement text");
  } else if (complexityCount === 1) {
    parts.push("complexity signal detected in requirement text");
  }

  if (input.missingQuestionCount > 0) {
    parts.push(`${input.missingQuestionCount} open clarification question(s) remain`);
  }

  if (input.milestoneCount >= 3) {
    parts.push(`${input.milestoneCount}-milestone escrow reduces single-release exposure`);
  }

  if (parts.length === 0) {
    parts.push(`composite risk score ${score} mapped to ${level}`);
  }

  return parts.join("; ");
}

export function assessRisk(input: RiskAssessmentInput): RiskProfile {
  let score = CATEGORY_BASE_SCORE[input.category];
  score += valueRiskScore(input.contractValue);
  score += Math.min(3, countComplexitySignals(input.requirementText));
  score += Math.min(2, input.missingQuestionCount);
  score -= input.milestoneCount >= 4 ? 1 : 0;
  score -= input.ai2Confidence >= 0.8 ? 1 : 0;

  if (score < 0) score = 0;

  const risk_level = scoreToRiskLevel(score);

  return {
    risk_level,
    reason: buildRiskReason(input, score, risk_level),
    recommended_milestones: input.milestoneCount,
  };
}

export { countComplexitySignals, valueRiskScore, scoreToRiskLevel };
