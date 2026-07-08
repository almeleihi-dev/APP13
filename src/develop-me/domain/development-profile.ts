import type { DEVELOPMENT_STEP_TYPES, GAP_CATEGORIES } from "./development-schema.js";
import {
  DEVELOP_ME_SCHEMA_VERSION,
  READINESS_WEIGHTS,
} from "./development-schema.js";
import type { DevelopmentContext } from "./development-context.js";

export type DevelopmentStepType = (typeof DEVELOPMENT_STEP_TYPES)[number];
export type GapCategory = (typeof GAP_CATEGORIES)[number];

export interface GapItem {
  gapId: string;
  category: GapCategory;
  label: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  blockedOpportunities: number;
}

export interface GapRadar {
  userId: string;
  gaps: GapItem[];
  totalGaps: number;
  criticalCount: number;
  summary: string;
  generatedAt: string;
}

export interface MarketSignal {
  signalId: string;
  label: string;
  category: "high_demand_skill" | "emerging_profession" | "regional_shortage" | "marketplace_trend";
  message: string;
  demandScore: number;
}

export interface MarketRadar {
  userId: string;
  signals: MarketSignal[];
  highDemandSkills: string[];
  emergingProfessions: string[];
  regionalShortages: string[];
  summary: string;
  generatedAt: string;
}

export interface IncomeRadar {
  userId: string;
  currentIncomePotentialCents: number;
  incomeAfterImprovementCents: number;
  expectedGrowthPercent: number;
  highestRoiPath: string;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
  generatedAt: string;
}

export interface OpportunityItem {
  opportunityId: string;
  category:
    | "nearby_expert"
    | "learn_by_action"
    | "mentorship"
    | "beginner_action"
    | "intermediate_action"
    | "advanced_action"
    | "marketplace_opening";
  title: string;
  message: string;
  listingId?: string;
  matchScore: number;
  priority: "critical" | "high" | "medium" | "low";
}

export interface OpportunityRadar {
  userId: string;
  opportunities: OpportunityItem[];
  count: number;
  summary: string;
  generatedAt: string;
}

export interface ReadinessFactor {
  factorId: string;
  label: string;
  score: number;
  weight: number;
  weightedContribution: number;
  explanation: string;
}

export interface ReadinessScore {
  userId: string;
  score: number;
  factors: ReadinessFactor[];
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
  generatedAt: string;
}

export interface RoadmapStep {
  stepNumber: number;
  stepId: string;
  stepType: DevelopmentStepType;
  title: string;
  description: string;
  expectedImpact: string;
  estimatedDurationDays: number;
}

export interface DevelopmentRoadmap {
  userId: string;
  steps: RoadmapStep[];
  totalSteps: number;
  nextDevelopmentAction: RoadmapStep | null;
  summary: string;
  generatedAt: string;
}

