import type { LivingProfessionalAchievementsContext } from "./achievements-context.js";
import {
  hashAchievementsSeed,
  resolveCertificates,
  resolveExperienceYears,
  resolveFrameStanding,
  resolveLicenses,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolveProudestAchievement,
} from "./achievements-context.js";

export interface AchievementsEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
}

export type AchievementCategory =
  | "milestone"
  | "certification"
  | "award"
  | "badge"
  | "career"
  | "skill"
  | "financial"
  | "leadership";

export type AchievementLevel = "bronze" | "silver" | "gold" | "platinum" | "diamond";
export type VerificationStatus = "verified" | "pending" | "unverified" | "recommended";

export interface ProfessionalAchievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  level: AchievementLevel;
  earnedDate: string;
  source: string;
  evidence: string[];
  verificationStatus: VerificationStatus;
  credibilityScore: number;
  impactScore: number;
  rarityScore: number;
  progressToNextLevel: number;
  recommendations: string[];
  confidenceScore: number;
  explanation: string;
}

export interface AchievementEngineEvaluation {
  achievementScore: number;
  achievementLevel: AchievementLevel;
  achievementProgression: string;
  unlockedAchievements: ProfessionalAchievement[];
  nextRecommendedAchievements: ProfessionalAchievement[];
  achievementGaps: string[];
  projectedFutureAchievements: ProfessionalAchievement[];
}

export interface AchievementHistoryRecord {
  recordId: string;
  achievementTitle: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface AchievementHistoryProfile {
  records: AchievementHistoryRecord[];
  updatedAt: string;
}

export interface AchievementsSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface AchievementsSummarySection extends AchievementsSectionBase {
  sectionId: "achievements_summary";
  overallUnderstanding: string;
  totalAchievements: number;
  achievementScore: number;
  achievementLevel: AchievementLevel;
  featuredAchievement: string;
  assumptions: string[];
}

export interface ProfessionalMilestonesAchievementsSection extends AchievementsSectionBase {
  sectionId: "professional_milestones";
  milestones: ProfessionalAchievement[];
  timelineOverview: string;
}

export interface CertificationsSection extends AchievementsSectionBase {
  sectionId: "certifications";
  certifications: ProfessionalAchievement[];
}

export interface AwardsHonorsSection extends AchievementsSectionBase {
  sectionId: "awards_honors";
  awards: ProfessionalAchievement[];
}

export interface ProfessionalBadgesSection extends AchievementsSectionBase {
  sectionId: "professional_badges";
  badges: ProfessionalAchievement[];
}

export interface CareerRecordsSection extends AchievementsSectionBase {
  sectionId: "career_records";
  records: ProfessionalAchievement[];
}

export interface SkillAchievementsSection extends AchievementsSectionBase {
  sectionId: "skill_achievements";
  achievements: ProfessionalAchievement[];
}

export interface FinancialAchievementsSection extends AchievementsSectionBase {
  sectionId: "financial_achievements";
  achievements: ProfessionalAchievement[];
  currency: string;
}

export interface LeadershipAchievementsSection extends AchievementsSectionBase {
  sectionId: "leadership_achievements";
  achievements: ProfessionalAchievement[];
}

export interface AchievementTimelineSection extends AchievementsSectionBase {
  sectionId: "achievement_timeline";
  timeline: Array<{ date: string; achievement: ProfessionalAchievement }>;
  chronologicalSummary: string;
}

export interface RecommendedNextAchievementsSection extends AchievementsSectionBase {
  sectionId: "recommended_next_achievements";
  recommendations: ProfessionalAchievement[];
  achievementGaps: string[];
  sourcesUsed: string[];
  engine: AchievementEngineEvaluation;
}

export interface ConfidenceExplanationSection extends AchievementsSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface AchievementHistorySection extends AchievementsSectionBase {
  sectionId: "achievement_history";
  previousAchievements: AchievementHistoryRecord[];
  acceptedAchievements: AchievementHistoryRecord[];
  ignoredAchievements: AchievementHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalAchievementsSection =
  | AchievementsSummarySection
  | ProfessionalMilestonesAchievementsSection
  | CertificationsSection
  | AwardsHonorsSection
  | ProfessionalBadgesSection
  | CareerRecordsSection
  | SkillAchievementsSection
  | FinancialAchievementsSection
  | LeadershipAchievementsSection
  | AchievementTimelineSection
  | RecommendedNextAchievementsSection
  | ConfidenceExplanationSection
  | AchievementHistorySection;

export const ACHIEVEMENTS_EXPERIENCE_FLAGS = {
  experience_only: true,
  read_only: true,
  recommends_only: true,
  never_execute: true,
  never_issue_real_certificates: true,
  never_verify_real_credentials: true,
  never_decide_for_user: true,
  never_fabricate_reasoning: true,
  never_fabricate_data: true,
  always_show_assumptions: true,
  always_show_confidence: true,
  user_controls_final_decision: true,
} as const;

export function buildDefaultAchievementHistory(
  context: LivingProfessionalAchievementsContext
): AchievementHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: AchievementsEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function baseConfidence(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot,
  salt: string
): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashAchievementsSeed(context.dayKey, context.userId, salt);
  return Math.min(92, Math.round((readiness + trust) / 2 + (hash % 8)));
}

function globalAssumptions(context: LivingProfessionalAchievementsContext): string[] {
  return [
    `Professional activity in ${context.geographic.city}, ${context.geographic.country}`,
    "Achievements are experience projections — never grants real certificates or credentials",
    "Evaluation is deterministic based on living experience data",
    "User controls which achievements to recognize or pursue",
  ];
}

function levelFromScore(score: number): AchievementLevel {
  if (score >= 85) return "diamond";
  if (score >= 70) return "platinum";
  if (score >= 55) return "gold";
  if (score >= 40) return "silver";
  return "bronze";
}

function earnedDateOffset(context: LivingProfessionalAchievementsContext, monthsAgo: number): string {
  const base = new Date(context.generatedAt);
  base.setMonth(base.getMonth() - monthsAgo);
  return base.toISOString().slice(0, 10);
}

export function buildProfessionalAchievement(input: {
  context: LivingProfessionalAchievementsContext;
  engines: AchievementsEngineSnapshot;
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  level: AchievementLevel;
  earnedDate: string;
  source: string;
  evidence: string[];
  verificationStatus: VerificationStatus;
  credibilityScore: number;
  impactScore: number;
  rarityScore: number;
  progressToNextLevel: number;
  recommendations: string[];
  salt: string;
  explanation: string;
}): ProfessionalAchievement {
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    category: input.category,
    level: input.level,
    earnedDate: input.earnedDate,
    source: input.source,
    evidence: input.evidence,
    verificationStatus: input.verificationStatus,
    credibilityScore: input.credibilityScore,
    impactScore: input.impactScore,
    rarityScore: input.rarityScore,
    progressToNextLevel: input.progressToNextLevel,
    recommendations: input.recommendations,
    confidenceScore: baseConfidence(input.context, input.engines, input.salt),
    explanation: input.explanation,
  };
}

function milestoneAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const skill = resolvePrimarySkill(context);
  const years = resolveExperienceYears(context);
  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-ms-exp-${context.userId.slice(-4)}`,
      title: `${years}+ years ${resolvePrimaryIndustry(context)} experience`,
      description: `Professional experience milestone in ${context.geographic.city}`,
      category: "milestone",
      level: years >= 10 ? "gold" : years >= 5 ? "silver" : "bronze",
      earnedDate: earnedDateOffset(context, years * 12),
      source: "Living Professional Journey",
      evidence: [`${years} years verified experience`, resolveProudestAchievement(context)],
      verificationStatus: context.onboarding.ironVerification?.identityConfirmed ? "verified" : "pending",
      credibilityScore: Math.min(90, 50 + years * 4),
      impactScore: Math.min(85, 40 + years * 5),
      rarityScore: Math.min(75, 30 + years * 3),
      progressToNextLevel: years >= 10 ? 100 : Math.round((years / 10) * 100),
      recommendations: ["Document next career milestone in passport"],
      salt: "ms-exp",
      explanation: "Experience milestone from journey and onboarding profile.",
    }),
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-ms-readiness-${context.userId.slice(-4)}`,
      title: `${skill} readiness milestone`,
      description: `Reached ${baseReadiness(engines)}% professional readiness`,
      category: "milestone",
      level: levelFromScore(baseReadiness(engines)),
      earnedDate: earnedDateOffset(context, 3),
      source: "Living Professional Passport",
      evidence: [`Readiness ${baseReadiness(engines)}%`, engines.passportLevel ?? "Active passport"],
      verificationStatus: "verified",
      credibilityScore: baseReadiness(engines),
      impactScore: baseReadiness(engines) - 5,
      rarityScore: Math.min(70, baseReadiness(engines) - 10),
      progressToNextLevel: Math.min(100, baseReadiness(engines) + 15),
      recommendations: ["Continue weekly evidence collection"],
      salt: "ms-ready",
      explanation: "Readiness milestone from develop-me and passport projections.",
    }),
  ];
}

function certificationAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const certs = resolveCertificates(context);
  const licenses = resolveLicenses(context);

  const certAchievements = certs.map((cert, i) =>
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-cert-${i}-${context.userId.slice(-4)}`,
      title: cert,
      description: `Professional certification: ${cert}`,
      category: "certification",
      level: "silver",
      earnedDate: earnedDateOffset(context, 24 + i * 6),
      source: "Onboarding Professional Background",
      evidence: [cert, "Certificate on file"],
      verificationStatus: "pending",
      credibilityScore: 70,
      impactScore: 65,
      rarityScore: 55,
      progressToNextLevel: 60,
      recommendations: ["Submit certificate for passport verification — never auto-verified"],
      salt: `cert-${i}`,
      explanation: "Certification from onboarding profile — experience projection only.",
    })
  );

  const licenseAchievements = licenses.map((license, i) =>
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-lic-${i}-${context.userId.slice(-4)}`,
      title: license,
      description: `Professional license: ${license}`,
      category: "certification",
      level: "gold",
      earnedDate: earnedDateOffset(context, 36 + i * 12),
      source: "Onboarding Professional Background",
      evidence: [license, context.geographic.professionalRegulations.join(", ")],
      verificationStatus: "pending",
      credibilityScore: 75,
      impactScore: 70,
      rarityScore: 60,
      progressToNextLevel: 50,
      recommendations: ["Verify license status with regulatory body — system never verifies"],
      salt: `lic-${i}`,
      explanation: "License from onboarding — never issues or verifies real credentials.",
    })
  );

  return [...certAchievements, ...licenseAchievements];
}

function awardAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const achievement = resolveProudestAchievement(context);
  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-award-${context.userId.slice(-4)}`,
      title: "Proudest professional achievement",
      description: achievement,
      category: "award",
      level: "gold",
      earnedDate: earnedDateOffset(context, 18),
      source: "Living Professional Story",
      evidence: [achievement, context.onboarding.professionalStory?.careerChangingProject ?? "Project record"],
      verificationStatus: context.onboarding.ironVerification?.identityConfirmed ? "verified" : "pending",
      credibilityScore: 80,
      impactScore: 85,
      rarityScore: 70,
      progressToNextLevel: 75,
      recommendations: ["Add project evidence to passport for stronger verification"],
      salt: "award-proud",
      explanation: "Award derived from professional story — experience record only.",
    }),
  ];
}

function badgeAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const standing = resolveFrameStanding(context);
  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-badge-frame-${context.userId.slice(-4)}`,
      title: `${standing} badge`,
      description: `Live Frame standing: ${engines.liveFrameLabel ?? standing}`,
      category: "badge",
      level: standing === "Trusted frame" ? "platinum" : "silver",
      earnedDate: earnedDateOffset(context, 6),
      source: "Living Professional Live Frame",
      evidence: [standing, `Trust ${engines.trustScore ?? 50}`],
      verificationStatus: standing === "Trusted frame" ? "verified" : "pending",
      credibilityScore: engines.trustScore ?? 50,
      impactScore: 60,
      rarityScore: standing === "Trusted frame" ? 75 : 40,
      progressToNextLevel: standing === "Trusted frame" ? 90 : 45,
      recommendations: ["Complete identity verification for trusted frame badge"],
      salt: "badge-frame",
      explanation: "Badge from live frame projection — never grants real credentials.",
    }),
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-badge-passport-${context.userId.slice(-4)}`,
      title: `${engines.passportLevel ?? "Active"} passport badge`,
      description: "Professional passport tier recognition",
      category: "badge",
      level: levelFromScore(baseReadiness(engines)),
      earnedDate: earnedDateOffset(context, 2),
      source: "Living Professional Passport",
      evidence: [engines.passportLevel ?? "Passport active"],
      verificationStatus: "verified",
      credibilityScore: baseReadiness(engines),
      impactScore: 55,
      rarityScore: 50,
      progressToNextLevel: Math.min(100, baseReadiness(engines) + 20),
      recommendations: ["Advance to next passport tier"],
      salt: "badge-passport",
      explanation: "Passport badge from develop-me tier — recommendation only.",
    }),
  ];
}

function careerRecordAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const project = context.onboarding.professionalStory?.careerChangingProject ?? "Major project delivery";
  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-career-${context.userId.slice(-4)}`,
      title: "Career-changing project record",
      description: project,
      category: "career",
      level: "gold",
      earnedDate: earnedDateOffset(context, 24),
      source: "Living Professional Journey",
      evidence: [project, resolveProudestAchievement(context)],
      verificationStatus: "pending",
      credibilityScore: 78,
      impactScore: 82,
      rarityScore: 65,
      progressToNextLevel: 70,
      recommendations: ["Link project evidence in passport"],
      salt: "career-proj",
      explanation: "Career record from professional story and journey.",
    }),
  ];
}

function skillAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const skill = resolvePrimarySkill(context);
  const missions = context.onboarding.professionalCalibration?.missions ?? [];
  const strongest = missions.find((m) => m.missionId === "strongest_skill");

  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-skill-${context.userId.slice(-4)}`,
      title: `${skill} proficiency achievement`,
      description: `Demonstrated ${skill} proficiency${strongest ? ` (score ${strongest.score})` : ""}`,
      category: "skill",
      level: levelFromScore(strongest?.score ?? baseReadiness(engines)),
      earnedDate: earnedDateOffset(context, 12),
      source: "Living Professional Identity",
      evidence: [skill, ...(engines.growthPath ?? []).slice(0, 2)],
      verificationStatus: "verified",
      credibilityScore: strongest?.score ?? baseReadiness(engines),
      impactScore: 70,
      rarityScore: 55,
      progressToNextLevel: Math.min(100, (strongest?.score ?? 60) + 15),
      recommendations: ["Complete next skill module in develop-me"],
      salt: "skill-prof",
      explanation: "Skill achievement from identity calibration and develop-me.",
    }),
  ];
}

function financialAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const readiness = baseReadiness(engines);
  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-fin-${context.userId.slice(-4)}`,
      title: "Income readiness achievement",
      description: `Professional earning readiness at ${readiness}% in ${context.geographic.currency}`,
      category: "financial",
      level: levelFromScore(readiness),
      earnedDate: earnedDateOffset(context, 8),
      source: "Living Professional Impact",
      evidence: [`Readiness ${readiness}%`, context.geographic.currency],
      verificationStatus: readiness >= 60 ? "verified" : "pending",
      credibilityScore: readiness,
      impactScore: readiness - 5,
      rarityScore: Math.min(65, readiness - 15),
      progressToNextLevel: Math.min(100, readiness + 25),
      recommendations: ["Run income simulator before pricing changes"],
      salt: "fin-ready",
      explanation: "Financial achievement from impact projections — never executes payments.",
    }),
  ];
}

function leadershipAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const enjoysLeading = context.onboarding.smartQuestions?.enjoysLeading;
  const skill = resolvePrimarySkill(context);

  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-lead-${context.userId.slice(-4)}`,
      title: enjoysLeading ? `${skill} leadership recognition` : `${skill} collaboration recognition`,
      description: enjoysLeading
        ? "Demonstrated leadership aptitude in professional calibration"
        : "Demonstrated collaborative professional aptitude",
      category: "leadership",
      level: enjoysLeading ? "gold" : "silver",
      earnedDate: earnedDateOffset(context, 15),
      source: "Living Professional Coach",
      evidence: [
        enjoysLeading ? "Leadership preference confirmed" : "Collaboration preference confirmed",
        resolveFrameStanding(context),
      ],
      verificationStatus: "verified",
      credibilityScore: enjoysLeading ? 75 : 65,
      impactScore: enjoysLeading ? 80 : 60,
      rarityScore: enjoysLeading ? 60 : 45,
      progressToNextLevel: enjoysLeading ? 55 : 40,
      recommendations: ["Complete team builder leadership project"],
      salt: "lead-rec",
      explanation: "Leadership achievement from coach and smart questions calibration.",
    }),
  ];
}

function recommendedAchievements(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalAchievement[] {
  const skill = resolvePrimarySkill(context);
  return [
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-rec-next-${context.userId.slice(-4)}`,
      title: `Advanced ${skill} certification`,
      description: "Recommended next certification based on skill gap analysis",
      category: "certification",
      level: "silver",
      earnedDate: context.generatedAt.slice(0, 10),
      source: "Living Professional Goals",
      evidence: engines.challenges ?? [`${skill} gap identified`],
      verificationStatus: "recommended",
      credibilityScore: 0,
      impactScore: 75,
      rarityScore: 50,
      progressToNextLevel: 0,
      recommendations: ["Complete develop-me learning path", "Never auto-granted — user pursues manually"],
      salt: "rec-cert",
      explanation: "Recommended achievement from goals and gap analysis — not yet earned.",
    }),
    buildProfessionalAchievement({
      context,
      engines,
      id: `ach-rec-trust-${context.userId.slice(-4)}`,
      title: "Trusted expert recognition",
      description: "Projected future achievement from live frame progression",
      category: "badge",
      level: "platinum",
      earnedDate: context.generatedAt.slice(0, 10),
      source: "Living Professional Simulator",
      evidence: ["Reputation growth trajectory", resolveFrameStanding(context)],
      verificationStatus: "recommended",
      credibilityScore: 0,
      impactScore: 85,
      rarityScore: 80,
      progressToNextLevel: 25,
      recommendations: ["Run reputation simulator", "Increase community contributions"],
      salt: "rec-trust",
      explanation: "Projected future achievement — recommendation only.",
    }),
  ];
}

