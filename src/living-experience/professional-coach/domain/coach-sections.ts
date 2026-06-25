import type { LivingProfessionalCoachContext } from "./coach-context.js";
import {
  hashCoachSeed,
  resolveFrameStatus,
  resolveJourneyStatus,
  resolveMomentum,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolveWorkingWeek,
} from "./coach-context.js";

export interface CoachEngineSnapshot {
  readinessScore?: number;
  todaysBestAction?: { title: string; description: string; routeHint?: string };
  tomorrowsPrep?: { title: string; description: string };
  growthPath?: string[];
  challenges?: string[];
  goals?: Array<{ title: string; priority: number }>;
  expertRecommendations?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
}

export interface CoachMemoryProfile {
  professionalPreferences: string[];
  workingStyle: string;
  favoriteLearningMethod: string;
  preferredSchedule: string;
  successfulRecommendations: Array<{ recommendation: string; acceptedAt: string; outcome: string }>;
  updatedAt: string;
}

export interface CoachSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface MorningBriefingSection extends CoachSectionBase {
  sectionId: "morning_briefing";
  greeting: string;
  professionalSummary: string;
  currentMomentum: string;
  frameStatus: string;
  journeyStatus: string;
}

export interface TodaysOneBestActionSection extends CoachSectionBase {
  sectionId: "todays_one_best_action";
  action: string;
  why: string;
  expectedOutcome: string;
  estimatedEffortMinutes: number;
}

export interface PriorityPlannerSection extends CoachSectionBase {
  sectionId: "priority_planner";
  priorities: Array<{ priority: number; title: string; estimatedMinutes: number; why: string }>;
  orderExplanation: string;
}

export interface OpportunityAdvisorSection extends CoachSectionBase {
  sectionId: "opportunity_advisor";
  bestOpportunity: string;
  whyNow: string;
  riskIfIgnored: string;
  expectedBenefit: string;
}

export interface ProfessionalRiskAlertsSection extends CoachSectionBase {
  sectionId: "professional_risk_alerts";
  alerts: Array<{ alertId: string; category: string; message: string; explanation: string; severity: string }>;
}

export interface LearningCoachSection extends CoachSectionBase {
  sectionId: "learning_coach";
  recommendedLearning: string;
  skillGap: string;
  bestExpert: string;
  trainingPath: string;
  expectedImprovement: string;
}

export interface CareerCoachSection extends CoachSectionBase {
  sectionId: "career_coach";
  careerAdvice: string;
  promotionPath: string[];
  leadershipPath: string[];
  incomeImprovement: string;
  professionalPositioning: string;
}

export interface CommunityCoachSection extends CoachSectionBase {
  sectionId: "community_coach";
  suggestedDiscussion: string;
  questionToAnswer: string;
  knowledgeToPublish: string;
  professionalGroup: string;
  communityChallenge: string;
}

export interface PartnerCoachSection extends CoachSectionBase {
  sectionId: "partner_coach";
  bestPartnerToday: string;
  governmentProgram: string;
  trainingPartner: string;
  financialPartner: string;
  insuranceRecommendation: string;
  certificationRecommendation: string;
  recommendationOnly: true;
}

export interface ProductivityReflectionSection extends CoachSectionBase {
  sectionId: "productivity_reflection";
  yesterdayReview: string;
  completed: string[];
  delayed: string[];
  missed: string[];
  professionalHabits: string[];
  suggestions: string[];
}

export interface TodaysAchievementForecastSection extends CoachSectionBase {
  sectionId: "todays_achievement_forecast";
  expectedAchievements: string[];
  frameImprovement: string;
  journeyProgress: string;
  knowledgeGrowth: string;
  communityContribution: string;
  confidencePercent: number;
}

export interface TomorrowPreparationSection extends CoachSectionBase {
  sectionId: "tomorrow_preparation";
  prepareDocuments: string[];
  prepareLearning: string[];
  prepareMeetings: string[];
  prepareOpportunities: string[];
  oneRecommendation: string;
}

export interface CoachMemorySection extends CoachSectionBase {
  sectionId: "coach_memory";
  memory: CoachMemoryProfile;
  adaptsOverTime: true;
}

export type LivingProfessionalCoachSection =
  | MorningBriefingSection
  | TodaysOneBestActionSection
  | PriorityPlannerSection
  | OpportunityAdvisorSection
  | ProfessionalRiskAlertsSection
  | LearningCoachSection
  | CareerCoachSection
  | CommunityCoachSection
  | PartnerCoachSection
  | ProductivityReflectionSection
  | TodaysAchievementForecastSection
  | TomorrowPreparationSection
  | CoachMemorySection;

