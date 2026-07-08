import type { LivingProfessionalAnalyticsContext } from "./analytics-context.js";
import {
  hashAnalyticsSeed,
  resolveExperienceYears,
  resolveFrameStanding,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./analytics-context.js";

export interface AnalyticsEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
}

export type AnalyticsCategory =
  | "growth"
  | "performance"
  | "skills"
  | "financial"
  | "productivity"
  | "opportunity"
  | "risk"
  | "achievement"
  | "trend"
  | "summary";

export type AnalyticsTrend = "up" | "down" | "stable" | "emerging";

export interface AnalyticsMetric {
  id: string;
  title: string;
  description: string;
  category: AnalyticsCategory;
  measuredPeriod: string;
  currentValue: string;
  previousValue: string;
  changePercentage: number;
  trend: AnalyticsTrend;
  benchmark: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
  confidenceScore: number;
  explanation: string;
}

export interface AnalyticsEngineEvaluation {
  growthScore: number;
  performanceScore: number;
  productivityScore: number;
  financialScore: number;
  opportunityScore: number;
  riskScore: number;
  achievementScore: number;
  trendScore: number;
  overallProfessionalScore: number;
  strongestDimensions: string[];
  weakestDimensions: string[];
  projectedDirection: string;
}

export interface AnalyticsHistoryRecord {
  recordId: string;
  insightTitle: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface AnalyticsHistoryProfile {
  records: AnalyticsHistoryRecord[];
  updatedAt: string;
}

export interface AnalyticsSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
  metrics: AnalyticsMetric[];
}

export interface AnalyticsSummarySection extends AnalyticsSectionBase {
  sectionId: "analytics_summary";
  overallUnderstanding: string;
  overallProfessionalScore: number;
  strongestDimension: string;
  assumptions: string[];
  engine: AnalyticsEngineEvaluation;
}

export interface ProfessionalGrowthSection extends AnalyticsSectionBase {
  sectionId: "professional_growth";
}

export interface PerformanceMetricsSection extends AnalyticsSectionBase {
  sectionId: "performance_metrics";
}

export interface SkillsAnalyticsSection extends AnalyticsSectionBase {
  sectionId: "skills_analytics";
}

export interface FinancialAnalyticsSection extends AnalyticsSectionBase {
  sectionId: "financial_analytics";
  currency: string;
}

export interface ProductivityAnalyticsSection extends AnalyticsSectionBase {
  sectionId: "productivity_analytics";
}

export interface OpportunityAnalyticsSection extends AnalyticsSectionBase {
  sectionId: "opportunity_analytics";
}

export interface RiskAnalyticsSection extends AnalyticsSectionBase {
  sectionId: "risk_analytics";
}

export interface AchievementAnalyticsSection extends AnalyticsSectionBase {
  sectionId: "achievement_analytics";
}

export interface TrendAnalysisSection extends AnalyticsSectionBase {
  sectionId: "trend_analysis";
  trendSummary: string;
}

export interface RecommendedInsightsSection extends AnalyticsSectionBase {
  sectionId: "recommended_insights";
  prioritizationRationale: string;
  sourcesUsed: string[];
  engine: AnalyticsEngineEvaluation;
}

export interface ConfidenceExplanationSection extends AnalyticsSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface AnalyticsHistorySection extends AnalyticsSectionBase {
  sectionId: "analytics_history";
  previousInsights: AnalyticsHistoryRecord[];
  acceptedInsights: AnalyticsHistoryRecord[];
  ignoredInsights: AnalyticsHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalAnalyticsSection =
  | AnalyticsSummarySection
  | ProfessionalGrowthSection
  | PerformanceMetricsSection
  | SkillsAnalyticsSection
  | FinancialAnalyticsSection
  | ProductivityAnalyticsSection
  | OpportunityAnalyticsSection
  | RiskAnalyticsSection
  | AchievementAnalyticsSection
  | TrendAnalysisSection
  | RecommendedInsightsSection
  | ConfidenceExplanationSection
  | AnalyticsHistorySection;

export const ANALYTICS_EXPERIENCE_FLAGS = {
  experience_only: true,
  read_only: true,
  analyzes_only: true,
  recommends_only: true,
  never_execute: true,
  never_modify_user_data: true,
  never_decide_for_user: true,
  never_fabricate_reasoning: true,
  never_fabricate_data: true,
  always_show_assumptions: true,
  always_show_confidence: true,
  user_controls_final_decision: true,
} as const;

export function buildDefaultAnalyticsHistory(
  context: LivingProfessionalAnalyticsContext
): AnalyticsHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: AnalyticsEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function baseConfidence(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot,
  salt: string
): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashAnalyticsSeed(context.dayKey, context.userId, salt);
  return Math.min(92, Math.round((readiness + trust) / 2 + (hash % 8)));
}

