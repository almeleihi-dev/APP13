import type { PartnershipRecommendationType } from "./journey-schema.js";
import type { LivingJourneyContext } from "./journey-context.js";
import {
  hashJourneySeed,
  resolveCurrentLevel,
  resolveJourneyName,
  resolveJourneyStage,
  resolveLiveFrameLabel,
  resolvePassportStatus,
  resolveReadiness,
  resolveYearsActive,
  stageIndex,
} from "./journey-context.js";

export interface JourneyEngineSnapshot {
  readinessScore?: number;
  growthPath?: string[];
  alternativePaths?: string[];
  todaysBestAction?: { title: string; description: string; routeHint: string };
  goals?: Array<{ goalId: string; title: string; completed: boolean; priority: number }>;
  timelineEvents?: Array<{ date: string; title: string; category: string }>;
  achievements?: string[];
  challenges?: string[];
}

export interface JourneySectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface JourneyOverviewSection extends JourneySectionBase {
  sectionId: "journey_overview";
  journeyName: string;
  currentStage: string;
  professionalSummary: string;
  yearsActive: number;
}

export interface CurrentPositionSection extends JourneySectionBase {
  sectionId: "current_position";
  currentProfessionalLevel: string;
  currentLiveFrame: string;
  currentPassportStatus: string;
  currentReadiness: number;
}

export interface PastMilestonesSection extends JourneySectionBase {
  sectionId: "past_milestones";
  milestones: Array<{ milestoneId: string; title: string; category: string; achievedAt: string }>;
}

export interface TodaysPositionSection extends JourneySectionBase {
  sectionId: "todays_position";
  currentStrengths: string[];
  currentOpportunities: string[];
  currentChallenges: string[];
  professionalStatus: string;
}

export interface FutureMilestonesSection extends JourneySectionBase {
  sectionId: "future_milestones";
  milestones: Array<{ milestoneId: string; title: string; category: string; estimatedAt: string }>;
}

export interface ProfessionalTimelineSection extends JourneySectionBase {
  sectionId: "professional_timeline";
  events: Array<{ date: string; title: string; category: string; summary: string }>;
}

export interface JourneyProgressSection extends JourneySectionBase {
  sectionId: "journey_progress";
  overallCompletion: number;
  professionalMaturity: string;
  growthPercent: number;
  expectedTimeline: string;
}

export interface ProfessionalGoalsSection extends JourneySectionBase {
  sectionId: "professional_goals";
  currentGoals: Array<{ goalId: string; title: string; priority: number }>;
  completedGoals: string[];
  suggestedGoals: string[];
}

export interface CareerRoadmapSection extends JourneySectionBase {
  sectionId: "career_roadmap";
  recommendedPath: string[];
  alternativePaths: string[];
  highDemandPath: string[];
  leadershipPath: string[];
  expertPath: string[];
}

export interface AchievementsSection extends JourneySectionBase {
  sectionId: "achievements";
  professional: string[];
  learning: string[];
  community: string[];
  knowledge: string[];
}

export interface ChallengesSection extends JourneySectionBase {
  sectionId: "challenges";
  obstacles: string[];
  missingSkills: string[];
  requiredLicenses: string[];
  riskFactors: string[];
  guidance: string[];
}

export interface RecommendedNextStepSection extends JourneySectionBase {
  sectionId: "recommended_next_step";
  recommendation: string;
  why: string;
  expectedBenefit: string;
  estimatedMinutes: number;
  routeHint: string;
}

export interface FutureProjectionSection extends JourneySectionBase {
  sectionId: "future_projection";
  projections: Array<{ horizon: string; headline: string; summary: string; assumptions: string[] }>;
}

export type LivingJourneySection =
  | JourneyOverviewSection
  | CurrentPositionSection
  | PastMilestonesSection
  | TodaysPositionSection
  | FutureMilestonesSection
  | ProfessionalTimelineSection
  | JourneyProgressSection
  | ProfessionalGoalsSection
  | CareerRoadmapSection
  | AchievementsSection
  | ChallengesSection
  | RecommendedNextStepSection
  | FutureProjectionSection;

export interface PartnershipRecommendation {
  type: PartnershipRecommendationType;
  title: string;
  description: string;
  region: string;
}