export function buildDefaultCoachMemory(context: LivingProfessionalCoachContext): CoachMemoryProfile {
  const sq = context.onboarding.smartQuestions;
  return {
    professionalPreferences: [
      sq?.enjoysBuilding ? "Hands-on project work" : "Collaborative professional work",
      sq?.enjoysTeaching ? "Teaching and mentoring" : "Focused individual contribution",
    ],
    workingStyle: sq?.prefersAlone ? "Independent focus" : sq?.enjoysLeading ? "Team leadership" : "Collaborative",
    favoriteLearningMethod: sq?.enjoysReviewing ? "Review and apply" : "Learn by doing",
    preferredSchedule: resolveWorkingWeek(context),
    successfulRecommendations: [],
    updatedAt: context.generatedAt,
  };
}

export function buildMorningBriefingSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): MorningBriefingSection {
  const momentum = resolveMomentum(context, engines.readinessScore);
  const industry = resolvePrimaryIndustry(context);

  return {
    sectionId: "morning_briefing",
    title: "Morning Briefing",
    headline: `Good morning, ${context.displayName}`,
    description: "Your daily professional guide — explainable, encouraging, never deciding for you.",
    greeting: `Good morning, ${context.displayName}. Here is your professional briefing for ${context.dayKey}.`,
    professionalSummary: `You are an active ${industry} professional in ${context.geographic.city}, ${context.geographic.country}.`,
    currentMomentum: momentum,
    frameStatus: resolveFrameStatus(context),
    journeyStatus: resolveJourneyStatus(context),
    explainable: true,
  };
}

export function buildTodaysOneBestActionSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): TodaysOneBestActionSection {
  const hash = hashCoachSeed(context.dayKey, context.userId);
  const action = engines.todaysBestAction?.title ?? `Complete your highest-impact ${resolvePrimarySkill(context)} step today`;
  const why =
    engines.todaysBestAction?.description ??
    `Best action for your journey momentum and ${context.geographic.preferredWorkRegion} market demand.`;

  return {
    sectionId: "todays_one_best_action",
    title: "Today's One Best Action",
    headline: action,
    description: "Exactly one highest-impact action — the Coach recommends, you decide.",
    action,
    why,
    expectedOutcome: "Advances your professional journey and strengthens your verified standing.",
    estimatedEffortMinutes: 30 + (hash % 4) * 15,
    explainable: true,
  };
}

export function buildPriorityPlannerSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): PriorityPlannerSection {
  const skill = resolvePrimarySkill(context);
  const goals = engines.goals ?? [];
  const hash = hashCoachSeed(context.dayKey, context.userId);

  const priorities = [
    {
      priority: 1,
      title: engines.todaysBestAction?.title ?? `Complete top ${skill} priority`,
      estimatedMinutes: 45 + (hash % 15),
      why: "Highest impact on journey and frame today.",
    },
    {
      priority: 2,
      title: goals[0]?.title ?? "Review professional passport updates",
      estimatedMinutes: 25,
      why: "Maintains verified professional identity.",
    },
    {
      priority: 3,
      title: engines.challenges?.[0] ? `Address: ${engines.challenges[0]}` : "Check regional opportunities",
      estimatedMinutes: 20,
      why: "Removes growth blockers identified by your profile.",
    },
  ];

  return {
    sectionId: "priority_planner",
    title: "Priority Planner",
    headline: "Your top three priorities today",
    description: "Recommended order with explainable reasoning.",
    priorities,
    orderExplanation: "Ordered by professional impact, verification value, and growth blockers.",
    explainable: true,
  };
}

export function buildOpportunityAdvisorSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): OpportunityAdvisorSection {
  const opp = engines.opportunities?.[0];
  const skill = resolvePrimarySkill(context);
  const best = opp?.title ?? `Regional ${skill} opportunity in ${context.geographic.city}`;

  return {
    sectionId: "opportunity_advisor",
    title: "Opportunity Advisor",
    headline: best,
    description: "Today's best opportunity — why now, and what you gain.",
    bestOpportunity: best,
    whyNow: `Strong match (${opp?.matchScore ?? 85}%) for your profile and ${context.geographic.preferredWorkRegion} demand today.`,
    riskIfIgnored: "May miss a high-value professional window in your region.",
    expectedBenefit: "Income growth, verified experience, and journey momentum.",
    explainable: true,
  };
}

export function buildProfessionalRiskAlertsSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): ProfessionalRiskAlertsSection {
  const alerts: ProfessionalRiskAlertsSection["alerts"] = [];
  const iron = context.onboarding.ironVerification;
  const bg = context.onboarding.professionalBackground;

  if (!iron?.identityConfirmed) {
    alerts.push({
      alertId: "risk://identity",
      category: "weak_trust",
      message: "Identity verification incomplete",
      explanation: "Complete verification to unlock full professional trust.",
      severity: "high",
    });
  }
  if (iron?.governmentVerificationStatus === "not_started") {
    alerts.push({
      alertId: "risk://gov",
      category: "missing_license",
      message: "Government verification not started",
      explanation: `Required for full compliance in ${context.geographic.country}.`,
      severity: "medium",
    });
  }
  if ((bg?.licenses.length ?? 0) === 0) {
    alerts.push({
      alertId: "risk://license",
      category: "missing_license",
      message: `Professional license for ${context.geographic.country}`,
      explanation: "Regional licensing may limit opportunity access.",
      severity: "medium",
    });
  }
  if ((engines.readinessScore ?? 50) < 45) {
    alerts.push({
      alertId: "risk://activity",
      category: "low_activity",
      message: "Low recent professional activity",
      explanation: "Increase verified actions to maintain momentum.",
      severity: "medium",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      alertId: "risk://clear",
      category: "clear",
      message: "No critical risks today",
      explanation: "Your professional standing is in good shape. Stay consistent.",
      severity: "low",
    });
  }

  return {
    sectionId: "professional_risk_alerts",
    title: "Professional Risk Alerts",
    headline: alerts.length === 1 && alerts[0]?.severity === "low" ? "All clear today" : `${alerts.length} alert(s) to review`,
    description: "Every alert is explainable — the Coach warns, you decide.",
    alerts,
    explainable: true,
  };
}

export function buildLearningCoachSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): LearningCoachSection {
  const skill = resolvePrimarySkill(context);
  const gap = engines.challenges?.[0]?.replace(/_/g, " ") ?? `advanced ${skill}`;

  return {
    sectionId: "learning_coach",
    title: "Learning Coach",
    headline: `Grow your ${skill} skills`,
    description: "Personalized learning guidance with expected improvement.",
    recommendedLearning: engines.growthPath?.[0] ?? `${skill} certification pathway`,
    skillGap: gap,
    bestExpert: engines.expertRecommendations?.[0] ?? "Regional expert mentor",
    trainingPath: `${context.geographic.governmentPrograms[0]?.replace(/_/g, " ") ?? "Regional training"} → certification → verified action`,
    expectedImprovement: "Readiness score increase and new verified capabilities.",
    explainable: true,
  };
}

export function buildCareerCoachSection(context: LivingProfessionalCoachContext): CareerCoachSection {
  const sq = context.onboarding.smartQuestions;
  const industry = resolvePrimaryIndustry(context);

  return {
    sectionId: "career_coach",
    title: "Career Coach",
    headline: "Your career guidance for today",
    description: "Promotion, leadership, income, and positioning advice.",
    careerAdvice: `Focus on verified ${resolvePrimarySkill(context)} excellence in ${context.geographic.preferredWorkRegion}.`,
    promotionPath: ["Complete certification", "Lead verified project", "Build regional reputation"],
    leadershipPath: sq?.enjoysLeading
      ? ["Team coordination role", "Project supervision", "Regional team lead"]
      : ["Senior contributor path", "Expert specialization"],
    incomeImprovement: `Premium ${industry} opportunities in ${context.geographic.city}`,
    professionalPositioning: `Trusted ${industry} professional with verified identity`,
    explainable: true,
  };
}

export function buildCommunityCoachSection(context: LivingProfessionalCoachContext): CommunityCoachSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "community_coach",
    title: "Community Coach",
    headline: "Your community contribution today",
    description: "Learn, teach, and collaborate — value over popularity.",
    suggestedDiscussion: `Best practices for ${skill} in ${context.geographic.city}`,
    questionToAnswer: `What regulatory requirements apply to ${skill} in ${context.geographic.country}?`,
    knowledgeToPublish: `${skill} workflow blueprint from your experience`,
    professionalGroup: `${context.geographic.city} ${resolvePrimaryIndustry(context)} professionals`,
    communityChallenge: "Complete one verified community contribution today",
    explainable: true,
  };
}

