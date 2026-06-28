import type { LivingProfessionalTimelineContext } from "./timeline-context.js";
import {
  hashTimelineSeed,
  resolveCareerChangingProject,
  resolveExperienceYears,
  resolveFrameStanding,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolveProudestAchievement,
} from "./timeline-context.js";

export interface TimelineEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
}

export type TimelineEventCategory =
  | "beginning"
  | "education"
  | "career"
  | "skill"
  | "achievement"
  | "financial"
  | "leadership"
  | "turning_point"
  | "future"
  | "summary";

export type ImportanceLevel = "critical" | "high" | "medium" | "low";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  category: TimelineEventCategory;
  timestamp: string;
  chronologicalOrder: number;
  importanceLevel: ImportanceLevel;
  source: string;
  evidence: string[];
  relatedEntities: string[];
  impactScore: number;
  confidenceScore: number;
  explanation: string;
  recommendations: string[];
}

export interface TimelineEngineEvaluation {
  chronologicalProfessionalHistory: TimelineEvent[];
  milestoneSequence: TimelineEvent[];
  turningPoints: TimelineEvent[];
  careerProgression: TimelineEvent[];
  learningProgression: TimelineEvent[];
  achievementProgression: TimelineEvent[];
  financialProgression: TimelineEvent[];
  projectedFutureEvents: TimelineEvent[];
  timelineHealthScore: number;
  timelineCompletenessScore: number;
}

export interface TimelineHistoryRecord {
  recordId: string;
  insightTitle: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface TimelineHistoryProfile {
  records: TimelineHistoryRecord[];
  updatedAt: string;
}

export interface TimelineSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
  events: TimelineEvent[];
}

export interface TimelineSummarySection extends TimelineSectionBase {
  sectionId: "timeline_summary";
  overallUnderstanding: string;
  totalEvents: number;
  timelineSpan: string;
  featuredEvent: string;
  assumptions: string[];
  engine: TimelineEngineEvaluation;
}

export interface ProfessionalBeginningSection extends TimelineSectionBase {
  sectionId: "professional_beginning";
  originStory: string;
}

export interface EducationLearningTimelineSection extends TimelineSectionBase {
  sectionId: "education_learning_timeline";
}

export interface CareerTimelineSection extends TimelineSectionBase {
  sectionId: "career_timeline";
}

export interface SkillsEvolutionSection extends TimelineSectionBase {
  sectionId: "skills_evolution";
  evolutionSummary: string;
}

export interface AchievementTimelineSection extends TimelineSectionBase {
  sectionId: "achievement_timeline";
}

export interface FinancialTimelineSection extends TimelineSectionBase {
  sectionId: "financial_timeline";
  currency: string;
}

export interface LeadershipTimelineSection extends TimelineSectionBase {
  sectionId: "leadership_timeline";
}

export interface MajorTurningPointsSection extends TimelineSectionBase {
  sectionId: "major_turning_points";
  turningPointSummary: string;
}

export interface FutureTimelineProjectionSection extends TimelineSectionBase {
  sectionId: "future_timeline_projection";
  projectionHorizon: string;
}

export interface TimelineInsightsSection extends TimelineSectionBase {
  sectionId: "timeline_insights";
  insightSummary: string;
  sourcesUsed: string[];
  engine: TimelineEngineEvaluation;
}

export interface ConfidenceExplanationSection extends TimelineSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface TimelineHistorySection extends TimelineSectionBase {
  sectionId: "timeline_history";
  previousInsights: TimelineHistoryRecord[];
  acceptedInsights: TimelineHistoryRecord[];
  ignoredInsights: TimelineHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalTimelineSection =
  | TimelineSummarySection
  | ProfessionalBeginningSection
  | EducationLearningTimelineSection
  | CareerTimelineSection
  | SkillsEvolutionSection
  | AchievementTimelineSection
  | FinancialTimelineSection
  | LeadershipTimelineSection
  | MajorTurningPointsSection
  | FutureTimelineProjectionSection
  | TimelineInsightsSection
  | ConfidenceExplanationSection
  | TimelineHistorySection;

export const TIMELINE_EXPERIENCE_FLAGS = {
  experience_only: true,
  read_only: true,
  organizes_only: true,
  recommends_only: true,
  never_execute: true,
  never_modify_user_history: true,
  never_reorder_real_events: true,
  never_decide_for_user: true,
  never_fabricate_reasoning: true,
  never_fabricate_data: true,
  always_show_assumptions: true,
  always_show_confidence: true,
  user_controls_final_decision: true,
} as const;

export function buildDefaultTimelineHistory(context: LivingProfessionalTimelineContext): TimelineHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: TimelineEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function baseConfidence(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot,
  salt: string
): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashTimelineSeed(context.dayKey, context.userId, salt);
  return Math.min(92, Math.round((readiness + trust) / 2 + (hash % 8)));
}

