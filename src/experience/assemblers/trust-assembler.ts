import type { ProviderProfileResult } from "../../provider/intelligence/types.js";
import type { TrustCalculateResult } from "../../trust/intelligence/types.js";
import type { TrustExperienceSource } from "../../ui/trust/types.js";
import { formatMinorAmount, formatPercent } from "../format.js";

export interface TrustAssemblyInput {
  providerId: string;
  providerDisplayName: string;
  providerProfile: ProviderProfileResult;
  trustResult: TrustCalculateResult;
}

export function assembleTrustExperienceSource(input: TrustAssemblyInput): TrustExperienceSource {
  const { providerProfile, trustResult } = input;

  const trustSummary = {
    trustScore: String(trustResult.trust_score),
    trustTier: trustResult.trust_tier,
    confidence: trustResult.recommendation === "trusted" ? "high" : "medium",
    liveFrame: trustResult.live_frame_color,
  };

  const verificationProfile = {
    verificationLevel: providerProfile.identity_profile.verification_level,
    identityStatus: "verified",
    licenses: [],
    certifications: providerProfile.action_profile.skills.slice(0, 2),
  };

  const performanceProfile = {
    completionRate: formatPercent(0.9),
    acceptedMilestones: 0,
    rejectedMilestones: 0,
    activeContracts: providerProfile.availability_profile.active_contracts,
  };

  const evidenceProfile = {
    evidenceCount: 0,
    verifiedEvidence: 0,
    attestedEvidence: 0,
    evidenceHealth: "stable",
  };

  const escrowProfile = {
    escrowCount: 0,
    funded: formatMinorAmount(0, "SAR"),
    released: formatMinorAmount(0, "SAR"),
    refunded: formatMinorAmount(0, "SAR"),
  };

  const disputeProfile = {
    disputeCount: 0,
    resolvedDisputes: 0,
    openDisputes: 0,
    disputeImpact: trustResult.restrictions.length > 0 ? "restricted" : "stable",
  };

  const availabilityProfile = {
    availableNow: providerProfile.availability_profile.available_now ? "yes" : "no",
    responseSpeed: "standard",
    workload:
      providerProfile.availability_profile.active_contracts > 2 ? "high" : "moderate",
    startDelay: `${providerProfile.availability_profile.estimated_start_days} days`,
  };

  const financialProfile = {
    averageContractValue: formatMinorAmount(
      providerProfile.pricing_profile.average_price * 100,
      "SAR"
    ),
    pricingPosition: providerProfile.pricing_profile.pricing_position,
    budgetBand: providerProfile.matching_profile.preferred_contract_size,
    marketBand: providerProfile.pricing_profile.pricing_position,
    premiumBand: providerProfile.pricing_profile.pricing_position,
  };

  const matchingProfile = {
    categories: providerProfile.matching_profile.preferred_categories,
    specializations: providerProfile.identity_profile.specializations,
    actionCodes: providerProfile.action_profile.action_codes,
    matchingStrength: providerProfile.capability_profile.level,
  };

  const timelineSummary = {
    verificationEvents: "0",
    milestoneCompletions: "0",
    evidenceVerification: "0",
    disputes: "0",
    trustChanges: "1",
  };

  const providerReport = {
    providerId: input.providerId,
    profession: providerProfile.identity_profile.profession,
    capabilityLevel: providerProfile.capability_profile.level,
    trustScore: trustSummary.trustScore,
    trustTier: trustSummary.trustTier,
    verificationProfile,
    riskProfile: {
      riskLevel: providerProfile.risk_profile,
      lateDeliveryRisk: providerProfile.risk_profile,
      disputeRisk: providerProfile.risk_profile,
      qualityRisk: providerProfile.risk_profile,
    },
    escrowHistory: {
      totalEscrows: 0,
      fundedLabel: escrowProfile.funded,
      releasedLabel: escrowProfile.released,
      refundedLabel: escrowProfile.refunded,
    },
    disputeHistory: {
      totalDisputes: 0,
      resolvedLabel: "0",
      openLabel: "0",
      impactLabel: disputeProfile.disputeImpact,
    },
    evidenceProfile,
    executionProfile: {
      activeContracts: providerProfile.availability_profile.active_contracts,
      acceptedMilestones: 0,
      rejectedMilestones: 0,
      completionRate: performanceProfile.completionRate,
    },
  };

  const trustTimeline = [
    {
      timestamp: new Date().toISOString(),
      eventType: "trust_updated" as const,
      label: "Trust profile projected",
      detail: `${input.providerDisplayName} — score ${trustSummary.trustScore}`,
    },
  ];

  return {
    providerId: input.providerId,
    trustSummary,
    verificationProfile,
    performanceProfile,
    evidenceProfile,
    escrowProfile,
    disputeProfile,
    availabilityProfile,
    financialProfile,
    matchingProfile,
    timelineSummary,
    providerReport,
    trustTimeline,
  };
}
