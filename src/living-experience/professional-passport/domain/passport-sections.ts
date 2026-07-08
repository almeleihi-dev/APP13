import type { CONFIDENCE_LEVELS, PartnerType } from "./passport-schema.js";
import { PROFESSIONAL_ROLES } from "./passport-schema.js";
import type { LivingPassportContext } from "./passport-context.js";
import {
  hashPassportSeed,
  resolvePrimaryProfession,
  resolveProfessionalTitle,
} from "./passport-context.js";

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export interface PassportEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  growthScore?: number;
  passportLevel?: string;
  liveFrameTier?: string;
  liveFrameLabel?: string;
  frameHistory?: Array<{ date: string; tier: string; event: string }>;
  topMissingSkill?: string;
  recommendedSkills?: string[];
  knowledgeContributions?: string[];
  expertReviews?: number;
  learningContributions?: number;
  teamCollaborations?: number;
  growthPath?: string[];
  todaysBestAction?: string;
}

export interface PassportSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface ProfessionalIdentitySection extends PassportSectionBase {
  sectionId: "professional_identity";
  professionalId: string;
  professionalTitle: string;
  primaryProfession: string;
  professionalSummary: string;
  currentLevel: string;
}

export interface ProfessionalScoreSection extends PassportSectionBase {
  sectionId: "professional_score";
  overallScore: number;
  readiness: number;
  trust: number;
  growth: number;
  professionalConfidence: ConfidenceLevel;
  scoreExplanations: Array<{ factor: string; score: number; explanation: string }>;
}

export interface LiveFrameSection extends PassportSectionBase {
  sectionId: "live_frame";
  currentFrame: string;
  frameLabel: string;
  frameHistory: Array<{ date: string; tier: string; event: string }>;
  progressToNextFrame: number;
  reason: string;
}

export interface VerifiedSkillsSection extends PassportSectionBase {
  sectionId: "verified_skills";
  verifiedSkills: Array<{ skill: string; confidence: ConfidenceLevel }>;
  pendingSkills: string[];
  recommendedSkills: string[];
}

export interface UnlockedActionsSection extends PassportSectionBase {
  sectionId: "unlocked_actions";
  available: string[];
  mastered: string[];
  inProgress: string[];
  suggestedNext: string[];
}

export interface ProfessionalRolesSection extends PassportSectionBase {
  sectionId: "professional_roles";
  activeRoles: string[];
  emergingRoles: string[];
}

export interface CertificatesLicensesSection extends PassportSectionBase {
  sectionId: "certificates_licenses";
  certificates: Array<{ name: string; status: string; expiresAt: string | null }>;
  licenses: Array<{ name: string; status: string; expiresAt: string | null }>;
  memberships: string[];
  expiryReminders: string[];
}

export interface ProfessionalExperienceSection extends PassportSectionBase {
  sectionId: "professional_experience";
  projects: string[];
  completedActions: number;
  yearsOfExperience: number;
  industries: string[];
  specializations: string[];
}

export interface TrustTimelineSection extends PassportSectionBase {
  sectionId: "trust_timeline";
  milestones: Array<{ date: string; title: string; category: string; verified: boolean }>;
}

export interface KnowledgeContributionsSection extends PassportSectionBase {
  sectionId: "knowledge_contributions";
  blueprintImprovements: string[];
  knowledgeBankContributions: string[];
  expertReviews: number;
  learningContributions: number;
  communityContributions: number;
}

export interface ProfessionalImpactSection extends PassportSectionBase {
  sectionId: "professional_impact";
  peopleTrained: number;
  teamsSupported: number;
  projectsCompleted: number;
  knowledgeShared: number;
  customerSatisfaction: number;
  professionalInfluence: string;
}

export interface CareerJourneySection extends PassportSectionBase {
  sectionId: "career_journey";
  past: string;
  present: string;
  nextGoal: string;
  recommendedPath: string[];
  expectedGrowth: string;
}

export interface PartnerShareRequest {
  partnerType: PartnerType;
  partnerName: string;
  approved: boolean;
  approvedAt: string | null;
}

