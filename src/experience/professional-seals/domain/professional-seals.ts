import type { Credential, CredentialStatus, VerificationStatus, VerificationTier } from "../../../identity/domain/user.js";
import type { ProviderPublicProfileView } from "../../../provider-experience/domain/provider-profile.js";
import type { TrustProfileView } from "../../../trust/domain/trust-profile-view.js";
import { resolveConfidenceBand } from "../../../trust/domain/trust-event.js";
import type { TrustLiveFrameTier } from "../../../trust/domain/trust-profile.js";
import {
  computePassportLevel,
  isLicenseCredential,
  type PassportLevel,
} from "../../professional-passport/domain/professional-passport.js";

export type SealCategory = "regulatory" | "professional" | "experience" | "community";

export type EconomyTier = "starter" | "professional" | "advanced" | "expert" | "elite";

export const SEAL_CATEGORIES: SealCategory[] = [
  "regulatory",
  "professional",
  "experience",
  "community",
];

export const ECONOMY_TIER_ORDER: EconomyTier[] = [
  "starter",
  "professional",
  "advanced",
  "expert",
  "elite",
];

export const ECONOMY_TIER_LABELS: Record<EconomyTier, string> = {
  starter: "Starter",
  professional: "Professional",
  advanced: "Advanced",
  expert: "Expert",
  elite: "Elite",
};

export const SEAL_POINT_VALUES = {
  verificationTier: {
    T0: 0,
    T1: 15,
    T2: 30,
    T3: 45,
    T4: 60,
  },
  verifiedLicense: 35,
  verifiedCertification: 25,
  verificationApproved: 20,
  contracts1: 10,
  contracts3: 20,
  contracts10: 35,
  contracts25: 50,
  trustStandard: 10,
  trustSapphire: 25,
  trustEmerald: 40,
  trustPlatinum: 55,
  confidenceMedium: 10,
  confidenceHigh: 20,
  rating40: 15,
  rating45: 25,
  evaluations5: 15,
  evaluations10: 25,
  cleanRecord: 20,
  disputeResolution: 10,
} as const;

export const ECONOMY_TIER_THRESHOLDS: Array<{ tier: EconomyTier; minPoints: number }> = [
  { tier: "elite", minPoints: 400 },
  { tier: "expert", minPoints: 250 },
  { tier: "advanced", minPoints: 150 },
  { tier: "professional", minPoints: 60 },
  { tier: "starter", minPoints: 0 },
];

export const ECONOMY_TIER_BONUSES: Record<
  EconomyTier,
  { trustBonusPercent: number; visibilityBonusPercent: number; pricingPremiumPercent: number }
> = {
  starter: { trustBonusPercent: 0, visibilityBonusPercent: 0, pricingPremiumPercent: 0 },
  professional: { trustBonusPercent: 2, visibilityBonusPercent: 5, pricingPremiumPercent: 3 },
  advanced: { trustBonusPercent: 5, visibilityBonusPercent: 8, pricingPremiumPercent: 6 },
  expert: { trustBonusPercent: 8, visibilityBonusPercent: 12, pricingPremiumPercent: 10 },
  elite: { trustBonusPercent: 12, visibilityBonusPercent: 18, pricingPremiumPercent: 15 },
};

export interface ProfessionalSealsSnapshot {
  publicProfile: ProviderPublicProfileView;
  trustProfile: TrustProfileView;
  verificationTier: VerificationTier;
  verificationStatus: VerificationStatus;
  credentials: Credential[];
}

export interface ProfessionalSeal {
  sealId: string;
  code: string;
  label: string;
  category: SealCategory;
  points: number;
  earned: boolean;
  status: "active" | "pending" | "expired";
  description: string;
  summary: string;
}

export interface SealPointsSummary {
  totalPoints: number;
  regulatoryPoints: number;
  professionalPoints: number;
  experiencePoints: number;
  communityPoints: number;
  earnedSealCount: number;
  summary: string;
}

export interface VerificationEconomy {
  tier: EconomyTier;
  tierLabel: string;
  sealPoints: number;
  trustBonusPercent: number;
  visibilityBonusPercent: number;
  pricingPremiumPercent: number;
  passportLevel: PassportLevel;
  nextTier: EconomyTier | null;
  nextTierLabel: string | null;
  pointsToNextTier: number;
  progressPercent: number;
  summary: string;
}

