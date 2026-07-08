import type { ActivePersonalIdentity } from "../../../passport/personal-identity.js";
import type {
  ActionInventoryBucket,
  ActionInventoryItem,
  ActionInventorySourceType,
  LivingPlatformState,
  MarketDemandLevel,
  PassportContractHistoryEntry,
  TrustRequirementLevel,
} from "../types.js";
import { resolveActionCategory } from "../economy/action-category.js";
import { buildActionIntelligenceProfiles } from "../economy/action-intelligence-engine.js";
import { createLivingId, nowIso } from "../living-platform-storage.js";
import { matchProfessionProfile, type ProfessionProfile } from "./profession-action-catalog.js";
import { normalizeMultilingualInput } from "../../../i18n/multilingual-input.js";
import { deriveActionExecutionLocation } from "./action-location-intelligence.js";

export interface AbilitySource {
  label: string;
  sourceType: ActionInventorySourceType;
  keywords: string[];
}

export interface DiscoverableActionSpec {
  title: string;
  description: string;
  keywords: string[];
  requiredProof: string;
  trustRequirement: TrustRequirementLevel;
  verificationRequired: boolean;
  unlockHint?: string;
  baseConfidence: number;
  sourceType: ActionInventorySourceType;
}

const DISCOVERABLE_ACTIONS: DiscoverableActionSpec[] = [
  {
    title: "Technical inspection report",
    description: "On-site or remote inspection with documented findings and compliance attestation.",
    keywords: ["inspect", "inspection", "quality", "audit", "compliance", "engineer"],
    requiredProof: "Inspection license or certified inspector credential",
    trustRequirement: "verified",
    verificationRequired: true,
    baseConfidence: 82,
    sourceType: "license",
  },
  {
    title: "Mobile app UX review",
    description: "Evaluate user flows, accessibility, and conversion paths for mobile products.",
    keywords: ["ux", "design", "mobile", "app", "product", "research"],
    requiredProof: "Portfolio or UX certification",
    trustRequirement: "elevated",
    verificationRequired: false,
    baseConfidence: 78,
    sourceType: "skill",
  },
  {
    title: "Software feature delivery",
    description: "Build and ship a scoped software feature with tests and deployment evidence.",
    keywords: ["develop", "engineer", "software", "api", "backend", "feature"],
    requiredProof: "Completed delivery evidence or repository reference",
    trustRequirement: "standard",
    verificationRequired: false,
    baseConfidence: 85,
    sourceType: "skill",
  },
  {
    title: "Product requirements authoring",
    description: "Translate goals into actionable requirements with acceptance criteria.",
    keywords: ["product", "requirements", "strategy", "planning", "business"],
    requiredProof: "Sample PRD or product brief",
    trustRequirement: "standard",
    verificationRequired: false,
    baseConfidence: 76,
    sourceType: "experience",
  },
  {
    title: "Construction site assessment",
    description: "Assess site conditions, risks, and readiness for phased construction work.",
    keywords: ["construction", "site", "foundation", "build", "survey"],
    requiredProof: "Trade license or site supervisor certification",
    trustRequirement: "verified",
    verificationRequired: true,
    baseConfidence: 80,
    sourceType: "license",
  },
  {
    title: "Business strategy workshop",
    description: "Facilitate market validation and strategic planning sessions.",
    keywords: ["strategy", "business", "consult", "market", "startup"],
    requiredProof: "Advisory credentials or case study",
    trustRequirement: "elevated",
    verificationRequired: false,
    baseConfidence: 74,
    sourceType: "experience",
  },
  {
    title: "QA test cycle execution",
    description: "Run structured QA cycles with defect logs and release readiness sign-off.",
    keywords: ["qa", "quality", "test", "audit"],
    requiredProof: "QA certification or test report sample",
    trustRequirement: "standard",
    verificationRequired: false,
    baseConfidence: 77,
    sourceType: "skill",
  },
  {
    title: "Certified welding inspection",
    description: "Perform certified welding inspections with safety and compliance documentation.",
    keywords: ["welding", "underwater", "certified", "trade"],
    requiredProof: "Certified welding license",
    trustRequirement: "verified",
    verificationRequired: true,
    unlockHint: "Complete welding certification to unlock",
    baseConfidence: 70,
    sourceType: "certificate",
  },
  {
    title: "Contract-backed professional delivery",
    description: "Deliver a verified professional action with evidence and trust attestation.",
    keywords: ["contract", "delivery", "professional", "service"],
    requiredProof: "Completed contract history on passport",
    trustRequirement: "elevated",
    verificationRequired: false,
    baseConfidence: 88,
    sourceType: "contract",
  },
  {
    title: "DevOps production deployment",
    description: "Deploy production releases with rollback plans and monitoring hooks.",
    keywords: ["devops", "deploy", "release", "production", "performance"],
    requiredProof: "Deployment runbook or incident-free release history",
    trustRequirement: "elevated",
    verificationRequired: false,
    baseConfidence: 79,
    sourceType: "skill",
  },
  {
    title: "Financial model review",
    description: "Review and stress-test financial models for business decisions.",
    keywords: ["finance", "financial", "model", "accounting"],
    requiredProof: "Finance certification or CPA license",
    trustRequirement: "verified",
    verificationRequired: true,
    baseConfidence: 72,
    sourceType: "certificate",
  },
  {
    title: "Brand identity design",
    description: "Create cohesive brand systems with deliverable packages for launch.",
    keywords: ["brand", "branding", "visual", "design", "creative"],
    requiredProof: "Brand portfolio or design certification",
    trustRequirement: "standard",
    verificationRequired: false,
    baseConfidence: 75,
    sourceType: "talent",
  },
];

