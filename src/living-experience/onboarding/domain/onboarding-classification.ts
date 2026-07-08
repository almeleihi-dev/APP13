import type { CONFIDENCE_LEVELS, PROFESSIONAL_RANKS } from "./onboarding-schema.js";
import type { OnboardingContext } from "./onboarding-context.js";

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type ProfessionalRank = (typeof PROFESSIONAL_RANKS)[number];

export interface InitialClassification {
  userId: string;
  professionalIdentity: string;
  professionalReadiness: number;
  professionalInterests: string[];
  recommendedGrowthPath: string[];
  professionalPotential: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  reasoning: string[];
  alternativePaths: string[];
  missingInformation: string[];
  generatedAt: string;
}

export interface ClassificationExplanation {
  headline: string;
  reasoning: string[];
  contributingFactors: Array<{ factor: string; weight: number; summary: string }>;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  alternatives: string[];
  missingInformation: string[];
}

function resolvePrimaryAction(context: OnboardingContext): string {
  const sq = context.responses.smartQuestions;
  if (sq?.requestedAction) {
    return sq.requestedAction;
  }
  if (sq?.enjoyedAction) {
    return sq.enjoyedAction;
  }
  const skills = context.responses.professionalBackground?.skills ?? [];
  return skills[0] ?? "general_professional_services";
}

function resolveWorkStyle(context: OnboardingContext): string[] {
  const sq = context.responses.smartQuestions;
  if (!sq) {
    return [];
  }
  const styles: string[] = [];
  if (sq.enjoysLeading) styles.push("leadership");
  if (sq.prefersAlone) styles.push("independent_work");
  if (sq.enjoysTeaching) styles.push("teaching");
  if (sq.enjoysConsulting) styles.push("consulting");
  if (sq.enjoysBuilding) styles.push("building");
  if (sq.enjoysReviewing) styles.push("quality_review");
  return styles;
}

function computeCalibrationScore(context: OnboardingContext): number {
  const missions = context.responses.professionalCalibration?.missions ?? [];
  if (missions.length === 0) {
    return 40;
  }
  const total = missions.reduce((sum, m) => sum + Math.min(100, Math.max(0, m.score)), 0);
  return Math.round(total / missions.length);
}

function computeReadiness(context: OnboardingContext): number {
  let score = 30;
  const bg = context.responses.professionalBackground;
  if (bg) {
    score += Math.min(20, bg.skills.length * 4);
    score += Math.min(15, bg.certificates.length * 5);
    score += Math.min(15, bg.licenses.length * 7);
    score += Math.min(10, bg.experienceYears * 2);
  }
  const iron = context.responses.ironVerification;
  if (iron?.identityConfirmed) score += 5;
  if (iron?.emailVerified) score += 3;
  if (iron?.phoneVerified) score += 2;
  score += Math.round(computeCalibrationScore(context) * 0.15);
  return Math.min(100, score);
}

function resolveConfidence(context: OnboardingContext): { level: ConfidenceLevel; score: number } {
  const completed = context.completedSteps.length;
  const hasGeo = Boolean(context.responses.geographicIntelligence);
  const hasBg = Boolean(context.responses.professionalBackground);
  const hasStory = Boolean(context.responses.professionalStory);
  const hasSmart = Boolean(context.responses.smartQuestions);
  const hasCalibration = Boolean(context.responses.professionalCalibration);

  let score = 30 + completed * 4;
  if (hasGeo) score += 10;
  if (hasBg) score += 12;
  if (hasStory) score += 8;
  if (hasSmart) score += 12;
  if (hasCalibration) score += 10;
  score = Math.min(100, score);

  let level: ConfidenceLevel = "low";
  if (score >= 85) level = "very_high";
  else if (score >= 70) level = "high";
  else if (score >= 50) level = "moderate";

  return { level, score };
}

function buildProfessionalIdentity(context: OnboardingContext): string {
  const action = resolvePrimaryAction(context);
  const styles = resolveWorkStyle(context);
  const industry = context.responses.professionalBackground?.industries[0] ?? "general";
  const region = context.responses.geographicIntelligence?.preferredWorkRegion ?? "local";

  const styleLabel = styles.length > 0 ? styles.slice(0, 2).join(" and ") : "hands-on";
  return `${styleLabel} ${action.replace(/_/g, " ")} professional in ${industry.replace(/_/g, " ")} (${region})`;
}

function buildGrowthPath(context: OnboardingContext): string[] {
  const sq = context.responses.smartQuestions;
  const path: string[] = [];
  if (sq?.masterAction) {
    path.push(`Master ${sq.masterAction.replace(/_/g, " ")}`);
  }
  if (sq?.enjoysLeading) {
    path.push("Develop team leadership skills");
  }
  if (context.responses.professionalBackground?.licenses.length === 0) {
    path.push("Obtain relevant professional license");
  }
  path.push("Build verified track record on APP13");
  return path.slice(0, 4);
}

function buildInterests(context: OnboardingContext): string[] {
  const interests = new Set<string>();
  const bg = context.responses.professionalBackground;
  bg?.favoriteActivities.forEach((a) => interests.add(a));
  bg?.industries.forEach((i) => interests.add(i));
  resolveWorkStyle(context).forEach((s) => interests.add(s));
  if (context.responses.professionalStory?.preferredWorkType) {
    interests.add(context.responses.professionalStory.preferredWorkType);
  }
  return [...interests].slice(0, 6);
}

