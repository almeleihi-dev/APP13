import type { AuthContext } from "../../shared/auth/index.js";
import { buildDevelopmentContext } from "../../develop-me/domain/development-context.js";
import { createMarketplaceCompilationRepository } from "../../marketplace-compilation/infrastructure/marketplace-compilation-repository.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";
import type { LEARNING_CATEGORIES } from "./learning-schema.js";

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];

export interface SeedExpertProfile {
  expertId: string;
  displayName: string;
  trustScore: number;
  liveFrameTier: string;
  passportLevel: string;
  experienceYears: number;
  skills: string[];
  distanceKm: number;
  hourlyRateCents: number;
  categories: LearningCategory[];
}

export interface LearningContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  passportLevel: string;
  trustScore: number;
  liveFrameTier: string;
  liveFrameLabel: string;
  skills: string[];
  missingSkills: string[];
  missingCertifications: string[];
  readinessScore: number;
  marketplaceListings: MarketplaceListing[];
  experts: SeedExpertProfile[];
  generatedAt: string;
}

const SEED_EXPERTS: Omit<SeedExpertProfile, "distanceKm">[] = [
  {
    expertId: "expert://maria-santos",
    displayName: "Maria Santos",
    trustScore: 88,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 12,
    skills: ["electrical_installation", "electrical_troubleshooting", "safety_compliance"],
    hourlyRateCents: 8500,
    categories: ["practical_skills", "technical_procedures", "guided_practice"],
  },
  {
    expertId: "expert://james-chen",
    displayName: "James Chen",
    trustScore: 79,
    liveFrameTier: "silver",
    passportLevel: "Silver",
    experienceYears: 8,
    skills: ["plumbing_repair", "hvac_systems", "tool_usage"],
    hourlyRateCents: 7200,
    categories: ["professional_actions", "tool_usage", "field_experience"],
  },
  {
    expertId: "expert://aisha-patel",
    displayName: "Aisha Patel",
    trustScore: 92,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 15,
    skills: ["safety_compliance", "advanced_diagnostics", "project_coordination"],
    hourlyRateCents: 9500,
    categories: ["safety_practices", "mentorship", "guided_practice"],
  },
  {
    expertId: "expert://carlos-rivera",
    displayName: "Carlos Rivera",
    trustScore: 74,
    liveFrameTier: "silver",
    passportLevel: "Silver",
    experienceYears: 6,
    skills: ["general_maintenance", "customer_communication", "electrical_installation"],
    hourlyRateCents: 6500,
    categories: ["practical_skills", "field_experience", "mentorship"],
  },
  {
    expertId: "expert://elena-volkov",
    displayName: "Elena Volkov",
    trustScore: 85,
    liveFrameTier: "gold",
    passportLevel: "Gold",
    experienceYears: 10,
    skills: ["electrical_troubleshooting", "hvac_systems", "quality_assurance"],
    hourlyRateCents: 8800,
    categories: ["technical_procedures", "professional_actions", "guided_practice"],
  },
];

function stableHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function resolveDisplayName(userId: string): string {
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `Learner ${suffix || "USER"}`;
}

function assignExpertDistances(
  userId: string,
  experts: Omit<SeedExpertProfile, "distanceKm">[]
): SeedExpertProfile[] {
  return experts
    .map((expert, index) => ({
      ...expert,
      distanceKm: 1 + ((stableHash(`${userId}:${expert.expertId}`) + index) % 12),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm);
}

export function buildLearningContext(input: {
  authContext: AuthContext;
  generatedAt?: string;
}): LearningContext {
  const auth = input.authContext;
  const development = buildDevelopmentContext({
    authContext: auth,
    generatedAt: input.generatedAt,
  });

  const marketplaceRepo = createMarketplaceCompilationRepository();
  const marketplaceListings = marketplaceRepo
    .listListings()
    .slice(0, 10)
    .map((entry) => entry.listing);

  const readinessScore = Math.round(
    development.trustScore * 0.4 +
      (100 - development.missingSkills.length * 15) * 0.35 +
      (100 - development.missingCertifications.length * 20) * 0.25
  );

  const experts = assignExpertDistances(auth.userId, SEED_EXPERTS);

  return {
    userId: auth.userId,
    roles: auth.roles,
    tier: development.tier,
    displayName: resolveDisplayName(auth.userId),
    passportLevel: development.passportLevel,
    trustScore: development.trustScore,
    liveFrameTier: development.liveFrameTier,
    liveFrameLabel: development.liveFrameLabel,
    skills: development.skills,
    missingSkills: development.missingSkills,
    missingCertifications: development.missingCertifications,
    readinessScore,
    marketplaceListings,
    experts,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
