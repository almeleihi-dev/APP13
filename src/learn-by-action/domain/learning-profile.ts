import type { LEARNING_CATEGORIES, PRIORITY_LEVELS, SESSION_STATUSES } from "./learning-schema.js";
import { LEARN_BY_ACTION_SCHEMA_VERSION } from "./learning-schema.js";
import type { LearningContext, SeedExpertProfile } from "./learning-context.js";

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export interface ExpertRecommendation {
  recommendationId: string;
  expertId: string;
  displayName: string;
  distanceKm: number;
  distanceLabel: string;
  trustScore: number;
  liveFrameTier: string;
  passportLevel: string;
  experienceYears: number;
  skills: string[];
  estimatedCostCents: number;
  estimatedDurationHours: number;
  matchScore: number;
  priority: PriorityLevel;
  professionalImpact: string;
  targetSkill: string;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
}

export interface LearningOpportunity {
  opportunityId: string;
  title: string;
  message: string;
  category: LearningCategory;
  targetSkill: string;
  expertId: string;
  expertName: string;
  estimatedDurationHours: number;
  estimatedCostCents: number;
  matchScore: number;
  listingId?: string;
  priority: PriorityLevel;
}

export interface LearningSession {
  sessionId: string;
  title: string;
  category: LearningCategory;
  expertId: string;
  expertName: string;
  targetSkill: string;
  estimatedDurationHours: number;
  estimatedCostCents: number;
  status: SessionStatus;
  professionalAction: string;
}

export interface LearningImpact {
  userId: string;
  skillsGained: string[];
  actionsUnlocked: string[];
  readinessIncrease: number;
  incomeIncreaseCents: number;
  marketplaceOpportunitiesUnlocked: number;
  explanation: {
    headline: string;
    reasons: string[];
    summary: string;
  };
  generatedAt: string;
}

export interface LearningRoadmapStep {
  stepNumber: number;
  stepId: string;
  title: string;
  category: LearningCategory;
  targetSkill: string;
  expertName: string;
  estimatedDurationHours: number;
}

export interface LearningRoadmap {
  userId: string;
  steps: LearningRoadmapStep[];
  totalSteps: number;
  summary: string;
  generatedAt: string;
}

export interface LearningRecommendation {
  recommendationId: string;
  title: string;
  message: string;
  category: LearningCategory;
  expertId: string;
  priority: PriorityLevel;
  expectedReadinessGain: number;
  expectedIncomeGainCents: number;
}

export interface LearningOutcome {
  outcomeId: string;
  title: string;
  description: string;
  skill: string;
  actionUnlocked: string;
  completedAt: string;
}

export interface LearningPreview {
  opportunity: LearningOpportunity;
  expert: ExpertRecommendation;
  impact: LearningImpact;
  previewOnly: true;
  explainable: true;
  summary: string;
}

