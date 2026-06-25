import type { CONFIDENCE_LEVELS } from "./professional-home-schema.js";
import { GREETING_VARIANTS } from "./professional-home-schema.js";
import type { ProfessionalHomeContext } from "./professional-home-context.js";
import { hashDayUser } from "./professional-home-context.js";

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export interface EngineSnapshot {
  todaysBestAction?: {
    title: string;
    description: string;
    category: string;
    routeHint: string;
  };
  bestOpportunity?: {
    title: string;
    message: string;
    matchScore: number;
    expectedIncomeCents?: number;
    listingId?: string;
  };
  passportLevel?: string;
  trustScore?: number;
  liveFrameTier?: string;
  liveFrameLabel?: string;
  topMissingSkill?: string;
  recommendedCourse?: string;
  nearbyExpert?: string;
  practicalSession?: string;
  suggestedTeam?: string;
  topMentor?: string;
  topReviewer?: string;
  topConsultant?: string;
  knowledgeHeadlines?: string[];
  marketplaceActions?: Array<{
    actionCode: string;
    demand: string;
    priceTrend: string;
    competition: string;
  }>;
  readinessScore?: number;
  weeklyIncomeTrend?: string;
  weeklySkillsGained?: number;
  weeklyActionsCompleted?: number;
  weeklyReadinessGrowth?: number;
  weeklyLiveFrameGrowth?: number;
}

export interface HomeSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface GreetingSection extends HomeSectionBase {
  sectionId: "greeting";
  greeting: string;
  subGreeting: string;
}

export interface TodaysBestStepSection extends HomeSectionBase {
  sectionId: "todays_best_step";
  recommendation: string;
  why: string;
  expectedBenefit: string;
  estimatedMinutes: number;
  routeHint: string;
}

export interface BestOpportunitySection extends HomeSectionBase {
  sectionId: "best_opportunity";
  opportunityTitle: string;
  whyItMatches: string;
  expectedIncomeLabel: string;
  readiness: number;
  confidence: ConfidenceLevel;
  confidenceScore: number;
}

export interface PassportSection extends HomeSectionBase {
  sectionId: "professional_passport";
  currentLevel: string;
  verifiedSkills: string[];
  unlockedActions: string[];
  professionalScore: number;
  progressPercent: number;
}

export interface LiveFrameSection extends HomeSectionBase {
  sectionId: "live_frame";
  currentTier: string;
  tierLabel: string;
  reason: string;
  progressToNextLevel: number;
  trustScore: number;
}

export interface JourneySection extends HomeSectionBase {
  sectionId: "professional_journey";
  currentStage: string;
  nextMilestone: string;
  completedMilestones: string[];
}

export interface DevelopMeSection extends HomeSectionBase {
  sectionId: "develop_me";
  topMissingSkill: string;
  recommendedCourse: string;
  governmentOpportunity: string;
  expectedImprovement: string;
}

export interface LearnByActionSection extends HomeSectionBase {
  sectionId: "learn_by_action";
  nearbyExpert: string;
  recommendedSession: string;
  expectedSkillsGained: string[];
}

export interface MyTeamSection extends HomeSectionBase {
  sectionId: "my_team";
  suggestedTeam: string;
  currentCollaborations: string[];
  recommendedRole: string;
}

export interface ExpertRecommendationsSection extends HomeSectionBase {
  sectionId: "expert_recommendations";
  topMentor: string;
  topReviewer: string;
  topConsultant: string;
}

export interface KnowledgeHighlightsSection extends HomeSectionBase {
  sectionId: "knowledge_highlights";
  highlights: Array<{ title: string; category: string; summary: string }>;
}

export interface MarketplaceSnapshotSection extends HomeSectionBase {
  sectionId: "marketplace_snapshot";
  actions: Array<{
    actionCode: string;
    demand: string;
    priceTrend: string;
    competition: string;
  }>;
  region: string;
  currency: string;
}

export interface WeeklyProgressSection extends HomeSectionBase {
  sectionId: "weekly_progress";
  incomeTrend: string;
  skillsGained: number;
  actionsCompleted: number;
  readinessGrowth: number;
  liveFrameGrowth: number;
}

export type ProfessionalHomeSection =
  | GreetingSection
  | TodaysBestStepSection
  | BestOpportunitySection
  | PassportSection
  | LiveFrameSection
  | JourneySection
  | DevelopMeSection
  | LearnByActionSection
  | MyTeamSection
  | ExpertRecommendationsSection
  | KnowledgeHighlightsSection
  | MarketplaceSnapshotSection
  | WeeklyProgressSection;

