import type { LivingProfessionalCareerEngineContext } from "./career-engine-context.js";
import {
  hashCareerEngineSeed,
  resolveCareerChangingProject,
  resolveCareerStage,
  resolveExperienceYears,
  resolveFrameStanding,
  resolveMasterAction,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolveProudestAchievement,
} from "./career-engine-context.js";

export interface CareerEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
}

export type CareerRecommendationCategory =
  | "summary"
  | "position"
  | "readiness"
  | "opportunity"
  | "risk"
  | "growth"
  | "skill"
  | "financial"
  | "leadership"
  | "decision"
  | "next_move";

export type CareerPriority = "critical" | "high" | "medium" | "low";

export interface CareerRecommendation {
  id: string;
  title: string;
  description: string;
  category: CareerRecommendationCategory;
  priority: CareerPriority;
  timeframe: string;
  reasoning: string;
  assumptions: string[];
  requiredSkills: string[];
  expectedBenefits: string[];
  possibleRisks: string[];
  alternatives: string[];
  confidenceScore: number;
  explanation: string;
}

export interface CareerEngineEvaluation {
  currentCareerStage: string;
  careerReadinessScore: number;
  careerGrowthScore: number;
  opportunityScore: number;
  leadershipScore: number;
  financialGrowthScore: number;
  learningScore: number;
  careerRiskScore: number;
  recommendedCareerPath: string;
  recommendedNextActions: string[];
  alternativePaths: string[];
  projectedNextMilestones: string[];
  overallCareerScore: number;
}

export interface CareerEngineHistoryRecord {
  recordId: string;
  insightTitle: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface CareerEngineHistoryProfile {
  records: CareerEngineHistoryRecord[];
  updatedAt: string;
}

export interface CareerEngineSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
  recommendations: CareerRecommendation[];
}

export interface CareerEngineSummarySection extends CareerEngineSectionBase {
  sectionId: "career_engine_summary";
  overallUnderstanding: string;
  currentCareerStage: string;
  overallCareerScore: number;
  assumptions: string[];
  engine: CareerEngineEvaluation;
}

export interface CurrentCareerPositionSection extends CareerEngineSectionBase {
  sectionId: "current_career_position";
  positionSummary: string;
  industry: string;
  primarySkill: string;
  experienceYears: number;
}

export interface CareerReadinessSection extends CareerEngineSectionBase {
  sectionId: "career_readiness";
  readinessScore: number;
  readinessSummary: string;
}

export interface CareerOpportunitiesSection extends CareerEngineSectionBase {
  sectionId: "career_opportunities";
  opportunityScore: number;
  opportunitySummary: string;
}

export interface CareerRisksSection extends CareerEngineSectionBase {
  sectionId: "career_risks";
  riskScore: number;
  riskSummary: string;
}

export interface CareerGrowthStrategySection extends CareerEngineSectionBase {
  sectionId: "career_growth_strategy";
  growthScore: number;
  growthSummary: string;
}

export interface SkillEvolutionStrategySection extends CareerEngineSectionBase {
  sectionId: "skill_evolution_strategy";
  learningScore: number;
  skillSummary: string;
}

export interface FinancialCareerStrategySection extends CareerEngineSectionBase {
  sectionId: "financial_career_strategy";
  financialGrowthScore: number;
  currency: string;
  financialSummary: string;
}

export interface LeadershipStrategySection extends CareerEngineSectionBase {
  sectionId: "leadership_strategy";
  leadershipScore: number;
  leadershipSummary: string;
}

export interface CareerDecisionEngineSection extends CareerEngineSectionBase {
  sectionId: "career_decision_engine";
  decisionSummary: string;
  recommendedCareerPath: string;
  alternativePaths: string[];
  engine: CareerEngineEvaluation;
}

export interface RecommendedNextCareerMovesSection extends CareerEngineSectionBase {
  sectionId: "recommended_next_career_moves";
  nextMoveSummary: string;
  projectedMilestones: string[];
}