export interface LearningValidation {
  valid: boolean;
  guidanceReady: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface LearningProfile {
  schemaVersion: typeof LEARN_BY_ACTION_SCHEMA_VERSION;
  userId: string;
  displayName: string;
  headline: string;
  subheadline: string;
  bestExpert: ExpertRecommendation | null;
  nearestExpert: ExpertRecommendation | null;
  opportunities: LearningOpportunity[];
  expertRecommendations: ExpertRecommendation[];
  sessions: LearningSession[];
  impact: LearningImpact;
  roadmap: LearningRoadmap;
  recommendations: LearningRecommendation[];
  history: LearningOutcome[];
  readOnly: true;
  generatedAt: string;
}

export interface LearningStatistics {
  totalProfiles: number;
  totalRecommendations: number;
  averageMatchScore: number;
  categoryDistribution: Record<string, number>;
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

function scoreExpertMatch(expert: SeedExpertProfile, targetSkill: string): number {
  const skillMatch = expert.skills.includes(targetSkill) ? 35 : expert.skills.some((s) => s.includes(targetSkill.split("_")[0]!)) ? 20 : 5;
  const trustBoost = Math.round(expert.trustScore * 0.35);
  const experienceBoost = Math.min(15, expert.experienceYears);
  const distancePenalty = Math.min(20, expert.distanceKm * 2);
  return Math.min(100, skillMatch + trustBoost + experienceBoost - distancePenalty + (stableHash(expert.expertId) % 8));
}

function mapSkillToCategory(skill: string): LearningCategory {
  if (skill.includes("safety")) return "safety_practices";
  if (skill.includes("electrical") || skill.includes("hvac")) return "technical_procedures";
  if (skill.includes("diagnostic")) return "professional_actions";
  return "practical_skills";
}

function estimateDurationHours(skill: string): number {
  return 4 + (stableHash(skill) % 12);
}

function estimateCostCents(expert: SeedExpertProfile, durationHours: number): number {
  return expert.hourlyRateCents * durationHours;
}

export function buildExpertRecommendations(context: LearningContext): ExpertRecommendation[] {
  const targetSkills =
    context.missingSkills.length > 0 ? context.missingSkills : ["general_maintenance"];

  const recommendations: ExpertRecommendation[] = [];

  for (const skill of targetSkills) {
    for (const expert of context.experts) {
      const durationHours = estimateDurationHours(skill);
      const matchScore = scoreExpertMatch(expert, skill);
      if (matchScore < 50) continue;

      recommendations.push({
        recommendationId: `lba://expert/${expert.expertId}/${skill}`,
        expertId: expert.expertId,
        displayName: expert.displayName,
        distanceKm: expert.distanceKm,
        distanceLabel: expert.distanceKm <= 3 ? "Nearby" : `${expert.distanceKm} km`,
        trustScore: expert.trustScore,
        liveFrameTier: expert.liveFrameTier,
        passportLevel: expert.passportLevel,
        experienceYears: expert.experienceYears,
        skills: expert.skills,
        estimatedCostCents: estimateCostCents(expert, durationHours),
        estimatedDurationHours: durationHours,
        matchScore,
        priority: matchScore >= 85 ? "critical" : matchScore >= 70 ? "high" : "medium",
        professionalImpact: `Learn ${formatLabel(skill)} through guided practice with a verified expert.`,
        targetSkill: skill,
        explanation: {
          headline: `Best match for ${formatLabel(skill)}`,
          reasons: [
            `${expert.trustScore} trust score with ${expert.liveFrameTier} Live Frame`,
            `${expert.experienceYears} years professional experience`,
            `${expert.distanceKm} km away — ${expert.distanceKm <= 3 ? "nearest available" : "within service area"}`,
          ],
          summary: `${expert.displayName} is a strong teacher for ${formatLabel(skill)}.`,
        },
      });
    }
  }

  return recommendations.sort((left, right) => right.matchScore - left.matchScore);
}

export function buildLearningOpportunities(
  context: LearningContext,
  expertRecommendations: ExpertRecommendation[]
): LearningOpportunity[] {
  const opportunities: LearningOpportunity[] = [];
  const seenSkills = new Set<string>();

  for (const rec of expertRecommendations) {
    if (seenSkills.has(rec.targetSkill)) continue;
    seenSkills.add(rec.targetSkill);

    const listing = context.marketplaceListings.find((entry) =>
      entry.requiredSkills.includes(rec.targetSkill)
    );

    opportunities.push({
      opportunityId: `lba://opp/${rec.targetSkill}`,
      title: `Learn ${formatLabel(rec.targetSkill)} by Action`,
      message: `Practice ${formatLabel(rec.targetSkill)} with ${rec.displayName} through real-world sessions.`,
      category: mapSkillToCategory(rec.targetSkill),
      targetSkill: rec.targetSkill,
      expertId: rec.expertId,
      expertName: rec.displayName,
      estimatedDurationHours: rec.estimatedDurationHours,
      estimatedCostCents: rec.estimatedCostCents,
      matchScore: rec.matchScore,
      listingId: listing?.id,
      priority: rec.priority,
    });
  }

  for (const expert of context.experts.slice(0, 2)) {
    opportunities.push({
      opportunityId: `lba://mentor/${expert.expertId}`,
      title: "Mentorship Session",
      message: `Guided mentorship with ${expert.displayName} for field experience.`,
      category: "mentorship",
      targetSkill: expert.skills[0] ?? "field_experience",
      expertId: expert.expertId,
      expertName: expert.displayName,
      estimatedDurationHours: 6,
      estimatedCostCents: expert.hourlyRateCents * 6,
      matchScore: 70 + stableHash(expert.expertId) % 15,
      priority: "medium",
    });
  }

  const safetyListing = context.marketplaceListings.find((l) =>
    l.requiredSkills.some((s) => s.includes("safety"))
  );
  if (context.missingCertifications.length > 0 || safetyListing) {
    opportunities.push({
      opportunityId: `lba://safety/${context.userId}`,
      title: "Safety Practices Workshop",
      message: "Learn safety practices through guided field sessions.",
      category: "safety_practices",
      targetSkill: "safety_compliance",
      expertId: context.experts.find((e) => e.skills.includes("safety_compliance"))?.expertId ?? context.experts[0]!.expertId,
      expertName: context.experts.find((e) => e.skills.includes("safety_compliance"))?.displayName ?? context.experts[0]!.displayName,
      estimatedDurationHours: 8,
      estimatedCostCents: 56000,
      matchScore: 82,
      listingId: safetyListing?.id,
      priority: "high",
    });
  }

  return opportunities.sort((left, right) => right.matchScore - left.matchScore);
}

export function buildLearningSessions(
  opportunities: LearningOpportunity[]
): LearningSession[] {
  return opportunities.slice(0, 6).map((opp) => ({
    sessionId: `session://${opp.opportunityId}`,
    title: opp.title,
    category: opp.category,
    expertId: opp.expertId,
    expertName: opp.expertName,
    targetSkill: opp.targetSkill,
    estimatedDurationHours: opp.estimatedDurationHours,
    estimatedCostCents: opp.estimatedCostCents,
    status: "recommended" as const,
    professionalAction: `Unlock ${formatLabel(opp.targetSkill)} marketplace actions`,
  }));
}

export function buildLearningImpact(
  context: LearningContext,
  opportunities: LearningOpportunity[]
): LearningImpact {
  const skillsGained = [...new Set(opportunities.slice(0, 3).map((opp) => opp.targetSkill))];
  const actionsUnlocked = skillsGained.map(
    (skill) => `${formatLabel(skill)} professional actions`
  );
  const readinessIncrease = Math.min(25, skillsGained.length * 8 + context.missingCertifications.length * 3);
  const incomeIncreaseCents = skillsGained.length * 35000 + context.missingSkills.length * 15000;
  const marketplaceOpportunitiesUnlocked = context.marketplaceListings.filter((listing) =>
    listing.requiredSkills.some((skill) => skillsGained.includes(skill))
  ).length;

  return {
    userId: context.userId,
    skillsGained,
    actionsUnlocked,
    readinessIncrease,
    incomeIncreaseCents,
    marketplaceOpportunitiesUnlocked: Math.max(marketplaceOpportunitiesUnlocked, skillsGained.length * 3),
    explanation: {
      headline: "Measurable impact from learn-by-action sessions",
      reasons: [
        `Skills gained: ${skillsGained.map(formatLabel).join(", ") || "field experience"}`,
        `Readiness increase: +${readinessIncrease}%`,
        `Income potential increase: +${incomeIncreaseCents} cents/month`,
        `Marketplace opportunities unlocked: ${Math.max(marketplaceOpportunitiesUnlocked, skillsGained.length * 3)}`,
      ],
      summary: "Learning through practice improves your Professional Passport and unlocks new marketplace actions.",
    },
    generatedAt: context.generatedAt,
  };
}

export function buildLearningRoadmap(
  context: LearningContext,
  opportunities: LearningOpportunity[]
): LearningRoadmap {
  const steps: LearningRoadmapStep[] = opportunities.slice(0, 5).map((opp, index) => ({
    stepNumber: index + 1,
    stepId: `lba://step/${opp.opportunityId}`,
    title: opp.title,
    category: opp.category,
    targetSkill: opp.targetSkill,
    expertName: opp.expertName,
    estimatedDurationHours: opp.estimatedDurationHours,
  }));

  return {
    userId: context.userId,
    steps,
    totalSteps: steps.length,
    summary:
      steps.length > 0
        ? `Start with: ${steps[0]!.title}`
        : "No learning gaps identified — explore advanced mentorship.",
    generatedAt: context.generatedAt,
  };
}

export function buildLearningRecommendations(
  _context: LearningContext,
  expertRecommendations: ExpertRecommendation[]
): LearningRecommendation[] {
  return expertRecommendations.slice(0, 5).map((rec) => ({
    recommendationId: rec.recommendationId,
    title: `Learn from ${rec.displayName}`,
    message: rec.professionalImpact,
    category: mapSkillToCategory(rec.targetSkill),
    expertId: rec.expertId,
    priority: rec.priority,
    expectedReadinessGain: Math.min(12, Math.round(rec.matchScore / 10)),
    expectedIncomeGainCents: 25000 + stableHash(rec.targetSkill) % 30000,
  }));
}

export function buildLearningHistory(context: LearningContext): LearningOutcome[] {
  if (context.tier === "T1") return [];

  return [
    {
      outcomeId: `outcome://${context.userId}/maintenance`,
      title: "General maintenance practice",
      description: "Completed guided field session for general maintenance.",
      skill: "general_maintenance",
      actionUnlocked: "Basic marketplace maintenance actions",
      completedAt: context.generatedAt,
    },
  ];
}

export function buildLearningPreview(input: {
  context: LearningContext;
  opportunity: LearningOpportunity;
  expert: ExpertRecommendation;
  impact: LearningImpact;
}): LearningPreview {
  return {
    opportunity: input.opportunity,
    expert: input.expert,
    impact: input.impact,
    previewOnly: true,
    explainable: true,
    summary: `Learn ${formatLabel(input.opportunity.targetSkill)} with ${input.expert.displayName} — +${input.impact.readinessIncrease}% readiness.`,
  };
}

export function validateLearningContext(context: LearningContext): LearningValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!context.userId) errors.push("user_id is required");
  if (context.experts.length === 0) warnings.push("No expert profiles available");
  if (context.missingSkills.length === 0) {
    warnings.push("No skill gaps detected — mentorship opportunities still available");
  }
  return {
    valid: errors.length === 0,
    guidanceReady: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "Learning context is valid and ready for recommendation generation."
        : "Learning context failed validation.",
  };
}