function collectAbilitySources(identity: ActivePersonalIdentity): AbilitySource[] {
  const sources: AbilitySource[] = [];

  if (identity.mainSkill.trim()) {
    sources.push({
      label: identity.mainSkill.trim(),
      sourceType: "skill",
      keywords: identity.mainSkill.trim().toLowerCase().split(/\s+/),
    });
  }

  for (const cert of identity.certifications) {
    sources.push({
      label: cert,
      sourceType: cert.toLowerCase().includes("license") ? "license" : "certificate",
      keywords: cert.toLowerCase().split(/\s+/),
    });
  }

  if (identity.experienceSummary.trim()) {
    sources.push({
      label: "Experience",
      sourceType: "experience",
      keywords: identity.experienceSummary.toLowerCase().split(/\W+/).filter((w) => w.length > 3),
    });
  }

  if (identity.professionalTitle.trim()) {
    sources.push({
      label: identity.professionalTitle.trim(),
      sourceType: "talent",
      keywords: identity.professionalTitle.toLowerCase().split(/\s+/),
    });
  }

  return sources;
}

function keywordMatch(sourceKeywords: string[], actionKeywords: string[]): number {
  let hits = 0;
  for (const keyword of actionKeywords) {
    if (sourceKeywords.some((source) => source.includes(keyword) || keyword.includes(source))) {
      hits += 1;
    }
  }
  return hits;
}

function hasVerifiedCredential(identity: ActivePersonalIdentity, spec: DiscoverableActionSpec): boolean {
  if (!spec.verificationRequired) return true;
  const certs = identity.certifications.map((c) => c.toLowerCase());
  const proof = spec.requiredProof.toLowerCase();
  return certs.some(
    (cert) =>
      cert.includes("license") ||
      cert.includes("certified") ||
      cert.includes("professional") ||
      proof.split(" ").some((word) => word.length > 4 && cert.includes(word)),
  );
}

function deriveMarketDemand(
  title: string,
  state: LivingPlatformState,
): MarketDemandLevel {
  const profiles = buildActionIntelligenceProfiles(state, state.economySignals);
  const category = resolveActionCategory(title);
  const profile = profiles.find((entry) => entry.category === category.category);
  if (!profile) return "moderate";
  if (profile.shortageSignal || profile.demand > 900) return "high";
  if (profile.demand < 500) return "low";
  return "moderate";
}

function classifyBucket(
  matchScore: number,
  spec: DiscoverableActionSpec,
  identity: ActivePersonalIdentity,
): ActionInventoryBucket {
  if (spec.verificationRequired && !hasVerifiedCredential(identity, spec)) {
    return matchScore >= 2 ? "needs_verification" : "unlockable";
  }
  if (matchScore >= 2 || spec.sourceType === "contract") return "ready_now";
  if (matchScore === 1) return "unlockable";
  return "unlockable";
}

function estimateValue(title: string, state: LivingPlatformState): number {
  const category = resolveActionCategory(title);
  const profiles = buildActionIntelligenceProfiles(state, state.economySignals);
  const profile = profiles.find((entry) => entry.category === category.category);
  return profile?.averageMarketValue ?? category.baseValue;
}

function deriveMarketDemandForTitle(title: string, state: LivingPlatformState): MarketDemandLevel {
  return deriveMarketDemand(title, state);
}

function buildItemsFromProfessionProfile(
  profile: ProfessionProfile,
  professionText: string,
  state: LivingPlatformState,
): ActionInventoryItem[] {
  const now = nowIso();
  return profile.actions.map((action) => ({
    inventoryId: createLivingId("inv"),
    title: action.title,
    description: action.description,
    confidenceScore: action.baseConfidence,
    bucket: action.bucket,
    requiredProof: action.requiredProof,
    marketDemand: deriveMarketDemandForTitle(action.title, state),
    estimatedValue: estimateValue(action.title, state),
    trustRequirement: action.trustRequirement,
    sourceSkill: professionText.trim(),
    sourceType: action.verificationRequired ? "license" : "skill",
    status: "discovered" as const,
    executionLocation: deriveActionExecutionLocation(action.title, professionText),
    createdAt: now,
    updatedAt: now,
  }));
}

function buildSyntheticSourcesFromProfession(text: string): AbilitySource[] {
  const normalized = text.trim().toLowerCase();
  const keywords = normalized.split(/[\s/,-]+/).filter((word) => word.length > 2);
  return [
    {
      label: text.trim(),
      sourceType: normalized.includes("certified") || normalized.includes("licensed") ? "certificate" : "skill",
      keywords,
    },
  ];
}

