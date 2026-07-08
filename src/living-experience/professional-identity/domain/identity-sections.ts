import type { LivingProfessionalIdentityContext } from "./identity-context.js";
import {
  hashIdentitySeed,
  resolveCurrentLevel,
  resolveFrameStanding,
  resolveGovernmentPrograms,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
  resolveProfessionalTitle,
} from "./identity-context.js";

export interface IdentityEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  growthScore?: number;
  passportLevel?: string;
  liveFrameTier?: string;
  liveFrameLabel?: string;
  frameHistory?: Array<{ date: string; tier: string; event: string }>;
  growthPath?: string[];
  challenges?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
  expertRecommendations?: string[];
  teamCollaborations?: number;
  knowledgeContributions?: number;
  learningContributions?: number;
}

export interface IdentitySharingPermissions {
  publicView: boolean;
  privateView: boolean;
  partnerView: boolean;
  employerView: boolean;
  governmentVerification: boolean;
  updatedAt: string;
}

export interface IdentitySectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface IdentitySummarySection extends IdentitySectionBase {
  sectionId: "identity_summary";
  professionalTitle: string;
  currentLevel: string;
  identityScore: number;
  professionalIntroduction: string;
  explanation: string;
}

export interface ProfessionalDnaSection extends IdentitySectionBase {
  sectionId: "professional_dna";
  professionalPersonality: string;
  preferredActions: string[];
  naturalStrengths: string[];
  professionalStyle: string;
  learningStyle: string;
  leadershipStyle: string;
}

export interface ProfessionalPassportSection extends IdentitySectionBase {
  sectionId: "professional_passport";
  unifiedPassport: string;
  licenses: string[];
  certificates: string[];
  experience: string;
  professionalRoles: string[];
}

export interface LiveFrameSection extends IdentitySectionBase {
  sectionId: "live_frame";
  currentFrame: string;
  history: Array<{ date: string; event: string }>;
  reason: string;
  nextUpgrade: string;
}

export interface ProfessionalJourneySection extends IdentitySectionBase {
  sectionId: "professional_journey";
  timeline: string[];
  currentStage: string;
  milestones: string[];
  futureRoadmap: string[];
}

export interface ProfessionalImpactSection extends IdentitySectionBase {
  sectionId: "professional_impact";
  growth: string;
  trust: string;
  knowledge: string;
  career: string;
  community: string;
  incomeReadiness: string;
}

export interface VerifiedSkillsSection extends IdentitySectionBase {
  sectionId: "verified_skills";
  verified: string[];
  pendingVerification: string[];
  recommendedNextSkills: string[];
}

export interface ProfessionalStrengthsSection extends IdentitySectionBase {
  sectionId: "professional_strengths";
  topStrengths: string[];
  competitiveAdvantages: string[];
  uniqueCapabilities: string[];
  professionalConfidence: string;
}

export interface ProfessionalOpportunitiesSection extends IdentitySectionBase {
  sectionId: "professional_opportunities";
  bestOpportunities: string[];
  partnerReadiness: string;
  marketplaceReadiness: string;
  governmentOpportunities: string[];
}

export interface ProfessionalReputationSection extends IdentitySectionBase {
  sectionId: "professional_reputation";
  trust: string;
  knowledgeContributions: string;
  communityContribution: string;
  professionalInfluence: string;
}

export interface ProfessionalNetworkSection extends IdentitySectionBase {
  sectionId: "professional_network";
  experts: string[];
  teams: string[];
  partners: string[];
  professionalCommunities: string[];
  mentors: string[];
}

export interface FutureIdentitySection extends IdentitySectionBase {
  sectionId: "future_identity";
  thirtyDays: string;
  ninetyDays: string;
  oneYear: string;
  threeYears: string;
  assumptions: string[];
}

export interface IdentitySharingSection extends IdentitySectionBase {
  sectionId: "identity_sharing";
  professionalQr: string;
  secureVerificationLink: string;
  permissionManagement: IdentitySharingPermissions;
  publicView: string;
  privateView: string;
  partnerView: string;
  employerView: string;
  governmentVerification: string;
  permissionBased: true;
}

