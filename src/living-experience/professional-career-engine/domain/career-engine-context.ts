import type { AuthContext } from "../../../shared/auth/index.js";
import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import {
  buildGeographicProfile,
  type GeographicProfile,
} from "../../professional-home/domain/professional-home-context.js";

export interface LivingProfessionalCareerEngineContext {
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

export function buildLivingProfessionalCareerEngineContext(input: {
  authContext: AuthContext;
  onboarding: OnboardingResponses;
  generatedAt?: string;
}): LivingProfessionalCareerEngineContext {
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

export function hashCareerEngineSeed(dayKey: string, userId: string, salt = ""): number {
  const value = `career-engine:${salt}:${dayKey}:${userId}`;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function resolvePrimarySkill(context: LivingProfessionalCareerEngineContext): string {
  const skill = context.onboarding.professionalBackground?.skills[0];
  return skill?.replace(/_/g, " ") ?? "professional services";
}

export function resolvePrimaryIndustry(context: LivingProfessionalCareerEngineContext): string {
  const industry = context.onboarding.professionalBackground?.industries[0];
  return industry?.replace(/_/g, " ") ?? "general professional";
}

export function resolveExperienceYears(context: LivingProfessionalCareerEngineContext): number {
  return context.onboarding.professionalBackground?.experienceYears ?? 0;
}

export function resolveFrameStanding(context: LivingProfessionalCareerEngineContext): string {
  const iron = context.onboarding.ironVerification;
  if (iron?.identityConfirmed && iron.emailVerified) return "Trusted frame";
  return "Building frame";
}

export function resolveCareerChangingProject(context: LivingProfessionalCareerEngineContext): string {
  return context.onboarding.professionalStory?.careerChangingProject ?? "Major professional project";
}

export function resolveProudestAchievement(context: LivingProfessionalCareerEngineContext): string {
  return context.onboarding.professionalStory?.proudestAchievement ?? "Professional milestone";
}

export function resolveMasterAction(context: LivingProfessionalCareerEngineContext): string {
  const action = context.onboarding.smartQuestions?.masterAction;
  return action?.replace(/_/g, " ") ?? "advanced specialization";
}

export function resolveCareerStage(context: LivingProfessionalCareerEngineContext): string {
  const years = resolveExperienceYears(context);
  if (years >= 15) return "senior_leader";
  if (years >= 8) return "experienced_specialist";
  if (years >= 3) return "established_professional";
  if (years >= 1) return "early_career";
  return "emerging_professional";
}