export function buildLearningProfile(context: LearningContext): LearningProfile {
  const expertRecommendations = buildExpertRecommendations(context);
  const opportunities = buildLearningOpportunities(context, expertRecommendations);
  const sessions = buildLearningSessions(opportunities);
  const impact = buildLearningImpact(context, opportunities);
  const roadmap = buildLearningRoadmap(context, opportunities);
  const recommendations = buildLearningRecommendations(context, expertRecommendations);
  const history = buildLearningHistory(context);

  const bestExpert = expertRecommendations[0] ?? null;
  const nearestExpert =
    [...expertRecommendations].sort((left, right) => left.distanceKm - right.distanceKm)[0] ?? null;

  return {
    schemaVersion: LEARN_BY_ACTION_SCHEMA_VERSION,
    userId: context.userId,
    displayName: context.displayName,
    headline: bestExpert
      ? `The best expert for you: ${bestExpert.displayName}`
      : "Explore trusted experts for learn-by-action sessions.",
    subheadline: nearestExpert
      ? `Nearest expert ${nearestExpert.distanceLabel} · ${opportunities.length} learning opportunities`
      : `${opportunities.length} learning opportunities available`,
    bestExpert,
    nearestExpert,
    opportunities,
    expertRecommendations,
    sessions,
    impact,
    roadmap,
    recommendations,
    history,
    readOnly: true,
    generatedAt: context.generatedAt,
  };
}