function resolveConfidence(score: number): ConfidenceLevel {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

function formatCurrency(cents: number, currency: string): string {
  const amount = (cents / 100).toFixed(0);
  return `${currency} ${amount}`;
}

export function buildGreetingSection(context: ProfessionalHomeContext): GreetingSection {
  const hash = hashDayUser(context.dayKey, context.userId);
  const greeting = GREETING_VARIANTS[hash % GREETING_VARIANTS.length];
  const firstName = context.displayName.split(" ")[0] ?? context.displayName;

  return {
    sectionId: "greeting",
    title: "Greeting",
    greeting,
    subGreeting: `${firstName}, your professional home is ready for ${context.geographic.city}.`,
    headline: greeting,
    description: `Personalized for ${context.geographic.preferredWorkRegion}.`,
    explainable: true,
  };
}

export function buildTodaysBestStepSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): TodaysBestStepSection {
  const hash = hashDayUser(context.dayKey, context.userId);
  const action =
    engines.todaysBestAction?.title ??
    engines.topMissingSkill ??
    "Complete one high-impact professional action today";
  const why =
    engines.todaysBestAction?.description ??
    `Best match for your region (${context.geographic.preferredWorkRegion}) and current readiness.`;
  const minutes = 30 + (hash % 4) * 15;

  return {
    sectionId: "todays_best_step",
    title: "Today's Best Step",
    headline: action,
    description: why,
    recommendation: action,
    why,
    expectedBenefit: "Improves readiness and unlocks better opportunities this week.",
    estimatedMinutes: minutes,
    routeHint: engines.todaysBestAction?.routeHint ?? "/develop-me",
    explainable: true,
  };
}

export function buildBestOpportunitySection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): BestOpportunitySection {
  const readiness = engines.readinessScore ?? 55;
  const confidenceScore = Math.min(100, readiness + 10);
  const title = engines.bestOpportunity?.title ?? "Regional marketplace opening";
  const income = engines.bestOpportunity?.expectedIncomeCents ?? 45000 + (hashDayUser(context.dayKey, context.userId) % 20) * 1000;

  return {
    sectionId: "best_opportunity",
    title: "Best Opportunity",
    headline: title,
    description: engines.bestOpportunity?.message ?? "Highest-value match for your profile today.",
    opportunityTitle: title,
    whyItMatches: `Aligned with ${context.geographic.preferredWorkRegion} demand and your verified skills.`,
    expectedIncomeLabel: formatCurrency(income, context.geographic.currency),
    readiness,
    confidence: resolveConfidence(confidenceScore),
    confidenceScore,
    explainable: true,
  };
}

export function buildPassportSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): PassportSection {
  const hash = hashDayUser(context.dayKey, context.userId);
  const level = engines.passportLevel ?? (context.tier === "T3" ? "silver" : "bronze");
  const score = engines.trustScore ?? 45 + (hash % 15);
  const skills = [
    "project_coordination",
    "safety_compliance",
    "customer_communication",
  ].slice(0, 2 + (hash % 2));
  const actions = [
    engines.todaysBestAction?.title?.replace(/ /g, "_") ?? "general_professional_services",
    "site_inspection",
  ];

  return {
    sectionId: "professional_passport",
    title: "Professional Passport",
    headline: `Passport level: ${level}`,
    description: "Your verified professional identity on APP13.",
    currentLevel: level,
    verifiedSkills: skills,
    unlockedActions: actions,
    professionalScore: score,
    progressPercent: Math.min(100, score + 10),
    explainable: true,
  };
}

export function buildLiveFrameSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): LiveFrameSection {
  const tier = engines.liveFrameTier ?? "STANDARD";
  const label = engines.liveFrameLabel ?? "Standard";
  const trustScore = engines.trustScore ?? 50;
  const progress = Math.min(100, 20 + (trustScore % 60));

  return {
    sectionId: "live_frame",
    title: "Live Frame",
    headline: `Your frame: ${label}`,
    description: "Your trust frame updates as you complete professional actions.",
    currentTier: tier,
    tierLabel: label,
    reason: `${context.displayName}, your frame reflects verified identity, professional background, and recent activity.`,
    progressToNextLevel: progress,
    trustScore,
    explainable: true,
  };
}