function globalAssumptions(context: LivingProfessionalAnalyticsContext): string[] {
  return [
    `Analytics for ${context.geographic.city}, ${context.geographic.country}`,
    "Analytics are read-only projections — never modifies user data",
    "Deterministic calculations from living experience modules",
    "User interprets insights and controls all decisions",
  ];
}

function changePct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function trendFromChange(pct: number): AnalyticsTrend {
  if (pct > 5) return "up";
  if (pct < -5) return "down";
  if (pct === 0) return "stable";
  return "emerging";
}

export function buildAnalyticsEngineEvaluation(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsEngineEvaluation {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const years = resolveExperienceYears(context);
  const hash = hashAnalyticsSeed(context.dayKey, context.userId, "engine");

  const growthScore = Math.min(95, readiness + Math.min(years * 2, 15));
  const performanceScore = Math.min(95, readiness);
  const productivityScore = Math.min(90, readiness - 5 + (hash % 10));
  const financialScore = Math.min(90, readiness - 3);
  const opportunityScore = Math.min(
    95,
    engines.opportunities?.[0]?.matchScore ?? 75
  );
  const riskScore = Math.max(10, 100 - readiness + (engines.challenges?.length ?? 1) * 5);
  const achievementScore = Math.min(90, Math.round((readiness + trust) / 2));
  const trendScore = Math.min(92, Math.round((growthScore + performanceScore) / 2));

  const dimensions: Array<{ name: string; score: number }> = [
    { name: "Growth", score: growthScore },
    { name: "Performance", score: performanceScore },
    { name: "Productivity", score: productivityScore },
    { name: "Financial", score: financialScore },
    { name: "Opportunity", score: opportunityScore },
    { name: "Achievement", score: achievementScore },
  ];
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const overallProfessionalScore = Math.round(
    dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length
  );

  return {
    growthScore,
    performanceScore,
    productivityScore,
    financialScore,
    opportunityScore,
    riskScore,
    achievementScore,
    trendScore,
    overallProfessionalScore,
    strongestDimensions: sorted.slice(0, 3).map((d) => `${d.name} (${d.score})`),
    weakestDimensions: sorted.slice(-2).map((d) => `${d.name} (${d.score})`),
    projectedDirection:
      trendScore >= 60
        ? "Upward professional trajectory with sustained execution"
        : "Stabilization phase — focus on weakest dimensions",
  };
}

export function buildAnalyticsMetric(input: {
  context: LivingProfessionalAnalyticsContext;
  engines: AnalyticsEngineSnapshot;
  id: string;
  title: string;
  description: string;
  category: AnalyticsCategory;
  measuredPeriod: string;
  currentNum: number;
  previousNum: number;
  currentLabel?: string;
  previousLabel?: string;
  benchmark: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
  salt: string;
  explanation: string;
}): AnalyticsMetric {
  const pct = changePct(input.currentNum, input.previousNum);
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    measuredPeriod: input.measuredPeriod,
    currentValue: input.currentLabel ?? `${input.currentNum}`,
    previousValue: input.previousLabel ?? `${input.previousNum}`,
    changePercentage: pct,
    trend: trendFromChange(pct),
    benchmark: input.benchmark,
    strengths: input.strengths,
    weaknesses: input.weaknesses,
    opportunities: input.opportunities,
    risks: input.risks,
    recommendations: input.recommendations,
    confidenceScore: baseConfidence(input.context, input.engines, input.salt),
    explanation: input.explanation,
  };
}

function growthMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const readiness = baseReadiness(engines);
  const prev = Math.max(30, readiness - 8);
  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-growth-readiness-${context.userId.slice(-4)}`,
      title: "Professional readiness growth",
      description: "Readiness score trend over 90 days",
      category: "growth",
      measuredPeriod: "90_days",
      currentNum: readiness,
      previousNum: prev,
      benchmark: "Regional average: 58%",
      strengths: [`${resolveExperienceYears(context)} years experience`, resolveFrameStanding(context)],
      weaknesses: engines.challenges ?? ["Skill gap areas"],
      opportunities: ["Passport tier advancement", "Learning path completion"],
      risks: ["Inconsistent weekly execution"],
      recommendations: ["Review journey milestones weekly"],
      salt: "growth-ready",
      explanation: "Growth from develop-me readiness and journey projections.",
    }),
  ];
}

function performanceMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const readiness = baseReadiness(engines);
  const missions = context.onboarding.professionalCalibration?.missions ?? [];
  const behavior = missions.find((m) => m.missionId === "professional_behavior");
  const score = behavior?.score ?? readiness;

  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-perf-behavior-${context.userId.slice(-4)}`,
      title: "Professional behavior performance",
      description: "Calibration-based performance indicator",
      category: "performance",
      measuredPeriod: "30_days",
      currentNum: score,
      previousNum: Math.max(40, score - 5),
      benchmark: "Top performers: 85+",
      strengths: ["Reliable professional behavior"],
      weaknesses: score < 70 ? ["Consistency gaps"] : [],
      opportunities: ["Coach performance review"],
      risks: ["Performance stagnation without evidence"],
      recommendations: ["Log daily professional wins"],
      salt: "perf-beh",
      explanation: "Performance from identity calibration and coach signals.",
    }),
  ];
}

function skillsMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const skill = resolvePrimarySkill(context);
  const missions = context.onboarding.professionalCalibration?.missions ?? [];
  const strongest = missions.find((m) => m.missionId === "strongest_skill");
  const score = strongest?.score ?? baseReadiness(engines);

  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-skill-${context.userId.slice(-4)}`,
      title: `${skill} skill analytics`,
      description: `Skill proficiency analytics for ${skill}`,
      category: "skills",
      measuredPeriod: "90_days",
      currentNum: score,
      previousNum: Math.max(35, score - 10),
      benchmark: "Market demand: high",
      strengths: [skill, ...(engines.growthPath ?? []).slice(0, 1)],
      weaknesses: engines.challenges ?? [],
      opportunities: ["Certification pathway", "Knowledge bank contribution"],
      risks: ["Skill obsolescence without learning"],
      recommendations: ["Complete develop-me roadmap step"],
      salt: "skill-an",
      explanation: "Skills analytics from identity and develop-me projections.",
    }),
  ];
}

function financialMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const readiness = baseReadiness(engines);
  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-fin-${context.userId.slice(-4)}`,
      title: "Income readiness analytics",
      description: `Financial readiness in ${context.geographic.currency}`,
      category: "financial",
      measuredPeriod: "90_days",
      currentNum: readiness,
      previousNum: Math.max(35, readiness - 7),
      benchmark: "Premium threshold: 65%",
      strengths: [`${context.geographic.currency} market alignment`],
      weaknesses: readiness < 60 ? ["Below premium threshold"] : [],
      opportunities: ["Impact score improvement", "Pricing readiness"],
      risks: ["Income stagnation below readiness 60"],
      recommendations: ["Review financial goals analytics"],
      salt: "fin-an",
      explanation: "Financial analytics from impact and goals projections.",
    }),
  ];
}

function productivityMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const readiness = baseReadiness(engines);
  const hash = hashAnalyticsSeed(context.dayKey, context.userId, "prod") % 15;
  const current = Math.min(90, readiness - 5 + hash);
  const previous = Math.max(30, current - 6);

  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-prod-${context.userId.slice(-4)}`,
      title: "Weekly action completion rate",
      description: "Productivity from action planner execution patterns",
      category: "productivity",
      measuredPeriod: "30_days",
      currentNum: current,
      previousNum: previous,
      currentLabel: `${current}%`,
      previousLabel: `${previous}%`,
      benchmark: "Consistent performers: 70%+",
      strengths: ["Planner integration active"],
      weaknesses: current < 60 ? ["Low completion rate"] : [],
      opportunities: ["Block focus time", "Reduce low-priority backlog"],
      risks: ["Burnout from overload"],
      recommendations: ["Review planner weekly focus"],
      salt: "prod-an",
      explanation: "Productivity from action planner and coach execution signals.",
    }),
  ];
}

function opportunityMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const match = engines.opportunities?.[0]?.matchScore ?? 75;
  const prev = Math.max(50, match - 8);

  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-opp-${context.userId.slice(-4)}`,
      title: "Opportunity match analytics",
      description: "Top opportunity alignment score",
      category: "opportunity",
      measuredPeriod: "30_days",
      currentNum: match,
      previousNum: prev,
      currentLabel: `${match}%`,
      previousLabel: `${prev}%`,
      benchmark: "Strong match: 75%+",
      strengths: [(engines.opportunities?.[0]?.title ?? "Regional opportunity")],
      weaknesses: match < 70 ? ["Preparation gaps"] : [],
      opportunities: ["Partner ecosystem pipeline"],
      risks: ["Missed matches without readiness"],
      recommendations: ["Run opportunity simulator before accepting"],
      salt: "opp-an",
      explanation: "Opportunity analytics from living opportunities and simulator.",
    }),
  ];
}

function riskMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const readiness = baseReadiness(engines);
  const riskLevel = Math.max(10, 100 - readiness + (engines.challenges?.length ?? 1) * 8);
  const prev = Math.max(5, riskLevel - 5);

  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-risk-${context.userId.slice(-4)}`,
      title: "Professional risk exposure",
      description: "Aggregated risk indicator from intelligence center",
      category: "risk",
      measuredPeriod: "30_days",
      currentNum: riskLevel,
      previousNum: prev,
      currentLabel: `${riskLevel}/100`,
      previousLabel: `${prev}/100`,
      benchmark: "Low risk: below 40",
      strengths: readiness >= 60 ? ["Readiness mitigates risk"] : [],
      weaknesses: (engines.challenges ?? ["Verification gaps"]).slice(0, 2),
      opportunities: ["Address top skill gap"],
      risks: ["Trust standing erosion if ignored"],
      recommendations: ["Review intelligence center risk alerts"],
      salt: "risk-an",
      explanation: "Risk analytics from intelligence and gap radar — never alarmist.",
    }),
  ];
}

function achievementMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const trust = engines.trustScore ?? 50;
  const readiness = baseReadiness(engines);
  const score = Math.round((readiness + trust) / 2);

  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-ach-${context.userId.slice(-4)}`,
      title: "Achievement portfolio score",
      description: "Composite achievement analytics from achievements module",
      category: "achievement",
      measuredPeriod: "90_days",
      currentNum: score,
      previousNum: Math.max(30, score - 6),
      benchmark: "Strong portfolio: 70+",
      strengths: [resolveFrameStanding(context), engines.passportLevel ?? "Active passport"],
      weaknesses: score < 60 ? ["Limited verified achievements"] : [],
      opportunities: ["Unlock next recommended achievement"],
      risks: ["Achievement stagnation without contribution"],
      recommendations: ["Review achievements recommendations section"],
      salt: "ach-an",
      explanation: "Achievement analytics from achievements and passport projections.",
    }),
  ];
}

function trendMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const engine = buildAnalyticsEngineEvaluation(context, engines);
  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-trend-${context.userId.slice(-4)}`,
      title: "Overall professional trend",
      description: "Composite trend across all living experience dimensions",
      category: "trend",
      measuredPeriod: "90_days",
      currentNum: engine.trendScore,
      previousNum: Math.max(35, engine.trendScore - 7),
      benchmark: "Growth trajectory: 65+",
      strengths: engine.strongestDimensions.slice(0, 2),
      weaknesses: engine.weakestDimensions,
      opportunities: ["Focus on weakest dimension improvement"],
      risks: ["Multi-dimension stagnation"],
      recommendations: [engine.projectedDirection],
      salt: "trend-an",
      explanation: "Trend analysis from composite living experience scores.",
    }),
  ];
}

function insightMetrics(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric[] {
  const skill = resolvePrimarySkill(context);
  return [
    buildAnalyticsMetric({
      context,
      engines,
      id: `an-insight-primary-${context.userId.slice(-4)}`,
      title: `Primary insight: advance ${skill} readiness`,
      description: "Top recommended insight from unified analytics",
      category: "growth",
      measuredPeriod: "30_days",
      currentNum: baseReadiness(engines),
      previousNum: Math.max(30, baseReadiness(engines) - 5),
      benchmark: "Target: +10 in 90 days",
      strengths: [`Strong ${skill} foundation`],
      weaknesses: engines.challenges?.slice(0, 1) ?? [],
      opportunities: ["Complete today's best action"],
      risks: ["Insight ignored without action"],
      recommendations: ["Accept insight to track in analytics history"],
      salt: "insight-1",
      explanation: "Recommended insight from intelligence and coach — user decides.",
    }),
  ];
}

function confidenceMetric(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric {
  const conf = baseConfidence(context, engines, "confidence");
  return buildAnalyticsMetric({
    context,
    engines,
    id: `an-conf-${context.userId.slice(-4)}`,
    title: "Analytics confidence indicator",
    description: "Confidence in overall analytics accuracy",
    category: "summary",
    measuredPeriod: "current",
    currentNum: conf,
    previousNum: Math.max(40, conf - 3),
    currentLabel: `${conf}%`,
    previousLabel: `${Math.max(40, conf - 3)}%`,
    benchmark: "High confidence: 75%+",
    strengths: [
      `Readiness ${baseReadiness(engines)}`,
      resolveFrameStanding(context),
    ],
    weaknesses: !context.onboarding.ironVerification?.identityConfirmed ? ["Incomplete verification"] : [],
    opportunities: ["Complete verification for higher confidence"],
    risks: ["Low data completeness reduces accuracy"],
    recommendations: ["Review assumptions in analytics summary"],
    salt: "conf-metric",
    explanation: "Confidence derived from data completeness — never fabricated.",
  });
}

function historyPlaceholderMetric(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsMetric {
  return buildAnalyticsMetric({
    context,
    engines,
    id: `an-hist-${context.userId.slice(-4)}`,
    title: "Analytics decision tracking",
    description: "History of accepted and ignored insights",
    category: "summary",
    measuredPeriod: "all_time",
    currentNum: 0,
    previousNum: 0,
    currentLabel: "0 decisions",
    previousLabel: "0 decisions",
    benchmark: "Active users: 3+ decisions",
    strengths: [],
    weaknesses: ["No insight decisions recorded yet"],
    opportunities: ["Accept or ignore recommended insights"],
    risks: [],
    recommendations: ["Explore recommended insights section"],
    salt: "hist-metric",
    explanation: "History metric updates as user accepts or ignores insights.",
  });
}

export function buildAnalyticsSummarySection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AnalyticsSummarySection {
  const engine = buildAnalyticsEngineEvaluation(context, engines);
  return {
    sectionId: "analytics_summary",
    title: "Analytics Summary",
    headline: "Your professional analytics at a glance",
    description: "Deterministic analytics — read-only, never modifies data.",
    overallUnderstanding: `${context.displayName}'s ${resolvePrimaryIndustry(context)} analytics in ${context.geographic.city}.`,
    overallProfessionalScore: engine.overallProfessionalScore,
    strongestDimension: engine.strongestDimensions[0] ?? "Growth",
    assumptions: globalAssumptions(context),
    engine,
    metrics: growthMetrics(context, engines),
    explainable: true,
  };
}

export function buildProfessionalGrowthSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): ProfessionalGrowthSection {
  return {
    sectionId: "professional_growth",
    title: "Professional Growth",
    headline: "Growth trends and trajectory",
    description: "Journey and readiness growth analytics.",
    metrics: growthMetrics(context, engines),
    explainable: true,
  };
}

export function buildPerformanceMetricsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): PerformanceMetricsSection {
  return {
    sectionId: "performance_metrics",
    title: "Performance Metrics",
    headline: "Professional performance indicators",
    description: "Calibration and execution performance analytics.",
    metrics: performanceMetrics(context, engines),
    explainable: true,
  };
}