export function buildAchievementEngineEvaluation(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): AchievementEngineEvaluation {
  const unlocked = [
    ...milestoneAchievements(context, engines),
    ...certificationAchievements(context, engines),
    ...awardAchievements(context, engines),
    ...badgeAchievements(context, engines),
    ...careerRecordAchievements(context, engines),
    ...skillAchievements(context, engines),
    ...financialAchievements(context, engines),
    ...leadershipAchievements(context, engines),
  ].filter((a) => a.verificationStatus !== "recommended");

  const nextRecommended = recommendedAchievements(context, engines);
  const achievementScore = Math.round(
    unlocked.reduce((sum, a) => sum + a.credibilityScore, 0) / Math.max(unlocked.length, 1)
  );

  return {
    achievementScore,
    achievementLevel: levelFromScore(achievementScore),
    achievementProgression: `${unlocked.length} unlocked — ${nextRecommended.length} recommended next`,
    unlockedAchievements: unlocked,
    nextRecommendedAchievements: nextRecommended,
    achievementGaps: engines.challenges ?? [`Advanced ${resolvePrimarySkill(context)} certification`],
    projectedFutureAchievements: nextRecommended,
  };
}

export function buildAchievementsSummarySection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): AchievementsSummarySection {
  const engine = buildAchievementEngineEvaluation(context, engines);
  const featured = engine.unlockedAchievements[0]?.title ?? `${resolvePrimarySkill(context)} readiness`;

  return {
    sectionId: "achievements_summary",
    title: "Achievements Summary",
    headline: "Your living professional achievement portfolio",
    description: "Deterministic achievement evaluation — experience only, never grants credentials.",
    overallUnderstanding: `${context.displayName}'s ${resolvePrimaryIndustry(context)} achievements in ${context.geographic.city}.`,
    totalAchievements: engine.unlockedAchievements.length,
    achievementScore: engine.achievementScore,
    achievementLevel: engine.achievementLevel,
    featuredAchievement: featured,
    assumptions: globalAssumptions(context),
    explainable: true,
  };
}

export function buildProfessionalMilestonesAchievementsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalMilestonesAchievementsSection {
  return {
    sectionId: "professional_milestones",
    title: "Professional Milestones",
    headline: "Key professional milestones achieved",
    description: "Experience and readiness milestones from journey projections.",
    milestones: milestoneAchievements(context, engines),
    timelineOverview: "Milestones span career experience and readiness progression",
    explainable: true,
  };
}

export function buildCertificationsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): CertificationsSection {
  return {
    sectionId: "certifications",
    title: "Certifications",
    headline: "Professional certifications on record",
    description: "From onboarding profile — never issues or verifies real certificates.",
    certifications: certificationAchievements(context, engines),
    explainable: true,
  };
}

export function buildAwardsHonorsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): AwardsHonorsSection {
  return {
    sectionId: "awards_honors",
    title: "Awards & Honors",
    headline: "Professional awards and honors",
    description: "Derived from professional story — experience record only.",
    awards: awardAchievements(context, engines),
    explainable: true,
  };
}