export function buildJourneyOverviewSection(context: LivingJourneyContext): JourneyOverviewSection {
  const stage = resolveJourneyStage(context);
  return {
    sectionId: "journey_overview",
    title: "Journey Overview",
    headline: resolveJourneyName(context),
    description: "Your living career map on APP13.",
    journeyName: resolveJourneyName(context),
    currentStage: stage.replace(/_/g, " "),
    professionalSummary:
      context.onboarding.professionalStory?.proudestAchievement ??
      `${context.displayName} is building a verified professional journey in ${context.geographic.city}.`,
    yearsActive: resolveYearsActive(context),
    explainable: true,
  };
}

export function buildCurrentPositionSection(context: LivingJourneyContext, engines: JourneyEngineSnapshot): CurrentPositionSection {
  return {
    sectionId: "current_position",
    title: "Current Position",
    headline: `You are at: ${resolveCurrentLevel(context)}`,
    description: "Where you stand today on your professional journey.",
    currentProfessionalLevel: resolveCurrentLevel(context),
    currentLiveFrame: resolveLiveFrameLabel(context),
    currentPassportStatus: resolvePassportStatus(context),
    currentReadiness: engines.readinessScore ?? resolveReadiness(context),
    explainable: true,
  };
}

export function buildPastMilestonesSection(context: LivingJourneyContext): PastMilestonesSection {
  const milestones: PastMilestonesSection["milestones"] = [
    {
      milestoneId: "ms://journey_started",
      title: "Professional journey started on APP13",
      category: "journey",
      achievedAt: context.generatedAt,
    },
  ];

  if (context.onboarding.ironVerification?.identityConfirmed) {
    milestones.push({
      milestoneId: "ms://identity",
      title: "Identity verified",
      category: "trust",
      achievedAt: context.generatedAt,
    });
  }

  if ((context.onboarding.professionalBackground?.certificates.length ?? 0) > 0) {
    milestones.push({
      milestoneId: "ms://first_certificate",
      title: `First certificate: ${context.onboarding.professionalBackground!.certificates[0]}`,
      category: "credential",
      achievedAt: context.generatedAt,
    });
  }

  if (context.onboarding.professionalCalibration) {
    milestones.push({
      milestoneId: "ms://calibration",
      title: "Professional calibration completed",
      category: "achievement",
      achievedAt: context.generatedAt,
    });
  }

  milestones.push({
    milestoneId: "ms://first_action",
    title: "First verified professional action pathway unlocked",
    category: "action",
    achievedAt: context.generatedAt,
  });

  return {
    sectionId: "past_milestones",
    title: "Past Milestones",
    headline: `${milestones.length} milestones on your journey`,
    description: "Every verified step becomes part of your career story.",
    milestones,
    explainable: true,
  };
}

export function buildTodaysPositionSection(context: LivingJourneyContext, engines: JourneyEngineSnapshot): TodaysPositionSection {
  const bg = context.onboarding.professionalBackground;
  const sq = context.onboarding.smartQuestions;

  return {
    sectionId: "todays_position",
    title: "Today's Position",
    headline: "Where you are right now",
    description: "Strengths, opportunities, and challenges for today.",
    currentStrengths: bg?.skills ?? ["building professional foundation"],
    currentOpportunities: [
      `Regional demand in ${context.geographic.preferredWorkRegion}`,
      sq?.masterAction ? `Grow toward ${sq.masterAction.replace(/_/g, " ")}` : "Expand verified skills",
    ],
    currentChallenges: engines.challenges ?? [
      (bg?.licenses.length ?? 0) === 0 ? "Obtain regional license" : "Maintain active professional momentum",
    ],
    professionalStatus: resolveJourneyStage(context).replace(/_/g, " "),
    explainable: true,
  };
}

export function buildFutureMilestonesSection(context: LivingJourneyContext): FutureMilestonesSection {
  const sq = context.onboarding.smartQuestions;
  const milestones: FutureMilestonesSection["milestones"] = [
    {
      milestoneId: "fm://next_certification",
      title: sq?.masterAction ? `Master ${sq.masterAction.replace(/_/g, " ")}` : "Complete next certification",
      category: "certification",
      estimatedAt: "3 months",
    },
    {
      milestoneId: "fm://next_frame",
      title: "Upgrade Live Frame tier",
      category: "live_frame",
      estimatedAt: "6 weeks",
    },
    {
      milestoneId: "fm://next_role",
      title: sq?.enjoysLeading ? "Team leadership role" : "Expanded professional role",
      category: "role",
      estimatedAt: "4 months",
    },
    {
      milestoneId: "fm://income",
      title: "Income growth milestone",
      category: "income",
      estimatedAt: "6 months",
    },
    {
      milestoneId: "fm://knowledge",
      title: "Knowledge contribution milestone",
      category: "knowledge",
      estimatedAt: "2 months",
    },
  ];

  return {
    sectionId: "future_milestones",
    title: "Future Milestones",
    headline: `${milestones.length} milestones ahead`,
    description: "Where your journey is heading next.",
    milestones,
    explainable: true,
  };
}