export interface ConfidenceExplanationSection extends CareerEngineSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface CareerEngineHistorySection extends CareerEngineSectionBase {
  sectionId: "career_engine_history";
  previousInsights: CareerEngineHistoryRecord[];
  acceptedInsights: CareerEngineHistoryRecord[];
  ignoredInsights: CareerEngineHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalCareerEngineSection =
  | CareerEngineSummarySection
  | CurrentCareerPositionSection
  | CareerReadinessSection
  | CareerOpportunitiesSection
  | CareerRisksSection
  | CareerGrowthStrategySection
  | SkillEvolutionStrategySection
  | FinancialCareerStrategySection
  | LeadershipStrategySection
  | CareerDecisionEngineSection
  | RecommendedNextCareerMovesSection
  | ConfidenceExplanationSection
  | CareerEngineHistorySection;

export const CAREER_ENGINE_EXPERIENCE_FLAGS = {
  experience_only: true,
  read_only: true,
  recommends_only: true,
  never_execute: true,
  never_modify_user_data: true,
  never_make_decisions: true,
  never_fabricate_reasoning: true,
  never_fabricate_data: true,
  always_show_assumptions: true,
  always_show_confidence: true,
  user_controls_final_decision: true,
} as const;

export function buildDefaultCareerEngineHistory(
  context: LivingProfessionalCareerEngineContext
): CareerEngineHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: CareerEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function baseConfidence(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot,
  salt: string
): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashCareerEngineSeed(context.dayKey, context.userId, salt);
  return Math.min(92, Math.round((readiness + trust) / 2 + (hash % 8)));
}

function globalAssumptions(context: LivingProfessionalCareerEngineContext): string[] {
  return [
    `Career reasoning for ${context.geographic.city}, ${context.geographic.country}`,
    "Recommendations derived from living experience projections — never modifies user data",
    "Deterministic career reasoning from onboarding, timeline, and analytics projections",
    "User controls all final career decisions",
  ];
}

const LIVING_SOURCES = [
  "Living Professional Passport",
  "Living Professional Journey",
  "Living Professional Impact",
  "Living Professional Coach",
  "Living Action Planner",
  "Living Live Frame",
  "Living Professional Identity",
  "Living Professional Intelligence Center",
  "Living Professional Simulator",
  "Living Professional Goals",
  "Living Professional Achievements",
  "Living Professional Analytics",
  "Living Professional Timeline",
] as const;

export function buildCareerRecommendation(input: {
  context: LivingProfessionalCareerEngineContext;
  engines: CareerEngineSnapshot;
  id: string;
  title: string;
  description: string;
  category: CareerRecommendationCategory;
  priority: CareerPriority;
  timeframe: string;
  reasoning: string;
  requiredSkills?: string[];
  expectedBenefits?: string[];
  possibleRisks?: string[];
  alternatives?: string[];
  salt: string;
  explanation: string;
}): CareerRecommendation {
  const confidence = baseConfidence(input.context, input.engines, input.salt);
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    timeframe: input.timeframe,
    reasoning: input.reasoning,
    assumptions: globalAssumptions(input.context),
    requiredSkills: input.requiredSkills ?? [resolvePrimarySkill(input.context)],
    expectedBenefits: input.expectedBenefits ?? ["Career clarity and informed decision-making"],
    possibleRisks: input.possibleRisks ?? ["Recommendations require user validation before action"],
    alternatives: input.alternatives ?? ["Defer decision and gather more evidence"],
    confidenceScore: confidence,
    explanation: input.explanation,
  };
}