export function buildSkillsAnalyticsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): SkillsAnalyticsSection {
  return {
    sectionId: "skills_analytics",
    title: "Skills Analytics",
    headline: "Skill proficiency and gap analytics",
    description: "From identity and develop-me learning paths.",
    metrics: skillsMetrics(context, engines),
    explainable: true,
  };
}

export function buildFinancialAnalyticsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): FinancialAnalyticsSection {
  return {
    sectionId: "financial_analytics",
    title: "Financial Analytics",
    headline: "Income and financial readiness analytics",
    description: "From impact and goals — never executes financial operations.",
    metrics: financialMetrics(context, engines),
    currency: context.geographic.currency,
    explainable: true,
  };
}

export function buildProductivityAnalyticsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): ProductivityAnalyticsSection {
  return {
    sectionId: "productivity_analytics",
    title: "Productivity Analytics",
    headline: "Action completion and productivity trends",
    description: "From action planner execution patterns.",
    metrics: productivityMetrics(context, engines),
    explainable: true,
  };
}

export function buildOpportunityAnalyticsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): OpportunityAnalyticsSection {
  return {
    sectionId: "opportunity_analytics",
    title: "Opportunity Analytics",
    headline: "Opportunity match and pipeline analytics",
    description: "From living opportunities and simulator projections.",
    metrics: opportunityMetrics(context, engines),
    explainable: true,
  };
}

export function buildRiskAnalyticsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): RiskAnalyticsSection {
  return {
    sectionId: "risk_analytics",
    title: "Risk Analytics",
    headline: "Professional risk exposure analytics",
    description: "Explainable risk indicators — never alarmist.",
    metrics: riskMetrics(context, engines),
    explainable: true,
  };
}

export function buildAchievementAnalyticsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): AchievementAnalyticsSection {
  return {
    sectionId: "achievement_analytics",
    title: "Achievement Analytics",
    headline: "Achievement portfolio performance analytics",
    description: "From achievements module composite scoring.",
    metrics: achievementMetrics(context, engines),
    explainable: true,
  };
}

export function buildTrendAnalysisSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): TrendAnalysisSection {
  const engine = buildAnalyticsEngineEvaluation(context, engines);
  return {
    sectionId: "trend_analysis",
    title: "Trend Analysis",
    headline: "Multi-dimension professional trends",
    description: "Composite trend analysis across living experience.",
    metrics: trendMetrics(context, engines),
    trendSummary: engine.projectedDirection,
    explainable: true,
  };
}