export function buildPartnerCoachSection(context: LivingProfessionalCoachContext): PartnerCoachSection {
  const programs = context.geographic.governmentPrograms;
  const cert = context.onboarding.professionalBackground?.certificates[0]?.replace(/_/g, " ") ?? resolvePrimarySkill(context);

  return {
    sectionId: "partner_coach",
    title: "Partner Coach",
    headline: "Partner recommendations for today",
    description: "Recommendation only — partners execute, you decide.",
    bestPartnerToday: `Regional ${resolvePrimarySkill(context)} training partner`,
    governmentProgram: programs[0]?.replace(/_/g, " ") ?? "Regional workforce program",
    trainingPartner: `${context.geographic.city} Professional Academy`,
    financialPartner: "Professional growth financing partner",
    insuranceRecommendation: `${resolvePrimaryIndustry(context)} liability coverage`,
    certificationRecommendation: `${cert} certification body`,
    recommendationOnly: true,
    explainable: true,
  };
}

export function buildProductivityReflectionSection(_context: LivingProfessionalCoachContext): ProductivityReflectionSection {
  return {
    sectionId: "productivity_reflection",
    title: "Productivity Reflection",
    headline: "Yesterday's professional review",
    description: "Celebrate progress, learn from delays, build better habits.",
    yesterdayReview: "A steady day of professional progress — keep the momentum going.",
    completed: ["Daily professional check-in", "Profile review"],
    delayed: ["Optional certification study"],
    missed: [],
    professionalHabits: ["Morning briefing review", "One verified action per day"],
    suggestions: ["Block 30 minutes for today's best action first", "Review risk alerts before noon"],
    explainable: true,
  };
}

export function buildTodaysAchievementForecastSection(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): TodaysAchievementForecastSection {
  const hash = hashCoachSeed(context.dayKey, context.userId);
  const confidence = Math.min(95, (engines.readinessScore ?? 55) + (hash % 15));

  return {
    sectionId: "todays_achievement_forecast",
    title: "Today's Achievement Forecast",
    headline: `${confidence}% confidence in meaningful progress today`,
    description: "Expected achievements if you follow the Coach's guidance.",
    expectedAchievements: ["Complete today's best action", "Maintain verified frame standing"],
    frameImprovement: resolveFrameStatus(context).includes("Trusted") ? "Maintain trusted standing" : "Progress toward trusted frame",
    journeyProgress: "Advance toward next journey milestone",
    knowledgeGrowth: "One learning or knowledge contribution",
    communityContribution: "Optional community answer or discussion",
    confidencePercent: confidence,
    explainable: true,
  };
}

export function buildTomorrowPreparationSection(
  _context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot
): TomorrowPreparationSection {
  const prep = engines.tomorrowsPrep?.title ?? "Review tomorrow's priority action before end of day";

  return {
    sectionId: "tomorrow_preparation",
    title: "Tomorrow Preparation",
    headline: "Get ready for tomorrow",
    description: "Prepare today so tomorrow starts strong.",
    prepareDocuments: ["Update professional passport if needed", "Gather certification documents"],
    prepareLearning: [engines.growthPath?.[0] ?? "Review next learning module"],
    prepareMeetings: ["Check regional event calendar"],
    prepareOpportunities: [engines.opportunities?.[0]?.title ?? "Review nearby opportunities"],
    oneRecommendation: prep,
    explainable: true,
  };
}

export function buildCoachMemorySection(
  _context: LivingProfessionalCoachContext,
  memory: CoachMemoryProfile
): CoachMemorySection {
  return {
    sectionId: "coach_memory",
    title: "Coach Memory",
    headline: "Your Coach learns your preferences",
    description: "Preferences and successful recommendations — smarter guidance over time.",
    memory,
    adaptsOverTime: true,
    explainable: true,
  };
}

export function buildAllCoachSections(
  context: LivingProfessionalCoachContext,
  engines: CoachEngineSnapshot,
  memory: CoachMemoryProfile
): LivingProfessionalCoachSection[] {
  return [
    buildMorningBriefingSection(context, engines),
    buildTodaysOneBestActionSection(context, engines),
    buildPriorityPlannerSection(context, engines),
    buildOpportunityAdvisorSection(context, engines),
    buildProfessionalRiskAlertsSection(context, engines),
    buildLearningCoachSection(context, engines),
    buildCareerCoachSection(context),
    buildCommunityCoachSection(context),
    buildPartnerCoachSection(context),
    buildProductivityReflectionSection(context),
    buildTodaysAchievementForecastSection(context, engines),
    buildTomorrowPreparationSection(context, engines),
    buildCoachMemorySection(context, memory),
  ];
}