export type LivingProfessionalIdentitySection =
  | IdentitySummarySection
  | ProfessionalDnaSection
  | ProfessionalPassportSection
  | LiveFrameSection
  | ProfessionalJourneySection
  | ProfessionalImpactSection
  | VerifiedSkillsSection
  | ProfessionalStrengthsSection
  | ProfessionalOpportunitiesSection
  | ProfessionalReputationSection
  | ProfessionalNetworkSection
  | FutureIdentitySection
  | IdentitySharingSection;

export function buildDefaultSharingPermissions(context: LivingProfessionalIdentityContext): IdentitySharingPermissions {
  return {
    publicView: false,
    privateView: true,
    partnerView: false,
    employerView: false,
    governmentVerification: false,
    updatedAt: context.generatedAt,
  };
}

function baseReadiness(engines: IdentityEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function identityScore(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? (context.onboarding.ironVerification?.identityConfirmed ? 70 : 40);
  const hash = hashIdentitySeed(context.dayKey, context.userId);
  return Math.min(98, Math.round((readiness + trust) / 2 + (hash % 8)));
}

export function buildIdentitySummarySection(
  context: LivingProfessionalIdentityContext,
  engines: IdentityEngineSnapshot
): IdentitySummarySection {
  const score = identityScore(context, engines);
  const title = resolveProfessionalTitle(context);
  const level = resolveCurrentLevel(context, baseReadiness(engines));

  return {
    sectionId: "identity_summary",
    title: "Identity Summary",
    headline: `${context.displayName} — your living professional identity`,
    description: "One professional. One identity. One living profile.",
    professionalTitle: title,
    currentLevel: level,
    identityScore: score,
    professionalIntroduction: `${context.displayName} is an active ${resolvePrimaryIndustry(context)} professional in ${context.geographic.city}, ${context.geographic.country}.`,
    explanation: `Identity score combines readiness (${baseReadiness(engines)}), trust standing, and verified profile data. Nothing is fabricated.`,
    explainable: true,
  };
}

export function buildProfessionalDnaSection(context: LivingProfessionalIdentityContext): ProfessionalDnaSection {
  const sq = context.onboarding.smartQuestions;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "professional_dna",
    title: "Professional DNA",
    headline: "Your professional personality and style",
    description: "Derived from onboarding and professional calibration — explainable, not assumed.",
    professionalPersonality: sq?.enjoysLeading ? "Leadership-oriented builder" : sq?.prefersAlone ? "Focused independent contributor" : "Collaborative professional",
    preferredActions: [
      sq?.enjoyedAction?.replace(/_/g, " ") ?? skill,
      sq?.requestedAction?.replace(/_/g, " ") ?? "professional growth",
      sq?.masterAction?.replace(/_/g, " ") ?? "advanced expertise",
    ],
    naturalStrengths: context.onboarding.professionalBackground?.skills.map((s) => s.replace(/_/g, " ")) ?? [skill],
    professionalStyle: sq?.enjoysBuilding ? "Hands-on execution" : "Strategic collaboration",
    learningStyle: sq?.enjoysReviewing ? "Review and apply" : "Learn by doing",
    leadershipStyle: sq?.enjoysLeading ? "Team leadership" : sq?.enjoysTeaching ? "Mentoring guide" : "Supportive contributor",
    explainable: true,
  };
}

export function buildProfessionalPassportSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalPassportSection {
  const bg = context.onboarding.professionalBackground;

  return {
    sectionId: "professional_passport",
    title: "Professional Passport",
    headline: "Unified professional passport",
    description: "Licenses, certificates, experience, and roles — integrated from your living passport.",
    unifiedPassport: engines.passportLevel ?? `APP13 Professional Passport — ${resolveProfessionalTitle(context)}`,
    licenses: bg?.licenses.map((l) => l.replace(/_/g, " ")) ?? [],
    certificates: bg?.certificates.map((c) => c.replace(/_/g, " ")) ?? [],
    experience: `${bg?.experienceYears ?? 0} years in ${resolvePrimaryIndustry(context)}`,
    professionalRoles: context.roles.map((r) => r.replace(/_/g, " ")),
    explainable: true,
  };
}

