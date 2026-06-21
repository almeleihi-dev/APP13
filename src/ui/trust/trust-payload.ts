import { MVP_DEMO_PROVIDER_PROFILE } from "../provider/provider-payload.js";
import type {
  ProviderTrustReportRequest,
  TrustCenterRequest,
  TrustExperienceSource,
  TrustRequestValidationResult,
  TrustTimelineEventSnapshot,
  TrustTimelineRequest,
} from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MVP_TRUST_PROVIDER_ID = MVP_DEMO_PROVIDER_PROFILE.provider_id;
export const MVP_RESTRICTED_TRUST_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440099";
export const MVP_EMPTY_TRUST_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440098";

function timelineEvent(
  timestamp: string,
  eventType: TrustTimelineEventSnapshot["eventType"],
  label: string,
  detail?: string
): TrustTimelineEventSnapshot {
  return { timestamp, eventType, label, detail };
}

const BASE_TIMELINE: TrustTimelineEventSnapshot[] = [
  timelineEvent("2024-01-15T10:00:00.000Z", "provider_registered", "Provider registered", "account → active"),
  timelineEvent("2024-02-01T14:00:00.000Z", "verification_completed", "Identity verification completed", "bronze → gold"),
  timelineEvent("2024-03-10T09:00:00.000Z", "license_added", "Commercial registration added"),
  timelineEvent("2025-11-20T16:00:00.000Z", "contract_completed", "Contract completed", "M-ACCESS accepted"),
  timelineEvent("2026-06-05T12:00:00.000Z", "evidence_verified", "Evidence verified", "2 items verified"),
  timelineEvent("2026-06-06T10:00:00.000Z", "attestation_approved", "Attestation approved", "M-ACCESS attested"),
  timelineEvent("2026-06-14T16:00:00.000Z", "escrow_released", "Escrow released", "4,500.00 SAR released"),
  timelineEvent("2026-06-15T08:00:00.000Z", "trust_updated", "Trust score updated", "88 → 92"),
];

/** Emerald-tier provider with full trust profiles (integration fixture). */
export const MVP_TRUST_CENTER_SOURCE: TrustExperienceSource = {
  providerId: MVP_TRUST_PROVIDER_ID,
  trustSummary: {
    trustScore: "92",
    trustTier: "emerald",
    confidence: "high",
    liveFrame: "emerald",
  },
  verificationProfile: {
    verificationLevel: "gold",
    identityStatus: "verified",
    licenses: ["Commercial Registration"],
    certifications: ["AWS Certified", "Scrum Master"],
  },
  performanceProfile: {
    completionRate: "96%",
    acceptedMilestones: 48,
    rejectedMilestones: 2,
    activeContracts: 1,
  },
  evidenceProfile: {
    evidenceCount: 124,
    verifiedEvidence: 118,
    attestedEvidence: 96,
    evidenceHealth: "strong",
  },
  escrowProfile: {
    escrowCount: 52,
    funded: "624,000.00 SAR",
    released: "598,500.00 SAR",
    refunded: "12,000.00 SAR",
  },
  disputeProfile: {
    disputeCount: 3,
    resolvedDisputes: 2,
    openDisputes: 1,
    disputeImpact: "conditional",
  },
  availabilityProfile: {
    availableNow: "Yes",
    responseSpeed: "fast",
    workload: "moderate",
    startDelay: "3 days",
  },
  financialProfile: {
    averageContractValue: "12,000.00 SAR",
    pricingPosition: "market",
    budgetBand: "10,000 – 14,000 SAR",
    marketBand: "11,000 – 15,000 SAR",
    premiumBand: "16,000+ SAR",
  },
  matchingProfile: {
    categories: ["software_developer"],
    specializations: ["TypeScript", "React", "API Integration"],
    actionCodes: ["build", "integrate", "deliver"],
    matchingStrength: "strong",
  },
  timelineSummary: {
    verificationEvents: "3",
    milestoneCompletions: "48",
    evidenceVerification: "118",
    disputes: "3",
    trustChanges: "12",
  },
  providerReport: {
    providerId: MVP_TRUST_PROVIDER_ID,
    profession: "software_developer",
    capabilityLevel: "senior",
    trustScore: "92",
    trustTier: "emerald",
    verificationProfile: {
      verificationLevel: "gold",
      identityStatus: "verified",
      licenses: ["Commercial Registration"],
      certifications: ["AWS Certified", "Scrum Master"],
    },
    riskProfile: {
      riskLevel: "low",
      lateDeliveryRisk: "low",
      disputeRisk: "medium",
      qualityRisk: "low",
    },
    escrowHistory: {
      totalEscrows: 52,
      fundedLabel: "624,000.00 SAR",
      releasedLabel: "598,500.00 SAR",
      refundedLabel: "12,000.00 SAR",
    },
    disputeHistory: {
      totalDisputes: 3,
      resolvedLabel: "2 resolved",
      openLabel: "1 open",
      impactLabel: "conditional",
    },
    evidenceProfile: {
      evidenceCount: 124,
      verifiedEvidence: 118,
      attestedEvidence: 96,
      evidenceHealth: "strong",
    },
    executionProfile: {
      activeContracts: 1,
      acceptedMilestones: 48,
      rejectedMilestones: 2,
      completionRate: "96%",
    },
  },
  trustTimeline: BASE_TIMELINE,
};