export interface DevelopmentRecommendation {
  recommendationId: string;
  category: "skill" | "license" | "certification" | "experience" | "action";
  title: string;
  message: string;
  priority: "critical" | "high" | "medium" | "low";
  expectedReadinessGain: number;
  expectedIncomeGainCents: number;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface DevelopmentPlan {
  planId: string;
  userId: string;
  headline: string;
  recommendations: DevelopmentRecommendation[];
  roadmap: DevelopmentRoadmap;
  readiness: ReadinessScore;
  generatedAt: string;
}

export interface DevelopmentValidation {
  valid: boolean;
  guidanceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface DevelopmentProfile {
  schemaVersion: typeof DEVELOP_ME_SCHEMA_VERSION;
  userId: string;
  displayName: string;
  headline: string;
  subheadline: string;
  passportLevel: string;
  liveFrameLabel: string;
  gapRadar: GapRadar;
  marketRadar: MarketRadar;
  incomeRadar: IncomeRadar;
  opportunityRadar: OpportunityRadar;
  readiness: ReadinessScore;
  roadmap: DevelopmentRoadmap;
  plan: DevelopmentPlan;
  readOnly: true;
  generatedAt: string;
}

export interface DevelopmentStatistics {
  totalProfiles: number;
  averageReadinessScore: number;
  averageGapCount: number;
  totalRoadmapSteps: number;
  generatedAt: string;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function buildGapRadar(context: DevelopmentContext): GapRadar {
  const gaps: GapItem[] = [];

  for (const skill of context.missingSkills) {
    gaps.push({
      gapId: `gap://skill/${skill}`,
      category: "skills",
      label: formatLabel(skill),
      description: `Missing skill: ${formatLabel(skill)}`,
      priority: "high",
      blockedOpportunities: 8 + stableHash(skill) % 20,
    });
  }

  for (const license of context.missingLicenses) {
    gaps.push({
      gapId: `gap://license/${license}`,
      category: "licenses",
      label: formatLabel(license),
      description: `Missing license: ${formatLabel(license)}`,
      priority: "critical",
      blockedOpportunities: 15 + stableHash(license) % 30,
    });
  }

  for (const cert of context.missingCertifications) {
    gaps.push({
      gapId: `gap://cert/${cert}`,
      category: "certifications",
      label: formatLabel(cert),
      description: `Missing certification: ${formatLabel(cert)}`,
      priority: "high",
      blockedOpportunities: 6 + stableHash(cert) % 12,
    });
  }

  if (context.completedContracts < context.requiredExperienceActions) {
    gaps.push({
      gapId: `gap://experience/${context.userId}`,
      category: "experience",
      label: "Marketplace experience",
      description: `Complete ${context.requiredExperienceActions - context.completedContracts} more marketplace actions.`,
      priority: "medium",
      blockedOpportunities: 5,
    });
  }

  const ineligibleCount = context.marketplaceListings.length - context.marketplaceEligibleCount;
  if (ineligibleCount > 0) {
    gaps.push({
      gapId: `gap://eligibility/${context.userId}`,
      category: "marketplace_eligibility",
      label: "Marketplace eligibility",
      description: `${ineligibleCount} listings currently blocked by credential gaps.`,
      priority: "high",
      blockedOpportunities: ineligibleCount,
    });
  }

  if (!context.teamReady) {
    gaps.push({
      gapId: `gap://team/${context.userId}`,
      category: "team_readiness",
      label: "Team readiness",
      description: "Team collaboration skills unlock higher-complexity opportunities.",
      priority: "low",
      blockedOpportunities: 3,
    });
  }

  const criticalCount = gaps.filter((gap) => gap.priority === "critical").length;

  return {
    userId: context.userId,
    gaps: gaps.sort((left, right) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[left.priority] - priorityOrder[right.priority];
    }),
    totalGaps: gaps.length,
    criticalCount,
    summary:
      gaps.length === 0
        ? "No significant gaps detected."
        : `${gaps.length} development gap(s) identified, ${criticalCount} critical.`,
    generatedAt: context.generatedAt,
  };
}

export function buildMarketRadar(context: DevelopmentContext): MarketRadar {
  const signals: MarketSignal[] = context.highDemandSkills.map((skill) => ({
    signalId: `signal://demand/${skill}`,
    label: formatLabel(skill),
    category: "high_demand_skill" as const,
    message: `${formatLabel(skill)} is in high demand in your region.`,
    demandScore: 70 + (stableHash(skill) % 25),
  }));

  signals.push({
    signalId: `signal://emerging/electrical`,
    label: "Smart home installation",
    category: "emerging_profession",
    message: "Smart home installation is an emerging high-income profession nearby.",
    demandScore: 82,
  });

  signals.push({
    signalId: `signal://shortage/plumbing`,
    label: "Licensed plumbers",
    category: "regional_shortage",
    message: "Regional shortage of licensed plumbers creates premium opportunities.",
    demandScore: 78,
  });

  signals.push({
    signalId: `signal://trend/marketplace`,
    label: "Verified completions trend",
    category: "marketplace_trend",
    message: "Marketplace demand for verified providers increased this quarter.",
    demandScore: 75,
  });

  return {
    userId: context.userId,
    signals: signals.sort((left, right) => right.demandScore - left.demandScore),
    highDemandSkills: context.highDemandSkills.slice(0, 4),
    emergingProfessions: ["smart_home_installation", "energy_audit_specialist"],
    regionalShortages: ["licensed_plumber", "electrical_contractor"],
    summary: `${signals.length} market signals detected for your development path.`,
    generatedAt: context.generatedAt,
  };
}

export function buildIncomeRadar(context: DevelopmentContext): IncomeRadar {
  const baseIncome = 150000 + context.completedContracts * 35000;
  const gapPenalty =
    context.missingLicenses.length * 40000 +
    context.missingSkills.length * 25000 +
    context.missingCertifications.length * 15000;
  const currentIncomePotentialCents = Math.max(80000, baseIncome - gapPenalty);
  const improvementGain =
    context.missingLicenses.length * 60000 +
    context.missingSkills.length * 35000 +
    context.missingCertifications.length * 20000;
  const incomeAfterImprovementCents = currentIncomePotentialCents + improvementGain;
  const expectedGrowthPercent =
    currentIncomePotentialCents === 0
      ? 0
      : Math.round(
          ((incomeAfterImprovementCents - currentIncomePotentialCents) /
            currentIncomePotentialCents) *
            100
        );

  const highestRoiPath =
    context.missingCertifications.length > 0
      ? "Complete safety certification first — fastest unlock for new opportunities."
      : context.missingSkills.length > 0
        ? `Learn ${formatLabel(context.missingSkills[0]!)} — highest demand skill gap.`
        : context.missingLicenses.length > 0
          ? `Obtain ${formatLabel(context.missingLicenses[0]!)} — unlocks premium listings.`
          : "Complete advanced marketplace actions to reach next income tier.";

  return {
    userId: context.userId,
    currentIncomePotentialCents,
    incomeAfterImprovementCents,
    expectedGrowthPercent,
    highestRoiPath,
    explanation: {
      headline: "Income potential improves as you close development gaps",
      reasons: [
        `Current potential: ${currentIncomePotentialCents} cents/month`,
        `After improvement: ${incomeAfterImprovementCents} cents/month`,
        `Expected growth: ${expectedGrowthPercent}%`,
      ],
      summary: highestRoiPath,
    },
    generatedAt: context.generatedAt,
  };
}

export function buildOpportunityRadar(context: DevelopmentContext): OpportunityRadar {
  const opportunities: OpportunityItem[] = [];

  if (context.missingSkills.length > 0) {
    opportunities.push({
      opportunityId: `opp://expert/${context.missingSkills[0]}`,
      category: "nearby_expert",
      title: "Nearby Expert",
      message: `A trusted expert near you can teach ${formatLabel(context.missingSkills[0]!)}.`,
      matchScore: 85,
      priority: "high",
    });
    opportunities.push({
      opportunityId: `opp://mentor/${context.missingSkills[0]}`,
      category: "mentorship",
      title: "Mentorship",
      message: `Find a mentor for ${formatLabel(context.missingSkills[0]!)} development.`,
      matchScore: 78,
      priority: "medium",
    });
  }

  const beginnerListing = context.marketplaceListings.find(
    (listing) => listing.executionComplexity === "low"
  );
  if (beginnerListing) {
    opportunities.push({
      opportunityId: `opp://beginner/${beginnerListing.id}`,
      category: "beginner_action",
      title: "Beginner Action",
      message: `Start with: ${beginnerListing.title}`,
      listingId: beginnerListing.id,
      matchScore: 90,
      priority: "high",
    });
    opportunities.push({
      opportunityId: `opp://learn/${beginnerListing.id}`,
      category: "learn_by_action",
      title: "Learn by Action",
      message: `Build experience through: ${beginnerListing.title}`,
      listingId: beginnerListing.id,
      matchScore: 88,
      priority: "high",
    });
  }

  const intermediateListing = context.marketplaceListings.find(
    (listing) => listing.executionComplexity === "moderate"
  );
  if (intermediateListing) {
    opportunities.push({
      opportunityId: `opp://intermediate/${intermediateListing.id}`,
      category: "intermediate_action",
      title: "Intermediate Action",
      message: intermediateListing.title,
      listingId: intermediateListing.id,
      matchScore: 72,
      priority: "medium",
    });
  }

  const advancedListing = context.marketplaceListings.find(
    (listing) => listing.executionComplexity === "high"
  );
  if (advancedListing) {
    opportunities.push({
      opportunityId: `opp://advanced/${advancedListing.id}`,
      category: "advanced_action",
      title: "Advanced Action",
      message: `Future target: ${advancedListing.title}`,
      listingId: advancedListing.id,
      matchScore: 45,
      priority: "low",
    });
  }

  for (const listing of context.marketplaceListings.slice(0, 3)) {
    opportunities.push({
      opportunityId: `opp://opening/${listing.id}`,
      category: "marketplace_opening",
      title: "Marketplace Opening",
      message: listing.title,
      listingId: listing.id,
      matchScore: 60 + stableHash(listing.id) % 30,
      priority: "medium",
    });
  }

  return {
    userId: context.userId,
    opportunities: opportunities.sort((left, right) => right.matchScore - left.matchScore),
    count: opportunities.length,
    summary: `${opportunities.length} development opportunities identified.`,
    generatedAt: context.generatedAt,
  };
}

export function buildReadinessScore(context: DevelopmentContext): ReadinessScore {
  const skillScore = Math.min(
    100,
    Math.round((context.skills.length / (context.skills.length + context.missingSkills.length)) * 100)
  );
  const experienceScore = Math.min(
    100,
    context.requiredExperienceActions === 0
      ? 100
      : Math.round((context.completedContracts / context.requiredExperienceActions) * 100)
  );
  const licenseScore = Math.min(
    100,
    Math.round(
      (context.licenses.length / (context.licenses.length + context.missingLicenses.length)) * 100
    )
  );
  const certificationScore =
    context.missingCertifications.length === 0
      ? 100
      : Math.max(0, 100 - context.missingCertifications.length * 40);
  const trustScore = Math.min(100, context.trustScore);
  const liveFrameScore =
    context.liveFrameTier === "gold" ? 95 : context.liveFrameTier === "silver" ? 75 : 55;
  const eligibilityScore = Math.min(
    100,
    context.marketplaceListings.length === 0
      ? 0
      : Math.round((context.marketplaceEligibleCount / context.marketplaceListings.length) * 100)
  );

  const factors: ReadinessFactor[] = [
    {
      factorId: "factor://skills",
      label: "Skills",
      score: skillScore,
      weight: READINESS_WEIGHTS.skills,
      weightedContribution: Math.round(skillScore * READINESS_WEIGHTS.skills),
      explanation: `${context.skills.length} skills held, ${context.missingSkills.length} gaps remaining.`,
    },
    {
      factorId: "factor://experience",
      label: "Experience",
      score: experienceScore,
      weight: READINESS_WEIGHTS.experience,
      weightedContribution: Math.round(experienceScore * READINESS_WEIGHTS.experience),
      explanation: `${context.completedContracts} completed actions.`,
    },
    {
      factorId: "factor://licenses",
      label: "Licenses",
      score: licenseScore,
      weight: READINESS_WEIGHTS.licenses,
      weightedContribution: Math.round(licenseScore * READINESS_WEIGHTS.licenses),
      explanation: `${context.missingLicenses.length} license gap(s).`,
    },
    {
      factorId: "factor://certifications",
      label: "Certifications",
      score: certificationScore,
      weight: READINESS_WEIGHTS.certifications,
      weightedContribution: Math.round(certificationScore * READINESS_WEIGHTS.certifications),
      explanation: `${context.missingCertifications.length} certification gap(s).`,
    },
    {
      factorId: "factor://trust",
      label: "Trust",
      score: trustScore,
      weight: READINESS_WEIGHTS.trust,
      weightedContribution: Math.round(trustScore * READINESS_WEIGHTS.trust),
      explanation: `Trust score: ${context.trustScore}.`,
    },
    {
      factorId: "factor://live_frame",
      label: "Live Frame",
      score: liveFrameScore,
      weight: READINESS_WEIGHTS.liveFrame,
      weightedContribution: Math.round(liveFrameScore * READINESS_WEIGHTS.liveFrame),
      explanation: `${context.liveFrameLabel} tier.`,
    },
    {
      factorId: "factor://eligibility",
      label: "Marketplace Eligibility",
      score: eligibilityScore,
      weight: READINESS_WEIGHTS.marketplaceEligibility,
      weightedContribution: Math.round(eligibilityScore * READINESS_WEIGHTS.marketplaceEligibility),
      explanation: `${context.marketplaceEligibleCount} of ${context.marketplaceListings.length} listings eligible.`,
    },
  ];

  const score = Math.min(
    100,
    factors.reduce((total, factor) => total + factor.weightedContribution, 0)
  );

  return {
    userId: context.userId,
    score,
    factors,
    explanation: {
      headline: `Professional readiness: ${score}%`,
      reasons: factors.map(
        (factor) => `${factor.label}: ${factor.score}% (weight ${Math.round(factor.weight * 100)}%)`
      ),
      summary: score >= 80
        ? "Strong readiness — focus on advanced opportunities."
        : score >= 60
          ? "Moderate readiness — close credential gaps for faster growth."
          : "Early readiness — follow the development roadmap to unlock opportunities.",
    },
    generatedAt: context.generatedAt,
  };
}

export function buildDevelopmentRoadmap(context: DevelopmentContext): DevelopmentRoadmap {
  const steps: RoadmapStep[] = [];
  let stepNumber = 1;

  if (context.missingCertifications.length > 0) {
    steps.push({
      stepNumber: stepNumber++,
      stepId: `step://cert/${context.missingCertifications[0]}`,
      stepType: "certification",
      title: `Complete ${formatLabel(context.missingCertifications[0]!)}`,
      description: "Obtain required safety certification for marketplace eligibility.",
      expectedImpact: "Unlocks certified-provider marketplace segments.",
      estimatedDurationDays: 7,
    });
  }

  if (context.missingSkills.length > 0) {
    steps.push({
      stepNumber: stepNumber++,
      stepId: `step://skill/${context.missingSkills[0]}`,
      stepType: "skill",
      title: `Learn ${formatLabel(context.missingSkills[0]!)}`,
      description: "Close the highest-priority skill gap for your region.",
      expectedImpact: "Qualifies you for high-demand marketplace actions.",
      estimatedDurationDays: 14,
    });
  }

  if (context.completedContracts < context.requiredExperienceActions) {
    const remaining = context.requiredExperienceActions - context.completedContracts;
    steps.push({
      stepNumber: stepNumber++,
      stepId: `step://experience/${context.userId}`,
      stepType: "experience",
      title: `Complete ${remaining} Marketplace Actions`,
      description: "Build verified experience through beginner and intermediate actions.",
      expectedImpact: "Increases trust score and passport level.",
      estimatedDurationDays: remaining * 3,
    });
  }

  if (context.missingLicenses.length > 0) {
    steps.push({
      stepNumber: stepNumber++,
      stepId: `step://license/${context.missingLicenses[0]}`,
      stepType: "license",
      title: `Obtain ${formatLabel(context.missingLicenses[0]!)}`,
      description: "Meet professional licensing requirements for premium listings.",
      expectedImpact: "Unlocks advanced marketplace opportunities.",
      estimatedDurationDays: 30,
    });
  }

  steps.push({
    stepNumber: stepNumber++,
    stepId: `step://unlock/${context.userId}`,
    stepType: "unlock_opportunities",
    title: "Unlock Advanced Opportunities",
    description: "Access high-income marketplace listings in your region.",
    expectedImpact: "Maximize income potential and professional growth.",
    estimatedDurationDays: 0,
  });

  const nextDevelopmentAction = steps[0] ?? null;

  return {
    userId: context.userId,
    steps,
    totalSteps: steps.length,
    nextDevelopmentAction,
    summary: nextDevelopmentAction
      ? `Next: ${nextDevelopmentAction.title}`
      : "Development path complete — pursue advanced opportunities.",
    generatedAt: context.generatedAt,
  };
}

export function buildDevelopmentRecommendations(
  context: DevelopmentContext,
  readiness: ReadinessScore
): DevelopmentRecommendation[] {
  const recommendations: DevelopmentRecommendation[] = [];

  for (const skill of context.missingSkills.slice(0, 2)) {
    recommendations.push({
      recommendationId: `rec://skill/${skill}`,
      category: "skill",
      title: `Learn ${formatLabel(skill)}`,
      message: `${formatLabel(skill)} is in high demand and closes a critical skill gap.`,
      priority: "high",
      expectedReadinessGain: 8,
      expectedIncomeGainCents: 35000,
      explanation: {
        headline: "Skill recommendation",
        reasons: [
          "High regional demand",
          "Blocks multiple marketplace listings",
          "Shortest path to increased eligibility",
        ],
        summary: `Learning ${formatLabel(skill)} improves readiness and income potential.`,
      },
    });
  }

  for (const license of context.missingLicenses) {
    recommendations.push({
      recommendationId: `rec://license/${license}`,
      category: "license",
      title: `Obtain ${formatLabel(license)}`,
      message: `Required license unlocks premium marketplace opportunities.`,
      priority: "critical",
      expectedReadinessGain: 12,
      expectedIncomeGainCents: 60000,
      explanation: {
        headline: "License recommendation",
        reasons: [
          "Required for advanced listings",
          "Highest income unlock per credential",
          "Improves marketplace eligibility significantly",
        ],
        summary: `Obtaining ${formatLabel(license)} is the highest-ROI credential step.`,
      },
    });
  }

  for (const cert of context.missingCertifications) {
    recommendations.push({
      recommendationId: `rec://cert/${cert}`,
      category: "certification",
      title: `Complete ${formatLabel(cert)}`,
      message: "Fastest certification to unlock new marketplace categories.",
      priority: "high",
      expectedReadinessGain: 6,
      expectedIncomeGainCents: 20000,
      explanation: {
        headline: "Certification recommendation",
        reasons: [
          "Low time investment",
          "Visible on Professional Passport",
          "Unlocks certified-provider segments",
        ],
        summary: "Complete certification before pursuing advanced skills.",
      },
    });
  }

  if (context.completedContracts < context.requiredExperienceActions) {
    recommendations.push({
      recommendationId: `rec://experience/${context.userId}`,
      category: "experience",
      title: "Complete marketplace actions",
      message: "Build verified experience through guided beginner actions.",
      priority: "medium",
      expectedReadinessGain: 5,
      expectedIncomeGainCents: 15000,
      explanation: {
        headline: "Experience recommendation",
        reasons: [
          "Increases trust score",
          "Improves Live Frame progression",
          "Required before advanced credentials",
        ],
        summary: "Learn by doing — complete marketplace actions to build experience.",
      },
    });
  }

  recommendations.push({
    recommendationId: `rec://action/${context.userId}`,
    category: "action",
    title: "Take next development action",
    message: readiness.score < 60
      ? "Focus on certifications and beginner actions first."
      : "Pursue intermediate marketplace actions to accelerate growth.",
    priority: readiness.score < 60 ? "high" : "medium",
    expectedReadinessGain: 4,
    expectedIncomeGainCents: 10000,
    explanation: {
      headline: "Next development action",
      reasons: [
        `Current readiness: ${readiness.score}%`,
        "Roadmap prioritizes highest-ROI steps",
        "Each step unlocks more opportunities",
      ],
      summary: "Follow the development roadmap for the shortest path to growth.",
    },
  });

  return recommendations.sort((left, right) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[left.priority] - priorityOrder[right.priority];
  });
}

export function buildDevelopmentPlan(input: {
  context: DevelopmentContext;
  roadmap: DevelopmentRoadmap;
  readiness: ReadinessScore;
}): DevelopmentPlan {
  const recommendations = buildDevelopmentRecommendations(input.context, input.readiness);
  return {
    planId: `plan://${input.context.userId}`,
    userId: input.context.userId,
    headline: input.roadmap.nextDevelopmentAction
      ? `Start with: ${input.roadmap.nextDevelopmentAction.title}`
      : "Your development path is on track.",
    recommendations,
    roadmap: input.roadmap,
    readiness: input.readiness,
    generatedAt: input.context.generatedAt,
  };
}

export function validateDevelopmentContext(context: DevelopmentContext): DevelopmentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!context.userId) errors.push("user_id is required");
  if (context.marketplaceListings.length === 0) {
    warnings.push("No marketplace listings available for demand analysis");
  }
  return {
    valid: errors.length === 0,
    guidanceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Development context is valid and ready for roadmap generation."
        : "Development context failed validation.",
  };
}

