import type { Credential, CredentialStatus, VerificationStatus, VerificationTier } from "../../../identity/domain/user.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustHistoryView, TrustProfileView } from "../../../trust/domain/trust-profile-view.js";
import { resolveConfidenceBand } from "../../../trust/domain/trust-event.js";
import {
  buildTrustOverview,
  type TrustOverview,
  type TrustOverviewView,
  toTrustOverviewView,
} from "../../trust-reputation/domain/trust-reputation-experience.js";
import type { PlatformTrustContext } from "../../live-frame/domain/live-frame-experience.js";

export type PassportLevel = "bronze" | "silver" | "gold" | "platinum" | "elite";

export const PASSPORT_LEVEL_ORDER: PassportLevel[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "elite",
];

export const PASSPORT_LEVEL_LABELS: Record<PassportLevel, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  elite: "Elite",
};

const TIER_ORDER: VerificationTier[] = ["T0", "T1", "T2", "T3", "T4"];

export interface ProfessionalPassportSnapshot {
  publicProfile: ProviderPublicProfileView;
  trustProfile: TrustProfileView;
  trustHistory: TrustHistoryView;
  verificationTier: VerificationTier;
  verificationStatus: VerificationStatus;
  verificationReviewedAt: Date | null;
  credentials: Credential[];
  platformContext: PlatformTrustContext;
}

export interface IdentityProfile {
  providerId: string;
  userId: string;
  displayName: string;
  businessName: string | null;
  bio: string | null;
  primaryTrade: string | null;
  slug: string | null;
  status: string;
  offeredActions: ProviderPublicProfileView["offered_actions"];
  summary: string;
}

export interface VerificationStatusSummary {
  verificationTier: VerificationTier;
  verificationStatus: VerificationStatus;
  tierLabel: string;
  statusLabel: string;
  reviewedAt: string | null;
  summary: string;
}

export interface PerformanceMetrics {
  completedContracts: number;
  cancelledContracts: number;
  completionRate: number;
  averageRating: number;
  evaluationCount: number;
  issuesRaised: number;
  issuesResolved: number;
  activeIssues: number;
  trustScore: number;
  confidenceBand: "low" | "medium" | "high";
  verificationScore: number;
  customerRatingScore: number;
  completionRateScore: number;
  cleanRecordScore: number;
  summary: string;
}

export interface LicenseRecord {
  id: string;
  name: string;
  type: string;
  issuingAuthority: string | null;
  status: CredentialStatus;
  issuedAt: string | null;
  expiresAt: string | null;
  summary: string;
}

export interface CertificationRecord {
  id: string;
  name: string;
  type: string;
  issuingAuthority: string | null;
  status: CredentialStatus;
  issuedAt: string | null;
  expiresAt: string | null;
  summary: string;
}

export interface ProfessionalBadge {
  badgeId: string;
  label: string;
  category: "passport_level" | "trust" | "credential" | "performance";
  description: string;
  earned: boolean;
  summary: string;
}

export interface PassportLevelAssessment {
  level: PassportLevel;
  label: string;
  trustScore: number;
  verificationTier: VerificationTier;
  verifiedCredentialCount: number;
  verifiedLicenseCount: number;
  summary: string;
  nextLevel: PassportLevel | null;
  nextLevelLabel: string | null;
  progressPercent: number;
  requirementsSummary: string;
}

export interface ProfessionalPassport {
  userId: string;
  providerId: string;
  identity: IdentityProfile;
  verification: VerificationStatusSummary;
  trust: TrustOverview;
  performance: PerformanceMetrics;
  licenses: LicenseRecord[];
  certifications: CertificationRecord[];
  badges: ProfessionalBadge[];
  passportLevel: PassportLevelAssessment;
  generatedAt: Date;
}

export interface IdentityProfileView {
  provider_id: string;
  user_id: string;
  display_name: string;
  business_name: string | null;
  bio: string | null;
  primary_trade: string | null;
  slug: string | null;
  status: string;
  offered_actions: ProviderPublicProfileView["offered_actions"];
  summary: string;
}

export interface VerificationStatusSummaryView {
  verification_tier: VerificationTier;
  verification_status: VerificationStatus;
  tier_label: string;
  status_label: string;
  reviewed_at: string | null;
  summary: string;
}

export interface PerformanceMetricsView {
  completed_contracts: number;
  cancelled_contracts: number;
  completion_rate: number;
  average_rating: number;
  evaluation_count: number;
  issues_raised: number;
  issues_resolved: number;
  active_issues: number;
  trust_score: number;
  confidence_band: "low" | "medium" | "high";
  verification_score: number;
  customer_rating_score: number;
  completion_rate_score: number;
  clean_record_score: number;
  summary: string;
}