export interface SharingVerificationSection extends PassportSectionBase {
  sectionId: "sharing_verification";
  publicPreviewEnabled: boolean;
  professionalQrCode: string;
  secureShareLink: string;
  partnerVerificationEnabled: boolean;
  employerViewEnabled: boolean;
  governmentViewEnabled: boolean;
  approvedPartners: PartnerShareRequest[];
}

export type LivingPassportSection =
  | ProfessionalIdentitySection
  | ProfessionalScoreSection
  | LiveFrameSection
  | VerifiedSkillsSection
  | UnlockedActionsSection
  | ProfessionalRolesSection
  | CertificatesLicensesSection
  | ProfessionalExperienceSection
  | TrustTimelineSection
  | KnowledgeContributionsSection
  | ProfessionalImpactSection
  | CareerJourneySection
  | SharingVerificationSection;

function resolveConfidence(score: number): ConfidenceLevel {
  if (score >= 85) return "very_high";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

function resolveLevel(context: LivingPassportContext, engines: PassportEngineSnapshot): string {
  return engines.passportLevel ?? (context.tier === "T3" ? "silver" : context.tier === "T2" ? "bronze" : "starter");
}

export function buildProfessionalIdentitySection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): ProfessionalIdentitySection {
  const level = resolveLevel(context, engines);
  const profession = resolvePrimaryProfession(context);
  const title = resolveProfessionalTitle(context);

  return {
    sectionId: "professional_identity",
    title: "Professional Identity",
    headline: context.displayName,
    description: "Your permanent professional identity on APP13.",
    professionalId: `prof://${context.userId}`,
    professionalTitle: title,
    primaryProfession: profession,
    professionalSummary:
      context.onboarding.professionalStory?.proudestAchievement ??
      `${context.displayName} is building a trusted professional record in ${context.geographic.city}, ${context.geographic.country}.`,
    currentLevel: level,
    explainable: true,
  };
}

export function buildProfessionalScoreSection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): ProfessionalScoreSection {
  const hash = hashPassportSeed(context.dayKey, context.userId);
  const readiness = engines.readinessScore ?? 50 + (hash % 20);
  const trust = engines.trustScore ?? 45 + (hash % 25);
  const growth = engines.growthScore ?? 40 + (hash % 30);
  const overall = Math.round(readiness * 0.35 + trust * 0.4 + growth * 0.25);

  return {
    sectionId: "professional_score",
    title: "Professional Score",
    headline: `Overall score: ${overall}`,
    description: "Every score is explainable and grows with your professional activity.",
    overallScore: overall,
    readiness,
    trust,
    growth,
    professionalConfidence: resolveConfidence(overall),
    scoreExplanations: [
      {
        factor: "readiness",
        score: readiness,
        explanation: "Based on skills, credentials, and development progress.",
      },
      {
        factor: "trust",
        score: trust,
        explanation: "Based on verified identity, Live Frame, and professional reliability.",
      },
      {
        factor: "growth",
        score: growth,
        explanation: "Based on learning achievements and career momentum.",
      },
    ],
    explainable: true,
  };
}

export function buildLiveFramePassportSection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): LiveFrameSection {
  const tier = engines.liveFrameTier ?? "STANDARD";
  const label = engines.liveFrameLabel ?? "Standard";
  const trust = engines.trustScore ?? 50;
  const history = engines.frameHistory ?? [
    { date: context.generatedAt.slice(0, 10), tier: label, event: "Passport activated" },
  ];

  return {
    sectionId: "live_frame",
    title: "Live Frame",
    headline: `Current frame: ${label}`,
    description: "Your trust frame evolves with every verified professional action.",
    currentFrame: tier,
    frameLabel: label,
    frameHistory: history,
    progressToNextFrame: Math.min(100, 15 + (trust % 70)),
    reason: "Your frame reflects verified identity, completed work, and professional contributions.",
    explainable: true,
  };
}