export function buildCareerEngineEvaluation(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerEngineEvaluation {
  const readiness = baseReadiness(engines);
  const years = resolveExperienceYears(context);
  const verified = context.onboarding.ironVerification?.identityConfirmed ?? false;
  const enjoysLeading = context.onboarding.smartQuestions?.enjoysLeading ?? false;
  const enjoysTeaching = context.onboarding.smartQuestions?.enjoysTeaching ?? false;

  const careerGrowthScore = Math.min(95, readiness + Math.min(years * 2, 20));
  const opportunityScore = Math.min(
    95,
    (engines.opportunities?.[0]?.matchScore ?? readiness) + (engines.growthPath?.length ?? 0) * 3
  );
  const leadershipScore = Math.min(95, enjoysLeading ? readiness + 15 : readiness - 5);
  const financialGrowthScore = Math.min(95, readiness + (verified ? 10 : 0));
  const learningScore = Math.min(
    95,
    readiness + (context.onboarding.professionalBackground?.certificates.length ?? 0) * 5
  );
  const careerRiskScore = Math.max(
    5,
    Math.min(85, 100 - readiness + (engines.challenges?.length ?? 0) * 5)
  );

  const stage = resolveCareerStage(context);
  const industry = resolvePrimaryIndustry(context);
  const skill = resolvePrimarySkill(context);
  const masterAction = resolveMasterAction(context);

  const recommendedCareerPath = `${stage.replace(/_/g, " ")} in ${industry} with ${skill} specialization`;
  const recommendedNextActions = [
    `Strengthen ${skill} through develop-me roadmap`,
    engines.growthPath?.[0] ?? `Pursue ${masterAction} certification path`,
    enjoysTeaching ? "Explore mentorship opportunities via coach" : "Build portfolio evidence in passport",
  ];
  const alternativePaths = [
    `Pivot toward ${masterAction} in adjacent industry`,
    "Consulting-focused career path via expert network",
    "Leadership track via team builder and coach calibration",
  ];
  const projectedNextMilestones = [
    `${resolveFrameStanding(context)} standing within 6 months`,
    `${masterAction} milestone within 12 months`,
    resolveProudestAchievement(context).slice(0, 60),
  ];

  const overallCareerScore = Math.round(
    (careerGrowthScore +
      opportunityScore +
      leadershipScore +
      financialGrowthScore +
      learningScore +
      (100 - careerRiskScore)) /
      6
  );

  return {
    currentCareerStage: stage,
    careerReadinessScore: readiness,
    careerGrowthScore,
    opportunityScore,
    leadershipScore,
    financialGrowthScore,
    learningScore,
    careerRiskScore,
    recommendedCareerPath,
    recommendedNextActions,
    alternativePaths,
    projectedNextMilestones,
    overallCareerScore,
  };
}

function positionRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-pos-${context.userId.slice(-4)}`,
      title: `Current position: ${engine.currentCareerStage.replace(/_/g, " ")}`,
      description: `${context.displayName} is positioned in ${resolvePrimaryIndustry(context)} with ${resolveExperienceYears(context)} years experience`,
      category: "position",
      priority: "high",
      timeframe: "current",
      reasoning: "Derived from journey, timeline, and analytics projections",
      requiredSkills: context.onboarding.professionalBackground?.skills.map((s) => s.replace(/_/g, " ")) ?? [],
      expectedBenefits: ["Clear understanding of current career standing"],
      possibleRisks: ["Position assessment may lag recent unrecorded changes"],
      alternatives: ["Refresh career engine after major career change"],
      salt: "pos",
      explanation: "Current position from passport and journey — never modifies user data.",
    }),
  ];
}

function readinessRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-ready-${context.userId.slice(-4)}`,
      title: `Career readiness at ${engine.careerReadinessScore}%`,
      description: `Readiness reflects passport, develop-me, and analytics alignment in ${context.geographic.city}`,
      category: "readiness",
      priority: engine.careerReadinessScore >= 70 ? "medium" : "high",
      timeframe: "0-3 months",
      reasoning: `Readiness ${engine.careerReadinessScore}% from develop-me and personal assistant projections`,
      expectedBenefits: ["Identify gaps before pursuing opportunities"],
      possibleRisks: ["Low readiness may indicate skill or verification gaps"],
      alternatives: ["Focus on verification and passport completeness first"],
      salt: "ready",
      explanation: "Readiness score from Living Professional Passport and Analytics.",
    }),
  ];
}

function opportunityRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  const topOpp = engines.opportunities?.[0];
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-opp-${context.userId.slice(-4)}-1`,
      title: topOpp?.title ?? `Explore ${resolvePrimaryIndustry(context)} leadership roles`,
      description: `Opportunity score ${engine.opportunityScore}% — aligned with goals and simulator projections`,
      category: "opportunity",
      priority: "high",
      timeframe: "3-6 months",
      reasoning: "From opportunities module, goals, and intelligence center recommendations",
      expectedBenefits: ["Career advancement aligned with stated preferences"],
      possibleRisks: ["Market conditions in region may shift"],
      alternatives: ["Pursue adjacent industry opportunities via simulator what-if"],
      salt: "opp1",
      explanation: "Opportunity from Living Professional Goals and Simulator — user decides.",
    }),
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-opp-${context.userId.slice(-4)}-2`,
      title: `Develop ${resolveMasterAction(context)} capability`,
      description: "Master action from identity calibration suggests growth direction",
      category: "opportunity",
      priority: "medium",
      timeframe: "6-12 months",
      reasoning: "Identity calibration master action and develop-me roadmap alignment",
      expectedBenefits: ["Differentiation in competitive market"],
      possibleRisks: ["Requires sustained learning investment"],
      alternatives: ["Deepen existing skill rather than expanding"],
      salt: "opp2",
      explanation: "From Living Professional Identity and Develop-Me.",
    }),
  ];
}

function riskRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  const challenges = engines.challenges ?? [];
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-risk-${context.userId.slice(-4)}-1`,
      title: challenges[0] ? `Address gap: ${challenges[0]}` : "Monitor skill gap exposure",
      description: `Career risk score ${engine.careerRiskScore}% — gaps from develop-me gap radar`,
      category: "risk",
      priority: engine.careerRiskScore >= 50 ? "high" : "medium",
      timeframe: "ongoing",
      reasoning: "Risk assessment from analytics, impact, and develop-me gap radar",
      expectedBenefits: ["Proactive risk mitigation before career setbacks"],
      possibleRisks: ["Unaddressed gaps may limit advancement"],
      alternatives: ["Accept risk and focus on strengths instead"],
      salt: "risk1",
      explanation: "Risk from Living Professional Analytics — recommends only, never executes.",
    }),
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-risk-${context.userId.slice(-4)}-2`,
      title: "Verification completeness risk",
      description: !context.onboarding.ironVerification?.identityConfirmed
        ? "Incomplete identity verification may limit opportunity trust"
        : "Verification profile supports career credibility",
      category: "risk",
      priority: !context.onboarding.ironVerification?.identityConfirmed ? "high" : "low",
      timeframe: "immediate",
      reasoning: "Live frame and passport verification status",
      expectedBenefits: ["Higher trust score for career opportunities"],
      possibleRisks: ["Delayed verification reduces live frame standing"],
      alternatives: ["Proceed with local network opportunities while verifying"],
      salt: "risk2",
      explanation: "From Living Professional Live Frame and Passport.",
    }),
  ];
}

function growthRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  const growthStep = engines.growthPath?.[0] ?? `Advance ${resolvePrimarySkill(context)} proficiency`;
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-growth-${context.userId.slice(-4)}`,
      title: growthStep,
      description: `Growth score ${engine.careerGrowthScore}% — roadmap from develop-me and planner`,
      category: "growth",
      priority: "high",
      timeframe: "6-12 months",
      reasoning: "Growth strategy from journey, planner, and develop-me roadmap",
      expectedBenefits: ["Structured career progression with measurable milestones"],
      possibleRisks: ["Growth pace depends on available learning time"],
      alternatives: engine.alternativePaths,
      salt: "growth",
      explanation: "From Living Professional Journey and Action Planner.",
    }),
  ];
}

function skillRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  const certs = context.onboarding.professionalBackground?.certificates ?? [];
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-skill-${context.userId.slice(-4)}`,
      title: certs[0]
        ? `Maintain and extend ${certs[0].replace(/_/g, " ")} credentials`
        : `Build ${resolvePrimarySkill(context)} certification path`,
      description: `Learning score ${engine.learningScore}% — skill evolution from identity and timeline`,
      category: "skill",
      priority: "medium",
      timeframe: "3-9 months",
      reasoning: "Skill strategy from identity calibration and timeline skills evolution",
      expectedBenefits: ["Market-relevant skill portfolio"],
      possibleRisks: ["Certification costs and time commitment"],
      alternatives: ["Focus on experiential learning via learn-by-action"],
      salt: "skill",
      explanation: "From Living Professional Identity and Timeline skills evolution.",
    }),
  ];
}

function financialRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-fin-${context.userId.slice(-4)}`,
      title: "Align career moves with financial readiness",
      description: `Financial growth score ${engine.financialGrowthScore}% in ${context.geographic.currency} market`,
      category: "financial",
      priority: "medium",
      timeframe: "12 months",
      reasoning: "Financial strategy from impact and analytics — never executes payments",
      expectedBenefits: ["Career decisions aligned with financial trajectory"],
      possibleRisks: ["Financial projections are estimates only"],
      alternatives: ["Prioritize skill investment over immediate compensation"],
      salt: "fin",
      explanation: "From Living Professional Impact and Analytics — recommends only.",
    }),
  ];
}

function leadershipRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  const enjoysLeading = context.onboarding.smartQuestions?.enjoysLeading ?? false;
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-lead-${context.userId.slice(-4)}`,
      title: enjoysLeading ? "Pursue formal leadership development" : "Build influence without management track",
      description: `Leadership score ${engine.leadershipScore}% from coach calibration and team builder`,
      category: "leadership",
      priority: enjoysLeading ? "high" : "medium",
      timeframe: "6-18 months",
      reasoning: "Leadership strategy from coach, team builder, and identity calibration",
      expectedBenefits: ["Leadership readiness for next career stage"],
      possibleRisks: ["Leadership roles require different skill set"],
      alternatives: ["Technical specialist track without people management"],
      salt: "lead",
      explanation: "From Living Professional Coach and Team Builder.",
    }),
  ];
}

function decisionRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-dec-${context.userId.slice(-4)}`,
      title: `Recommended path: ${engine.recommendedCareerPath}`,
      description: "Deterministic career decision engine output — user makes final decision",
      category: "decision",
      priority: "critical",
      timeframe: "strategic",
      reasoning: "Synthesized from all living experience projections and timeline",
      expectedBenefits: ["Coherent career direction with transparent reasoning"],
      possibleRisks: ["Single-path recommendation may not fit all preferences"],
      alternatives: engine.alternativePaths,
      salt: "dec",
      explanation: "Career decision engine — recommends only, never decides for user.",
    }),
  ];
}

function nextMoveRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  return engine.recommendedNextActions.map((action, index) =>
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-next-${context.userId.slice(-4)}-${index}`,
      title: action,
      description: `Next career move ${index + 1} of ${engine.recommendedNextActions.length}`,
      category: "next_move",
      priority: index === 0 ? "critical" : index === 1 ? "high" : "medium",
      timeframe: index === 0 ? "0-3 months" : index === 1 ? "3-6 months" : "6-12 months",
      reasoning: "Prioritized from career engine evaluation and goals alignment",
      expectedBenefits: [`Progress toward ${engine.recommendedCareerPath}`],
      possibleRisks: ["Sequence may change based on user priorities"],
      alternatives: engine.alternativePaths,
      salt: `next${index}`,
      explanation: "From Living Professional Goals and Planner — user controls execution.",
    })
  );
}

function summaryRecommendations(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRecommendation[] {
  const engine = buildCareerEngineEvaluation(context, engines);
  return [
    buildCareerRecommendation({
      context,
      engines,
      id: `ce-sum-${context.userId.slice(-4)}`,
      title: `Overall career score: ${engine.overallCareerScore}%`,
      description: `${context.displayName}'s career trajectory in ${resolvePrimaryIndustry(context)} evaluated deterministically`,
      category: "summary",
      priority: "high",
      timeframe: "current",
      reasoning: "Aggregate of readiness, growth, opportunity, leadership, financial, and learning scores",
      expectedBenefits: ["Holistic career understanding across all dimensions"],
      possibleRisks: ["Score reflects available data completeness"],
      alternatives: ["Review individual section scores for granular analysis"],
      salt: "sum",
      explanation: "Career engine summary — transparent deterministic reasoning.",
    }),
  ];
}

export function buildCareerEngineSummarySection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerEngineSummarySection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "career_engine_summary",
    title: "Career Engine Summary",
    headline: "Your deterministic career reasoning engine",
    description: "Recommends only — never decides or modifies user data.",
    overallUnderstanding: `${context.displayName}'s ${engine.currentCareerStage.replace(/_/g, " ")} career in ${resolvePrimaryIndustry(context)}, ${context.geographic.city}.`,
    currentCareerStage: engine.currentCareerStage,
    overallCareerScore: engine.overallCareerScore,
    assumptions: globalAssumptions(context),
    engine,
    recommendations: summaryRecommendations(context, engines),
    explainable: true,
  };
}

export function buildCurrentCareerPositionSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CurrentCareerPositionSection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "current_career_position",
    title: "Current Career Position",
    headline: `Positioned as ${engine.currentCareerStage.replace(/_/g, " ")}`,
    description: "Current position from journey, passport, and timeline.",
    positionSummary: `${resolveExperienceYears(context)} years in ${resolvePrimaryIndustry(context)} focusing on ${resolvePrimarySkill(context)}`,
    industry: resolvePrimaryIndustry(context),
    primarySkill: resolvePrimarySkill(context),
    experienceYears: resolveExperienceYears(context),
    recommendations: positionRecommendations(context, engines),
    explainable: true,
  };
}