export interface LicenseRecordView {
  id: string;
  name: string;
  type: string;
  issuing_authority: string | null;
  status: CredentialStatus;
  issued_at: string | null;
  expires_at: string | null;
  summary: string;
}

export interface CertificationRecordView {
  id: string;
  name: string;
  type: string;
  issuing_authority: string | null;
  status: CredentialStatus;
  issued_at: string | null;
  expires_at: string | null;
  summary: string;
}

export interface ProfessionalBadgeView {
  badge_id: string;
  label: string;
  category: "passport_level" | "trust" | "credential" | "performance";
  description: string;
  earned: boolean;
  summary: string;
}

export interface PassportLevelAssessmentView {
  level: PassportLevel;
  label: string;
  trust_score: number;
  verification_tier: VerificationTier;
  verified_credential_count: number;
  verified_license_count: number;
  summary: string;
  next_level: PassportLevel | null;
  next_level_label: string | null;
  progress_percent: number;
  requirements_summary: string;
}

export interface ProfessionalPassportView {
  user_id: string;
  provider_id: string;
  identity: IdentityProfileView;
  verification: VerificationStatusSummaryView;
  trust: TrustOverviewView;
  performance: PerformanceMetricsView;
  licenses: LicenseRecordView[];
  certifications: CertificationRecordView[];
  badges: ProfessionalBadgeView[];
  passport_level: PassportLevelAssessmentView;
  generated_at: string;
}

export interface PublicProfessionalPassportView {
  provider_id: string;
  user_id: string;
  display_name: string;
  passport_level: PassportLevel;
  passport_level_label: string;
  trust_score: number;
  trust_label: string;
  verification_tier: VerificationTier;
  verified_license_count: number;
  verified_certification_count: number;
  completed_contracts: number;
  average_rating: number;
  badges: ProfessionalBadgeView[];
  safe_for_public: boolean;
  generated_at: string;
}

function tierAtLeast(current: VerificationTier, target: VerificationTier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(target);
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function verificationTierLabel(tier: VerificationTier): string {
  switch (tier) {
    case "T0":
      return "Email verified";
    case "T1":
      return "Identity verified";
    case "T2":
      return "Professional credentials verified";
    case "T3":
      return "Business verified";
    case "T4":
      return "Regulated attestation verified";
    default:
      return tier;
  }
}

function verificationStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "submitted":
      return "Submitted";
    case "under_review":
      return "Under review";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return "Pending";
  }
}

export function isLicenseCredential(credential: Pick<Credential, "credentialType">): boolean {
  const type = credential.credentialType.toLowerCase();
  return type.includes("license") || type.includes("licence");
}

export function isCertificationCredential(
  credential: Pick<Credential, "credentialType">
): boolean {
  return !isLicenseCredential(credential);
}

export interface PassportLevelInput {
  trustScore: number;
  verificationTier: VerificationTier;
  completedContracts: number;
  averageRating: number;
  activeIssues: number;
  verifiedCredentialCount: number;
  verifiedLicenseCount: number;
}

export function computePassportLevel(input: PassportLevelInput): PassportLevel {
  const rules: Array<{ level: PassportLevel; meets: (value: PassportLevelInput) => boolean }> = [
    {
      level: "elite",
      meets: (value) =>
        value.trustScore >= 95 &&
        value.verificationTier === "T4" &&
        value.completedContracts >= 25 &&
        value.verifiedCredentialCount >= 2 &&
        value.activeIssues === 0 &&
        value.averageRating >= 4.5,
    },
    {
      level: "platinum",
      meets: (value) =>
        value.trustScore >= 85 &&
        tierAtLeast(value.verificationTier, "T3") &&
        value.completedContracts >= 10 &&
        value.activeIssues === 0 &&
        value.averageRating >= 4.0,
    },
    {
      level: "gold",
      meets: (value) =>
        value.trustScore >= 70 &&
        tierAtLeast(value.verificationTier, "T2") &&
        value.completedContracts >= 3 &&
        (value.verifiedLicenseCount >= 1 || value.verifiedCredentialCount >= 1),
    },
    {
      level: "silver",
      meets: (value) =>
        value.trustScore >= 50 &&
        tierAtLeast(value.verificationTier, "T1") &&
        value.completedContracts >= 1,
    },
    {
      level: "bronze",
      meets: () => true,
    },
  ];

  for (const rule of rules) {
    if (rule.meets(input)) {
      return rule.level;
    }
  }

  return "bronze";
}