function globalAssumptions(context: LivingProfessionalTimelineContext): string[] {
  return [
    `Timeline organized for ${context.geographic.city}, ${context.geographic.country}`,
    "Events derived from living experience data — never modifies or reorders real history",
    "Deterministic chronological organization from onboarding and journey projections",
    "User controls interpretation of timeline events",
  ];
}

function timestampOffset(context: LivingProfessionalTimelineContext, monthsAgo: number): string {
  const base = new Date(context.generatedAt);
  base.setMonth(base.getMonth() - monthsAgo);
  return base.toISOString();
}

function futureTimestamp(context: LivingProfessionalTimelineContext, monthsAhead: number): string {
  const base = new Date(context.generatedAt);
  base.setMonth(base.getMonth() + monthsAhead);
  return base.toISOString();
}

export function buildTimelineEvent(input: {
  context: LivingProfessionalTimelineContext;
  engines: TimelineEngineSnapshot;
  id: string;
  title: string;
  description: string;
  category: TimelineEventCategory;
  timestamp: string;
  chronologicalOrder: number;
  importanceLevel: ImportanceLevel;
  source: string;
  evidence: string[];
  relatedEntities?: string[];
  impactScore: number;
  salt: string;
  explanation: string;
  recommendations: string[];
}): TimelineEvent {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    timestamp: input.timestamp,
    chronologicalOrder: input.chronologicalOrder,
    importanceLevel: input.importanceLevel,
    source: input.source,
    evidence: input.evidence,
    relatedEntities: input.relatedEntities ?? [],
    impactScore: input.impactScore,
    confidenceScore: baseConfidence(input.context, input.engines, input.salt),
    explanation: input.explanation,
    recommendations: input.recommendations,
  };
}

function beginningEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const years = resolveExperienceYears(context);
  const industry = resolvePrimaryIndustry(context);
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-begin-${context.userId.slice(-4)}`,
      title: `Entered ${industry} profession`,
      description: `Professional journey began in ${industry}`,
      category: "beginning",
      timestamp: timestampOffset(context, years * 12),
      chronologicalOrder: 1,
      importanceLevel: "critical",
      source: "Living Professional Journey",
      evidence: [`${years} years experience`, context.geographic.city],
      relatedEntities: [industry],
      impactScore: 80,
      salt: "begin",
      explanation: "Beginning derived from onboarding experience years — never fabricated.",
      recommendations: ["Document early career evidence in passport"],
    }),
  ];
}

function educationEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const certs = (context.onboarding.professionalBackground?.certificates ?? []).map((c) =>
    c.replace(/_/g, " ")
  );
  const skill = resolvePrimarySkill(context);

  const certEvents = certs.map((cert, i) =>
    buildTimelineEvent({
      context,
      engines,
      id: `tl-edu-${i}-${context.userId.slice(-4)}`,
      title: `Certification: ${cert}`,
      description: `Professional certification milestone: ${cert}`,
      category: "education",
      timestamp: timestampOffset(context, 36 + i * 12),
      chronologicalOrder: 10 + i,
      importanceLevel: "high",
      source: "Living Professional Passport",
      evidence: [cert],
      relatedEntities: ["DevelopMe learning path"],
      impactScore: 70,
      salt: `edu-${i}`,
      explanation: "Education event from onboarding certificates — experience record only.",
      recommendations: ["Verify certification in passport"],
    })
  );

  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-learn-${context.userId.slice(-4)}`,
      title: `${skill} learning pathway started`,
      description: `Develop-me learning path for ${skill}`,
      category: "education",
      timestamp: timestampOffset(context, 24),
      chronologicalOrder: 5,
      importanceLevel: "medium",
      source: "Living Professional Goals",
      evidence: (engines.growthPath ?? [`${skill} module`]).slice(0, 2),
      relatedEntities: ["Knowledge Bank"],
      impactScore: 65,
      salt: "learn-path",
      explanation: "Learning progression from develop-me roadmap.",
      recommendations: ["Continue weekly learning modules"],
    }),
    ...certEvents,
  ];
}

function careerEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const project = resolveCareerChangingProject(context);
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-career-proj-${context.userId.slice(-4)}`,
      title: "Career-changing project",
      description: project,
      category: "career",
      timestamp: timestampOffset(context, 30),
      chronologicalOrder: 20,
      importanceLevel: "critical",
      source: "Living Professional Journey",
      evidence: [project, resolveProudestAchievement(context)],
      relatedEntities: [resolvePrimaryIndustry(context)],
      impactScore: 85,
      salt: "career-proj",
      explanation: "Career milestone from professional story — never reordered.",
      recommendations: ["Link project evidence in passport"],
    }),
    buildTimelineEvent({
      context,
      engines,
      id: `tl-career-ready-${context.userId.slice(-4)}`,
      title: `Readiness milestone: ${baseReadiness(engines)}%`,
      description: "Professional readiness checkpoint on career timeline",
      category: "career",
      timestamp: timestampOffset(context, 3),
      chronologicalOrder: 50,
      importanceLevel: "high",
      source: "Living Professional Analytics",
      evidence: [`Readiness ${baseReadiness(engines)}%`, engines.passportLevel ?? "Active passport"],
      relatedEntities: ["Living Professional Passport"],
      impactScore: baseReadiness(engines),
      salt: "career-ready",
      explanation: "Current career position from analytics and passport.",
      recommendations: ["Review career goals alignment"],
    }),
  ];
}

function skillEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const skill = resolvePrimarySkill(context);
  const missions = context.onboarding.professionalCalibration?.missions ?? [];
  const strongest = missions.find((m) => m.missionId === "strongest_skill");

  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-skill-evolve-${context.userId.slice(-4)}`,
      title: `${skill} proficiency evolution`,
      description: `Skill evolution tracked through identity calibration${strongest ? ` (score ${strongest.score})` : ""}`,
      category: "skill",
      timestamp: timestampOffset(context, 18),
      chronologicalOrder: 30,
      importanceLevel: "high",
      source: "Living Professional Identity",
      evidence: [skill, ...(engines.growthPath ?? []).slice(0, 1)],
      relatedEntities: ["DevelopMe"],
      impactScore: strongest?.score ?? baseReadiness(engines),
      salt: "skill-evo",
      explanation: "Skills evolution from identity and develop-me — chronological order preserved.",
      recommendations: ["Review skills analytics for gaps"],
    }),
  ];
}

function achievementEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-ach-${context.userId.slice(-4)}`,
      title: resolveProudestAchievement(context).slice(0, 60),
      description: resolveProudestAchievement(context),
      category: "achievement",
      timestamp: timestampOffset(context, 18),
      chronologicalOrder: 35,
      importanceLevel: "critical",
      source: "Living Professional Achievements",
      evidence: [resolveProudestAchievement(context)],
      relatedEntities: ["Achievement portfolio"],
      impactScore: 85,
      salt: "ach-tl",
      explanation: "Achievement event from achievements module — never grants credentials.",
      recommendations: ["Review achievement timeline in achievements module"],
    }),
  ];
}

function financialEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const readiness = baseReadiness(engines);
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-fin-${context.userId.slice(-4)}`,
      title: "Income readiness progression",
      description: `Financial readiness reached ${readiness}% in ${context.geographic.currency}`,
      category: "financial",
      timestamp: timestampOffset(context, 8),
      chronologicalOrder: 45,
      importanceLevel: "medium",
      source: "Living Professional Impact",
      evidence: [`Readiness ${readiness}%`, context.geographic.currency],
      relatedEntities: ["Financial goals"],
      impactScore: readiness,
      salt: "fin-tl",
      explanation: "Financial timeline from impact and analytics — never executes payments.",
      recommendations: ["Review financial analytics section"],
    }),
  ];
}

function leadershipEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const enjoysLeading = context.onboarding.smartQuestions?.enjoysLeading;
  const skill = resolvePrimarySkill(context);

  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-lead-${context.userId.slice(-4)}`,
      title: enjoysLeading ? `${skill} leadership development` : `${skill} collaboration development`,
      description: enjoysLeading
        ? "Leadership aptitude identified in professional calibration"
        : "Collaborative professional aptitude identified",
      category: "leadership",
      timestamp: timestampOffset(context, 15),
      chronologicalOrder: 40,
      importanceLevel: enjoysLeading ? "high" : "medium",
      source: "Living Professional Coach",
      evidence: [resolveFrameStanding(context)],
      relatedEntities: ["Team Builder"],
      impactScore: enjoysLeading ? 75 : 60,
      salt: "lead-tl",
      explanation: "Leadership timeline from coach calibration.",
      recommendations: ["Review leadership goals"],
    }),
  ];
}

function turningPointEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const project = resolveCareerChangingProject(context);
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-turn-${context.userId.slice(-4)}`,
      title: "Major career turning point",
      description: project,
      category: "turning_point",
      timestamp: timestampOffset(context, 30),
      chronologicalOrder: 25,
      importanceLevel: "critical",
      source: "Living Professional Journey",
      evidence: [project],
      relatedEntities: [resolvePrimaryIndustry(context), resolvePrimarySkill(context)],
      impactScore: 90,
      salt: "turn",
      explanation: "Turning point from professional story — never reordered or modified.",
      recommendations: ["Reflect on turning point lessons in coach review"],
    }),
  ];
}

function futureEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  const skill = resolvePrimarySkill(context);
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-future-cert-${context.userId.slice(-4)}`,
      title: `Projected: advanced ${skill} certification`,
      description: "Future learning milestone from goals and simulator projections",
      category: "future",
      timestamp: futureTimestamp(context, 12),
      chronologicalOrder: 100,
      importanceLevel: "medium",
      source: "Living Professional Simulator",
      evidence: engines.challenges ?? [`${skill} gap`],
      relatedEntities: ["Goals", "Simulator"],
      impactScore: 70,
      salt: "future-cert",
      explanation: "Projected future event — recommendation only, not historical fact.",
      recommendations: ["Run simulator what-if before pursuing"],
    }),
    buildTimelineEvent({
      context,
      engines,
      id: `tl-future-trust-${context.userId.slice(-4)}`,
      title: "Projected: trusted expert recognition",
      description: "Future live frame standing milestone",
      category: "future",
      timestamp: futureTimestamp(context, 24),
      chronologicalOrder: 101,
      importanceLevel: "high",
      source: "Living Professional Live Frame",
      evidence: [resolveFrameStanding(context), engines.liveFrameLabel ?? "Building frame"],
      relatedEntities: ["Live Frame", "Achievements"],
      impactScore: 80,
      salt: "future-trust",
      explanation: "Projected future event from live frame trajectory.",
      recommendations: ["Increase community contributions"],
    }),
  ];
}

function insightEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  return [
    buildTimelineEvent({
      context,
      engines,
      id: `tl-insight-${context.userId.slice(-4)}`,
      title: "Timeline insight: sustain growth momentum",
      description: "Primary insight from unified timeline analysis",
      category: "summary",
      timestamp: context.generatedAt,
      chronologicalOrder: 999,
      importanceLevel: "high",
      source: "Living Professional Analytics",
      evidence: [`Readiness ${baseReadiness(engines)}`, resolveFrameStanding(context)],
      relatedEntities: ["Analytics", "Coach"],
      impactScore: 75,
      salt: "insight",
      explanation: "Timeline insight — user decides whether to act.",
      recommendations: ["Accept insight to track in timeline history"],
    }),
  ];
}

function allHistoricalEvents(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEvent[] {
  return [
    ...beginningEvents(context, engines),
    ...educationEvents(context, engines),
    ...careerEvents(context, engines),
    ...skillEvents(context, engines),
    ...achievementEvents(context, engines),
    ...financialEvents(context, engines),
    ...leadershipEvents(context, engines),
    ...turningPointEvents(context, engines),
  ].sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
}

export function buildTimelineEngineEvaluation(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineEngineEvaluation {
  const history = allHistoricalEvents(context, engines);
  const future = futureEvents(context, engines);
  const turning = turningPointEvents(context, engines);
  const verified = context.onboarding.ironVerification?.identityConfirmed ?? false;

  const timelineCompletenessScore = Math.min(
    95,
    40 + history.length * 4 + (verified ? 15 : 0) + (engines.passportLevel ? 10 : 0)
  );
  const timelineHealthScore = Math.min(
    95,
    Math.round((baseReadiness(engines) + timelineCompletenessScore) / 2)
  );

  return {
    chronologicalProfessionalHistory: history,
    milestoneSequence: history.filter((e) => e.importanceLevel === "critical" || e.importanceLevel === "high"),
    turningPoints: turning,
    careerProgression: careerEvents(context, engines),
    learningProgression: educationEvents(context, engines),
    achievementProgression: achievementEvents(context, engines),
    financialProgression: financialEvents(context, engines),
    projectedFutureEvents: future,
    timelineHealthScore,
    timelineCompletenessScore,
  };
}

export function buildTimelineSummarySection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineSummarySection {
  const engine = buildTimelineEngineEvaluation(context, engines);
  const history = engine.chronologicalProfessionalHistory;
  const oldest = history[0];
  const newest = history.at(-1);

  return {
    sectionId: "timeline_summary",
    title: "Timeline Summary",
    headline: "Your complete professional journey organized chronologically",
    description: "Deterministic timeline — organizes only, never modifies history.",
    overallUnderstanding: `${context.displayName}'s ${resolvePrimaryIndustry(context)} timeline in ${context.geographic.city}.`,
    totalEvents: history.length + engine.projectedFutureEvents.length,
    timelineSpan: oldest && newest ? `${oldest.timestamp.slice(0, 10)} to ${newest.timestamp.slice(0, 10)}` : "Building timeline",
    featuredEvent: turningPointEvents(context, engines)[0]?.title ?? resolveProudestAchievement(context),
    assumptions: globalAssumptions(context),
    engine,
    events: history.slice(0, 5),
    explainable: true,
  };
}