export function buildLearningStatistics(profiles: LearningProfile[]): LearningStatistics {
  const categoryDistribution: Record<string, number> = {};
  let totalRecommendations = 0;
  let matchSum = 0;
  let matchCount = 0;

  for (const profile of profiles) {
    totalRecommendations += profile.expertRecommendations.length;
    for (const rec of profile.expertRecommendations) {
      matchSum += rec.matchScore;
      matchCount += 1;
      categoryDistribution[mapSkillToCategory(rec.targetSkill)] =
        (categoryDistribution[mapSkillToCategory(rec.targetSkill)] ?? 0) + 1;
    }
  }

  return {
    totalProfiles: profiles.length,
    totalRecommendations,
    averageMatchScore: matchCount === 0 ? 0 : Math.round(matchSum / matchCount),
    categoryDistribution,
    generatedAt: new Date().toISOString(),
  };
}

export function collectLearnByActionPaths(rootDir: string): string[] {
  return [`${rootDir}/src/learn-by-action`];
}

export function toLearningProfileView(profile: LearningProfile) {
  return {
    schema_version: profile.schemaVersion,
    user_id: profile.userId,
    display_name: profile.displayName,
    headline: profile.headline,
    subheadline: profile.subheadline,
    best_expert: profile.bestExpert ? toExpertRecommendationView(profile.bestExpert) : null,
    nearest_expert: profile.nearestExpert ? toExpertRecommendationView(profile.nearestExpert) : null,
    opportunity_count: profile.opportunities.length,
    expert_count: profile.expertRecommendations.length,
    read_only: profile.readOnly,
    generated_at: profile.generatedAt,
  };
}

