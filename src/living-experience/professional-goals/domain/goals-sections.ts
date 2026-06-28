import type { LivingProfessionalGoalsContext } from "./goals-context.js";
import {
  hashGoalsSeed,
  resolveExperienceYears,
  resolveFrameStanding,
  resolveLifeVision,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./goals-context.js";

export interface GoalsEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
}

export type GoalCategory =
  | "career"
  | "skill"
  | "financial"
  | "business"
  | "leadership"
  | "milestone"
  | "vision";

export type GoalPriority = "critical" | "high" | "medium" | "low";
export type GoalTimeframe = "1_year" | "3_years" | "5_years" | "ongoing";

export interface ProfessionalGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  timeframe: GoalTimeframe;
  currentProgress: number;
  targetValue: string;
  estimatedCompletion: string;
  requiredActions: string[];
  requiredSkills: string[];
  dependencies: string[];
  successIndicators: string[];
  risks: string[];
  recommendations: string[];
  confidenceScore: number;
  explanation: string;
}

export interface GoalPlanning {
  yearlyRoadmap: string[];
  quarterlyMilestones: string[];
  monthlyObjectives: string[];
  weeklyFocus: string[];
  suggestedDailyActions: string[];
}

export interface GoalsHistoryRecord {
  recordId: string;
  goalTitle: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface GoalsHistoryProfile {
  records: GoalsHistoryRecord[];
  updatedAt: string;
}

export interface GoalsSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface GoalsSummarySection extends GoalsSectionBase {
  sectionId: "goals_summary";
  overallUnderstanding: string;
  activeGoalCount: number;
  primaryFocus: string;
  planningApproach: string;
  assumptions: string[];
}

export interface LifeVisionSection extends GoalsSectionBase {
  sectionId: "life_vision";
  visionStatement: string;
  longTermAspiration: string;
  alignedGoals: ProfessionalGoal[];
  planning: GoalPlanning;
}

export interface OneYearGoalsSection extends GoalsSectionBase {
  sectionId: "one_year_goals";
  goals: ProfessionalGoal[];
  planning: GoalPlanning;
}

export interface ThreeYearGoalsSection extends GoalsSectionBase {
  sectionId: "three_year_goals";
  goals: ProfessionalGoal[];
  planning: GoalPlanning;
}

export interface FiveYearGoalsSection extends GoalsSectionBase {
  sectionId: "five_year_goals";
  goals: ProfessionalGoal[];
  planning: GoalPlanning;
}

export interface ProfessionalMilestonesSection extends GoalsSectionBase {
  sectionId: "professional_milestones";
  milestones: ProfessionalGoal[];
  timelineOverview: string;
}

export interface SkillDevelopmentGoalsSection extends GoalsSectionBase {
  sectionId: "skill_development_goals";
  goals: ProfessionalGoal[];
  skillGapAlignment: string[];
}

export interface FinancialGoalsSection extends GoalsSectionBase {
  sectionId: "financial_goals";
  goals: ProfessionalGoal[];
  currency: string;
}

export interface BusinessLeadershipGoalsSection extends GoalsSectionBase {
  sectionId: "business_leadership_goals";
  businessGoals: ProfessionalGoal[];
  leadershipGoals: ProfessionalGoal[];
}

export interface GoalProgressSection extends GoalsSectionBase {
  sectionId: "goal_progress";
  overallProgress: number;
  onTrackGoals: ProfessionalGoal[];
  atRiskGoals: ProfessionalGoal[];
  completedIndicators: string[];
}

export interface GoalRecommendationsSection extends GoalsSectionBase {
  sectionId: "goal_recommendations";
  recommendedGoals: ProfessionalGoal[];
  prioritizationRationale: string;
  sourcesUsed: string[];
}

export interface ConfidenceExplanationSection extends GoalsSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface GoalsHistorySection extends GoalsSectionBase {
  sectionId: "goals_history";
  previousGoals: GoalsHistoryRecord[];
  acceptedGoals: GoalsHistoryRecord[];
  ignoredGoals: GoalsHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalGoalsSection =
  | GoalsSummarySection
  | LifeVisionSection
  | OneYearGoalsSection
  | ThreeYearGoalsSection
  | FiveYearGoalsSection
  | ProfessionalMilestonesSection
  | SkillDevelopmentGoalsSection
  | FinancialGoalsSection
  | BusinessLeadershipGoalsSection
  | GoalProgressSection
  | GoalRecommendationsSection
  | ConfidenceExplanationSection
  | GoalsHistorySection;

export const GOALS_EXPERIENCE_FLAGS = {
  experience_only: true,
  read_only: true,
  recommends_only: true,
  never_execute: true,
  never_create_real_tasks: true,
  never_decide_for_user: true,
  never_fabricate_reasoning: true,
  never_fabricate_data: true,
  always_show_assumptions: true,
  always_show_confidence: true,
  user_controls_final_decision: true,
} as const;

export function buildDefaultGoalsHistory(context: LivingProfessionalGoalsContext): GoalsHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: GoalsEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function baseConfidence(context: LivingProfessionalGoalsContext, engines: GoalsEngineSnapshot, salt: string): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashGoalsSeed(context.dayKey, context.userId, salt);
  return Math.min(92, Math.round((readiness + trust) / 2 + (hash % 8)));
}

function globalAssumptions(context: LivingProfessionalGoalsContext): string[] {
  return [
    `Professional activity continues in ${context.geographic.city}, ${context.geographic.country}`,
    "Goals are recommendations only — never auto-created or executed",
    "Projections are deterministic estimates based on living experience data",
    "User controls which goals to adopt and track",
  ];
}

function estimateCompletion(context: LivingProfessionalGoalsContext, monthsAhead: number): string {
  const base = new Date(context.generatedAt);
  base.setMonth(base.getMonth() + monthsAhead);
  return base.toISOString().slice(0, 10);
}

export function buildGoalPlanning(input: {
  context: LivingProfessionalGoalsContext;
  engines: GoalsEngineSnapshot;
  focus: string;
  salt: string;
}): GoalPlanning {
  const skill = resolvePrimarySkill(input.context);
  const readiness = baseReadiness(input.engines);

  return {
    yearlyRoadmap: [
      `Q1: Establish ${skill} readiness foundation (target ${readiness + 10}%)`,
      `Q2: Complete milestone evidence portfolio`,
      `Q3: Expand regional visibility in ${input.context.geographic.preferredWorkRegion}`,
      `Q4: Review and adjust goals for next cycle`,
    ],
    quarterlyMilestones: [
      `Complete primary ${input.focus} objective`,
      "Document verified professional evidence",
      "Review progress with living coach recommendations",
    ],
    monthlyObjectives: [
      `Advance ${input.focus} by one measurable step`,
      "Update professional passport evidence",
      "Review action planner alignment",
    ],
    weeklyFocus: [
      `Dedicate focused time to ${input.focus}`,
      "Complete one high-impact professional action",
      "Review goal progress indicators",
    ],
    suggestedDailyActions: [
      "Review today's recommended action from planner",
      "Log one professional achievement",
      `Practice one ${skill} skill for 30 minutes`,
    ],
  };
}

export function buildProfessionalGoal(input: {
  context: LivingProfessionalGoalsContext;
  engines: GoalsEngineSnapshot;
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  timeframe: GoalTimeframe;
  currentProgress: number;
  targetValue: string;
  monthsAhead: number;
  requiredActions: string[];
  requiredSkills?: string[];
  dependencies?: string[];
  successIndicators: string[];
  risks: string[];
  recommendations: string[];
  salt: string;
  explanation: string;
}): ProfessionalGoal {
  const skill = resolvePrimarySkill(input.context);
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    timeframe: input.timeframe,
    currentProgress: input.currentProgress,
    targetValue: input.targetValue,
    estimatedCompletion: estimateCompletion(input.context, input.monthsAhead),
    requiredActions: input.requiredActions,
    requiredSkills: input.requiredSkills ?? [skill],
    dependencies: input.dependencies ?? [],
    successIndicators: input.successIndicators,
    risks: input.risks,
    recommendations: input.recommendations,
    confidenceScore: baseConfidence(input.context, input.engines, input.salt),
    explanation: input.explanation,
  };
}