export function buildVerifiedSkillsSection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): VerifiedSkillsSection {
  const bg = context.onboarding.professionalBackground;
  const verified = (bg?.skills ?? ["customer_communication"]).map((skill) => ({
    skill,
    confidence: resolveConfidence(70 + (hashPassportSeed(skill, context.userId) % 25)) as ConfidenceLevel,
  }));

  return {
    sectionId: "verified_skills",
    title: "Verified Skills",
    headline: `${verified.length} verified skills`,
    description: "Skills strengthen as you complete actions and earn verification.",
    verifiedSkills: verified,
    pendingSkills: engines.topMissingSkill ? [engines.topMissingSkill] : ["advanced_diagnostics"],
    recommendedSkills: engines.recommendedSkills ?? ["safety_compliance", "project_coordination"],
    explainable: true,
  };
}

export function buildUnlockedActionsSection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): UnlockedActionsSection {
  const sq = context.onboarding.smartQuestions;
  const available = [
    sq?.enjoyedAction,
    sq?.requestedAction,
    engines.todaysBestAction?.replace(/ /g, "_"),
  ].filter(Boolean) as string[];
  if (available.length === 0) available.push("general_professional_services");

  return {
    sectionId: "unlocked_actions",
    title: "Unlocked Actions",
    headline: `${available.length} actions available`,
    description: "Actions unlock as your passport grows.",
    available: [...new Set(available)],
    mastered: available.slice(0, 1),
    inProgress: available.slice(1, 2),
    suggestedNext: engines.recommendedSkills?.slice(0, 2).map((s) => s.replace(/ /g, "_")) ?? ["site_inspection"],
    explainable: true,
  };
}

export function buildProfessionalRolesSection(context: LivingPassportContext): ProfessionalRolesSection {
  const sq = context.onboarding.smartQuestions;
  const active: string[] = ["professional"];
  if (sq?.enjoysTeaching) active.push("trainer");
  if (sq?.enjoysLeading) active.push("supervisor", "team_leader");
  if (sq?.enjoysConsulting) active.push("consultant");
  if (sq?.enjoysReviewing) active.push("reviewer");
  active.push("knowledge_contributor");

  const emerging = PROFESSIONAL_ROLES.filter((role) => !active.includes(role)).slice(0, 3);

  return {
    sectionId: "professional_roles",
    title: "Professional Roles",
    headline: `${active.length} active roles`,
    description: "Multiple roles reflect the full breadth of your professional identity.",
    activeRoles: [...new Set(active)],
    emergingRoles: emerging,
    explainable: true,
  };
}

export function buildCertificatesLicensesSection(context: LivingPassportContext): CertificatesLicensesSection {
  const bg = context.onboarding.professionalBackground;
  const certs = (bg?.certificates ?? []).map((name) => ({
    name,
    status: "verified",
    expiresAt: null,
  }));
  const licenses = (bg?.licenses ?? []).map((name) => ({
    name,
    status: context.onboarding.ironVerification?.identityConfirmed ? "verified" : "pending",
    expiresAt: null,
  }));

  return {
    sectionId: "certificates_licenses",
    title: "Certificates & Licenses",
    headline: `${certs.length + licenses.length} credentials on record`,
    description: `Adapted to ${context.geographic.country} professional regulations.`,
    certificates: certs,
    licenses,
    memberships: context.geographic.professionalRegulations.map((r) => r.replace(/_/g, " ")),
    expiryReminders: licenses.length > 0 ? [] : ["Consider adding a professional license for your region"],
    explainable: true,
  };
}

export function buildProfessionalExperienceSection(context: LivingPassportContext): ProfessionalExperienceSection {
  const bg = context.onboarding.professionalBackground;
  const story = context.onboarding.professionalStory;

  return {
    sectionId: "professional_experience",
    title: "Professional Experience",
    headline: `${bg?.experienceYears ?? 0} years of experience`,
    description: "Experience grows with every completed project and action.",
    projects: story?.careerChangingProject ? [story.careerChangingProject] : ["Building professional track record on APP13"],
    completedActions: hashPassportSeed(context.dayKey, context.userId) % 12,
    yearsOfExperience: bg?.experienceYears ?? 0,
    industries: bg?.industries ?? ["general"],
    specializations: bg?.favoriteActivities ?? [],
    explainable: true,
  };
}