export function buildJourneySection(context: ProfessionalHomeContext): JourneySection {
  const hash = hashDayUser(context.dayKey, context.userId);
  const stages = ["building_foundation", "gaining_momentum", "professional_growth", "marketplace_ready"];
  const stage = stages[hash % stages.length];

  return {
    sectionId: "professional_journey",
    title: "Professional Journey",
    headline: `Current stage: ${stage.replace(/_/g, " ")}`,
    description: "Your professional journey adapts after every action and learning achievement.",
    currentStage: stage,
    nextMilestone: "Complete this week's best step to advance",
    completedMilestones: ["Account verified", "Professional profile started", "Home activated"],
    explainable: true,
  };
}

export function buildDevelopMeSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): DevelopMeSection {
  const missing = engines.topMissingSkill ?? "advanced_diagnostics";
  const course = engines.recommendedCourse ?? `${missing.replace(/_/g, " ")} fundamentals`;
  const govProgram = context.geographic.governmentPrograms[0] ?? "regional_workforce_program";

  return {
    sectionId: "develop_me",
    title: "Develop Me",
    headline: `Close your gap: ${missing.replace(/_/g, " ")}`,
    description: "Personalized growth guidance for your region.",
    topMissingSkill: missing,
    recommendedCourse: course,
    governmentOpportunity: `${govProgram.replace(/_/g, " ")} (${context.geographic.country})`,
    expectedImprovement: "Readiness +8 to +15 points within 30 days",
    explainable: true,
  };
}

export function buildLearnByActionSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): LearnByActionSection {
  const expert = engines.nearbyExpert ?? `Expert near ${context.geographic.city}`;
  const session = engines.practicalSession ?? "Hands-on supervised session";

  return {
    sectionId: "learn_by_action",
    title: "Learn by Action",
    headline: session,
    description: "Practical learning matched to your local market.",
    nearbyExpert: expert,
    recommendedSession: session,
    expectedSkillsGained: ["applied_technique", "safety_practice", "client_communication"],
    explainable: true,
  };
}

export function buildMyTeamSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): MyTeamSection {
  return {
    sectionId: "my_team",
    title: "My Team",
    headline: engines.suggestedTeam ?? "Regional project team",
    description: "Collaboration opportunities in your work region.",
    suggestedTeam: engines.suggestedTeam ?? `${context.geographic.city} field team`,
    currentCollaborations: ["Open collaboration invite"],
    recommendedRole: "Lead coordinator",
    explainable: true,
  };
}

export function buildExpertRecommendationsSection(engines: EngineSnapshot): ExpertRecommendationsSection {
  return {
    sectionId: "expert_recommendations",
    title: "Expert Recommendations",
    headline: "Experts matched to your goals",
    description: "Mentors, reviewers, and consultants for your next step.",
    topMentor: engines.topMentor ?? "Senior field mentor",
    topReviewer: engines.topReviewer ?? "Quality assurance reviewer",
    topConsultant: engines.topConsultant ?? "Regional operations consultant",
    explainable: true,
  };
}

export function buildKnowledgeHighlightsSection(engines: EngineSnapshot): KnowledgeHighlightsSection {
  const headlines = engines.knowledgeHeadlines ?? [
    "Updated safety checklist for field work",
    "Blueprint improvement: faster site inspection flow",
    "Trending practice: collaborative milestone reviews",
  ];

  return {
    sectionId: "knowledge_highlights",
    title: "Knowledge Highlights",
    headline: "New knowledge for your profession",
    description: "Curated professional knowledge updates.",
    highlights: headlines.map((title, index) => ({
      title,
      category: index === 0 ? "professional_knowledge" : index === 1 ? "blueprint_improvement" : "trending_practice",
      summary: title,
    })),
    explainable: true,
  };
}

export function buildMarketplaceSnapshotSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): MarketplaceSnapshotSection {
  const actions = engines.marketplaceActions ?? [
    {
      actionCode: "project_supervision",
      demand: "high",
      priceTrend: "rising",
      competition: "moderate",
    },
    {
      actionCode: "safety_inspection",
      demand: "steady",
      priceTrend: "stable",
      competition: "low",
    },
  ];

  return {
    sectionId: "marketplace_snapshot",
    title: "Marketplace Snapshot",
    headline: `Market pulse in ${context.geographic.preferredWorkRegion}`,
    description: "Actions matching your profile — read only, no execution.",
    actions,
    region: context.geographic.preferredWorkRegion,
    currency: context.geographic.currency,
    explainable: true,
  };
}