export function toExpertRecommendationView(rec: ExpertRecommendation) {
  return {
    recommendation_id: rec.recommendationId,
    expert_id: rec.expertId,
    display_name: rec.displayName,
    distance_km: rec.distanceKm,
    distance_label: rec.distanceLabel,
    trust_score: rec.trustScore,
    live_frame_tier: rec.liveFrameTier,
    passport_level: rec.passportLevel,
    experience_years: rec.experienceYears,
    skills: rec.skills,
    estimated_cost_cents: rec.estimatedCostCents,
    estimated_duration_hours: rec.estimatedDurationHours,
    match_score: rec.matchScore,
    priority: rec.priority,
    professional_impact: rec.professionalImpact,
    target_skill: rec.targetSkill,
    explanation: {
      headline: rec.explanation.headline,
      reasons: rec.explanation.reasons,
      summary: rec.explanation.summary,
    },
  };
}

export function toLearningOpportunityView(opp: LearningOpportunity) {
  return {
    opportunity_id: opp.opportunityId,
    title: opp.title,
    message: opp.message,
    category: opp.category,
    target_skill: opp.targetSkill,
    expert_id: opp.expertId,
    expert_name: opp.expertName,
    estimated_duration_hours: opp.estimatedDurationHours,
    estimated_cost_cents: opp.estimatedCostCents,
    match_score: opp.matchScore,
    listing_id: opp.listingId ?? null,
    priority: opp.priority,
  };
}

export function toLearningSessionView(session: LearningSession) {
  return {
    session_id: session.sessionId,
    title: session.title,
    category: session.category,
    expert_id: session.expertId,
    expert_name: session.expertName,
    target_skill: session.targetSkill,
    estimated_duration_hours: session.estimatedDurationHours,
    estimated_cost_cents: session.estimatedCostCents,
    status: session.status,
    professional_action: session.professionalAction,
  };
}

export function toLearningImpactView(impact: LearningImpact) {
  return {
    user_id: impact.userId,
    skills_gained: impact.skillsGained,
    actions_unlocked: impact.actionsUnlocked,
    readiness_increase: impact.readinessIncrease,
    income_increase_cents: impact.incomeIncreaseCents,
    marketplace_opportunities_unlocked: impact.marketplaceOpportunitiesUnlocked,
    explanation: {
      headline: impact.explanation.headline,
      reasons: impact.explanation.reasons,
      summary: impact.explanation.summary,
    },
    generated_at: impact.generatedAt,
  };
}

export function toLearningRoadmapView(roadmap: LearningRoadmap) {
  return {
    user_id: roadmap.userId,
    steps: roadmap.steps.map((step) => ({
      step_number: step.stepNumber,
      step_id: step.stepId,
      title: step.title,
      category: step.category,
      target_skill: step.targetSkill,
      expert_name: step.expertName,
      estimated_duration_hours: step.estimatedDurationHours,
    })),
    total_steps: roadmap.totalSteps,
    summary: roadmap.summary,
    generated_at: roadmap.generatedAt,
  };
}

export function toLearningOutcomeView(outcome: LearningOutcome) {
  return {
    outcome_id: outcome.outcomeId,
    title: outcome.title,
    description: outcome.description,
    skill: outcome.skill,
    action_unlocked: outcome.actionUnlocked,
    completed_at: outcome.completedAt,
  };
}

export function toLearningStatisticsView(stats: LearningStatistics) {
  return {
    total_profiles: stats.totalProfiles,
    total_recommendations: stats.totalRecommendations,
    average_match_score: stats.averageMatchScore,
    category_distribution: stats.categoryDistribution,
    generated_at: stats.generatedAt,
  };
}