function sectionToView(section: LivingProfessionalCoachSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "morning_briefing":
      return {
        ...base,
        greeting: section.greeting,
        professional_summary: section.professionalSummary,
        current_momentum: section.currentMomentum,
        frame_status: section.frameStatus,
        journey_status: section.journeyStatus,
      };
    case "todays_one_best_action":
      return {
        ...base,
        action: section.action,
        why: section.why,
        expected_outcome: section.expectedOutcome,
        estimated_effort_minutes: section.estimatedEffortMinutes,
      };
    case "priority_planner":
      return {
        ...base,
        priorities: section.priorities,
        order_explanation: section.orderExplanation,
      };
    case "opportunity_advisor":
      return {
        ...base,
        best_opportunity: section.bestOpportunity,
        why_now: section.whyNow,
        risk_if_ignored: section.riskIfIgnored,
        expected_benefit: section.expectedBenefit,
      };
    case "professional_risk_alerts":
      return { ...base, alerts: section.alerts };
    case "learning_coach":
      return {
        ...base,
        recommended_learning: section.recommendedLearning,
        skill_gap: section.skillGap,
        best_expert: section.bestExpert,
        training_path: section.trainingPath,
        expected_improvement: section.expectedImprovement,
      };
    case "career_coach":
      return {
        ...base,
        career_advice: section.careerAdvice,
        promotion_path: section.promotionPath,
        leadership_path: section.leadershipPath,
        income_improvement: section.incomeImprovement,
        professional_positioning: section.professionalPositioning,
      };
    case "community_coach":
      return {
        ...base,
        suggested_discussion: section.suggestedDiscussion,
        question_to_answer: section.questionToAnswer,
        knowledge_to_publish: section.knowledgeToPublish,
        professional_group: section.professionalGroup,
        community_challenge: section.communityChallenge,
      };
    case "partner_coach":
      return {
        ...base,
        best_partner_today: section.bestPartnerToday,
        government_program: section.governmentProgram,
        training_partner: section.trainingPartner,
        financial_partner: section.financialPartner,
        insurance_recommendation: section.insuranceRecommendation,
        certification_recommendation: section.certificationRecommendation,
        recommendation_only: section.recommendationOnly,
      };
    case "productivity_reflection":
      return {
        ...base,
        yesterday_review: section.yesterdayReview,
        completed: section.completed,
        delayed: section.delayed,
        missed: section.missed,
        professional_habits: section.professionalHabits,
        suggestions: section.suggestions,
      };
    case "todays_achievement_forecast":
      return {
        ...base,
        expected_achievements: section.expectedAchievements,
        frame_improvement: section.frameImprovement,
        journey_progress: section.journeyProgress,
        knowledge_growth: section.knowledgeGrowth,
        community_contribution: section.communityContribution,
        confidence_percent: section.confidencePercent,
      };
    case "tomorrow_preparation":
      return {
        ...base,
        prepare_documents: section.prepareDocuments,
        prepare_learning: section.prepareLearning,
        prepare_meetings: section.prepareMeetings,
        prepare_opportunities: section.prepareOpportunities,
        one_recommendation: section.oneRecommendation,
      };
    case "coach_memory":
      return {
        ...base,
        memory: {
          professional_preferences: section.memory.professionalPreferences,
          working_style: section.memory.workingStyle,
          favorite_learning_method: section.memory.favoriteLearningMethod,
          preferred_schedule: section.memory.preferredSchedule,
          successful_recommendations: section.memory.successfulRecommendations.map((r) => ({
            recommendation: r.recommendation,
            accepted_at: r.acceptedAt,
            outcome: r.outcome,
          })),
          updated_at: section.memory.updatedAt,
        },
        adapts_over_time: section.adaptsOverTime,
      };
    default:
      return base;
  }
}

export function toCoachSectionView(section: LivingProfessionalCoachSection) {
  return sectionToView(section);
}

export function toCoachSectionsView(sections: LivingProfessionalCoachSection[]) {
  return sections.map(toCoachSectionView);
}

export function recordSuccessfulRecommendation(
  memory: CoachMemoryProfile,
  recommendation: string,
  acceptedAt: string,
  outcome: string
): CoachMemoryProfile {
  const without = memory.successfulRecommendations.filter((r) => r.recommendation !== recommendation);
  return {
    ...memory,
    successfulRecommendations: [{ recommendation, acceptedAt, outcome }, ...without].slice(0, 20),
    updatedAt: acceptedAt,
  };
}