export function buildWeeklyProgressSection(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): WeeklyProgressSection {
  const hash = hashDayUser(context.dayKey, context.userId);

  return {
    sectionId: "weekly_progress",
    title: "Weekly Progress",
    headline: "Your week at a glance",
    description: "Progress updates after every action, learning achievement, and opportunity.",
    incomeTrend: engines.weeklyIncomeTrend ?? (hash % 2 === 0 ? "up_6_percent" : "steady"),
    skillsGained: engines.weeklySkillsGained ?? 1 + (hash % 3),
    actionsCompleted: engines.weeklyActionsCompleted ?? hash % 5,
    readinessGrowth: engines.weeklyReadinessGrowth ?? 3 + (hash % 4),
    liveFrameGrowth: engines.weeklyLiveFrameGrowth ?? 2 + (hash % 3),
    explainable: true,
  };
}

export function buildAllHomeSections(
  context: ProfessionalHomeContext,
  engines: EngineSnapshot
): ProfessionalHomeSection[] {
  return [
    buildGreetingSection(context),
    buildTodaysBestStepSection(context, engines),
    buildBestOpportunitySection(context, engines),
    buildPassportSection(context, engines),
    buildLiveFrameSection(context, engines),
    buildJourneySection(context),
    buildDevelopMeSection(context, engines),
    buildLearnByActionSection(context, engines),
    buildMyTeamSection(context, engines),
    buildExpertRecommendationsSection(engines),
    buildKnowledgeHighlightsSection(engines),
    buildMarketplaceSnapshotSection(context, engines),
    buildWeeklyProgressSection(context, engines),
  ];
}

function sectionToView(section: ProfessionalHomeSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "greeting":
      return { ...base, greeting: section.greeting, sub_greeting: section.subGreeting };
    case "todays_best_step":
      return {
        ...base,
        recommendation: section.recommendation,
        why: section.why,
        expected_benefit: section.expectedBenefit,
        estimated_minutes: section.estimatedMinutes,
        route_hint: section.routeHint,
      };
    case "best_opportunity":
      return {
        ...base,
        opportunity_title: section.opportunityTitle,
        why_it_matches: section.whyItMatches,
        expected_income_label: section.expectedIncomeLabel,
        readiness: section.readiness,
        confidence: section.confidence,
        confidence_score: section.confidenceScore,
      };
    case "professional_passport":
      return {
        ...base,
        current_level: section.currentLevel,
        verified_skills: section.verifiedSkills,
        unlocked_actions: section.unlockedActions,
        professional_score: section.professionalScore,
        progress_percent: section.progressPercent,
      };
    case "live_frame":
      return {
        ...base,
        current_tier: section.currentTier,
        tier_label: section.tierLabel,
        reason: section.reason,
        progress_to_next_level: section.progressToNextLevel,
        trust_score: section.trustScore,
      };
    case "professional_journey":
      return {
        ...base,
        current_stage: section.currentStage,
        next_milestone: section.nextMilestone,
        completed_milestones: section.completedMilestones,
      };
    case "develop_me":
      return {
        ...base,
        top_missing_skill: section.topMissingSkill,
        recommended_course: section.recommendedCourse,
        government_opportunity: section.governmentOpportunity,
        expected_improvement: section.expectedImprovement,
      };
    case "learn_by_action":
      return {
        ...base,
        nearby_expert: section.nearbyExpert,
        recommended_session: section.recommendedSession,
        expected_skills_gained: section.expectedSkillsGained,
      };
    case "my_team":
      return {
        ...base,
        suggested_team: section.suggestedTeam,
        current_collaborations: section.currentCollaborations,
        recommended_role: section.recommendedRole,
      };
    case "expert_recommendations":
      return {
        ...base,
        top_mentor: section.topMentor,
        top_reviewer: section.topReviewer,
        top_consultant: section.topConsultant,
      };
    case "knowledge_highlights":
      return {
        ...base,
        highlights: section.highlights.map((h) => ({
          title: h.title,
          category: h.category,
          summary: h.summary,
        })),
      };
    case "marketplace_snapshot":
      return {
        ...base,
        actions: section.actions,
        region: section.region,
        currency: section.currency,
      };
    case "weekly_progress":
      return {
        ...base,
        income_trend: section.incomeTrend,
        skills_gained: section.skillsGained,
        actions_completed: section.actionsCompleted,
        readiness_growth: section.readinessGrowth,
        live_frame_growth: section.liveFrameGrowth,
      };
    default:
      return base;
  }
}

export function toHomeSectionView(section: ProfessionalHomeSection) {
  return sectionToView(section);
}

export function toHomeSectionsView(sections: ProfessionalHomeSection[]) {
  return sections.map(toHomeSectionView);
}