export function discoverActionInventoryFromProfessionText(
  professionText: string,
  state: LivingPlatformState,
): ActionInventoryItem[] {
  const trimmed = normalizeMultilingualInput(professionText.trim());
  if (!trimmed) return [];

  const matchedProfile = matchProfessionProfile(trimmed);
  if (matchedProfile) {
    return buildItemsFromProfessionProfile(matchedProfile, trimmed, state);
  }

  const syntheticIdentity = {
    fullName: "Professional",
    firstName: "Professional",
    professionalTitle: trimmed,
    location: "",
    mainSkill: trimmed,
    experienceSummary: trimmed,
    avatarInitials: "PR",
    liveFrameTier: "Silver" as const,
    classification: "Domain Professional",
    actionGroups: [],
    trustIndicators: [],
    certifications: trimmed.toLowerCase().includes("certified") ? ["Certified Professional"] : [],
    rating: "New",
    completedActions: 0,
    geoProfile: {
      country: "",
      city: "",
      region: "",
      timeZone: "UTC",
      serviceRadiusKm: null,
      availability: "hybrid" as const,
      latitude: null,
      longitude: null,
    },
    languages: ["en" as const],
    passportPreview: {
      providerName: "Professional",
      serviceName: trimmed,
      summary: trimmed,
      rating: "New",
      certifications: [],
      liveFrameTier: "Silver" as const,
      avatarInitials: "PR",
    },
  };

  const sources = buildSyntheticSourcesFromProfession(trimmed);
  const now = nowIso();
  const discovered: ActionInventoryItem[] = [];

  for (const spec of DISCOVERABLE_ACTIONS) {
    let bestMatch = 0;
    for (const source of sources) {
      bestMatch = Math.max(bestMatch, keywordMatch(source.keywords, spec.keywords));
    }
    if (bestMatch === 0) continue;

    discovered.push({
      inventoryId: createLivingId("inv"),
      title: spec.title,
      description: spec.description,
      confidenceScore: Math.min(98, spec.baseConfidence + bestMatch * 4),
      bucket: classifyBucket(bestMatch, spec, syntheticIdentity),
      requiredProof: spec.requiredProof,
      marketDemand: deriveMarketDemand(spec.title, state),
      estimatedValue: estimateValue(spec.title, state),
      trustRequirement: spec.trustRequirement,
      sourceSkill: trimmed,
      sourceType: spec.sourceType,
      status: "discovered",
      executionLocation: deriveActionExecutionLocation(spec.title, trimmed),
      createdAt: now,
      updatedAt: now,
    });
  }

  return discovered.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export function discoverActionInventory(
  identity: ActivePersonalIdentity,
  state: LivingPlatformState,
  contractHistory: PassportContractHistoryEntry[] = [],
): ActionInventoryItem[] {
  const sources = collectAbilitySources(identity);
  const now = nowIso();
  const discovered: ActionInventoryItem[] = [];

  if (contractHistory.length > 0) {
    sources.push({
      label: "Completed contracts",
      sourceType: "contract",
      keywords: contractHistory.flatMap((entry) => entry.actionName.toLowerCase().split(/\W+/)),
    });
  }

  for (const spec of DISCOVERABLE_ACTIONS) {
    let bestMatch = 0;
    let bestSource: AbilitySource | null = null;

    for (const source of sources) {
      const score = keywordMatch(source.keywords, spec.keywords);
      if (score > bestMatch) {
        bestMatch = score;
        bestSource = source;
      }
    }

    if (bestMatch === 0 && spec.sourceType !== "contract") continue;
    if (spec.sourceType === "contract" && contractHistory.length === 0) continue;

    const bucket = classifyBucket(bestMatch, spec, identity);
    const confidence = Math.min(
      98,
      spec.baseConfidence + bestMatch * 4 + (identity.completedActions > 0 ? 3 : 0),
    );

    discovered.push({
      inventoryId: createLivingId("inv"),
      title: spec.title,
      description: spec.description,
      confidenceScore: confidence,
      bucket,
      requiredProof: spec.requiredProof,
      marketDemand: deriveMarketDemand(spec.title, state),
      estimatedValue: estimateValue(spec.title, state),
      trustRequirement: spec.trustRequirement,
      sourceSkill: bestSource?.label,
      sourceType: spec.sourceType,
      status: "discovered",
      executionLocation: deriveActionExecutionLocation(spec.title, bestSource?.label),
      createdAt: now,
      updatedAt: now,
    });
  }

  return discovered.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export function countInventoryByBucket(items: ActionInventoryItem[]): Record<ActionInventoryBucket, number> {
  return {
    ready_now: items.filter((item) => item.bucket === "ready_now" && item.status !== "removed").length,
    needs_verification: items.filter((item) => item.bucket === "needs_verification" && item.status !== "removed")
      .length,
    unlockable: items.filter((item) => item.bucket === "unlockable" && item.status !== "removed").length,
  };
}