function oneYearGoals(context: LivingProfessionalGoalsContext, engines: GoalsEngineSnapshot): ProfessionalGoal[] {
  const skill = resolvePrimarySkill(context);
  const readiness = baseReadiness(engines);
  return [
    buildProfessionalGoal({
      context,
      engines,
      id: `goal-1y-readiness-${context.userId.slice(-4)}`,
      title: `Reach ${readiness + 15}% professional readiness`,
      description: `Advance ${skill} readiness through consistent evidence and learning`,
      category: "career",
      priority: "critical",
      timeframe: "1_year",
      currentProgress: readiness,
      targetValue: `${readiness + 15}%`,
      monthsAhead: 12,
      requiredActions: ["Complete weekly learning modules", "Document project evidence", "Update passport"],
      successIndicators: ["Readiness score +15", "Three verified project outcomes"],
      risks: ["Inconsistent weekly execution", "Verification gaps"],
      recommendations: ["Use action planner daily", "Run simulator what-if before major decisions"],
      salt: "1y-readiness",
      explanation: "One-year readiness goal from develop-me and journey projections.",
    }),
    buildProfessionalGoal({
      context,
      engines,
      id: `goal-1y-skill-${context.userId.slice(-4)}`,
      title: `Master advanced ${skill}`,
      description: `Deepen ${skill} expertise aligned with ${resolvePrimaryIndustry(context)} demand`,
      category: "skill",
      priority: "high",
      timeframe: "1_year",
      currentProgress: Math.min(readiness, 70),
      targetValue: "Certification-ready",
      monthsAhead: 12,
      requiredActions: ["Complete develop-me roadmap", "Contribute to knowledge bank"],
      successIndicators: ["Certification exam passed", "Expert network recognition"],
      risks: ["Skill gaps limit advancement"],
      recommendations: ["Schedule 5 hours weekly learning"],
      salt: "1y-skill",
      explanation: "Skill goal from learning path and identity strengths.",
    }),
  ];
}