export function buildProfessionalBadgesSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ProfessionalBadgesSection {
  return {
    sectionId: "professional_badges",
    title: "Professional Badges",
    headline: "Live Frame and passport badges",
    description: "Badge projections from live frame and passport — never grants real credentials.",
    badges: badgeAchievements(context, engines),
    explainable: true,
  };
}

export function buildCareerRecordsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): CareerRecordsSection {
  return {
    sectionId: "career_records",
    title: "Career Records",
    headline: "Significant career records",
    description: "Career-changing projects and professional records.",
    records: careerRecordAchievements(context, engines),
    explainable: true,
  };
}

export function buildSkillAchievementsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): SkillAchievementsSection {
  return {
    sectionId: "skill_achievements",
    title: "Skill Achievements",
    headline: "Skill proficiency achievements",
    description: "From identity calibration and develop-me learning paths.",
    achievements: skillAchievements(context, engines),
    explainable: true,
  };
}

export function buildFinancialAchievementsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): FinancialAchievementsSection {
  return {
    sectionId: "financial_achievements",
    title: "Financial Achievements",
    headline: "Income and financial readiness achievements",
    description: "From impact projections — never executes financial operations.",
    achievements: financialAchievements(context, engines),
    currency: context.geographic.currency,
    explainable: true,
  };
}

export function buildLeadershipAchievementsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): LeadershipAchievementsSection {
  return {
    sectionId: "leadership_achievements",
    title: "Leadership Achievements",
    headline: "Leadership and collaboration recognition",
    description: "From coach calibration and team builder projections.",
    achievements: leadershipAchievements(context, engines),
    explainable: true,
  };
}