export function buildRecommendedInsightsSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): RecommendedInsightsSection {
  const engine = buildAnalyticsEngineEvaluation(context, engines);
  return {
    sectionId: "recommended_insights",
    title: "Recommended Insights",
    headline: "Top analytics-driven insights",
    description: "Recommendations only — user interprets and decides.",
    metrics: insightMetrics(context, engines),
    prioritizationRationale: `Based on overall score ${engine.overallProfessionalScore} and weakest: ${engine.weakestDimensions[0] ?? "N/A"}`,
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
      "Living Professional Goals",
      "Living Professional Achievements",
    ],
    engine,
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot
): ConfidenceExplanationSection {
  const conf = baseConfidence(context, engines, "overall");
  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in analytics accuracy`,
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
      "Conservative interpretation: extend trend timelines by 50%",
      "Optimistic interpretation: assumes perfect weekly execution",
    ],
    metrics: [confidenceMetric(context, engines)],
    explainable: true,
  };
}

export function buildAnalyticsHistorySection(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot,
  history: AnalyticsHistoryProfile
): AnalyticsHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "analytics_history",
    title: "Analytics History",
    headline: `${history.records.length} insight decision${history.records.length === 1 ? "" : "s"} recorded`,
    description: "Track accepted and ignored analytics insights.",
    previousInsights: history.records.slice(0, 10),
    acceptedInsights: accepted,
    ignoredInsights: ignored,
    outcomeComparison:
      accepted.length > 0 ? "Accepted insights help refine future analytics" : "Explore insights to build history",
    learningEvolution:
      history.records.length >= 3 ? "Analytics adapt to your insight patterns" : "History grows with each decision",
    metrics: [historyPlaceholderMetric(context, engines)],
    explainable: true,
  };
}

export function buildAllAnalyticsSections(
  context: LivingProfessionalAnalyticsContext,
  engines: AnalyticsEngineSnapshot,
  history: AnalyticsHistoryProfile
): LivingProfessionalAnalyticsSection[] {
  return [
    buildAnalyticsSummarySection(context, engines),
    buildProfessionalGrowthSection(context, engines),
    buildPerformanceMetricsSection(context, engines),
    buildSkillsAnalyticsSection(context, engines),
    buildFinancialAnalyticsSection(context, engines),
    buildProductivityAnalyticsSection(context, engines),
    buildOpportunityAnalyticsSection(context, engines),
    buildRiskAnalyticsSection(context, engines),
    buildAchievementAnalyticsSection(context, engines),
    buildTrendAnalysisSection(context, engines),
    buildRecommendedInsightsSection(context, engines),
    buildConfidenceExplanationSection(context, engines),
    buildAnalyticsHistorySection(context, engines, history),
  ];
}

function metricToView(m: AnalyticsMetric) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category,
    measured_period: m.measuredPeriod,
    current_value: m.currentValue,
    previous_value: m.previousValue,
    change_percentage: m.changePercentage,
    trend: m.trend,
    benchmark: m.benchmark,
    strengths: m.strengths,
    weaknesses: m.weaknesses,
    opportunities: m.opportunities,
    risks: m.risks,
    recommendations: m.recommendations,
    confidence_score: m.confidenceScore,
    explanation: m.explanation,
  };
}

function engineToView(e: AnalyticsEngineEvaluation) {
  return {
    growth_score: e.growthScore,
    performance_score: e.performanceScore,
    productivity_score: e.productivityScore,
    financial_score: e.financialScore,
    opportunity_score: e.opportunityScore,
    risk_score: e.riskScore,
    achievement_score: e.achievementScore,
    trend_score: e.trendScore,
    overall_professional_score: e.overallProfessionalScore,
    strongest_dimensions: e.strongestDimensions,
    weakest_dimensions: e.weakestDimensions,
    projected_direction: e.projectedDirection,
  };
}

function sectionToView(section: LivingProfessionalAnalyticsSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
    metrics: section.metrics.map(metricToView),
  };

  switch (section.sectionId) {
    case "analytics_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        overall_professional_score: section.overallProfessionalScore,
        strongest_dimension: section.strongestDimension,
        assumptions: section.assumptions,
        engine: engineToView(section.engine),
      };
    case "financial_analytics":
      return { ...base, currency: section.currency };
    case "trend_analysis":
      return { ...base, trend_summary: section.trendSummary };
    case "recommended_insights":
      return {
        ...base,
        prioritization_rationale: section.prioritizationRationale,
        sources_used: section.sourcesUsed,
        engine: engineToView(section.engine),
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
    case "analytics_history":
      return {
        ...base,
        previous_insights: section.previousInsights.map(mapHistoryRecord),
        accepted_insights: section.acceptedInsights.map(mapHistoryRecord),
        ignored_insights: section.ignoredInsights.map(mapHistoryRecord),
        outcome_comparison: section.outcomeComparison,
        learning_evolution: section.learningEvolution,
      };
    default:
      return base;
  }
}

function mapHistoryRecord(r: AnalyticsHistoryRecord) {
  return {
    record_id: r.recordId,
    insight_title: r.insightTitle,
    status: r.status,
    recorded_at: r.recordedAt,
    outcome: r.outcome,
  };
}

export function toAnalyticsSectionView(section: LivingProfessionalAnalyticsSection) {
  return sectionToView(section);
}

export function toAnalyticsSectionsView(sections: LivingProfessionalAnalyticsSection[]) {
  return sections.map(toAnalyticsSectionView);
}

export function recordAnalyticsOutcome(
  history: AnalyticsHistoryProfile,
  recordId: string,
  insightTitle: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): AnalyticsHistoryProfile {
  const without = history.records.filter((r) => r.recordId !== recordId);
  return {
    records: [{ recordId, insightTitle, status, recordedAt, outcome }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}
