import type { AuthContext } from "../../shared/auth/index.js";
import { buildDevelopmentContext } from "../../develop-me/domain/development-context.js";
import { getSeedExpertsForUser } from "./expert-network-seed.js";
import type { SeedNetworkExpert } from "./expert-network-seed.js";

export interface ExpertNetworkContext {
  userId: string;
  tier: string;
  displayName: string;
  missingSkills: string[];
  skills: string[];
  trustScore: number;
  liveFrameTier: string;
  experts: SeedNetworkExpert[];
  generatedAt: string;
}

function resolveViewerName(userId: string): string {
  const suffix = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `Viewer ${suffix || "USER"}`;
}

export function buildExpertNetworkContext(input: {
  authContext: AuthContext;
  generatedAt?: string;
}): ExpertNetworkContext {
  const auth = input.authContext;
  const development = buildDevelopmentContext({
    authContext: auth,
    generatedAt: input.generatedAt,
  });

  return {
    userId: auth.userId,
    tier: development.tier,
    displayName: resolveViewerName(auth.userId),
    missingSkills: development.missingSkills,
    skills: development.skills,
    trustScore: development.trustScore,
    liveFrameTier: development.liveFrameTier,
    experts: getSeedExpertsForUser(auth.userId),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