export function buildCareerReadinessSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerReadinessSection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "career_readiness",
    title: "Career Readiness",
    headline: `${engine.careerReadinessScore}% career readiness`,
    description: "Readiness from passport, develop-me, and analytics.",
    readinessScore: engine.careerReadinessScore,
    readinessSummary: engines.passportLevel
      ? `Passport level ${engines.passportLevel} supports readiness assessment`
      : "Passport profile active — complete verification for higher readiness confidence",
    recommendations: readinessRecommendations(context, engines),
    explainable: true,
  };
}

export function buildCareerOpportunitiesSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerOpportunitiesSection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "career_opportunities",
    title: "Career Opportunities",
    headline: `Opportunity score ${engine.opportunityScore}%`,
    description: "Opportunities from goals, simulator, and intelligence center.",
    opportunityScore: engine.opportunityScore,
    opportunitySummary: `Aligned opportunities in ${context.geographic.preferredWorkRegion ?? context.geographic.city}`,
    recommendations: opportunityRecommendations(context, engines),
    explainable: true,
  };
}

export function buildCareerRisksSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerRisksSection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "career_risks",
    title: "Career Risks",
    headline: `Risk exposure ${engine.careerRiskScore}%`,
    description: "Risk assessment from analytics and develop-me gap radar.",
    riskScore: engine.careerRiskScore,
    riskSummary: (engines.challenges ?? []).length > 0
      ? `Primary gaps: ${(engines.challenges ?? []).slice(0, 3).join(", ")}`
      : "No critical gaps identified from available projections",
    recommendations: riskRecommendations(context, engines),
    explainable: true,
  };
}

export function buildCareerGrowthStrategySection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerGrowthStrategySection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "career_growth_strategy",
    title: "Career Growth Strategy",
    headline: `Growth potential ${engine.careerGrowthScore}%`,
    description: "Growth strategy from journey, planner, and develop-me.",
    growthScore: engine.careerGrowthScore,
    growthSummary: resolveCareerChangingProject(context),
    recommendations: growthRecommendations(context, engines),
    explainable: true,
  };
}

export function buildSkillEvolutionStrategySection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): SkillEvolutionStrategySection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "skill_evolution_strategy",
    title: "Skill Evolution Strategy",
    headline: `Learning trajectory ${engine.learningScore}%`,
    description: "Skill evolution from identity and timeline.",
    learningScore: engine.learningScore,
    skillSummary: `${resolvePrimarySkill(context)} evolution tracked through calibration and certifications`,
    recommendations: skillRecommendations(context, engines),
    explainable: true,
  };
}

export function buildFinancialCareerStrategySection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): FinancialCareerStrategySection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "financial_career_strategy",
    title: "Financial Career Strategy",
    headline: `Financial growth potential ${engine.financialGrowthScore}%`,
    description: "Financial strategy from impact and analytics — never executes.",
    financialGrowthScore: engine.financialGrowthScore,
    currency: context.geographic.currency,
    financialSummary: `Career-financial alignment in ${context.geographic.currency} market`,
    recommendations: financialRecommendations(context, engines),
    explainable: true,
  };
}

export function buildLeadershipStrategySection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): LeadershipStrategySection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "leadership_strategy",
    title: "Leadership Strategy",
    headline: `Leadership readiness ${engine.leadershipScore}%`,
    description: "Leadership from coach calibration and team builder.",
    leadershipScore: engine.leadershipScore,
    leadershipSummary: context.onboarding.smartQuestions?.enjoysLeading
      ? "Leadership interest confirmed — formal development recommended"
      : "Individual contributor path may suit current preferences",
    recommendations: leadershipRecommendations(context, engines),
    explainable: true,
  };
}

export function buildCareerDecisionEngineSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): CareerDecisionEngineSection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "career_decision_engine",
    title: "Career Decision Engine",
    headline: "Deterministic career path synthesis",
    description: "Decision engine recommends — user decides.",
    decisionSummary: `Primary path: ${engine.recommendedCareerPath}`,
    recommendedCareerPath: engine.recommendedCareerPath,
    alternativePaths: engine.alternativePaths,
    engine,
    recommendations: decisionRecommendations(context, engines),
    explainable: true,
  };
}

export function buildRecommendedNextCareerMovesSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): RecommendedNextCareerMovesSection {
  const engine = buildCareerEngineEvaluation(context, engines);
  return {
    sectionId: "recommended_next_career_moves",
    title: "Recommended Next Career Moves",
    headline: `${engine.recommendedNextActions.length} prioritized next moves`,
    description: "Prioritized actions from goals and planner — user controls execution.",
    nextMoveSummary: engine.recommendedNextActions.join("; "),
    projectedMilestones: engine.projectedNextMilestones,
    recommendations: nextMoveRecommendations(context, engines),
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot
): ConfidenceExplanationSection {
  const conf = baseConfidence(context, engines, "overall");
  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in career reasoning`,
    description: "Evidence-based confidence with stated limitations.",
    confidenceScore: conf,
    evidence: [
      `Readiness ${baseReadiness(engines)}%`,
      resolveFrameStanding(context),
      `${resolveExperienceYears(context)} years experience`,
      engines.passportLevel ?? "Passport profile active",
      ...LIVING_SOURCES.slice(0, 5),
    ],
    reasoning: "Confidence derived from data completeness across living experience modules — never fabricates recommendations.",
    missingInformation: !context.onboarding.ironVerification?.identityConfirmed
      ? ["Complete verification for higher career reasoning confidence"]
      : [],
    alternativeInterpretations: [
      "Conservative: prioritize risk mitigation over growth",
      "Optimistic: pursue highest opportunity score path",
    ],
    recommendations: [
      buildCareerRecommendation({
        context,
        engines,
        id: `ce-conf-${context.userId.slice(-4)}`,
        title: "Career reasoning confidence indicator",
        description: "Meta-recommendation representing overall career engine confidence",
        category: "summary",
        priority: "low",
        timeframe: "current",
        reasoning: `Aggregate confidence ${conf}% from all living experience sources`,
        salt: "conf",
        explanation: "Confidence meta-recommendation for career engine section.",
      }),
    ],
    explainable: true,
  };
}

export function buildCareerEngineHistorySection(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot,
  history: CareerEngineHistoryProfile
): CareerEngineHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "career_engine_history",
    title: "Career Engine History",
    headline: `${history.records.length} career insight decision${history.records.length === 1 ? "" : "s"} recorded`,
    description: "Track accepted and ignored career recommendations.",
    previousInsights: history.records.slice(0, 10),
    acceptedInsights: accepted,
    ignoredInsights: ignored,
    outcomeComparison:
      accepted.length > 0 ? "Accepted recommendations help refine career reasoning" : "Explore recommendations to build history",
    learningEvolution:
      history.records.length >= 3 ? "Career engine adapts to your decision patterns" : "History grows with each accept or ignore",
    recommendations: [
      buildCareerRecommendation({
        context,
        engines,
        id: `ce-hist-${context.userId.slice(-4)}`,
        title: "Career decision tracking",
        description: "History of accepted and ignored career recommendations",
        category: "summary",
        priority: "low",
        timeframe: "ongoing",
        reasoning: `${history.records.length} decisions recorded`,
        salt: "hist",
        explanation: "History meta-recommendation — updates as user accepts or ignores insights.",
      }),
    ],
    explainable: true,
  };
}

export function buildAllCareerEngineSections(
  context: LivingProfessionalCareerEngineContext,
  engines: CareerEngineSnapshot,
  history: CareerEngineHistoryProfile
): LivingProfessionalCareerEngineSection[] {
  return [
    buildCareerEngineSummarySection(context, engines),
    buildCurrentCareerPositionSection(context, engines),
    buildCareerReadinessSection(context, engines),
    buildCareerOpportunitiesSection(context, engines),
    buildCareerRisksSection(context, engines),
    buildCareerGrowthStrategySection(context, engines),
    buildSkillEvolutionStrategySection(context, engines),
    buildFinancialCareerStrategySection(context, engines),
    buildLeadershipStrategySection(context, engines),
    buildCareerDecisionEngineSection(context, engines),
    buildRecommendedNextCareerMovesSection(context, engines),
    buildConfidenceExplanationSection(context, engines),
    buildCareerEngineHistorySection(context, engines, history),
  ];
}

export function recordCareerEngineOutcome(
  history: CareerEngineHistoryProfile,
  recordId: string,
  insightTitle: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): CareerEngineHistoryProfile {
  return {
    records: [
      ...history.records,
      { recordId, insightTitle, status, recordedAt, outcome },
    ],
    updatedAt: recordedAt,
  };
}

function recommendationToView(r: CareerRecommendation) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    priority: r.priority,
    timeframe: r.timeframe,
    reasoning: r.reasoning,
    assumptions: r.assumptions,
    required_skills: r.requiredSkills,
    expected_benefits: r.expectedBenefits,
    possible_risks: r.possibleRisks,
    alternatives: r.alternatives,
    confidence_score: r.confidenceScore,
    explanation: r.explanation,
  };
}

function engineToView(e: CareerEngineEvaluation) {
  return {
    current_career_stage: e.currentCareerStage,
    career_readiness_score: e.careerReadinessScore,
    career_growth_score: e.careerGrowthScore,
    opportunity_score: e.opportunityScore,
    leadership_score: e.leadershipScore,
    financial_growth_score: e.financialGrowthScore,
    learning_score: e.learningScore,
    career_risk_score: e.careerRiskScore,
    recommended_career_path: e.recommendedCareerPath,
    recommended_next_actions: e.recommendedNextActions,
    alternative_paths: e.alternativePaths,
    projected_next_milestones: e.projectedNextMilestones,
    overall_career_score: e.overallCareerScore,
  };
}

function sectionToView(section: LivingProfessionalCareerEngineSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
    recommendations: section.recommendations.map(recommendationToView),
  };

  switch (section.sectionId) {
    case "career_engine_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        current_career_stage: section.currentCareerStage,
        overall_career_score: section.overallCareerScore,
        assumptions: section.assumptions,
        engine: engineToView(section.engine),
      };
    case "current_career_position":
      return {
        ...base,
        position_summary: section.positionSummary,
        industry: section.industry,
        primary_skill: section.primarySkill,
        experience_years: section.experienceYears,
      };
    case "career_readiness":
      return {
        ...base,
        readiness_score: section.readinessScore,
        readiness_summary: section.readinessSummary,
      };
    case "career_opportunities":
      return {
        ...base,
        opportunity_score: section.opportunityScore,
        opportunity_summary: section.opportunitySummary,
      };
    case "career_risks":
      return {
        ...base,
        risk_score: section.riskScore,
        risk_summary: section.riskSummary,
      };
    case "career_growth_strategy":
      return {
        ...base,
        growth_score: section.growthScore,
        growth_summary: section.growthSummary,
      };
    case "skill_evolution_strategy":
      return {
        ...base,
        learning_score: section.learningScore,
        skill_summary: section.skillSummary,
      };
    case "financial_career_strategy":
      return {
        ...base,
        financial_growth_score: section.financialGrowthScore,
        currency: section.currency,
        financial_summary: section.financialSummary,
      };
    case "leadership_strategy":
      return {
        ...base,
        leadership_score: section.leadershipScore,
        leadership_summary: section.leadershipSummary,
      };
    case "career_decision_engine":
      return {
        ...base,
        decision_summary: section.decisionSummary,
        recommended_career_path: section.recommendedCareerPath,
        alternative_paths: section.alternativePaths,
        engine: engineToView(section.engine),
      };
    case "recommended_next_career_moves":
      return {
        ...base,
        next_move_summary: section.nextMoveSummary,
        projected_milestones: section.projectedMilestones,
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
    case "career_engine_history":
      return {
        ...base,
        previous_insights: section.previousInsights.map((r) => ({
          record_id: r.recordId,
          insight_title: r.insightTitle,
          status: r.status,
          recorded_at: r.recordedAt,
          outcome: r.outcome,
        })),
        accepted_insights: section.acceptedInsights.map((r) => ({
          record_id: r.recordId,
          insight_title: r.insightTitle,
          status: r.status,
          recorded_at: r.recordedAt,
          outcome: r.outcome,
        })),
        ignored_insights: section.ignoredInsights.map((r) => ({
          record_id: r.recordId,
          insight_title: r.insightTitle,
          status: r.status,
          recorded_at: r.recordedAt,
        })),
        outcome_comparison: section.outcomeComparison,
        learning_evolution: section.learningEvolution,
      };
    default:
      return base;
  }
}

export function toCareerEngineSectionView(section: LivingProfessionalCareerEngineSection) {
  return sectionToView(section);
}

export function toCareerEngineSectionsView(sections: LivingProfessionalCareerEngineSection[]) {
  return sections.map(toCareerEngineSectionView);
}

export { LIVING_SOURCES };
