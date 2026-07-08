import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingPassportContext {
  userId: string;
  roles: string[];
  tier: string;
  displayName: string;
  geographic: GeographicProfile;
  onboarding: OnboardingResponses;
  dayKey: string;
  generatedAt: string;
}

function resolveDisplayName(userId: string, onboarding: OnboardingResponses): string {
  return (
    onboarding.account?.displayName ??
    `Professional ${userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase() || "USER"}`
  );
}

export function buildLivingPassportContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingPassportContext {
  const generatedAt = input.generatedAt ?? new Date().toISOString();

  return {
    userId: input.authContext.userId,
    roles: [...input.authContext.roles],
    tier: input.authContext.tier,
    displayName: resolveDisplayName(input.authContext.userId, input.onboarding),
    geographic: buildGeographicProfile({
      tier: input.authContext.tier,
      onboardingGeographic: input.onboarding.geographicIntelligence,
    }),
    onboarding: input.onboarding,
    dayKey: generatedAt.slice(0, 10),
    generatedAt,
  };
}

export function hashPassportSeed(dayKey: string, userId: string): number {
  const value = `passport:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimaryProfession(context: LivingPassportContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  const action = context.onboarding.smartQuestions?.requestedAction;
  if (industry && action) {
    return `${action.replace(/_/g, " ")} in ${industry.replace(/_/g, " ")}`;
  }
  if (industry) return industry.replace(/_/g, " ");
  return "General professional services";
}

export function resolveProfessionalTitle(context: LivingPassportContext): string {
  const sq = context.onboarding.smartQuestions;
  if (sq?.enjoysLeading) return "Project Supervisor";
  if (sq?.enjoysConsulting) return "Professional Consultant";
  if (sq?.enjoysTeaching) return "Professional Trainer";
  return "Skilled Professional";
}