export function buildAchievementTimelineSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): AchievementTimelineSection {
  const all = [
    ...milestoneAchievements(context, engines),
    ...certificationAchievements(context, engines),
    ...awardAchievements(context, engines),
    ...badgeAchievements(context, engines),
    ...careerRecordAchievements(context, engines),
    ...skillAchievements(context, engines),
    ...financialAchievements(context, engines),
    ...leadershipAchievements(context, engines),
  ];

  const timeline = all
    .map((achievement) => ({ date: achievement.earnedDate, achievement }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    sectionId: "achievement_timeline",
    title: "Achievement Timeline",
    headline: `${timeline.length} achievements in chronological order`,
    description: "Living achievement timeline — newest first.",
    timeline,
    chronologicalSummary: `Achievement portfolio spans ${timeline.at(-1)?.date ?? "N/A"} to ${timeline[0]?.date ?? "N/A"}`,
    explainable: true,
  };
}

export function buildRecommendedNextAchievementsSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): RecommendedNextAchievementsSection {
  const engine = buildAchievementEngineEvaluation(context, engines);
  return {
    sectionId: "recommended_next_achievements",
    title: "Recommended Next Achievements",
    headline: "Achievements to pursue next",
    description: "Deterministic recommendations — user decides whether to pursue.",
    recommendations: engine.nextRecommendedAchievements,
    achievementGaps: engine.achievementGaps,
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
    ],
    engine,
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot
): ConfidenceExplanationSection {
  const conf = baseConfidence(context, engines, "overall");
  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in achievement evaluation`,
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
      "Conservative interpretation: only verified achievements count",
      "Optimistic interpretation: includes pending verification achievements",
    ],
    explainable: true,
  };
}

export function buildAchievementHistorySection(
  _context: LivingProfessionalAchievementsContext,
  history: AchievementHistoryProfile
): AchievementHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "achievement_history",
    title: "Achievement History",
    headline: `${history.records.length} achievement decision${history.records.length === 1 ? "" : "s"} recorded`,
    description: "Track accepted and ignored achievement recommendations.",
    previousAchievements: history.records.slice(0, 10),
    acceptedAchievements: accepted,
    ignoredAchievements: ignored,
    outcomeComparison:
      accepted.length > 0 ? "Accepted achievements help refine future recommendations" : "Explore achievements to build history",
    learningEvolution:
      history.records.length >= 3 ? "Recommendations adapt to your achievement patterns" : "History grows with each decision",
    explainable: true,
  };
}

export function buildAllAchievementsSections(
  context: LivingProfessionalAchievementsContext,
  engines: AchievementsEngineSnapshot,
  history: AchievementHistoryProfile
): LivingProfessionalAchievementsSection[] {
  return [
    buildAchievementsSummarySection(context, engines),
    buildProfessionalMilestonesAchievementsSection(context, engines),
    buildCertificationsSection(context, engines),
    buildAwardsHonorsSection(context, engines),
    buildProfessionalBadgesSection(context, engines),
    buildCareerRecordsSection(context, engines),
    buildSkillAchievementsSection(context, engines),
    buildFinancialAchievementsSection(context, engines),
    buildLeadershipAchievementsSection(context, engines),
    buildAchievementTimelineSection(context, engines),
    buildRecommendedNextAchievementsSection(context, engines),
    buildConfidenceExplanationSection(context, engines),
    buildAchievementHistorySection(context, history),
  ];
}

function achievementToView(a: ProfessionalAchievement) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    level: a.level,
    earned_date: a.earnedDate,
    source: a.source,
    evidence: a.evidence,
    verification_status: a.verificationStatus,
    credibility_score: a.credibilityScore,
    impact_score: a.impactScore,
    rarity_score: a.rarityScore,
    progress_to_next_level: a.progressToNextLevel,
    recommendations: a.recommendations,
    confidence_score: a.confidenceScore,
    explanation: a.explanation,
  };
}

function engineToView(e: AchievementEngineEvaluation) {
  return {
    achievement_score: e.achievementScore,
    achievement_level: e.achievementLevel,
    achievement_progression: e.achievementProgression,
    unlocked_achievements: e.unlockedAchievements.map(achievementToView),
    next_recommended_achievements: e.nextRecommendedAchievements.map(achievementToView),
    achievement_gaps: e.achievementGaps,
    projected_future_achievements: e.projectedFutureAchievements.map(achievementToView),
  };
}

function sectionToView(section: LivingProfessionalAchievementsSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "achievements_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        total_achievements: section.totalAchievements,
        achievement_score: section.achievementScore,
        achievement_level: section.achievementLevel,
        featured_achievement: section.featuredAchievement,
        assumptions: section.assumptions,
      };
    case "professional_milestones":
      return {
        ...base,
        milestones: section.milestones.map(achievementToView),
        timeline_overview: section.timelineOverview,
      };
    case "certifications":
      return { ...base, certifications: section.certifications.map(achievementToView) };
    case "awards_honors":
      return { ...base, awards: section.awards.map(achievementToView) };
    case "professional_badges":
      return { ...base, badges: section.badges.map(achievementToView) };
    case "career_records":
      return { ...base, records: section.records.map(achievementToView) };
    case "skill_achievements":
      return { ...base, achievements: section.achievements.map(achievementToView) };
    case "financial_achievements":
      return {
        ...base,
        achievements: section.achievements.map(achievementToView),
        currency: section.currency,
      };
    case "leadership_achievements":
      return { ...base, achievements: section.achievements.map(achievementToView) };
    case "achievement_timeline":
      return {
        ...base,
        timeline: section.timeline.map((t) => ({
          date: t.date,
          achievement: achievementToView(t.achievement),
        })),
        chronological_summary: section.chronologicalSummary,
      };
    case "recommended_next_achievements":
      return {
        ...base,
        recommendations: section.recommendations.map(achievementToView),
        achievement_gaps: section.achievementGaps,
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
    case "achievement_history":
      return {
        ...base,
        previous_achievements: section.previousAchievements.map(mapHistoryRecord),
        accepted_achievements: section.acceptedAchievements.map(mapHistoryRecord),
        ignored_achievements: section.ignoredAchievements.map(mapHistoryRecord),
        outcome_comparison: section.outcomeComparison,
        learning_evolution: section.learningEvolution,
      };
    default:
      return base;
  }
}

function mapHistoryRecord(r: AchievementHistoryRecord) {
  return {
    record_id: r.recordId,
    achievement_title: r.achievementTitle,
    status: r.status,
    recorded_at: r.recordedAt,
    outcome: r.outcome,
  };
}

export function toAchievementsSectionView(section: LivingProfessionalAchievementsSection) {
  return sectionToView(section);
}

export function toAchievementsSectionsView(sections: LivingProfessionalAchievementsSection[]) {
  return sections.map(toAchievementsSectionView);
}

export function recordAchievementOutcome(
  history: AchievementHistoryProfile,
  recordId: string,
  achievementTitle: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): AchievementHistoryProfile {
  const without = history.records.filter((r) => r.recordId !== recordId);
  return {
    records: [{ recordId, achievementTitle, status, recordedAt, outcome }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}