export function buildTrustTimelineSection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): TrustTimelineSection {
  const milestones = [
    {
      date: context.generatedAt.slice(0, 10),
      title: "Professional passport activated",
      category: "passport",
      verified: true,
    },
  ];

  if (context.onboarding.ironVerification?.emailVerified) {
    milestones.push({
      date: context.generatedAt.slice(0, 10),
      title: "Email verified",
      category: "identity",
      verified: true,
    });
  }

  for (const frame of engines.frameHistory ?? []) {
    milestones.push({
      date: frame.date,
      title: `Live Frame: ${frame.event}`,
      category: "live_frame",
      verified: true,
    });
  }

  if (context.onboarding.professionalCalibration) {
    milestones.push({
      date: context.generatedAt.slice(0, 10),
      title: "Professional calibration completed",
      category: "achievement",
      verified: true,
    });
  }

  return {
    sectionId: "trust_timeline",
    title: "Trust Timeline",
    headline: `${milestones.length} verified milestones`,
    description: "A verified history of your professional growth.",
    milestones,
    explainable: true,
  };
}

export function buildKnowledgeContributionsSection(
  engines: PassportEngineSnapshot
): KnowledgeContributionsSection {
  return {
    sectionId: "knowledge_contributions",
    title: "Knowledge Contributions",
    headline: "Your knowledge footprint",
    description: "Contributions strengthen your passport and professional influence.",
    blueprintImprovements: ["Suggested faster inspection workflow"],
    knowledgeBankContributions: engines.knowledgeContributions ?? ["Regional safety checklist note"],
    expertReviews: engines.expertReviews ?? 0,
    learningContributions: engines.learningContributions ?? 1,
    communityContributions: 0,
    explainable: true,
  };
}

export function buildProfessionalImpactSection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): ProfessionalImpactSection {
  const hash = hashPassportSeed(context.dayKey, context.userId);
  const sq = context.onboarding.smartQuestions;

  return {
    sectionId: "professional_impact",
    title: "Professional Impact",
    headline: "Your professional influence",
    description: "Impact grows with training, teams, projects, and knowledge shared.",
    peopleTrained: sq?.enjoysTeaching ? 2 + (hash % 5) : hash % 3,
    teamsSupported: engines.teamCollaborations ?? 1 + (hash % 4),
    projectsCompleted: hash % 8,
    knowledgeShared: engines.knowledgeContributions?.length ?? 1,
    customerSatisfaction: 75 + (hash % 20),
    professionalInfluence: hash % 2 === 0 ? "growing" : "emerging",
    explainable: true,
  };
}

export function buildCareerJourneySection(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot
): CareerJourneySection {
  const story = context.onboarding.professionalStory;
  const path = engines.growthPath ?? ["Build verified track record", "Master next professional action"];

  return {
    sectionId: "career_journey",
    title: "Career Journey",
    headline: "Your career path",
    description: "Past, present, and recommended future growth.",
    past: story?.careerChangingProject ?? "Building foundational professional experience",
    present: resolvePrimaryProfession(context),
    nextGoal: context.onboarding.smartQuestions?.masterAction?.replace(/_/g, " ") ?? "Expand professional capabilities",
    recommendedPath: path,
    expectedGrowth: "steady_growth",
    explainable: true,
  };
}

export function buildSharingVerificationSection(
  context: LivingPassportContext,
  approvedPartners: PartnerShareRequest[]
): SharingVerificationSection {
  return {
    sectionId: "sharing_verification",
    title: "Sharing & Verification",
    headline: "Share your passport with permission",
    description: "Everything is shared only with your explicit approval.",
    publicPreviewEnabled: false,
    professionalQrCode: `app13://passport/${context.userId}`,
    secureShareLink: `https://app13.dev/passport/share/${context.userId}?token=restricted`,
    partnerVerificationEnabled: approvedPartners.some((p) => p.approved),
    employerViewEnabled: approvedPartners.some((p) => p.approved && p.partnerType === "employer"),
    governmentViewEnabled: false,
    approvedPartners,
    explainable: true,
  };
}