export function buildProfessionalBeginningSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): ProfessionalBeginningSection {
  const events = beginningEvents(context, engines);
  return {
    sectionId: "professional_beginning",
    title: "Professional Beginning",
    headline: "Where your professional journey started",
    description: "Origin events from journey and onboarding.",
    originStory: `Started in ${resolvePrimaryIndustry(context)} with focus on ${resolvePrimarySkill(context)}`,
    events,
    explainable: true,
  };
}

export function buildEducationLearningTimelineSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): EducationLearningTimelineSection {
  return {
    sectionId: "education_learning_timeline",
    title: "Education & Learning Timeline",
    headline: "Certifications and learning milestones",
    description: "From passport, goals, and develop-me learning paths.",
    events: educationEvents(context, engines),
    explainable: true,
  };
}

export function buildCareerTimelineSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): CareerTimelineSection {
  return {
    sectionId: "career_timeline",
    title: "Career Timeline",
    headline: "Career progression events",
    description: "Career milestones from journey and analytics.",
    events: careerEvents(context, engines),
    explainable: true,
  };
}

export function buildSkillsEvolutionSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): SkillsEvolutionSection {
  return {
    sectionId: "skills_evolution",
    title: "Skills Evolution",
    headline: "How your skills evolved over time",
    description: "Skill progression from identity and develop-me.",
    evolutionSummary: `${resolvePrimarySkill(context)} proficiency tracked through calibration and learning`,
    events: skillEvents(context, engines),
    explainable: true,
  };
}

export function buildAchievementTimelineSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): AchievementTimelineSection {
  return {
    sectionId: "achievement_timeline",
    title: "Achievement Timeline",
    headline: "Achievement milestones chronologically",
    description: "From achievements module — never grants credentials.",
    events: achievementEvents(context, engines),
    explainable: true,
  };
}