function buildMissingInformation(context: OnboardingContext): string[] {
  const missing: string[] = [];
  if (!context.responses.geographicIntelligence) {
    missing.push("Geographic preferences");
  }
  if (!context.responses.professionalBackground?.licenses.length) {
    missing.push("Professional licenses");
  }
  if (context.responses.ironVerification?.governmentVerificationStatus === "not_started") {
    missing.push("Government verification (optional, future)");
  }
  if (!context.responses.professionalStory) {
    missing.push("Professional story");
  }
  return missing;
}

function buildAlternativePaths(context: OnboardingContext): string[] {
  const sq = context.responses.smartQuestions;
  const alternatives: string[] = [];
  if (sq?.enjoyedAction && sq.enjoyedAction !== sq.requestedAction) {
    alternatives.push(`Grow through ${sq.enjoyedAction.replace(/_/g, " ")}`);
  }
  if (sq?.enjoysConsulting) {
    alternatives.push("Consulting-focused career path");
  }
  if (sq?.enjoysTeaching) {
    alternatives.push("Teaching and mentorship path");
  }
  return alternatives.slice(0, 3);
}

function resolvePotential(context: OnboardingContext): string {
  const readiness = computeReadiness(context);
  const calibration = computeCalibrationScore(context);
  const combined = readiness * 0.6 + calibration * 0.4;
  if (combined >= 75) return "high_growth_potential";
  if (combined >= 55) return "steady_growth_potential";
  return "emerging_potential";
}

export function buildInitialClassification(context: OnboardingContext): InitialClassification {
  const confidence = resolveConfidence(context);
  const readiness = computeReadiness(context);
  const reasoning = [
    `Primary professional action: ${resolvePrimaryAction(context).replace(/_/g, " ")}`,
    `Work style signals: ${resolveWorkStyle(context).join(", ") || "generalist"}`,
    `Calibration score: ${computeCalibrationScore(context)}`,
    `Geographic context: ${context.responses.geographicIntelligence?.country ?? "not yet provided"}`,
  ];

  return {
    userId: context.userId,
    professionalIdentity: buildProfessionalIdentity(context),
    professionalReadiness: readiness,
    professionalInterests: buildInterests(context),
    recommendedGrowthPath: buildGrowthPath(context),
    professionalPotential: resolvePotential(context),
    confidence: confidence.level,
    confidenceScore: confidence.score,
    reasoning,
    alternativePaths: buildAlternativePaths(context),
    missingInformation: buildMissingInformation(context),
    generatedAt: context.generatedAt,
  };
}

export function buildClassificationExplanation(
  classification: InitialClassification
): ClassificationExplanation {
  return {
    headline: classification.professionalIdentity,
    reasoning: classification.reasoning,
    contributingFactors: [
      {
        factor: "professional_readiness",
        weight: 35,
        summary: `Readiness score: ${classification.professionalReadiness}`,
      },
      {
        factor: "smart_questions",
        weight: 25,
        summary: `Interests: ${classification.professionalInterests.slice(0, 3).join(", ")}`,
      },
      {
        factor: "calibration",
        weight: 20,
        summary: `Potential: ${classification.professionalPotential.replace(/_/g, " ")}`,
      },
      {
        factor: "geographic_context",
        weight: 20,
        summary: "Regional preferences applied to recommendations",
      },
    ],
    confidence: classification.confidence,
    confidenceScore: classification.confidenceScore,
    alternatives: classification.alternativePaths,
    missingInformation: classification.missingInformation,
  };
}

export function toInitialClassificationView(classification: InitialClassification) {
  return {
    schema_version: "living-onboarding-v1",
    user_id: classification.userId,
    professional_identity: classification.professionalIdentity,
    professional_readiness: classification.professionalReadiness,
    professional_interests: classification.professionalInterests,
    recommended_growth_path: classification.recommendedGrowthPath,
    professional_potential: classification.professionalPotential,
    confidence: classification.confidence,
    confidence_score: classification.confidenceScore,
    reasoning: classification.reasoning,
    alternative_paths: classification.alternativePaths,
    missing_information: classification.missingInformation,
    explainable: true,
    generated_at: classification.generatedAt,
    read_only: true,
    experience_only: true,
  };
}

export function toClassificationExplanationView(explanation: ClassificationExplanation) {
  return {
    headline: explanation.headline,
    reasoning: explanation.reasoning,
    contributing_factors: explanation.contributingFactors.map((f) => ({
      factor: f.factor,
      weight: f.weight,
      summary: f.summary,
    })),
    confidence: explanation.confidence,
    confidence_score: explanation.confidenceScore,
    alternatives: explanation.alternatives,
    missing_information: explanation.missingInformation,
    explainable: true,
    read_only: true,
  };
}

export function resolveProfessionalRank(context: OnboardingContext): ProfessionalRank {
  const readiness = computeReadiness(context);
  if (readiness >= 75) return "advanced";
  if (readiness >= 55) return "established";
  if (readiness >= 35) return "rising";
  return "starter";
}