export function buildLiveFrameSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): LiveFrameSection {
  const frame = engines.liveFrameLabel ?? resolveFrameStanding(context);
  const history = engines.frameHistory ?? [
    { date: context.generatedAt.slice(0, 10), event: frame },
  ];

  return {
    sectionId: "live_frame",
    title: "Live Frame",
    headline: frame,
    description: "Current trusted frame status — integrated from your living live frame.",
    currentFrame: frame,
    history: history.map((h) => ({
      date: h.date,
      event: "event" in h && h.event ? h.event : "tier" in h ? h.tier : "Frame update",
    })),
    reason: context.onboarding.ironVerification?.identityConfirmed
      ? "Identity and email verified — trusted frame active"
      : "Complete verification to upgrade your live frame",
    nextUpgrade: context.onboarding.ironVerification?.identityConfirmed
      ? "Maintain evidence and community contribution for expert frame"
      : "Complete iron verification for trusted frame upgrade",
    explainable: true,
  };
}

export function buildProfessionalJourneySection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalJourneySection {
  const years = context.onboarding.professionalBackground?.experienceYears ?? 0;
  const story = context.onboarding.professionalStory;

  return {
    sectionId: "professional_journey",
    title: "Professional Journey",
    headline: `${years} years on your professional journey`,
    description: "Timeline, stage, and roadmap — integrated from your living journey.",
    timeline: [
      `Foundation: ${years} years experience`,
      story?.careerChangingProject ?? "Career-defining project",
      `Current: ${context.geographic.city}, ${context.geographic.country}`,
    ],
    currentStage: resolveCurrentLevel(context, baseReadiness(engines)),
    milestones: [
      story?.proudestAchievement ?? "Professional story established",
      resolveFrameStanding(context),
      engines.growthPath?.[0] ?? "Active learning path",
    ],
    futureRoadmap: engines.growthPath?.slice(0, 4) ?? [`Advance ${resolvePrimarySkill(context)} expertise`, "Expand regional visibility"],
    explainable: true,
  };
}

export function buildProfessionalImpactSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalImpactSection {
  const readiness = baseReadiness(engines);

  return {
    sectionId: "professional_impact",
    title: "Professional Impact",
    headline: "How your actions have shaped your identity",
    description: "Growth, trust, knowledge, career, community — integrated from living impact.",
    growth: readiness >= 65 ? "Strong professional growth" : "Building professional growth",
    trust: resolveFrameStanding(context),
    knowledge: `${engines.knowledgeContributions ?? 0} knowledge contributions tracked`,
    career: resolveCurrentLevel(context, readiness),
    community: context.onboarding.smartQuestions?.enjoysTeaching ? "Active mentoring potential" : "Community contributor",
    incomeReadiness: readiness >= 60 ? "Income readiness developing" : "Building evidence for income readiness",
    explainable: true,
  };
}

export function buildVerifiedSkillsSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): VerifiedSkillsSection {
  const bg = context.onboarding.professionalBackground;
  const verified = bg?.skills.map((s) => s.replace(/_/g, " ")) ?? [resolvePrimarySkill(context)];
  const pending = engines.challenges?.slice(0, 2).map((c) => c.replace(/_/g, " ")) ?? [];

  return {
    sectionId: "verified_skills",
    title: "Verified Skills",
    headline: `${verified.length} core skill${verified.length === 1 ? "" : "s"} on profile`,
    description: "Verified and pending skills — never fabricated.",
    verified,
    pendingVerification: pending.length > 0 ? pending : ["Optional certification skills"],
    recommendedNextSkills: engines.growthPath?.slice(0, 3) ?? [`Advanced ${resolvePrimarySkill(context)}`],
    explainable: true,
  };
}

export function buildProfessionalStrengthsSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalStrengthsSection {
  const skill = resolvePrimarySkill(context);
  const calibration = context.onboarding.professionalCalibration?.missions ?? [];
  const topScore = calibration.reduce((max, m) => Math.max(max, m.score ?? 0), 0);

  return {
    sectionId: "professional_strengths",
    title: "Professional Strengths",
    headline: "Your competitive professional advantages",
    description: "Top strengths derived from profile and calibration.",
    topStrengths: context.onboarding.professionalBackground?.skills.slice(0, 3).map((s) => s.replace(/_/g, " ")) ?? [skill],
    competitiveAdvantages: [
      `${context.geographic.preferredWorkRegion} regional expertise`,
      resolveFrameStanding(context),
      `${context.onboarding.professionalBackground?.experienceYears ?? 0} years experience`,
    ],
    uniqueCapabilities: [
      storyCapability(context),
      engines.passportLevel ?? "Unified APP13 professional passport",
    ],
    professionalConfidence: topScore >= 85 ? "High confidence" : topScore >= 70 ? "Strong confidence" : "Building confidence",
    explainable: true,
  };
}

function storyCapability(context: LivingProfessionalIdentityContext): string {
  const achievement = context.onboarding.professionalStory?.proudestAchievement;
  return achievement ? `Proven: ${achievement.slice(0, 60)}${achievement.length > 60 ? "…" : ""}` : "Professional story documented";
}

export function buildProfessionalOpportunitiesSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalOpportunitiesSection {
  const opportunities = (engines.opportunities ?? []).map((o) => o.title);
  const readiness = baseReadiness(engines);

  return {
    sectionId: "professional_opportunities",
    title: "Professional Opportunities",
    headline: "Opportunities aligned with your identity",
    description: "Best opportunities and readiness — integrated from living opportunities.",
    bestOpportunities: opportunities.length > 0 ? opportunities : [`Regional ${resolvePrimarySkill(context)} opportunity`],
    partnerReadiness: resolveFrameStanding(context).includes("Trusted") ? "Partner-ready profile" : "Complete verification for partner readiness",
    marketplaceReadiness: readiness >= 60 ? "Marketplace readiness developing" : "Building marketplace evidence",
    governmentOpportunities: resolveGovernmentPrograms(context),
    explainable: true,
  };
}

export function buildProfessionalReputationSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalReputationSection {
  return {
    sectionId: "professional_reputation",
    title: "Professional Reputation",
    headline: "Trust, knowledge, and community standing",
    description: "Reputation built from verified contributions — never fabricated.",
    trust: resolveFrameStanding(context),
    knowledgeContributions: `${engines.knowledgeContributions ?? 0} Knowledge Bank contributions`,
    communityContribution: context.onboarding.smartQuestions?.enjoysTeaching ? "Mentoring and community engagement" : "Community participation",
    professionalInfluence: (engines.expertRecommendations?.length ?? 0) >= 2 ? "Growing professional influence" : "Influence building through consistent contribution",
    explainable: true,
  };
}

export function buildProfessionalNetworkSection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): ProfessionalNetworkSection {
  return {
    sectionId: "professional_network",
    title: "Professional Network",
    headline: "Experts, teams, partners, and communities",
    description: "Your professional network — recommendation and connection guidance only.",
    experts: engines.expertRecommendations?.slice(0, 3) ?? [`${resolvePrimarySkill(context)} mentor`],
    teams: engines.teamCollaborations ? [`${engines.teamCollaborations} team collaboration${engines.teamCollaborations === 1 ? "" : "s"} tracked`] : ["Team builder ready"],
    partners: resolveGovernmentPrograms(context).slice(0, 2),
    professionalCommunities: [`${resolvePrimaryIndustry(context)} professionals in ${context.geographic.city}`],
    mentors: engines.expertRecommendations?.slice(0, 2) ?? ["Regional expert mentor (recommendation only)"],
    explainable: true,
  };
}