/** Restricted-tier provider with elevated dispute impact (integration fixture). */
export const MVP_RESTRICTED_TRUST_SOURCE: TrustExperienceSource = {
  ...MVP_TRUST_CENTER_SOURCE,
  providerId: MVP_RESTRICTED_TRUST_PROVIDER_ID,
  trustSummary: {
    trustScore: "58",
    trustTier: "restricted",
    confidence: "medium",
    liveFrame: "gray",
  },
  disputeProfile: {
    disputeCount: 5,
    resolvedDisputes: 2,
    openDisputes: 3,
    disputeImpact: "restricted",
  },
  evidenceProfile: {
    evidenceCount: 18,
    verifiedEvidence: 10,
    attestedEvidence: 4,
    evidenceHealth: "weak",
  },
  escrowProfile: {
    escrowCount: 8,
    funded: "72,000.00 SAR",
    released: "45,000.00 SAR",
    refunded: "18,000.00 SAR",
  },
  providerReport: {
    ...MVP_TRUST_CENTER_SOURCE.providerReport,
    providerId: MVP_RESTRICTED_TRUST_PROVIDER_ID,
    trustScore: "58",
    trustTier: "restricted",
    capabilityLevel: "mid",
    riskProfile: {
      riskLevel: "high",
      lateDeliveryRisk: "high",
      disputeRisk: "high",
      qualityRisk: "medium",
    },
    disputeHistory: {
      totalDisputes: 5,
      resolvedLabel: "2 resolved",
      openLabel: "3 open",
      impactLabel: "restricted",
    },
    evidenceProfile: {
      evidenceCount: 18,
      verifiedEvidence: 10,
      attestedEvidence: 4,
      evidenceHealth: "weak",
    },
  },
  trustTimeline: [
    timelineEvent("2025-06-01T10:00:00.000Z", "provider_registered", "Provider registered"),
    timelineEvent("2025-08-15T11:00:00.000Z", "dispute_opened", "Dispute opened", "quality issue"),
    timelineEvent("2025-09-01T09:00:00.000Z", "trust_updated", "Trust score updated", "72 → 58"),
  ],
};