export function buildDevelopmentProfile(context: DevelopmentContext): DevelopmentProfile {
  const gapRadar = buildGapRadar(context);
  const marketRadar = buildMarketRadar(context);
  const incomeRadar = buildIncomeRadar(context);
  const opportunityRadar = buildOpportunityRadar(context);
  const readiness = buildReadinessScore(context);
  const roadmap = buildDevelopmentRoadmap(context);
  const plan = buildDevelopmentPlan({ context, roadmap, readiness });

  return {
    schemaVersion: DEVELOP_ME_SCHEMA_VERSION,
    userId: context.userId,
    displayName: context.displayName,
    headline: plan.headline,
    subheadline: `Readiness ${readiness.score}% · ${gapRadar.totalGaps} gap(s) · ${roadmap.totalSteps} roadmap steps`,
    passportLevel: context.passportLevel,
    liveFrameLabel: context.liveFrameLabel,
    gapRadar,
    marketRadar,
    incomeRadar,
    opportunityRadar,
    readiness,
    roadmap,
    plan,
    readOnly: true,
    generatedAt: context.generatedAt,
  };
}

export function buildDevelopmentStatistics(profiles: DevelopmentProfile[]): DevelopmentStatistics {
  if (profiles.length === 0) {
    return {
      totalProfiles: 0,
      averageReadinessScore: 0,
      averageGapCount: 0,
      totalRoadmapSteps: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const readinessSum = profiles.reduce((sum, profile) => sum + profile.readiness.score, 0);
  const gapSum = profiles.reduce((sum, profile) => sum + profile.gapRadar.totalGaps, 0);
  const stepSum = profiles.reduce((sum, profile) => sum + profile.roadmap.totalSteps, 0);

  return {
    totalProfiles: profiles.length,
    averageReadinessScore: Math.round(readinessSum / profiles.length),
    averageGapCount: Math.round(gapSum / profiles.length),
    totalRoadmapSteps: stepSum,
    generatedAt: new Date().toISOString(),
  };
}

export function collectDevelopMePaths(rootDir: string): string[] {
  return [`${rootDir}/src/develop-me`];
}

export function toDevelopmentProfileView(profile: DevelopmentProfile) {
  return {
    schema_version: profile.schemaVersion,
    user_id: profile.userId,
    display_name: profile.displayName,
    headline: profile.headline,
    subheadline: profile.subheadline,
    passport_level: profile.passportLevel,
    live_frame_label: profile.liveFrameLabel,
    readiness_score: profile.readiness.score,
    gap_count: profile.gapRadar.totalGaps,
    roadmap_steps: profile.roadmap.totalSteps,
    next_development_action: profile.roadmap.nextDevelopmentAction
      ? toRoadmapStepView(profile.roadmap.nextDevelopmentAction)
      : null,
    read_only: profile.readOnly,
    generated_at: profile.generatedAt,
  };
}

export function toGapRadarView(radar: GapRadar) {
  return {
    user_id: radar.userId,
    gaps: radar.gaps.map((gap) => ({
      gap_id: gap.gapId,
      category: gap.category,
      label: gap.label,
      description: gap.description,
      priority: gap.priority,
      blocked_opportunities: gap.blockedOpportunities,
    })),
    total_gaps: radar.totalGaps,
    critical_count: radar.criticalCount,
    summary: radar.summary,
    generated_at: radar.generatedAt,
  };
}

export function toMarketRadarView(radar: MarketRadar) {
  return {
    user_id: radar.userId,
    signals: radar.signals.map((signal) => ({
      signal_id: signal.signalId,
      label: signal.label,
      category: signal.category,
      message: signal.message,
      demand_score: signal.demandScore,
    })),
    high_demand_skills: radar.highDemandSkills,
    emerging_professions: radar.emergingProfessions,
    regional_shortages: radar.regionalShortages,
    summary: radar.summary,
    generated_at: radar.generatedAt,
  };
}

export function toIncomeRadarView(radar: IncomeRadar) {
  return {
    user_id: radar.userId,
    current_income_potential_cents: radar.currentIncomePotentialCents,
    income_after_improvement_cents: radar.incomeAfterImprovementCents,
    expected_growth_percent: radar.expectedGrowthPercent,
    highest_roi_path: radar.highestRoiPath,
    explanation: {
      headline: radar.explanation.headline,
      reasons: radar.explanation.reasons,
      summary: radar.explanation.summary,
    },
    generated_at: radar.generatedAt,
  };
}

export function toOpportunityRadarView(radar: OpportunityRadar) {
  return {
    user_id: radar.userId,
    opportunities: radar.opportunities.map((opp) => ({
      opportunity_id: opp.opportunityId,
      category: opp.category,
      title: opp.title,
      message: opp.message,
      listing_id: opp.listingId ?? null,
      match_score: opp.matchScore,
      priority: opp.priority,
    })),
    count: radar.count,
    summary: radar.summary,
    generated_at: radar.generatedAt,
  };
}

export function toReadinessScoreView(readiness: ReadinessScore) {
  return {
    user_id: readiness.userId,
    score: readiness.score,
    factors: readiness.factors.map((factor) => ({
      factor_id: factor.factorId,
      label: factor.label,
      score: factor.score,
      weight: factor.weight,
      weighted_contribution: factor.weightedContribution,
      explanation: factor.explanation,
    })),
    explanation: {
      headline: readiness.explanation.headline,
      reasons: readiness.explanation.reasons,
      summary: readiness.explanation.summary,
    },
    generated_at: readiness.generatedAt,
  };
}

export function toRoadmapStepView(step: RoadmapStep) {
  return {
    step_number: step.stepNumber,
    step_id: step.stepId,
    step_type: step.stepType,
    title: step.title,
    description: step.description,
    expected_impact: step.expectedImpact,
    estimated_duration_days: step.estimatedDurationDays,
  };
}

export function toDevelopmentRoadmapView(roadmap: DevelopmentRoadmap) {
  return {
    user_id: roadmap.userId,
    steps: roadmap.steps.map(toRoadmapStepView),
    total_steps: roadmap.totalSteps,
    next_development_action: roadmap.nextDevelopmentAction
      ? toRoadmapStepView(roadmap.nextDevelopmentAction)
      : null,
    summary: roadmap.summary,
    generated_at: roadmap.generatedAt,
  };
}

export function toDevelopmentStatisticsView(stats: DevelopmentStatistics) {
  return {
    total_profiles: stats.totalProfiles,
    average_readiness_score: stats.averageReadinessScore,
    average_gap_count: stats.averageGapCount,
    total_roadmap_steps: stats.totalRoadmapSteps,
    generated_at: stats.generatedAt,
  };
}