export interface ProfessionalSealsProfile {
  userId: string;
  providerId: string;
  displayName: string;
  verificationTier: VerificationTier;
  trustScore: number;
  seals: ProfessionalSeal[];
  sealsByCategory: Record<SealCategory, ProfessionalSeal[]>;
  sealPoints: SealPointsSummary;
  economy: VerificationEconomy;
  generatedAt: Date;
}

export interface ProfessionalSealView {
  seal_id: string;
  code: string;
  label: string;
  category: SealCategory;
  points: number;
  earned: boolean;
  status: "active" | "pending" | "expired";
  description: string;
  summary: string;
}

export interface SealPointsSummaryView {
  total_points: number;
  regulatory_points: number;
  professional_points: number;
  experience_points: number;
  community_points: number;
  earned_seal_count: number;
  summary: string;
}

export interface VerificationEconomyView {
  tier: EconomyTier;
  tier_label: string;
  seal_points: number;
  trust_bonus_percent: number;
  visibility_bonus_percent: number;
  pricing_premium_percent: number;
  passport_level: PassportLevel;
  next_tier: EconomyTier | null;
  next_tier_label: string | null;
  points_to_next_tier: number;
  progress_percent: number;
  summary: string;
}

export interface ProfessionalSealsProfileView {
  user_id: string;
  provider_id: string;
  display_name: string;
  verification_tier: VerificationTier;
  trust_score: number;
  seals: ProfessionalSealView[];
  seals_by_category: Record<SealCategory, ProfessionalSealView[]>;
  seal_points: SealPointsSummaryView;
  economy: VerificationEconomyView;
  generated_at: string;
}