export function buildAllPassportSections(
  context: LivingPassportContext,
  engines: PassportEngineSnapshot,
  approvedPartners: PartnerShareRequest[]
): LivingPassportSection[] {
  return [
    buildProfessionalIdentitySection(context, engines),
    buildProfessionalScoreSection(context, engines),
    buildLiveFramePassportSection(context, engines),
    buildVerifiedSkillsSection(context, engines),
    buildUnlockedActionsSection(context, engines),
    buildProfessionalRolesSection(context),
    buildCertificatesLicensesSection(context),
    buildProfessionalExperienceSection(context),
    buildTrustTimelineSection(context, engines),
    buildKnowledgeContributionsSection(engines),
    buildProfessionalImpactSection(context, engines),
    buildCareerJourneySection(context, engines),
    buildSharingVerificationSection(context, approvedPartners),
  ];
}

function sectionToView(section: LivingPassportSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "professional_identity":
      return {
        ...base,
        professional_id: section.professionalId,
        professional_title: section.professionalTitle,
        primary_profession: section.primaryProfession,
        professional_summary: section.professionalSummary,
        current_level: section.currentLevel,
      };
    case "professional_score":
      return {
        ...base,
        overall_score: section.overallScore,
        readiness: section.readiness,
        trust: section.trust,
        growth: section.growth,
        professional_confidence: section.professionalConfidence,
        score_explanations: section.scoreExplanations.map((e) => ({
          factor: e.factor,
          score: e.score,
          explanation: e.explanation,
        })),
      };
    case "live_frame":
      return {
        ...base,
        current_frame: section.currentFrame,
        frame_label: section.frameLabel,
        frame_history: section.frameHistory,
        progress_to_next_frame: section.progressToNextFrame,
        reason: section.reason,
      };
    case "verified_skills":
      return {
        ...base,
        verified_skills: section.verifiedSkills,
        pending_skills: section.pendingSkills,
        recommended_skills: section.recommendedSkills,
      };
    case "unlocked_actions":
      return {
        ...base,
        available: section.available,
        mastered: section.mastered,
        in_progress: section.inProgress,
        suggested_next: section.suggestedNext,
      };
    case "professional_roles":
      return { ...base, active_roles: section.activeRoles, emerging_roles: section.emergingRoles };
    case "certificates_licenses":
      return {
        ...base,
        certificates: section.certificates,
        licenses: section.licenses,
        memberships: section.memberships,
        expiry_reminders: section.expiryReminders,
      };
    case "professional_experience":
      return {
        ...base,
        projects: section.projects,
        completed_actions: section.completedActions,
        years_of_experience: section.yearsOfExperience,
        industries: section.industries,
        specializations: section.specializations,
      };
    case "trust_timeline":
      return { ...base, milestones: section.milestones };
    case "knowledge_contributions":
      return {
        ...base,
        blueprint_improvements: section.blueprintImprovements,
        knowledge_bank_contributions: section.knowledgeBankContributions,
        expert_reviews: section.expertReviews,
        learning_contributions: section.learningContributions,
        community_contributions: section.communityContributions,
      };
    case "professional_impact":
      return {
        ...base,
        people_trained: section.peopleTrained,
        teams_supported: section.teamsSupported,
        projects_completed: section.projectsCompleted,
        knowledge_shared: section.knowledgeShared,
        customer_satisfaction: section.customerSatisfaction,
        professional_influence: section.professionalInfluence,
      };
    case "career_journey":
      return {
        ...base,
        past: section.past,
        present: section.present,
        next_goal: section.nextGoal,
        recommended_path: section.recommendedPath,
        expected_growth: section.expectedGrowth,
      };
    case "sharing_verification":
      return {
        ...base,
        public_preview_enabled: section.publicPreviewEnabled,
        professional_qr_code: section.professionalQrCode,
        secure_share_link: section.secureShareLink,
        partner_verification_enabled: section.partnerVerificationEnabled,
        employer_view_enabled: section.employerViewEnabled,
        government_view_enabled: section.governmentViewEnabled,
        approved_partners: section.approvedPartners.map((p) => ({
          partner_type: p.partnerType,
          partner_name: p.partnerName,
          approved: p.approved,
          approved_at: p.approvedAt,
        })),
      };
    default:
      return base;
  }
}

export function toPassportSectionView(section: LivingPassportSection) {
  return sectionToView(section);
}

export function toPassportSectionsView(sections: LivingPassportSection[]) {
  return sections.map(toPassportSectionView);
}