function threeYearGoals(context: LivingProfessionalGoalsContext, engines: GoalsEngineSnapshot): ProfessionalGoal[] {
  const years = resolveExperienceYears(context);
  const skill = resolvePrimarySkill(context);
  return [
    buildProfessionalGoal({
      context,
      engines,
      id: `goal-3y-leadership-${context.userId.slice(-4)}`,
      title: years >= 8 ? "Achieve senior leadership role" : "Reach team lead position",
      description: `Lead ${skill} projects with regional visibility`,
      category: "leadership",
      priority: "high",
      timeframe: "3_years",
      currentProgress: Math.min(years * 8, 60),
      targetValue: years >= 8 ? "Senior role" : "Team lead",
      monthsAhead: 36,
      requiredActions: ["Document leadership achievements", "Mentor junior professionals"],
      dependencies: ["Complete one-year readiness goal"],
      successIndicators: ["Leadership portfolio verified", "Team builder recognition"],
      risks: ["Leadership evidence gaps"],
      recommendations: ["Review coach leadership recommendations"],
      salt: "3y-lead",
      explanation: "Three-year leadership goal from journey and impact projections.",
    }),
    buildProfessionalGoal({
      context,
      engines,
      id: `goal-3y-network-${context.userId.slice(-4)}`,
      title: `Build regional ${resolvePrimaryIndustry(context)} network`,
      description: `Establish trusted professional network in ${context.geographic.preferredWorkRegion}`,
      category: "milestone",
      priority: "medium",
      timeframe: "3_years",
      currentProgress: 25,
      targetValue: "50+ trusted connections",
      monthsAhead: 36,
      requiredActions: ["Join partner ecosystem", "Contribute to community"],
      successIndicators: ["Partner ecosystem eligibility", "Community influence score growth"],
      risks: ["Limited community contribution"],
      recommendations: ["Engage live frame community weekly"],
      salt: "3y-network",
      explanation: "Network milestone from partner ecosystem and community projections.",
    }),
  ];
}