export function buildPassportLevelAssessment(input: PassportLevelInput): PassportLevelAssessment {
  const level = computePassportLevel(input);
  const currentIndex = PASSPORT_LEVEL_ORDER.indexOf(level);
  const nextLevel =
    currentIndex < PASSPORT_LEVEL_ORDER.length - 1
      ? PASSPORT_LEVEL_ORDER[currentIndex + 1]!
      : null;

  const progressPercent =
    nextLevel === null ? 100 : Math.round(((currentIndex + 1) / PASSPORT_LEVEL_ORDER.length) * 100);

  return {
    level,
    label: PASSPORT_LEVEL_LABELS[level],
    trustScore: input.trustScore,
    verificationTier: input.verificationTier,
    verifiedCredentialCount: input.verifiedCredentialCount,
    verifiedLicenseCount: input.verifiedLicenseCount,
    summary: `${PASSPORT_LEVEL_LABELS[level]} passport level with trust score ${input.trustScore} and verification tier ${input.verificationTier}.`,
    nextLevel,
    nextLevelLabel: nextLevel ? PASSPORT_LEVEL_LABELS[nextLevel] : null,
    progressPercent,
    requirementsSummary: nextLevel
      ? `Advance to ${PASSPORT_LEVEL_LABELS[nextLevel]} by improving trust score, verification tier, credentials, and contract performance.`
      : "Maximum passport level reached.",
  };
}

export function buildIdentityProfile(profile: ProviderPublicProfileView): IdentityProfile {
  return {
    providerId: profile.provider_id,
    userId: profile.user_id,
    displayName: profile.display_name,
    businessName: profile.business_name,
    bio: profile.bio,
    primaryTrade: profile.primary_trade,
    slug: profile.slug,
    status: profile.status,
    offeredActions: profile.offered_actions,
    summary: `${profile.display_name} offers ${profile.offered_actions.length} published action${
      profile.offered_actions.length === 1 ? "" : "s"
    }.`,
  };
}

export function buildVerificationStatusSummary(input: {
  verificationTier: VerificationTier;
  verificationStatus: VerificationStatus;
  verificationReviewedAt: Date | null;
}): VerificationStatusSummary {
  return {
    verificationTier: input.verificationTier,
    verificationStatus: input.verificationStatus,
    tierLabel: verificationTierLabel(input.verificationTier),
    statusLabel: verificationStatusLabel(input.verificationStatus),
    reviewedAt: toIso(input.verificationReviewedAt),
    summary: `${verificationTierLabel(input.verificationTier)} with status ${verificationStatusLabel(
      input.verificationStatus
    )}.`,
  };
}

export function buildPerformanceMetrics(input: {
  profile: ProviderPublicProfileView;
  trustProfile: TrustProfileView;
}): PerformanceMetrics {
  const confidenceBand = resolveConfidenceBand(input.trustProfile.completed_contracts);

  return {
    completedContracts: input.profile.completion_summary.completed_contracts,
    cancelledContracts: input.profile.completion_summary.cancelled_contracts,
    completionRate: input.profile.completion_summary.completion_rate,
    averageRating: input.profile.rating_summary.average_rating,
    evaluationCount: input.profile.rating_summary.evaluation_count,
    issuesRaised: input.profile.dispute_summary.issues_raised,
    issuesResolved: input.profile.dispute_summary.issues_resolved,
    activeIssues: input.profile.dispute_summary.active_issues,
    trustScore: input.trustProfile.trust_score,
    confidenceBand,
    verificationScore: input.trustProfile.breakdown.verification_score,
    customerRatingScore: input.trustProfile.breakdown.customer_rating_score,
    completionRateScore: input.trustProfile.breakdown.completion_rate_score,
    cleanRecordScore: input.trustProfile.breakdown.clean_record_score,
    summary: `${input.profile.completion_summary.completed_contracts} completed contracts, ${confidenceBand} confidence band, trust score ${input.trustProfile.trust_score}.`,
  };
}

function buildCredentialSummary(credential: Credential): string {
  return `${credential.credentialName} (${credential.status})${
    credential.expiresAt ? ` expires ${credential.expiresAt.toISOString().slice(0, 10)}` : ""
  }.`;
}

export function buildLicenses(credentials: Credential[]): LicenseRecord[] {
  return credentials
    .filter(isLicenseCredential)
    .map((credential) => ({
      id: credential.id,
      name: credential.credentialName,
      type: credential.credentialType,
      issuingAuthority: credential.issuingAuthority,
      status: credential.status,
      issuedAt: toIso(credential.issuedAt),
      expiresAt: toIso(credential.expiresAt),
      summary: buildCredentialSummary(credential),
    }));
}