export function buildProfessionalTimelineSection(
  context: LivingJourneyContext,
  engines: JourneyEngineSnapshot
): ProfessionalTimelineSection {
  const events: ProfessionalTimelineSection["events"] = [
    {
      date: context.generatedAt.slice(0, 10),
      title: "Journey synchronized",
      category: "journey",
      summary: "Professional journey map updated",
    },
  ];

  if (context.onboarding.professionalStory?.careerChangingProject) {
    events.push({
      date: context.generatedAt.slice(0, 10),
      title: "Career-defining project recorded",
      category: "project",
      summary: context.onboarding.professionalStory.careerChangingProject,
    });
  }

  for (const evt of engines.timelineEvents ?? []) {
    events.push({ ...evt, summary: evt.title });
  }

  if (context.onboarding.professionalCalibration) {
    events.push({
      date: context.generatedAt.slice(0, 10),
      title: "Professional calibration",
      category: "learning",
      summary: "Calibration missions completed",
    });
  }

  return {
    sectionId: "professional_timeline",
    title: "Professional Timeline",
    headline: `${events.length} career events`,
    description: "Chronological history of your professional evolution.",
    events,
    explainable: true,
  };
}

export function buildJourneyProgressSection(context: LivingJourneyContext): JourneyProgressSection {
  const stage = resolveJourneyStage(context);
  const idx = stageIndex(stage);
  const overall = Math.min(100, Math.round(((idx + 1) / 7) * 100));
  const hash = hashJourneySeed(context.dayKey, context.userId);

  return {
    sectionId: "journey_progress",
    title: "Journey Progress",
    headline: `${overall}% journey completion`,
    description: "Your professional maturity and growth trajectory.",
    overallCompletion: overall,
    professionalMaturity: stage.replace(/_/g, " "),
    growthPercent: 5 + (hash % 20),
    expectedTimeline: "Steady growth over the next 12 months with consistent activity",
    explainable: true,
  };
}

export function buildProfessionalGoalsSection(context: LivingJourneyContext, engines: JourneyEngineSnapshot): ProfessionalGoalsSection {
  const sq = context.onboarding.smartQuestions;
  const suggested = [
    sq?.masterAction ? `Master ${sq.masterAction.replace(/_/g, " ")}` : "Expand professional skills",
    "Upgrade Live Frame tier",
    "Complete verified project milestone",
  ];

  const currentGoals =
    engines.goals ??
    suggested.map((title, i) => ({
      goalId: `goal://${i}`,
      title,
      completed: false,
      priority: i + 1,
    }));

  return {
    sectionId: "professional_goals",
    title: "Professional Goals",
    headline: `${currentGoals.filter((g) => !g.completed).length} active goals`,
    description: "Goals that guide your professional journey.",
    currentGoals: currentGoals.filter((g) => !g.completed).map((g) => ({
      goalId: g.goalId,
      title: g.title,
      priority: g.priority,
    })),
    completedGoals: currentGoals.filter((g) => g.completed).map((g) => g.title),
    suggestedGoals: suggested,
    explainable: true,
  };
}

export function buildCareerRoadmapSection(context: LivingJourneyContext, engines: JourneyEngineSnapshot): CareerRoadmapSection {
  const sq = context.onboarding.smartQuestions;
  const recommended = engines.growthPath ?? [
    "Build verified track record",
    sq?.masterAction ? `Master ${sq.masterAction.replace(/_/g, " ")}` : "Expand core skills",
    "Grow regional reputation",
  ];

  return {
    sectionId: "career_roadmap",
    title: "Career Roadmap",
    headline: "Your recommended professional path",
    description: "Paths tailored to your profile and regional demand.",
    recommendedPath: recommended,
    alternativePaths: engines.alternativePaths ?? [
      "Consulting-focused path",
      "Teaching and mentorship path",
    ],
    highDemandPath: [
      `High-demand skills in ${context.geographic.preferredWorkRegion}`,
      "Regional marketplace growth areas",
    ],
    leadershipPath: sq?.enjoysLeading
      ? ["Team coordination", "Project supervision", "Regional team lead"]
      : ["Collaborative project roles", "Senior professional contributor"],
    expertPath: sq?.enjoysConsulting
      ? ["Expert consultant", "Quality reviewer", "Knowledge contributor"]
      : ["Deep skill specialization", "Verified expert status"],
    explainable: true,
  };
}

