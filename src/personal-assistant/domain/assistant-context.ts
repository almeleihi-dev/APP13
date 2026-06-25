import type { AuthContext } from "../../shared/auth/index.js";
import { createMarketplaceCompilationRepository } from "../../marketplace-compilation/infrastructure/marketplace-compilation-repository.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";

export interface AssistantGoal {
  goalId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercent: number;
  status: "on_track" | "at_risk" | "completed";
}

export interface AssistantContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  passportLevel: string;
  trustScore: number;
  liveFrameTier: string;
  liveFrameLabel: string;
  verificationTier: string;
  skills: string[];
  licenses: string[];
  certifications: string[];
  missingLicenses: string[];
  missingSkills: string[];
  goals: AssistantGoal[];
  activeActions: number;
  contractsInProgress: number;
  completedContracts: number;
  marketplaceListings: MarketplaceListing[];
  readinessScore: number;
  generatedAt: string;
}

const SEED_SKILL_MAP: Record<string, string[]> = {
  T1: ["general_maintenance", "customer_communication"],
  T2: ["plumbing_repair", "electrical_troubleshooting", "project_coordination"],
  T3: ["advanced_diagnostics", "team_leadership", "quality_assurance"],
};

const SEED_LICENSE_GAPS: Record<string, string[]> = {
  T1: ["trade_or_professional_credential"],
  T2: ["advanced_professional_license"],
  T3: [],
};

function resolveDisplayName(userId: string): string {
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `Professional ${suffix || "USER"}`;
}

function buildSeedGoals(input: {
  completedContracts: number;
  trustScore: number;
}): AssistantGoal[] {
  return [
    {
      goalId: "goal://monthly_income",
      title: "Increase monthly provider income",
      description: "Complete high-value marketplace actions this month.",
      targetValue: 500000,
      currentValue: Math.min(500000, input.completedContracts * 45000),
      unit: "cents",
      progressPercent: Math.min(100, Math.round((input.completedContracts * 45000) / 500000 * 100)),
      status: input.completedContracts >= 8 ? "on_track" : "at_risk",
    },
    {
      goalId: "goal://trust_score",
      title: "Reach next Live Frame tier",
      description: "Improve trust score through verified completions.",
      targetValue: 75,
      currentValue: input.trustScore,
      unit: "points",
      progressPercent: Math.min(100, Math.round((input.trustScore / 75) * 100)),
      status: input.trustScore >= 70 ? "on_track" : "at_risk",
    },
  ];
}

export function buildAssistantContext(input: {
  authContext: AuthContext;
  generatedAt?: string;
}): AssistantContext {
  const auth = input.authContext;
  const tier = auth.tier ?? "T1";
  const trustScore = tier === "T3" ? 82 : tier === "T2" ? 68 : 52;
  const passportLevel = tier === "T3" ? "Gold" : tier === "T2" ? "Silver" : "Bronze";
  const liveFrameTier = trustScore >= 80 ? "gold" : trustScore >= 60 ? "silver" : "bronze";
  const completedContracts = tier === "T3" ? 12 : tier === "T2" ? 5 : 1;
  const skills = SEED_SKILL_MAP[tier] ?? SEED_SKILL_MAP.T1;
  const licenses = tier === "T1" ? ["identity_verification"] : ["identity_verification", "trade_or_professional_credential"];
  const missingLicenses = SEED_LICENSE_GAPS[tier] ?? [];
  const missingSkills = tier === "T1" ? ["electrical_troubleshooting"] : tier === "T2" ? ["advanced_diagnostics"] : [];

  const marketplaceRepo = createMarketplaceCompilationRepository();
  const marketplaceListings = marketplaceRepo
    .listListings()
    .slice(0, 8)
    .map((entry) => entry.listing);

  const readinessScore = Math.round(
    (trustScore * 0.4 +
      (100 - missingLicenses.length * 20) * 0.3 +
      (100 - missingSkills.length * 15) * 0.3)
  );

  return {
    userId: auth.userId,
    roles: auth.roles,
    tier,
    displayName: resolveDisplayName(auth.userId),
    passportLevel,
    trustScore,
    liveFrameTier,
    liveFrameLabel: `${liveFrameTier} frame`,
    verificationTier: tier,
    skills,
    licenses,
    certifications: tier === "T2" ? ["safety_certification"] : [],
    missingLicenses,
    missingSkills,
    goals: buildSeedGoals({ completedContracts, trustScore }),
    activeActions: tier === "T1" ? 1 : tier === "T2" ? 2 : 3,
    contractsInProgress: tier === "T1" ? 0 : 1,
    completedContracts,
    marketplaceListings,
    readinessScore,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