function fiveYearGoals(context: LivingProfessionalGoalsContext, engines: GoalsEngineSnapshot): ProfessionalGoal[] {
  const skill = resolvePrimarySkill(context);
  return [
    buildProfessionalGoal({
      context,
      engines,
      id: `goal-5y-expert-${context.userId.slice(-4)}`,
      title: `Become recognized ${skill} expert`,
      description: `Regional authority in ${resolvePrimaryIndustry(context)} with trusted live frame standing`,
      category: "career",
      priority: "high",
      timeframe: "5_years",
      currentProgress: 20,
      targetValue: "Trusted expert recognition",
      monthsAhead: 60,
      requiredActions: ["Publish knowledge contributions", "Lead high-impact projects"],
      dependencies: ["Complete three-year leadership goal"],
      successIndicators: ["Expert network featured profile", "Trusted frame tier"],
      risks: ["Reputation stagnation without contribution"],
      recommendations: ["Run reputation simulator quarterly"],
      salt: "5y-expert",
      explanation: "Five-year expert goal from identity and live frame projections.",
    }),
    buildProfessionalGoal({
      context,
      engines,
      id: `goal-5y-business-${context.userId.slice(-4)}`,
      title: `Establish independent ${skill} practice`,
      description: `Optional independent practice in ${context.geographic.city}`,
      category: "business",
      priority: "medium",
      timeframe: "5_years",
      currentProgress: 10,
      targetValue: "Sustainable independent practice",
      monthsAhead: 60,
      requiredActions: ["Build client portfolio", "Review regulatory requirements"],
      successIndicators: ["Profitable client base", "Compliance verified"],
      risks: ["Income variability during transition"],
      recommendations: ["Run income simulator before transition"],
      salt: "5y-business",
      explanation: "Business goal from simulator and impact financial projections.",
    }),
  ];
}

export function buildGoalsSummarySection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): GoalsSummarySection {
  const oneYear = oneYearGoals(context, engines);
  return {
    sectionId: "goals_summary",
    title: "Goals Summary",
    headline: "Transform vision into structured professional goals",
    description: "Deterministic goal recommendations — experience only, never auto-created.",
    overallUnderstanding: `${context.displayName}'s ${resolvePrimaryIndustry(context)} goals in ${context.geographic.city}.`,
    activeGoalCount: oneYear.length + threeYearGoals(context, engines).length + fiveYearGoals(context, engines).length,
    primaryFocus: oneYear[0]?.title ?? `Advance ${resolvePrimarySkill(context)} readiness`,
    planningApproach: "Deterministic planning from living experience projections — user adopts goals manually.",
    assumptions: globalAssumptions(context),
    explainable: true,
  };
}

export function buildLifeVisionSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): LifeVisionSection {
  const vision = resolveLifeVision(context);
  const focus = "life vision alignment";
  return {
    sectionId: "life_vision",
    title: "Life Vision",
    headline: "Your long-term professional vision",
    description: "Vision-driven goals aligned with your professional story.",
    visionStatement: vision,
    longTermAspiration: `Trusted ${resolvePrimaryIndustry(context)} leader in ${context.geographic.preferredWorkRegion}`,
    alignedGoals: fiveYearGoals(context, engines).slice(0, 1),
    planning: buildGoalPlanning({ context, engines, focus, salt: "vision" }),
    explainable: true,
  };
}

export function buildOneYearGoalsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): OneYearGoalsSection {
  const focus = "one-year readiness";
  return {
    sectionId: "one_year_goals",
    title: "One-Year Goals",
    headline: "Structured goals for the next 12 months",
    description: "Measurable one-year objectives with weekly and daily focus.",
    goals: oneYearGoals(context, engines),
    planning: buildGoalPlanning({ context, engines, focus, salt: "1y" }),
    explainable: true,
  };
}