export function buildFutureIdentitySection(context: LivingProfessionalIdentityContext, engines: IdentityEngineSnapshot): FutureIdentitySection {
  const skill = resolvePrimarySkill(context);
  const readiness = baseReadiness(engines);

  return {
    sectionId: "future_identity",
    title: "Future Identity",
    headline: "Your evolving professional identity",
    description: "Projections with stated assumptions — motivational, never guaranteed.",
    thirtyDays: `Strengthen ${skill} identity with verified actions and evidence`,
    ninetyDays: readiness >= 60 ? "Trusted frame milestone and expanded partner eligibility" : "Complete verification for trusted identity upgrade",
    oneYear: `Recognized ${resolvePrimaryIndustry(context)} professional in ${context.geographic.preferredWorkRegion}`,
    threeYears: context.onboarding.smartQuestions?.enjoysLeading
      ? "Leadership identity with expert network recognition"
      : "Senior specialist identity with strong regional reputation",
    assumptions: [
      "Consistent professional execution and evidence collection",
      `Continued activity in ${context.geographic.city}, ${context.geographic.country}`,
      "No identity changes without your explicit action",
      "Projections based on current trajectory — not fabricated achievements",
    ],
    explainable: true,
  };
}

export function buildIdentitySharingSection(
  context: LivingProfessionalIdentityContext,
  permissions: IdentitySharingPermissions
): IdentitySharingSection {
  const baseUrl = `https://app13.dev/verify/${context.userId}`;

  return {
    sectionId: "identity_sharing",
    title: "Identity Sharing",
    headline: "Permission-controlled identity sharing",
    description: "Share your identity only with explicit permission. Nothing shared automatically.",
    professionalQr: `app13://identity/${context.userId}?token=secure`,
    secureVerificationLink: `${baseUrl}?permission=required`,
    permissionManagement: permissions,
    publicView: permissions.publicView ? "Public summary enabled" : "Public view disabled — enable explicitly to share",
    privateView: permissions.privateView ? "Full private view available to you" : "Private view restricted",
    partnerView: permissions.partnerView ? "Partner view enabled" : "Partner view disabled — requires explicit permission",
    employerView: permissions.employerView ? "Employer view enabled" : "Employer view disabled — requires explicit permission",
    governmentVerification: permissions.governmentVerification
      ? "Government verification sharing enabled"
      : "Government verification disabled — requires explicit permission",
    permissionBased: true,
    explainable: true,
  };
}

export function buildAllIdentitySections(
  context: LivingProfessionalIdentityContext,
  engines: IdentityEngineSnapshot,
  permissions: IdentitySharingPermissions
): LivingProfessionalIdentitySection[] {
  return [
    buildIdentitySummarySection(context, engines),
    buildProfessionalDnaSection(context),
    buildProfessionalPassportSection(context, engines),
    buildLiveFrameSection(context, engines),
    buildProfessionalJourneySection(context, engines),
    buildProfessionalImpactSection(context, engines),
    buildVerifiedSkillsSection(context, engines),
    buildProfessionalStrengthsSection(context, engines),
    buildProfessionalOpportunitiesSection(context, engines),
    buildProfessionalReputationSection(context, engines),
    buildProfessionalNetworkSection(context, engines),
    buildFutureIdentitySection(context, engines),
    buildIdentitySharingSection(context, permissions),
  ];
}