export interface PublicProfessionalSealsView {
  provider_id: string;
  user_id: string;
  display_name: string;
  economy_tier: EconomyTier;
  economy_tier_label: string;
  seal_points: number;
  earned_seal_count: number;
  trust_bonus_percent: number;
  visibility_bonus_percent: number;
  pricing_premium_percent: number;
  top_seals: ProfessionalSealView[];
  safe_for_public: boolean;
  generated_at: string;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function credentialStatusToSealStatus(
  status: CredentialStatus
): ProfessionalSeal["status"] {
  if (status === "verified") return "active";
  if (status === "expired" || status === "revoked") return "expired";
  return "pending";
}

function tierAtLeast(current: VerificationTier, target: VerificationTier): boolean {
  const order: VerificationTier[] = ["T0", "T1", "T2", "T3", "T4"];
  return order.indexOf(current) >= order.indexOf(target);
}

export function buildRegulatorySeals(input: {
  verificationTier: VerificationTier;
  verificationStatus: VerificationStatus;
  credentials: Credential[];
}): ProfessionalSeal[] {
  const seals: ProfessionalSeal[] = [];

  if (tierAtLeast(input.verificationTier, "T1")) {
    seals.push({
      sealId: "regulatory-identity-verified",
      code: "identity_verified",
      label: "Identity Verified",
      category: "regulatory",
      points: SEAL_POINT_VALUES.verificationTier.T1,
      earned: true,
      status: "active",
      description: "Government-grade identity verification completed.",
      summary: "Regulatory seal for identity verification tier T1+.",
    });
  }

  if (tierAtLeast(input.verificationTier, "T2")) {
    seals.push({
      sealId: "regulatory-professional-credentials",
      code: "professional_credentials",
      label: "Professional Credentials Verified",
      category: "regulatory",
      points: SEAL_POINT_VALUES.verificationTier.T2,
      earned: true,
      status: "active",
      description: "Professional credential verification tier unlocked.",
      summary: "Regulatory seal for verification tier T2+.",
    });
  }

  if (tierAtLeast(input.verificationTier, "T3")) {
    seals.push({
      sealId: "regulatory-business-verified",
      code: "business_verified",
      label: "Business Verified",
      category: "regulatory",
      points: SEAL_POINT_VALUES.verificationTier.T3 - SEAL_POINT_VALUES.verificationTier.T2,
      earned: true,
      status: "active",
      description: "Business verification attestation completed.",
      summary: "Regulatory seal for verification tier T3+.",
    });
  }

  if (input.verificationTier === "T4") {
    seals.push({
      sealId: "regulatory-regulated-attestation",
      code: "regulated_attestation",
      label: "Regulated Attestation",
      category: "regulatory",
      points: SEAL_POINT_VALUES.verificationTier.T4 - SEAL_POINT_VALUES.verificationTier.T3,
      earned: true,
      status: "active",
      description: "Regulated industry attestation verified.",
      summary: "Regulatory seal for verification tier T4.",
    });
  }

  for (const credential of input.credentials.filter(isLicenseCredential)) {
    seals.push({
      sealId: `regulatory-license-${credential.id}`,
      code: "verified_license",
      label: credential.credentialName,
      category: "regulatory",
      points: credential.status === "verified" ? SEAL_POINT_VALUES.verifiedLicense : 0,
      earned: credential.status === "verified",
      status: credentialStatusToSealStatus(credential.status),
      description: `Verified license: ${credential.credentialName}.`,
      summary: `Regulatory license seal (${credential.status}).`,
    });
  }

  if (input.verificationStatus === "approved" && tierAtLeast(input.verificationTier, "T1")) {
    seals.push({
      sealId: "regulatory-verification-approved",
      code: "verification_approved",
      label: "Verification Approved",
      category: "regulatory",
      points: SEAL_POINT_VALUES.verificationApproved,
      earned: true,
      status: "active",
      description: "Latest verification review approved.",
      summary: "Regulatory seal for approved verification status.",
    });
  }

  return seals;
}

export function buildProfessionalCategorySeals(input: {
  credentials: Credential[];
}): ProfessionalSeal[] {
  return input.credentials
    .filter((credential) => !isLicenseCredential(credential))
    .map((credential) => ({
      sealId: `professional-cert-${credential.id}`,
      code: "professional_certification",
      label: credential.credentialName,
      category: "professional" as const,
      points:
        credential.status === "verified" ? SEAL_POINT_VALUES.verifiedCertification : 0,
      earned: credential.status === "verified",
      status: credentialStatusToSealStatus(credential.status),
      description: `Professional certification: ${credential.credentialName}.`,
      summary: `Professional certification seal (${credential.status}).`,
    }));
}

export function buildExperienceSeals(input: {
  profile: ProviderPublicProfileView;
  trustProfile: TrustProfileView;
}): ProfessionalSeal[] {
  const seals: ProfessionalSeal[] = [];
  const completed = input.profile.completion_summary.completed_contracts;
  const tier = input.trustProfile.live_frame.tier as TrustLiveFrameTier;
  const confidenceBand = resolveConfidenceBand(input.trustProfile.completed_contracts);

  const contractMilestones = [
    { threshold: 1, points: SEAL_POINT_VALUES.contracts1, code: "contracts_1" },
    { threshold: 3, points: SEAL_POINT_VALUES.contracts3, code: "contracts_3" },
    { threshold: 10, points: SEAL_POINT_VALUES.contracts10, code: "contracts_10" },
    { threshold: 25, points: SEAL_POINT_VALUES.contracts25, code: "contracts_25" },
  ];

  for (const milestone of contractMilestones) {
    seals.push({
      sealId: `experience-${milestone.code}`,
      code: milestone.code,
      label: `${milestone.threshold}+ Contracts Completed`,
      category: "experience",
      points: completed >= milestone.threshold ? milestone.points : 0,
      earned: completed >= milestone.threshold,
      status: completed >= milestone.threshold ? "active" : "pending",
      description: `Experience seal for ${milestone.threshold} completed contracts.`,
      summary:
        completed >= milestone.threshold
          ? `Earned after ${completed} completed contracts.`
          : `Requires ${milestone.threshold} completed contracts.`,
    });
  }

  const frameSeals: Array<{ tier: TrustLiveFrameTier; points: number; label: string }> = [
    { tier: "STANDARD", points: SEAL_POINT_VALUES.trustStandard, label: "Standard Trust Frame" },
    {
      tier: "SAPPHIRE_VERIFIED",
      points: SEAL_POINT_VALUES.trustSapphire,
      label: "Sapphire Verified Frame",
    },
    { tier: "EMERALD_PRO", points: SEAL_POINT_VALUES.trustEmerald, label: "Emerald Pro Frame" },
    {
      tier: "PLATINUM_ELITE",
      points: SEAL_POINT_VALUES.trustPlatinum,
      label: "Platinum Elite Frame",
    },
  ];

  for (const frame of frameSeals) {
    const earned = tier === frame.tier || isHigherTrustTier(tier, frame.tier);
    seals.push({
      sealId: `experience-trust-${frame.tier.toLowerCase()}`,
      code: `trust_frame_${frame.tier.toLowerCase()}`,
      label: frame.label,
      category: "experience",
      points: earned ? frame.points : 0,
      earned,
      status: earned ? "active" : "pending",
      description: `Experience seal for reaching ${frame.label}.`,
      summary: earned ? `Trust frame seal earned at ${frame.label}.` : `Requires ${frame.label}.`,
    });
  }

  if (confidenceBand === "medium" || confidenceBand === "high") {
    seals.push({
      sealId: "experience-confidence-band",
      code: "confidence_band",
      label: `${confidenceBand === "high" ? "High" : "Medium"} Confidence Band`,
      category: "experience",
      points:
        confidenceBand === "high"
          ? SEAL_POINT_VALUES.confidenceHigh
          : SEAL_POINT_VALUES.confidenceMedium,
      earned: true,
      status: "active",
      description: "Experience seal for sustained contract confidence.",
      summary: `Confidence band seal (${confidenceBand}).`,
    });
  }

  return seals;
}

function isHigherTrustTier(current: TrustLiveFrameTier, target: TrustLiveFrameTier): boolean {
  const order: TrustLiveFrameTier[] = [
    "RESTRICTED",
    "STANDARD",
    "SAPPHIRE_VERIFIED",
    "EMERALD_PRO",
    "PLATINUM_ELITE",
  ];
  return order.indexOf(current) > order.indexOf(target);
}

export function buildCommunitySeals(input: {
  profile: ProviderPublicProfileView;
}): ProfessionalSeal[] {
  const seals: ProfessionalSeal[] = [];
  const rating = input.profile.rating_summary.average_rating;
  const evaluations = input.profile.rating_summary.evaluation_count;
  const disputes = input.profile.dispute_summary;

  if (rating >= 4.0 && evaluations > 0) {
    seals.push({
      sealId: "community-rating-40",
      code: "rating_40",
      label: "4.0+ Customer Rating",
      category: "community",
      points: SEAL_POINT_VALUES.rating40,
      earned: true,
      status: "active",
      description: "Community seal for strong customer ratings.",
      summary: `Average rating ${rating} from ${evaluations} evaluations.`,
    });
  }

  if (rating >= 4.5 && evaluations >= 3) {
    seals.push({
      sealId: "community-rating-45",
      code: "rating_45",
      label: "4.5+ Customer Rating",
      category: "community",
      points: SEAL_POINT_VALUES.rating45,
      earned: true,
      status: "active",
      description: "Community seal for excellent customer ratings.",
      summary: `Average rating ${rating} with sustained evaluations.`,
    });
  }

  if (evaluations >= 5) {
    seals.push({
      sealId: "community-evaluations-5",
      code: "evaluations_5",
      label: "5+ Customer Evaluations",
      category: "community",
      points: SEAL_POINT_VALUES.evaluations5,
      earned: true,
      status: "active",
      description: "Community seal for evaluation volume.",
      summary: `${evaluations} customer evaluations recorded.`,
    });
  }

  if (evaluations >= 10) {
    seals.push({
      sealId: "community-evaluations-10",
      code: "evaluations_10",
      label: "10+ Customer Evaluations",
      category: "community",
      points: SEAL_POINT_VALUES.evaluations10,
      earned: true,
      status: "active",
      description: "Community seal for sustained customer feedback.",
      summary: `${evaluations} customer evaluations recorded.`,
    });
  }

  if (disputes.active_issues === 0) {
    seals.push({
      sealId: "community-clean-record",
      code: "clean_record",
      label: "Clean Dispute Record",
      category: "community",
      points: SEAL_POINT_VALUES.cleanRecord,
      earned: true,
      status: "active",
      description: "Community seal for zero active disputes.",
      summary: "No active disputes on record.",
    });
  }

  if (disputes.issues_raised > 0 && disputes.issues_resolved >= disputes.issues_raised) {
    seals.push({
      sealId: "community-dispute-resolution",
      code: "dispute_resolution",
      label: "Dispute Resolution Track Record",
      category: "community",
      points: SEAL_POINT_VALUES.disputeResolution,
      earned: true,
      status: "active",
      description: "Community seal for resolving raised disputes.",
      summary: `${disputes.issues_resolved} of ${disputes.issues_raised} disputes resolved.`,
    });
  }

  return seals;
}

export function groupSealsByCategory(
  seals: ProfessionalSeal[]
): Record<SealCategory, ProfessionalSeal[]> {
  return {
    regulatory: seals.filter((seal) => seal.category === "regulatory"),
    professional: seals.filter((seal) => seal.category === "professional"),
    experience: seals.filter((seal) => seal.category === "experience"),
    community: seals.filter((seal) => seal.category === "community"),
  };
}

export function computeSealPoints(seals: ProfessionalSeal[]): SealPointsSummary {
  const earned = seals.filter((seal) => seal.earned);
  const byCategory = groupSealsByCategory(earned);

  const sumPoints = (entries: ProfessionalSeal[]) =>
    entries.reduce((total, seal) => total + seal.points, 0);

  const regulatoryPoints = sumPoints(byCategory.regulatory);
  const professionalPoints = sumPoints(byCategory.professional);
  const experiencePoints = sumPoints(byCategory.experience);
  const communityPoints = sumPoints(byCategory.community);
  const totalPoints = regulatoryPoints + professionalPoints + experiencePoints + communityPoints;

  return {
    totalPoints,
    regulatoryPoints,
    professionalPoints,
    experiencePoints,
    communityPoints,
    earnedSealCount: earned.length,
    summary: `${totalPoints} seal points from ${earned.length} earned seals across regulatory, professional, experience, and community categories.`,
  };
}

export function computeEconomyTier(totalPoints: number): EconomyTier {
  for (const threshold of ECONOMY_TIER_THRESHOLDS) {
    if (totalPoints >= threshold.minPoints) {
      return threshold.tier;
    }
  }
  return "starter";
}

export function buildVerificationEconomy(input: {
  sealPoints: SealPointsSummary;
  passportLevel: PassportLevel;
}): VerificationEconomy {
  const tier = computeEconomyTier(input.sealPoints.totalPoints);
  const bonuses = ECONOMY_TIER_BONUSES[tier];
  const currentIndex = ECONOMY_TIER_ORDER.indexOf(tier);
  const nextTier =
    currentIndex < ECONOMY_TIER_ORDER.length - 1
      ? ECONOMY_TIER_ORDER[currentIndex + 1]!
      : null;
  const nextThreshold = nextTier
    ? ECONOMY_TIER_THRESHOLDS.find((entry) => entry.tier === nextTier)?.minPoints ?? null
    : null;
  const pointsToNextTier =
    nextThreshold === null ? 0 : Math.max(0, nextThreshold - input.sealPoints.totalPoints);
  const progressPercent =
    nextThreshold === null
      ? 100
      : clampPercent(
          ((input.sealPoints.totalPoints -
            (ECONOMY_TIER_THRESHOLDS.find((entry) => entry.tier === tier)?.minPoints ?? 0)) /
            Math.max(nextThreshold - (ECONOMY_TIER_THRESHOLDS.find((entry) => entry.tier === tier)?.minPoints ?? 0), 1)) *
            100
        );

  return {
    tier,
    tierLabel: ECONOMY_TIER_LABELS[tier],
    sealPoints: input.sealPoints.totalPoints,
    trustBonusPercent: bonuses.trustBonusPercent,
    visibilityBonusPercent: bonuses.visibilityBonusPercent,
    pricingPremiumPercent: bonuses.pricingPremiumPercent,
    passportLevel: input.passportLevel,
    nextTier,
    nextTierLabel: nextTier ? ECONOMY_TIER_LABELS[nextTier] : null,
    pointsToNextTier,
    progressPercent,
    summary: `${ECONOMY_TIER_LABELS[tier]} verification economy tier with ${bonuses.trustBonusPercent}% trust bonus, ${bonuses.visibilityBonusPercent}% visibility bonus, and ${bonuses.pricingPremiumPercent}% pricing premium.`,
  };
}

export function buildProfessionalSealsList(snapshot: ProfessionalSealsSnapshot): ProfessionalSeal[] {
  return [
    ...buildRegulatorySeals({
      verificationTier: snapshot.verificationTier,
      verificationStatus: snapshot.verificationStatus,
      credentials: snapshot.credentials,
    }),
    ...buildProfessionalCategorySeals({ credentials: snapshot.credentials }),
    ...buildExperienceSeals({
      profile: snapshot.publicProfile,
      trustProfile: snapshot.trustProfile,
    }),
    ...buildCommunitySeals({ profile: snapshot.publicProfile }),
  ];
}

export function buildProfessionalSealsProfile(input: {
  snapshot: ProfessionalSealsSnapshot;
  generatedAt?: Date;
}): ProfessionalSealsProfile {
  const seals = buildProfessionalSealsList(input.snapshot);
  const sealPoints = computeSealPoints(seals);
  const verifiedCredentials = input.snapshot.credentials.filter(
    (credential) => credential.status === "verified"
  );
  const passportLevel = computePassportLevel({
    trustScore: input.snapshot.trustProfile.trust_score,
    verificationTier: input.snapshot.verificationTier,
    completedContracts: input.snapshot.publicProfile.completion_summary.completed_contracts,
    averageRating: input.snapshot.publicProfile.rating_summary.average_rating,
    activeIssues: input.snapshot.publicProfile.dispute_summary.active_issues,
    verifiedCredentialCount: verifiedCredentials.length,
    verifiedLicenseCount: verifiedCredentials.filter(isLicenseCredential).length,
  });
  const economy = buildVerificationEconomy({ sealPoints, passportLevel });

  return {
    userId: input.snapshot.publicProfile.user_id,
    providerId: input.snapshot.publicProfile.provider_id,
    displayName: input.snapshot.publicProfile.display_name,
    verificationTier: input.snapshot.verificationTier,
    trustScore: input.snapshot.trustProfile.trust_score,
    seals,
    sealsByCategory: groupSealsByCategory(seals),
    sealPoints,
    economy,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function buildPublicProfessionalSeals(
  profile: ProfessionalSealsProfile
): PublicProfessionalSealsView {
  const topSeals = profile.seals
    .filter((seal) => seal.earned)
    .sort((left, right) => right.points - left.points)
    .slice(0, 5)
    .map(toProfessionalSealView);

  return {
    provider_id: profile.providerId,
    user_id: profile.userId,
    display_name: profile.displayName,
    economy_tier: profile.economy.tier,
    economy_tier_label: profile.economy.tierLabel,
    seal_points: profile.sealPoints.totalPoints,
    earned_seal_count: profile.sealPoints.earnedSealCount,
    trust_bonus_percent: profile.economy.trustBonusPercent,
    visibility_bonus_percent: profile.economy.visibilityBonusPercent,
    pricing_premium_percent: profile.economy.pricingPremiumPercent,
    top_seals: topSeals,
    safe_for_public: true,
    generated_at: profile.generatedAt.toISOString(),
  };
}

export function toProfessionalSealView(seal: ProfessionalSeal): ProfessionalSealView {
  return {
    seal_id: seal.sealId,
    code: seal.code,
    label: seal.label,
    category: seal.category,
    points: seal.points,
    earned: seal.earned,
    status: seal.status,
    description: seal.description,
    summary: seal.summary,
  };
}

export function toSealPointsSummaryView(summary: SealPointsSummary): SealPointsSummaryView {
  return {
    total_points: summary.totalPoints,
    regulatory_points: summary.regulatoryPoints,
    professional_points: summary.professionalPoints,
    experience_points: summary.experiencePoints,
    community_points: summary.communityPoints,
    earned_seal_count: summary.earnedSealCount,
    summary: summary.summary,
  };
}

export function toVerificationEconomyView(economy: VerificationEconomy): VerificationEconomyView {
  return {
    tier: economy.tier,
    tier_label: economy.tierLabel,
    seal_points: economy.sealPoints,
    trust_bonus_percent: economy.trustBonusPercent,
    visibility_bonus_percent: economy.visibilityBonusPercent,
    pricing_premium_percent: economy.pricingPremiumPercent,
    passport_level: economy.passportLevel,
    next_tier: economy.nextTier,
    next_tier_label: economy.nextTierLabel,
    points_to_next_tier: economy.pointsToNextTier,
    progress_percent: economy.progressPercent,
    summary: economy.summary,
  };
}

export function toProfessionalSealsProfileView(
  profile: ProfessionalSealsProfile
): ProfessionalSealsProfileView {
  return {
    user_id: profile.userId,
    provider_id: profile.providerId,
    display_name: profile.displayName,
    verification_tier: profile.verificationTier,
    trust_score: profile.trustScore,
    seals: profile.seals.map(toProfessionalSealView),
    seals_by_category: {
      regulatory: profile.sealsByCategory.regulatory.map(toProfessionalSealView),
      professional: profile.sealsByCategory.professional.map(toProfessionalSealView),
      experience: profile.sealsByCategory.experience.map(toProfessionalSealView),
      community: profile.sealsByCategory.community.map(toProfessionalSealView),
    },
    seal_points: toSealPointsSummaryView(profile.sealPoints),
    economy: toVerificationEconomyView(profile.economy),
    generated_at: profile.generatedAt.toISOString(),
  };
}

export function toPublicProfessionalSealsView(
  profile: PublicProfessionalSealsView
): PublicProfessionalSealsView {
  return profile;
}