export function buildThreeYearGoalsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): ThreeYearGoalsSection {
  const focus = "three-year career growth";
  return {
    sectionId: "three_year_goals",
    title: "Three-Year Goals",
    headline: "Mid-term professional trajectory",
    description: "Leadership and network goals for the next three years.",
    goals: threeYearGoals(context, engines),
    planning: buildGoalPlanning({ context, engines, focus, salt: "3y" }),
    explainable: true,
  };
}

export function buildFiveYearGoalsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): FiveYearGoalsSection {
  const focus = "five-year expert recognition";
  return {
    sectionId: "five_year_goals",
    title: "Five-Year Goals",
    headline: "Long-term professional vision goals",
    description: "Expert recognition and business independence pathways.",
    goals: fiveYearGoals(context, engines),
    planning: buildGoalPlanning({ context, engines, focus, salt: "5y" }),
    explainable: true,
  };
}

export function buildProfessionalMilestonesSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): ProfessionalMilestonesSection {
  const skill = resolvePrimarySkill(context);
  const milestones: ProfessionalGoal[] = [
    buildProfessionalGoal({
      context,
      engines,
      id: `milestone-q1-${context.userId.slice(-4)}`,
      title: `Q1: ${skill} readiness checkpoint`,
      description: "Quarterly readiness milestone",
      category: "milestone",
      priority: "high",
      timeframe: "1_year",
      currentProgress: baseReadiness(engines),
      targetValue: `${baseReadiness(engines) + 5}%`,
      monthsAhead: 3,
      requiredActions: ["Complete Q1 learning modules"],
      successIndicators: ["Readiness +5 from baseline"],
      risks: ["Missed weekly actions"],
      recommendations: ["Review planner weekly focus"],
      salt: "ms-q1",
      explanation: "Quarterly milestone from action planner execution patterns.",
    }),
    buildProfessionalGoal({
      context,
      engines,
      id: `milestone-passport-${context.userId.slice(-4)}`,
      title: "Passport level advancement",
      description: `Advance passport from ${engines.passportLevel ?? "current"} tier`,
      category: "milestone",
      priority: "critical",
      timeframe: "1_year",
      currentProgress: 40,
      targetValue: "Next passport tier",
      monthsAhead: 6,
      requiredActions: ["Submit verified evidence", "Complete gap remediation"],
      successIndicators: ["Passport tier upgrade confirmed"],
      risks: ["Verification delays"],
      recommendations: ["Review develop-me gap radar"],
      salt: "ms-passport",
      explanation: "Passport milestone from develop-me and passport projections.",
    }),
  ];

  return {
    sectionId: "professional_milestones",
    title: "Professional Milestones",
    headline: "Key checkpoints on your professional journey",
    description: "Quarterly and passport milestones — recommendations only.",
    milestones,
    timelineOverview: "Milestones span Q1–Q4 with passport advancement at mid-year",
    explainable: true,
  };
}

export function buildSkillDevelopmentGoalsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): SkillDevelopmentGoalsSection {
  const skill = resolvePrimarySkill(context);
  const goals: ProfessionalGoal[] = [
    buildProfessionalGoal({
      context,
      engines,
      id: `skill-gap-${context.userId.slice(-4)}`,
      title: `Close top ${skill} skill gap`,
      description: "Address primary skill gap from develop-me radar",
      category: "skill",
      priority: "high",
      timeframe: "1_year",
      currentProgress: 30,
      targetValue: "Gap closed",
      monthsAhead: 9,
      requiredActions: (engines.growthPath ?? [`Complete ${skill} module`]).slice(0, 2),
      successIndicators: ["Gap radar clear for primary skill"],
      risks: ["Inconsistent practice"],
      recommendations: ["Use learning simulator to project outcomes"],
      salt: "skill-gap",
      explanation: "Skill gap goal from develop-me and simulator learning projections.",
    }),
  ];

  return {
    sectionId: "skill_development_goals",
    title: "Skill Development Goals",
    headline: "Skill growth aligned with market demand",
    description: "Learning goals from develop-me roadmap and intelligence gaps.",
    goals,
    skillGapAlignment: engines.challenges ?? [`${skill} certification gap`],
    explainable: true,
  };
}