export function buildCertifications(credentials: Credential[]): CertificationRecord[] {
  return credentials
    .filter(isCertificationCredential)
    .map((credential) => ({
      id: credential.id,
      name: credential.credentialName,
      type: credential.credentialType,
      issuingAuthority: credential.issuingAuthority,
      status: credential.status,
      issuedAt: toIso(credential.issuedAt),
      expiresAt: toIso(credential.expiresAt),
      summary: buildCredentialSummary(credential),
    }));
}

export function buildProfessionalBadges(input: {
  passportLevel: PassportLevelAssessment;
  trustProfile: TrustProfileView;
  credentials: Credential[];
  performance: PerformanceMetrics;
}): ProfessionalBadge[] {
  const badges: ProfessionalBadge[] = [
    {
      badgeId: `passport-${input.passportLevel.level}`,
      label: `${input.passportLevel.label} Passport`,
      category: "passport_level",
      description: `Professional passport level ${input.passportLevel.label}.`,
      earned: true,
      summary: input.passportLevel.summary,
    },
    {
      badgeId: input.trustProfile.badge.badge_id,
      label: input.trustProfile.badge.label,
      category: "trust",
      description: input.trustProfile.badge.description,
      earned: true,
      summary: `Trust badge ${input.trustProfile.badge.label}.`,
    },
  ];

  if (input.performance.completedContracts >= 10) {
    badges.push({
      badgeId: "performance-ten-contracts",
      label: "Ten Contracts Completed",
      category: "performance",
      description: "Completed ten or more contracts on APP13.",
      earned: true,
      summary: "Performance badge for sustained contract delivery.",
    });
  }

  for (const credential of input.credentials.filter((entry) => entry.status === "verified")) {
    badges.push({
      badgeId: `credential-${credential.id}`,
      label: credential.credentialName,
      category: "credential",
      description: `Verified ${credential.credentialType}.`,
      earned: true,
      summary: buildCredentialSummary(credential),
    });
  }

  return badges;
}