export function buildAchievementsSection(context: LivingJourneyContext, engines: JourneyEngineSnapshot): AchievementsSection {
  const bg = context.onboarding.professionalBackground;
  return {
    sectionId: "achievements",
    title: "Achievements",
    headline: "Your professional achievements",
    description: "Achievements across every dimension of your journey.",
    professional: engines.achievements ?? [
      context.onboarding.professionalStory?.proudestAchievement ?? "Building professional foundation",
    ],
    learning: context.onboarding.professionalCalibration ? ["Calibration missions completed"] : ["Learning path started"],
    community: ["APP13 professional community member"],
    knowledge: bg?.certificates.length ? [`${bg.certificates[0]} certified`] : ["Knowledge contributions beginning"],
    explainable: true,
  };
}

export function buildChallengesSection(context: LivingJourneyContext, engines: JourneyEngineSnapshot): ChallengesSection {
  const bg = context.onboarding.professionalBackground;
  const missingSkills = engines.challenges ?? ["advanced_diagnostics"];
  const licenses = (bg?.licenses.length ?? 0) === 0 ? [`License for ${context.geographic.country}`] : [];

  return {
    sectionId: "challenges",
    title: "Challenges",
    headline: "Obstacles and how to overcome them",
    description: "Explainable guidance for every challenge on your journey.",
    obstacles: engines.challenges ?? ["Complete regional licensing requirements"],
    missingSkills,
    requiredLicenses: licenses,
    riskFactors: licenses.length > 0 ? ["Maintain license renewal schedule"] : ["Unverified credentials limit opportunities"],
    guidance: [
      "Focus on one high-impact goal at a time",
      `Explore ${context.geographic.governmentPrograms[0]?.replace(/_/g, " ") ?? "regional workforce programs"}`,
      "Complete recommended next step this week",
    ],
    explainable: true,
  };
}

export function buildRecommendedNextStepSection(
  context: LivingJourneyContext,
  engines: JourneyEngineSnapshot
): RecommendedNextStepSection {
  const hash = hashJourneySeed(context.dayKey, context.userId);
  const action = engines.todaysBestAction?.title ?? "Complete your highest-impact professional step this week";
  const why =
    engines.todaysBestAction?.description ??
    `Best match for your stage (${resolveJourneyStage(context).replace(/_/g, " ")}) and ${context.geographic.preferredWorkRegion} demand.`;

  return {
    sectionId: "recommended_next_step",
    title: "Recommended Next Step",
    headline: action,
    description: "Exactly one recommendation — highest impact for your journey.",
    recommendation: action,
    why,
    expectedBenefit: "Advances your journey toward the next milestone and improves readiness.",
    estimatedMinutes: 30 + (hash % 4) * 15,
    routeHint: engines.todaysBestAction?.routeHint ?? "/develop-me",
    explainable: true,
  };
}

export function buildFutureProjectionSection(context: LivingJourneyContext): FutureProjectionSection {
  const stage = resolveJourneyStage(context);
  return {
    sectionId: "future_projection",
    title: "Future Projection",
    headline: "Your journey ahead",
    description: "Expected journey based on current behavior — assumptions always explained.",
    projections: [
      {
        horizon: "30_days",
        headline: "Stronger foundation",
        summary: `Progress from ${stage.replace(/_/g, " ")} toward next milestone`,
        assumptions: ["Complete recommended next step", "Maintain weekly professional activity"],
      },
      {
        horizon: "90_days",
        headline: "Visible career momentum",
        summary: "Next certification or frame upgrade within reach",
        assumptions: ["Follow career roadmap", "Complete 2–3 verified actions"],
      },
      {
        horizon: "1_year",
        headline: "Established professional standing",
        summary: "Regional reputation and expanded role opportunities",
        assumptions: ["Consistent growth", "Meet licensing requirements for your region"],
      },
      {
        horizon: "3_years",
        headline: "Long-term professional leadership",
        summary: "Industry recognition and mentorship opportunities",
        assumptions: ["Sustained excellence", "Knowledge contributions", "Leadership development"],
      },
    ],
    explainable: true,
  };
}