/** Empty/minimal trust state (integration fixture). */
export const MVP_EMPTY_TRUST_SOURCE: TrustExperienceSource = {
  providerId: MVP_EMPTY_TRUST_PROVIDER_ID,
  trustSummary: {
    trustScore: "—",
    trustTier: "silver",
    confidence: "low",
    liveFrame: "gray",
  },
  verificationProfile: {
    verificationLevel: "unknown",
    identityStatus: "pending",
    licenses: [],
    certifications: [],
  },
  performanceProfile: {
    completionRate: "—",
    acceptedMilestones: 0,
    rejectedMilestones: 0,
    activeContracts: 0,
  },
  evidenceProfile: {
    evidenceCount: 0,
    verifiedEvidence: 0,
    attestedEvidence: 0,
    evidenceHealth: "none",
  },
  escrowProfile: {
    escrowCount: 0,
    funded: "—",
    released: "—",
    refunded: "—",
  },
  disputeProfile: {
    disputeCount: 0,
    resolvedDisputes: 0,
    openDisputes: 0,
    disputeImpact: "none",
  },
  availabilityProfile: {
    availableNow: "No",
    responseSpeed: "—",
    workload: "none",
    startDelay: "—",
  },
  financialProfile: {
    averageContractValue: "—",
    pricingPosition: "—",
    budgetBand: "—",
    marketBand: "—",
    premiumBand: "—",
  },
  matchingProfile: {
    categories: [],
    specializations: [],
    actionCodes: [],
    matchingStrength: "none",
  },
  timelineSummary: {
    verificationEvents: "0",
    milestoneCompletions: "0",
    evidenceVerification: "0",
    disputes: "0",
    trustChanges: "0",
  },
  providerReport: {
    providerId: MVP_EMPTY_TRUST_PROVIDER_ID,
    profession: "—",
    capabilityLevel: "—",
    trustScore: "—",
    trustTier: "silver",
    verificationProfile: {
      verificationLevel: "unknown",
      identityStatus: "pending",
      licenses: [],
      certifications: [],
    },
    riskProfile: {
      riskLevel: "unknown",
      lateDeliveryRisk: "unknown",
      disputeRisk: "unknown",
      qualityRisk: "unknown",
    },
    escrowHistory: {
      totalEscrows: 0,
      fundedLabel: "—",
      releasedLabel: "—",
      refundedLabel: "—",
    },
    disputeHistory: {
      totalDisputes: 0,
      resolvedLabel: "0",
      openLabel: "0",
      impactLabel: "none",
    },
    evidenceProfile: {
      evidenceCount: 0,
      verifiedEvidence: 0,
      attestedEvidence: 0,
      evidenceHealth: "none",
    },
    executionProfile: {
      activeContracts: 0,
      acceptedMilestones: 0,
      rejectedMilestones: 0,
      completionRate: "—",
    },
  },
  trustTimeline: [],
};

function validateUuid(field: string, value: string | undefined): TrustRequestValidationResult["errors"] {
  const errors: TrustRequestValidationResult["errors"] = [];
  const trimmed = value?.trim() ?? "";

  if (trimmed.length === 0) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (!UUID_PATTERN.test(trimmed)) {
    errors.push({ field, message: `${field} must be a valid UUID` });
  }

  return errors;
}

export function validateTrustCenterRequest(input: TrustCenterRequest): TrustRequestValidationResult {
  const errors = validateUuid("provider_id", input.provider_id);
  return { valid: errors.length === 0, errors };
}

export function validateProviderTrustReportRequest(
  input: ProviderTrustReportRequest
): TrustRequestValidationResult {
  return validateTrustCenterRequest({ provider_id: input.provider_id });
}

export function validateTrustTimelineRequest(input: TrustTimelineRequest): TrustRequestValidationResult {
  return validateTrustCenterRequest({ provider_id: input.provider_id });
}

export function resolveTrustFixture(providerId: string): TrustExperienceSource | null {
  const fixtures: Record<string, TrustExperienceSource> = {
    [MVP_TRUST_PROVIDER_ID]: MVP_TRUST_CENTER_SOURCE,
    [MVP_RESTRICTED_TRUST_PROVIDER_ID]: MVP_RESTRICTED_TRUST_SOURCE,
    [MVP_EMPTY_TRUST_PROVIDER_ID]: MVP_EMPTY_TRUST_SOURCE,
  };

  return fixtures[providerId] ?? null;
}

export function findTrustSourceByProviderId(providerId: string): TrustExperienceSource | null {
  return resolveTrustFixture(providerId);
}