export function buildProfessionalPassport(input: {
  snapshot: ProfessionalPassportSnapshot;
  generatedAt?: Date;
}): ProfessionalPassport {
  const { snapshot } = input;
  const identity = buildIdentityProfile(snapshot.publicProfile);
  const verification = buildVerificationStatusSummary({
    verificationTier: snapshot.verificationTier,
    verificationStatus: snapshot.verificationStatus,
    verificationReviewedAt: snapshot.verificationReviewedAt,
  });
  const trust = buildTrustOverview({
    profile: snapshot.trustProfile,
    platformContext: snapshot.platformContext,
    verificationTier: snapshot.verificationTier,
  });
  const performance = buildPerformanceMetrics({
    profile: snapshot.publicProfile,
    trustProfile: snapshot.trustProfile,
  });

  const verifiedCredentials = snapshot.credentials.filter(
    (credential) => credential.status === "verified"
  );
  const verifiedLicenses = verifiedCredentials.filter(isLicenseCredential);

  const passportLevel = buildPassportLevelAssessment({
    trustScore: snapshot.trustProfile.trust_score,
    verificationTier: snapshot.verificationTier,
    completedContracts: performance.completedContracts,
    averageRating: performance.averageRating,
    activeIssues: performance.activeIssues,
    verifiedCredentialCount: verifiedCredentials.length,
    verifiedLicenseCount: verifiedLicenses.length,
  });

  const licenses = buildLicenses(snapshot.credentials);
  const certifications = buildCertifications(snapshot.credentials);
  const badges = buildProfessionalBadges({
    passportLevel,
    trustProfile: snapshot.trustProfile,
    credentials: snapshot.credentials,
    performance,
  });

  return {
    userId: identity.userId,
    providerId: identity.providerId,
    identity,
    verification,
    trust,
    performance,
    licenses,
    certifications,
    badges,
    passportLevel,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function buildPublicProfessionalPassport(
  passport: ProfessionalPassport
): PublicProfessionalPassportView {
  const verifiedLicenses = passport.licenses.filter((entry) => entry.status === "verified").length;
  const verifiedCertifications = passport.certifications.filter(
    (entry) => entry.status === "verified"
  ).length;

  return {
    provider_id: passport.providerId,
    user_id: passport.userId,
    display_name: passport.identity.displayName,
    passport_level: passport.passportLevel.level,
    passport_level_label: passport.passportLevel.label,
    trust_score: passport.trust.trustScore,
    trust_label: passport.trust.tierLabel,
    verification_tier: passport.verification.verificationTier,
    verified_license_count: verifiedLicenses,
    verified_certification_count: verifiedCertifications,
    completed_contracts: passport.performance.completedContracts,
    average_rating: passport.performance.averageRating,
    badges: passport.badges
      .filter((badge) => badge.category !== "credential" || badge.earned)
      .map(toProfessionalBadgeView),
    safe_for_public: true,
    generated_at: passport.generatedAt.toISOString(),
  };
}

export function toIdentityProfileView(identity: IdentityProfile): IdentityProfileView {
  return {
    provider_id: identity.providerId,
    user_id: identity.userId,
    display_name: identity.displayName,
    business_name: identity.businessName,
    bio: identity.bio,
    primary_trade: identity.primaryTrade,
    slug: identity.slug,
    status: identity.status,
    offered_actions: identity.offeredActions,
    summary: identity.summary,
  };
}

export function toVerificationStatusSummaryView(
  verification: VerificationStatusSummary
): VerificationStatusSummaryView {
  return {
    verification_tier: verification.verificationTier,
    verification_status: verification.verificationStatus,
    tier_label: verification.tierLabel,
    status_label: verification.statusLabel,
    reviewed_at: verification.reviewedAt,
    summary: verification.summary,
  };
}

export function toPerformanceMetricsView(
  performance: PerformanceMetrics
): PerformanceMetricsView {
  return {
    completed_contracts: performance.completedContracts,
    cancelled_contracts: performance.cancelledContracts,
    completion_rate: performance.completionRate,
    average_rating: performance.averageRating,
    evaluation_count: performance.evaluationCount,
    issues_raised: performance.issuesRaised,
    issues_resolved: performance.issuesResolved,
    active_issues: performance.activeIssues,
    trust_score: performance.trustScore,
    confidence_band: performance.confidenceBand,
    verification_score: performance.verificationScore,
    customer_rating_score: performance.customerRatingScore,
    completion_rate_score: performance.completionRateScore,
    clean_record_score: performance.cleanRecordScore,
    summary: performance.summary,
  };
}

export function toLicenseRecordView(license: LicenseRecord): LicenseRecordView {
  return {
    id: license.id,
    name: license.name,
    type: license.type,
    issuing_authority: license.issuingAuthority,
    status: license.status,
    issued_at: license.issuedAt,
    expires_at: license.expiresAt,
    summary: license.summary,
  };
}

export function toCertificationRecordView(
  certification: CertificationRecord
): CertificationRecordView {
  return {
    id: certification.id,
    name: certification.name,
    type: certification.type,
    issuing_authority: certification.issuingAuthority,
    status: certification.status,
    issued_at: certification.issuedAt,
    expires_at: certification.expiresAt,
    summary: certification.summary,
  };
}

export function toProfessionalBadgeView(badge: ProfessionalBadge): ProfessionalBadgeView {
  return {
    badge_id: badge.badgeId,
    label: badge.label,
    category: badge.category,
    description: badge.description,
    earned: badge.earned,
    summary: badge.summary,
  };
}

export function toPassportLevelAssessmentView(
  assessment: PassportLevelAssessment
): PassportLevelAssessmentView {
  return {
    level: assessment.level,
    label: assessment.label,
    trust_score: assessment.trustScore,
    verification_tier: assessment.verificationTier,
    verified_credential_count: assessment.verifiedCredentialCount,
    verified_license_count: assessment.verifiedLicenseCount,
    summary: assessment.summary,
    next_level: assessment.nextLevel,
    next_level_label: assessment.nextLevelLabel,
    progress_percent: assessment.progressPercent,
    requirements_summary: assessment.requirementsSummary,
  };
}

export function toProfessionalPassportView(
  passport: ProfessionalPassport
): ProfessionalPassportView {
  return {
    user_id: passport.userId,
    provider_id: passport.providerId,
    identity: toIdentityProfileView(passport.identity),
    verification: toVerificationStatusSummaryView(passport.verification),
    trust: toTrustOverviewView(passport.trust),
    performance: toPerformanceMetricsView(passport.performance),
    licenses: passport.licenses.map(toLicenseRecordView),
    certifications: passport.certifications.map(toCertificationRecordView),
    badges: passport.badges.map(toProfessionalBadgeView),
    passport_level: toPassportLevelAssessmentView(passport.passportLevel),
    generated_at: passport.generatedAt.toISOString(),
  };
}

export function toPublicProfessionalPassportView(
  passport: PublicProfessionalPassportView
): PublicProfessionalPassportView {
  return passport;
}