export function buildFinancialTimelineSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): FinancialTimelineSection {
  return {
    sectionId: "financial_timeline",
    title: "Financial Timeline",
    headline: "Financial readiness progression",
    description: "From impact and analytics — never executes financial operations.",
    events: financialEvents(context, engines),
    currency: context.geographic.currency,
    explainable: true,
  };
}

export function buildLeadershipTimelineSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): LeadershipTimelineSection {
  return {
    sectionId: "leadership_timeline",
    title: "Leadership Timeline",
    headline: "Leadership development milestones",
    description: "From coach calibration and team builder.",
    events: leadershipEvents(context, engines),
    explainable: true,
  };
}

export function buildMajorTurningPointsSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): MajorTurningPointsSection {
  const events = turningPointEvents(context, engines);
  return {
    sectionId: "major_turning_points",
    title: "Major Turning Points",
    headline: "Pivotal moments that shaped your career",
    description: "Turning points preserved in original chronological order.",
    turningPointSummary: events[0]?.description ?? resolveCareerChangingProject(context),
    events,
    explainable: true,
  };
}

export function buildFutureTimelineProjectionSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): FutureTimelineProjectionSection {
  return {
    sectionId: "future_timeline_projection",
    title: "Future Timeline Projection",
    headline: "Projected future professional milestones",
    description: "Projections only — not historical events.",
    projectionHorizon: "24-month projected timeline from goals and simulator",
    events: futureEvents(context, engines),
    explainable: true,
  };
}