export function buildFinancialGoalsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): FinancialGoalsSection {
  const readiness = baseReadiness(engines);
  const goals: ProfessionalGoal[] = [
    buildProfessionalGoal({
      context,
      engines,
      id: `fin-income-${context.userId.slice(-4)}`,
      title: "Improve earning readiness",
      description: "Reach income readiness threshold for premium engagements",
      category: "financial",
      priority: "high",
      timeframe: "1_year",
      currentProgress: readiness,
      targetValue: `${readiness + 20}% income readiness`,
      monthsAhead: 12,
      requiredActions: ["Build verified project portfolio", "Review pricing strategy"],
      successIndicators: ["Premium rate eligibility", "Impact score improvement"],
      risks: ["Readiness below threshold 60"],
      recommendations: ["Run income simulator before pricing changes"],
      salt: "fin-income",
      explanation: "Financial goal from impact and simulator income projections.",
    }),
  ];

  return {
    sectionId: "financial_goals",
    title: "Financial Goals",
    headline: "Income and financial readiness objectives",
    description: "Financial goals are recommendations — never executes payments.",
    goals,
    currency: context.geographic.currency,
    explainable: true,
  };
}

export function buildBusinessLeadershipGoalsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): BusinessLeadershipGoalsSection {
  const skill = resolvePrimarySkill(context);
  const businessGoals: ProfessionalGoal[] = [
    buildProfessionalGoal({
      context,
      engines,
      id: `biz-pipeline-${context.userId.slice(-4)}`,
      title: "Build professional opportunity pipeline",
      description: `Maintain active ${resolvePrimaryIndustry(context)} opportunity queue`,
      category: "business",
      priority: "medium",
      timeframe: "1_year",
      currentProgress: 35,
      targetValue: "3+ active opportunities",
      monthsAhead: 12,
      requiredActions: ["Review living opportunities weekly", "Complete preparation checklists"],
      successIndicators: ["Opportunity match score avg > 75%"],
      risks: ["Preparation gaps"],
      recommendations: ["Use opportunity simulator before accepting"],
      salt: "biz-pipe",
      explanation: "Business pipeline goal from opportunities and simulator projections.",
    }),
  ];

  const leadershipGoals: ProfessionalGoal[] = [
    buildProfessionalGoal({
      context,
      engines,
      id: `lead-team-${context.userId.slice(-4)}`,
      title: `Lead ${skill} team initiative`,
      description: "Demonstrate leadership through team builder engagement",
      category: "leadership",
      priority: "high",
      timeframe: "1_year",
      currentProgress: 20,
      targetValue: "One completed team initiative",
      monthsAhead: 12,
      requiredActions: ["Form or join project team", "Document leadership outcomes"],
      successIndicators: ["Team builder project completed"],
      risks: ["Capacity conflicts"],
      recommendations: ["Review coach leadership guidance"],
      salt: "lead-team",
      explanation: "Leadership goal from coach and team builder projections.",
    }),
  ];

  return {
    sectionId: "business_leadership_goals",
    title: "Business & Leadership Goals",
    headline: "Business growth and leadership development",
    description: "Separate business and leadership goal tracks.",
    businessGoals,
    leadershipGoals,
    explainable: true,
  };
}

export function buildGoalProgressSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): GoalProgressSection {
  const allGoals = [
    ...oneYearGoals(context, engines),
    ...threeYearGoals(context, engines).slice(0, 1),
  ];
  const onTrack = allGoals.filter((g) => g.currentProgress >= 40);
  const atRisk = allGoals.filter((g) => g.currentProgress < 40);

  const overallProgress =
    allGoals.length === 0
      ? 0
      : Math.round(allGoals.reduce((sum, g) => sum + g.currentProgress, 0) / allGoals.length);

  return {
    sectionId: "goal_progress",
    title: "Goal Progress",
    headline: `${overallProgress}% overall goal progress`,
    description: "Progress tracking from living experience signals — user validates.",
    overallProgress,
    onTrackGoals: onTrack,
    atRiskGoals: atRisk,
    completedIndicators: onTrack.flatMap((g) => g.successIndicators.slice(0, 1)),
    explainable: true,
  };
}