export function buildPartnershipRecommendations(context: LivingJourneyContext): PartnershipRecommendation[] {
  const programs = context.geographic.governmentPrograms;
  return [
    {
      type: "training_partner",
      title: "Regional skills training partner",
      description: "Accelerate certification and skill development.",
      region: context.geographic.preferredWorkRegion,
    },
    {
      type: "government_program",
      title: programs[0]?.replace(/_/g, " ") ?? "Regional workforce program",
      description: `Government-supported opportunity in ${context.geographic.country}.`,
      region: context.geographic.country,
    },
    {
      type: "financial_opportunity",
      title: "Professional growth financing",
      description: "Explore financing for certifications and equipment.",
      region: context.geographic.country,
    },
    {
      type: "professional_organization",
      title: `${context.onboarding.professionalBackground?.industries[0]?.replace(/_/g, " ") ?? "Professional"} association`,
      description: "Connect with peers in your industry.",
      region: context.geographic.city,
    },
    {
      type: "mentorship_opportunity",
      title: "Regional mentor match",
      description: context.onboarding.smartQuestions?.enjoysTeaching
        ? "Share expertise while growing as a mentor"
        : "Learn from experienced professionals in your region",
      region: context.geographic.preferredWorkRegion,
    },
  ];
}

export function buildAllJourneySections(
  context: LivingJourneyContext,
  engines: JourneyEngineSnapshot
): LivingJourneySection[] {
  return [
    buildJourneyOverviewSection(context),
    buildCurrentPositionSection(context, engines),
    buildPastMilestonesSection(context),
    buildTodaysPositionSection(context, engines),
    buildFutureMilestonesSection(context),
    buildProfessionalTimelineSection(context, engines),
    buildJourneyProgressSection(context),
    buildProfessionalGoalsSection(context, engines),
    buildCareerRoadmapSection(context, engines),
    buildAchievementsSection(context, engines),
    buildChallengesSection(context, engines),
    buildRecommendedNextStepSection(context, engines),
    buildFutureProjectionSection(context),
  ];
}

function sectionToView(section: LivingJourneySection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "journey_overview":
      return {
        ...base,
        journey_name: section.journeyName,
        current_stage: section.currentStage,
        professional_summary: section.professionalSummary,
        years_active: section.yearsActive,
      };
    case "current_position":
      return {
        ...base,
        current_professional_level: section.currentProfessionalLevel,
        current_live_frame: section.currentLiveFrame,
        current_passport_status: section.currentPassportStatus,
        current_readiness: section.currentReadiness,
      };
    case "past_milestones":
      return { ...base, milestones: section.milestones };
    case "todays_position":
      return {
        ...base,
        current_strengths: section.currentStrengths,
        current_opportunities: section.currentOpportunities,
        current_challenges: section.currentChallenges,
        professional_status: section.professionalStatus,
      };
    case "future_milestones":
      return { ...base, milestones: section.milestones };
    case "professional_timeline":
      return { ...base, events: section.events };
    case "journey_progress":
      return {
        ...base,
        overall_completion: section.overallCompletion,
        professional_maturity: section.professionalMaturity,
        growth_percent: section.growthPercent,
        expected_timeline: section.expectedTimeline,
      };
    case "professional_goals":
      return {
        ...base,
        current_goals: section.currentGoals,
        completed_goals: section.completedGoals,
        suggested_goals: section.suggestedGoals,
      };
    case "career_roadmap":
      return {
        ...base,
        recommended_path: section.recommendedPath,
        alternative_paths: section.alternativePaths,
        high_demand_path: section.highDemandPath,
        leadership_path: section.leadershipPath,
        expert_path: section.expertPath,
      };
    case "achievements":
      return {
        ...base,
        professional: section.professional,
        learning: section.learning,
        community: section.community,
        knowledge: section.knowledge,
      };
    case "challenges":
      return {
        ...base,
        obstacles: section.obstacles,
        missing_skills: section.missingSkills,
        required_licenses: section.requiredLicenses,
        risk_factors: section.riskFactors,
        guidance: section.guidance,
      };
    case "recommended_next_step":
      return {
        ...base,
        recommendation: section.recommendation,
        why: section.why,
        expected_benefit: section.expectedBenefit,
        estimated_minutes: section.estimatedMinutes,
        route_hint: section.routeHint,
      };
    case "future_projection":
      return { ...base, projections: section.projections };
    default:
      return base;
  }
}

export function toJourneySectionView(section: LivingJourneySection) {
  return sectionToView(section);
}

export function toJourneySectionsView(sections: LivingJourneySection[]) {
  return sections.map(toJourneySectionView);
}
