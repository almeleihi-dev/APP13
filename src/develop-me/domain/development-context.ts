import type { AuthContext } from "../../shared/auth/index.js";
import { createMarketplaceCompilationRepository } from "../../marketplace-compilation/infrastructure/marketplace-compilation-repository.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";

export interface DevelopmentGoal {
  goalId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercent: number;
}

export interface DevelopmentContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  passportLevel: string;
  trustScore: number;
  liveFrameTier: string;
  liveFrameLabel: string;
  skills: string[];
  licenses: string[];
  certifications: string[];
  missingLicenses: string[];
  missingSkills: string[];
  missingCertifications: string[];
  requiredExperienceActions: number;
  completedContracts: number;
  marketplaceEligibleCount: number;
  teamReady: boolean;
  goals: DevelopmentGoal[];
  marketplaceListings: MarketplaceListing[];
  highDemandSkills: string[];
  generatedAt: string;
}

const SEED_SKILLS: Record<string, string[]> = {
  T1: ["general_maintenance", "customer_communication"],
  T2: ["plumbing_repair", "electrical_troubleshooting", "project_coordination"],
  T3: ["advanced_diagnostics", "team_leadership", "quality_assurance"],
};

const SEED_MISSING_LICENSES: Record<string, string[]> = {
  T1: ["trade_or_professional_credential"],
  T2: ["advanced_professional_license"],
  T3: [],
};

const SEED_MISSING_SKILLS: Record<string, string[]> = {
  T1: ["electrical_installation", "electrical_troubleshooting"],
  T2: ["advanced_diagnostics", "hvac_systems"],
  T3: [],
};

const HIGH_DEMAND_SKILLS = [
  "electrical_installation",
  "plumbing_repair",
  "hvac_systems",
  "project_coordination",
  "safety_compliance",
];

function resolveDisplayName(userId: string): string {
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `Professional ${suffix || "USER"}`;
}

function buildGoals(completedContracts: number, trustScore: number): DevelopmentGoal[] {
  return [
    {
      goalId: "goal://income_growth",
      title: "Grow monthly income",
      description: "Increase earnings through marketplace development.",
      targetValue: 600000,
      currentValue: Math.min(600000, completedContracts * 50000),
      unit: "cents",
      progressPercent: Math.min(100, Math.round((completedContracts * 50000) / 600000 * 100)),
    },
    {
      goalId: "goal://readiness",
      title: "Reach 80% professional readiness",
      description: "Close skill and credential gaps.",
      targetValue: 80,
      currentValue: Math.min(80, Math.round(trustScore * 0.9)),
      unit: "percent",
      progressPercent: Math.min(100, Math.round((trustScore * 0.9) / 80 * 100)),
    },
  ];
}

function countEligibleListings(
  listings: MarketplaceListing[],
  skills: string[],
  licenses: string[]
): number {
  return listings.filter((listing) => {
    const skillsMet = listing.requiredSkills.every((skill) => skills.includes(skill));
    const licenseMet = !listing.requiredVerification || licenses.includes(listing.requiredVerification);
    return skillsMet && licenseMet;
  }).length;
}

export function buildDevelopmentContext(input: {
  authContext: AuthContext;
  generatedAt?: string;
}): DevelopmentContext {
  const auth = input.authContext;
  const tier = auth.tier ?? "T1";
  const trustScore = tier === "T3" ? 82 : tier === "T2" ? 68 : 52;
  const passportLevel = tier === "T3" ? "Gold" : tier === "T2" ? "Silver" : "Bronze";
  const liveFrameTier = trustScore >= 80 ? "gold" : trustScore >= 60 ? "silver" : "bronze";
  const completedContracts = tier === "T3" ? 12 : tier === "T2" ? 5 : 1;
  const skills = SEED_SKILLS[tier] ?? SEED_SKILLS.T1;
  const licenses =
    tier === "T1"
      ? ["identity_verification"]
      : ["identity_verification", "trade_or_professional_credential"];
  const missingLicenses = SEED_MISSING_LICENSES[tier] ?? [];
  const missingSkills = SEED_MISSING_SKILLS[tier] ?? [];
  const missingCertifications =
    tier === "T1" ? ["safety_certificate"] : tier === "T2" ? [] : [];
  const requiredExperienceActions = tier === "T1" ? 10 : tier === "T2" ? 5 : 0;

  const marketplaceRepo = createMarketplaceCompilationRepository();
  const marketplaceListings = marketplaceRepo
    .listListings()
    .slice(0, 12)
    .map((entry) => entry.listing);

  const marketplaceEligibleCount = countEligibleListings(
    marketplaceListings,
    skills,
    licenses
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
    skills,
    licenses,
    certifications: tier === "T2" ? ["safety_certification"] : [],
    missingLicenses,
    missingSkills,
    missingCertifications,
    requiredExperienceActions,
    completedContracts,
    marketplaceEligibleCount,
    teamReady: tier === "T3",
    goals: buildGoals(completedContracts, trustScore),
    marketplaceListings,
    highDemandSkills: HIGH_DEMAND_SKILLS,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