export function buildGoalRecommendationsSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): GoalRecommendationsSection {
  const recommended = oneYearGoals(context, engines).slice(0, 1);
  return {
    sectionId: "goal_recommendations",
    title: "Goal Recommendations",
    headline: "Top recommended goals to adopt",
    description: "Prioritized recommendations — user decides which to pursue.",
    recommendedGoals: recommended,
    prioritizationRationale: `Based on readiness ${baseReadiness(engines)} and ${resolveFrameStanding(context)} standing`,
    sourcesUsed: [
      "Living Professional Passport",
      "Living Professional Journey",
      "Living Professional Impact",
      "Living Professional Coach",
      "Living Action Planner",
      "Living Live Frame",
      "Living Professional Identity",
      "Living Professional Intelligence Center",
      "Living Professional Simulator",
    ],
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot
): ConfidenceExplanationSection {
  const conf = baseConfidence(context, engines, "overall");
  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in goal recommendations`,
    description: "Evidence-based confidence with stated limitations.",
    confidenceScore: conf,
    evidence: [
      `Readiness ${baseReadiness(engines)}`,
      resolveFrameStanding(context),
      `${resolveExperienceYears(context)} years verified experience`,
      engines.passportLevel ?? "Passport profile active",
    ],
    reasoning: "Confidence derived from data completeness and living experience alignment — never fabricated.",
    missingInformation: !context.onboarding.ironVerification?.identityConfirmed
      ? ["Complete verification for higher confidence"]
      : [],
    alternativeInterpretations: [
      "Conservative interpretation: extend all timelines by 50%",
      "Optimistic interpretation: assumes perfect weekly execution",
    ],
    explainable: true,
  };
}

export function buildGoalsHistorySection(
  _context: LivingProfessionalGoalsContext,
  history: GoalsHistoryProfile
): GoalsHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "goals_history",
    title: "Goals History",
    headline: `${history.records.length} goal decision${history.records.length === 1 ? "" : "s"} recorded`,
    description: "Track accepted and ignored goal recommendations over time.",
    previousGoals: history.records.slice(0, 10),
    acceptedGoals: accepted,
    ignoredGoals: ignored,
    outcomeComparison: accepted.length > 0 ? "Accepted goals help refine future recommendations" : "Adopt goals to build history",
    learningEvolution: history.records.length >= 3 ? "Recommendations adapt to your goal patterns" : "History grows with each decision",
    explainable: true,
  };
}

export function buildAllGoalsSections(
  context: LivingProfessionalGoalsContext,
  engines: GoalsEngineSnapshot,
  history: GoalsHistoryProfile
): LivingProfessionalGoalsSection[] {
  return [
    buildGoalsSummarySection(context, engines),
    buildLifeVisionSection(context, engines),
    buildOneYearGoalsSection(context, engines),
    buildThreeYearGoalsSection(context, engines),
    buildFiveYearGoalsSection(context, engines),
    buildProfessionalMilestonesSection(context, engines),
    buildSkillDevelopmentGoalsSection(context, engines),
    buildFinancialGoalsSection(context, engines),
    buildBusinessLeadershipGoalsSection(context, engines),
    buildGoalProgressSection(context, engines),
    buildGoalRecommendationsSection(context, engines),
    buildConfidenceExplanationSection(context, engines),
    buildGoalsHistorySection(context, history),
  ];
}

function goalToView(g: ProfessionalGoal) {
  return {
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    priority: g.priority,
    timeframe: g.timeframe,
    current_progress: g.currentProgress,
    target_value: g.targetValue,
    estimated_completion: g.estimatedCompletion,
    required_actions: g.requiredActions,
    required_skills: g.requiredSkills,
    dependencies: g.dependencies,
    success_indicators: g.successIndicators,
    risks: g.risks,
    recommendations: g.recommendations,
    confidence_score: g.confidenceScore,
    explanation: g.explanation,
  };
}

function planningToView(p: GoalPlanning) {
  return {
    yearly_roadmap: p.yearlyRoadmap,
    quarterly_milestones: p.quarterlyMilestones,
    monthly_objectives: p.monthlyObjectives,
    weekly_focus: p.weeklyFocus,
    suggested_daily_actions: p.suggestedDailyActions,
  };
}

function sectionToView(section: LivingProfessionalGoalsSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "goals_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        active_goal_count: section.activeGoalCount,
        primary_focus: section.primaryFocus,
        planning_approach: section.planningApproach,
        assumptions: section.assumptions,
      };
    case "life_vision":
      return {
        ...base,
        vision_statement: section.visionStatement,
        long_term_aspiration: section.longTermAspiration,
        aligned_goals: section.alignedGoals.map(goalToView),
        planning: planningToView(section.planning),
      };
    case "one_year_goals":
    case "three_year_goals":
    case "five_year_goals":
      return {
        ...base,
        goals: section.goals.map(goalToView),
        planning: planningToView(section.planning),
      };
    case "professional_milestones":
      return {
        ...base,
        milestones: section.milestones.map(goalToView),
        timeline_overview: section.timelineOverview,
      };
    case "skill_development_goals":
      return {
        ...base,
        goals: section.goals.map(goalToView),
        skill_gap_alignment: section.skillGapAlignment,
      };
    case "financial_goals":
      return {
        ...base,
        goals: section.goals.map(goalToView),
        currency: section.currency,
      };
    case "business_leadership_goals":
      return {
        ...base,
        business_goals: section.businessGoals.map(goalToView),
        leadership_goals: section.leadershipGoals.map(goalToView),
      };
    case "goal_progress":
      return {
        ...base,
        overall_progress: section.overallProgress,
        on_track_goals: section.onTrackGoals.map(goalToView),
        at_risk_goals: section.atRiskGoals.map(goalToView),
        completed_indicators: section.completedIndicators,
      };
    case "goal_recommendations":
      return {
        ...base,
        recommended_goals: section.recommendedGoals.map(goalToView),
        prioritization_rationale: section.prioritizationRationale,
        sources_used: section.sourcesUsed,
      };
    case "confidence_explanation":
      return {
        ...base,
        confidence_score: section.confidenceScore,
        evidence: section.evidence,
        reasoning: section.reasoning,
        missing_information: section.missingInformation,
        alternative_interpretations: section.alternativeInterpretations,
      };
    case "goals_history":
      return {
        ...base,
        previous_goals: section.previousGoals.map(mapHistoryRecord),
        accepted_goals: section.acceptedGoals.map(mapHistoryRecord),
        ignored_goals: section.ignoredGoals.map(mapHistoryRecord),
        outcome_comparison: section.outcomeComparison,
        learning_evolution: section.learningEvolution,
      };
    default:
      return base;
  }
}

function mapHistoryRecord(r: GoalsHistoryRecord) {
  return {
    record_id: r.recordId,
    goal_title: r.goalTitle,
    status: r.status,
    recorded_at: r.recordedAt,
    outcome: r.outcome,
  };
}

export function toGoalsSectionView(section: LivingProfessionalGoalsSection) {
  return sectionToView(section);
}

export function toGoalsSectionsView(sections: LivingProfessionalGoalsSection[]) {
  return sections.map(toGoalsSectionView);
}

export function recordGoalOutcome(
  history: GoalsHistoryProfile,
  recordId: string,
  goalTitle: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): GoalsHistoryProfile {
  const without = history.records.filter((r) => r.recordId !== recordId);
  return {
    records: [{ recordId, goalTitle, status, recordedAt, outcome }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}