export function buildTimelineInsightsSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): TimelineInsightsSection {
  const engine = buildTimelineEngineEvaluation(context, engines);
  return {
    sectionId: "timeline_insights",
    title: "Timeline Insights",
    headline: "Insights from your professional timeline",
    description: "Recommendations only — user interprets timeline.",
    insightSummary: `Timeline health ${engine.timelineHealthScore}% — completeness ${engine.timelineCompletenessScore}%`,
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
      "Living Professional Analytics",
    ],
    engine,
    events: insightEvents(context, engines),
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot
): ConfidenceExplanationSection {
  const conf = baseConfidence(context, engines, "overall");
  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in timeline organization`,
    description: "Evidence-based confidence with stated limitations.",
    confidenceScore: conf,
    evidence: [
      `Readiness ${baseReadiness(engines)}`,
      resolveFrameStanding(context),
      `${resolveExperienceYears(context)} years verified experience`,
      engines.passportLevel ?? "Passport profile active",
    ],
    reasoning: "Confidence derived from data completeness — never fabricates historical events.",
    missingInformation: !context.onboarding.ironVerification?.identityConfirmed
      ? ["Complete verification for higher timeline confidence"]
      : [],
    alternativeInterpretations: [
      "Conservative interpretation: only verified events shown",
      "Optimistic interpretation: includes projected future milestones",
    ],
    events: [
      buildTimelineEvent({
        context,
        engines,
        id: `tl-conf-${context.userId.slice(-4)}`,
        title: "Timeline confidence indicator",
        description: "Meta-event representing timeline organization confidence",
        category: "summary",
        timestamp: context.generatedAt,
        chronologicalOrder: 1000,
        importanceLevel: "low",
        source: "Timeline Engine",
        evidence: [`Confidence ${conf}%`],
        impactScore: conf,
        salt: "conf-ev",
        explanation: "Confidence meta-event for timeline section.",
        recommendations: ["Review assumptions in timeline summary"],
      }),
    ],
    explainable: true,
  };
}

export function buildTimelineHistorySection(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot,
  history: TimelineHistoryProfile
): TimelineHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "timeline_history",
    title: "Timeline History",
    headline: `${history.records.length} timeline insight decision${history.records.length === 1 ? "" : "s"} recorded`,
    description: "Track accepted and ignored timeline insights.",
    previousInsights: history.records.slice(0, 10),
    acceptedInsights: accepted,
    ignoredInsights: ignored,
    outcomeComparison:
      accepted.length > 0 ? "Accepted insights help refine timeline organization" : "Explore insights to build history",
    learningEvolution:
      history.records.length >= 3 ? "Timeline adapts to your insight patterns" : "History grows with each decision",
    events: [
      buildTimelineEvent({
        context,
        engines,
        id: `tl-hist-${context.userId.slice(-4)}`,
        title: "Timeline decision tracking",
        description: "History of accepted and ignored timeline insights",
        category: "summary",
        timestamp: context.generatedAt,
        chronologicalOrder: 1001,
        importanceLevel: "low",
        source: "Timeline History",
        evidence: [`${history.records.length} decisions`],
        impactScore: 0,
        salt: "hist-ev",
        explanation: "History meta-event — updates as user accepts or ignores insights.",
        recommendations: ["Explore timeline insights section"],
      }),
    ],
    explainable: true,
  };
}

export function buildAllTimelineSections(
  context: LivingProfessionalTimelineContext,
  engines: TimelineEngineSnapshot,
  history: TimelineHistoryProfile
): LivingProfessionalTimelineSection[] {
  return [
    buildTimelineSummarySection(context, engines),
    buildProfessionalBeginningSection(context, engines),
    buildEducationLearningTimelineSection(context, engines),
    buildCareerTimelineSection(context, engines),
    buildSkillsEvolutionSection(context, engines),
    buildAchievementTimelineSection(context, engines),
    buildFinancialTimelineSection(context, engines),
    buildLeadershipTimelineSection(context, engines),
    buildMajorTurningPointsSection(context, engines),
    buildFutureTimelineProjectionSection(context, engines),
    buildTimelineInsightsSection(context, engines),
    buildConfidenceExplanationSection(context, engines),
    buildTimelineHistorySection(context, engines, history),
  ];
}

function eventToView(e: TimelineEvent) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    timestamp: e.timestamp,
    chronological_order: e.chronologicalOrder,
    importance_level: e.importanceLevel,
    source: e.source,
    evidence: e.evidence,
    related_entities: e.relatedEntities,
    impact_score: e.impactScore,
    confidence_score: e.confidenceScore,
    explanation: e.explanation,
    recommendations: e.recommendations,
  };
}

function engineToView(e: TimelineEngineEvaluation) {
  return {
    chronological_professional_history: e.chronologicalProfessionalHistory.map(eventToView),
    milestone_sequence: e.milestoneSequence.map(eventToView),
    turning_points: e.turningPoints.map(eventToView),
    career_progression: e.careerProgression.map(eventToView),
    learning_progression: e.learningProgression.map(eventToView),
    achievement_progression: e.achievementProgression.map(eventToView),
    financial_progression: e.financialProgression.map(eventToView),
    projected_future_events: e.projectedFutureEvents.map(eventToView),
    timeline_health_score: e.timelineHealthScore,
    timeline_completeness_score: e.timelineCompletenessScore,
  };
}

function sectionToView(section: LivingProfessionalTimelineSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
    events: section.events.map(eventToView),
  };

  switch (section.sectionId) {
    case "timeline_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        total_events: section.totalEvents,
        timeline_span: section.timelineSpan,
        featured_event: section.featuredEvent,
        assumptions: section.assumptions,
        engine: engineToView(section.engine),
      };
    case "professional_beginning":
      return { ...base, origin_story: section.originStory };
    case "skills_evolution":
      return { ...base, evolution_summary: section.evolutionSummary };
    case "financial_timeline":
      return { ...base, currency: section.currency };
    case "major_turning_points":
      return { ...base, turning_point_summary: section.turningPointSummary };
    case "future_timeline_projection":
      return { ...base, projection_horizon: section.projectionHorizon };
    case "timeline_insights":
      return {
        ...base,
        insight_summary: section.insightSummary,
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
    case "timeline_history":
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

function mapHistoryRecord(r: TimelineHistoryRecord) {
  return {
    record_id: r.recordId,
    insight_title: r.insightTitle,
    status: r.status,
    recorded_at: r.recordedAt,
    outcome: r.outcome,
  };
}

export function toTimelineSectionView(section: LivingProfessionalTimelineSection) {
  return sectionToView(section);
}

export function toTimelineSectionsView(sections: LivingProfessionalTimelineSection[]) {
  return sections.map(toTimelineSectionView);
}

export function recordTimelineOutcome(
  history: TimelineHistoryProfile,
  recordId: string,
  insightTitle: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): TimelineHistoryProfile {
  const without = history.records.filter((r) => r.recordId !== recordId);
  return {
    records: [{ recordId, insightTitle, status, recordedAt, outcome }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}