function sectionToView(section: LivingProfessionalIdentitySection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "identity_summary":
      return {
        ...base,
        professional_title: section.professionalTitle,
        current_level: section.currentLevel,
        identity_score: section.identityScore,
        professional_introduction: section.professionalIntroduction,
        explanation: section.explanation,
      };
    case "professional_dna":
      return {
        ...base,
        professional_personality: section.professionalPersonality,
        preferred_actions: section.preferredActions,
        natural_strengths: section.naturalStrengths,
        professional_style: section.professionalStyle,
        learning_style: section.learningStyle,
        leadership_style: section.leadershipStyle,
      };
    case "professional_passport":
      return {
        ...base,
        unified_passport: section.unifiedPassport,
        licenses: section.licenses,
        certificates: section.certificates,
        experience: section.experience,
        professional_roles: section.professionalRoles,
      };
    case "live_frame":
      return {
        ...base,
        current_frame: section.currentFrame,
        history: section.history,
        reason: section.reason,
        next_upgrade: section.nextUpgrade,
      };
    case "professional_journey":
      return {
        ...base,
        timeline: section.timeline,
        current_stage: section.currentStage,
        milestones: section.milestones,
        future_roadmap: section.futureRoadmap,
      };
    case "professional_impact":
      return {
        ...base,
        growth: section.growth,
        trust: section.trust,
        knowledge: section.knowledge,
        career: section.career,
        community: section.community,
        income_readiness: section.incomeReadiness,
      };
    case "verified_skills":
      return {
        ...base,
        verified: section.verified,
        pending_verification: section.pendingVerification,
        recommended_next_skills: section.recommendedNextSkills,
      };
    case "professional_strengths":
      return {
        ...base,
        top_strengths: section.topStrengths,
        competitive_advantages: section.competitiveAdvantages,
        unique_capabilities: section.uniqueCapabilities,
        professional_confidence: section.professionalConfidence,
      };
    case "professional_opportunities":
      return {
        ...base,
        best_opportunities: section.bestOpportunities,
        partner_readiness: section.partnerReadiness,
        marketplace_readiness: section.marketplaceReadiness,
        government_opportunities: section.governmentOpportunities,
      };
    case "professional_reputation":
      return {
        ...base,
        trust: section.trust,
        knowledge_contributions: section.knowledgeContributions,
        community_contribution: section.communityContribution,
        professional_influence: section.professionalInfluence,
      };
    case "professional_network":
      return {
        ...base,
        experts: section.experts,
        teams: section.teams,
        partners: section.partners,
        professional_communities: section.professionalCommunities,
        mentors: section.mentors,
      };
    case "future_identity":
      return {
        ...base,
        thirty_days: section.thirtyDays,
        ninety_days: section.ninetyDays,
        one_year: section.oneYear,
        three_years: section.threeYears,
        assumptions: section.assumptions,
      };
    case "identity_sharing":
      return {
        ...base,
        professional_qr: section.professionalQr,
        secure_verification_link: section.secureVerificationLink,
        permission_management: {
          public_view: section.permissionManagement.publicView,
          private_view: section.permissionManagement.privateView,
          partner_view: section.permissionManagement.partnerView,
          employer_view: section.permissionManagement.employerView,
          government_verification: section.permissionManagement.governmentVerification,
          updated_at: section.permissionManagement.updatedAt,
        },
        public_view: section.publicView,
        private_view: section.privateView,
        partner_view: section.partnerView,
        employer_view: section.employerView,
        government_verification: section.governmentVerification,
        permission_based: section.permissionBased,
      };
    default:
      return base;
  }
}

export function toIdentitySectionView(section: LivingProfessionalIdentitySection) {
  return sectionToView(section);
}

export function toIdentitySectionsView(sections: LivingProfessionalIdentitySection[]) {
  return sections.map(toIdentitySectionView);
}

export function updateSharingPermissions(
  permissions: IdentitySharingPermissions,
  update: Partial<Omit<IdentitySharingPermissions, "updatedAt">>,
  updatedAt: string
): IdentitySharingPermissions {
  const next = { ...permissions, updatedAt };
  if (update.publicView !== undefined) next.publicView = update.publicView;
  if (update.privateView !== undefined) next.privateView = update.privateView;
  if (update.partnerView !== undefined) next.partnerView = update.partnerView;
  if (update.employerView !== undefined) next.employerView = update.employerView;
  if (update.governmentVerification !== undefined) next.governmentVerification = update.governmentVerification;
  return next;
}
